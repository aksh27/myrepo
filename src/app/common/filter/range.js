(function(){
  'use strict';

  angular
    .module('support')
    .filter('range', range);

  /** @ngInject */
  function range($filter){
    return function(input, total, caller){
      total = parseInt(total);
      if(caller == "h"){
        for(var i=0; i<total; i++)
          input.push(i);
        return input;
      } else if(caller == "m"){
        for(var i=0; i<total; i++)
          input.push(i*5);
        return input;
      }
    }
  }
})();
