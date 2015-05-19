import _ from 'lodash';
import $ from 'jquery';
import Scope from '../src/scope.js';

describe("Scope", () => {

  it("can by constructed and used as an object", () => {
    let scope = new Scope();
    scope.aProperty = 1;

    expect(scope.aProperty).toBe(1);
  });

  describe("digest", () => {
    let scope;

    beforeEach(() => {
      scope = new Scope();
    });

    it("calls the listener function on first $digest", () => {
      let watchFn = () => "wat";
      let listenerFn = jasmine.createSpy();
      scope.$watch(watchFn, listenerFn);

      scope.$digest();

      expect(listenerFn).toHaveBeenCalled();
    });


    it('calls the watch function with the scope as the arugment', () => {
      let watchFn = jasmine.createSpy();
      let listenerFn = () => {}; // noop
      scope.$watch(watchFn, listenerFn);

      scope.$digest();

      expect(watchFn).toHaveBeenCalledWith(scope);
    });

    it("calls the listener function when the watched value changes", () => {
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
  });
});
