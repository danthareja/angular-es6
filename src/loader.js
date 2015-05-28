function setupModuleLoader(window) {
  // Only allows factory fn to be invoked once
  let ensure = (obj, name, factory)=> obj[name] || (obj[name] = factory()); // Implicit return

  let angular = ensure(window, 'angular', Object);

  ensure(angular, 'module', ()=> {
    let modules = new Map();

    return function (name, requires) {
      if (requires) {
        return createModule(name, requires, modules);
      } else {
        return getModule(name, modules);
      }
    };
  });
}

function createModule(name, requires, modules) {
  if (name === 'hasOwnProperty') {
    throw 'hasOwnProperty is not allowed as a module name';
  }

  let invokeQueue = [];

  // Configures a particular method of $provide
  let invokeLater = function(method, arrayMethod = 'push') {
    return function(...args) {
      invokeQueue[arrayMethod]([method, args]);
      return moduleInstance;
    };
  };

  let moduleInstance = {
    _invokeQueue: invokeQueue,
    name: name,
    requires: requires,
    constant: invokeLater('constant', 'unshift'),
    provider: invokeLater('provider')
  };

  modules.set(name, moduleInstance);
  return moduleInstance;
}

function getModule (name, modules) {
  if (!modules.has(name)) {
    throw 'Module ${name} is not available';
  }

  return modules.get(name);
}

export default setupModuleLoader;
