(function(){
  'use strict';

  angular
    .module('support')
    .controller('TSDetailsController', TSDetailsController);

  /** @ngInject */
  function TSDetailsController($log, $rootScope, $scope, $state, $window, $sce, $filter, ngDialog, TimeSheetSrv){
    $rootScope.search = {show:false, text:"", adv:false};
    $rootScope.selectedMenu = 9;
    $scope.showRow = {all: false};

    $scope.curState = $state.current.name;
    // $scope.curTab = $state.params.types;
    $scope.$on("curStateBroadcast", function(event, args){
      $scope.curState = args.curState;
    });

    $scope.isBtnSubmit = true;
    $scope.isEditeble = true;
    $scope.isBtnSave = true;
    $scope.isBtnApp = false;

    $scope.encId = "";
    $scope.decId = "";

    $scope.tsIdEncrypt = function(token, id, fName){
      return btoa(token + id + fName);
    }

    if($state.params.id){
      if (!isNaN($state.params.id) && angular.isNumber(+$state.params.id)) {
        $state.params.id = $scope.tsIdEncrypt($scope.auth.token, $state.params.id, $scope.auth.fName);
      }
      $scope.decId = $scope.hubDecrypt($state.params.id);
      $scope.encId = $state.params.id;
      $scope.detailLoading = true;
      TimeSheetSrv.getTSDetails($scope.decId).then(
        function(data){
          $scope.detailLoading = false;
          $scope.ts = data;
          $scope.colTotal = angular.copy($scope.ts.colTotal);
          angular.forEach($scope.ts.colTotal, function(value, i){
            var hours = Math.floor(value / 60);
            var minutes = value % 60;
            $scope.ts.colTotal[i] = hours + ' : ' + minutes + ' hr';
          });
          if($scope.ts.status == 0){
            $scope.curTab = 'o';
          } else if($scope.ts.status == 1){
            $scope.curTab = 's';
          } else if($scope.ts.status == 2){
            $scope.curTab = 'a';
          }
          // $scope.ts = {"id":17,"status":0,"userName":"John Doe","date":{"start":"2020-06-22","end":"2020-06-28"},"header":{"date":["2020-06-22","2020-06-23","2020-06-24","2020-06-25","2020-06-26","2020-06-27","2020-06-28"],"day":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]},"items":[{"subject":"Test-1","ticketId":"5003","threadId":"1687444b40f548db","time":[{"h":1,"m":10},{"h":2,"m":20},{"h":3,"m":30},{"h":4,"m":40},{"h":5,"m":50},{"h":6,"m":60},{"h":7,"m":55}],"total":0},{"subject":"chouhan","ticketId":"5015","threadId":"168756a7d74ce323","time":[{"h":0,"m":5},{"h":0,"m":5},{"h":0,"m":5},{"h":0,"m":5},{"h":0,"m":5},{"h":0,"m":5},{"h":0,"m":5}],"total":0},{"subject":"test","ticketId":"5017","threadId":"168758c1b0592216","time":[{"h":0,"m":0},{"h":0,"m":0},{"h":0,"m":0},{"h":0,"m":0},{"h":0,"m":0},{"h":0,"m":0},{"h":0,"m":0}],"total":0}]};
          if($scope.auth.role == 0 || $scope.auth.userType == 4){
            if($scope.ts.status != 0){
              $scope.isBtnApp = true;
            }
            if($scope.ts.status == 1){
              $scope.isBtnSubmit = false;
            } else if($scope.ts.status == 2){
              $scope.isBtnSubmit = false;
              $scope.isBtnApp = false;
            }
          }
          if($scope.auth.role != 0 && $scope.auth.userType != 4 && $scope.ts.status != 0){
            $scope.isEditeble = false;
            $scope.isBtnSubmit = false;
            $scope.isBtnSave = false;
          }
        },
        function(err){
          $scope.detailLoading = false;
          $log.error(err);
        }
      );
    }

    $scope.setStatusOpen = function(id, type){
      $scope.confirmObj = {id:id, type:type, reason:""};
      $scope.popupProcessing = false;
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div ng-if="confirmObj.type == \'s\'">{{"ts.msg.6" | translate}}</div>\
              <div ng-if="confirmObj.type == \'a\'">{{"ts.msg.7" | translate}}</div>\
              <div class="marB15" ng-if="confirmObj.type == \'r\'">{{"ts.msg.8" | translate}}</div>\
              <div ng-if="confirmObj.type == \'r\'">\
                <label>Reason for rejection</label>\
                <textarea class="form-control" ng-model="confirmObj.reason"></textarea>\
              </div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn" ng-class="confirmObj.type != \'r\'?\'btn-success\':\'btn-danger\'" ng-click="setStatusFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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

    $scope.saveSubmit = false;
    $scope.setStatusFx = function(){
      $scope.popupProcessing = true;
      if($scope.confirmObj.type == "s" && !$scope.saveSubmit){
        $scope.saveTSFx();
        $scope.saveSubmit = true;
        return;
      }
      if($scope.confirmObj.type == 's'){
        var tsBaseUrl = $window.location.href.slice(0, $window.location.href.lastIndexOf('/'));
        var tsId = $scope.hubDecrypt($window.location.href.substr($window.location.href.lastIndexOf('/') + 1));
        $scope.confirmObj.url = tsBaseUrl + '/' + tsId;
      }

      TimeSheetSrv.setStatus($scope.ts.id, $scope.confirmObj.type, $scope.confirmObj).then(
        function(data){
          $scope.popupProcessing = false;
          $state.go("support.timeSheet."+ $scope.curTab);
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }

    $scope.saveProcessing = false;
    $scope.saveTSFx = function(){
      $scope.saveProcessing = true;
      TimeSheetSrv.saveTimeSheet($scope.ts).then(
        function(data){
          $scope.saveProcessing = false;
          if($scope.saveSubmit){
            $scope.setStatusFx();
          } else{
            $state.go("support.timeSheet."+ $scope.curTab);
          }
        },
        function(err){
          $scope.saveProcessing = false;
          $log.error(err);
        }
      );
    }

    // $scope.totalFx = function(arr){
    //   var curTotalH = 0;
    //   var curTotalM = 0;
    //   angular.forEach(arr, function(i){
    //     curTotalH += i.h;
    //     curTotalM += i.m;
    //   });

    //   if(curTotalM > 60){
    //     var tHours = (curTotalM / 60);
    //     var rHours = Math.floor(tHours);
    //     var tMinutes = (tHours - rHours) * 60;
    //     var rMinutes = Math.round(tMinutes);
    //     curTotalH += rHours;
    //     curTotalM = rMinutes;
    //   }
    //   return curTotalH +":"+ curTotalM;
    //   // return curTotalM;
    // }

    $scope.timeEntryObj = {hours:0, minutes:0};
    $scope.minutes = [];
    $scope.hours = [];
    for(var i=0; i<24; i++){
      $scope.hours.push(i);
    }
    for(var i=0; i<13; i++){
      $scope.minutes.push(i*5);
    }

    $scope.timeConvert = function(min){
      var tHours = (min / 60);
      var rHours = Math.floor(tHours);
      var tMinutes = (tHours - rHours) * 60;
      var rMinutes = Math.round(tMinutes);
      return rHours +":"+ rMinutes;
    }

    $scope.sType = "asc";
    $scope.reverse = true;
    $scope.propertyName = 'subject';
    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? $scope.reverse : false;
      $scope.propertyName = propertyName;
      if($scope.reverse == false){
        $scope.reverse = true;
      } else {
        $scope.reverse = false;
      }
    };
    $scope.dSortBy = function(propertyName, index) {
      $scope.arrWithMin = [];
      $scope.arrWithoutMin = [];

      for (var i = 0; i < $scope.ts.items.length; i++) {
        if($scope.ts.items[i].time[index].mSort > 0){
          $scope.arrWithMin.push($scope.ts.items[i]);
        } else {
          $scope.arrWithoutMin.push($scope.ts.items[i]);
        }
      }

      $scope.arrWithMin.sort(function (x, y) {
        if($scope.sType == "asc"){
          return x.time[index].mSort - y.time[index].mSort;
        } else if($scope.sType == "des"){
          return y.time[index].mSort - x.time[index].mSort;
        }
      });

      if($scope.sType == "asc"){
        $scope.ts.items = $scope.arrWithoutMin.concat($scope.arrWithMin);
        $scope.sType = "des";
      } else if($scope.sType == "des") {
        $scope.ts.items = $scope.arrWithMin.concat($scope.arrWithoutMin);
        $scope.sType = "asc";
      }
      $scope.propertyName = propertyName;
    };
  }
})();