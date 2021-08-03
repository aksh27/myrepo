(function(){
  'use strict';

  angular
    .module('support')
    .controller('SPController', SPController);

  /** @ngInject */
  function SPController($log, $rootScope, $scope, $state, $translate, ngDialog, ForgotPassSrv){
    /*Localization*/
    $translate.use("en_US");

    $scope.reverse = function(s){
      $scope.reverseStr = "";
      for(var i = s.length - 1; i >= 0; i--)
        $scope.reverseStr += s[i];
      return $scope.reverseStr;
    }

    if($state.params.id){
      $scope.user = {id:$state.params.id, email:$state.params.email}
      $scope.pwdLoading = true;
      $scope.pwd = {};
      ForgotPassSrv.showPass($scope.user).then(
        function(data){
          $scope.pwdLoading = false;
          $scope.pwd = data;
          if($scope.pwd.code == 6012){
            $scope.pwd.password = $scope.reverse(atob($scope.pwd.password)).split("|")[1];
          }
        },
        function(err){
          $scope.pwdLoading = false;
          $log.error(err);
        }
      );
    } else{
      $state.go("login");
    }
  };
})();
