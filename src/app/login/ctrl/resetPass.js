(function(){
  'use strict';

  angular
    .module('support')
    .controller('ResetPassController', ResetPassController);

  /** @ngInject */
  function ResetPassController($log, $rootScope, $scope, $state, $translate, ngDialog, vcRecaptchaService, ResetPassSrv){
    $scope.splCharRegExp = new RegExp("(?=.*[!@#$%&])", "gi");
    $scope.charRegExp = new RegExp("(?=.*[a-z])", "gi");
    $scope.numRegExp = new RegExp("(?=.*[0-9])", "gi");
    $scope.pwdSplCharValid = false;
    $scope.pwdLengthValid = false;
    $scope.pwdValid = false;
    $scope.isReset = false;
    $scope.pageLoading = true;

    $scope.credentials = {nPass:"", cPass:"", reCaptcha:""};

    /*Localization*/
    $translate.use("en_US");
    if($state.params.id){
      $scope.credentials.key = $state.params.id;
      $scope.isUserErr = false;
      ResetPassSrv.checkLink($scope.credentials.key).then(
        function(data){
          $scope.pageLoading = false;
          if(data.code == 6050){
            $scope.isLinkValid = false;
          } else{
            $scope.isLinkValid = true;
          }
        }, function(err){
          $scope.pageLoading = false;
          $log.error(err);
        }
      );
    } else{
      $scope.isUserErr = true;
      // $state.go("login");
    }

    $scope.pwdValidate = function(){
      if($scope.credentials.nPass.length >= 8){
        $scope.pwdLengthValid = true;
      } else{
        $scope.pwdLengthValid = false;
      }
      if($scope.charRegExp.test($scope.credentials.nPass)){
        $scope.pwdCharValid = true;
      } else{
        $scope.pwdCharValid = false;
      }
      if($scope.numRegExp.test($scope.credentials.nPass)){
        $scope.pwdNumValid = true;
      } else{
        $scope.pwdNumValid = false;
      }
      if($scope.splCharRegExp.test($scope.credentials.nPass)){
        $scope.pwdSplCharValid = true;
      } else{
        $scope.pwdSplCharValid = false;
      }
      if($scope.pwdLengthValid && $scope.pwdCharValid && $scope.pwdNumValid && $scope.pwdSplCharValid){
        $scope.pwdValid = true;
      } else{
        $scope.pwdValid = false;
      }
    }

    $scope.reverse = function(s){
      $scope.reverseStr = "";
      for(var i = s.length - 1; i >= 0; i--)
        $scope.reverseStr += s[i];
      return $scope.reverseStr;
    }

    $scope.resetPassFx = function(){
      $scope.hasErr = false;
      $scope.errType = "";
      if($scope.credentials.nPass == ""){
        $scope.errType = "nPass";
        $scope.hasErr = true;
      } else if($scope.credentials.cPass == ""){
        $scope.errType = "cPass";
        $scope.hasErr = true;
      } else if($scope.credentials.nPass != $scope.credentials.cPass){
        $scope.errType = "notMach";
        $scope.hasErr = true;
      } else if(!$scope.pwdValid){
        $scope.errType = "invalid";
        $scope.hasErr = true;
      } else if(vcRecaptchaService.getResponse() == ""){
        $scope.errType = "reCaptcha";
        $scope.hasErr = true;
      } else{
        $scope.credentials.reCaptcha = vcRecaptchaService.getResponse();
        $scope.authProcessing = true;

        $scope.encodePass = {c:btoa($scope.reverse("noAnyEmai@here.com|"+$scope.credentials.cPass)), n:btoa($scope.reverse("noAnyEmai@here.com|"+$scope.credentials.nPass))};

        ResetPassSrv.resetPass({cPass:$scope.encodePass.c, nPass:$scope.encodePass.n, key:$scope.credentials.key, reCaptcha:$scope.credentials.reCaptcha}).then(
        // ResetPassSrv.resetPass($scope.credentials).then(
          function(data){
            $scope.authProcessing = false;
            if(data.code == 6051){
              $scope.isReset = true;
            } else if(data.code == 6050){

            }
            // $state.go("login");
          }, function(err){
            $log.error(err);
            $scope.authProcessing = false;
          }
        );
      }
		}

  };
})();
