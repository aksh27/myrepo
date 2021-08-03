(function(){
  'use strict';

  angular
    .module('support')
    .controller('ServersListController', ServersListController);

  /** @ngInject */
  function ServersListController($log, $rootScope, $scope, $state, $sce, $filter, $cookies, $interval, ngDialog, TicketSrv, ServersSrv){
    $rootScope.endpoint = $cookies.getObject("endpoint").url;
    $rootScope.selectedMenu = 10;

    $scope.selectedServer = $cookies.getObject("endpoint").server;
    $scope.selectedServerId = $cookies.getObject("endpoint").id;
    $scope.storage = $cookies.getObject("endpoint").storage;
    $scope.tim = $cookies.getObject("endpoint").tim;
    $scope.curState = $state.current.name;
    $scope.reports = {partner:""};
    $scope.listLoading = false;
    $scope.filterCount = "";
    $scope.filter = "all";
    $scope.serverList;
    $rootScope.search.show = true;

    if(localStorage.getItem("deviceFilterType") && $scope.curState == "support.sList.d"){
      $scope.filter = localStorage.getItem("deviceFilterType");
    } else {
      localStorage.removeItem("deviceFilterType");
    }

    $scope.loadServerList = function(){
      $scope.listLoading = true;
      ServersSrv.getServerList($rootScope.endpoint, $scope.auth.sort.ser_ser.type, $scope.auth.sort.ser_ser.val).then(
        function(data){
          $scope.listLoading = false;
          $scope.serverList = data;

        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.loadDeviceList = function(){
      $scope.listLoading = true;
      ServersSrv.getDeviceList($rootScope.endpoint, $scope.auth.sort.ser_dev.type, $scope.auth.sort.ser_dev.val).then(
        function(data){
          $scope.listLoading = false;
          $scope.deviceList = data;
          $scope.deviceFilterFx($scope.filter);
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.loadUserList = function(){
      $scope.listLoading = true;
      ServersSrv.getUserList($rootScope.endpoint, $scope.auth.sort.ser_user.type, $scope.auth.sort.ser_user.val).then(
        function(data){
          $scope.listLoading = false;
          $scope.userList = data;
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.loadLicenseList = function(){
      $scope.listLoading = true;
      ServersSrv.getLicenseList($scope.selectedServerId).then(
        function(data){
          $scope.listLoading = false;
          $scope.licenseList = data;
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.loadWidgetList = function(){
      $scope.listLoading = true;
      ServersSrv.getWidgetList($rootScope.endpoint, $scope.auth.sort.ser_wid.type, $scope.auth.sort.ser_wid.val).then(
        function(data){
          $scope.listLoading = false;
          $scope.widgetList = data;
        },
        function(err){
          $log.error(err);
        }
      );
    }

    // $scope.loadVMList = function(){
    //   $scope.listLoading = true;
    //   ServersSrv.getVMList($scope.selectedServerId).then(
    //     function(data){
    //       $scope.listLoading = false;
    //       // $scope.gCalendar.isAuthorized = data.isAuthorized;
    //       $scope.rUrl = data.rUrl;
    //       $scope.vmList = data;
    //       if(data.code == 16012){
    //         // $scope.hasErr = true;
    //         // $scope.errType = "authEmpty";
    //         $scope.isAuthorized = false;
    //       }
    //     },
    //     function(err){
    //       $log.error(err);
    //       $scope.saveProcessing = false;
    //     }
    //   );
    // }

    $scope.deviceFilterFx = function(type){
      $scope.filter = type;
      localStorage.setItem("deviceFilterType", $scope.filter);
      if(type=="offline"){
        $rootScope.deviceFilter = "off";
      } else if(type=="online"){
        $rootScope.deviceFilter = "on";
      }
      if(type == 'all'){
        $rootScope.deviceFilter = "all";
        if($scope.deviceList){
          $scope.filterCount = $scope.deviceList.length;
        }
      } else{
        $scope.filterCount = $filter("filter")($scope.deviceList, {status:type}).length;
        $scope.filterStatus = true;
      }
    }

    $scope.loadList = function(){
      if($scope.curState == "support.sList.s"){
        $scope.loadServerList();

        //make icon active on column
        if($scope.auth.sort.ser_ser.type == 'n'){
          $scope.activeColumnFx("label");
        } else if($scope.auth.sort.ser_ser.type == 'cr'){
          $scope.activeColumnFx('created');
        } else if($scope.auth.sort.ser_ser.type == 'pa'){
          $scope.activeColumnFx('primeAdmin');
        } else if($scope.auth.sort.ser_ser.type == 'l'){
          $scope.activeColumnFx('licenses');
        } else if($scope.auth.sort.ser_ser.type == 'd'){
          $scope.activeColumnFx('devices');
        }
      }
      else if($scope.curState == "support.sList.d"){
        $scope.loadDeviceList();

        //make icon active on column
        if($scope.auth.sort.ser_dev.type == 'n'){
          $scope.activeColumnFx("label");
        } else if($scope.auth.sort.ser_dev.type == 'm'){
          $scope.activeColumnFx('mac');
        } else if($scope.auth.sort.ser_dev.type == 't'){
          $scope.activeColumnFx('type');
        } else if($scope.auth.sort.ser_dev.type == 'v'){
          $scope.activeColumnFx('version');
        } else if($scope.auth.sort.ser_dev.type == 's'){
          $scope.activeColumnFx('server');
        } else if($scope.auth.sort.ser_dev.type == 'a'){
          $scope.activeColumnFx('addedOn');
        } else if($scope.auth.sort.ser_dev.type == 'l'){
          $scope.activeColumnFx('lastping');
        }
      }
      else if($scope.curState == "support.sList.u"){
        $scope.loadUserList();

        //make icon active on column
        if($scope.auth.sort.ser_user.type == 'n'){
          $scope.activeColumnFx("fname");
        } else if($scope.auth.sort.ser_user.type == 'e'){
          $scope.activeColumnFx('email');
        } else if($scope.auth.sort.ser_user.type == 'r'){
          $scope.activeColumnFx('label');
        } else if($scope.auth.sort.ser_user.type == 'll'){
          $scope.activeColumnFx('login');
        }
      }
      else if($scope.curState == "support.sList.l"){
        $scope.loadLicenseList();
      }
      else if($scope.curState == "support.sList.w"){
        $scope.loadWidgetList();

        //make icon active on column
        if($scope.auth.sort.ser_wid.type == 'n'){
          $scope.activeColumnFx("type");
        } else if($scope.auth.sort.ser_wid.type == 's'){
          $scope.activeColumnFx('sch');
        } else if($scope.auth.sort.ser_wid.type == 'a'){
          $scope.activeColumnFx('count');
        }
      }
      // else if($scope.curState == "support.sList.vm"){
      //   $scope.loadVMList();
      //   $scope.propertyName = 'schedule';
      // }
      else if($scope.curState == "support.sList.r"){
        $scope.download = "";
        $scope.listLoading = true;
        ServersSrv.getPartnerList($rootScope.endpoint).then(
          function(data){
            $scope.listLoading = false;
            $scope.partnerList = data;
          },
          function(err){
            $scope.listLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $scope.loadList();
    $scope.uiVersionFx();

    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
      $scope.loadList();
    });

    $scope.exportListFx = function(){
      $scope.type = "";
      $scope.list = {url:""};
      if($scope.curState == "support.sList.s"){
        $scope.type = "servers";
      } else if($scope.curState == "support.sList.d"){
        $scope.type = "devices";
      } else if($scope.curState == "support.sList.u"){
        $scope.type = "users";
      }
      if($scope.curState == "support.sList.w"){
        ServersSrv.exportAllWidgetList($rootScope.endpoint).then(
          function(data){
            $scope.list.url = data.download;
            ngDialog.open({
              template: 'app/servers/popup/exportList.html',
              width: 500,
              scope: $scope,
              trapFocus: false,
              data: $scope.logs,
              closeByDocument: false
            });
          },
          function(err){
            $log.error(err);
          }
        );
      } else {
        ServersSrv.exportList($rootScope.endpoint, $scope.type).then(
          function(data){
            $scope.list.url = data.download;
            ngDialog.open({
              template: 'app/servers/popup/exportList.html',
              width: 500,
              scope: $scope,
              trapFocus: false,
              data: $scope.logs,
              closeByDocument: false
            });
          },
          function(err){
            $log.error(err);
          }
        );
      }
    }

    $scope.exportWidgetFx = function(id){
      $scope.list = {url:""};
      ServersSrv.exportWidget($rootScope.endpoint, id).then(
        function(data){
          $scope.list.url = data.download;
          ngDialog.open({
            template: 'app/servers/popup/exportList.html',
            width: 500,
            scope: $scope,
            trapFocus: false,
            data: $scope.logs,
            closeByDocument: false
          });
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.deviceIdOpen = function(id, mac, label){
      $scope.device = {id:id, mac:mac, label:label};
      ngDialog.open({
        template: 'app/servers/popup/deviceId.html',
        width: 420,
        scope: $scope,
        data: $scope.device,
        closeByDocument: false,
        controller: 'ServersListController'
      });
    }

    $scope.deviceIdFx = function(){
      $scope.hasErr = false;
      $scope.confirmObj = {id:$scope.device.id, mac:$scope.device.mac};
      if($scope.device.mac == ""){
        $scope.hasErr = true;
        $scope.errType = "form";
        return;
      } else{
        if($scope.device.mac){
          ServersSrv.updateMacId($scope.endpoint, $scope.confirmObj).then(
            function(data){
              if(data.code == 16007){
                $scope.hasErr = true;
                $scope.errType = "idInvalid";
              } else if(data.code == 16008){
                $scope.hasErr = true;
                $scope.errType = "idExists";
              } else if(data.status == "success"){
                ngDialog.close();
                $state.reload();
              }
            },
            function(err){
              $log.error(err);
            }
          );
        } else{
          ngDialog.close();
          $state.reload();
        }
      }
    }

    $scope.partnerReportsFx = function(){
      $scope.download = "";
      $scope.hasErr = false;
      $scope.errType = "";

      if(!$scope.reports.partner.id || $scope.reports.partner.id == ''){
        $scope.errType = "empty";
        $scope.hasErr = true;
        return;
      }
      $scope.saveProcessing = true;
      ServersSrv.generatePartnerReport($scope.endpoint, $scope.reports.partner.id).then(
        function(data){
          if(data.code == 16010){
            $scope.errType = "noData";
            $scope.hasErr = true;
          }
          else if(data.download){
            $scope.download = data.download;
          }
          $scope.saveProcessing = false;
        },
        function(err){
          $scope.saveProcessing = false;
          $log.error(err);
        }
      );
    }

    $scope.resetFx = function(){
      $scope.download = "";
    }

    // send password
    $scope.sendPassOpen = function(user){
      $scope.confirmObj = {user: user};
      $scope.resLoading = true;
      ServersSrv.verifySSO($rootScope.endpoint, $scope.confirmObj.user.id).then(
        function(data){
          // console.log("verify sso : ", data);
          $scope.resData = data;
          $scope.resLoading = false;
        },
        function(err){
          $log.error(err);
          $scope.resLoading = false;
        }
      );

      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <img src="assets/images/loading.gif" class="padT10" ng-if="resLoading">\
              <div ng-if="resData.sso==0 && !resLoading">\
                <div>{{"servers.msg.18" | translate}}<br>  <span class="text-bold ng-binding">{{confirmObj.user.email}}</span></div>\
              </div>\
              <div ng-if="resData.sso==1 && !resLoading">\
                <div>{{"servers.msg.19" | translate}}</div>\
                <div ng-if="!resLoading" class="table table-scroll bdrTd marT10">\
                  <div class="row th">\
                    <div class="col-xs-8">{{"servers.label.11" | translate}}</div>\
                    <div class="col-xs-4">{{"servers.label.12" | translate}}</div>\
                  </div>\
                  <div class="scrollQuad" ng-attr-style="max-height:{{getAvailableHeight(470)}}px">\
                    <div class="row" ng-repeat="s in resData.s">\
                      <div class="col-xs-8 word-break">{{s.label}}</div>\
                      <div class="col-xs-4 word-break">{{s.sso==1 ? \'Yes\': \'No\'}}</div>\
                    </div>\
                  </div>\
                </div>\
                <div class="marT15">{{"servers.msg.20" | translate}}</div>\
                <div class="row marT10 bg-warning msg-warning">\
                  <div class="col-xs-12">{{"servers.msg.21" | translate}}</div>\
                </div>\
              </div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-success" ng-click="sendPassFx();" ng-disabled="popupProcessing">{{"Send" | translate}}</button>\
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

    $scope.sendPassFx = function(){
      $scope.popupProcessing = true;
      ServersSrv.sendPassword($rootScope.endpoint, $scope.confirmObj.user.id).then(
        function(data){
          $scope.popupProcessing = false;
          ngDialog.close();
        },
        function(err){
          $log.error(err);
        }
      );
    }



    //VM section
    $scope.openUrlFx = function(w, h){
      $scope.saveProcessing = true;
      $scope.vm = {id: ""};
      ServersSrv.getVMUrl($scope.selectedServerId).then(
        function(data){
          $scope.saveProcessing = false;
          // $scope.gCalendar.isAuthorized = data.isAuthorized;
          $scope.rUrl = data.url;
          var left = (screen.width/2)-(w/2);
          var top = (screen.height/2)-(h/2);
          $scope.childWindow = window.open($scope.rUrl,'Authorize access to your account','toolbar=0,directories=no,status=0,width='+ w +',height='+ h +',top='+ top +', left='+ left);
          $scope.childWindowInt = $interval($scope.checkChild, 500);
        },
        function(err){
          $log.error(err);
          $scope.saveProcessing = false;
        }
      );
    }

    $scope.checkChild = function(){
      if($scope.childWindow.closed){
        $interval.cancel($scope.childWindowInt);
        ServersSrv.getVerify($scope.vm.id).then(
          function(data){
            $scope.hasErr = false;
            $scope.errType = "";
            if(data.code == 16014){
              $scope.hasErr = true;
              $scope.errType = "authFailed";
              $scope.authSuccess = false;
              $interval.cancel($scope.childWindowInt);
            } else{
              $scope.cList = data.calendarList;
              $scope.cListShow = true;
              if(data.isClosed){
                //$scope.gCalendar.isAuthorized = true;
                $scope.authSuccess = true;
              } else{
                $scope.hasErr = true;
                $scope.errType = "authFailed";
                $scope.authSuccess = false;
                $interval.cancel($scope.childWindowInt);
              }
            }
          },
          function(err){
            $log.error(err);
          }
        );
      }
    }

    $scope.vmRestartOpen = function(id){
      $scope.vmObj = {id: id};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div>{{"Are you sure you want to restart?" | translate}}</div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-primary" ng-click="vmRestartFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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

    $scope.vmRestartFx = function(){
      $scope.popupProcessing = true;
      ServersSrv.vmRestart($rootScope.endpoint, $scope.vmObj.id, $scope.selectedServerId).then(
        function(data){
          $scope.popupProcessing = false;
          // $scope.gCalendar.isAuthorized = data.isAuthorized;
          ngDialog.close();
        },
        function(err){
          $log.error(err);
          $scope.popupProcessing = false;
        }
      );
    }

    $scope.vmTurnOnOpen = function(id){
      $scope.vmObj = {id: id};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div>{{"Are you sure you want to turn on this VM?" | translate}}</div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-primary" ng-click="vmTurnOnFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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

    $scope.vmTurnOnFx = function(){
      $scope.popupProcessing = true;
      ServersSrv.vmTurnOn($rootScope.endpoint, $scope.vmObj.id, $scope.selectedServerId).then(
        function(data){
          $scope.popupProcessing = false;
          // $scope.gCalendar.isAuthorized = data.isAuthorized;
          ngDialog.close();
        },
        function(err){
          $log.error(err);
          $scope.popupProcessing = false;
        }
      );
    }

    // $scope.rebootOpen = function(){
    //   ngDialog.open({
    //     template: '\
    //       <section class="panel">\
    //         <div class="panel-body">\
    //           <div>{{"servers.msg.17" | translate}}</div>\
    //         </div>\
    //         <footer class="panel-footer">\
    //           <button type="button" class="btn btn-danger" ng-click="rebootFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
    //           <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
    //         </footer>\
    //       </section>',
    //     plain: true,
    //     width: 500,
    //     scope: $scope,
    //     closeByDocument: false,
    //     className: "ngdialog-theme-default ngdialog-confirm"
    //   });
    // }
  }
})();
