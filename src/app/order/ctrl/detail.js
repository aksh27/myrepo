(function (){
'use strict';

angular
  .module('support')
  .controller('OrderDetailController', OrderDetailController);

  /** @ngInject */
  function OrderDetailController($log, $rootScope, $scope, $state, $sce, $filter, ngDialog, OdSrv, FileModelUploadSrv){
    // contoller is created by ready to billed, close and cancelled tab detail
    $rootScope.search = {show:false, text:"", adv:false};

    $scope.curState = $state.current.name;
    $scope.curTab = $state.params.types;

    $scope.orderView = {quickForm:null};
    $scope.renewal = [];
    $scope.upRemAttachment = false;

    $scope.curCustDetail = {custType:"n", nbAds:{name:"", city:"", email:"", phone:"", address:"", country:"", province:"", zip:""}, nsAds:{name:"", city:"", email:"", phone:"", address:"", country:"", province:"", zip:""}, ebAds:{}, esAds:{}};

    $scope.curVendDetail = {vendType:"e", label:"", city:"", address:"", country:"", province:"", zip:""};
    $scope.tmpVendorList = [];

    $scope.custDetail = {exist:{}};
    $scope.customer = {label:""}

    $scope.curFiles = {name:"", path:""};
    $scope.tmpFiles = {name:"", path:""};

    $scope.poUFiles = [];
    $scope.poSFiles = [];

    $scope.orderFormat = ["jpg","jpeg","png","doc","docx","pdf"];
    $scope.isShowC = true;
    $scope.isShowA = false;
    $scope.order = {propDeliveryDate:{startDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY'), endDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY')}};

    $scope.$on("curStateBroadcast", function(event, args){
      $scope.curState = args.curState;
    });

    $rootScope.createFilelUploadFx = function(sFile, uFile){
      $scope.upRemAttachment = true;
      if(!$scope.poSFiles.length){
        $scope.poSFiles = sFile;
      } else{
        angular.forEach(sFile, function(curItem){
          $scope.isPopSFileDup = false;
          angular.forEach($scope.poSFiles, function(item){
            if(curItem.name == item.name && curItem.size == item.size){
              $scope.isPopSFileDup = true;
              return false;
            }
          });
          if(!$scope.isPopSFileDup){
            $scope.poSFiles.push(curItem);
          }
        });
      }

      if(!$scope.poUFiles.length){
        $scope.poUFiles = uFile;
      } else{
        angular.forEach(uFile, function(curItem){
          $scope.isPopUFileDup = false;
          angular.forEach($scope.poUFiles, function(item){
            if(curItem.name == item.name && curItem.size == item.size){
              $scope.isPopUFileDup = true;
              return false;
            }
          });
          if(!$scope.isPopUFileDup){
            $scope.poUFiles.push(curItem);
          }
        });
      }
    }

    if($scope.curTab == "rb"){
      $scope.odrStatus = 'Ready to Billed';
      $scope.isShowOD = true;
      $scope.isShowCL = false;
      $scope.isShowA = false;
      $scope.isShowC = false;
      $scope.curTab = "cm";
    } else if($scope.curTab == "cl"){
      $scope.odrStatus = 'Closed';
      $scope.isShowCL = true;
      $scope.isShowOD = false;
      $scope.isShowA = false;
      $scope.isShowC = false;
      $scope.curTab = "cl";
    } else if($scope.curTab == "cn"){
      $scope.odrStatus = 'Cancelled';
      $scope.isShowCL = false;
      $scope.isShowOD = false;
      $scope.isShowA = false;
      $scope.isShowC = false;
      $scope.curTab = "cn";
    }

    //edit/update order
    if($state.params.id){
      $scope.neworder = true;//It's temporary true
      $scope.pageOLoading = true;
      $scope.decId = $scope.hubDecrypt($state.params.id);
      $scope.encId = $state.params.id;
      $scope.tQty = 0;
      $scope.isShowC = false;
      $scope.curCustDetail.custType = "e";
      $scope.curVendDetail.vendType = "e";

      //get type detail
      OdSrv.orderDetail($scope.decId).then(
        function(data){
          $scope.order = data;
          $scope.renewal = $scope.order.renewal;
          $scope.poSFiles = $scope.order.po;
          if($scope.order.pddStatus != 0){
            $scope.isPDDBtn = false;
          }

          if($scope.order.propDeliveryDate){
            $scope.order.propDeliveryDate = {
              startDate:$scope.order.propDeliveryDate,
              endDate:$scope.order.propDeliveryDate
            }
          }

          OdSrv.addressList($scope.order.customerId).then(
            function(data){
              $scope.pageOLoading = false;
              $scope.addressList = data;
              angular.forEach($scope.addressList, function(ads){
                if(ads.id == $scope.order.billingId){
                  $scope.curCustDetail.ebAds = ads;
                }
                if(ads.id == $scope.order.shippingId){
                  $scope.curCustDetail.esAds = ads;
                }
              });
            },
            function(err){
              $log.error(err);
            }
          );
          $scope.custDetail.exist.id = $scope.order.customerId;
          $scope.orderView.quickForm = $scope.order.quickForm;
          if(data.po.label){
            $scope.curFiles.name = data.po.label;
            $scope.curFiles.path = data.po.path;
          } else{
            $scope.curFiles = {name:"", path:""};
          }
          $scope.tmpFiles.name = data.po.label;
          $scope.tmpFiles.path = data.po.path;
          if(!$scope.orderView.quickForm || ($scope.orderView.quickForm && $scope.auth.userType != 2)){
            $scope.orderArr = data.items;
            for(var i = 0; i < $scope.orderArr.length; i++){
              $scope.orderArr[i].t = "db";
            }
            //get total items count
            for(var i = 0; i < $scope.orderArr.length; i++){
              $scope.tQty += $scope.orderArr[i].qty;
            }
          }

          if($scope.auth.id === $scope.order.createdBy.id && $scope.curTab=='cm'){
            $scope.isShowC = true;
            $scope.isShowA = true;
          }
        },
        function(err){
          $log.error(err);
          $scope.pageOLoading = false;
        }
      );
    }

    // //Purchase order or quote
    // $scope.poAttachRemoveFx = function(caller, index){
    //   $scope.tmpFiles = {name:"", path:""};
    //   $scope.curFiles = {name:"", path:""};
    //   // $scope.order.po = {path:"", label:""};

    //   if(caller == "s"){
    //     $scope.poSFiles.splice(index, 1);
    //   } else if(caller == "u"){
    //     $scope.poUFiles.splice(index, 1);
    //   }
    // }

    //get total available type and model
    if($state.params.id || $scope.curState == "support.order.odcu"){
      OdSrv.typeModelList().then(
        function(data){
          $scope.types = data;
        },
        function(err){
          $log.error(err);
        }
      );

      //get shipped by list
      OdSrv.courierList().then(
        function(data){
          $scope.courierList = data;
          $scope.courierList.push({id:$scope.ocId, label:"Other"});
        },
        function(err){
          $log.error(err);
        }
      );
    }

    //add comments
    $scope.addCommentFx = function(id){
      $scope.cmtLoading = true;
      $scope.cmtErr = false;
      $scope.hasErr = false;
      if(!$scope.order.comment){
        $scope.cmtLoading = false;
        $scope.cmtErr = true;
        $scope.errType = "cmtEmpty";
      } else{
        $scope.comment = angular.copy($scope.order.comment);
        $scope.order.comment = "";
        $scope.reqData = {orderId:id,comment:$scope.comment};
        OdSrv.addComment($scope.reqData).then(
          function(data){
            $scope.order.comments = data.comment;
            // if($scope.order.comments.length){
            //   angular.forEach($scope.order.comments, function(comment){
            //     if($scope.getToday(comment.date)){
            //       comment.items.push(data.comment);
            //     }
            //   });
            // } else{
            //   $scope.order.comments.push({date:new Date(), items:[data.comment]});
            // }
            $rootScope.toastNotificationFx("info", data);
            $scope.cmtLoading = false;
            $scope.cmtErr = false;
          },
          function(err){
            $log.error(err);
            $scope.order.comment = "";
            $scope.cmtLoading = false;
            $scope.cmtErr = false;
          }
        );
      }
    }

    $scope.setStatus = function(caller, status){
      $scope.statusObj = {caller:caller, status:status};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
            <span ng-if="statusObj.caller == \'invoiced\' && statusObj.status == 1">{{"od.msg.32" | translate}}</span>\
              <span ng-if="statusObj.caller == \'paymentRec\' && statusObj.status == 1">{{"od.msg.33" | translate}}</span>\
              <span ng-if="statusObj.caller == \'close\' && statusObj.status == 4">{{"od.msg.34" | translate}}</span>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-primary" ng-click="setStatusFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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
      OdSrv.setStatus($scope.statusObj.caller, $scope.decId, $scope.statusObj.status).then(
        function(data){
          $scope.popupProcessing = false;
          if($scope.statusObj.caller == "invoiced"){
            $scope.order.isInvoiced = $scope.statusObj.status;
          } else if($scope.statusObj.caller == "paymentRec"){
            $scope.order.isPaymentRec = $scope.statusObj.status;
          }
          if($scope.order.comments.length){
            angular.forEach($scope.order.comments, function(comment){
              if($scope.getToday(comment.date)){
                comment.items.push(data.comment);
              }
            });
          } else{
            $scope.order.comments.push({date:new Date(), items:[data.comment]});
          }
          if($scope.statusObj.caller == "close"){
            $state.go("support.order.cl");
          }
          ngDialog.close();
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
        }
      );
    }

    $scope.odrRenewalOpen = function(obj){
      $scope.odrAssignObj = {renewalDate:"", renewalAmt:"", orderId:obj.id, comment:""};
      $scope.popupProcessing = false;
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div class="row">\
                <div class="col-xs-6">\
                  <label>Renewal Date</label>\
                  <div class="input-group">\
                    <span class="input-group-addon"><span class="fas fa-calendar-alt"></span></span>\
                    <input type="daterange" class="form-control picker" ng-model="odrAssignObj.renewalDate" format="MM/DD/YYYY" min-date="{{minDate}}" singleDatePicker="true" readonly="">\
                  </div>\
                </div>\
                <div class="col-xs-6">\
                  <label>Renewal Amount</label>\
                  <input type="number" class="form-control" ng-model="odrAssignObj.renewalAmt">\
                </div>\
              </div>\
              <div class="row marT10">\
                <div class="col-xs-12">\
                  <label>{{\'od.label.36\' | translate}}</label>\
                  <textarea class="form-control" ng-model="odrAssignObj.comment"></textarea>\
                </div>\
              </div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-success" ng-click="odrRenewalFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.6" | translate}}</button>\
              <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
              <div class="errMsg pull-right" ng-if="hasPopupErr">\
                <span ng-if="errType == \'eAmt\'">{{"od.msg.35" | translate}}</span>\
              </div>\
            </footer>\
          </section>',
        plain: true,
        width: 500,
        scope: $scope,
        trapFocus: false,
        closeByDocument: false,
        className: "ngdialog-theme-default ngdialog-confirm"
      });
    }
    $scope.odrRenewalFx = function(){
      $scope.hasPopupErr = false;
      $scope.errType = "";
      if($scope.odrAssignObj.rAmount == ""){
        $scope.hasPopupErr = true;
        $scope.errType = "eAmt";
      } else {
        $scope.popupProcessing = true;
        if($scope.odrAssignObj.renewalDate){
          $scope.odrAssignObj.renewalDate = moment(angular.copy($scope.odrAssignObj.renewalDate.startDate)).format("YYYY-MM-DD");
        }
        OdSrv.orderRenewal($scope.odrAssignObj).then(
          function(data){
            if(data.code == 13020){
              $scope.popupProcessing = false;
              $scope.renewal = data.renewal;
              ngDialog.close();
              // $state.go("support.order.cl");
            }
          }
        ),
        function(err){
          $log.error(err);
          $scope.popupProcessing = false;
        }
      }
    }

    $rootScope.fileModelUploadFx = function(data){
      $scope.tmpFiles = "";
      $scope.curFiles = data;
    }

    //Purchase order or quote
    $scope.poAttachRemoveFx = function(caller, index){
      $scope.upRemAttachment = true;
      $scope.tmpFiles = {name:"", path:""};
      $scope.curFiles = {name:"", path:""};
      // $scope.order.po = {path:"", label:""};

      if(caller == "s"){
        $scope.poSFiles.splice(index, 1);
      } else if(caller == "u"){
        $scope.poUFiles.splice(index, 1);
      }
    }

    //update attachments
    // $scope.updateAttachmentFx = function(order){
    //   $scope.orderObj = {id: order.id, po: order.po}
    //   $scope.updateProcessing = true;
    //   OdSrv.uploadAttachment($scope.orderObj, $scope.poSFiles).then(
    //     function(data){
    //       if(data.code == 13002 || data.code == 13001 || data.code == 13004 || data.code == 13005){
    //         $scope.curFiles = {};
    //         $rootScope.toastNotificationFx("info", data);
    //         $scope.updateProcessing = false;
    //         if($scope.poSFiles.length==0){
    //           $scope.upRemAttachment = false;
    //         }
    //         // $state.go("support.order.cl");
    //       }
    //     }
    //   ),
    //   function(err){
    //     $log.error(err);
    //     $scope.updateProcessing = false;
    //   }
    // }

    // Vendor section
    $scope.addVendorOpen = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      ngDialog.open({
        template: 'app/order/popup/addVendor.html',
        width: 500,
        scope: $scope,
        closeByDocument: false,
      });
    }

    // add new vendor
    $scope.addVendorFx = function(){
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
              $scope.resetVendor();
              $scope.tmpVendorList.push(data.data);
              $scope.selectedVendorFx();
              ngDialog.close();
            }
          },
          function(err){
            $log.error(err);
            $scope.popupProcessing = false;
          }
        );
      }
    }

    $scope.resetVendor = function(){
      $scope.curVendDetail = {vendType: "e", label:"", city:"", address:"", country:"", province:"", zip:""};
    }

    $scope.selectVendorOpen = function(caller){
      $scope.popupProcessing = false;
      $scope.popupLoading = true;
      OdSrv.vendorList().then(
        function(data){
          $scope.vendors = data;
          $scope.selected = [];
          if(caller == "c"){
            angular.forEach($scope.order.vendor, function(item){
              $scope.selected[ item.id ] = 1;
            });
            angular.forEach($scope.vendors, function(item){
              if( $scope.selected[item.id] === undefined ){
                // not selected
                item.isSelected = false;
              } else{
                // selected
                item.isSelected = true;
              }
            });
          }
          $scope.popupLoading = false;
        },
        function(err){
          $log.error(err);
          $scope.popupLoading = false;
        }
      );
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-heading">{{"od.label.60" | translate}}<div class="searchTbx bdrR">\
              <input type="text" class="form-control" ng-model="searchText"><a href="" ng-click="searchText=\'\'" class="text-danger"><i class="fas fa-times" ng-if="searchText"></i></a></div>\
            </div>\
            <div class="panel-body">\
              <img alt="" src="../assets/images/loading.gif" ng-if="popupLoading">\
              <div ng-if="!popupLoading">\
                <div class="scrollQuad table table-sm no-th no-pointer" style="max-height:{{getAvailableHeight(510)}}px">\
                  <div class="row" ng-repeat="vendor in vendorList = (vendors | filter:{\'label\': searchText})">\
                    <div class="col-xs-12"><label><input type="checkbox" ng-model="vendor.isSelected" ng-change="selectVendorFx(vendor);"><label></label>{{vendor.label}}</label>\
                    <div class="text-muted text-sm marT-5">{{vendor.address}}</div>\
                    </div>\
                  </div>\
                  <div class="msg-warning" ng-if="vendors.length && !vendorList.length" translate="{{\'cm.msg.14\'}}" translate-values="{searchText: \'<b>&quot;{{searchText.replace(searchRegExp, searchReplaceChar)}}&quot;</b>\'}"></div>\
                  <div class="msg-warning" ng-if="!vendors.length" translate="{{\'cm.msg.41\'}}"></div>\
                </div>\
              </div>\
            </div>\
            <footer class="panel-footer" ng-if="!popupLoading">\
              <span class="btnQuad">\
              <button type="button" class="btn btn-success" ng-click="selectedVendorFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.1" | translate}}</button>\
              <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button></span>\
            </footer>\
          </section>',
        plain: true,
        width: 500,
        scope: $scope,
        closeByDocument: false
      });
    }

    //when check/uncheck vendor list
    $scope.selectVendorFx = function(vendor){
      if(vendor.isSelected){
        $scope.tmpVendorList.push(vendor);
      } else {
        angular.forEach($scope.tmpVendorList, function(item, index){
          if(item.id==vendor.id){
            $scope.tmpVendorList.splice(index, 1);
          }
        });
      }
    }

    $scope.selectedVendorFx = function(){
      $scope.order.vendor = $scope.tmpVendorList;
      $scope.popupProcessing = false;
      ngDialog.close();
    }

    //search customer
    $scope.selectCustomerOpen = function(caller){
      $scope.popupProcessing = false;
      $scope.popupLoading = true;
      OdSrv.customerList().then(
        function(data){
          $scope.customers = data;
          if(caller == "c"){
            angular.forEach($scope.customers, function(item){
              if($scope.custDetail.exist.id == item.id){
                $scope.custDetail.exist = item;
              }
            });
          } else{
            $scope.custDetail.exist = $scope.customers[0];
          }
          $scope.popupLoading = false;
        },
        function(err){
          $log.error(err);
          $scope.popupLoading = false;
        }
      );
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-heading">{{"i.label.20" | translate}}<div class="searchTbx bdrR">\
              <input type="text" class="form-control" ng-model="searchText"><a href="" ng-click="searchText=\'\'" class="text-danger"><i class="fas fa-times" ng-if="searchText"></i></a></div>\
            </div>\
            <div class="panel-body">\
              <img alt="" src="../assets/images/loading.gif" ng-if="popupLoading">\
              <div ng-if="!popupLoading">\
                <div class="scrollQuad table table-sm no-th no-pointer" style="max-height:{{getAvailableHeight(510)}}px">\
                  <div class="row" ng-repeat="customer in cusList = (customers | filter:{\'label\': searchText})">\
                    <div class="col-xs-12"><label><input type="radio" name="cOpt" ng-model="custDetail.exist" ng-value="customer" ng-click="selectCustFx(customer)"><label></label>{{customer.label !=\'\'? customer.label : \'None\'}}</label></div>\
                  </div>\
                  <div class="msg-warning" ng-if="customers.length && !cusList.length" translate="{{\'cm.msg.14\'}}" translate-values="{searchText: \'<b>&quot;{{searchText.replace(searchRegExp, searchReplaceChar)}}&quot;</b>\'}"></div>\
                  <div class="msg-warning" ng-if="!customers.length" translate="{{\'cm.msg.41\'}}"></div>\
                </div>\
              </div>\
            </div>\
            <footer class="panel-footer" ng-if="!popupLoading">\
              <span class="btnQuad">\
              <button type="button" class="btn btn-success" ng-click="selectedCustomerFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.1" | translate}}</button>\
              <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button></span>\
            </footer>\
          </section>',
        plain: true,
        width: 500,
        scope: $scope,
        closeByDocument: false
      });
    }

    $scope.selectCustFx = function(cust){
      $scope.custDetail.exist = cust;
    }

    $scope.selectedCustomerFx = function(){
      $scope.hasErr = false;
      $scope.errType = "";
      $scope.popupProcessing = true;
      $scope.addressList = [];

      OdSrv.addressList($scope.custDetail.exist.id).then(
        function(data){
          $scope.popupProcessing = false;
          $scope.addressList = data;
          $scope.searchText = "";
          $scope.curCustDetail.ebAds = "";
          $scope.curCustDetail.esAds = "";
          angular.forEach($scope.addressList, function(ads){
            if(ads.isDefaultB){
              $scope.curCustDetail.ebAds = ads;
            }
            if(ads.isDefaultS){
              $scope.curCustDetail.esAds = ads;
            }
          });

          if(!$scope.curCustDetail.ebAds){
            $scope.curCustDetail.ebAds = $scope.addressList[0];
          }
          if(!$scope.curCustDetail.esAds){
            $scope.curCustDetail.esAds = $scope.addressList[0];
          }
          $scope.order.name = $scope.custDetail.exist.label;
          $scope.order.email = $scope.custDetail.exist.email;
          $scope.order.phone = $scope.custDetail.exist.phone;
          ngDialog.close();
        },
        function(err){
          $log.error(err);
          $scope.popupProcessing = false;
        }
      );
    }

    // Customer section
    $scope.addCustomerOpen = function(){
      $scope.domainObj = {info:{label:"", new:true}, emails:[], exEmails:[]};
      $scope.includeEmail = {email:""};
      $scope.excludeEmail = {email:""};

      $scope.hasErrPop = false;
      $scope.errType = "";
      $scope.customer.label = "";
      ngDialog.open({
        template: 'app/order/popup/addCustomer.html',
        width: 700,
        scope: $scope,
        closeByDocument: false
      });
      // ngDialog.open({
      //   template: 'app/order/popup/addCustomer.html',
      //   width: 600,
      //   scope: $scope,
      //   closeByDocument: false,
      // });
    }

    $scope.changeCustmerFx = function(){
      if($scope.decId){
        if($scope.curCustDetail.custType == "n"){
          $scope.curCustChangeCopy = angular.copy($scope.order);
          $scope.order.name = "";
        } else{
          $scope.order = $scope.curCustChangeCopy;
        }
      } else{
        $scope.order.name = "";
      }
    }

    $scope.addCustomerFx = function(){
      $scope.hasErrPop = false;
      $scope.existErr = false;
      $scope.existDomain = "";
      $scope.errType = "";
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
              $scope.curCustDetail.custType = "e";
              $scope.custDetail.exist = data.data;
              $scope.selectedCustomerFx();
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

    //upload order and file data
    $scope.orderCUFx = function(order){
      var orderObj = angular.copy(order);
      if(orderObj.propDeliveryDate){
        orderObj.propDeliveryDate = moment(angular.copy(orderObj.propDeliveryDate.startDate)).format("YYYY-MM-DD");
        // {startDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY'), endDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY')},
      }

      FileModelUploadSrv.uploadFileAndData("order", orderObj, $scope.poSFiles).then(
        function(data){
          $scope.saveProcessing = false;
          if(data.code == 13005){
            $rootScope.toastNotificationFx("info", data);
            $state.go('support.order.'+$scope.curTab);
          }
        },
        function(err){
          $log.error(err);
          $rootScope.toastNotificationFx("danger", {"code":5000});
          $scope.saveProcessing = false;
        }
      );
    }

    //add order
    $scope.addOrderFx = function(){
      $scope.cmtErr = false;
      if($scope.order.name != ""){
        if($scope.curCustDetail.custType == "e" && !$scope.curCustDetail.ebAds){
          $scope.hasErr = true;
          $scope.errType = 'bAds';
          return;
        } else if($scope.curCustDetail.custType == "e" && !$scope.curCustDetail.esAds){
          $scope.hasErr = true;
          $scope.errType = 'sAds';
          return;
        }

        if($scope.curCustDetail.custType == "e" && $scope.curCustDetail.ebAds || $scope.curCustDetail.esAds){
          $scope.order.customerId = $scope.custDetail.exist.id;
          $scope.order.billingId = $scope.curCustDetail.ebAds.id;
          $scope.order.shippingId = $scope.curCustDetail.esAds.id;
        }

        if($scope.curCustDetail.custType == "e" && $scope.curCustDetail.ebAds || $scope.curCustDetail.esAds){
          $scope.order.customerId = $scope.custDetail.exist.id;
          $scope.order.billingId = $scope.curCustDetail.ebAds.id;
          $scope.order.shippingId = $scope.curCustDetail.esAds.id;
        }

        if($scope.curCustDetail.custType == "e"){
          if(!$scope.order.customerId){
            $scope.hasErr = true;
            $scope.errType = 'name';
          } else if(!$scope.order.billingId){
            $scope.hasErr = true;
            $scope.errType = 'bAds';
          } else if(!$scope.order.shippingId){
            $scope.hasErr = true;
            $scope.errType = 'sAds';
          }
          // else if($scope.order.courierBy != null && $scope.order.courierBy.id == 10000 && !$scope.order.courierName && !$scope.orderView.quickForm){
          //   $scope.hasErr = true;
          //   $scope.errType = 'cName';
          // } else if(!$scope.order.licenseQty){
          //   $scope.hasErr = true;
          //   $scope.errType = 'lQty';
          // } else if(($scope.order.department == 'f' || $scope.order.department == 'b') && $scope.order.poNumber == ''){
          //   $scope.hasErr = true;
          //   $scope.errType = 'poNum';
          // }
          else if($scope.poSFiles.length == 0){
            $scope.hasErr = true;
            $scope.errType = 'eFile';
          } else{
            $scope.order.shippSameAsBill = 0;
            $scope.orderSaveFx();
          }
        }
      } else {
        // if no customer
        if($scope.curCustDetail.custType == "n"){
          $scope.hasErr = true;
          $scope.errType = 'nCust';
        }
        // else if($scope.order.courierBy != null && $scope.order.courierBy.id == 10000 && !$scope.order.courierName && !$scope.orderView.quickForm){
        //   $scope.hasErr = true;
        //   $scope.errType = 'cName';
        // }
        // else if(!$scope.order.licenseQty){
        //   $scope.hasErr = true;
        //   $scope.errType = 'lQty';
        // } else if(($scope.order.department == 'f' || $scope.order.department == 'b') && $scope.order.poNumber == ''){
        //   $scope.hasErr = true;
        //   $scope.errType = 'poNum';
        // }
        else if($scope.poSFiles.length == 0){
          $scope.hasErr = true;
          $scope.errType = 'eFile';
        } else{
          $scope.order.shippSameAsBill = 0;
          $scope.orderSaveFx();
        }
      }
      // $scope.isValid = $scope.odRValidationFx();
    }

    $scope.orderSaveFx = function(){
      $scope.saveProcessing = true;
      if($scope.order.name==""){
        $scope.order.customerId = 0;
      }
      if($scope.order.status == 2){
        $scope.order.status = 100;
      }
      $scope.orderCUFx($scope.order);
    }

    $scope.changeAdsOpen = function(caller, curAddress){
      $scope.addressObj = {caller:caller, newAds:{name:"", email:"", phone:"", address:"", city:"", zip:"", province:"", country:""}, curAddress:curAddress, show:false};
      if(!$scope.addressObj.curAddress){
        $scope.addressObj.show = true;
      }
      $scope.popupAdsProcessing = false;
      $scope.popupLoading = false;
      $scope.hasErrPop1 = false;
      $scope.hasErrPop = false;
      $scope.hasErr = false;
      $scope.errType = "";
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-heading">\
              Address List\
              <div class="searchTbx bdrR">\
                <input type="text" class="form-control" ng-model="searchText"><a href="" ng-click="searchText=\'\'" class="text-danger"><i class="fas fa-times" ng-if="searchText"></i></a>\
              </div>\
            </div>\
            <div class="panel-body">\
              <img alt="" src="../assets/images/loading.gif" ng-if="popupLoading">\
              <div ng-if="!popupLoading">\
                <div class="text-right marB10"><button type="button" class="btn btn-primary btn-xs" ng-if="addressList.length && !addressObj.show" ng-click="addressObj.show=true; resetAddress();"><span class="fa fa-plus-circle"></span>Add New Address</button></div>\
                <div class="form-group" ng-if="addressObj.show">\
                  <div class="row">\
                    <div class="col-xs-6">\
                      <label>{{"cm.label.1" | translate}}</label>\
                      <input type="text" class="form-control" ng-model="addressObj.newAds.name">\
                    </div>\
                    <div class="col-xs-6">\
                      <label>{{"cm.label.2" | translate}}</label>\
                      <input type="text" class="form-control" ng-model="addressObj.newAds.email">\
                    </div>\
                  </div>\
                  <div class="row marT5">\
                    <div class="col-xs-6">\
                      <label>{{"od.label.49" | translate}}</label>\
                      <input type="text" class="form-control" ng-model="addressObj.newAds.phone">\
                    </div>\
                    <div class="col-xs-6">\
                      <label>{{"od.label.44" | translate}}</label>\
                      <input type="text" class="form-control" ng-model="addressObj.newAds.address">\
                    </div>\
                  </div>\
                  <div class="row marT5">\
                    <div class="col-xs-6">\
                      <label>{{"od.label.45" | translate}}</label>\
                      <input type="text" class="form-control" ng-model="addressObj.newAds.city">\
                    </div>\
                    <div class="col-xs-6">\
                      <label>{{"od.label.46" | translate}}</label>\
                      <input type="text" class="form-control" ng-model="addressObj.newAds.zip">\
                    </div>\
                  </div>\
                  <div class="row marT5">\
                    <div class="col-xs-6">\
                      <label>{{"od.label.47" | translate}}</label>\
                      <input type="text" class="form-control" ng-model="addressObj.newAds.province">\
                    </div>\
                    <div class="col-xs-6">\
                      <label>{{"od.label.48" | translate}}</label>\
                      <input type="text" class="form-control" ng-model="addressObj.newAds.country">\
                    </div>\
                  </div>\
                  <div class="bdr-top-dashed marB10 padB2">\
                    <button type="button" class="btn btn-success btn-sm" ng-click="addAddressesFx();" ng-disabled="popupAdsProcessing"><span class="fas" ng-class="popupAdsProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.6" | translate}}</button>\
                    <button type="button" class="btn btn-link btn-sm" ng-click="adsCancelFx();">{{"cm.btn.8" | translate}}</button></span>\
                    <div class="errMsg pull-right" ng-if="hasErrPop">\
                      <span ng-if="errType == \'name\'">{{"cm.msg.37" | translate}}</span>\
                      <span ng-if="errType == \'ads\'">{{"cm.msg.44" | translate}}</span>\
                      <span ng-if="errType == \'city\'">{{"cm.msg.45" | translate}}</span>\
                      <span ng-if="errType == \'zip\'">{{"cm.msg.46" | translate}}</span>\
                      <span ng-if="errType == \'state\'">{{"cm.msg.47" | translate}}</span>\
                      <span ng-if="errType == \'country\'">{{"cm.msg.48" | translate}}</span>\
                    </div>\
                    <div class="clearfix"></div>\
                  </div>\
                </div>\
                <div class="scrollQuad table table-sm no-th no-pointer" style="max-height:{{getAvailableHeight(510)}}px">\
                  <div class="row" ng-repeat="ads in adsList = (addressList | filter:{\'name\': searchText})">\
                    <div class="col-xs-12">\
                      <div><label><input type="radio" name="adsOpt" ng-model="addressObj.curAddress" ng-value="ads"><label></label>{{ads.name}}</label></div>\
                      <div class="marL5">\
                        <div>{{ads.address}}</div>\
                        <div>{{ads.city +", "+ ads.province +", "+ ads.zip}}</div>\
                        <div>{{ads.country}}</div>\
                      </div>\
                    </div>\
                  </div>\
                  <div class="msg-warning" ng-if="addressList.length && !adsList.length" translate="{{\'cm.msg.14\'}}" translate-values="{searchText: \'<b>&quot;{{searchText.replace(searchRegExp, searchReplaceChar)}}&quot;</b>\'}"></div>\
                </div>\
              </div>\
            </div>\
            <footer class="panel-footer" ng-if="!popupLoading">\
              <span class="btnQuad">\
                <button type="button" class="btn btn-success" ng-click="changeAdsFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.1" | translate}}</button>\
                  <!--<button type="button" class="btn btn-success" ng-click="selectedCustomerFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.1" | translate}}</button>-->\
                <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
              </span>\
              <div class="errMsg pull-right" ng-if="hasErrPop1">\
                <span ng-if="errType == \'adsEmpty\'">{{"od.msg.25" | translate}}</span>\
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

    $scope.resetAddress = function(){
      $scope.addressObj = {caller:caller, newAds:{name:"", email:"", phone:"", address:"", city:"", zip:"", province:"", country:""}, curAddress:curAddress, show:false};
    }

    $scope.addAddressesFx = function(){
      $scope.addressObj.newAds.customerId = $scope.custDetail.exist.id;
      $scope.hasErrPop = false;
      $scope.errType = "";
      if($scope.addressObj.newAds.name == ""){
        $scope.hasErrPop = true;
        $scope.errType = "name";
      } else if($scope.addressObj.newAds.address == ""){
        $scope.hasErrPop = true;
        $scope.errType = "ads";
      } else if($scope.addressObj.newAds.city == ""){
        $scope.hasErrPop = true;
        $scope.errType = "city";
      } else if($scope.addressObj.newAds.zip == ""){
        $scope.hasErrPop = true;
        $scope.errType = "zip";
      } else if($scope.addressObj.newAds.province == ""){
        $scope.hasErrPop = true;
        $scope.errType = "state";
      } else if($scope.addressObj.newAds.country == ""){
        $scope.hasErrPop = true;
        $scope.errType = "country";
      } else{
        $scope.popupAdsProcessing = true;
        OdSrv.addAddresses($scope.addressObj.newAds).then(
          function(data){
            $scope.popupAdsProcessing = false;
            if(data.status == "success"){
              $scope.addressObj.newAds.id = data.id;
              $scope.addressObj.show = false;
              if(!$scope.addressList.lenght){
                $scope.addressObj.curAddress = $scope.addressObj.newAds;
              }
              $scope.addressList.push($scope.addressObj.newAds);
            }
          },
          function(err){
            $log.error(err);
            $scope.popupAdsProcessing = false;
          }
        );
      }
    }

    $scope.adsCancelFx = function(){
      $scope.addressObj.newAds = {name:"", email:"", phone:"", address:"", city:"", zip:"", province:"", country:""};
      $scope.addressObj.show = false;
      $scope.hasErrPop = false;
    }

    $scope.changeAdsFx = function(){
      $scope.hasErrPop1 = false;
      $scope.errType = "";
      if(!$scope.addressObj.curAddress){
        $scope.hasErrPop1 = true;
        $scope.errType = "adsEmpty";
      }
      if($scope.addressObj.caller == "b"){
        $scope.curCustDetail.ebAds = $scope.addressObj.curAddress;
      } else{
        $scope.curCustDetail.esAds = $scope.addressObj.curAddress;
      }

      if(!$scope.curCustDetail.ebAds){
        $scope.curCustDetail.ebAds = $scope.addressObj.curAddress;
      }
      if(!$scope.curCustDetail.esAds){
        $scope.curCustDetail.esAds = $scope.addressObj.curAddress;
      }
      ngDialog.close();
    }
  }
})();
