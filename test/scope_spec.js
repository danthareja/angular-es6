import _ from 'lodash';
import $ from 'jquery';
import Scope from '../src/scope.js';

describe('Scope', () => {

  it('can by constructed and used as an object', () => {
    let scope = new Scope();
    scope.aProperty = 1;

    expect(scope.aProperty).toBe(1);
  });

  describe('digest', () => {
    let scope;

    beforeEach(() => {
      scope = new Scope();
    });

    it('calls the listener function on first $digest', () => {
      let watchFn = () => 'wat';
      let listenerFn = jasmine.createSpy();
      scope.$watch(watchFn, listenerFn);

      scope.$digest();

      expect(listenerFn).toHaveBeenCalled();
    });


    it('calls the watch function with the scope as the arugment', () => {
      let watchFn = jasmine.createSpy();
      let listenerFn = () => {/* noop */};
      scope.$watch(watchFn, listenerFn);

      scope.$digest();

      expect(watchFn).toHaveBeenCalledWith(scope);
    });

    it('calls the listener function when the watched value changes', () => {
      scope.someValue = 'a';
      scope.counter = 0;

      scope.$watch(
        (scope) => scope.someValue,
        (newValue, oldValue, scope) => scope.counter++
      );

      expect(scope.counter).toBe(0);

      scope.$digest();
      expect(scope.counter).toBe(1);

      scope.$digest();
      expect(scope.counter).toBe(1);

      scope.someValue = 'b';
      expect(scope.counter).toBe(1);

      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it('calls the listener function when watch value is first undefined', () => {
      scope.counter = 0;

      scope.$watch(
        (scope) => undefined,
        (newValue, oldValue, scope) => scope.counter++
      );

      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it('calls the listener function with new value as old value the first time', () => {
      scope.someValue = 123;
      let oldValueGiven;

      scope.$watch(
        (scope) => scope.someValue,
        (newValue, oldValue, scope) => oldValueGiven = oldValue
      );

      scope.$digest();
      expect(oldValueGiven).toBe(123);
    });

    it('may have watchers that omit the listener function', () => {
      let watchFn = jasmine.createSpy().and.returnValue('something');
      scope.$watch(watchFn);

      scope.$digest();

      expect(watchFn).toHaveBeenCalled();
    });

    it('triggers chained watchers in the same digest', () => {
      scope.name = 'Dan';

      scope.$watch(
        (scope) => scope.nameUpper,
        (newValue, oldValue, scope) => {
          if (newValue)
            scope.initial = newValue.substring(0,1) + '.';
        }
      );

      scope.$watch(
        (scope) => scope.name,
        (newValue, oldValue, scope) => {
          if (newValue)
            scope.nameUpper = newValue.toUpperCase();
        }
      );

      scope.$digest();
      expect(scope.initial).toBe('D.');

      scope.name = 'Bob';
      scope.$digest();
      expect(scope.initial).toBe('B.');
    });

    it('gives up on the watches after 10 iterations', () => {
      scope.counterA = 0;
      scope.counterB = 0;

      scope.$watch(
        (scope) => scope.counterA,
        (newValue, oldValue, scope) => scope.counterB++
      );

      scope.$watch(
        (scope) => scope.counterB,
        (newValue, oldValue, scope) => scope.counterA++
      );

      expect(() => scope.$digest()).toThrow();
    });

    it('ends the digest when the last watch is clean', () => {
      scope.array = _.range(100);
      let watchExecutions = 0;

      _.times(100, i => {
        scope.$watch(
          (scope) => {
            watchExecutions++;
            return scope.array[i];
          },
          (newValue, oldValue, scope) => {}
        );
      });

      scope.$digest();
      expect(watchExecutions).toBe(200);

      scope.array[0] = 420;
      scope.$digest();
      expect(watchExecutions).toBe(301);
    });

    it('does not end digest so that new watches are not run', () => {
      scope.aValue = 'abc';
      scope.counter = 0;

      scope.$watch(
        (scope) => scope.aValue,
        (newValue, oldValue, scope) => {
          scope.$watch(
            (scope) => scope.aValue,
            (newValue, oldValue, scope) => scope.counter++
          );
        }
      );

      scope.$digest();
      expect(scope.counter).toBe(1);
    });

  });
});
