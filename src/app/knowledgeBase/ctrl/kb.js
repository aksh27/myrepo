(function(){
  'use strict';

  angular
    .module('support')
    .controller('KBController', KBController);

  /** @ngInject */
  function KBController($log, $rootScope, $scope, $state, $sce, $filter, ngDialog, FileModelUploadSrv, KBSrv){
    $rootScope.search = {show:true, text:"", adv:false};
    $rootScope.selectedMenu = 3;

    $scope.curState = $state.current.name;
    $scope.pageLoading = false;
    $scope.curGrpArticle;

    // $scope.vidKbList = [
    //   {id:1, duration:"2:36", vidId:"b4EGyNR_M3c", label:$filter("translate")('kb.video.1')},
    //   {id:2, duration:"4:35", vidId:"jrIQJ_g040I", label:$filter("translate")('kb.video.2')},
    //   {id:3, duration:"3:08", vidId:"Nstd41qBxCU", label:$filter("translate")('kb.video.3')},
    //   {id:4, duration:"1:17", vidId:"fg72yebz2i0", label:$filter("translate")('kb.video.4')},
    //   {id:5, duration:"3:25", vidId:"vjDmpaQTh-s", label:$filter("translate")('kb.video.5')},
    //   {id:6, duration:"9:57", vidId:"GkKrCYDGItw", label:$filter("translate")('kb.video.6')},
    //   {id:7, duration:"2:13", vidId:"ntkmLB5zueQ", label:$filter("translate")('kb.video.7')},
    //   {id:8, duration:"10:53", vidId:"zICBipz50uM", label:$filter("translate")('kb.video.8')},
    //   {id:9, duration:"7:50", vidId:"XYbidk9jWYM", label:$filter("translate")('kb.video.9')},
    //   {id:10, duration:"5:56", vidId:"CRJUIjgmBYo", label:$filter("translate")('kb.video.10')},
    //   {id:11, duration:"3:58", vidId:"3Mx744dKl50", label:$filter("translate")('kb.video.11')}
    // ];
    // $scope.articleKbList = [
    //   {id:1, url:"LSquaredHub-UserGuide-V2-en.pdf", label:$filter("translate")('kb.article.1')},
    //   {id:2, url:"LSquaredHub-UserGuide-V2-fr.pdf", label:$filter("translate")('kb.article.2')},
    //   {id:3, url:"FirewallPortSettings.pdf", label:$filter("translate")('kb.article.3')},
    //   {id:4, url:"FirstTimeSetup.pdf", label:$filter("translate")('kb.article.4')},
    //   {id:5, url:"UserSettings-Timezone.pdf", label:$filter("translate")('kb.article.5')},
    //   {id:6, url:"PasswordExpiry.pdf", label:$filter("translate")('kb.article.6')},
    //   {id:7, url:"PortsSettings.pdf", label:$filter("translate")('kb.article.7')},
    //   {id:8, url:"WSUS-Settings.pdf", label:$filter("translate")('kb.article.8')},
    //   {id:9, url:"DisableWindowsReporting.pdf", label:$filter("translate")('kb.article.9')},
    //   {id:10, url:"LifeLabs-DNS-Settings.pdf", label:$filter("translate")('kb.article.10')},
    //   {id:11, url:"TeamViewerPopupSettings.pdf", label:$filter("translate")('kb.article.11')},
    //   {id:12, url:"Certificate-Validation-Settings-for-YouTube.pdf", label:$filter("translate")('kb.article.12')},
    //   {id:13, url:"Uplift-user-permission.pdf", label:$filter("translate")('kb.article.13')}
    // ];
    $scope.downloadList = [
      {id:1, url:"LSquaredHDMI.zip", label:$filter("translate")('kb.download.1'), type:"d"},
      {id:2, url:"LSquaredSlide.zip", label:$filter("translate")('kb.download.2'), type:"d"},
      {id:3, url:"", label:$filter("translate")('kb.download.3'), type:"p"}
    ];

    $scope.kbList = {};
    $scope.bucket = "";
    $scope.tim = "";

    $scope.getKB = function(){
      $scope.pageLoading = true;
      var caller;
      if($scope.curState === "support.kb.v"){
        caller = "v";
      } else if($scope.curState === "support.kb.a"){
        caller = "a";
      }
      if(caller){
        KBSrv.getList(caller).then(
          function(data){
            $scope.pageLoading = false;
            $rootScope.search.text = "";
            if(caller === "v"){
              $scope.vidKbList = data;
            } else if(caller === "a"){
              $scope.articleKbList = data;
            }
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $scope.getKB();
    $scope.uiVersionFx();

    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
      $scope.getKB();
    });

    $scope.videoFx = function(id, vidId, vidLabel){
      $scope.videoObj = {};
      $scope.videoObj.id = id;
      $scope.videoObj.label = vidLabel;
      $scope.videoObj.url = $sce.trustAsResourceUrl($scope.videoEmbed + vidId + $scope.videoParam);

      ngDialog.open({
        template: 'app/knowledgeBase/popup/video.html',
        width: 820,
        scope: $scope,
        data: $scope.videoObj,
        closeByDocument: false
      });
    }

    $rootScope.fileModelUploadFx = function(data){
      $scope.curFiles = data;
    }

    $scope.addOpen = function(caller, id, title, url, group){
      $scope.popupProcessing = false;
      $scope.hasErrPop = false;
      $scope.errType = "";
      $scope.curFiles = {};
      if($scope.curState === 'support.kb.a'){
        $scope.add = {title:"", group:""};
        $scope.addObj = {caller:"a", id:id};
        if(id){
          $scope.add = {id:id, title:title, url:url, group:group};
          $scope.curFiles.name = url;
        }
        $scope.popupProcessing = true;
        KBSrv.getGroups().then(
          function(data){
            $scope.popupProcessing = false;
            $scope.groups = data;
          },
          function(err){
            $log.error(err);
            $rootScope.toastNotificationFx("danger", {"code":5000});
            $scope.popupProcessing = false;
          }
        );
      }
      else if($scope.curState === 'support.kb.v'){
        $scope.add = {title:"", titleOpt:"a", url:""};
        $scope.addObj = {caller:"v", id:id};
        if(id){
          $scope.add = {id:id, title:title, url:url, titleOpt:"c"};
        }
      }
      ngDialog.open({
        template: 'app/knowledgeBase/popup/add.html',
        width: 640,
        scope: $scope,
        data: $scope.addObj,
        closeByDocument: false
      });
    }

    $scope.addFx = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      if($scope.addObj.caller === "a"){
        if($scope.add.title == ""){
          $scope.hasErrPop = true;
          $scope.errType = "title";
        }
        else if(!$scope.addObj.id && !$scope.curFiles.name){
          $scope.hasErrPop = true;
          $scope.errType = "file";
        }
        else{
          $scope.popupProcessing = true;
          FileModelUploadSrv.uploadFileAndData("kb/a", $scope.add, $scope.curFiles).then(
            function(data){
              $scope.popupProcessing = false;
              if(data.code == 3039){
                $scope.hasErrPop = true;
                $scope.errType = "fileEmpty";
              }
              else if(data.code == 3040){
                $scope.hasErrPop = true;
                $scope.errType = "invalide";
              }
              else if(data.code == 3044){
                $scope.hasErrPop = true;
                $scope.errType = "alreadyA";
              }
              else if(data.code == 3038 || data.code == 3050){
                $scope.curFiles = {};
                $rootScope.toastNotificationFx("info", data);
                ngDialog.close();
                $scope.getKB();
              }
            },
            function(err){
              $log.error(err);
              $rootScope.toastNotificationFx("danger", {"code":5000});
              $scope.popupProcessing = false;
            }
          );
        }
      }
      else if($scope.addObj.caller === "v"){
        if($scope.add.titleOpt === "c" && $scope.add.title == ""){
          $scope.hasErrPop = true;
          $scope.errType = "title";
        } else if($scope.add.url == ""){
          $scope.hasErrPop = true;
          $scope.errType = "url";
        }
        else{
          $scope.popupProcessing = true;
          KBSrv.saveVideo($scope.add).then(
            function(data){
              $scope.popupProcessing = false;
              //video already exist with videoId - 3052
              // video already exist with title - 3045
              if(data.code == 3043){
                $scope.hasErrPop = true;
                $scope.errType = "invalideUrl";
              }
              else if(data.code == "df"){
                $scope.hasErrPop = true;
                $scope.errType = "alreadyVN";
              }
              else if(data.code == 3052){
                $scope.hasErrPop = true;
                $scope.errType = "alreadyVI";
              }
              else if(data.code == 3045){
                $scope.hasErrPop = true;
                $scope.errType = "alreadyVT";
              }
              else if(data.code == 3042 || data.code == 3051){
                ngDialog.close();
                $scope.getKB();
              }
            },
            function(err){
              $scope.popupProcessing = false;
              $log.error(err);
            }
          );
        }
      }
    }

    $scope.sendKb = function(type, label, url){
      $scope.popupProcessing = false;
      $scope.hasErrPop = false;
      $scope.errType = "";
      // $scope.send = {type:type, label:label, url:"https://s3-us-west-2.amazonaws.com/lsquared-hub/support/downloads/doc/" + url, file:url, subject:label, msg:"", email:""};
      $scope.send = {type:type, label:label, url:url, file:url, subject:label, msg:"", email:""};
      if(type == "a"){
        $scope.send.msg = $filter("translate")('kb.msg.3');
      }
      else if(type == "v"){
        $scope.send.msg = $filter("translate")('kb.msg.4',{url:$scope.videoEmbed + url + $scope.videoParam});
      }
      ngDialog.open({
        template: 'app/knowledgeBase/popup/send.html',
        width: 820,
        scope: $scope,
        closeByDocument: false
      });
    }
    $scope.sendFx = function(caller){
      $scope.hasErrPop = false;
      $scope.errType = "";
      if($scope.send.email == "" || $scope.send.subject == "" || $scope.send.msg == ""){
        $scope.hasErrPop = true;
        $scope.errType = "empty";
      } else if(!$scope.send.email){
        $scope.hasErrPop = true;
        $scope.errType = "email";
      } else{
        $scope.popupProcessing = true;
        $scope.send.email = $scope.send.email.replace(/'/g, "");
        KBSrv.send($scope.send).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code == 3022){
              $rootScope.toastNotificationFx("info", data, $scope.send.email);
              ngDialog.close();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
    }

    $scope.deleteOpen = function(caller, id){
      $scope.confirmObj = {caller:caller, id:id};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div ng-if="confirmObj.caller == \'a\'">{{"kb.msg.13" | translate}}</div>\
              <div ng-if="confirmObj.caller == \'v\'">{{"kb.msg.14" | translate}}</div>\
              <div ng-if="confirmObj.caller == \'g\'"><p>{{"kb.msg.18" | translate}}</p> <b class="ng-binding">Note:</b> Articles associated with this group will not be deleted, you will have to delete them separately.</span></div>\
            </div>\
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
      if($scope.confirmObj.caller == "g"){
        KBSrv.deleteGroup($scope.confirmObj.id).then(
          function(data){
            $scope.popupProcessing = false;
            ngDialog.close();
            $scope.getKB();
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      } else {
        KBSrv.deleteAV($scope.confirmObj).then(
          function(data){
            $scope.popupProcessing = false;
            ngDialog.close();
            $scope.getKB();
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
    }

    $scope.keyFx = function(caller){
      $scope.licenseKey = $scope.keyObj.key[caller].key;
    }
    $scope.publisherOpen = function(){
      $scope.popupOpen = true;
      KBSrv.getKey().then(
        function(data){
          $scope.keyObj = {type:"hub", key:data};
          $scope.licenseKey = $scope.keyObj.key[0].key;
          ngDialog.open({
            template: 'app/knowledgeBase/popup/publisher.html',
            width: 500,
            scope: $scope,
            trapFocus: false,
            closeByDocument: false
          });
          $scope.popupOpen = false;
        },
        function(err){
          $scope.popupOpen = false;
          $log.error(err);
        }
      );
    }

    $scope.groupOpen = function(id, label){
      $scope.popupProcessing = false;
      $scope.hasErrPop = false;
      $scope.errType = "";
      $scope.curFiles = {};
      if($scope.curState === 'support.kb.a'){
        $scope.group = {label:""};
        if(id){
          $scope.group = {id:id, label:label};
        }
      }
      ngDialog.open({
        template: 'app/knowledgeBase/popup/group.html',
        width: 640,
        scope: $scope,
        data: $scope.groupObj,
        closeByDocument: false
      });
    }

    $scope.groupFx = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      if($scope.group.label == ""){
        $scope.hasErrPop = true;
        $scope.errType = "grp";
      } else{
        $scope.popupProcessing = true;
        KBSrv.addGroup($scope.group).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code == 3059){
              $scope.hasErrPop = true;
              $scope.errType = "alreadyG";
            }
            else if(data.code == 3057 || data.code == 3058){
              $rootScope.toastNotificationFx("info", data);
              ngDialog.close();
              $scope.getKB();
            }
          },
          function(err){
            $log.error(err);
            $rootScope.toastNotificationFx("danger", {"code":5000});
            $scope.popupProcessing = false;
          }
        );
      }
    }

    $scope.folderFx = function(event){
      $(event.currentTarget).find('.fa-folder').toggleClass('fa-folder-open text-primary');
      $(event.currentTarget).closest(".folderQuad").children(".folder-content").toggleClass('show');
    }
  }
})();
