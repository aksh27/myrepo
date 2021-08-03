(function(){
  'use strict';

  angular
    .module('support')
    .controller('IController', IController);

  /** @ngInject */
  function IController($log, $rootScope, $scope, $state, $sce, $filter, ngDialog, ISrv, $location){
    $rootScope.search = {show:($state.params.types ? false : true), text:"", adv:false};

    $scope.curState = $state.current.name;
    $rootScope.selectedMenu = 6;
    $scope.pageLoading = false;
    $scope.bucket = "";
    $scope.oList = {};
    $scope.iList = {};
    $scope.tim = "";

    $scope.getI = function(){
      $scope.pageLoading = true;
      if($scope.curState == 'support.i.d'){
        //make header column active
        if($scope.auth.sort.invd.type == 'sn'){
          $scope.activeColumnFx('sn');
        } else if($scope.auth.sort.invd.type == 'm'){
          $scope.activeColumnFx('model');
        } else if($scope.auth.sort.invd.type == 'c'){
          $scope.activeColumnFx('cost');
        }
        ISrv.getDeviceList().then(
          function(data){
            $rootScope.search.text = "";
            $scope.iList = data;
            $scope.pageLoading = false;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      } else if($scope.curState == 'support.i.o'){
        //make header column active
        if($scope.auth.sort.invo.type == 'n'){
          $scope.activeColumnFx('type');
        } else if($scope.auth.sort.invo.type == 'm'){
          $scope.activeColumnFx('model');
        } else if($scope.auth.sort.invo.type == 'c'){
          $scope.activeColumnFx('cost');
        }
        ISrv.getOtherList().then(
          function(data){
            $rootScope.search.text = "";
            $scope.oList = data;
            $scope.pageLoading = false;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      } else if($scope.curState == 'support.i.t'){
        $scope.typeObj = {opt:"t", type:"", model:""};
        ISrv.getITypes().then(
          function(data){
            $rootScope.search.text = "";
            $scope.oList = data;
            $scope.pageLoading = false;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      } else if($scope.curState == 'support.i.m'){
        //make header column active
        if($scope.auth.sort.invm.type == 't'){
          $scope.activeColumnFx('type');
        } else if($scope.auth.sort.invm.type == 'l'){
          $scope.activeColumnFx('model');
        }
        $scope.modelObj = {opt:"m", type:"", model:""};
        ISrv.getIModels().then(
          function(data){
            $rootScope.search.text = "";
            $scope.oList = data;
            $scope.pageLoading = false;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $scope.getI();
    $scope.uiVersionFx();


    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
    });

    // $scope.addOpen = function(caller, id, title, url){
    //   console.warn($location.host());

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

    $scope.deleteOpen = function(caller, id){
      $scope.confirmObj = {caller:caller, id:id};
      $scope.verifyData = {};
      if(caller == 'o'){
        //verify other before delete
        ISrv.verifyOther($scope.confirmObj.id).then(
          function(data){
            $scope.verifyData = data;
            $scope.openDeleteDialog();
            $scope.pageLoading = false;
          },
          function(err){
            $log.error(err);
            $scope.pageLoading = false;
          }
        );
      } else {
        $scope.openDeleteDialog();
      }
    }

    $scope.openDeleteDialog = function(){
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div ng-if="confirmObj.caller == \'i\'">{{"i.msg.9" | translate}}</div>\
              <div ng-if="confirmObj.caller == \'t\'">{{"i.msg.36" | translate}}</div>\
              <div ng-if="confirmObj.caller == \'m\'">{{"i.msg.37" | translate}}</div>\
              <div ng-if="confirmObj.caller == \'o\' && verifyData.code == 12007"><span translate="{{\'i.msg.27\'}}" translate-values="{odId: verifyData.orderId}"></span></div>\
              <div ng-if="confirmObj.caller == \'o\' && (verifyData.code == 12008 || verifyData.code == 12009)">{{"i.msg.10" | translate}}</div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" ng-if="verifyData.code == 12008 || verifyData.code == 12009 || confirmObj.caller == \'i\' || confirmObj.caller == \'t\' || confirmObj.caller == \'m\'" class="btn btn-danger" ng-click="deleteOpenFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
              <button type="button" ng-if="confirmObj.caller == \'o\' && verifyData.code == 12007" class="btn btn-default" ng-click="closeThisDialog();">{{"cm.btn.1" | translate}}</button>\
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

    $scope.deleteOpenFx = function(){
      $scope.popupProcessing = true;
      ISrv.deleteOpen($scope.confirmObj).then(
        function(data){
          $scope.popupProcessing = false;
          ngDialog.close();
          if(data.code===12019){
            $scope.existModels = data.models;
            ngDialog.open({
              template: '\
                <section class="panel">\
                  <div class="panel-body">\
                    <span>{{"i.msg.38" | translate}}</span>\
                    <div class="scrollQuad bdrTd marT10 table table-sm no-th no-pointer" style="max-height:{{getAvailableHeight(510)}}px">\
                      <div class="row" ng-repeat="model in existModels">\
                        <div class="col-xs-12"><div>{{model.label}}</div>\</div>\
                      </div>\
                    </div>\
                  </div>\
                  <footer class="panel-footer">\
                    <button type="button" class="btn btn-default" ng-click="closeThisDialog();">{{"cm.btn.1" | translate}}</button>\
                  </footer>\
                </section>',
              plain: true,
              width: 500,
              scope: $scope,
              closeByDocument: false,
              className: "ngdialog-theme-default ngdialog-confirm"
            });
          } else if(data.code===12018){
            $scope.existType = data.oId;
            ngDialog.open({
              template: '\
                <section class="panel">\
                  <div class="panel-body">\
                    <span>{{"i.msg.39" | translate}}</span>\
                    <div class="scrollQuad bdrTd marT10 table table-sm no-th no-pointer" style="max-height:{{getAvailableHeight(510)}}px">\
                      <div class="row" ng-repeat="oId in existType">\
                        <div class="col-xs-12"><div>{{oId}}</div>\</div>\
                      </div>\
                    </div>\
                  </div>\
                  <footer class="panel-footer">\
                    <button type="button" class="btn btn-default" ng-click="closeThisDialog();">{{"cm.btn.1" | translate}}</button>\
                  </footer>\
                </section>',
              plain: true,
              width: 500,
              scope: $scope,
              closeByDocument: false,
              className: "ngdialog-theme-default ngdialog-confirm"
            });
          } else if(data.code===12021){
            $scope.existModel = data.oId;
            ngDialog.open({
              template: '\
                <section class="panel">\
                  <div class="panel-body">\
                    <span>{{"i.msg.40" | translate}}</span>\
                    <div class="scrollQuad bdrTd marT10 table table-sm no-th no-pointer" style="max-height:{{getAvailableHeight(510)}}px">\
                      <div class="row" ng-repeat="oId in existModel">\
                        <div class="col-xs-12"><div>{{oId}}</div>\</div>\
                      </div>\
                    </div>\
                  </div>\
                  <footer class="panel-footer">\
                    <button type="button" class="btn btn-default" ng-click="closeThisDialog();">{{"cm.btn.1" | translate}}</button>\
                  </footer>\
                </section>',
              plain: true,
              width: 500,
              scope: $scope,
              closeByDocument: false,
              className: "ngdialog-theme-default ngdialog-confirm"
            });
          } else {
            $state.reload();
          }
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }

    $scope.typeOpen = function(obj){
      $scope.hasErrPop = false;
      if(obj){
        $scope.typeObj = {id:obj.id, type:obj.label, model:""};
      } else {
        $scope.typeObj = {opt:"t", type:"", model:""};
      }
      ngDialog.open({
        template:'app/inventory/popup/addType.html',
        width: 670,
        scope: $scope,
        controller: "IcuController",
        closeByDocument: false
      });
    }

    $scope.addTypeFx = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      if(!$scope.typeObj.type || $scope.typeObj.type == ""){
        $scope.hasErrPop = true;
        $scope.errType = "eType";
      }
      else {
        $scope.popupProcessing = true;
        ISrv.addIType($scope.typeObj).then(
          function(data){
            if(data.code==12011){
              $scope.hasErrPop = true;
              $scope.errType = "sType";
              $scope.popupProcessing = false;
            } else if(data.code==12014){
              $scope.hasErrPop = true;
              $scope.errType = "sModel";
              $scope.popupProcessing = false;
            } else {
              // refresh select option list
              $state.go($state.current, {}, {reload: true});
              $scope.popupProcessing = false;
              ngDialog.close();
              $scope.resetTypeModelFx();
            }
          }
        ),
        function(err){
          $log.error(err);
          $scope.popupProcessing = false;
        }
      }
    }

    $scope.modelOpen = function(obj){
      $scope.hasErrPop = false;
      if(obj){
        $scope.modelObj = {id:obj.id, opt:"m", type: {id:obj.typeId, label:obj.typeLabel}, model:obj.label};
      } else {
        $scope.modelObj = {opt:"m", type:"", model:""};
      }
      ngDialog.open({
        template:'app/inventory/popup/addModel.html',
        width: 670,
        scope: $scope,
        controller: "IcuController",
        closeByDocument: false
      });
    }

    $scope.addModelFx = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      if(((!$scope.modelObj.type || $scope.modelObj.type == "") && !$scope.modelObj.id)){
        $scope.hasErrPop = true;
        $scope.errType = "eType";
      } else if($scope.modelObj.opt=="m" && $scope.modelObj.model == ""){
        $scope.hasErrPop = true;
        $scope.errType = "eModel";
      } else {
        $scope.popupProcessing = true;
        ISrv.addIModel($scope.modelObj).then(
          function(data){
            if(data.code==12011){
              $scope.hasErrPop = true;
              $scope.errType = "sType";
              $scope.popupProcessing = false;
            } else if(data.code==12014){
              $scope.hasErrPop = true;
              $scope.errType = "sModel";
              $scope.popupProcessing = false;
            } else {
              // refresh select option list
              $state.go($state.current, {}, {reload: true});
              $scope.popupProcessing = false;
              ngDialog.close();
              $scope.resetTypeModelFx();
            }
          }
        ),
        function(err){
          $log.error(err);
          $scope.popupProcessing = false;
        }
      }
    }

    $scope.resetTypeModelFx = function(){
      $scope.typeObj = {opt:"t", type:"", model:""};
      $scope.modelObj = {opt:"m", type:"", model:""};
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
  }
})();
