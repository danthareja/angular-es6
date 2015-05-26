import _ from 'lodash';
import setupModuleLoader from '../src/loader';
import createInjector from '../src/injector';


describe('injector', ()=> {

  beforeEach(() => {
    delete window.angular;
    setupModuleLoader(window);
  });


  it('can be created', ()=> {
    let injector = createInjector([]);
    expect(injector).toBeDefined();
  });

  it('has a constant that has been registered to a module', ()=> {
    let module = angular.module('myModule', []);
    module.constant('aConstant', 42);
    let injector = createInjector(['myModule']);
    expect(injector.has('aConstant')).toBe(true);
  });

  it('does not have a non-registered constant', ()=> {
    let module = angular.module('myModule', []);
    let injector = createInjector(['myModule']);
    expect(injector.has('aConstant')).toBe(false);
  });

  it('does not allow a constant called hasOwnProperty', ()=> {
    let module = angular.module('myModule', []);
    module.constant('hasOwnProperty', 42);
    expect(()=> createInjector(['myModule'])).toThrow();
  });

  it('can return a registered constant', ()=> {
    let module = angular.module('myModule', []);
    module.constant('aConstant', 42);
    let injector = createInjector(['myModule']);
    expect(injector.get('aConstant')).toBe(42);
  });

  it('loads multiple modules', ()=> {
    let module1 = angular.module('myModule', []);
    let module2 = angular.module('myOtherModule', []);
    module1.constant('aConstant', 42);
    module2.constant('anotherConstant', 43);
    let injector = createInjector(['myModule', 'myOtherModule']);

    expect(injector.has('aConstant')).toBe(true);
    expect(injector.has('anotherConstant')).toBe(true);
  });

  it('loads the require modules of a module ', ()=> {
    let module1 = angular.module('myModule', []);
    let module2 = angular.module('myOtherModule', ['myModule']);
    module1.constant('aConstant', 42);
    module2.constant('anotherConstant', 43);
    let injector = createInjector(['myOtherModule']);

    expect(injector.has('aConstant')).toBe(true);
    expect(injector.has('anotherConstant')).toBe(true);
  });


  it('loads the require modules of a module ', ()=> {
    let module1 = angular.module('myModule', []);
    let module2 = angular.module('myOtherModule', ['myModule']);
    let module3 = angular.module('myThirdModule', ['myOtherModule']);
    module1.constant('aConstant', 42);
    module2.constant('anotherConstant', 43);
    module3.constant('aThirdConstant', 44);
    let injector = createInjector(['myThirdModule']);

    expect(injector.has('aConstant')).toBe(true);
    expect(injector.has('anotherConstant')).toBe(true);
    expect(injector.has('aThirdConstant')).toBe(true);
  });

  it('loads each module only once', ()=> {
    let module1 = angular.module('myModule', ['myOtherModule']);
    let module2 = angular.module('myOtherModule', ['myModule']);

    createInjector(['myModule']);
  });


// end describe('injector')
});