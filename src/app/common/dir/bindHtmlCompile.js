(function(){
  'use strict';

  angular
    .module('support')
    .directive('bindHtmlCompile', bindHtmlCompile);

  /** @ngInject */
  /*This directive work instent of ng-bind-html*/
  function bindHtmlCompile($compile){
    return{
      restrict: 'A',
      link:function(scope, element, attrs){
        scope.$watch(function(){
          return scope.$eval(attrs.bindHtmlCompile);
        }, function(value){
          var curHtml = value.replace(new RegExp(/font-family:\"/g), 'font-family:&quot;').replace(new RegExp(/",/g), "&quot;,");
          element.html(curHtml);
          $compile(element.contents())(scope);
        });
      }
    }
  }
})();
