(function() {
  'use strict';

  angular
    .module('support')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $rootScope, $state, $stateParams){
    $rootScope.$state = $state;
    return $rootScope.$stateParams = $stateParams;
    //$log.debug('runBlock end');
  }

})();
(function(){
  'use strict';
  angular
    .module('support')
    .run(function($rootScope, $state, $cookies, $timeout, $interval, $location, $http, $filter, $translate, ngDialog, RestartSessionSrv){
      $rootScope.apiHost = "https://dev.lsquared.com/supportDev/api/v1/"; //API call // /api_outlook/v1 url Dev:- http://dev.lsquared.com/supportDev/api/v1/ | Dev build:- /supportDev/api/v1/ | Live:- /api/v1/
      // $rootScope.apiHost = "http://192.168.1.235:8080/dist/api/v1/"
      //http://dev.lsquared.com/hub/api/v1/auth/ui/2.1.0.479

      $rootScope.copyRight = moment.utc().format("YYYY") + " &copy; L Squared Digital Signage"; //Footer copyright text
      $rootScope.publicKey = "6LeRFB0TAAAAAPjjzhQTL0DVmVwbpF5pMfjRoJmQ";
      $rootScope.pageTitle = "L Squared Support - ";
      $rootScope.uiVersion = "1.1.0.350";//Hub:- 1.0.0.10 //Dev:- 1.1.0.225
      $rootScope.showTimeoutMsg = false;
      $rootScope.isPopupOpen = false;
      /***
        1 - Support - mahesh.chouhan@lsquared.com, 2 - Sales - apatidar@lsquared.com, 3 - Accounts - dgoyal@lsquared.com, 4 - Admin - gr1@lsquared.com, 5 - Super admin - harish.sharma@lsquared.com
      */

      /*Localization*/
      var translateChange = false;
      $rootScope.$on('$translateChangeSuccess', function(){
        $rootScope.pageTitle = "L Squared Support - " + $translate.instant('cm.menu.' + $state.current.data.id);
        translateChange = true;
      });

      var auth, sessionTime;
      $rootScope.sessionTimoutFx = function(){
        document.title = $rootScope.pageTitle;
        if(auth && auth.life){
          sessionTime = auth.life - 60000;
        } else{
          sessionTime = 1320000 - 60000;
        }
        try{
          $timeout.cancel($rootScope.sessionTimeoutTimer);
          $interval.cancel($rootScope.isInterval);
        } catch(e){}
        $rootScope.sessionTimeoutTimer = $timeout(function(){
          $rootScope.lock();
        }, sessionTime);
      }
      $rootScope.sessionTimoutFx();

      $rootScope.lock = function(){
        if($state.current.name != "login" && $state.current.name != "forgotPassword" && $state.current.name != "showPassword" && $state.current.name != "resetPass" && $state.current.name != "assignToMe" && $state.current.name != "thanks"){
          $rootScope.showTimeoutMsg = true;
          $rootScope.sessionTimer = 30;
          try{
            $interval.cancel($rootScope.isInterval);
          } catch(e){}
          $rootScope.isInterval = $interval(function(){
            $rootScope.sessionTimer--;
            //console.log("session timer");
            if($rootScope.sessionTimer%2 == 0){
              document.title = "...";
            } else{
              document.title = "ATTENTION";
            }
            if($rootScope.sessionTimer == 0){
              $interval.cancel($rootScope.isInterval);
              $rootScope.showTimeoutMsg = false;
              $rootScope.logOutFx();
            }
          }, 1000); //30 sec. timer
        }
        else{
          //console.log("no lock");
        }
      }

      $rootScope.resetSession = function(action){
        document.title = $rootScope.pageTitle;
        $timeout.cancel($rootScope.sessionTimeoutTimer);
        $timeout.cancel($rootScope.sessionMsgHideTimer);
        $timeout.cancel($rootScope.restartSessionTimer);
        $interval.cancel($rootScope.isInterval);
        $rootScope.showTimeoutMsg = false;
        RestartSessionSrv.restartSession().then(
          function(data){
            if(action){
              $rootScope.sessionTimoutFx();
            }
          },
          function(err){
            console.error(err);
          }
        );
      }

      $rootScope.keepSessionAlive = function(){
        try{
          $timeout.cancel($rootScope.sessionTimeoutTimer);
          $timeout.cancel($rootScope.sessionMsgHideTimer);
          $timeout.cancel($rootScope.restartSessionTimer);
          $rootScope.showTimeoutMsg = false;
          $rootScope.restartSessionTimer = $timeout(function(){
            RestartSessionSrv.restartSession().then(
              function(data){
                $rootScope.keepSessionAlive();
              },
              function(err){
                console.error(err);
              }
            );
          }, sessionTime);//1,200,000
        }
        catch(e){}
      }

      $rootScope.$on("$stateChangeStart", function(event, toState, $scope){
        $rootScope.selectedT = 1; /*For Tab selection*/
        $rootScope.curState = toState.name;
        $rootScope.parentState = toState.name.split(".")[0];
        /*Localization*/
        if(translateChange){
          $rootScope.pageTitle = "L Squared Support - " + $filter("translate")('cm.menu.'+ toState.data.id);
        }
        ngDialog.closeAll();
        try{
          $timeout.cancel($rootScope.sessionTimeoutTimer);
          $timeout.cancel($rootScope.sessionMsgHideTimer);
          $timeout.cancel($rootScope.restartSessionTimer);
          $rootScope.showTimeoutMsg = false;

          if($rootScope.curState != "login" && $rootScope.curState != "forgotPassword" && $rootScope.curState != "showPassword" && $rootScope.curState != "resetPass" && $rootScope.curState != "assignToMe" && $rootScope.curState != "thanks" && $rootScope.curState != "s.survey" && toState.name !== "s.thanks"){
            $rootScope.sessionTimoutFx();
          }
        }
        catch(e){}

        if($rootScope.csPromise){
          $timeout.cancel($rootScope.csPromise);
        }
        var currentState = toState.name.split(".");
        if(toState.name !== "login" && toState.name !== "forgotPassword" && toState.name !== "showPassword" && toState.name !== "resetPass" && toState.name !== "assignToMe" && toState.name !== "thanks" && toState.name !== "s.survey" && toState.name !== "s.thanks"){
          $scope.auth = auth = $cookies.getObject("supportAuth");
          if(!$scope.auth){
            localStorage.removeItem("supportAuthLang");
            $state.go("login");
            event.preventDefault();
          }
        }
        else if(toState.name === "login"){
          localStorage.removeItem("supportAuthLang");
          $scope.supportCookies = $cookies.getAll();
          // $cookies.remove(k);
          angular.forEach($scope.supportCookies, function(v, k){
            $cookies.remove(k);
          });
        }
      })
    })
})();
