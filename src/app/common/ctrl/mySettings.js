(function(){
  'use strict';

  angular
    .module('support')
    .controller('MySettingsController', MySettingsController);

  /** @ngInject */
  function MySettingsController($log, $rootScope, $scope, $state, $window, $cookies, ngDialog, $translate, LocalizationSrv, CommonSrv, MySettingsSrv){
    $rootScope.search = {show:false, text:"", adv:false};
    $rootScope.selectedMenu = 55;

    $scope.contactRegExp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
    $scope.splCharRegExp = new RegExp("(?=.*[!@#$%&])", "gi");
    $scope.charRegExp = new RegExp("(?=.*[a-z])", "gi");
    $scope.numRegExp = new RegExp("(?=.*[0-9])", "gi");
    $scope.auth = $cookies.getObject("supportAuth");
    $scope.updateProcessing = false;
    $scope.fileModelLoading = false;
    $scope.settingsLoading = false;
    $scope.pwdSplCharValid = false;
    $scope.pwdLengthValid = false;
    $scope.pwdCharValid = false;
    $scope.pwdNumValid = false;
    $scope.hasPwdErr = false;
    $scope.pwdValid = false;
    $scope.hasErr = false;
    $scope.settings = {};
    $scope.errType = "";

    $scope.curSettings = {
      pro:{id:$scope.auth.id, email:$scope.auth.email, fName:$scope.auth.fName, lName:$scope.auth.lName, lang:$scope.auth.lang, isActivitylog:$scope.auth.uLog},
      pass:{oPass:"", nPass:"", cPass:""}
    };

    $scope.settings = angular.copy($scope.curSettings);

    $rootScope.selectedTabFx = function(){
      $scope.hasPwdErr = false;
      $scope.hasErr = false;
      $scope.errType = "";
      $scope.settings = angular.copy($scope.curSettings);
      if($rootScope.selectedT == 3){
        $scope.settingsLoading = true;
        MySettingsSrv.getNotify().then(
          function(data){
            $scope.settingsLoading = false;
            // if($scope.auth.userType != 1){
            //   data.eNoti.splice(_.indexOf(data.eNoti, _.find(data.eNoti, function (item) { return item.id === 5; })), 1);
            // }
            $scope.notify = data.eNoti;
          },
          function(err){
            $scope.settingsLoading = false;
            $log.error(err);
          }
        );
      }
    }

    $scope.pwdValidate = function(){
      if($scope.settings.pass.nPass.length >= 8){
        $scope.pwdLengthValid = true;
      }
      else{
        $scope.pwdLengthValid = false;
      }
      if($scope.charRegExp.test($scope.settings.pass.nPass)){
        $scope.pwdCharValid = true;
      }
      else{
        $scope.pwdCharValid = false;
      }
      if($scope.numRegExp.test($scope.settings.pass.nPass)){
        $scope.pwdNumValid = true;
      }
      else{
        $scope.pwdNumValid = false;
      }
      if($scope.splCharRegExp.test($scope.settings.pass.nPass)){
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

    $scope.settingFx = function(){
      $scope.hasErr = false;
      $scope.errType = "";
      if($scope.settings.pro.fName == "" || $scope.settings.pro.lName == ""){
        $scope.errType = "name";
        $scope.hasErr = true;
      } else{
        $scope.updateProcessing = true;
        MySettingsSrv.updateSettings($scope.settings.pro).then(
          function(data){
            $scope.auth = $cookies.getObject("supportAuth");
            $scope.auth.fName = $scope.settings.pro.fName;
            $scope.auth.lName = $scope.settings.pro.lName;
            $scope.auth.lang = $scope.settings.pro.lang;
            $scope.auth.uLog = $scope.settings.pro.isActivitylog;

            $cookies.putObject('supportAuth', $scope.auth);

            /*Localization*/
            if($scope.auth.lang != angular.fromJson(localStorage.getItem("supportAuthLang"))){
              LocalizationSrv.getLocalization($scope.auth.lang).then(
                function(data){
                  localStorage.setItem("supportAuthLang", JSON.stringify($scope.auth.lang));
                  localStorage.setItem("supportLang", JSON.stringify(data));
                  $window.location.reload();
                },
                function(err){
                  $log.error(err);
                }
              );
            } else{
              $state.reload();
            }
            $scope.updateProcessing = false;
          },
          function(err){
            $log.error(err);
            $scope.updateProcessing = false;
          }
        );
      }
    }

    $scope.logout = function(){
      CommonSrv.logOut({"token":$scope.auth.token}).then(
        function(data){
          localStorage.removeItem("supportAuthLang");
          $scope.supportCookies = $cookies.getAll();
          $cookies.remove("supportAuth");
          // angular.forEach($scope.supportCookies, function(v, k){
          //   $cookies.remove(k);
          // });
          //$state.go("login");
          ngDialog.close();
          $window.location.reload();
        },
        function(err){
          $log.error(err);
        }
      );
    }

    // $scope.inputEmptyFx = function(caller){
    //   if(caller && $scope.settings.pass.oPass == ""){
    //     $scope.settings.pass.oPass = "0000";
    //   } else{
    //     if($scope.settings.pass.oPass == "0000"){
    //       $scope.settings.pass.oPass="";
    //     }
    //   }
    // }

    $scope.updatePassFx = function(){
      $scope.hasPwdErr = false;
      $scope.errType = "";
      if($scope.settings.pass.oPass == "" || $scope.settings.pass.nPass == "" || $scope.settings.pass.cPass == ""){
        $scope.hasPwdErr = true;
        $scope.errType = "form";
      } else if($scope.settings.pass.nPass != $scope.settings.pass.cPass){
        $scope.hasPwdErr = true;
        $scope.errType = "match";
      } else if($scope.settings.pass.oPass == $scope.settings.pass.nPass){
        $scope.hasPwdErr = true;
        $scope.errType = "oldNew";
      } else if(!$scope.pwdValid){
        $scope.hasPwdErr = true;
        $scope.errType = "invalid";
      }
      else{
        // MySettingsSrv.updatePass($scope.settings.pass).then(
        $scope.encodePass = {o:btoa($scope.reverse($scope.auth.email+"|"+$scope.settings.pass.oPass)), n:btoa($scope.reverse($scope.auth.email+"|"+$scope.settings.pass.nPass)), c:btoa($scope.reverse($scope.auth.email+"|"+$scope.settings.pass.cPass))};
        $scope.updateProcessing = true;
        MySettingsSrv.updatePass({oPass:$scope.encodePass.o, nPass:$scope.encodePass.n, cPass:$scope.encodePass.c}).then(
          function(data){
            $scope.updateProcessing = false;
            if(data.code == 7015){
              $scope.errType = "curPwd";
              $scope.hasPwdErr = true;
            } else if(data.code == 7014){
              $scope.settings.pass = {oPass:"", nPass:"", cPass:""};
              ngDialog.open({
                template: '\
                  <section class="panel">\
                    <div class="panel-body">\
                      <span class="text-bold text-success">{{"ms.msg.10" | translate}}</span><br>{{"ms.msg.10.1" | translate}}\
                    </div>\
                    <footer class="panel-footer">\
                      <button type="button" class="btn btn-primary btn-sm" ng-click="logout();">Ok</button>\
                    </footer>\
                  </section>',
                plain:true,
                width:500,
                scope:$scope,
                closeByEscape:false,
                closeByDocument:false,
                className:"ngdialog-theme-default ngdialog-confirm"
              });
            }
          },
          function(err){
            $scope.updateProcessing = false;
            $log.error(err);
          }
        );
      }
    }


    $scope.notifyFx = function(){
      $scope.curIds = [];
      angular.forEach($scope.notify, function(obj){
        if(obj.value){
          $scope.curIds.push(obj.id);
        }
      });
      $scope.updateProcessing = true;
      MySettingsSrv.saveNotify({eNoti:$scope.curIds}).then(
        function(data){
          $scope.updateProcessing = false;
        },
        function(err){
          $scope.updateProcessing = false;
          $log.error(err);
        }
      );
    }

  }
})();
