import _ from 'lodash';
import setupModuleLoader from '../src/loader';
import createInjector from '../src/injector';
import $CompileProvider from '../src/compile';

describe('$compile', ()=> {
  
  beforeEach(()=> {
    delete window.angular;
    setupModuleLoader(window);

    // create a 'ng' module that hosts our $compile service
    angular.module('ng', [])
      .provider('$compile', $CompileProvider);
  });

  it('allows creating directives', ()=> {
    let myModule = window.angular.module('myModule', []);
    myModule.directive('testing', ()=> {});

    let injector = createInjector(['ng', 'myModule']);

    expect(injector.has('testingDirective')).toBe(true);
  });

  it('allows creating many directives with the same name', ()=> {
    let myModule = window.angular.module('myModule', []);
    myModule.directive('testing', _.constant({d: 'one'}));
    myModule.directive('testing', _.constant({d: 'two'}));
    let injector = createInjector(['ng', 'myModule']);

    let result = injector.get('testingDirective');
    expect(result).toEqual([{d: 'one'}, {d: 'two'}]);
  });

  it('allows creating directives', ()=> {
    let myModule = window.angular.module('myModule', []);
    myModule.directive('hasOwnProperty', ()=> {});

    expect(()=> createInjector(['ng', 'myModule'])).toThrow();
  });

  it('allows creating many directives with the same name', ()=> {
    let myModule = window.angular.module('myModule', []);
    myModule.directive({
      a: _.noop(),
      b: _.noop(),
      c: _.noop()
    });
    let injector = createInjector(['ng', 'myModule']);

    expect(injector.has('aDirective')).toBe(true);
    expect(injector.has('bDirective')).toBe(true);
    expect(injector.has('cDirective')).toBe(true);
  });

// end describe('compile')  
});