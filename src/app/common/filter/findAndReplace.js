(function(){
  'use strict';

  angular
    .module('support')
    .filter('findAndReplace', findAndReplace);

  /** @ngInject */
  function findAndReplace(){
    return function(string, target, replacement){
      var i = 0, length = string.length;
      for(i; i < length; i++){
        string = string.replace(target, replacement);
      }
      return string;
    }
  }
})();
