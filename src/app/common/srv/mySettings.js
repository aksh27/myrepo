angular.module('support').service('MySettingsSrv', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope){
  var httpReq;
  this.updateSettings = function(obj){
    httpReq = $http.post($rootScope.apiHost + "users/setting", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.updatePass = function(obj){
    httpReq = $http.put($rootScope.apiHost + "users/changePass", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getNotify = function(){
    httpReq = $http.get($rootScope.apiHost + "users/emailnotification");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveNotify = function(obj){
    httpReq = $http.post($rootScope.apiHost + "users/emailnotification", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleSuccess = function(response){
    $rootScope.toastNotificationFx("info", response.data);
    return(response.data);
  }
  this.handleError = function(response){
    $rootScope.toastNotificationFx("danger", {"code":5000});
    if(!angular.isObject(response.data) || !response.data.message){
      return($q.reject("An unknown error occurred."));
    }
    return($q.reject(response.data.message));
  }
}]);
