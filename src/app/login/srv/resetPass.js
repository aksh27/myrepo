angular.module('support').service('ResetPassSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.checkLink = function(key){
    httpReq = $http.get($rootScope.apiHost + "auth/resetPassword?key="+key);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.resetPass = function(obj){
    httpReq = $http.put($rootScope.apiHost + "auth/resetPassword", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleError = function(response){
    if(!angular.isObject(response.data) || !response.data.message){
      return($q.reject("An unknown error occurred."));
    }
    return($q.reject(response.data.message));
  }
  this.handleSuccess = function(response){
    return(response.data);
  }
}]);
