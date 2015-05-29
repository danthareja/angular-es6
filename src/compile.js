import _ from 'lodash';
import $ from 'jquery';
import createInjector from './injector';

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

  this.$get = ['$injector', function($injector) {

    function compile($compileNodes) {
      return compileNodes($compileNodes);
    }

    function compileNodes($compileNodes) {
      _.forEach($compileNodes, (node)=> {
        let directives = collectDirectives(node);
        applyDirectivesToNode(directives, node);
      });
    }

    function applyDirectivesToNode(directives, compileNode) {
      let $compileNode = $(compileNode);
      _.forEach(directives, (directive)=> {
        if (directive.compile) {
          directive.compile($compileNode);
        }
      });
    }

    function collectDirectives(node) {
      let directives = [];
      let normalizedNodeName = _.camelCase(nodeName(node).toLowerCase());
      addDirective(directives, normalizedNodeName);
      return directives;
    }

    function nodeName(element) {
      return element.nodeName ? element.nodeName : element[0].nodeName;
    }

    function addDirective(directives, name) {
      if (hasDirectives.hasOwnProperty(name)) {
        // concat return from injector (array) to directives array
        [].push.apply(directives, $injector.get(`${name}Directive`));
      }
    }

    return compile; // what gets injected at the $compile service
  }];
}

$CompileProvider.$inject = ['$provide'];

export default $CompileProvider;