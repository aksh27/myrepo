(function(){
  'use strict';

  angular
    .module('support')
    .filter('capitalize', capitalize);

  /** @ngInject */
  function capitalize(){
    return function(input){
      //return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
      return (angular.isString(input) && input.length > 0) ? input[0].toUpperCase() + input.substr(1).toLowerCase() : input;
    };
  }
})();
