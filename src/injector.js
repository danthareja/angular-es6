import _ from 'lodash';

function createInjector(modulesToLoad) {
  let cache = new Map();

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

  _.each(modulesToLoad, (moduleName)=> {
    let module = angular.module(moduleName);
    // Array destructuring: _invokeQueue[0] = method, _invokeQueue[1] = args
    // Spread ...args into method $provide[method] instead of apply
    _.each(module._invokeQueue, ([method, args])=> $provide[method](...args));
  });

  return {
    // Don't want all possible Map() methods exposed (e.g. clear!!)
    has(key) {
      return cache.has(key);
    },
    get(key) {
      return cache.get(key);
    }
  };
}

export default createInjector;