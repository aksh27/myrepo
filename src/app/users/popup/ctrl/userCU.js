(function(){
  'use strict';

  angular
    .module('support')
    .controller('UserCUController', UserCUController);

  /** @ngInject */
  function UserCUController($log, $rootScope, $scope, ngDialog, UsersSrv){

    $scope.splCharRegExp = new RegExp("(?=.*[!@#$%&])", "gi");
    $scope.charRegExp = new RegExp("(?=.*[a-z])", "gi");
    $scope.numRegExp = new RegExp("(?=.*[0-9])", "gi");

    $scope.userCU = {fName:"", lName:"", email:"", lang:"en_US", pwd:"", cPwd:"", isActive:"1"};

    $scope.popupProcessing = false;
    $scope.pwdSplCharValid = false;
    $scope.pwdLengthValid = false;
    $scope.pwdCharValid = false;
    $scope.pwdNumValid = false;
    $scope.hasErrPop = false;
    $scope.pwdValid = false;

    if($scope.ngDialogData && $scope.ngDialogData.id){
      $scope.userCU = $scope.ngDialogData;
      $scope.detailLoading = true;
      UsersSrv.getUserCU($scope.userCU.id).then(
        function(data){
          $scope.detailLoading = false;
          $scope.userCU = data;
        },
        function(err){
          $log.error(err);
          $scope.detailLoading = false;
        }
      );
    }

    $scope.userCUFx = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      if($scope.userCU.fName == "" || $scope.userCU.lName == "" || $scope.userCU.email == "" || $scope.userCU.pwd == "" || $scope.userCU.cPwd == ""){
        $scope.hasErrPop = true;
        $scope.errType = "all";
      } else if(!$scope.userCU.email || angular.isUndefined($scope.userCU.email)){
        $scope.hasErrPop = true;
        $scope.errType = "email";
      }
      else if($scope.userCU.pwd != $scope.userCU.cPwd){
        $scope.hasErrPop = true;
        $scope.errType = "notMatch";
      } else if(!$scope.userCU.id && !$scope.pwdValid){
        $scope.hasErrPop = true;
        $scope.errType = "invalid";
      }
      else{
        $scope.popupProcessing = true;
        $scope.encodePass = {p:btoa($scope.reverse($scope.auth.email +"|"+ $scope.userCU.pwd)), c:btoa($scope.reverse($scope.auth.email +"|"+ $scope.userCU.cPwd))};
        UsersSrv.saveUserCU({id:$scope.userCU.id, fName:$scope.userCU.fName, lName:$scope.userCU.lName, email:$scope.userCU.email.replace(/'/g, ""), lang:$scope.userCU.lang, isActive:$scope.userCU.isActive, pwd:$scope.encodePass.p, cPwd:$scope.encodePass.c}).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code == 7001){
              $scope.hasErrPop = true;
              $scope.errType = "exist";
            } else{
              ngDialog.close();
            }
          },
          function(err){
            $log.error(err);
            $scope.popupProcessing = false;
          }
        );
      }
    }


    $scope.reverse = function(s){
      var reverseStr = "";
      for(var i = s.length - 1; i >= 0; i--)
        reverseStr += s[i];
      return reverseStr;
    },

    $scope.pwdValidate = function(){
      if($scope.userCU.pwd.length >= 8){
        $scope.pwdLengthValid = true;
      }
      else{
        $scope.pwdLengthValid = false;
      }
      if($scope.charRegExp.test($scope.userCU.pwd)){
        $scope.pwdCharValid = true;
      }
      else{
        $scope.pwdCharValid = false;
      }
      if($scope.numRegExp.test($scope.userCU.pwd)){
        $scope.pwdNumValid = true;
      }
      else{
        $scope.pwdNumValid = false;
      }
      if($scope.splCharRegExp.test($scope.userCU.pwd)){
        $scope.pwdSplCharValid = true;
      }
      else{
        $scope.pwdSplCharValid = false;
      }
      if($scope.pwdLengthValid && $scope.pwdCharValid && $scope.pwdNumValid && $scope.pwdSplCharValid){
        $scope.pwdValid = true;
      }
      else{
        $scope.pwdValid = false;
      }
    }

  }
})();
