(function(){
  'use strict';

  angular
    .module('support')
    .filter('showTotal', showTotal);

  /** @ngInject */
  function showTotal(){
    var showTotalFilter = function(value){
      var hours = Math.floor(value / 60);
      var minutes = value % 60;
      return hours +":"+ minutes;
    };
    return showTotalFilter;
  }
})();