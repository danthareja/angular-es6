/* jshint globalstrict: true */
'use strict';

function Scope() {
  this.$$watchers = [];
}

function initWatchValue() {}

// watchFn(scope)
// listenerFn(newValue, oldValue, scope)
Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn,
    last: initWatchValue
  };
  this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function() {
  var self = this;
  var newValue, oldValue;
  _.forEach(this.$$watchers, function(watcher) {
    newValue = watcher.watchFn(self);
    oldValue = watcher.last;
    if (newValue !== oldValue) {
      watcher.last = newValue;
      watcher.listenerFn(newValue, oldValue === initWatchValue ? newValue : oldValue, self);
    }
  });
};