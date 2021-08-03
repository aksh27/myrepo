(function(){
    'use strict';

    angular
      .module('support')
      .controller('ServerCUController', ServerCUController);

    /** @ngInject */
    function ServerCUController($log, $rootScope, $scope, $state, $cookies, ServersSrv){
      $rootScope.selectedMenu = 10;
      $rootScope.search.show = false;

      $scope.curState = $state.current.name;
      $scope.sl = {info:""};
      $scope.server = {label:"",q:"",address:"",city:"",province:"",country:"",zip:"",phone:"",email:"",paPhone:"",isSendMail:0,createdBy:"",adminAcc:""};

      $scope.auth = $cookies.getObject("supportAuth");
      $scope.preState = $cookies.getObject("preState");

      if($scope.preState == 'support.sList.s' || $scope.preState == 'support.sList.d' || $scope.preState == 'support.sList.u' || $scope.preState == 'support.sList.l'){
        $scope.selectedServerId = $cookies.getObject("endpoint").id;
        $scope.endpoint = $cookies.getObject("endpoint").url;
        $scope.sl.info = {id:$scope.selectedServerId, url:$scope.endpoint};
      }

      $scope.getServers = function(){
        ServersSrv.getServers().then(
          function(data){
            console.log(data);
            $scope.servers = data;
          },
          function(err){
            $log.error(err);
          }
        );
      }
      $scope.getServers();

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

      $scope.createServerFx = function(){
        $scope.popupProcessing = true;
        $scope.hasErr = false;
        if($scope.server.label == null || $scope.server.label == ""){
          $scope.errType = "name";
          $scope.hasErr = true;
          $scope.popupProcessing = false;
        } else if($scope.sl.info == null || $scope.sl.info == ""){
          $scope.errType = "sl";
          $scope.hasErr = true;
          $scope.popupProcessing = false;
        } else if($scope.server.email != "" && (!$scope.server.email || $scope.server.email == "" || $scope.server.email === undefined)){
          $scope.errType = "email";
          $scope.hasErr = true;
          $scope.popupProcessing = false;
        } else if($scope.server.q == '' || $scope.server.q == null){
          $scope.errType = "lQty";
          $scope.hasErr = true;
          $scope.popupProcessing = false;
        } else {
          $scope.uInfo = {id:$scope.auth.id,fname:$scope.auth.fName,lname:$scope.auth.lName,email:$scope.auth.email,userType:$scope.auth.userType};
          $scope.server.createdBy = $scope.uInfo;
          ServersSrv.getAdminAccount().then(
            function(data){
              $scope.server.adminAcc = data;
              ServersSrv.createServer($scope.sl.info.url, $scope.server).then(
                function(data){
                  $scope.popupProcessing = false;
                  if(data.code == 16004 || data.code == 16006){
                    $rootScope.toastNotificationFx("danger", data);
                  } else {
                    //lsInfo - license server info
                    $scope.lsInfo = {type:"s",q:data.server.q,serverId:$scope.sl.info.id,hub_serverId:data.server.id,hub_serverName:data.server.label};
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

      $scope.getPhoneNumber = function(){
        if($scope.server.email != "" && $scope.sl.info){
          ServersSrv.getPAPhoneNo($scope.sl.info.url, $scope.server.email).then(
            function(data){
              $scope.server.paPhone = data.phone;
            },
            function(err){
              $log.error(err);
            }
          );
        } else if($scope.server.email == "" && $scope.sl.info){
          $scope.server.paPhone = "";
        }
      }
    }
  })();
