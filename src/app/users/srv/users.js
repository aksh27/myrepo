angular.module('support').service('UsersSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.getLogs = function(index, tzOffset){
    httpReq = $http.get($rootScope.apiHost + "users/logs/" + index + "?tz=" + tzOffset);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getSC = function(obj){
    httpReq = $http.get($rootScope.apiHost + "users/agents");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getUserCU = function(id){
    httpReq = $http.get($rootScope.apiHost + "users/"+ id + "/details");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveUserCU = function(obj){
    httpReq = $http.post($rootScope.apiHost + "users/", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getDetailedLog = function(id){
    httpReq = $http.get($rootScope.apiHost + "users/"+ id + "/detailedLog");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.downloadLogs = function(date, tzOffset){
    httpReq = $http.post($rootScope.apiHost + "users/logs?tz=" + tzOffset, date);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteUser = function(id){
    httpReq = $http.delete($rootScope.apiHost + "users/" + id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleSuccess = function(response){
    $rootScope.toastNotificationFx("info", response.data);
    return (response.data);
  }
  this.handleError = function(response){
    $rootScope.toastNotificationFx("danger", {"code":5000});
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
    return ($q.reject(response.data.message));
  }
}]);
