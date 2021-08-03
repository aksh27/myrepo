angular.module('support').service('DashboardSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.getDashboard = function(){
    httpReq = $http.get($rootScope.apiHost + "dashboard");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.loadMoreDevices = function(startIndex){
    httpReq = $http.get($rootScope.apiHost + "dashboard/moreDevices/" + startIndex);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.loadMoreLogs = function(startIndex){
    httpReq = $http.get($rootScope.apiHost + "dashboard/moreLogs/" + startIndex);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveLogs = function(dateObj){
    httpReq = $http.post($rootScope.apiHost + "dashboard/logs", dateObj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.handleError = function(response){
    // if(!angular.isObject(response.data) || !response.data.message){
    //     return ($q.reject("An unknown error occurred."));
    // }
    $rootScope.toastNotificationFx("danger", {
      "code": 5000
    });
    return ($q.reject(response.data.message));
  }
  this.handleSuccess = function(response){
    $rootScope.toastNotificationFx("info", response.data);
    return (response.data);
  }
}]);
