angular.module('support').service('CommonSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.getUIVersion = function(){
    httpReq = $http.get($rootScope.apiHost + "auth/uiVersion");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getAvailableDevice = function(){
    httpReq = $http.get($rootScope.apiHost + "common/availableDevices");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getTimezone = function(){
    httpReq = $http.get($rootScope.apiHost + "common/timezone");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getNotifications = function(){
    httpReq = $http.get($rootScope.apiHost + "common/notifications");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.setDeviceViewStatus = function(status){
    httpReq = $http.get($rootScope.apiHost + "common/uPreferences/deviceView/" + status);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.setLPOpenStatus = function(status){
    httpReq = $http.get($rootScope.apiHost + "common/uPreferences/isLPOpen/" + status);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.setPinStatus = function(status){
    httpReq = $http.get($rootScope.apiHost + "common/uPreferences/isPin/" + status);
    return httpReq.then(this.handleSuccess, this.handleError);
  }


  this.setSort = function(obj){
    httpReq = $http.put($rootScope.apiHost + "users/sort", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.restartSession = function(){
    httpReq = $http.get($rootScope.apiHost + "auth/restartSession");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.logOut = function(obj){
    httpReq = $http.put($rootScope.apiHost + "auth/logout", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }


  /*Notifications*/
  this.getToastNotification = function(id){
    httpReq = $http.get("app/libraries/json/notification_dictionary.json");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  /*Advanced Filter*/
  this.getFilters = function(type){
    if(type=="ticket"){
      httpReq = $http.get($rootScope.apiHost + "common/filters/t");
    } else {
      httpReq = $http.get($rootScope.apiHost + "common/filters/o");
    }
    // httpReq = $http.get($rootScope.apiHost + "tickets/filters");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.filterOdrList = function(type, obj){
    httpReq = $http.get($rootScope.apiHost + "order/"+type+"?");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleSuccess = function(response){
    return (response.data);
  }
  this.handleError = function(response){
    $rootScope.toastNotificationFx("danger", response.data);
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
    return ($q.reject(response.data.message));
  }
}]);
