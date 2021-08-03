(function (){
'use strict';

angular
  .module('support')
  .controller('OrderCUController', OrderCUController);

  /** @ngInject */
  function OrderCUController($log, $rootScope, $scope, $state, $sce, $filter, ngDialog, OdSrv, FileModelUploadSrv, SettingsSrv){
    $rootScope.search = {show:($scope.curState == 'support.order.odcu'?false:true), text:"", adv:false};
    $rootScope.selectedMenu = 7;

    $scope.curState = $state.current.name;
    $scope.curTab = $state.params.types;
    $scope.vendor = {};
    $scope.tmpVendorList = [];
    $scope.customer = {label:""}

    $scope.orderView = {quickForm:null};

    $scope.poUFiles = [];
    $scope.poSFiles = [];
    $scope.upRemAttachment = false;

    $scope.orderFormat = ["jpg","jpeg","png","doc","docx","pdf"];

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

    $scope.orderCopy = {
      id:"",
      name:"",

      b_zip:"",
      b_name:"",
      b_city:"",
      b_email:"",
      b_phone:"",
      b_address:"",
      b_country:"",
      b_province:"",

      s_zip:"",
      s_name:"",
      s_city:"",
      s_email:"",
      s_phone:"",
      s_address:"",
      s_country:"",
      s_province:"",

      items:[],
      comment:"",
      status:"0",
      poNumber:"",
      country:"ca",
      department:"s",
      pddStatus:0,
      licenseQty:1,
      paymentReq:0,
      isNewServer:0,
      courierName:"",
      accountStatus:0,
      supportStatus:0,
      trackingNumber:"",
      prefServerName:"",
      shippSameAsBill:1,
      serverLocation:"US",
      po:{path:"", label:""},
      courierBy:{id:"", label:""},
      propDeliveryDate:{startDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY'), endDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY')}
    };

    $scope.order = angular.copy($scope.orderCopy);

    $scope.tmpOrder = {id:"", iid:"", label:"", model:"", qty:"", sn:{id:"", sn:""}};

    $scope.curCustDetail = {custType:"n", nbAds:{name:"", city:"", email:"", phone:"", address:"", country:"", province:"", zip:""}, nsAds:{name:"", city:"", email:"", phone:"", address:"", country:"", province:"", zip:""}, ebAds:{}, esAds:{}};

    $scope.curVendDetail = {vendType:"e", label:"", city:"", address:"", country:"", province:"", zip:""};

    $scope.curFiles = {name:"", path:""};
    $scope.tmpFiles = {name:"", path:""};

    $scope.custDetail = {exist:{}};
    $scope.tmpAvailableItem = 0;
    $scope.isAvailable = true;
    $scope.typeModelName = "";
    $scope.availableItem = 0;
    $scope.isDisabled = true;
    $scope.sn = {data:""};
    $scope.content = false;
    $scope.servReq = false;
    $scope.hasErr = false;
    $scope.listType = "r";
    $scope.tempCount = 0;
    $scope.orderArr = [];
    $scope.addType = "";
    $scope.totalQty = 0;
    $scope.ocId = 10000;
    $scope.typeObj = {};
    $scope.errType = "";
    $scope.tempNo = "";
    $scope.tmpArr = [];
    $scope.odCount = 0;
    $scope.bucket = "";
    $scope.encId = "";
    $scope.decId = "";
    $scope.count = 0;
    $scope.tim = "";

    $scope.uiVersionFx();

    $scope.$on("curStateBroadcast", function(event, args){
      $scope.curState = args.curState;
    });

    $scope.isShowC = true;
    $scope.isShowA = true;
    $scope.isShowD = true;
    $scope.isShowLSO = true;
    $scope.isShowPDD = true;
    $scope.isShowPON = true;
    $scope.isShowPOQ = true;
    $scope.isShowPS = true;
    $scope.isShowNSN = true;
    $scope.isShowNSL = true;
    $scope.isShowPAE = true;
    $scope.isEditable = true;
    $scope.isPDDBtn = false;
    $scope.isShowRB = false;
    $scope.isShowST = false;

    $scope.checkAssisFx = function(){
      // console.error($scope.auth.id +" == "+ $scope.order.createdBy.id +" as"+ $scope.order.accountStatus +" ss"+ $scope.order.supportStatus);
      if($scope.order.isActivityBySupp_Acc == 0){
        if($scope.auth.id != $scope.order.createdBy.id){
          $scope.isShowC = false;
          $scope.isShowA = false;
          $scope.isShowD = false;
          $scope.isShowLSO = false;
          $scope.isShowPDD = false;
          $scope.isShowPON = false;
          $scope.isShowPOQ = false;
          $scope.isShowPS = false;
          $scope.isShowNSN = false;
          $scope.isShowNSL = false;
          $scope.isShowPAE = false;

          if($scope.auth.userType != 2 && $scope.auth.userType != 3){
            if($scope.order.poNumber == ""){
              $scope.isShowPON = true;
            }
            if($scope.curFiles.name == ""){
              $scope.isShowPOQ = true;
            }
            if($scope.order.isNewServer && $scope.order.prefServerName == ""){
              $scope.isShowNSN = true;
            }
            if($scope.order.isNewServer && $scope.order.licenseQty == ""){
              $scope.isShowNSL = true;
            }
            if($scope.order.isNewServer && $scope.order.paEmail == ""){
              $scope.isShowPAE = true;
            }
          }
        } else if(($scope.auth.userType == 2 || $scope.auth.userType == 3) && ($scope.order.accountStatus != 0 || ($scope.order.supportStatus != 0 && $scope.order.supportStatus != 1))){
          $scope.isShowC = false;
          $scope.isShowA = false;
          $scope.isShowD = false;
          $scope.isShowLSO = false;
          $scope.isShowPDD = false;
          $scope.isShowPON = false;
          $scope.isShowPOQ = false;
          $scope.isShowPS = false;
          $scope.isShowNSN = false;
          $scope.isShowNSL = false;
          $scope.isShowPAE = false;
        } else if($scope.auth.userType != 2 && $scope.auth.userType != 3 && ($scope.order.accountStatus != 0 || ($scope.order.supportStatus != 0 && $scope.order.supportStatus != 1))){
          $scope.isShowC = false;
          $scope.isShowA = false;
          $scope.isShowD = false;
          $scope.isShowLSO = false;
          $scope.isShowPDD = false;
          $scope.isShowPON = false;
          $scope.isShowPOQ = false;
          $scope.isShowPS = false;
          $scope.isShowNSN = false;
          $scope.isShowNSL = false;
          $scope.isShowPAE = false;
          // if($scope.order.country == ""){
          //   $scope.isShowLSO = true;
          // }
          if($scope.order.poNumber == ""){
            $scope.isShowPON = true;
          }
          if($scope.curFiles.name == ""){
            $scope.isShowPOQ = true;
          }
          if($scope.order.isNewServer && $scope.order.prefServerName == ""){
            $scope.isShowNSN = true;
          }
          if($scope.order.isNewServer && $scope.order.licenseQty == ""){
            $scope.isShowNSL = true;
          }
          if($scope.order.isNewServer && $scope.order.paEmail == ""){
            $scope.isShowPAE = true;
          }
        }
      } else {
        $scope.isShowC = false;
        $scope.isShowA = false;
        $scope.isShowD = false;
        $scope.isShowLSO = false;
        $scope.isShowPDD = false;
        $scope.isShowPON = false;
        $scope.isShowPOQ = false;
        $scope.isShowPS = false;
        $scope.isShowNSN = false;
        $scope.isShowNSL = false;
        $scope.isShowPAE = false;
        $scope.isShowUB = false;

        if($scope.order.poNumber == ""){
          $scope.isShowPON = true;
          $scope.isShowUB = true;
        }
        if($scope.order.po.length == 0){
          $scope.isShowPOQ = true;
          $scope.isShowUB = true;
        }
      }

      if($scope.order.pddStatus == 0 && $scope.auth.userType == 1){
        $scope.isPDDBtn = true;
      }

      if($scope.order.pddStatus != 0 && $scope.auth.userType == 1){
        // $scope.isPDDBtn = true;
        // if($scope.order.country == ""){
        //   $scope.isShowLSO = true;
        // }
      }
    }
    if($scope.curTab == "c"){
      $scope.curTab = "cn";
    } else if($scope.curTab == "d" && $state.params.id){
      $scope.isShowC = false;
      $scope.isShowA = false;
      $scope.isShowD = false;
      $scope.isShowLSO = false;
      $scope.isShowPDD = false;
      $scope.isShowPON = false;
      $scope.isShowPOQ = false;
      $scope.isShowPS = false;
      $scope.isShowNSN = false;
      $scope.isShowNSL = false;
      $scope.isShowPAE = false;
      $scope.isEditable = false;
      $scope.isShowRB = true;
      $scope.isShowST = true;
    }
    //edit/update order
    if($state.params.id){
      $scope.neworder = true;//It's temporary true
      $scope.pageOLoading = true;
      $scope.decId = $scope.hubDecrypt($state.params.id);
      $scope.encId = $state.params.id;
      $scope.tQty = 0;
      $scope.curCustDetail.custType = "e";
      $scope.curVendDetail.vendType = "e";
      //get type detail
      OdSrv.orderDetail($scope.decId).then(
        function(data){
          $scope.order = data;
          $scope.poSFiles = $scope.order.po;
          $scope.copyTrNumber = angular.copy($scope.order.trackingNumber);
          $scope.copyCourierBy = angular.copy($scope.order.courierBy);
          if($scope.order.pddStatus != 0){
            $scope.isPDDBtn = false;
          }

          if($scope.order.propDeliveryDate){
            $scope.order.propDeliveryDate = {
              startDate:$scope.order.propDeliveryDate,
              endDate:$scope.order.propDeliveryDate
            }
          }
          $scope.tmpVendorList = $scope.order.vendor;

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
          if($scope.curTab != "d"){
            $scope.checkAssisFx();
          }
          if($scope.auth.id == $scope.order.createdBy.id){
            $scope.isShowC = true;
            $scope.isShowA = true;
          }
        },
        function(err){
          $log.error(err);
          $scope.pageOLoading = false;
        }
      );
    } else{
      $scope.neworder = true;
      $scope.curCustDetail.custType = "e";
      if($scope.auth.userType != 2){
        $scope.orderView.quickForm = 0;
      } else{
        $scope.orderView.quickForm = 1;
      }
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

    //Purchase order or quote
    $scope.poAttachRemoveFx = function(caller, index){
      $scope.tmpFiles = {name:"", path:""};
      $scope.curFiles = {name:"", path:""};
      $scope.upRemAttachment = true;
      // $scope.order.po = {path:"", label:""};

      if(caller == "s"){
        $scope.poSFiles.splice(index, 1);
      } else if(caller == "u"){
        $scope.poUFiles.splice(index, 1);
      }
    }

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

    //select type
    $scope.selectedType = function(){
      $scope.modelList = [];
      $scope.odCount = 0;
      $scope.isAvailable = true;
      $scope.tmpOrder.model = "";
      $scope.tmpOrder.qty = "";
      $scope.isDisabled = true;

      for(var i = 0; i < $scope.types.length; i++){
        //check selected type with list of type
        if($scope.types[i].id == $scope.tmpOrder.id){
          $scope.modelList = $scope.types[i].model;
          $scope.tmpOrder.iid = $scope.types[i].iid;
          //if modellist is empty
          if($scope.modelList.length == 0){
            $scope.availableItem = $scope.types[i].qty;
            $scope.typeModelName = $scope.types[i].label;
          }
          $scope.tmpOrder.label = $scope.types[i].label;
          $scope.isDisabled = false;
          break;
        } else{
          $scope.modelList = "";
        }
      }
    }

    //select model
    $scope.selectedModel = function(){
      $scope.modelObj = JSON.parse($scope.tmpOrder.model);
      $scope.odCount = 0;
      for(var i = 0; i < $scope.modelList.length; i++){
        if($scope.modelList[i].id == $scope.modelObj.id){
          $scope.availableItem = $scope.modelList[i].qty;
          $scope.typeModelName = $scope.modelList[i].label;
        }
      }
    }

    $scope.closeDialogFx = function (){
      if($scope.odData.aType == 'ut'){
        $scope.order.trackingNumber = $scope.tnObj.tempCopy;
      }
      this.closeThisDialog();
    }

    //order item validation
    $scope.odItemValidation = function(){
      $scope.hasErr = false;
      $scope.hasOdErr = false;
      $scope.tmpOrder.sn = "";
      if($scope.tmpOrder.id == '' || $scope.tmpOrder.id == null){
        $scope.hasOdErr = true;
        $scope.errType = 'type';
        $scope.tmpOrder.qty = "";
        return false;
      } else if($scope.modelList.length && ($scope.tmpOrder.model == '' || $scope.tmpOrder.model == null)){
        $scope.hasOdErr = true;
        $scope.errType = 'model';
        $scope.tmpOrder.qty = "";
        return false;
      } else if($scope.tmpOrder.qty == '' || $scope.tmpOrder.qty == null){
        $scope.hasOdErr = true;
        $scope.errType = 'qty';
        $scope.tmpOrder.qty = "";
        return false;
      } else{
        return true;
      }
    }

    //check if order already selected
    $scope.checkOrderExist = function (tId, mId, arr){
      $scope.status = false;
      for (var i = 0; i < arr.length; i++){
        var typeId = arr[i].id;
        if(arr[i].model != ''){
          var modelId = arr[i].model.id;
          if(typeId == tId && modelId == mId){
            $scope.status = true;
            break;
          } else{
            $scope.status = false;
          }
        } else{
          if(typeId == tId){
            $scope.status = true;
            break;
          }
        }
      }
      return $scope.status;
    }

    //add order items row
    $scope.addItemFx = function(){
      $scope.isValid = $scope.odItemValidation();
      if($scope.isValid){
        // if($scope.availableItem < $scope.tmpOrder.qty){
        //   $scope.isAvailable = false;
        //   return;
        // } else{
          if($scope.tmpOrder.model != ''){
            $scope.tmpOrder.model = JSON.parse($scope.tmpOrder.model);
          }
          $scope.tempCount = angular.copy($scope.tmpOrder.qty);
          for (var i = 0; i < $scope.orderArr.length; i++){
            if($scope.orderArr[i].t != "db"){
              if($scope.tmpOrder.id == $scope.orderArr[i].id){
                if($scope.tmpOrder.model != ''){
                  if($scope.tmpOrder.model.label == $scope.orderArr[i].model.label){
                    $scope.tempCount += $scope.orderArr[i].qty;
                  }
                }
                else{
                  $scope.tempCount += $scope.orderArr[i].qty;
                }
              }
            }
          }
        // }

        // if($scope.availableItem < $scope.tempCount){
        //   $scope.isAvailable = false;
        //   $scope.tmpOrder.model = "";
        //   return;
        // }

        // if($scope.availableItem >= $scope.tempCount){
          $scope.tQty = 0;
          // if($scope.orderArr.length > 0){
          //   if($scope.tmpOrder.model != ""){
          //     $scope.modelId = $scope.tmpOrder.model.id;
          //   } else{
          //     $scope.modelId = '';
          //   }
          //   if($scope.tmpOrder.id != '1'){
          //     $scope.tmpOrder.sn = "";
          //     $scope.isTypeExist = $scope.checkOrderExist($scope.tmpOrder.id, $scope.modelId, $scope.orderArr);
          //   } else{
          //     $scope.isTypeExist = false;
          //   }

          //   if($scope.isTypeExist){
          //     for (var i = 0; i < $scope.orderArr.length; i++){
          //       if($scope.orderArr[i].id == $scope.tmpOrder.id){
          //         if($scope.orderArr[i].model != "" || $scope.orderArr[i].model.length > 0){
          //           if($scope.orderArr[i].model.id == $scope.modelId){
          //             if(!$scope.decId){
          //               $scope.orderArr[i].qty = $scope.tempCount;
          //             } else{
          //               $scope.orderArr[i].qty += $scope.tempCount;
          //               $scope.orderArr[i].t = "cu";
          //             }
          //           }
          //         } else{
          //           if(!$scope.decId){
          //             $scope.orderArr[i].qty = $scope.tempCount;
          //           } else{
          //             $scope.orderArr[i].qty += $scope.tempCount;
          //             $scope.orderArr[i].t = "cu";
          //           }
          //         }
          //       }
          //     }
          //   } else{
          //     $scope.count = $scope.tmpOrder.qty;
          //     if($scope.tmpOrder.id == '1' && $scope.count > 0){
          //       for (var index = 0; index < $scope.count; index++){
          //         $scope.tmpOrder.qty = 1;
          //         delete $scope.tmpOrder.model.qty;
          //         $scope.orderArr.push(angular.copy($scope.tmpOrder));
          //       }
          //     } else{
          //       delete $scope.tmpOrder.model.qty;
          //       if($scope.orderArr.length > 0){
          //         $scope.odCount = 0;
          //         for (var i = 0; i < $scope.orderArr.length; i++){
          //           if($scope.orderArr[i].id == $scope.tmpOrder.id){
          //             $scope.odCount = $scope.orderArr[i].qty;
          //           }
          //         }
          //       }
          //       $scope.orderArr.push(angular.copy($scope.tmpOrder));
          //     }
          //   }
          // }
          // else{
            $scope.count = $scope.tmpOrder.qty;
            if($scope.tmpOrder.id == '1' && $scope.count > 0){
              for (var index = 0; index < $scope.count; index++){
                $scope.tmpOrder.qty = 1;
                delete $scope.tmpOrder.model.qty;
                $scope.orderArr.push(angular.copy($scope.tmpOrder));
              }
            } else{
              delete $scope.tmpOrder.model.qty;
              $scope.orderArr.push(angular.copy($scope.tmpOrder));
            }
          // }
          // $scope.availableItem = 0;
        //   $scope.isAvailable = true;
        // }
        // else{
        //   $scope.isAvailable = false;
        //   return;
        // }
        //get total items count
        for (var i = 0; i < $scope.orderArr.length; i++){
          $scope.tQty += $scope.orderArr[i].qty;
        }
        $scope.tmpOrder = { id: "", iid: "", label: "", qty: "", model: "", sn: "" };
        $scope.modelList = "";
        $scope.odCount = 0;
        $scope.tempCount = 0;
      }
    }

    //delete order item
    $scope.deleteOrderItem = function(index){
      $scope.confirmOthObj = {index:index};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">{{"i.msg.18" | translate}}</div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-danger" ng-click="deleteOrderItemFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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
    $scope.deleteOrderItemFx = function(){
      $scope.popupProcessing = false;
      $scope.orderArr.splice($scope.confirmOthObj.index, 1);
      $scope.tmpOrder = {id:"", label:"", model:"", qty:"", sn:{id:"", sn:""}, iid:""};
      // $scope.typeArr.splice($scope.confirmOthObj.index, 1);
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
                  <div class="row" ng-repeat="customer in cusList = (customers | filter:{\'label\': searchText})" ng-click="selectCustFx(customer)">\
                    <div class="col-xs-12"><label><input type="radio" name="cOpt" ng-model="custDetail.exist" ng-value="customer"><label></label>{{customer.label !=\'\'? customer.label : \'None\'}}</label></div>\
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

    $rootScope.fileModelUploadFx = function(data){
      $scope.tmpFiles = "";
      $scope.curFiles = data;
    }

    //search serial number
    $scope.selectSNOpen = function(index, typeId, modelId){
      $scope.snObj = {index:index, typeId:typeId, modelId:modelId};
      $scope.tempSerial = [];
      $scope.popupLoading = true;
      OdSrv.snList(typeId, modelId).then(
        function (data){
          $scope.serials = data;
          $scope.popupLoading = false;
          for (var i = 0; i < $scope.serials.length; i++){
            $scope.isDuplicate = false;
            for (var j = 0; j < $scope.orderArr.length; j++){
              if($scope.orderArr[j].sn.sn == $scope.serials[i].sn){
                $scope.isDuplicate = true;
              }
            }
            if(!$scope.isDuplicate){
              $scope.tempSerial.push($scope.serials[i]);
            }
          }
          $scope.sn.data = $scope.tempSerial[0];
        },
        function (err){
          $log.error(err);
          $scope.popupLoading = false;
        }
      );
      ngDialog.open({
        template: 'app/order/popup/serialNumber.html',
        width: 500,
        scope: $scope,
        closeByDocument: false,
      });
    }

    $scope.selectSnFx = function(){
      for (var i = 0; i < $scope.tempSerial.length; i++){
        if($scope.tempSerial[i].sn == $scope.sn.data.sn){
          $scope.tmpOrder.sn = { id: $scope.tempSerial[i].id, sn: $scope.tempSerial[i].sn };
          $scope.orderArr[$scope.snObj.index].sn = { id: $scope.tempSerial[i].id, sn: $scope.tempSerial[i].sn };
        }
      }
      $scope.odCount = 0;
      $scope.search.sn = "";
      ngDialog.close();
    }

    //upload order and file data
    $scope.orderCUFx = function(order, action){
      var orderObj = angular.copy(order);
      if(orderObj.propDeliveryDate){
        orderObj.propDeliveryDate = moment(angular.copy(orderObj.propDeliveryDate.startDate)).format("YYYY-MM-DD");
        // {startDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY'), endDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY')},
      }

      FileModelUploadSrv.uploadFileAndData("order", orderObj, $scope.poSFiles).then(
        function(data){
          if(action == 'd'){
            $state.go('support.order.d');
          } else if(action == 'cm'){
            $state.go('support.order.cm');
          } else{
            $state.go('support.order.r');
          }
          $scope.popupProcessing = false;
          if(data.code == 13002 || data.code == 13001 || data.code == 13004 || data.code == 13005){
            $scope.curFiles = {};
            $rootScope.toastNotificationFx("info", data);
            ngDialog.close();
          }
          $scope.popupProcessing = false;
        },
        function(err){
          $log.error(err);
          $rootScope.toastNotificationFx("danger", {"code":5000});
          $scope.popupProcessing = false;
        }
      );
    }

    //add order
    $scope.addOrderFx = function(action){
      $scope.action = action;
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

        // if($scope.curCustDetail.custType == "n"){
        //   $scope.order.b_zip = $scope.curCustDetail.nbAds.zip;
        //   $scope.order.b_name = $scope.curCustDetail.nbAds.name;
        //   $scope.order.b_city = $scope.curCustDetail.nbAds.city;
        //   $scope.order.b_email = $scope.curCustDetail.nbAds.email;
        //   $scope.order.b_phone = $scope.curCustDetail.nbAds.phone;
        //   $scope.order.b_address = $scope.curCustDetail.nbAds.address;
        //   $scope.order.b_country = $scope.curCustDetail.nbAds.country;
        //   $scope.order.b_province = $scope.curCustDetail.nbAds.province;

        //   $scope.order.s_zip = $scope.curCustDetail.nsAds.zip;
        //   $scope.order.s_name = $scope.curCustDetail.nsAds.name;
        //   $scope.order.s_city = $scope.curCustDetail.nsAds.city;
        //   $scope.order.s_email = $scope.curCustDetail.nsAds.email;
        //   $scope.order.s_phone = $scope.curCustDetail.nsAds.phone;
        //   $scope.order.s_address = $scope.curCustDetail.nsAds.address;
        //   $scope.order.s_country = $scope.curCustDetail.nsAds.country;
        //   $scope.order.s_province = $scope.curCustDetail.nsAds.province;
        // } else
        if($scope.curCustDetail.custType == "e" && $scope.curCustDetail.ebAds || $scope.curCustDetail.esAds){
          $scope.order.customerId = $scope.custDetail.exist.id;
          $scope.order.billingId = $scope.curCustDetail.ebAds.id;
          $scope.order.shippingId = $scope.curCustDetail.esAds.id;
        }

        // if($scope.curCustDetail.custType == "n"){
        //   $scope.hasErr = false;
        //   $scope.errType = null;
          // else if(!$scope.order.b_address){
          //   $scope.hasErr = true;
          //   $scope.errType = "bAds";
          // } else if(!$scope.order.b_city){
          //   $scope.hasErr = true;
          //   $scope.errType = "bCity";
          // } else if(!$scope.order.b_zip){
          //   $scope.hasErr = true;
          //   $scope.errType = "bZip";
          // } else if(!$scope.order.b_province){
          //   $scope.hasErr = true;
          //   $scope.errType = "bState";
          // } else if(!$scope.order.b_country){
          //   $scope.hasErr = true;
          //   $scope.errType = "bCountry";
          // } else if(!$scope.order.s_name && !$scope.order.shippSameAsBill){
          //   $scope.hasErr = true;
          //   $scope.errType = "sName";
          // } else if(!$scope.order.s_address && !$scope.order.shippSameAsBill){
          //   $scope.hasErr = true;
          //   $scope.errType = "sAds";
          // } else if(!$scope.order.s_city && !$scope.order.shippSameAsBill){
          //   $scope.hasErr = true;
          //   $scope.errType = "sCity";
          // } else if(!$scope.order.s_zip && !$scope.order.shippSameAsBill){
          //   $scope.hasErr = true;
          //   $scope.errType = "sZip";
          // } else if(!$scope.order.s_province && !$scope.order.shippSameAsBill){
          //   $scope.hasErr = true;
          //   $scope.errType = "sState";
          // } else if(!$scope.order.s_country && !$scope.order.shippSameAsBill){
          //   $scope.hasErr = true;
          //   $scope.errType = "sCountry";
          // } else
        //   if($scope.order.courierBy != null && $scope.order.courierBy.id == 10000 && !$scope.order.courierName && !$scope.orderView.quickForm){
        //     $scope.hasErr = true;
        //     $scope.errType = 'cName';
        //   } else if(!$scope.order.licenseQty){
        //     $scope.hasErr = true;
        //     $scope.errType = 'lQty';
        //   } else if(!$scope.order.licenseQty){
        //     $scope.hasErr = true;
        //     $scope.errType = 'lQty';
        //   } else if(($scope.order.department == 'f' || $scope.order.department == 'b') && $scope.order.poNumber == ''){
        //     $scope.hasErr = true;
        //     $scope.errType = 'poNum';
        //   } else if($scope.poSFiles.length == 0){
        //     $scope.hasErr = true;
        //     $scope.errType = 'eFile';
        //   } else{
        //     if($scope.decId){
        //       $scope.order.customerId = 0;
        //     }
        //     $scope.orderSaveFx(action);
        //   }
        // } else
        if($scope.curCustDetail.custType == "e"){
          if(!$scope.order.billingId){
            $scope.hasErr = true;
            $scope.errType = 'bAds';
          } else if(!$scope.order.shippingId){
            $scope.hasErr = true;
            $scope.errType = 'sAds';
          } else if($scope.order.courierBy != null && $scope.order.courierBy.id == 10000 && !$scope.order.courierName && !$scope.orderView.quickForm){
            $scope.hasErr = true;
            $scope.errType = 'cName';
          } else if(!$scope.order.licenseQty){
            $scope.hasErr = true;
            $scope.errType = 'lQty';
          } else if(($scope.order.department == 'f' || $scope.order.department == 'b') && $scope.order.poNumber == ''){
            $scope.hasErr = true;
            $scope.errType = 'poNum';
          } else if($scope.poSFiles.length == 0){
            $scope.hasErr = true;
            $scope.errType = 'eFile';
          } else{
            $scope.order.shippSameAsBill = 0;
            $scope.orderSaveFx(action);
          }
        }
      } else {
        // if no customer
        if($scope.curCustDetail.custType == "n"){
          $scope.hasErr = true;
          $scope.errType = 'nCust';
        } else if($scope.order.courierBy != null && $scope.order.courierBy.id == 10000 && !$scope.order.courierName && !$scope.orderView.quickForm){
          $scope.hasErr = true;
          $scope.errType = 'cName';
        } else if(!$scope.order.licenseQty){
          $scope.hasErr = true;
          $scope.errType = 'lQty';
        } else if(($scope.order.department == 'f' || $scope.order.department == 'b') && $scope.order.poNumber == ''){
          $scope.hasErr = true;
          $scope.errType = 'poNum';
        } else if($scope.poSFiles.length == 0){
          $scope.hasErr = true;
          $scope.errType = 'eFile';
        } else{
          $scope.order.shippSameAsBill = 0;
          $scope.orderSaveFx(action);
        }
      }
      // $scope.isValid = $scope.odRValidationFx();
    }

    $scope.orderSaveFx = function(action){
      if($scope.order.name==""){
        $scope.order.customerId = 0;
      }
      if($scope.order.comment && action == "c"){
        $scope.addCommentFx($scope.order.id);
      }
      $scope.saveProcessing = true;

      if($scope.orderView.quickForm && $scope.auth.userType != 2 && $scope.decId && $scope.order.items.length == 0 && action == 'd'){
        $scope.quickDispatch = true;
      } else{
        $scope.quickDispatch = false;
      }

      if(!$scope.orderView.quickForm || ($scope.orderView.quickForm && $scope.auth.userType != 2)){
        for(var i = 0; i < $scope.orderArr.length; i++){
          if($scope.orderArr[i].id == 1){
            if($scope.orderArr[i].sn == ''){
              $scope.hasOdErr = true;
              $scope.errType = 'sn';
              $scope.saveProcessing = false;
              $scope.quickDispatch = false;
              return false;
            }
          }
        }

        if($scope.order.courierBy != null && $scope.order.courierBy.id == '10000'){
          $scope.order.courierBy.label = $scope.order.courierName;
        }
      }

      $scope.order.items = $scope.orderArr;
      $scope.order.quickForm = Number($scope.orderView.quickForm);

      if(action == 'd' && $scope.order.status==0){
        $scope.order.status = 1;
      } else if(action == 'd' && $scope.order.status==1){
        $scope.order.status = 100;
      } else if(action == 'r'){
        $scope.order.status = 0;
      } else if(action == 'cm' && $scope.order.status==1){
        $scope.order.status = 2;
      } else if(action == 'cm' && $scope.order.status==2){
        $scope.order.status = 100;
      }
      if(action == 'cm'){
        $scope.saveProcessing = false;
        $scope.odrRTBOpen();
      } else {
        $scope.orderCUFx($scope.order, action);
      }
    }

    $scope.odrRTBOpen = function(){
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div>{{"i.msg.21" | translate}}</div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-danger" ng-click="odrRTBFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
              <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
              <div class="errMsg pull-right" ng-if="hasPopupErr">\
                <span ng-if="errType == \'cReason\'">Please provide cancellation reason.</span>\
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

    $scope.odrRTBFx = function(){
      $scope.popupProcessing = true;
      $scope.odrActionObj = {caller:'cm', reason:"", id:$scope.order.id, curTrackingNumber:$scope.order.trackingNumber, courierBy:$scope.order.courierBy, item:$scope.order.item, quickForm:$scope.order.quickForm, date:"", time:new Date().getTime()};

      if($scope.order.propDeliveryDate){
        $scope.order.propDeliveryDate = moment(angular.copy($scope.order.propDeliveryDate.startDate)).format("YYYY-MM-DD");
      }

      FileModelUploadSrv.uploadFileAndData("order", $scope.order, $scope.poSFiles).then(
        function(data){
          OdSrv.orderDCAction($scope.odrActionObj).then(
            function(data){
              if(data.code == 13001 || data.code == 13003 || data.code == 13004 || data.code == 13007){
                $scope.popupProcessing = false;
                ngDialog.close();
                // $scope.getOrderList();
                $state.go('support.order.cm');
              }
            }
          ),
          function(err){
            $log.error(err);
          }
        },
        function(err){
          $log.error(err);
          $rootScope.toastNotificationFx("danger", {"code":5000});
          $scope.popupProcessing = false;
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
            // $scope.order.comments.push({date:new Date(), items:[data.comment]});
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
      if($scope.statusObj.caller == "deliveryDate" && $scope.statusObj.status == 8){
        $scope.isShowPDD = true;
        $scope.isPDDBtn = false;
        $scope.order.pddStatus = 2;
      } else{
        ngDialog.open({
          template: '\
            <section class="panel">\
              <div class="panel-body">\
                <span ng-if="statusObj.caller == \'account\' && statusObj.status == 1">{{"od.msg.26" | translate}}</span>\
                <span ng-if="statusObj.caller == \'support\' && statusObj.status == 2">{{"od.msg.27" | translate}}</span>\
                <span ng-if="statusObj.caller == \'support\' && statusObj.status == 3">{{"od.msg.28" | translate}}</span>\
                <span ng-if="statusObj.caller == \'deliveryDate\' && statusObj.status == 6">{{"od.msg.29" | translate}}</span>\
                <span ng-if="statusObj.caller == \'deliveryDate\' && statusObj.status == 7">{{"od.msg.30" | translate}}</span>\
                <span ng-if="statusObj.caller == \'close\' && statusObj.status == 4">{{"od.msg.34" | translate}}</span>\
              </div>\
              <footer class="panel-footer">\
                <button type="button" class="btn" ng-class="statusObj.caller == \'deliveryDate\' && statusObj.status == 7?\'btn-danger\':\'btn-primary\'" ng-click="setStatusFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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
    }

    $scope.setStatusFx = function(){
      $scope.popupProcessing = true;
      OdSrv.setStatus($scope.statusObj.caller, $scope.decId, $scope.statusObj.status).then(
        function(data){
          $scope.popupProcessing = false;
          if($scope.statusObj.caller == "account"){
            $scope.order.accountStatus = $scope.statusObj.status;
          } else if($scope.statusObj.caller == "support"){
            $scope.order.supportStatus = $scope.statusObj.status;
          } else if($scope.statusObj.caller == "deliveryDate" && $scope.statusObj.status == 6){
            $scope.order.pddStatus = 1;
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
          $scope.checkAssisFx();
          ngDialog.close();
        },
        function(err){
          $scope.popupProcessing = false;
          $log.error(err);
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
      // $scope.hasErrPop = false;
      // $scope.errType = null;
      // if(!$scope.customer.label){
      //   $scope.hasErrPop = true;
      //   $scope.errType = "name";
      // } else{
      //   $scope.popupProcessing = true;
      //   console.log("add :", JSON.stringify($scope.customer))
      //   OdSrv.addCustomer($scope.customer).then(
      //     function(data){
      //       $scope.popupProcessing = false;
      //       if(data.code == 14003){
      //         $scope.hasErrPop = true;
      //         $scope.errType = "cExist";
      //       } else {
      //         ngDialog.close();
      //         $scope.customer.label = "";
      //       }
      //     },
      //     function(err){
      //       $log.error(err);
      //       $scope.popupProcessing = false;
      //     }
      //   );
      // }
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

    // $scope.odrActionOpen = function(obj){
    //   $scope.odrActionObj = {caller:'c', reason:"", id:obj.id, curTrackingNumber:obj.trackingNumber, courierBy:obj.courierBy, item:obj.item, quickForm:obj.quickForm, date:"", time:new Date().getTime()};
    //   $scope.popupProcessing = false;
    //   $scope.hasPopupErr = false;
    //   $scope.errType = "";
    //   ngDialog.open({
    //     template: '\
    //       <section class="panel">\
    //         <div class="panel-body">\
    //           <div>\
    //             <div class="marB15">{{"i.msg.18" | translate}}</div>\
    //             <label>Reason for cancellation</label>\
    //             <textarea class="form-control" ng-model="odrActionObj.reason"></textarea>\
    //           </div>\
    //         </div>\
    //         <footer class="panel-footer">\
    //           <button type="button" class="btn btn-danger" ng-click="odrActionFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
    //           <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
    //           <div class="errMsg pull-right" ng-if="hasPopupErr">\
    //             <span ng-if="errType == \'cReason\'">Please provide cancellation reason.</span>\
    //           </div>\
    //         </footer>\
    //       </section>',
    //     plain: true,
    //     width: 500,
    //     scope: $scope,
    //     trapFocus: false,
    //     closeByDocument: false,
    //     className: "ngdialog-theme-default ngdialog-confirm"
    //   });
    // }

    $scope.odrCancelFx = function(){
      $scope.hasPopupErr = false;
      $scope.errType = "";
      if($scope.odrActionObj.reason == ""){
        $scope.hasPopupErr = true;
        $scope.errType = "cReason";
      } else{
        $scope.popupProcessing = true;
        OdSrv.orderDCAction($scope.odrActionObj).then(
          function(data){
            if(data.code == 13001 || data.code == 13003 || data.code == 13004 || data.code == 13007){
              $scope.popupProcessing = false;
              ngDialog.close();
              $state.go('support.order.cn');
            }
          }
        ),
        function(err){
          $log.error(err);
          $scope.popupProcessing = false;
        }
      }
    }

    // $scope.odrActionSave = function(){
    //   $scope.popupProcessing = true;
    //   OdSrv.orderDCAction($scope.odrActionObj).then(
    //     function(data){
    //       if(data.code == 13001 || data.code == 13003 || data.code == 13004 || data.code == 13007){
    //         $scope.popupProcessing = false;
    //         ngDialog.close();
    //         // $scope.getOrderList();
    //         if($scope.odrActionObj.caller == 'c'){
    //           $state.go('support.order.cn');
    //         } else if($scope.odrActionObj.caller == 'cm'){
    //           $state.go('support.order.cm');
    //         } else{
    //           $state.go('support.order.r');
    //         }
    //       }
    //     }
    //   ),
    //   function(err){
    //     $log.error(err);
    //     $scope.popupProcessing = false;
    //   }
    // }

    // $scope.cancelOrder = function(caller, id){
    //   $scope.odrCancelObj = {id:id, caller:caller, reason:""};
    //   $scope.popupProcessing = false;
    //   $scope.hasPopupErr = false;
    //   $scope.errType = "";
    //   ngDialog.open({
    //     template: '\
    //       <section class="panel">\
    //         <div class="panel-body">\
    //           <div class="marB15">{{"i.msg.18" | translate}}</div>\
    //           <label>Reason for cancellation</label>\
    //           <textarea class="form-control" ng-model="odrCancelObj.reason"></textarea>\
    //         </div>\
    //         <footer class="panel-footer">\
    //           <button type="button" class="btn btn-danger" ng-click="cancelOrderFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
    //           <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
    //           <div class="errMsg pull-right" ng-if="hasPopupErr">\
    //             <span ng-if="errType == \'cReason\'">Please provide cancellation reason.</span>\
    //           </div>\
    //         </footer>\
    //       </section>',
    //     plain: true,
    //     width: 500,
    //     scope: $scope,
    //     trapFocus: false,
    //     closeByDocument: false,
    //     className: "ngdialog-theme-default ngdialog-confirm"
    //   });
    // }

    // $scope.cancelOrderFx = function(){
    //   $scope.hasPopupErr = false;
    //   $scope.errType = "";
    //   if($scope.odrCancelObj.reason == ""){
    //     $scope.hasPopupErr = true;
    //     $scope.errType = "cReason";
    //   } else{
    //     $scope.popupProcessing = true;
    //     OdSrv.orderDCAction($scope.odrCancelObj).then(
    //       function(data){
    //         if(data.code == 13003){
    //           $scope.popupProcessing = false;
    //           ngDialog.close();
    //           $state.go("support.order."+ $scope.curTab);
    //         }
    //       }
    //     ),
    //     function(err){
    //       $log.error(err);
    //       $scope.popupProcessing = false;
    //     }
    //   }
    // }

    // $scope.updateDetailFx = function(){
    //   $scope.updateProcessing = true;
    //   if($scope.order.propDeliveryDate){
    //     $scope.order.propDeliveryDate = moment(angular.copy($scope.order.propDeliveryDate.startDate)).format("YYYY-MM-DD");
    //     // {startDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY'), endDate:moment(moment()._d).add(14, 'days').format('MM-DD-YYYY')},
    //   }
    //   FileModelUploadSrv.uploadFileAndData("order", $scope.order, $scope.poSFiles).then(
    //     function(data){
    //       $scope.updateProcessing = false;
    //       if(data.code == 13005){
    //         $rootScope.toastNotificationFx("info", data);
    //         $state.go('support.order.'+$scope.curTab);
    //       }
    //     },
    //     function(err){
    //       $log.error(err);
    //       $rootScope.toastNotificationFx("danger", {"code":5000});
    //       $scope.updateProcessing = false;
    //     }
    //   );
    // }
  }
})();
