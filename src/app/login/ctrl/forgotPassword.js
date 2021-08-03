(function(){
  'use strict';

  angular
    .module('support')
    .controller('FPController', FPController);

  /** @ngInject */
  function FPController($log, $scope, $state, $timeout, $window, $translate, $filter, ngDialog, vcRecaptchaService, ForgotPassSrv){
    $scope.authProcessing = false;
    $scope.isPwdSuccess = false;
    $scope.isSupport = false;
    $scope.hasErr = false;
    $scope.errType = "";
    $scope.pwd = {};

    /*Localization*/
    $translate.use("en_US");

    $scope.credentials = {email:"", reCaptcha:""};
		$scope.goLoginFx = function(){
      $state.go("login");
      setTimeout(function(){
        $window.location.reload();
      }, 10);
    }
		$scope.forgotPassFx = function(){
      $scope.hasErr = false;
      $scope.errType = "";
      if(!$scope.email || $scope.email == ""){
        $scope.errType = "email";
        $scope.hasErr = true;
      } else if(vcRecaptchaService.getResponse() == ""){
        $scope.errType = "reCaptcha";
        $scope.hasErr = true;
      } else{
        $scope.credentials = {email:$filter('lowercase')($scope.email), reCaptcha:vcRecaptchaService.getResponse()};
        $scope.authProcessing = true;
        ForgotPassSrv.forgotPass($scope.credentials).then(
          function(data){
            $scope.authProcessing = false;
            $scope.pwd = data;
            if($scope.pwd.code == 6019 || $scope.pwd.code == 6020){
              $scope.isPwdSuccess = true;
            }
            if($scope.pwd.code == 6047){
              $scope.isSupport = true;
            }
          }, function (err){
            $log.error(err);
            $scope.authProcessing = false;
          }
        );
      }
		}
  }
})();
