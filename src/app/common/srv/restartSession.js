angular.module('support').service('RestartSessionSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.restartSession = function(){
    httpReq = $http.get($rootScope.apiHost + "auth/restartSession");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.ssoVerify = function(){
    httpReq = $http.get($rootScope.apiHost + "callback/sso/verify");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleSuccess = function(response){
    return (response.data);
  }
  this.handleError = function(response){
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
    return ($q.reject(response.data.message));
  }
}]);
