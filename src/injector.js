import _ from 'lodash';

function createInjector(modulesToLoad, strictDi) {
  const FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
  const FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
  const STRIP_COMMENTS = /(\/\/.*$)|(\/\*.*?\*\/)/mg;

  let cache = new Map();
  let loadedModules = new Set();
  strictDi = (strictDi === true); // explicit 'true', not just truthy

  // Holds functionality of each module component. mirrors interface of moduleInstance's methods
  let $provide = {
    // Shorthand object literal method creation, same as
    // constant: function(key, value) {...}
    constant(key, value) {
      if (key === 'hasOwnProperty') {
        throw 'hasOwnProperty is not a valid constant name!';
      }
      cache.set(key, value);
    }
  };

  // Recursively cache module components, previously registered in invokeQueue
  _.each(modulesToLoad, function loadModule(moduleName) {
    if (!loadedModules.has(moduleName)) {
      loadedModules.add(moduleName);
      let module = angular.module(moduleName);

      _.each(module.requires, loadModule);
      // Array destructuring: _invokeQueue[0] = method, _invokeQueue[1] = args
      // Spread ...args into method $provide[method] instead of apply
      _.each(module._invokeQueue, ([method, args])=> $provide[method](...args));
    }
  });


  // Determine what arguments to inject to a function. Handles 3 cases:
    // (1) Decorate fn with a $inject property
    // (2) 'strict mode' annotation - an array of dependencies then fn as last item
    // (3) Magic (regex)
  function annotate(fn) {
    if (fn.$inject) { return fn.$inject; } // (1)
    if (_.isArray(fn)) { return fn.slice(0, fn.length - 1); } // (2)
    if (!fn.length) { return []; } // (0-arg case)
    if (strictDi) {
      throw `fn is not using explicit annotation and
             cannot be invoked in strict mode`;
    }

    // (3) - One of the most controversial features. Minifying will change source args and fuck this up
    let source = fn.toString().replace(STRIP_COMMENTS, '');
    let argDeclaration = source.match(FN_ARGS);
    return _.map(argDeclaration[1].split(','), (argName) => argName.match(FN_ARG)[2]);
  }

  // Perform dependency injection
  function invoke(fn, self, locals = {}) {
    // Lookup registered module component's values that have already been loaded
    let args = _.map(annotate(fn), (token) => {
      if (_.isString(token)) {
        return locals.hasOwnProperty(token) ?
          locals[token] :
          cache.get(token);
      } else {
        throw 'Incorrect injection token! Expected string, got ${token}';
      }
    });

    // Unwrap array-annotated fn
    if (_.isArray(fn)) {
      fn = _.last(fn);
    };

    return fn.apply(self, args);
  }

  function instantiate(Type, locals = {}) {
    // unwrap array-annotated Type
    var UnwrappedType = _.isArray(Type) ? _.last(Type) : Type;
    var instance = Object.create(UnwrappedType.prototype);
    invoke(Type, instance, locals);
    return instance
  }

  return {
    annotate,
    invoke,
    instantiate,
    has(key) { return cache.has(key); },
    get(key) { return cache.get(key); }
  };
}

export default createInjector;
