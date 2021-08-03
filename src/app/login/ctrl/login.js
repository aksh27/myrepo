(function(){
  'use strict';

  angular
    .module('support')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($log, $scope, $state, $http, $cookies, $translate, $window, $location, LocalizationSrv, LoginSrv){
    $scope.authProcessing = false;
    $scope.credentials = {email:"",pwd:""};
    $scope.hasErr = false;
    $scope.errType = "";
    $scope.auth = [];
    $scope.timesheet = {url:window.location.href}
    $scope.isNormalLogin = false;

    /*Localization*/
    $translate.use("en_US");

    if($state.params.id == "azureCallback"){
      $scope.isSsoAuth = true;
      $scope.authProcessing = true;
      LoginSrv.signInCallback($location.search()).then(
        function(data){
          $scope.authProcessing = false;
          $scope.isSsoAuth = false;
          if(data.code && data.code == 6029){
            $scope.errType = "authFail";
            $scope.hasErr = true;
          } else if(data.code && data.code == 6030){
            $scope.errType = "issueFetch";
            $scope.hasErr = true;
          } else if(data.code && data.code == 6031){
            $scope.errType = "userNotExist";
            $scope.hasErr = true;
          } else if(data.status !== "error"){
            $scope.isSsoAuth = true;
            $scope.setInfoFx(data);
          }
        }, function(err){
          $scope.authProcessing = false;
          $scope.isSsoAuth = false;
        }
      );
    }

    $scope.reverse = function(s){
      $scope.reverseStr = "";
      for(var i = s.length - 1; i >= 0; i--)
        $scope.reverseStr += s[i];
      return $scope.reverseStr;
    }

    $scope.setInfoFx = function(data){
      $http.defaults.headers.common.Authorization = data.info.token;
      $scope.auth = data.info;

      localStorage.setItem("supportAuthLang", JSON.stringify($scope.auth.lang));
      $cookies.putObject("supportAuth", $scope.auth);

      /*Localization*/
      LocalizationSrv.getLocalization($scope.auth.lang).then(
        function(data){
          localStorage.setItem("supportAuthLang", JSON.stringify($scope.auth.lang));
          localStorage.setItem("supportLang", JSON.stringify(data));
        },
        function(err){
          $log.error(err);
        }
      );
      $scope.isSsoAuth = false;
      $state.go("support.dashboard");
    }

    $scope.authenticate = function(caller){
      if(caller == "ft"){
        $scope.ftProcessing = true;
        LoginSrv.getSSOLink().then(
          function(data){
            $scope.ftProcessing = false;
            $window.open(data.url, "_self");
          }, function(err){
            $scope.ftProcessing = false;
            $scope.errType = "api";
            $scope.hasErr = true;
          }
        );
        return;
      }

      $scope.authProcessing = true;
      $scope.hasErr = false;
      if(!$scope.credentials.email || $scope.credentials.email == "" || !$scope.credentials.pwd || $scope.credentials.pwd == ""){
        $scope.authProcessing = false;
        $scope.errType = "form";
        $scope.hasErr = true;
      } else{
        if($state.params.id && $state.params.id != "azureCallback"){
          $scope.credentials.id = $state.params.id;
        }
        $scope.hubEnc = function(){
          $scope.emailPass = $scope.credentials.email+"|"+$scope.credentials.pwd;
          return btoa($scope.reverse($scope.emailPass));
        }

        // LoginSrv.authenticate($scope.credentials).then(
        LoginSrv.authenticate({email:$scope.credentials.email, pwd:$scope.hubEnc()}).then(
          function(data){
            $scope.authProcessing = false;
            if(data.code && data.code == 6001){
              $scope.errType = "auth";
              $scope.hasErr = true;
            }
            else{
              $scope.setInfoFx(data);
            }
          }, function(err){
            $scope.authProcessing = false;
            $scope.errType = "api";
            $scope.hasErr = true;
          }
        );
      }
    }

    $scope.resendFx = function(){
      LoginSrv.resendEmail($scope.uid).then(
        function(data){
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.showNormalLoginFx = function(){
      $scope.isNormalLogin = true;
    }
  }
})();
