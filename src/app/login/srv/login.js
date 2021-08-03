angular.module('support').service('LoginSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.authenticate = function(credentials){
    httpReq = $http.post($rootScope.apiHost + "auth/login", credentials);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.resendEmail = function(uid){
    httpReq = $http.get($rootScope.apiHost + "auth/resendResetPwdMail/"+ uid);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getSSOLink = function(){
    httpReq = $http.get($rootScope.apiHost + "auth/sso/url");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.signInCallback = function(obj){
    httpReq = $http.post($rootScope.apiHost + "auth/sso/token", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleError = function(response){
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
    return ($q.reject(response.data.message));
  }
  this.handleSuccess = function(response){
    //$cookies.putObject('supportAuth', response.data.info);
    return (response.data);
  }
}]);
