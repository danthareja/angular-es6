import _ from 'lodash';
import $ from 'jquery';
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


  function makeInjectorWithDirectives(...args) {
    return createInjector(['ng', ($compileProvider) => {
      $compileProvider.directive.apply($compileProvider, args);
    }]);
  }

  it('compiles element directives from a single element', ()=> {
    // (1) create a module with myDirective and an injector for it
    let injector = makeInjectorWithDirectives('myDirective', ()=> {
      return {
        compile(element) {
          element.data('hasCompiled', true);
        }
      };
    });

    injector.invoke(($compile)=> {
      // (2) use jQuery to parse a DOM fragment with the <my-directive> elment
      let el = $('<my-directive></my-directive>');
      // (3) get $compile from injector created in (1) and invoke it with ele in (2)
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
    });
  });

  it('compiles element directives from multiple elements', ()=> {
    let count = 1;
    let injector = makeInjectorWithDirectives('myDirective', ()=> {
      return {
        compile(element) {
          element.data('hasCompiled', count++);
        }
      };
    });

    injector.invoke(($compile)=> {
      let el = $('<my-directive></my-directive><my-directive></my-directive>');
      $compile(el);
      expect(el.eq(0).data('hasCompiled')).toBe(1);
      expect(el.eq(1).data('hasCompiled')).toBe(2);
    });
  });



// end describe('compile')  
});