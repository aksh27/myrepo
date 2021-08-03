(function(){
  'use strict';

  angular
    .module('support')
    .controller('ATMController', ATMController);

  /** @ngInject */
  function ATMController($log, $rootScope, $scope, $state, $translate, ATMSrv){
    /*Localization*/
    $translate.use("en_US");
    if($state.params.uId && $state.params.thId && $state.params.tiId){
      $scope.atmLoading = true;
      ATMSrv.assign($state.params.uId, $state.params.thId, $state.params.tiId).then(
        function(data){
          $scope.atmLoading = false;
          $scope.atm = data;
        },
        function(err){
          $log.error(err);
        }
      );
    } else{
      $state.go("login");
    }
  };
})();
