(function(){
  'use strict';

  angular
    .module('support')
    .filter('sameValue', sameValue);

  /** @ngInject */
  function sameValue(){
    return function(arry, value){
      var sameValue = [];
      if(value[1] == "sg"){
        angular.forEach(arry, function(item){
          if(item.gid === value[0]){
            sameValue.push(item);
          }
        });
      }
      return sameValue;
    }
  }
})();
