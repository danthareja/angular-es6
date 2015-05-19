class Scope {
  constructor() {
    this.$$watchers = [];
  }

  $watch(watchFn, listenerFn) {
    var watcher = { watchFn, listenerFn, last: initWatchValue };
    this.$$watchers.push(watcher);
  }

  $digest() {
    var newValue, oldValue;
    this.$$watchers.forEach(watcher => {
      newValue = watcher.watchFn(this); // Arrow function has lexical 'this'
      oldValue = watcher.last;
      if (newValue !== oldValue) {
        watcher.last = newValue;
        watcher.listenerFn(newValue, oldValue === initWatchValue ? newValue : oldValue, this);
      }
    });
  }
}

function initWatchValue() {}

export default Scope;