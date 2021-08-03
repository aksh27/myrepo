angular.module('support').service('ForgotPassSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.forgotPass = function(credentials){
    httpReq = $http.post($rootScope.apiHost + "auth/forgotPassword", credentials);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.showPass = function(credentials){
    httpReq = $http.post($rootScope.apiHost + "auth/showPassword", credentials);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.approveItem = function(obj){
    httpReq = $http.post($rootScope.apiHost + "auth/approve", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.handleError = function(response){
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
    return ($q.reject(response.data.message));
  }
  this.handleSuccess = function(response){
    return (response.data);
  }
}]);
