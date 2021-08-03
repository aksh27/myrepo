angular.module('support').service('OdSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.orderList = function(type){
    httpReq = $http.get($rootScope.apiHost + "order/"+type);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.orderListFilter = function(type, obj){
    // if(obj.cu == null || obj.cu == ""){
    //   obj.cu = {id:0, label:""};
    // }
    // if(obj.v == null || obj.v == ""){
    //   obj.v = {id:0, label:""};
    // }
    // if(obj.co == null || obj.co == ""){
    //   obj.co = {id:0, label:""};
    // }
    // if(obj.de == null || obj.de == ""){
    //   obj.de = {id:0, label:""};
    // }
    // if(obj.sh == null || obj.sh == ""){
    //   obj.sh = {id:0, label:""};
    // }
    // if(obj.crBy == null || obj.crBy == ""){
    //   obj.crBy = {id:0, label:""};
    // }
    // httpReq = $http.get($rootScope.apiHost + "order/" + type +
    // "?f=1&cu=" + JSON.stringify(obj.cu.id) +
    // "&v=" + JSON.stringify(obj.v.id) +
    // "&co=" + JSON.stringify(obj.co.id)+"&de="+JSON.stringify(obj.de.id)+"&sh="+JSON.stringify(obj.sh.id)+"&crBy="+JSON.stringify(obj.crBy.id)+"&ns="+obj.ns+"&t="+obj.t+"&id="+obj.id+"&crOn="+(obj.crOn.isOn ? obj.crOn.sd+"||"+obj.crOn.ed : ""));
    httpReq = $http.post($rootScope.apiHost + "order/list/"+type, obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getFilters = function(){
    // httpReq = $http.get($rootScope.apiHost + "tickets/filters");
    httpReq = $http.get($rootScope.apiHost + "common/filters/o");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.courierList = function(){
    httpReq = $http.get($rootScope.apiHost + "couriers/o");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addOrder = function(obj){
    httpReq = $http.post($rootScope.apiHost + "order", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteOrder = function(id){
    httpReq = $http.delete($rootScope.apiHost + "order/"+id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  //order dispatch/create
  this.orderDCAction = function(obj){
    if(obj.caller == "ut"){
      obj.caller = "d";
      httpReq = $http.patch($rootScope.apiHost + "order/"+obj.id+"/"+obj.caller+"/?isOnlyTracking=1");
    } else if(obj.caller == "cm"){
      httpReq = $http.patch($rootScope.apiHost + "order/"+obj.id+"/"+obj.caller, {trackingNumber: obj.curTrackingNumber, courierBy: obj.courierBy});
    } else if(obj.caller == "c"){
      httpReq = $http.patch($rootScope.apiHost + "order/"+obj.id+"/"+obj.caller, {reason:obj.reason});
    } else{
      httpReq = $http.patch($rootScope.apiHost + "order/"+obj.id+"/"+obj.caller+"/"+obj.trackingNumber);
    }
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.orderReopen = function(id){
    httpReq = $http.patch($rootScope.apiHost + "order/"+id+"/o");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.snList = function(typeId, modelId){
    httpReq = $http.get($rootScope.apiHost + "order/serials/"+typeId+"/"+modelId);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.orderDetail = function(orderId){
    httpReq = $http.get($rootScope.apiHost + "order/"+orderId+"/details");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.updateTrackingNo = function(oId, trNo){
    httpReq = $http.put($rootScope.apiHost + "order/"+oId+"/"+trNo);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.updateOrderCompleteDate = function(oId, date){
    httpReq = $http.put($rootScope.apiHost + "order/"+oId+"/"+date);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addComment = function(obj){
    httpReq = $http.post($rootScope.apiHost + "order/comments", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.customerList = function(){
    httpReq = $http.get($rootScope.apiHost + "customers");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addCustomer = function(obj){
    httpReq = $http.post($rootScope.apiHost + "customers", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addressList = function(cId){
    httpReq = $http.get($rootScope.apiHost + "customers/"+ cId +"/addresses");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addAddresses = function(obj){
    httpReq = $http.post($rootScope.apiHost + "customers/addresses", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.typeModelList = function(){
    httpReq = $http.get($rootScope.apiHost + "inventory/types/models");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.orderRenewal = function(obj){
    httpReq = $http.post($rootScope.apiHost + "order/renewal", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.setStatus = function(type, oId, status){
    httpReq = $http.patch($rootScope.apiHost + "order/status/"+ type +"/"+ oId +"/"+ status);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.uploadAttachment = function(obj, file){
    var fd = new FormData();
    fd.append('data', angular.toJson(obj));
    if(file.length){
      angular.forEach(file, function(f){
        fd.append('file[]', f);
      });
    } else{
      fd.append('file', file);
    }

    httpReq = $http.post($rootScope.apiHost + "order/po", fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type':undefined}
    })
    // httpReq = $http.post($rootScope.apiHost + "order/po", obj, file);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  // add vendor
  this.addVendor = function(obj){
    httpReq = $http.post($rootScope.apiHost + "vendors", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.vendorList = function(){
    httpReq = $http.get($rootScope.apiHost + "vendors");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleError = function(response){
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
    $rootScope.toastNotificationFx("danger", {"code": 5000});
    return ($q.reject(response.data.message));
  }
  this.handleSuccess = function(response){
    $rootScope.toastNotificationFx("info", response.data);
    return (response.data);
  }
}]);
