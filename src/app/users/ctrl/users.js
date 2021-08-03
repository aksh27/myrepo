(function(){
  'use strict';

  angular
    .module('support')
    .controller('UsersController', UsersController);

  /** @ngInject */
  function UsersController($log, $rootScope, $scope, $state, $sce, $filter, ngDialog, UsersSrv){
    $rootScope.search = {show:true, text:"", adv:false};
    $rootScope.selectedMenu = 4;

    $scope.maxDate = moment().format('YYYY-MM-DD');
    $scope.curState = $state.current.name;
    $scope.pageLoading = false;
    $scope.logLoading = false;

    $scope.splCharRegExp = new RegExp("(?=.*[!@#$%&])", "gi");
    $scope.charRegExp = new RegExp("(?=.*[a-z])", "gi");
    $scope.numRegExp = new RegExp("(?=.*[0-9])", "gi");


    $scope.pwdSplCharValid = false;
    $scope.pwdLengthValid = false;
    $scope.pwdCharValid = false;
    $scope.pwdNumValid = false;
    $scope.hasErrPop = false;
    $scope.pwdValid = false;


    $scope.loadMoreLogs = function(count){
      $rootScope.sessionTimoutFx();
      $rootScope.showTimeoutMsg = false;
      if(count == 0){
        // $scope.searchText.log = "";
        $scope.allLogsLoaded = false;
        $scope.logList = [];
      }
      if(!$scope.allLogsLoaded && !$scope.logLoading){
        $scope.logLoading = true;
        UsersSrv.getLogs($scope.logList.length, new Date().getTimezoneOffset()).then(
          function(data){
            $scope.logLoading = false;
            if(data.logs && data.logs.length > 0){
              $scope.logList = $scope.logList.concat(data.logs);
            } else{
              $scope.allLogsLoaded = true;
            }
          },
          function(err){
            $scope.logLoading = false;
            $log.error(err);
          }
        );
      }
    }

    $scope.getUser = function(){
      if($scope.curState === "support.users.ul"){
        $scope.loadMoreLogs(0);
        // $scope.logList = {};
        // UsersSrv.getLogs().then(
        //   function(data){
        //     $scope.pageLoading = false;
        //     $scope.logList = data.logs;
        //   },
        //   function(err){
        //     $scope.pageLoading = false;
        //     $log.error(err);
        //   }
        // );
      }
      else if($scope.curState === "support.users.sc"){
        //make icon active on column
        if($scope.auth.sort.user.type == 'n'){
          $scope.activeColumnFx('name');
        } else {
          $scope.activeColumnFx('userType');
        }
        $scope.pageLoading = true;
        $scope.agentList = {};
        UsersSrv.getSC().then(
          function(data){
            $scope.pageLoading = false;
            $scope.agentList = data.agents;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $scope.getUser();
    $scope.uiVersionFx();

    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
      $scope.getUser();
    });

    $scope.detailedLogFx = function(data){
      $scope.detailLoading = true;
      $scope.detailedLog = {obj:data, list:[]};
      UsersSrv.getDetailedLog(data.id).then(
        function(data){
          $scope.detailedLog.list = data;
          $scope.detailLoading = false;
        },
        function(err){
          $log.error(err);
          $scope.detailLoading = false;
        }
      );

      ngDialog.open({
        template: 'app/users/popup/detailedLog.html',
        width: 600,
        scope: $scope,
        data: $scope.detailedLog,
        closeByDocument: false
      });
    }

    $scope.logsOpen = function(){
      $scope.hasErrPop = false;
      $scope.logs = {module:"a", date:{startDate: moment().subtract(1, "day")._d, endDate: moment()._d}};
      if($scope.logList.length > 0){
        ngDialog.open({
          template: 'app/users/popup/downloadLog.html',
          width: 500,
          scope: $scope,
          trapFocus: false,
          data: $scope.logs,
          closeByDocument: false
        });
      }
    }

    $scope.logsFx = function(){
      $scope.popupProcessing = true;
      $scope.hasErrPop = false;
      $scope.logsCopy = angular.copy({date:{startDate:moment($scope.logs.date.startDate).format("L"), endDate:moment($scope.logs.date.endDate).format("L")}});
      UsersSrv.downloadLogs($scope.logsCopy, new Date().getTimezoneOffset()).then(
        function(data){
          $scope.popupProcessing = false;
          if(data.code == 8003){
            $scope.hasErrPop = true;
          }
          else{
            $scope.logs.url = data.download;
            $scope.popupProcessing = false;
          }
        },
        function(err){
          $log.error(err);
          $scope.popupProcessing = false;
        }
      );
    }

    $scope.deleteOpen = function(id){
      $scope.confirmObj = {id:id};
      $scope.popupProcessing = false;
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">{{"users.msg.1" | translate}}</div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-danger" ng-click="deleteFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
              <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
            </footer>\
          </section>',
        plain: true,
        width: 500,
        scope: $scope,
        closeByDocument: false,
        className: "ngdialog-theme-default ngdialog-confirm"
      });
    }

    $scope.deleteFx = function(){
      $scope.popupProcessing = true;
      UsersSrv.deleteUser($scope.confirmObj.id).then(
        function(data){
          $scope.popupProcessing = false;
          if(data.code == 7007){
            $scope.getUser();
            ngDialog.close();
          }
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }


    $scope.userCUOpen = function(id){
      $scope.userObj = {id:id};
      ngDialog.open({
        template: 'app/users/popup/userCU.html',
        width: 620,
        scope: $scope,
        data: $scope.userObj,
        closeByDocument: false,
        controller: 'UserCUController',
        preCloseCallback: function(caller){
          if(angular.isUndefined(caller)){
            $scope.getUser();
          }
        }
      });
    }
  }
})();
