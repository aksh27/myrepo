(function(){
  'use strict';

  angular
    .module('support')
    .controller('tDetailsController', tDetailsController);

  /** @ngInject */
  function tDetailsController($log, $rootScope, $scope, $state, $filter, $window, $interval, $location, ngDialog, TicketSrv, TicketDetailSrv, SettingsSrv, FileModelUploadSrv){
    $rootScope.search = {show:false, text:"", adv:false};
    $rootScope.selectedMenu = 1;

    $scope.beforeDate = moment(moment()._d).add('days', 1).format('MM-DD-YYYY');
    $scope.localState = localStorage.getItem("curState");
    $scope.curState = $state.current.name;
    $scope.historyLoading = false;
    $scope.syncToastShow = false;
    $scope.isHistoryOpen = false;
    $scope.shouldFocus = true;
    $scope.ccCollapsed = true;
    $scope.replyOpen = false;
    $scope.fwdComment = "";
    $scope.hasErr = false;
    $scope.syncFlag = "s";
    $scope.errType = "";
    $scope.history = [];
    $scope.uFiles = [];
    $scope.sFiles = [];

    $scope.curTotal = 0;

    $scope.curEmails = {cc:[]};

    $scope.syncFx = function(caller){
      $scope.oldThreadLength = $scope.cutThreads.length;
      if(caller == "s"){
        $scope.syncToastShow = false;
        $scope.syncFlag = "s";
        angular.forEach($scope.cutThreads, function(thd){
          $scope.details.threads.push(thd);
        });
        TicketDetailSrv.readMsg($scope.decId).then(
          function(data){
          },
          function(err){
            $log.error(err);
          }
        );
        setTimeout(function(){
          $location.hash($scope.details.threads[$scope.details.threads.length -1].id);
        }, 5);
      } else{
        $scope.syncToastShow = false;
        $scope.syncFlag = "i";
      }
    }

    $scope.getDetailsFx = function(read, caller){
      TicketDetailSrv.getDetails($scope.decId, read).then(
        function(data){
          $scope.detailLoading = false;
          if(caller){
            $scope.details = angular.copy(data);
            if($scope.details.replyTo.length){
              angular.forEach($scope.details.replyTo, function(item){
                $scope.curEmails.cc.push(item.email);
              });
            }
          }
          else{
            $scope.threadsCopy = angular.copy($scope.details.threads);
            $scope.details = angular.copy(data);
            if($scope.threadsCopy.length == data.threads.length){
              $scope.details.threads = $scope.threadsCopy;
            } else{
              $scope.details.threads = $scope.threadsCopy;
              $scope.cutThreads = [];
              angular.forEach(data.threads, function(item){
                $scope.isDuplicate = false;
                angular.forEach($scope.threadsCopy, function(listItem){
                  if(listItem.id && (item.id == listItem.id)){
                    $scope.isDuplicate = true;
                    return false;
                  }
                  else if(listItem.mId && (item.mId == listItem.mId)){
                    $scope.isDuplicate = true;
                    return false;
                  }
                });
                if(!$scope.isDuplicate){
                  item.o = 1;
                  $scope.cutThreads.push(item);
                  // $scope.details.threads.push(item);
                }
              });
              if($scope.syncFlag == "s"){
                $scope.syncToastShow = true;
              }
              if($scope.syncFlag == "i" && $scope.cutThreads.length > $scope.oldThreadLength){
                $scope.syncToastShow = true;
              }
            }
          }
          if($scope.details.dueDate){
            $scope.details.dueDate = moment($scope.details.dueDate).format("MM-DD-YYYY");
            if(new Date(moment($scope.details.dueDate).format("MM-DD-YYYY")) <= new Date(moment($scope.beforeDate).format("MM-DD-YYYY"))){
              $scope.dateSmall = true;
            } else{
              $scope.dateSmall = false;
            }
          }
          if($scope.details.dueTime){
            $scope.details.dueTime = moment($scope.details.dueDate +" "+ $scope.details.dueTime).format("hh:mm A");
          }
          if($scope.details.dueDateTime){
            // $scope.details.dueDateTime = parseInt(moment($scope.details.dueDate +" "+ $scope.details.dueTime).utc().format("x"));
          }
          // parseInt(moment($scope.details.dueDate +" "+ $scope.details.dueTime).format("x"))
          $scope.reply.replyType = angular.copy($scope.reply.replyType);
          if($scope.details.isGmail){
            $scope.reply.replyType = "s";
          } else{
            if(read == 0){
              if($scope.details.assignee && $scope.details.assignee.id != $scope.auth.id){
                if($scope.auth.role == 0){
                  $scope.reply.replyType = "c";
                }
                else{
                  $scope.reply.replyType = "s";
                }
              }
              else{
                $scope.reply.replyType = "c";
              }
            }
          }
        },
        function(err){
          $scope.detailLoading = false;
          $log.error(err);
        }
      );
    }

    if($state.params.id){
      $scope.decId = $scope.hubDecrypt($state.params.id);
      $scope.encId = $state.params.id;
      $scope.reply = {thid:$scope.decId, html:"", replyType:"c", replyTo:[]};
      $scope.detailLoading = true;
      $scope.getDetailsFx(0, true);
      var timer = $interval(function(){
        $scope.getDetailsFx(1);
      }, 30000);
    }
    $scope.$on("$destroy", function(){
      if(timer){
        $interval.cancel(timer);
      }
    });

    var scrollingElement = (document.scrollingElement || document.body);
    $scope.replyFx = function(){
      $scope.replyOpen = !$scope.replyOpen;
      if($scope.replyOpen){
        setTimeout(function(){
          scrollingElement.scrollTop = scrollingElement.scrollHeight;
        }, 10);
      } else{
        $scope.toolbarToggle = false;
        $scope.reply.html = "";
        $scope.sFiles = [];
        $scope.uFiles = [];
      }
    }

    $scope.toolbarToggle = false;
    $scope.toolbarToggleFx = function(){
      $scope.toolbarToggle = !$scope.toolbarToggle;
    }

    // $rootScope.sendFileUploadFx = function(sFile, uFile){
    //   $scope.sFiles = sFile;
    //   $scope.uFiles = uFile;
    // }

    $scope.ccExpand = function(){
      $scope.ccCollapsed = !$scope.ccCollapsed;
    }

    $scope.sFiles = [];
    $scope.uFiles = [];
    $rootScope.sendFileUploadFx = function(sFile, uFile){
      if(!$scope.sFiles.length){
        $scope.sFiles = sFile;
      } else{
        angular.forEach(sFile, function(curItem){
          $scope.isSFileDup = false;
          angular.forEach($scope.sFiles, function(item){
            if(curItem.name == item.name && curItem.size == item.size){
              $scope.isSFileDup = true;
              return false;
            }
          });
          if(!$scope.isSFileDup){
            $scope.sFiles.push(curItem);
          }
        });
      }

      if(!$scope.uFiles.length){
        $scope.uFiles = uFile;
      } else{
        angular.forEach(uFile, function(curItem){
          $scope.isUFileDup = false;
          angular.forEach($scope.uFiles, function(item){
            if(curItem.name == item.name && curItem.size == item.size){
              $scope.isUFileDup = true;
              return false;
            }
          });
          if(!$scope.isUFileDup){
            $scope.uFiles.push(curItem);
          }
        });
      }
    }

    $scope.toggleHistory = function(){
      $scope.isHistoryOpen = !$scope.isHistoryOpen;
      if($scope.isHistoryOpen){
        $scope.historyLoading = true;
        TicketDetailSrv.getHistory($scope.decId, new Date().getTimezoneOffset()).then(
          function(data){
            $scope.historyLoading = false;
            $scope.history = data;
          },
          function(err){
            $scope.historyLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $scope.toggleHistory();

    $scope.sendFx = function(caller){
      $scope.hasErr = false;
      $scope.errType = "";
      $scope.ccEmail = [];

      if($scope.curEmails.cc.length){
        angular.forEach($scope.curEmails.cc, function(email){
          if($scope.validator(email)==false){
          } else{
            $scope.ccEmail.push(email);
          }
        });
      }

      if($scope.ccEmail.length){
        if($scope.details.replyTo.length){
          $scope.curCCArr = [];
          angular.forEach($scope.ccEmail, function(email){
            $scope.emailDuplicate = false;
            angular.forEach($scope.details.replyTo, function(item){
              if(item.email == email){
                $scope.emailDuplicate = true;
                $scope.curCCArr.push(item);
                return false;
                // $scope.reply.replyTo.push(item);
              }
            });
            if(!$scope.emailDuplicate){
              $scope.curCCArr.push({name:"", email:email});
            }
          });
          $scope.reply.replyTo = $scope.curCCArr;
        }
        else{
          $scope.reply.replyTo.push({name:"", email:$scope.ccEmail[0]});
        }
      }

      var isWorld;
      if(caller != "send" && $scope.reply.html){
        var isWorld = $scope.reply.html.indexOf("find attached") !== -1;
      } else{
        ngDialog.close();
      }
      if(isWorld && !$scope.sFiles.length){
        ngDialog.open({
          template: '\
            <section class="panel">\
              <div class="panel-body">\
                <div>{{"t.msg.24" | translate}}</div>\
                <div class="marR15">{{"t.msg.24.1" | translate}}</div>\
              </div>\
              <footer class="panel-footer">\
                <button type="button" class="btn btn-primary" ng-click="sendFx(\'send\');">{{"cm.btn.1" | translate}}</button>\
                <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
              </footer>\
            </section>',
          plain: true,
          width: 500,
          scope: $scope,
          closeByDocument: false,
          className: "ngdialog-theme-default ngdialog-confirm"
        });
      } else if($scope.reply.html !== "" || $scope.sFiles.length){
        $scope.toolbarToggle = false;
        $scope.sendProcessing = true;
        if(caller == "sr"){
          $scope.reply.isResolve = 1;
          $scope.reply.survey = $scope.sObj.survey;
        }
        if($scope.reply.html !== ""){
          var curHtml = $scope.reply.html.replace(/<p>/gi, "<p style='margin:0'>");
          $scope.reply.html = curHtml;
        }
        // return;
        FileModelUploadSrv.uploadFileAndData("tickets/reply", $scope.reply, $scope.sFiles).then(
          function(data){
            $scope.sendProcessing = false;
            $scope.replyOpen = false;
            if(data.code == 3008 || data.code == 3046){
              $scope.details.threads[$scope.details.threads.length -1].o = 0;
              $scope.curAttach = [];
              angular.forEach(data.attach, function(item){
                $scope.curAttach.push({url:data.s3 + item.url, name:item.name, mime:item.mime, isReply:1});
              });
              var curVersion = 0;
              if($scope.reply.replyType == "s"){
                  curVersion = 1;
              }
              $scope.details.threads.push({o:1, dir:0, id:data.id, mId:data.mId, isVersion:curVersion, body:$filter("removeHtmlTags")($scope.reply.html), html:$scope.reply.html, attach:$scope.curAttach, label:$scope.auth.fName + " " + $scope.auth.lName, email:$scope.auth.email, date:new Date().getTime()});
              if($scope.details.status == "o" || $scope.details.status == "n"){
                $scope.getDetailsFx();
              }
              $scope.reply = {thid:$scope.decId, html:"", replyType:"c", replyTo:[]};
              if($scope.details.assignee && $scope.details.assignee.id != $scope.auth.id){
                if($scope.auth.role == 0){
                  $scope.reply.replyType = "c";
                }
                else{
                  $scope.reply.replyType = "s";
                }
              }
              else{
                $scope.reply.replyType = "c";
              }
              $scope.sFiles = [];
              $scope.uFiles = [];
              // $scope.getDetailsFx();
            }
            else if(data.code == 3024){
              $state.go("support.tickets.r");
            }
            else if(data.code == 3009){
              $scope.hasErr = true;
              $scope.errType = "invalide";
            }
            $rootScope.toastNotificationFx("info", data);
          },
          function(err){
            $log.error(err);
            $rootScope.toastNotificationFx("danger", {"code":5000});
            $scope.saveProcessing = false;
          }
        );
      }
    }

    //method for attach survey before send & resolve ticket
    $scope.sObj = {survey:""};
    $scope.sendRSFx = function(caller){
      if(caller == 'sr' && ($scope.reply.html !== "" || $scope.sFiles.length)){
        $scope.surveyList = {};
        TicketDetailSrv.getSurvey().then(
          function(data){
            $scope.surveyList = data;
          },
          function(err){
            $log.error(err);
          }
        );
        ngDialog.open({
          template: '\
            <section class="panel">\
              <div class="panel-body">\
                <div>\
                  {{"t.msg.25" | translate}}\
                  <select class="form-control marT10 noMarB" ng-disabled="!surveyList.length" ng-options="survey.title for survey in surveyList track by survey.id" ng-model="sObj.survey">\
                    <option value="">Select Survey</option>\
                  </select>\
                </div>\
              </div>\
              <footer class="panel-footer">\
                <button type="button" class="btn btn-primary" ng-click="isSValidFx(\'sr\', \'y\');">{{"cm.btn.2" | translate}}</button>\
                <button type="button" class="btn btn-default" ng-click="isSValidFx(\'sr\',\'n\');closeThisDialog();">{{"cm.btn.3" | translate}}</button>\
                <div class="errMsg pull-right" ng-if="hasErr">\
                  <span ng-if="errType == \'survey\'">Please select survey.</span>\
                </div>\
              </footer>\
          </section>',
          plain: true,
          width: 500,
          scope: $scope,
          closeByDocument: false,
          className: "ngdialog-theme-default ngdialog-confirm"
        });
      }
    }
    $scope.isSValidFx = function(caller, isAttach){
      $scope.hasErr = false;
      $scope.errType = "";
      if(isAttach == 'y' && ($scope.sObj.survey == "" || $scope.sObj.survey == null)){
        $scope.hasErr = true;
        $scope.errType = "survey";
        return false;
      } else if(isAttach == 'n'){
        $scope.sObj.survey = "";
      }
      ngDialog.close();
      $scope.sendFx(caller);
    }

    $scope.attachRemoveFx = function(caller, index){
      if(caller == "s"){
        $scope.sFiles.splice(index, 1);
      } else if(caller == "u"){
        $scope.uFiles.splice(index, 1);
      }
    }

    $scope.subAgentOpen = function(){
      $scope.popupProcessing = false;
      $scope.popupLoading = true;
      $scope.hasErrPop = false;
      $scope.errType = "";
      TicketDetailSrv.getAgent($scope.decId, "s").then(
        function(data){
          $scope.subAgentListCopy = angular.copy(data);
          $scope.popupLoading = false;
          $scope.subAgentList = data;
        },
        function(err){
          $scope.popupLoading = false;
          $log.error(err);
        }
      );
      ngDialog.open({
        template:'app/ticket/popup/subAgentList.html',
        width: 700,
        scope: $scope,
        closeByDocument: false
      });
    }
    $scope.subAssignFx = function(){
      $scope.popupProcessing = false;
      $scope.hasErrPop = false;
      $scope.subCopyIds = [];
      $scope.errType = "";
      $scope.subIds = [];

      angular.forEach($scope.subAgentList, function(item){
        if(item.isAssign){
          $scope.subIds.push(item.id);
        }
      });
      angular.forEach($scope.subAgentListCopy, function(item){
        if(item.isAssign){
          $scope.subCopyIds.push(item.id);
        }
      });

      if(angular.equals($scope.subCopyIds.toString(), $scope.subIds.toString())){
        $scope.hasErrPop = true;
        $scope.errType = "same";
      }
      else{
        $scope.popupProcessing = true;
        $scope.curSub = {thid:$scope.decId, userId:$scope.subIds, assignType:"s"};
        TicketDetailSrv.updateAgent($scope.curSub).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code){
              $scope.getDetailsFx();
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

    $scope.forwardOpen = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      $scope.fwdComment = "";
      $scope.popupProcessing = false;
      $scope.popupLoading = true;
      $scope.fwd = {comment:""};
      TicketDetailSrv.getAgent($scope.decId, "a").then(
        function(data){
          $scope.popupLoading = false;
          $scope.agentList = data;
          $scope.agentListCopy = angular.copy($scope.agentList);
          angular.forEach($scope.agentListCopy, function(agent){
            if(agent.isAssign){
              $scope.curSelectedAgent = agent;
              $scope.selectedAgent = agent;
            }
          })
        },
        function(err){
          $scope.popupLoading = false;
          $log.error(err);
        }
      );

      ngDialog.open({
        template:'app/ticket/popup/agentList.html',
        width: 700,
        scope: $scope,
        closeByDocument: false
      });
    }
    $scope.forwardFx = function(caller){
      $scope.hasErrPop = false;
      $scope.errType = "";
      if(!$scope.selectedAgent){
        $scope.hasErrPop = true;
        $scope.errType = "empty";
      } else if($scope.curSelectedAgent && ($scope.curSelectedAgent.id === $scope.selectedAgent.id)){
        $scope.hasErrPop = true;
        $scope.errType = "same";
      } else{
        if(!caller && $scope.localState !== "support.tickets.o" && $scope.localState !== "support.tickets.n"){
          $scope.confirmOpen('a');
        } else{
          $scope.popupProcessing = true;
          $scope.curAgent = {thid:$scope.decId, userId:[$scope.selectedAgent.id], comment:$scope.fwd.comment};
          TicketDetailSrv.updateAgent($scope.curAgent).then(
            function(data){
              $scope.popupProcessing = false;
              if(data.code){
                $rootScope.toastNotificationFx("info", data, $scope.selectedAgent.label+".");
                if($scope.auth.id == $scope.selectedAgent.id){
                  $state.go("support.tickets.a");
                } else{
                  $state.go("support.tickets." + $scope.details.status);
                }
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
    }

    $scope.isAssignFx = function(agent){
      $scope.selectedAgent = agent;
      angular.forEach($scope.agentList, function(user){
        user.isAssign = 0;
        if(agent.id == user.id){
          user.isAssign = 1;
        }
      });
    }
    $scope.confirmOpen = function(caller){
      $scope.confirmObj = {caller:caller, isMail:false};
      $scope.popupProcessing = false;
      if(caller == 'r'){
        $scope.surveyList = {};
        $scope.confirmObj.survey = "";
        TicketDetailSrv.getSurvey().then(
          function(data){
            $scope.surveyList = data;
          },
          function(err){
            $log.error(err);
          }
        );
      }
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div ng-if="confirmObj.caller == \'t\'">\
                {{"t.msg.6" | translate}}\
                <label class="text-unbold marT10 noMarB"><input type="checkbox" ng-model="confirmObj.isMail"><label></label><span translate="{{\'t.pop.7\'}}" translate-values="{email: \'<b>{{details.email}}</b>\'}"></span></label>\
              </div>\
              <div ng-if="confirmObj.caller == \'r\'">\
                {{"t.msg.7" | translate}}\
                <label class="text-unbold marT10 noMarB"><input type="checkbox" ng-model="confirmObj.isMail"><label></label>{{"t.label.14" | translate}}</label>\
                <div class="clear-fix marB10"></div>\
                <div ng-if="confirmObj.isMail">\
                  {{"t.msg.25" | translate}}\
                  <select class="form-control marT10 noMarB" ng-disabled="!surveyList.length" ng-options="survey.title for survey in surveyList track by survey.id" ng-model="confirmObj.survey">\
                    <option value="">Select Survey</option>\
                  </select>\
                </div>\
              </div>\
              <div ng-if="confirmObj.caller == \'nr\'">{{"t.msg.7.1" | translate}}</div>\
              <div ng-if="confirmObj.caller == \'o\'">{{"t.msg.8" | translate}}</div>\
              <div ng-if="confirmObj.caller == \'d\'">{{"t.msg.9" | translate}}</div>\
              <div ng-if="confirmObj.caller == \'a\'" translate="{{\'t.msg.17\'}}" translate-values="{cName: \'<b>{{curSelectedAgent.label}}</b>\', nName:\'<b>{{selectedAgent.label}}</b>\'}"></div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn" ng-class="confirmObj.caller == \'d\'?\'btn-danger\':\'btn-primary\'" ng-if="confirmObj.caller !== \'a\'" ng-click="confirmFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
              <button type="button" class="btn btn-primary" ng-if="confirmObj.caller === \'a\'" ng-click="forwardFx(\'s\');" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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
    $scope.confirmFx = function(){
      $scope.popupProcessing = true;
      $scope.isMail =  Number($scope.confirmObj.isMail);
      if($scope.confirmObj.caller == "t"){
        TicketDetailSrv.status($scope.decId, "nonticket", $scope.isMail, {email:$scope.details.email}).then(
          function(data){
            $scope.popupProcessing = false;
            $state.go($scope.localState);
            ngDialog.close();
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
      else if($scope.confirmObj.caller == "r"){
        TicketDetailSrv.status($scope.decId, "resolved", $scope.isMail, {survey:$scope.confirmObj.survey}).then(
          function(data){
            $scope.popupProcessing = false;
            $state.go($scope.localState);
            ngDialog.close();
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
      else if($scope.confirmObj.caller == "nr"){
        TicketDetailSrv.status($scope.decId, "nr", $scope.isMail).then(
          function(data){
            $scope.popupProcessing = false;
            $state.go($scope.localState);
            ngDialog.close();
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
      else if($scope.confirmObj.caller == "o"){
        TicketDetailSrv.status($scope.decId, "open", $scope.isMail).then(
          function(data){
            $scope.popupProcessing = false;
            $state.go($scope.localState);
            ngDialog.close();
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
      else if($scope.confirmObj.caller == "d"){
        TicketDetailSrv.delete($scope.decId).then(
          function(data){
            $scope.popupProcessing = false;
            $state.go($scope.localState);
            ngDialog.close();
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
    }

    $scope.ticketExportFx = function(){
      TicketSrv.ticketExport($scope.decId).then(
        function(data){
          if(data && data.download){
            $window.open(data.download, '_blank');
          }
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.categoryOpen = function(){
      $scope.categoryObj = {category:"", thid:$scope.decId};
      $scope.popupProcessing = false;
      $scope.popupLoading = true;
      $scope.productList = null;
      $scope.hasErrPop = false;
      $scope.errType = "";
      TicketDetailSrv.getCategory().then(
        function(data){
          $scope.popupLoading = false;
          if($scope.details.category){
            $scope.categoryObj.category = $scope.details.category;
          }
          if(data.length){
            $scope.categoryList = [{id:0, label:"None"}];
            angular.forEach(data, function(item){
              $scope.categoryList.push(item);
            });
          }
        },
        function(err){
          $scope.popupLoading = false;
          $log.error(err);
        }
      );
      ngDialog.open({
        template:'app/ticket/popup/category.html',
        width: 500,
        scope: $scope,
        closeByDocument: false
      });
    }
    $scope.categoryFx = function(caller){
      if($scope.categoryObj.category == ""){
        $scope.hasErrPop = true;
        $scope.errType = "empty";
      }
      else{
        $scope.popupProcessing = true;
        $scope.curCategory = {category:[$scope.categoryObj.category], thid:$scope.categoryObj.thid};
        TicketDetailSrv.saveCategory($scope.curCategory).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code == 10003){
              $scope.hasErrPop = true;
              $scope.errType = "already";
            } else if(data.code == 10001 || data.code == 3032){
              ngDialog.close();
              $scope.getDetailsFx();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
    }

    $scope.domainOpen = function(){
      $scope.domainObj = {domain:"", product:"", checkEmail:false, thid:$scope.decId, email:$scope.details.email};
      $scope.popupProcessing = false;
      $scope.popupLoading = true;
      $scope.productList = null;
      $scope.hasErrPop = false;
      $scope.errType = "";
      TicketDetailSrv.getDomain().then(
        function(data){
          $scope.popupLoading = false;
          if($scope.details.domain){
            $scope.domainObj.domain = $scope.details.domain;
          }
          if(data.domains.length){
            $scope.domainList = [{id:0, label:"None"}];
            angular.forEach(data.domains, function(item){
              $scope.domainList.push(item);
            });
          }
          if(data.products != ""){
            $scope.productList = data.products;
            if(data.ps){
              $scope.domainObj.product = data.ps;
            }
          }
        },
        function(err){
          $scope.popupLoading = false;
          $log.error(err);
        }
      );
      ngDialog.open({
        template:'app/ticket/popup/domain.html',
        width: 500,
        scope: $scope,
        closeByDocument: false
      });
    }

    $scope.domainFx = function(caller){
      if($scope.domainObj.domain == ""){
        $scope.hasErrPop = true;
        $scope.errType = "empty";
      }
      else{
        if($scope.domainObj.checkEmail){
          SettingsSrv.verifyEmail({email:$scope.domainObj.email, type:"include", postfix:""}).then(
            function(data){
              $scope.addProcessing = false;
              if(data.code == 9011){
                $scope.saveDomainFx();
              } else if(data.code == 9012){
                $scope.existDomain = data.domain;
                if($scope.existDomain == $scope.domainObj.domain.label){
                  $scope.saveDomainFx();
                } else{
                  ngDialog.open({
                    template: '\
                      <section class="panel">\
                        <div class="panel-body">\
                          <div translate="{{\'t.msg.20\'}}" translate-values="{domain:\'<b>{{existDomain}}</b>\'}"></div>\
                        </div>\
                        <footer class="panel-footer">\
                          <button type="button" class="btn btn-success" ng-click="saveDomainFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
                          <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.3" | translate}}</button>\
                        </footer>\
                      </section>',
                    plain: true,
                    width: 500,
                    scope: $scope,
                    closeByDocument: false,
                    className: "ngdialog-theme-default ngdialog-confirm"
                  });
                }
              }
            },
            function(err){
              $scope.addProcessing = false;
              $log.error(err);
            }
          );
        }
        else{
          $scope.saveDomainFx();
        }
      }
    }

    $scope.saveDomainFx = function(){
      $scope.popupProcessing = true;
      TicketDetailSrv.saveDomain($scope.domainObj).then(
        function(data){
          $scope.popupProcessing = false;
          if(data.code == 9009 || data.code == 3032){
            ngDialog.close();
            $scope.getDetailsFx();
          }
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }

    /*Label*/
    $scope.getLabels = function(){
      $scope.labels = {};
      SettingsSrv.getLabels().then(
        function(data){
          $scope.labels = data;
        },
        function(err){
          $log.error(err);
        }
      );
    }
    $scope.getLabels();

    $scope.labelOpenCheckFx = function(){
      $scope.isApply = false;
      $scope.ddLabel = angular.copy($scope.labels);
      angular.forEach($scope.ddLabel, function(label){
        angular.forEach($scope.details.labels, function(item){
          if(label.id == item.id){
            label.selected = true;
          }
        });
      });
    }

    $scope.isApply = false;
    $scope.labelChangeFx = function(){
      $scope.curLabelIds = [];
      $scope.tempLabelIds = [];
      angular.forEach($scope.details.labels, function(label){
        $scope.curLabelIds.push(label.id);
      });
      angular.forEach($scope.ddLabel, function(label){
        if(label.selected){
          $scope.tempLabelIds.push(label.id);
        }
      });
      if(angular.equals($scope.curLabelIds.toString(), $scope.tempLabelIds.toString())){
        $scope.isApply = false;
      } else{
        $scope.isApply = true;
      }
    }

    $scope.labelAUFx = function(caller, id, index){
      $scope.lbIdsArr = [];
      if(caller == "a"){
        $scope.tempSelected = [];
        angular.forEach($scope.ddLabel, function(label){
          if(label.selected){
            $scope.tempSelected.push(label.id);
          }
        });
        $scope.lbIdsArr = angular.copy($scope.tempSelected);
        $scope.curLabelObj = {labelIds:$scope.lbIdsArr, thids:[$scope.details.thid], type:"assign"};
      }
      else if(caller == "u"){
        angular.forEach($scope.details.labels, function(item){
          if(item.selected){
            $scope.lbIdsArr.push(item.id);
          }
        });
        $scope.curLabelObj = {labelIds:[id], thids:[$scope.details.thid], type:"remove"};
      }
      if(!$scope.curLabelObj.labelIds.length && !$scope.details.labels.length){
        $scope.isApply = false;
      }
      else{
        SettingsSrv.labelsAR($scope.curLabelObj).then(
          function(data){
            $scope.popupProcessing = false;
            if(caller == "a" && (data.code == 5004 || data.code == 5005)){
              $scope.details.labels = [];
              angular.forEach($scope.ddLabel, function(item){
                if(item.selected){
                  $scope.details.labels.push(item);
                }
              });
            }
            else if(data.code == 5005){
              angular.forEach($scope.details.labels, function(item){
                if(item.id == id){
                  $scope.details.labels.splice($scope.details.labels.indexOf(item), 1);
                }
              });
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
    }


    $scope.labelCUOpen = function(){
      $scope.popupProcessing = false;
      $scope.hasErrPop = false;
      $scope.errType = "";

      $scope.ntLObj = {caller:"l", new:true, thId:$scope.decId, label:"", bg:"#cccccc", bgType:"monochrome", color:"#000000", cType:"monochrome"};
      ngDialog.open({
        template: 'app/settings/popup/ntL.html',
        width: 500,
        scope: $scope,
        closeByDocument: false
      });
    }
    $scope.addSettingsFx = function(){
      if($scope.ntLObj.label == ""){
        $scope.hasErrPop = true;
        $scope.errType = "name";
      }
      else{
        $scope.popupProcessing = true;
        SettingsSrv.saveLabel($scope.ntLObj).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code == 5007){
              $scope.hasErrPop = true;
              $scope.errType = "lExist";
            } else{
              if(data.code == 5001){
                $scope.ntLObj.id = data.labelId;
                $scope.details.labels.push($scope.ntLObj);
              }
              $scope.getLabels();
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

    $scope.attachmentOpen = function(mId, aId, size){
      $scope.popupProcessing = true;
      ngDialog.open({
        template: "app/ticket/popup/saveLinkAs.html",
        width: 500,
        scope: $scope,
        closeByDocument: false
      });
      TicketDetailSrv.getAttachment(mId, aId).then(
        function(data){
          $scope.popupProcessing = false;
          if(data.url){
            $scope.attachObj = data;
            $scope.attachObj.size = size;
          }
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }

    $scope.timeEntryOpen = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      $scope.timeEntryObj = {hours:0, minutes:0};
      $scope.minutes = [];
      $scope.hours = [];
      for(var i=0; i<25; i++){
        $scope.hours.push(i);
      }
      for(var i=0; i<13; i++){
        $scope.minutes.push(i*5);
      }

      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-heading">{{"t.label.25" | translate}}</div>\
            <div class="panel-body">\
              <div class="form-group row noMarB">\
                <div class="col-xs-6">\
                  <label>{{"cm.label.27" | translate}}</label>\
                  <select type="number" class="form-control" ng-model="timeEntryObj.hours" ng-options="hor as hor for hor in hours track by hor"></select>\
                </div>\
                <div class="col-xs-6">\
                  <label>{{"cm.label.28" | translate}}</label>\
                  <select type="number" class="form-control" ng-model="timeEntryObj.minutes" ng-options="min as min for min in minutes track by min"></select>\
                </div>\
              </div>\
            </div>\
            <footer class="panel-footer">\
              <span class="btnQuad">\
                <button type="button" class="btn btn-primary" ng-click="timeFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.32" | translate}}</button>\
                <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
              </span>\
              <div class="errMsg pull-right" ng-if="hasErrPop">\
                <span ng-if="errType == \'empty\'">{{"t.pop.11" | translate}}</span>\
                <span ng-if="errType == \'consumed\'">{{"t.pop.12" | translate}}</span>\
              </div>\
              <div class="clearfix"></div>\
            </footer>\
          </section>',
        plain: true,
        width: 500,
        scope: $scope,
        closeByDocument: false
      });
    }

    $scope.timeFx = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      var hour = $scope.timeEntryObj.hours*60;
      $scope.timeEntry = {thid:$scope.decId, watch:hour + $scope.timeEntryObj.minutes};

      if($scope.timeEntry.watch == 0){
        $scope.hasErrPop = true;
        $scope.errType = "empty";
      } else{
        $scope.popupProcessing = true;
        TicketDetailSrv.saveTime($scope.timeEntry).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code == 3034){
              $scope.hasErrPop = true;
              $scope.errType = "consumed";
            } else if(data.code == 3033){
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

    $scope.unreadFx = function(){
      TicketDetailSrv.unread($scope.decId).then(
        function(data){
          if(data.code == 3037){
            $state.go("support.tickets." + $scope.details.status);
          }
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.dateTimeOpen = function(){
      if($scope.details.dueDateTime){
        // $scope.dateTimeObj = {dueDateOpt:true, dueDate:{startDate:angular.copy($scope.details.dueDate), endDate:angular.copy($scope.details.dueDate)}, dueTime:moment($scope.details.dueDate +" "+ $scope.details.dueTime).format()};
        // $scope.dateTimeObj = {dueDateOpt:true, dueDate:{startDate:angular.copy($filter("momentutc")($scope.details.dueDateTime, "MM-DD-YYYY")), endDate:angular.copy($filter("momentutc")($scope.details.dueDateTime, "MM-DD-YYYY"))}, dueTime:moment($filter("momentutc")($scope.details.dueDateTime, "MM-DD-YYYY hh:mm A")).format()};
        $scope.dateTimeObj = {dueDateOpt:true, dueDate:{startDate:angular.copy(moment($scope.details.dueDateTime).format("MM-DD-YYYY")), endDate:moment($scope.details.dueDateTime).format("MM-DD-YYYY")}, dueTime:moment($scope.details.dueDateTime).format()};
      } else{
        $scope.dateTimeObj = {dueDateOpt:false, dueDate:{startDate:moment()._d, endDate:moment()._d}, dueTime:moment().utc().format()};
      }
      $scope.popupProcessing = false;
      ngDialog.open({
        template: "app/ticket/popup/dueDate.html",
        width: 400,
        scope: $scope,
        trapFocus: false,
        closeByDocument: false,
      });
    }
    $scope.dueDateTimeFx = function(){
      if($scope.dateTimeObj.dueDateOpt){
        $scope.details.dueDateTime = parseInt(moment(moment(angular.copy($scope.dateTimeObj.dueDate.startDate)).format("YYYY-MM-DD") +" "+ moment(angular.copy($scope.dateTimeObj.dueTime)).format("HH:mm:ss")).format("x"));
        $scope.saveData = {thId:$scope.decId, dueDate:moment(angular.copy($scope.dateTimeObj.dueDate.startDate)).format("YYYY-MM-DD"), dueTime:moment(angular.copy($scope.dateTimeObj.dueTime)).utc().format("HH:mm:ss")};
      } else{
        $scope.saveData = {thId:$scope.decId, dueDate:null, dueTime:null};
      }
      $scope.popupProcessing = true;

      TicketDetailSrv.dueDateTime($scope.saveData).then(
        function(data){
          $scope.popupProcessing = false;
          if(data.code == 3047){
            if($scope.saveData.dueDate){
              // $scope.details.dueDateTime = parseInt(moment($scope.saveData.dueDate +" "+ $scope.saveData.dueTime).format("x"));

              // $scope.details.dueDate = moment($scope.saveData.dueDate).format("MM-DD-YYYY");
              // $scope.details.dueTime = moment($scope.saveData.dueDate +" "+ $scope.saveData.dueTime).format("hh:mm A");
              // $scope.details.dueDateTime = $scope.saveData.dueDateTime;

              // if(new Date(moment($scope.details.dueDate).format("MM-DD-YYYY")) <= new Date(moment($scope.beforeDate).format("MM-DD-YYYY"))){
              if($scope.details.dueDateTime <= $scope.futureTimestamp){
                $scope.dateSmall = true;
              } else{
                $scope.dateSmall = false;
              }
            } else{
              $scope.dateSmall = false;
              $scope.details.dueDateTime = null;
              $scope.details.dueDate = null;
              $scope.details.dueTime = null;
            }
            ngDialog.close();
          }
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }
    $scope.editThreadOpen = function(body, thId, mId, id){
      var carId = id;
      if(mId){
        carId = mId;
      }
      $scope.editThreadObj = {body:body, thId:thId, mId:carId};
      $scope.popupProcessing = false;
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-heading">{{"t.pop.17" | translate}}</div>\
            <div class="panel-body">\
              <text-angular ng-model="editThreadObj.body" name="demo-editor" ta-target-toolbars="toolbar2" ta-text-editor-class="clearfix border-around" ta-html-editor-class="border-around" class="text-editor" focus="shouldFocus" ta-disabled="sendProcessing"></text-angular>\
            </div>\
            <footer class="panel-footer">\
              <span class="btnQuad">\
                <button type="button" class="btn btn-success" ng-click="editThreadFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{popupProcessing?"cm.btn.14i":"cm.btn.14" | translate}}</button>\
                <div class="toolbarToggle display-inline">\
                  <button type="button" class="btn btn-default not1 marL5" ng-class="{\'active\':toolbarToggle}" ng-click="toolbarToggleFx();" uib-tooltip="{{\'t.label.22\' | translate}}" tooltip-popup-delay="1000" tooltip-append-to-body="true"><i class="fas fa-font noMarR"></i></button>\
                  <div class="dropdown-menu" ng-if="toolbarToggle">\
                    <text-angular-toolbar name="toolbar2"></text-angular-toolbar>\
                  </div>\
                </div>\
                <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
              </span>\
              <div class="clearfix"></div>\
            </footer>\
          </section>',
        plain: true,
        width: 650,
        scope: $scope,
        trapFocus: false,
        closeByDocument: false,
      });
    }
    $scope.editThreadFx = function(){
      $scope.popupProcessing = true;
      TicketDetailSrv.msgVersion($scope.editThreadObj).then(
        function(data){
          $scope.popupProcessing = false;
          if(data.code == 3053){
            angular.forEach($scope.details.threads, function(thread){
              if(thread.mId == $scope.editThreadObj.mId || thread.id == $scope.editThreadObj.mId){
                thread.body = $filter("removeHtmlTags")($scope.editThreadObj.body);
                thread.html = $scope.editThreadObj.body;
                thread.isVersion = 1;
              }
            });
            ngDialog.close();
          }
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }

    $scope.viewVersions = function(thId, mId, id){
      var curId = id
      if(mId){
        curId = mId;
      }
      $scope.popupProcessing = true;
      TicketDetailSrv.getVersions(thId, curId).then(
        function(data){
          $scope.popupProcessing = false;
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }
    $scope.quoteToolDelay = 1000;
    $scope.quoteToolPlace = "top";
    $scope.quoteTool = "Show/Hide quote";
    $scope.gmailQuoteToggle = function(e){
      $(e.target).closest(".accordion-body").find(".gmail_quote").toggleClass("hide");
      // if(!$(e.target).closest(".accordion-body").children(".gmail_quote").hasClass("hide")){
      //   // $(e.target).closest(".accordion-body").children(".gmail-quote-btn").attr("uib-tooltip", "hello");
      //   $scope.quoteTool = "Hide expanded content";
      // } else{
      //   $scope.quoteTool = "Show trimmed content";
      // }
    }




    $scope.validator = function(text) {
      // Check if token text is an email
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(text);
    };






    // if($scope.ccEmails.length>1){
    //   $scope.cEmails
    // }

  }
})();
