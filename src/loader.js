function setupModuleLoader(window) {
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
  let moduleInstance = {
    _invokeQueue: invokeQueue,
    name: name,
    requires: requires,
    constant(key, value) {
      invokeQueue.push(['constant', [key, value]])
    }
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