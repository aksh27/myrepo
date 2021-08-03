(function(){
  'use strict';
  angular
    .module('support')
    .controller('TimeSheetController', TimeSheetController);
  /** @ngInject */
  function TimeSheetController($log, $rootScope, $scope, $state, ngDialog, TimeSheetSrv){
    $rootScope.search = {show:false, text:"", adv:false};
    $rootScope.selectedMenu = 9;

    $scope.maxDate = moment().format('YYYY-MM-DD');
    $scope.curState = $state.current.name;
    $scope.pageLoading = false;

    if($scope.auth.role == 0 || $scope.auth.userType == 4){
      $rootScope.search.show = true;
    }

    if($scope.curState === "support.timeSheet.o"){
      $scope.listType = "o";
      //make header column active
      if($scope.auth.sort.ts.type == 'n'){
        $scope.activeColumnFx('name');
      } else if($scope.auth.sort.ts.type == 'ws'){
        $scope.activeColumnFx('week');
      } else if($scope.auth.sort.ts.type == 'wh'){
        $scope.activeColumnFx('work');
      }
    } else if($scope.curState === "support.timeSheet.s"){
      $scope.listType = "s";
    } else if($scope.curState === "support.timeSheet.a"){
      $scope.listType = "a";
    }

    $scope.getTS = function(){
      $scope.tsList = [];
      if($scope.curState === "support.timeSheet.o"){
        $scope.listType = "o";
      } else if($scope.curState === "support.timeSheet.s"){
        $scope.listType = "s";
      } else if($scope.curState === "support.timeSheet.a"){
        $scope.listType = "a";
        $scope.pageLoading = true;
        TimeSheetSrv.getTS($scope.listType).then(
          function(data){
            $scope.pageLoading = false;
            $scope.tsList = data;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }

      if($scope.curState === "support.timeSheet.o" || $scope.curState === "support.timeSheet.s" || $scope.curState === "support.timeSheet.a"){
        $scope.pageLoading = true;
        TimeSheetSrv.getTS($scope.listType).then(
          function(data){
            $scope.pageLoading = false;
            $scope.tsList = data;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $scope.getTS();
    $scope.uiVersionFx();

    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
      $scope.getTS();
    });

    $scope.setStatusOpen = function(id, type){
      $scope.confirmObj = {id:id, type:type};
      $scope.popupProcessing = false;
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div ng-if="confirmObj.type == \'1\'">\
                {{"ts.msg.5" | translate}}\
                {{"ts.msg.5.1" | translate}}\
              </div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-danger" ng-click="setStatusFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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

    $scope.setStatusFx = function(){
      $scope.popupProcessing = true;
      TimeSheetSrv.deleteUser($scope.confirmObj.id, $scope.confirmObj.type).then(
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

    $scope.deleteOpen = function(id){
      $scope.confirmObj = {id:id};
      $scope.popupProcessing = false;
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">{{"ts.msg.9" | translate}}</div>\
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
      TimeSheetSrv.deleteTimeSheet($scope.confirmObj.id).then(
        function(data){
          $scope.popupProcessing = false;
          if(data.code == 15005){
            $scope.getTS();
            ngDialog.close();
          }
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }

    $scope.reasonOpen = function(reason, rejectedBy){
      $scope.confirmObj = {reason:reason, rejectedBy: rejectedBy.label};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <header class="panel-heading">\
              <span>Timesheet Rejected</span>\
            </header>\
            <div class="panel-body">\
              <div><label>Rejected by : </label>\
              <span class="marL5">{{confirmObj.rejectedBy}}</span></div>\
              <div><label>Reason : </label>\
              <span class="marL5">{{confirmObj.reason !=\'\'?confirmObj.reason: \'No reason provided.\'}}</span></div>\
            </div>\
          </section>',
        plain: true,
        width: 500,
        scope: $scope,
        closeByDocument: true
      });
    }
  }
})();
