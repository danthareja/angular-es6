import _ from 'lodash';

class Scope {
  constructor() {
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;
  }

  $watch(watchFn, listenerFn) {
    var watcher = { 
      watchFn, // Object literal shorthand can be partially applied
      listenerFn: listenerFn || () => {},
      last: initWatchValue
    };
    this.$$watchers.push(watcher);
    this.$$lastDirtyWatch = null;
  }

  $$digestOnce() {
    var newValue, oldValue, dirty;
    _.each(this.$$watchers, watcher => {
      newValue = watcher.watchFn(this); // Arrow function has lexical 'this'
      oldValue = watcher.last;
      if (newValue !== oldValue) {
        this.$$lastDirtyWatch = watcher;
        watcher.last = newValue;
        watcher.listenerFn(newValue, oldValue === initWatchValue ? newValue : oldValue, this);
        dirty = true;
      } else if (this.$$lastDirtyWatch === watcher) {
        return false; // explicit return breaks out of lodash's _.each
      }
    });
    return dirty;
  }

  $digest() {
    var ttl = 10;
    var dirty;
    this.$$lastDirtyWatch = null;
    do {
      dirty = this.$$digestOnce();
      if (dirty && !(ttl--)) {
        throw `${ttl} digest cycles reached`;
      }
    } while(dirty);
  }
}

function initWatchValue() {}

export default Scope;