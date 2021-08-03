(function(){
  'use strict';

  angular
    .module('support')
    .controller('ServersController', ServersController);

  /** @ngInject */
  function ServersController($log, $rootScope, $scope, $state, $sce, $filter, $cookies, ngDialog, TicketSrv, ServersSrv){
    $rootScope.selectedMenu = 10;
    $rootScope.endpoint = "";
    $scope.auth = $cookies.getObject("supportAuth");
    $rootScope.search.show = false;

    $scope.curState = $state.current.name;
    $scope.pageLoading = false;
    $scope.index = 0;
    $scope.servers;

    $scope.serverNames;
    $scope.sn = {info:"", q:""};
    $scope.sl = {info:""};

    if($scope.curState == 'support.servers'){
      $rootScope.search.show = false;
    }

    $scope.getServers = function(){
      $scope.pageLoading = true;
      ServersSrv.getServers().then(
        function(data){
          $scope.pageLoading = false;
          $scope.servers = data;
          $scope.index = 0;

          $scope.loadServerInfo();
        },
        function(err){
          $scope.pageLoading = false;
          $log.error(err);
        }
      );
    }
    $scope.getServers();
    $scope.uiVersionFx();

    $scope.loadServerInfo = function(){
      ServersSrv.getServerInfo($scope.servers[$scope.index].url).then(
        function(data){
          $scope.servers[$scope.index].info = data;
          $scope.index++;
          if($scope.index < $scope.servers.length){
            $scope.loadServerInfo();
          }
        },
        function(err){
          $log.error(err);
          $scope.index++;
          if($scope.index < $scope.servers.length){
            $scope.loadServerInfo();
          }
        }
      );
    }

    $scope.loadServerList = function(endpoint, server, id, storage, tim){
      $cookies.putObject('endpoint', {"url":endpoint, "server":server, "id":id, "storage":storage, "tim":tim});
      $rootScope.endpoint = endpoint;
      $state.go("support.sList.s");
    }

    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
    });

    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from) {
      //assign the cur state for make it previous
      $cookies.putObject('preState', from.name);
    });

    //load serverNames
    $scope.loadServerNames = function(){
      $scope.listLoading = true;
      if($scope.sl.info){
        ServersSrv.getServerList($scope.sl.info.url, "", "").then(
          function(data){
            $scope.listLoading = false;
            $scope.serverNames = data;
          },
          function(err){
            $log.error(err);
          }
        );
      }
    }

    $scope.saveLSInformation = function(data){
      ServersSrv.saveLSInfo(data).then(
        function(data){
          console.log("info save", data);
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.allotLicenseFx = function(){
      $scope.popupProcessing = true;
      $scope.hasErr = false;
      if($scope.sl.info == "" || $scope.sl.info == null){
        $scope.errType = "sl";
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      } else if($scope.sn.info == null || $scope.sn.info.id == null || $scope.sn.info.id == ""){
        $scope.errType = "sn";
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      } else if($scope.sn.info.q == "" || $scope.sn.info.q == null){
        $scope.errType = "sQty";
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      } else {
        $scope.uInfo = {id:$scope.auth.id,fname:$scope.auth.fName,lname:$scope.auth.lName,email:$scope.auth.email,userType:$scope.auth.userType};
        $scope.obj = {id:$scope.sn.info.id, q:$scope.sn.info.q, createdBy:$scope.uInfo};
        ServersSrv.getAdminAccount().then(
          function(data){
            $scope.obj.adminAcc = data;
            ServersSrv.allotLicense($scope.sl.info.url, $scope.obj).then(
              function(data){
                $scope.popupProcessing = false;
                if(data.code == 16002){
                  $rootScope.toastNotificationFx("danger", data);
                } else {
                  $scope.lsInfo = {type:"l",q:data.server.q,serverId:$scope.sl.info.id,hub_serverId:data.server.id,hub_serverName:data.server.label};
                  $scope.saveLSInformation($scope.lsInfo);
                  $rootScope.toastNotificationFx("info", data);
                  $state.go('support.servers');
                }
              },
              function(err){
                $scope.popupProcessing = false;
                $rootScope.toastNotificationFx("danger", {"code":5000});
                $log.error(err);
              }
            );
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
    }
  }
})();
