(function(){
  'use strict';

  angular
    .module('support')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  function SettingsController($log, $rootScope, $scope, $state, $filter, ngDialog, SettingsSrv, OdSrv){
    $scope.curVendDetail = {vendType:"e", label:"", city:"", address:"", country:"", province:"", zip:""};
    $scope.courierDetail = {label:""};
    $rootScope.search = {show:true, text:"", adv:false};
    $rootScope.selectedMenu = 2;

    $scope.curState = $state.current.name;
    $scope.domainPopMode = "new";
    $scope.nonTicketEmails = {};
    $scope.categories = {};
    $scope.hashList = {};
    $scope.domains = {};
    $scope.labels = {};


    $scope.getList = function(){
      $scope.pageLoading = true;
      if($scope.curState === "support.settings.d"){
        $scope.domains = {};
        SettingsSrv.getDomains().then(
          function(data){
            $scope.pageLoading = false;
            $scope.domains = data.domains;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      } else if($scope.curState === "support.settings.nt"){
        $scope.nonTicketEmails = {};
        SettingsSrv.getNTEmails().then(
          function(data){
            $scope.pageLoading = false;
            $scope.nonTicketEmails = data;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      } else if($scope.curState === "support.settings.l"){
        $scope.labels = {};
        SettingsSrv.getLabels().then(
          function(data){
            $scope.pageLoading = false;
            $scope.labels = data;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      } else if($scope.curState === "support.settings.c"){
        $scope.labels = {};
        SettingsSrv.getCategories().then(
          function(data){
            $scope.pageLoading = false;
            $scope.categories = data;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      } else if($scope.curState === "support.settings.s"){
        $scope.surveys = {};
        SettingsSrv.getSurvey().then(
          function(data){
            $scope.pageLoading = false;
            $scope.surveys = data;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      } else if($scope.curState === "support.settings.v"){
        $scope.vendors = {};
        OdSrv.vendorList().then(
          function(data){
            $scope.pageLoading = false;
            $scope.vendors = data;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      } else if($scope.curState === "support.settings.cs"){
        $scope.couriers = {};
        SettingsSrv.getCouriers().then(
          function(data){
            $scope.pageLoading = false;
            $scope.couriers = data;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $scope.getList();
    $scope.uiVersionFx();

    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
      $scope.getList();
    });

    $scope.deleteConfirmation = function(id, type){
      $scope.confirmObj = {id:id, type:type};
      $scope.popupProcessing = false;
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div ng-if="confirmObj.type == \'d\'">{{"s.msg.3" | translate}}</div>\
              <div ng-if="confirmObj.type == \'nt\'">{{"s.msg.4" | translate}}</div>\
              <div ng-if="confirmObj.type == \'l\'">{{"s.msg.5" | translate}}</div>\
              <div ng-if="confirmObj.type == \'c\'">{{"s.msg.17" | translate}}</div>\
              <div ng-if="confirmObj.type == \'s\'">{{"s.msg.20" | translate}}</div>\
              <div ng-if="confirmObj.type == \'v\'">{{"s.msg.22" | translate}}</div>\
              <div ng-if="confirmObj.type == \'cs\'">{{"s.msg.26" | translate}}</div>\
            </div>\
            <footer class="panel-footer">\
              <button ng-if="!isVExist" type="button" class="btn btn-danger" ng-click="deleteFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
              <button ng-if="isVExist" type="button" class="btn btn-default" ng-click="closeThisDialog();">{{"cm.btn.1" | translate}}</button>\
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
      if($scope.confirmObj.type == "d"){
        SettingsSrv.deleteDomains($scope.confirmObj.id).then(
          function(data){
            if(data.code == 9003){
              $scope.popupProcessing = false;
              ngDialog.close();
              $scope.getList();
            } else if (data.code == 9015){
              ngDialog.close();
              $scope.existCustomer = data.oId;
              ngDialog.open({
                template: '\
                  <section class="panel">\
                    <div class="panel-body">\
                      <span class="fa fa-exclamation-triangle text-bright"></span> <span class="marL5">{{"Customer can not be deleted because it exists in following orders:" | translate}}</span>\
                      <div class="scrollQuad bdrTd marT10 table table-sm no-th no-pointer" style="max-height:{{getAvailableHeight(510)}}px">\
                        <div class="row" ng-repeat="oId in existCustomer">\
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
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      } else if($scope.confirmObj.type == "nt"){
        SettingsSrv.deleteNTEmails($scope.confirmObj.id).then(
          function(data){
            if(data.code == 3012){
              $scope.popupProcessing = false;
              ngDialog.close();
              $scope.getList();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      } else if($scope.confirmObj.type == "l"){
        SettingsSrv.deleteLabels($scope.confirmObj.id).then(
          function(data){
            if(data.code == 5003){
              $scope.popupProcessing = false;
              ngDialog.close();
              $scope.getList();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      } else if($scope.confirmObj.type == "c"){
        SettingsSrv.deleteCategories($scope.confirmObj.id).then(
          function(data){
            if(data.code == 10007){
              $scope.popupProcessing = false;
              ngDialog.close();
              $scope.getList();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      } else if($scope.confirmObj.type == "s"){
        SettingsSrv.deleteSurvey($scope.confirmObj.id).then(
          function(data){
            if(data.code == 17003){
              $scope.popupProcessing = false;
              ngDialog.close();
              $scope.getList();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      } else if($scope.confirmObj.type == "v"){
        SettingsSrv.deleteVendor($scope.confirmObj.id).then(
          function(data){
            if(data.code == 18005){
              ngDialog.close();
              $scope.existVendors = data.oId;
              ngDialog.open({
                template: '\
                  <section class="panel">\
                    <div class="panel-body">\
                      <div>{{"s.msg.27" | translate}}\</div>\
                      <div class="scrollQuad bdrTd marT10 table table-sm no-th no-pointer" style="max-height:{{getAvailableHeight(510)}}px">\
                        <div class="row" ng-repeat="oId in existVendors">\
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
            } else if(data.code == 18004){
              $scope.getList();
              ngDialog.close();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      } else if($scope.confirmObj.type == "cs"){
        SettingsSrv.deleteCourier($scope.confirmObj.id).then(
          function(data){
            if(data.code == 19005){
              ngDialog.close();
              $scope.existCouriers = data.oId;
              ngDialog.open({
                template: '\
                  <section class="panel">\
                    <div class="panel-body">\
                      <div>{{"s.msg.28" | translate}}\</div>\
                      <div class="scrollQuad bdrTd marT10 table table-sm no-th no-pointer" style="max-height:{{getAvailableHeight(510)}}px">\
                        <div class="row" ng-repeat="oId in existCouriers">\
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
            } else if(data.code == 19004){
              $scope.getList();
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

    $scope.addSettings = function(id){
      $scope.popupProcessing = false;
      $scope.hasErrPop = false;
      $scope.existErr = false;
      $scope.existDomain = "";
      $scope.errType = "";
      if($scope.curState === "support.settings.nt" || $scope.curState === "support.settings.l"){
        $scope.ntLObj = {};
        if($scope.curState === "support.settings.nt"){
          $scope.ntLObj = {email:"", caller:"nt"};
        } else if($scope.curState === "support.settings.l"){
          if(id){
            $scope.labelsCopy = angular.copy($scope.labels);
            angular.forEach($scope.labelsCopy, function(item){
              if(item.id == id){
                $scope.ntLObj = item;
                $scope.ntLObj.caller = "l";
                $scope.ntLObj.new = false;
              }
            });
          } else{
            $scope.ntLObj = {label:"", bg:"#cccccc", bgType:"monochrome", color:"#000000", cType:"monochrome", caller:"l", new:true};
          }
        }
        ngDialog.open({
          template: 'app/settings/popup/ntL.html',
          width: 500,
          scope: $scope,
          closeByDocument: false
        });
      } else if($scope.curState === "support.settings.d"){
        $scope.domainObj = {info:{label:"", new:true}, emails:[], exEmails:[]};
        $scope.includeEmail = {email:""};
        $scope.excludeEmail = {email:""};
        if(id){
          $scope.domainObj.info.new = false;
          $scope.popupLoading = true;
          SettingsSrv.getDomainDetails(id).then(
            function(data){
              $scope.domainObj = data;
              $scope.popupLoading = false;
            },
            function(err){
              $scope.popupLoading = false;
              $log.error(err);
            }
          );
        } else{
          $scope.popupLoading = false;
        }
        ngDialog.open({
          template: 'app/settings/popup/domains.html',
          width: 700,
          scope: $scope,
          closeByDocument: false
        });
      }
      else if($scope.curState === "support.settings.c"){
        SettingsSrv.getHashList(id).then(
          function(data){
            $scope.hashList = data;
            $scope.categoryObj = {label:"", new:1, exclusive:0, hash:null}
            if(id){
              $scope.popupLoading = true;
              SettingsSrv.getCategoryDetails(id).then(
                function(data){
                  $scope.categoryObj = data;
                  $scope.popupLoading = false;
                },
                function(err){
                  $scope.popupLoading = false;
                  $log.error(err);
                }
              );
            } else{
              $scope.popupLoading = false;
            }
            ngDialog.open({
              template: 'app/settings/popup/c.html',
              width: 700,
              scope: $scope,
              closeByDocument: false
            });
          },
          function(err){
            $log.error(err);
          }
        );
      } else if($scope.curState === "support.settings.v"){
        $scope.vendorDetail = {};
        if(id){
          $scope.vendorDetail = id;
          $scope.curVendDetail = {id: $scope.vendorDetail.id, label: $scope.vendorDetail.label, city: $scope.vendorDetail.city, address: $scope.vendorDetail.address, country: $scope.vendorDetail.country, province: $scope.vendorDetail.province, zip: $scope.vendorDetail.zip};
        } else{
          $scope.popupLoading = false;
        }
        ngDialog.open({
          template: 'app/settings/popup/addVendor.html',
          width: 700,
          scope: $scope,
          closeByDocument: false
        });
      } else if($scope.curState === "support.settings.s"){
        $state.go('support.scu', {id: id});
      } else if($scope.curState === "support.settings.cs"){
        if(id){
          $scope.courierDetail = id;
          $scope.courierDetail = {id: $scope.courierDetail.id, label: $scope.courierDetail.label};
        } else{
          $scope.popupLoading = false;
        }
        ngDialog.open({
          template: 'app/settings/popup/addCourier.html',
          width: 560,
          scope: $scope,
          closeByDocument: false
        });
      }
    }

    $scope.addSettingsFx = function(){
      $scope.hasErrPop = false;
      $scope.existErr = false;
      $scope.existDomain = "";
      $scope.errType = "";
      if($scope.curState === "support.settings.d"){
        if($scope.domainObj.info.label === ""){
          $scope.hasErrPop = true;
          $scope.errType = "name";
        } else{
          $scope.popupProcessing = true;
          if($scope.domainObj.info.postfix){
            $scope.domainObj.info.postfix = $scope.domainObj.info.postfix.replace(/'/g, "");
          }
          SettingsSrv.saveDomain($scope.domainObj).then(
            function(data){
              $scope.popupProcessing = false;
              if(data.code == 9004){
                $scope.hasErrPop = true;
                $scope.errType = "dExist";
              } else if(data.code == 9013){
                $scope.customer = data.label;
                $scope.hasErrPop = true;
                $scope.errType = "deExist";
              } else{
                $scope.getList();
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
      else if($scope.curState === "support.settings.nt"){
        if(!$scope.ntLObj.email || $scope.ntLObj.email === ""){
          $scope.hasErrPop = true;
          $scope.errType = "email";
        } else{
          $scope.popupProcessing = true;
          $scope.ntLObj.email = $scope.ntLObj.email.replace(/'/g, "");
          SettingsSrv.saveNTEmail($scope.ntLObj).then(
            function(data){
              $scope.popupProcessing = false;
              if(data.code == 3013){
                $scope.hasErrPop = true;
                $scope.errType = "ntExist";
              } else{
                $scope.getList();
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
      else if($scope.curState === "support.settings.l"){
        if($scope.ntLObj.label === ""){
          $scope.hasErrPop = true;
          $scope.errType = "name";
        } else{
          $scope.popupProcessing = true;
          SettingsSrv.saveLabel($scope.ntLObj).then(
            function(data){
              $scope.popupProcessing = false;
              if(data.code == 5007){
                $scope.hasErrPop = true;
                $scope.errType = "lExist";
              } else{
                $scope.getList();
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
      else if($scope.curState === "support.settings.c"){
        if($scope.categoryObj.label === ""){
          $scope.hasErrPop = true;
          $scope.errType = "name";
        } else{
          $scope.popupProcessing = true;
          SettingsSrv.saveCategory($scope.categoryObj).then(
            function(data){
              $scope.popupProcessing = false;
              if(data.code == 10004){
                $scope.hasErrPop = true;
                $scope.errType = "exist";
              } else if(data.code == 10008){
                $scope.hasErrPop = true;
                $scope.errType = "hash";
              } else{
                $scope.getList();
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
      else if($scope.curState === "support.settings.v"){
        $scope.hasErrPop = false;
        $scope.errType = "";
        if($scope.curVendDetail.label == ""){
          $scope.hasErrPop = true;
          $scope.errType = "name";
        } else if($scope.curVendDetail.address == ""){
          $scope.hasErrPop = true;
          $scope.errType = "vAds";
        } else if($scope.curVendDetail.city == ""){
          $scope.hasErrPop = true;
          $scope.errType = "vCity";
        } else if($scope.curVendDetail.zip == ""){
          $scope.hasErrPop = true;
          $scope.errType = "vZip";
        } else if($scope.curVendDetail.province == ""){
          $scope.hasErrPop = true;
          $scope.errType = "vState";
        } else if($scope.curVendDetail.country == ""){
          $scope.hasErrPop = true;
          $scope.errType = "vCountry";
        } else {
          $scope.popupProcessing = true;
          OdSrv.addVendor($scope.curVendDetail).then(
            function(data){
              $scope.popupProcessing = false;
              if(data.code == 18002){
                $scope.hasErrPop = true;
                $scope.errType = "vSame";
              } else {
                $scope.getList();
                ngDialog.close();
                $scope.resetVendor();
              }
            },
            function(err){
              $log.error(err);
              $scope.popupProcessing = false;
            }
          );
        }
      }
      else if($scope.curState === "support.settings.cs"){
        $scope.hasErrPop = false;
        $scope.errType = "";
        if($scope.courierDetail.label == ""){
          $scope.hasErrPop = true;
          $scope.errType = "cName";
        } else {
          $scope.popupProcessing = true;
          SettingsSrv.addCourier($scope.courierDetail).then(
            function(data){
              $scope.popupProcessing = false;
              if(data.code == 19002){
                $scope.hasErrPop = true;
                $scope.errType = "cSame";
              } else {
                $scope.getList();
                ngDialog.close();
                $scope.resetCourier();
              }
            },
            function(err){
              $log.error(err);
              $scope.popupProcessing = false;
            }
          );
        }
      }
    }

    $scope.resetVendor = function(){
      $scope.curVendDetail = {vendType: $scope.curVendDetail.vendType, label:"", city:"", address:"", country:"", province:"", zip:""};
    }
    $scope.resetCourier = function(){
      $scope.courierDetail = {label: ""};
    }

    $scope.addEmailFx = function(type){
      $scope.hasErrPop = false;
      $scope.existErr = false;
      $scope.existDomain = "";
      $scope.curType = type;
      $scope.errType = "";

      if((type == 'include' && (!$scope.includeEmail.email || $scope.includeEmail.email == "")) || (type == 'exclude' && (!$scope.excludeEmail.email || $scope.excludeEmail.email == ""))){
        $scope.hasErrPop = true;
        $scope.errType = "empty";
      }
      else{
        $scope.isExist = false;

        if(type == "include"){
          if($scope.domainObj.emails.length>0){
            angular.forEach($scope.domainObj.emails, function(item){
              if($filter('lowercase')(item.email) === $filter('lowercase')($scope.includeEmail.email)){
                $scope.errType = "exist";
                $scope.hasErrPop = true;
                $scope.isExist = true;
              }
            });
          }
          if($scope.domainObj.exEmails.length>0){
            angular.forEach($scope.domainObj.exEmails, function(item){
              if($filter('lowercase')(item.email) === $filter('lowercase')($scope.includeEmail.email)){
                $scope.errType = "exist";
                $scope.hasErrPop = true;
                $scope.isExist = true;
              }
            });
          }
        }
        else{
          if($scope.domainObj.exEmails.length>0){
            angular.forEach($scope.domainObj.exEmails, function(item){
              if($filter('lowercase')(item.email) === $filter('lowercase')($scope.excludeEmail.email)){
                $scope.errType = "exist";
                $scope.hasErrPop = true;
                $scope.isExist = true;
              }
            });
          }
          if($scope.domainObj.emails.length>0){
            angular.forEach($scope.domainObj.emails, function(item){
              if($filter('lowercase')(item.email) === $filter('lowercase')($scope.excludeEmail.email)){
                $scope.errType = "exist";
                $scope.hasErrPop = true;
                $scope.isExist = true;
              }
            });
          }
        }

        if(!$scope.isExist){
          $scope.addProcessing = true;
          $scope.curObj = {type:type, email:$scope.includeEmail.email.replace(/'/g, ""), postfix:""};
          if($scope.domainObj.info.postfix){
            $scope.curObj.postfix = $scope.domainObj.info.postfix.replace(/'/g, "");
          }
          if(type == "exclude"){
            $scope.curObj.email = $scope.excludeEmail.email.replace(/'/g, "");
          }

          SettingsSrv.verifyEmail($scope.curObj).then(
            function(data){
              $scope.addProcessing = false;
              if(data.code == 9011){
                if(type == "include"){
                  $scope.domainObj.emails.push(angular.copy($scope.curObj));
                  $scope.includeEmail.email = "";
                } else{
                  $scope.domainObj.exEmails.push(angular.copy($scope.curObj));
                  $scope.excludeEmail.email = "";
                }
                $scope.curObj.email = "";
              } else if(data.code == 9012){
                $scope.existErr = true;
                $scope.existDomain = data.domain;
              } else if(data.code == 9014){
                $scope.errType = "domain";
                $scope.hasErrPop = true;
                //Can add email id in exclude only if domain of email id is same with emailDomain
              }
            },
            function(err){
              $scope.addProcessing = false;
              $log.error(err);
            }
          );
        }
      }
    }

    $scope.deleteEmailConfirm = function(index, type, name){
      $scope.curIndex = index;
      $scope.curType = type;
      $scope.name = name;
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <span ng-if="!name">{{"s.msg.6" | translate}}</span>\
              <span ng-if="name" translate="{{\'s.msg.16\'}}" translate-values="{name:name, htmlTagO: \'<b>\', htmlTagC:\'</b>\'}"></span>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-danger" ng-click="deleteEmailFx();" ng-disabled="popupProcessing" ng-if="!name"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
              <button type="button" class="btn" ng-class="name?\'btn-default\':\'btn-link\'" ng-click="closeThisDialog();">{{name?"cm.btn.9":"cm.btn.8" | translate}}</button>\
            </footer>\
          </section>',
        plain: true,
        width: 500,
        scope: $scope,
        closeByDocument: false,
        className: "ngdialog-theme-default ngdialog-confirm"
      });
    }

    $scope.deleteEmailFx = function(type){
      ngDialog.close($scope.ngDialogId, "email");
      if($scope.curType == 'include'){
        $scope.domainObj.emails.splice($scope.curIndex, 1);
      }
      else{
        $scope.domainObj.exEmails.splice($scope.curIndex, 1);
      }
    }
  }
})();
