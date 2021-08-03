angular.module('support').service('KBSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.getList = function(status){
    httpReq = $http.get($rootScope.apiHost + "kb/" + status);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveVideo = function(obj){
    httpReq = $http.post($rootScope.apiHost + "kb/v", obj);
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
  this.deleteAV = function(obj){
    httpReq = $http.delete($rootScope.apiHost + "kb/" + obj.id +"/"+ obj.caller);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addGroup = function(obj){
    httpReq = $http.post($rootScope.apiHost + "kb/groups", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getGroups = function(){
    httpReq = $http.get($rootScope.apiHost + "kb/groups");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteGroup = function(id){
    httpReq = $http.delete($rootScope.apiHost + "kb/groups/" + id);
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
}]);
