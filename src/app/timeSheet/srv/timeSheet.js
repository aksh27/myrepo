angular.module('support').service('TimeSheetSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.getTS = function(type){
    httpReq = $http.get($rootScope.apiHost +"users/ts/"+ type);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getTSDetails = function(id){
    httpReq = $http.get($rootScope.apiHost +"users/ts/details/"+ id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.saveTimeSheet = function(obj){
    httpReq = $http.post($rootScope.apiHost +"users/ts", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.setStatus = function(id, status, obj){
    httpReq = $http.patch($rootScope.apiHost +"users/ts/"+ id +"/"+ status, obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.deleteTimeSheet = function(id){
    httpReq = $http.delete($rootScope.apiHost + "users/ts/" + id);
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