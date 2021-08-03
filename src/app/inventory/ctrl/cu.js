(function(){
  'use strict';

  angular
    .module('support')
    .controller('IcuController', IcuController);

  /** @ngInject */
  function IcuController($log, $rootScope, $scope, $window, $state, $location, $filter, ngDialog, ISrv){
    $rootScope.search = {show:(!$state.params.types ? true : false), text:"", adv:false};
    $scope.pageLoading = true;

    $scope.inventory = {sn:"", type:{id:"", label:""}, model:{id:"", label:""}, fccId:"", icId:"", cost:"", qty: "", desc:"", otherInfo:[]};
    $scope.otherArr = [{ id: "tmp-"+$scope.count, key: "", value: "" }];
    $scope.curTab = $state.params.types;
    $scope.isDisabled = true;
    $scope.content = false;
    $scope.itemMode = "c";
    $scope.bucket = "";
    $scope.encId = "";
    $scope.decId = "";
    $scope.count = 1;
    $scope.tim = "";

    $scope.uiVersionFx();

    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
    });

    // $scope.addOpen = function(caller, id, title, url){
    //   $scope.popupProcessing = false;
    //   $scope.hasErrPop = false;
    //   $scope.errType = "";
    //   $scope.curFiles = {};
    //   if($scope.curState === 'support.kb.a'){
    //     $scope.add = {title:""};
    //     $scope.addObj = {caller:"a", id:id};
    //     if(id){
    //       $scope.add = {id:id, title:title, url:url};
    //       $scope.curFiles.name = url;
    //     }
    //   }
    //   else if($scope.curState === 'support.kb.v'){
    //     $scope.add = {title:"", titleOpt:"a", url:""};
    //     $scope.addObj = {caller:"v", id:id};
    //     if(id){
    //       $scope.add = {id:id, title:title, url:url, titleOpt:"c"};
    //     }
    //   }
    //   ngDialog.open({
    //     template: 'app/knowledgeBase/popup/add.html',
    //     width: 600,
    //     scope: $scope,
    //     data: $scope.addObj,
    //     closeByDocument: false
    //   });
    // }

    // $scope.addFx = function(){
    //   $scope.hasErrPop = false;
    //   $scope.errType = "";
    //   // console.warn($scope.curFiles);
    //   if($scope.addObj.caller === "a"){
    //     if($scope.add.title == ""){
    //       $scope.hasErrPop = true;
    //       $scope.errType = "title";
    //     }
    //     else if(!$scope.addObj.id && !$scope.curFiles.name){
    //       $scope.hasErrPop = true;
    //       $scope.errType = "file";
    //     }
    //     else{
    //       $scope.popupProcessing = true;
    //       FileModelUploadSrv.uploadFileAndData("kb/a", $scope.add, $scope.curFiles).then(
    //         function(data){
    //           $scope.popupProcessing = false;
    //           if(data.code == 3039){
    //             $scope.hasErrPop = true;
    //             $scope.errType = "fileEmpty";
    //           }
    //           else if(data.code == 3040){
    //             $scope.hasErrPop = true;
    //             $scope.errType = "invalide";
    //           }
    //           else if(data.code == 3044){
    //             $scope.hasErrPop = true;
    //             $scope.errType = "alreadyA";
    //           }
    //           else if(data.code == 3038 || data.code == 3050){
    //             $scope.curFiles = {};
    //             $rootScope.toastNotificationFx("info", data);
    //             ngDialog.close();
    //           }
    //         },
    //         function(err){
    //           $log.error(err);
    //           $rootScope.toastNotificationFx("danger", {"code":5000});
    //           $scope.popupProcessing = false;
    //         }
    //       );
    //     }
    //   }
    //   else if($scope.addObj.caller === "v"){
    //     if($scope.add.titleOpt === "c" && $scope.add.title == ""){
    //       $scope.hasErrPop = true;
    //       $scope.errType = "title";
    //     } else if($scope.add.url == ""){
    //       $scope.hasErrPop = true;
    //       $scope.errType = "url";
    //     }
    //     else{
    //       $scope.popupProcessing = true;
    //       KBSrv.saveVideo($scope.add).then(
    //         function(data){
    //           $scope.popupProcessing = false;
    //           //video already exist with videoId - 3052
    //           // video already exist with title - 3045
    //           if(data.code == 3043){
    //             $scope.hasErrPop = true;
    //             $scope.errType = "invalideUrl";
    //           }
    //           else if(data.code == "df"){
    //             $scope.hasErrPop = true;
    //             $scope.errType = "alreadyVN";
    //           }
    //           else if(data.code == 3052){
    //             $scope.hasErrPop = true;
    //             $scope.errType = "alreadyVI";
    //           }
    //           else if(data.code == 3045){
    //             $scope.hasErrPop = true;
    //             $scope.errType = "alreadyVT";
    //           }
    //           else if(data.code == 3042 || data.code == 3051){
    //             ngDialog.close();
    //           }
    //         },
    //         function(err){
    //           $scope.popupProcessing = false;
    //           $log.error(err);
    //         }
    //       );
    //     }
    //   }
    // }

    // $scope.sendKb = function(type, label, url){
    //   $scope.popupProcessing = false;
    //   $scope.hasErrPop = false;
    //   $scope.errType = "";
    //   // $scope.send = {type:type, label:label, url:"https://s3-us-west-2.amazonaws.com/lsquared-hub/support/downloads/doc/" + url, file:url, subject:label, msg:"", email:""};
    //   $scope.send = {type:type, label:label, url:url, file:url, subject:label, msg:"", email:""};
    //   if(type == "a"){
    //     $scope.send.msg = $filter("translate")('kb.msg.3');
    //   }
    //   else if(type == "v"){
    //     $scope.send.msg = $filter("translate")('kb.msg.4',{url:$scope.videoEmbed + url + $scope.videoParam});
    //   }
    //   ngDialog.open({
    //     template: 'app/knowledgeBase/popup/send.html',
    //     width: 820,
    //     scope: $scope,
    //     closeByDocument: false
    //   });
    // }
    // $scope.sendFx = function(caller){
    //   $scope.hasErrPop = false;
    //   $scope.errType = "";
    //   if($scope.send.email == "" || $scope.send.subject == "" || $scope.send.msg == ""){
    //     $scope.hasErrPop = true;
    //     $scope.errType = "empty";
    //   } else if(!$scope.send.email){
    //     $scope.hasErrPop = true;
    //     $scope.errType = "email";
    //   } else{
    //     $scope.popupProcessing = true;
    //     $scope.send.email = $scope.send.email.replace(/'/g, "");
    //     KBSrv.send($scope.send).then(
    //       function(data){
    //         $scope.popupProcessing = false;
    //         if(data.code == 3022){
    //           $rootScope.toastNotificationFx("info", data, $scope.send.email);
    //           ngDialog.close();
    //         }
    //       },
    //       function(err){
    //         $scope.popupProcessing = false;
    //         $log.error(err);
    //       }
    //     );
    //   }
    // }

    $scope.deleteOthOpen = function(index){
      $scope.confirmOthObj = {index:index};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">{{"i.msg.10" | translate}}</div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-danger" ng-click="deleteOthFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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
    $scope.deleteOthFx = function(){
      $scope.popupProcessing = false;
      $scope.otherArr.splice($scope.confirmOthObj.index, 1);
      ngDialog.close();
    }

    // $scope.keyFx = function(caller){
    //   $scope.licenseKey = $scope.keyObj.key[caller].key;
    // }
    // $scope.publisherOpen = function(){
    //   $scope.popupOpen = true;
    //   KBSrv.getKey().then(
    //     function(data){
    //       $scope.keyObj = {type:"hub", key:data};
    //       $scope.licenseKey = $scope.keyObj.key[0].key;
    //       ngDialog.open({
    //         template: 'app/knowledgeBase/popup/publisher.html',
    //         width: 500,
    //         scope: $scope,
    //         trapFocus: false,
    //         closeByDocument: false
    //       });
    //       $scope.popupOpen = false;
    //     },
    //     function(err){
    //       $scope.popupOpen = false;
    //       $log.error(err);
    //     }
    //   );
    // }

    //get type list
    $scope.getAllTypes = function(){
      // console.warn("getAllTypes", $scope.curType);
      $scope.pageLoading = true;
      ISrv.getTypeList($scope.curType).then(
        function(data){
          if($scope.decId){
            $scope.selectedType();
          } else {
            $scope.inventory.sn = data.info.sn;
          }
          // console.warn("DATAAA : ", data);
          $scope.items = data.types;
          $scope.pageLoading = false;
        },
        function(err){
          $log.error(err);
        }
      );
    }

    // $scope.curType = "";
    $scope.curType = $state.params.types;

    if($state.params.id){
      $scope.decId = $scope.hubDecrypt($state.params.id);
      $scope.encId = $state.params.id;
      $scope.itemMode = "u";
      // console.warn("Cur State ", $scope.curState);
      // console.warn("State lab ", $scope.curType);

      //get type detail
      ISrv.getTypeDetail($scope.curType, $scope.decId).then(
        function(data){
          // console.warn("DATA Details: ", data);
          $scope.inventory = data;
          $scope.inventoryName = angular.copy($scope.inventory.sn);
          if(data.otherInfo.length > 0){
            $scope.otherArr = data.otherInfo;
          }
          $scope.getAllTypes();
        },
        function(err){
          $log.error(err);
        }
      );
    } else {
      $scope.getAllTypes();
    }

    //select type
    $scope.selectedType = function(){
      $scope.isDisabled = true;
      // console.warn("IDD ", $scope.inventory);
      // get model list
      ISrv.getModelList($scope.inventory.type.id).then(
        function(data){
          // console.warn("Model List", data);
          $scope.modelList = data;
          $scope.isDisabled = false;
        }
      ),
      function(err){
        $log.error(err);
      }
    }

    $scope.addMore = function(){
      $scope.count++;
      $scope.otherArr.push({id: "tmp-"+$scope.count, key: "", value: "" });
    }

    $scope.addInventoryFx = function(){
      $scope.popupProcessing = true;
      $scope.hasErr = false;
      if($scope.inventory.sn == ""){
        $scope.errType = 'sn';
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      } else if($scope.inventory.type == null || ($scope.inventory.type != null && $scope.inventory.type.label == '')){
        $scope.errType = 'type';
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      } else if($scope.modelList.length > 0 && ($scope.inventory.model == null || ($scope.inventory.model != null && $scope.inventory.model.label == ''))){
        $scope.errType = 'model';
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      }
      // else if($scope.modelList.length > 0 && $scope.inventory.type.id == 1 && ($scope.inventory.fccId == '' || $scope.inventory.fccId == null)){
      //   $scope.errType = 'fcc';
      //   $scope.hasErr = true;
      // }
      // else if($scope.modelList.length > 0 && $scope.inventory.type.id == 1 && ($scope.inventory.icId == '' || $scope.inventory.icId == null)){
      //   $scope.errType = 'ic';
      //   $scope.hasErr = true;
      // }
      // else if($scope.inventory.desc == '' || $scope.inventory.desc == null){
      //   $scope.errType = 'desc';
      //   $scope.hasErr = true;
      // }
      // else if($scope.inventory.cost == '' || $scope.inventory.cost == null){
      //   $scope.errType = 'cost';
      //   $scope.hasErr = true;
      // }
      else if($scope.curTab == 'others' && ($scope.inventory.qty == '' || $scope.inventory.qty == null)){
        $scope.errType = 'qty';
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      } else {
        if($scope.decId){
          $scope.inventory['id'] = $scope.decId;
        }
        $scope.inventory.otherInfo = $scope.otherArr;
        if($scope.curTab == 'others'){
          delete $scope.inventory.sn;
        }

        ISrv.addInventory($scope.inventory).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code == '12010'){
              $scope.errType = 'snExist';
              $scope.hasErr = true;
              var element = $window.document.getElementById('sn');
              if(element){
                element.focus();
              }
            } else {
              $rootScope.toastNotificationFx("info", data);
              if($scope.curTab == 'others'){
                $state.go('support.i.o');
              } else {
                $state.go('support.i.d');
              }
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $rootScope.toastNotificationFx("danger", {"code":5000});
            $log.error(err);
          }
        );
      }
    }
  }
})();
