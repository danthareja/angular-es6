import setupModuleLoader from '../src/loader';

describe('setupModuleLoader', ()=> {

  beforeEach(()=> delete window.angular);

  it('exposes angular on the window', ()=> {
    setupModuleLoader(window);
    expect(window.angular).toBeDefined();
  });

  it('creates angular just once', ()=> {
    setupModuleLoader(window);
    var ng = window.angular;
    setupModuleLoader(window);
    expect(window.angular).toBe(ng);
  });

  it('exposes the angular module functon', ()=> {
    setupModuleLoader(window);
    expect(window.angular.module).toBeDefined();
  });

  it('exposes the angular module function just once', ()=> {
    setupModuleLoader(window);
    var module = window.angular.module;
    setupModuleLoader(window);
    expect(window.angular.module).toBe(module);
  });

  describe('modules', ()=> {

    beforeEach(() => setupModuleLoader(window));

    it('allows registering a module', ()=> {
      var myModule = window.angular.module('myModule', []);
      expect(myModule).toBeDefined();
      expect(myModule.name).toEqual('myModule');
    });

    it('attaches the requires array to the registered module', ()=> {
      var myModule = window.angular.module('myModule', ['myOtherModule']);
      expect(myModule.requires).toEqual(['myOtherModule']);
    });

    it('allows getting a module', ()=> {
      var myModule = window.angular.module('myModule', []);
      var gotModule = window.angular.module('myModule');

      expect(gotModule).toBeDefined();
      expect(gotModule).toBe(myModule);
    });

    it('throws when trying to get an nonexistent module' , ()=> {
      expect(()=> window.angular.module('myModule')).toThrow();
    });

    it('does not allow a module to be called hasOwnProperty' , ()=> {
      expect(()=> window.angular.module('hasOwnProperty', [])).toThrow();
    });

    // end describe('modules')
  });
  // end describe('setupModuleLoader')
});