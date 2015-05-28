import _ from 'lodash';

function $CompileProvider($provide) {

  let hasDirectives = {};

  // method exposed on angular.module
  this.directive = function(name, directiveFactory) {
    if (_.isString(name)) {
      if (name === 'hasOwnProperty') {
        throw 'hasOwnProperty is not a valid directive name';
      }
      if (!hasDirectives.hasOwnProperty(name)) {
        hasDirectives[name] = [];
        $provide.factory(`${name}Directive`, ['$injector', ($injector)=> {
          let factories = hasDirectives[name];
          return _.map(factories, $injector.invoke);
        }]);
      }
      hasDirectives[name].push(directiveFactory);
    } else {
      _.forEach(name, (directiveFactory, name)=> {
        this.directive(name, directiveFactory);
      }, this);
    }
  };

  this.$get = function() {

  };

}

$CompileProvider.$inject = ['$provide'];

export default $CompileProvider;