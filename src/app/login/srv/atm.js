angular.module('support').service('ATMSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.assign = function(uId, thid, tiId){
    httpReq = $http.get($rootScope.apiHost + "auth/self/assign/"+ uId +"/"+ thid +"/"+ tiId);
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
