(function(){
'use strict';

angular
  .module('support')
  .controller('OrderController', OrderController);

  /** @ngInject */
  function OrderController($log, $rootScope, $scope, $state, $sce, $filter, $cookies, ngDialog, OdSrv, FileModelUploadSrv, CommonSrv){
    $rootScope.search = {show:($scope.curState == 'support.order.odcu'?false:true), text:"", adv:true};
    $rootScope.selectedMenu = 7;
    $scope.add = {n:""};

    $rootScope.curOdFilter = {apply:false, customer:null, vendor:null, country:null, department:null, courierBy:null, createdBy:null, isNewServer:null, keywords:null, id:null, createdOn:{isOn:false}};
    $scope.curStateName = "";

    $scope.curState = $state.current.name;
    $scope.curTab = $state.params.types;
    if($scope.curTab == 'c'){
      $scope.curTab = 'cn';
    }

    if($scope.auth.userType != 2){
      $scope.type = {quickForm:0};
    } else{
      $scope.type = {quickForm:1};
    }

    $scope.order = {id: "", name: "", billingName: "", addShipping: "", addBilling: "", shippSameAsBill: 1, email: "", phone: "", poNumber: "", courierBy: {id: "", label: "" }, courierName: "", trackingNumber: "", comment: "", items:[], status: "0", isNewServer: 0, licenseQty: 1, serverLocation: "US", prefServerName: "", paymentReq:0, po: {path: "", label: "" }};

    $scope.tmpOrder = {id: "", label: "", model: [], qty: "", sn: {id: "", sn: "" }, iid: ""};

    $scope.maxDate = moment().format('YYYY-MM-DD');

    $scope.curFiles = {name: "", path: ""};
    $scope.tmpFiles = {name: "", path: ""};
    $scope.tmpAvailableItem = 0;
    $scope.isAvailable = true;
    $scope.typeModelName = "";
    $scope.availableItem = 0;
    $scope.isDisabled = true;
    $scope.tmpOrder.model = "";
    $scope.sn = {data: ""};
    $scope.content = false;
    $scope.listType = "r";
    $scope.itemMode = "c";
    $scope.tempCount = 0;
    $scope.orderArr = [];
    $scope.ocId = 10000;
    $scope.typeObj = {};
    $scope.odList = {};
    $scope.addType = "";
    $scope.tempNo = "";
    $scope.tmpArr = [];
    $scope.odCount = 0;
    $scope.bucket = "";
    $scope.encId = "";
    $scope.decId = "";
    $scope.count = 0;
    $scope.tim = "";
    $scope.servReq = false;
    $scope.totalQty = 0;
    $scope.custDetail = {};
    $scope.preState = "";

    $scope.uiVersionFx();
    //get all order list
    $rootScope.getOrderList = function(caller){
      $scope.pageLoading = true;
      if($scope.curState == 'support.order.r'){
        $scope.listType = "r";
        $rootScope.curStateName = "r";
      } else if($scope.curState == 'support.order.d'){
        $scope.listType = "d";
        $rootScope.curStateName = "d";
      } else if($scope.curState == 'support.order.cm'){
        $scope.listType = "cm";
        $rootScope.curStateName = "cm";
      } else if($scope.curState == 'support.order.cn'){
        $scope.listType = "c";
        $rootScope.curStateName = "c";
      } else if($scope.curState == 'support.order.cl'){
        $scope.listType = "cl";
        $rootScope.curStateName = "cl";
      }

      //make icon active on column
      if($scope.auth.sort.ord.type == 'i'){
        $scope.activeColumnFx('odId');
      } else if($scope.auth.sort.ord.type == 'cr'){
        $scope.activeColumnFx('createdBy');
      } else if($scope.auth.sort.ord.type == 'dept'){
        $scope.activeColumnFx('department');
      } else if($scope.auth.sort.ord.type == 'dis'){
        $scope.activeColumnFx('dispatch');
      } else if($scope.auth.sort.ord.type == 'comp'){
        $scope.activeColumnFx('complete');
      } else if($scope.auth.sort.ord.type == 'clos'){
        $scope.activeColumnFx('closed');
      } else if($scope.auth.sort.ord.type == 'canc'){
        $scope.activeColumnFx('cancel');
      }

      //Advanced Filter
      $scope.curOdFilterObj = angular.fromJson(localStorage.getItem("curOdFilterObj"));
      if(!caller){
        $rootScope.filterObj = {};
      }
      if($scope.curOdFilterObj){
        OdSrv.orderListFilter($scope.listType, $scope.curOdFilterObj).then(
          function(data){
            $rootScope.curOdFilter = {apply:true, customer:$scope.curOdFilterObj.customer, vendor:$scope.curOdFilterObj.vendor, country:$scope.curOdFilterObj.country, department:$scope.curOdFilterObj.department, courierBy:$scope.curOdFilterObj.courierBy, createdBy:$scope.curOdFilterObj.createdBy, isNewServer:$scope.curOdFilterObj.isNewServer, keywords:$scope.curOdFilterObj.keywords, id:$scope.curOdFilterObj.id, createdOn:$scope.curOdFilterObj.createdOn};
            if(caller == "refresh"){
              if(data && data.length > 0){
                $scope.odList = data;
                $scope.curOrderList = data;
              }
            } else{
              $scope.odList = data;
              $scope.curOrderList = data;
            }
            $scope.orderListCopy = angular.copy($scope.curOrderList);
            $rootScope.orderFilterFx();
            $scope.pageLoading = false;
            // $rootScope.search.text="";
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
        return;
      } else {
        OdSrv.orderList($scope.listType).then(
          function(data){
            $scope.odList = data;
            $scope.pageLoading = false;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $rootScope.getOrderList();

    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
    });

    /*Filter*/
    $rootScope.oFilterOpen = function(){
      $rootScope.filterObj = {customer:"", vendor:"", country:"", department:"", courierBy:"", createdBy:"", isNewServer:"", keywords:"", id:"",
        createdOn:{isOn:false, dateRange:{startDate:moment().subtract(1, "month")._d, endDate:moment()._d, sd:"", ed:""}}
      };

      $scope.popupProcessing = false;
      $scope.popupLoading = true;
      $scope.hasErrPop = false;
      $scope.filters = {};
      // $rootScope.curOdFilter.popApply = true;
      OdSrv.getFilters().then(
        function(data){
          $scope.popupLoading = false;
          $scope.filters = data;
          if($rootScope.curOdFilter.apply){
            $rootScope.filterObj.customer = $rootScope.curOdFilter.customer;
            $rootScope.filterObj.vendor = $rootScope.curOdFilter.vendor;
            $rootScope.filterObj.country = $rootScope.curOdFilter.country;
            $rootScope.filterObj.department = $rootScope.curOdFilter.department;
            $rootScope.filterObj.courierBy = $rootScope.curOdFilter.courierBy;
            $rootScope.filterObj.createdBy = $rootScope.curOdFilter.createdBy;
            $rootScope.filterObj.isNewServer = $rootScope.curOdFilter.isNewServer;
            $rootScope.filterObj.keywords = $rootScope.curOdFilter.keywords;
            $rootScope.filterObj.id = $rootScope.curOdFilter.id;
            $rootScope.filterObj.createdOn = $rootScope.curOdFilter.createdOn;
          }
        },
        function(err){
          $scope.popupLoading = false;
          $log.error(err);
        }
      );
      ngDialog.open({
        template:'app/order/popup/orderFilter.html',
        width: 850,
        scope: $scope,
        closeByDocument: false,
        preCloseCallback: function(caller){
          if(angular.isUndefined(caller)){
            $rootScope.curOdFilter.popApply = false;
          }
        }
      });
    }

    $rootScope.filterOdrFx = function(caller){
      $scope.hasErrPop = false;
      if(caller == "tab"){
        $scope.pageLoading = true;
      } else if(caller == "clear"){
        $rootScope.filterObj.customer = $rootScope.curOdFilter.customer;
        $rootScope.filterObj.vendor = $rootScope.curOdFilter.vendor;
        $rootScope.filterObj.country = $rootScope.curOdFilter.country;
        $rootScope.filterObj.department = $rootScope.curOdFilter.department;
        $rootScope.filterObj.courierBy = $rootScope.curOdFilter.courierBy;
        $rootScope.filterObj.createdBy = $rootScope.curOdFilter.createdBy;
        $rootScope.filterObj.isNewServer = $rootScope.curOdFilter.isNewServer;
        $rootScope.filterObj.keywords = $rootScope.curOdFilter.keywords;
        $rootScope.filterObj.id = $rootScope.curOdFilter.id;
        $rootScope.filterObj.createdOn = $rootScope.curOdFilter.createdOn;
      }
      if((!$rootScope.filterObj.customer || $rootScope.filterObj.customer === "") && (!$rootScope.filterObj.vendor || $rootScope.filterObj.vendor === "") && (!$rootScope.filterObj.country || $rootScope.filterObj.country === "") && (!$rootScope.filterObj.department || $rootScope.filterObj.department === "") && (!$rootScope.filterObj.courierBy || $rootScope.filterObj.courierBy === "") && (!$rootScope.filterObj.createdBy || $rootScope.filterObj.createdBy === "") && !$rootScope.filterObj.isNewServer && $rootScope.filterObj.keywords === "" && $rootScope.filterObj.id === "" && !$rootScope.filterObj.createdOn.isOn){
        $scope.hasErrPop = true;
      } else{
        if(!caller){
          $scope.popupProcessing = true;
        }

        if($rootScope.filterObj.createdOn.isOn){
          $rootScope.filterObj.createdOn.dateRange.sd = moment($rootScope.filterObj.createdOn.dateRange.startDate).format("YYYY-MM-DD");
          $rootScope.filterObj.createdOn.dateRange.ed = moment($rootScope.filterObj.createdOn.dateRange.endDate).format("YYYY-MM-DD");
        }

        localStorage.removeItem("curOdFilterObj");/*Clear filter obj*/
        localStorage.setItem("curOdFilterObj", JSON.stringify($rootScope.filterObj));

        OdSrv.orderListFilter($scope.listType, $rootScope.filterObj).then(
          function(data){
            $rootScope.curOdFilter = {apply:true, customer:$rootScope.filterObj.customer, vendor:$rootScope.filterObj.vendor, country:$rootScope.filterObj.country, department:$rootScope.filterObj.department, courierBy:$rootScope.filterObj.courierBy, createdBy:$rootScope.filterObj.createdBy, isNewServer:$rootScope.filterObj.isNewServer, keywords:$rootScope.filterObj.keywords, id:$rootScope.filterObj.id, createdOn:$rootScope.filterObj.createdOn};

            $scope.odList = data;
            $scope.curOrderList = data;
            $scope.orderListCopy = angular.copy($scope.curOrderList);
            $scope.popupProcessing = false;
            $rootScope.search.text = "";
            $scope.pageLoading = false;
            // $state.go($state.current, {}, {reload: true});
            if(!caller){
              $rootScope.curOdFilter.popApply = false;
              ngDialog.close();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $scope.pageLoading = false;
            $log.error(err);
          }
        );

      }
    }
    $rootScope.clearOdrFilterFx = function(caller){
      if(caller == "cu"){
        $rootScope.curOdFilter.customer = null;
      }
      else if(caller == "v"){
        $rootScope.curOdFilter.vendor = null;
      }
      else if(caller == "co"){
        $rootScope.curOdFilter.country = null;
      }
      else if(caller == "de"){
        $rootScope.curOdFilter.department = null;
      }
      else if(caller == "sh"){
        $rootScope.curOdFilter.courierBy = null;
      }
      else if(caller == "crBy"){
        $rootScope.curOdFilter.createdBy = null;
      }
      else if(caller == "ns"){
        $rootScope.curOdFilter.isNewServer = 0;
      }
      else if(caller == "t"){
        $rootScope.curOdFilter.keywords = null;
      }
      else if(caller == "id"){
        $rootScope.curOdFilter.id = null;
      }
      else if(caller == "crOn"){
        $rootScope.curOdFilter.createdOn.isOn = false;
      }

      localStorage.removeItem("curOdFilterObj");/*Clear filter obj*/
      localStorage.setItem("curOdFilterObj", JSON.stringify($rootScope.curOdFilter));

      if(caller == "all" || (!$rootScope.curOdFilter.customer && !$rootScope.curOdFilter.vendor && !$rootScope.curOdFilter.country && !$rootScope.curOdFilter.department && !$rootScope.curOdFilter.courierBy && !$rootScope.curOdFilter.createdBy && !$rootScope.curOdFilter.isNewServer && !$rootScope.curOdFilter.keywords && !$rootScope.curOdFilter.id && !$rootScope.curOdFilter.createdOn.isOn)){
        localStorage.removeItem("curOdFilterObj");/*Clear filter obj*/
        $rootScope.curOdFilter = {apply:false, customer:null, vendor:null, country:null, department:null, courierBy:null, createdBy:null, isNewServer:null, keywords:null, id:null, createdOn:{isOn:false}};
        $rootScope.search.text="";
        $rootScope.getOrderList();
      } else{
        $rootScope.filterOdrFx("clear");
      }
    }
    $rootScope.orderFilterFx = function(caller){
      if(caller == "all"){
        $scope.odList = angular.copy($scope.orderListCopy);
      }
    }

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

    //delete order
    $scope.deleteOrder = function(oId){
      $scope.id = oId;
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">{{"od.msg.1" | translate}}</div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-danger" ng-click="deleteOrderFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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

    $scope.deleteOrderFx = function(){
      $scope.popupProcessing = true;
      //delete order
      OdSrv.deleteOrder($scope.id).then(
        function(data){
          if(data.code == 13006){
            $rootScope.toastNotificationFx("info", data);
            $scope.popupProcessing = false;
            ngDialog.close();
            $state.reload();
          }
        }
      ),
        function(err){
          $log.error(err);
          $scope.popupProcessing = false;
        }
    }

    $rootScope.fileModelUploadFx = function(data){
      $scope.tmpFiles = "";
      $scope.curFiles = data;
    }

    //order dispatch validation
    $scope.odDValidationFx = function(action){
      $scope.hasErr = false;
      $scope.hasOdErr = false;
      if($scope.order.name == '' || $scope.order.name == null){
        $scope.hasErr = true;
        $scope.errType = 'name';
        return false;
      } else if(($scope.order.addBilling == '' || $scope.order.addBilling == null) && !$scope.type.quickForm){
        $scope.hasErr = true;
        $scope.errType = 'addr';
        return false;
      } else if($scope.order.billingName == '' || $scope.order.billingName == null && $scope.type.quickForm){
        $scope.hasErr = true;
        $scope.errType = 'bName';
        return false;
      } else if($scope.order.email == '' || $scope.order.email == null){
        $scope.hasErr = true;
        $scope.errType = 'email';
        return false;
      } else if($scope.order.courierBy != null && $scope.order.courierBy.id == 10000 && !$scope.order.courierName && !$scope.type.quickForm){
        $scope.hasErr = true;
        $scope.errType = 'cName';
        return false;
      } else if($scope.order.licenseQty == null && $scope.type.quickForm){
        $scope.hasErr = true;
        $scope.errType = 'lQty';
        return false;
      } else if(($scope.order.courierBy == null || ($scope.order.courierBy != null && $scope.order.courierBy.id == '')) && !$scope.type.quickForm && action=='d'){
        $scope.hasErr = true;
        $scope.errType = 'courier';
        return false;
      } else if($scope.order.courierBy != null && $scope.order.courierBy.id == 10000 && !$scope.order.courierName && !$scope.type.quickForm && action=='d'){
        $scope.hasErr = true;
        $scope.errType = 'cName';
        return false;
      }
      else{
        return true;
      }
    }

    //order reserve validation
    $scope.odRValidationFx = function(){
      $scope.hasErr = false;
      $scope.hasOdErr = false;

      if($scope.order.name == '' || $scope.order.name == null){
        $scope.hasErr = true;
        $scope.errType = 'name';
        return false;
      } else if(($scope.order.addBilling == '' || $scope.order.addBilling == null) && $scope.type.quickForm==0){
        $scope.hasErr = true;
        $scope.errType = 'addr';
        return false;
      } else if($scope.order.billingName == '' || $scope.order.billingName == null && $scope.type.quickForm){
        $scope.hasErr = true;
        $scope.errType = 'bName';
        return false;
      } else if($scope.order.email == '' || $scope.order.email == null && $scope.type.quickForm){
        $scope.hasErr = true;
        $scope.errType = 'email';
        return false;
      } else if($scope.order.courierBy != null && $scope.order.courierBy.id == 10000 && !$scope.order.courierName && !$scope.type.quickForm){
        $scope.hasErr = true;
        $scope.errType = 'cName';
        return false;
      } else if($scope.order.licenseQty == null && $scope.type.quickForm){
        $scope.hasErr = true;
        $scope.errType = 'lQty';
        return false;
      } else{
        return true;
      }
    }

    //calling from up & dispatch and up & complete
    $scope.orderFx = function(action, trNo){
      $scope.action = action;
      $scope.odData = {aType:action};
      if($scope.itemMode == 'u'){
        $scope.order.trackingNumber = trNo;
      }
      $scope.isValid = $scope.odDValidationFx(action);
      if($scope.isValid){
        //check if sn not empty
        if(($scope.auth.userType != 2 && !$scope.type.quickForm) || ($scope.auth.userType != 2 && $scope.type.quickForm)){
          for(var i = 0; i < $scope.orderArr.length; i++){
            if($scope.orderArr[i].id == 1){
              if($scope.orderArr[i].sn == ''){
                $scope.hasOdErr = true;
                $scope.errType = 'sn';
                return false;
              }
            }
          }
          $scope.order.items = $scope.orderArr;
        }
        //quick form && support user && updDisp
        if($scope.type.quickForm && $scope.auth.userType != 2 && $scope.decId && $scope.order.items.length > 0){
          //update & dispatch quick form when (quickForm = !sales = item>0)
          $scope.updDispQuickForm(action);
        } else if($scope.type.quickForm && $scope.auth.userType != 2 && $scope.decId && $scope.order.items.length == 0){
          $scope.addOrderFx(action);
        } else{
          if(action == 'c'){
            // complete popup
            ngDialog.open({
              template: '\
                <section class="panel">\
                  <div class="panel-body">{{"i.msg.21" | translate}}</div>\
                  <footer class="panel-footer">\
                    <button type="button" class="btn btn-success" ng-click="addOrderFx(\'c\');" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
                    <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.8" | translate}}</button>\
                  </footer>\
                </section>',
              plain: true,
              width: 500,
              scope: $scope,
              closeByDocument: false,
              className: "ngdialog-theme-default ngdialog-confirm"
            });
          } else if(action == 'd'){
            ngDialog.open({
              template: '\
                <section class="panel">\
                  <div class="panel-body">{{"i.msg.20" | translate}}\
                    <div class="form-group marT20">\
                      <label>{{\'i.label.11\' | translate}}</label>\
                      <input type="text" class="form-control" ng-model="order.trackingNumber">\
                    </div>\
                  </div>\
                  <footer class="panel-footer">\
                    <button type="button" class="btn btn-success" ng-click="addOrderFx(\'d\');" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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
      }
    }

    //upload order and file data
    $scope.upOrderAndFileData = function(order, file, action){
      FileModelUploadSrv.uploadFileAndData("order", order, file).then(
        function(data){
          if(action == 'd'){
            $state.go('support.order.d');
          } else if(action == 'c'){
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
          $rootScope.toastNotificationFx("danger", {"code": 5000 });
          $scope.popupProcessing = false;
        }
      );
    }

    $scope.updDispQuickForm = function(action){
      $scope.isValid = $scope.odRValidationFx();
      if($scope.isValid){
        $scope.hasPopupErr = false;
        $scope.orderPopupLoading = true;
        //get shipped by list
        OdSrv.courierList().then(
          function(data){
            $scope.orderPopupLoading = false;
            $scope.courierList = data;
            $scope.courierList.push({id:$scope.ocId, label:"Other"})
          },
          function(err){
            $log.error(err);
          }
        );
        $scope.tnObj = {tempCopy:angular.copy($scope.order.trackingNumber), tempNo:""};
        $scope.odData = {aType:action, courierBy:$scope.order.courierBy};
        //ut = update tracking number only
        $scope.order.trackingNumber = $scope.tnObj.tempNo;
        $scope.dialog = ngDialog.open({
          template: '\
            <section class="panel">\
              <div class="panel-body">{{odData.aType == \'d\' ? \'i.msg.20\':\'\' | translate}}\
              <div class="clearfix"></div>\
              <img class="marT10" src="assets/images/loading.gif" ng-if="orderPopupLoading">\
              <div class="marT20" ng-if="!orderPopupLoading">\
                <div class="form-group" ng-if="odData.aType == \'d\'">\
                  <label>{{\'i.label.13\' | translate}}</label>\
                  <select class="form-control" ng-model="odData.courierBy" ng-options="courier.label for courier in courierList track by courier.id">\
                    <option value="">{{"i.msg.7" | translate}}</option>\
                  </select>\
                </div>\
                <div class="form-group" ng-if="odData.courierBy.id==ocId">\
                  <label>{{\'od.label.13\' | translate}}</label>\
                  <input type="text" class="form-control" ng-model="odData.courierName">\
                </div>\
                <div class="form-group" ng-class="odData.aType == \'d\' ? \'marT20\':\'\'">\
                  <label>{{\'i.label.11\' | translate}}</label>\
                  <input type="text" class="form-control" ng-model="tnObj.tempNo">\
                </div>\
              </div>\
              </div>\
              <footer class="panel-footer">\
                <button type="button" class="btn btn-success" ng-click="updDisQuickFormFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{odData.aType == \'d\' ? "cm.btn.2" : "cm.btn.6" | translate}}</button>\
                <button type="button" class="btn btn-link" ng-click="closeDialogFx();">{{"cm.btn.8" | translate}}</button>\
                <div class="errMsg pull-right" ng-if="hasPopupErr">\
                  <span ng-if="errType == \'cName\'">{{"i.msg.29" | translate}}</span>\
                  <span ng-if="errType == \'courier\'">{{"i.msg.14" | translate}}</span>\
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

    //update & dispatch quick order
    $scope.updDisQuickFormFx = function(){
      $scope.order.trackingNumber = $scope.tnObj.tempNo;
      var action = $scope.odData.aType;
      $scope.popupProcessing = true;
      if($scope.odData.aType != 'ut'){
        if($scope.odData.courierBy == null || $scope.odData.courierBy.id == 0){
          $scope.hasPopupErr = true;
          $scope.errType = "courier";
          $scope.popupProcessing = false;
          return;
        }
        if($scope.odData.courierBy != undefined && $scope.odData.courierBy.id == $scope.ocId){
          if($scope.odData.courierName == undefined || $scope.odData.courierName == ""){
            $scope.hasPopupErr = true;
            $scope.errType = "cName";
            $scope.popupProcessing = false;
            return;
          }
          $scope.odData.courierBy.label = $scope.odData.courierName;
        }
        $scope.order.courierBy = $scope.odData.courierBy;
      }
      if(action == 'd'){
        $scope.order.status = 1;
      } else if(action == 'r'){
        $scope.order.status = 0;
      } else if(action == 'c'){
        $scope.order.status = 2;
      }
      $scope.upOrderAndFileData($scope.order, $scope.curFiles, action);
    }

    //add order
    $scope.addOrderFx = function(action){
      $scope.action = action;
      // $scope.isValid = $scope.odRValidationFx();
      $scope.isValid = true;

      if($scope.isValid){
        $scope.popupProcessing = true;
        if($scope.type.quickForm && $scope.auth.userType != 2 && $scope.decId && $scope.order.items.length == 0 && action == 'd'){
          $scope.quickDispatch = true;
        } else{
          $scope.quickDispatch = false;
        }

        // if($scope.orderArr.length == 0 && !$scope.type.quickForm){
        //   $scope.hasOdErr = true;
        //   $scope.errType = 'orderItem';
        //   $scope.popupProcessing = false;
        //   $scope.quickDispatch = false;
        //   return false;
        // }
        if(!$scope.type.quickForm || ($scope.type.quickForm && $scope.auth.userType != 2)){
          for(var i = 0; i < $scope.orderArr.length; i++){
            if($scope.orderArr[i].id == 1){
              if($scope.orderArr[i].sn == ''){
                $scope.hasOdErr = true;
                $scope.errType = 'sn';
                //   $scope.isValidate = false;
                $scope.popupProcessing = false;
                $scope.quickDispatch = false;
                return false;
              }
            }
          }

          if($scope.order.courierBy != null && $scope.order.courierBy.id == '10000'){
            $scope.order.courierBy.label = $scope.order.courierName;
          }
        }
        //for send id of address
        $scope.order.addBilling = $scope.order.addBilling.id;
        if($scope.order.shippSameAsBill!=1){
          $scope.order.addShipping = $scope.order.addShipping.id;
        }

        $scope.order.items = $scope.orderArr;
        $scope.order.quickForm = Number($scope.type.quickForm);
        if(action == 'd'){
          $scope.order.status = 1;
        } else if(action == 'r'){
          $scope.order.status = 0;
        } else if(action == 'c'){
          $scope.order.status = 2;
        }
        $scope.upOrderAndFileData($scope.order, $scope.curFiles, action);
      }
    }

    $scope.closeDialogFx = function(){
      if($scope.odData.aType == 'ut'){
        $scope.order.trackingNumber = $scope.tnObj.tempCopy;
      }
      this.closeThisDialog();
    }

    $scope.dateChange = function(){
      $scope.selectedDate = moment(angular.copy($scope.odrActionObj.date.startDate)).format("YYYY-MM-DD");
      $scope.curDate = moment(new Date()).format("YYYY-MM-DD");
      if($scope.curDate == $scope.selectedDate){
        $scope.maxTime = new Date();
      } else{
        $scope.maxTime = "";
      }
    }

    $scope.odrCancelOpen = function(obj){
      $scope.odrObj = {caller: 'c', reason:"", id:obj.id, curTrackingNumber:obj.trackingNumber, courierBy:obj.courierBy, item:obj.item, quickForm:obj.quickForm, date:"", time:new Date().getTime()};
      $scope.popupProcessing = false;
      $scope.hasPopupErr = false;
      $scope.errType = "";
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              <div>\
                <div class="marB15">{{"i.msg.18" | translate}}</div>\
                <label>Reason for cancellation</label>\
                <textarea class="form-control" ng-model="odrObj.reason"></textarea>\
              </div>\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-danger" ng-click="odrCancelFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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

    $scope.odrCancelFx = function(){
      $scope.hasPopupErr = false;
      $scope.errType = "";
      if($scope.odrObj.reason == ""){
        $scope.hasPopupErr = true;
        $scope.errType = "cReason";
      } else{
        $scope.popupProcessing = true;
        OdSrv.orderDCAction($scope.odrObj).then(
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

    //reopen order
    $scope.orderReopen = function(id){
      $scope.confirmOthObj = {id:id};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">{{"i.msg.31" | translate}}</div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-primary" ng-click="orderReopenFx();" ng-disabled="popupProcessing"><span class="fas" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
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
    $scope.orderReopenFx = function(){
      $scope.popupProcessing = true;
      OdSrv.orderReopen($scope.confirmOthObj.id).then(
        function(data){
          if(data.code == 13021){
            $scope.popupProcessing = false;
            ngDialog.close();
            $state.go("support.order.r");
          }
        }
      ),
      function(err){
        $log.error(err);
        $scope.popupProcessing = false;
      }
    }
    // ready to billed tabs
    $scope.tabFx = function(tab, caller){
      $scope.pageLoading = true;
      if(caller=="ri"){
        $scope.listType = "cm/"+caller;
        $scope.selectedT = 2;
      } else if(caller=="rp"){
        $scope.listType = "cm/"+caller;
        $scope.selectedT = 3;
      } else {
        $scope.listType = "cm";
        $scope.selectedT = 1;
      }

      if($scope.curOdFilterObj){
        OdSrv.orderListFilter($scope.listType, $scope.curOdFilterObj).then(
          function(data){
            $rootScope.curOdFilter = {apply:true, customer:$scope.curOdFilterObj.customer, vendor:$scope.curOdFilterObj.vendor, country:$scope.curOdFilterObj.country, department:$scope.curOdFilterObj.department, courierBy:$scope.curOdFilterObj.courierBy, createdBy:$scope.curOdFilterObj.createdBy, isNewServer:$scope.curOdFilterObj.isNewServer, keywords:$scope.curOdFilterObj.keywords, id:$scope.curOdFilterObj.id, createdOn:$scope.curOdFilterObj.createdOn};
            if(caller == "refresh"){
              if(data && data.length > 0){
                $scope.odList = data;
                $scope.curOrderList = data;
              }
            } else{
              $scope.odList = data;
              $scope.curOrderList = data;
            }
            $scope.orderListCopy = angular.copy($scope.curOrderList);
            $rootScope.orderFilterFx();
            $scope.pageLoading = false;
            // $rootScope.search.text="";
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
        return;
      } else {
        OdSrv.orderList($scope.listType).then(
          function(data){
            $scope.odList = data;
            $scope.pageLoading = false;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }
    }
  }
})();
