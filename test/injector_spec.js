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


// end describe('injector')
});