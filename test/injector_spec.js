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

  it('invokes an annotated function with dependency injection ($inject)', ()=> {
    let module = angular.module('myModule', []);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule']);

    let fn = (one, two)=> one + two; // implicit return
    fn.$inject = ['a', 'b'];

    expect(injector.invoke(fn)).toBe(3);
  });

  it('does not accept non-strings as injection tokens', ()=> {
    let module = angular.module('myModule', []);
    module.constant('a', 1);
    let injector = createInjector(['myModule']);

    let fn = (one, two)=> one + two;
    fn.$inject = ['a', 2];

    expect(()=> injector.invoke(fn)).toThrow();
  });

  it('invokes a function with the given this context', ()=> {
    let module = angular.module('myModule', []);
    module.constant('a', 1);
    let injector = createInjector(['myModule']);

    let obj = { 
      two: 2,
      fn(one) { return one + this.two; }
    };
    obj.fn.$inject = ['a'];

    expect(injector.invoke(obj.fn, obj)).toBe(3);
  });


  it('overrides dependencies with locals when invoking', ()=> {
    let module = angular.module('myModule', []);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule']);

    let fn = (one, two)=> one + two; // implicit return
    fn.$inject = ['a', 'b'];

    expect(injector.invoke(fn, null, {b:3})).toBe(4);
  });

  describe('annotate', function() {
    it('returns the $inject annotation of a function when it has one', ()=> {
      let injector = createInjector([]);

      let fn = ()=> {};
      fn.$inject = ['a', 'b'];

      expect(injector.annotate(fn)).toEqual(['a', 'b']);
    });

    it('returns the array-style annotations of a function', ()=> {
      let injector = createInjector([]);

      let fn = ['a', 'b', ()=> {}];

      expect(injector.annotate(fn)).toEqual(['a', 'b']);
    });

    it('returns an empty array for a non-annotated 0-arg function', ()=> {
      let injector = createInjector([]);

      let fn = ()=> {};

      expect(injector.annotate(fn)).toEqual([]);
    });

    it('returns annotations parsed from function args when not annotated', ()=> {
      let injector = createInjector([]);

      let fn = (a,b)=> {};

      expect(injector.annotate(fn)).toEqual(['a','b']);
    });

    it('strips comments from argument lists when parsing', ()=> {
      let injector = createInjector([]);

      let fn = (a, /*b,*/ c)=> {};

      expect(injector.annotate(fn)).toEqual(['a','c']);
    });

    it('strips several comments from argument lists when parsing', ()=> {
      let injector = createInjector([]);

      let fn = (a, /*b,*/ c/*, d*/)=> {};

      expect(injector.annotate(fn)).toEqual(['a','c']);
    });

    it('throws when using a non-annotated fn in strict mode', ()=> {
      let injector = createInjector([], true);

      let fn = (a,b,c)=> {};

      expect(()=> injector.annotate(fn)).toThrow();
    });
  });

  it('invokes an array-annotated function with DI', ()=> {
    let module = angular.module('myModule',[]);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule'])

    let fn = ['a', 'b', (a, b)=> a + b];

    expect(injector.invoke(fn)).toBe(3);
  });

  it('instantiates an annotated ($inject) constructor function with $inject', ()=> {
    let module = angular.module('myModule',[]);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule']);

    function Type(one, two) {
      this.result = one + two;
    }
    Type.$inject = ['a', 'b'];

    let instance = injector.instantiate(Type);
    expect(instance.result).toBe(3);
  });

  it('instantiates an annotated ($inject) ES6 class', ()=> {
    let module = angular.module('myModule',[]);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule']);

    class Type {
      constructor(one, two) {
        this.result = one + two;
      }
    }
    Type.$inject = ['a', 'b'];

    let instance = injector.instantiate(Type);
    expect(instance.result).toBe(3);
  });


  it('instantiates an array-annotated constructor function', ()=> {
    let module = angular.module('myModule',[]);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule']);

    function Type(one, two) {
      this.result = one + two;
    }

    let instance = injector.instantiate(['a','b',Type]);
    expect(instance.result).toBe(3);
  });

  it('instantiates an array-annotated ES6 class', ()=> {
    let module = angular.module('myModule',[]);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule']);

    class Type {
      constructor(one, two) {
        this.result = one + two;
      }
    }

    let instance = injector.instantiate(['a','b',Type]);
    expect(instance.result).toBe(3);
  });

  it('instantiates a non-annotated constructor function', ()=> {
    let module = angular.module('myModule',[]);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule']);

    function Type(a, b) {
      this.result = a + b;
    }

    let instance = injector.instantiate(Type);
    expect(instance.result).toBe(3);
  });

  it('instantiates a non-annotated ES6 class', ()=> {
    let module = angular.module('myModule',[]);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule']);

    class Type {
      constructor(a, b) {
        this.result = a + b;
      }
    }

    let instance = injector.instantiate(Type);
    expect(instance.result).toBe(3);
  });

  it('uses the prototype of the constructor when instantiating', ()=> {
    function BaseType() {}
    BaseType.prototype.getValue = _.constant(42);

    function Type() { this.v = this.getValue(); }
    Type.prototype = BaseType.prototype;

    let module = angular.module('myModule', []);
    let injector = createInjector(['myModule']);

    let instance = injector.instantiate(Type);
    expect(instance.v).toBe(42);
  });

  it('supports locals when instantiating', ()=> {
    let module = angular.module('myModule',[]);
    module.constant('a', 1);
    module.constant('b', 2);
    let injector = createInjector(['myModule']);

    function Type(a, b) {
      this.result = a + b;
    }

    let instance = injector.instantiate(Type, {b:3})
    expect(instance.result).toBe(4);
  });

// end describe('injector')
});
