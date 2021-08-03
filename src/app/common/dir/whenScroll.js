(function(){
  'use strict';

  angular
    .module('support')
    .directive('whenScrolled', whenScrolled);

  /** @ngInject */
  function whenScrolled(){
    return{
      link: function(scope, element, attrs){
        var raw = element[0];
        element.bind('scroll', function(){
          if(raw.scrollTop + raw.offsetHeight >= raw.scrollHeight){
            scope.$apply(attrs.whenScrolled);
          }
        });
      }
    }
  }
})();
