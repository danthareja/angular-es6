function setupModuleLoader(window) {
  var ensure = (obj, name, factory)=> obj[name] || (obj[name] = factory());

  var angular = ensure(window, 'angular', Object);

  var createModule = (name, requires, modules)=> {
    var moduleInstance = {
      name: name,
      requires: requires
    };
    modules[name] = moduleInstance;
    return moduleInstance;
  };

  var getModule = (name, modules)=> modules[name];

  ensure(angular, 'module', ()=> {
    let modules = {};

    return function (name, requires) {
      if (requires) {
        return createModule(name, requires, modules);
      } else {
        return getModule(name, modules);
      }
    };
  });

}

export default setupModuleLoader;