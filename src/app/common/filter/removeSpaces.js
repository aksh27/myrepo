(function(){
  'use strict';

  angular
    .module('support')
    .filter('removeSpaces', removeSpaces);

  /** @ngInject */
  function removeSpaces(){
    return function(string){
      if(!angular.isString(string)){
        return string;
      }
      return string.replace(/  +/g, ' ');
    }
  }
})();
