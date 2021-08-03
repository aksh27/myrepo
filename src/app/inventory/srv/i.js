angular.module('support').service('ISrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.getDeviceList = function(){
    httpReq = $http.get($rootScope.apiHost + "inventory/devices");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getOtherList = function(){
    httpReq = $http.get($rootScope.apiHost + "inventory/others");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getTypeDetail = function(type, id){
    httpReq = $http.get($rootScope.apiHost + "inventory/"+type+"/"+id+"/details");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getTypeList = function(iType){
    if(iType == 'devices'){
      httpReq = $http.get($rootScope.apiHost + "inventory/items/types?eDevice=1");
    } else if(iType == 'others'){
      httpReq = $http.get($rootScope.apiHost + "inventory/items/types?eOther=1");
    } else {
      httpReq = $http.get($rootScope.apiHost + "inventory/items/types");
    }
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getModelList = function(id){
    httpReq = $http.get($rootScope.apiHost + "inventory/"+id+"/models");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addInventory = function(obj){
    httpReq = $http.post($rootScope.apiHost + "inventory/items", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteOpen = function(obj){
    if(obj.caller == 'i'){
      httpReq = $http.delete($rootScope.apiHost + "inventory/" + obj.id +"/device");
    } else if(obj.caller == 'o'){
      httpReq = $http.delete($rootScope.apiHost + "inventory/" + obj.id +"/other");
    } else if(obj.caller == 't'){
      httpReq = $http.delete($rootScope.apiHost + "inventory/types/" + obj.id);
    } else if(obj.caller == 'm'){
      httpReq = $http.delete($rootScope.apiHost + "inventory/models/" + obj.id);
    }
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.saveVideo = function(obj){
    httpReq = $http.post($rootScope.apiHost + "inventory/items", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.send = function(obj){
    httpReq = $http.post($rootScope.apiHost + "kb/send", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getApps = function(status){
    httpReq = $http.get($rootScope.apiHost + "apps/" + status);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getKey = function(){
    httpReq = $http.get($rootScope.apiHost + "kb/activationKey");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addIType = function(obj){
    httpReq = $http.post($rootScope.apiHost + "inventory/types", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addIModel = function(obj){
    httpReq = $http.post($rootScope.apiHost + "inventory/models", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  /**Inventory Types*/
  this.getITypes = function(){
    httpReq = $http.get($rootScope.apiHost + "inventory/types");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  /**Inventory Models*/
  this.getIModels = function(){
    httpReq = $http.get($rootScope.apiHost + "inventory/models");
    return httpReq.then(this.handleSuccess, this.handleError);
  }



  this.handleSuccess = function(response){
    $rootScope.toastNotificationFx("info", response.data);
    return (response.data);
  }
  this.handleError = function(response){
    $rootScope.toastNotificationFx("danger", {"code":5000});
    return ($q.reject(response.data.message));
  }
  this.verifyOther = function(oId){
    httpReq = $http.get($rootScope.apiHost + "inventory/"+oId+"/verify");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
}]);
