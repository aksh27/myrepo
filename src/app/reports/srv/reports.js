angular.module('support').service('ReportsSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.generateReportTime = function(obj){
    httpReq = $http.post($rootScope.apiHost + "reports/ts", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.generateReportCustomer = function(obj){
    httpReq = $http.post($rootScope.apiHost + "reports/tr", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.generateHubReport = function(obj){
    httpReq = $http.post($rootScope.apiHost + "reports/hub/pr", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  // this.getServers = function(portal){
  //   httpReq = $http.get($rootScope.apiHost + "reports/hub/servers/"+portal);
  //   return httpReq.then(this.handleSuccess, this.handleError);
  // }
  this.generateOdrReport = function(obj){
    httpReq = $http.post($rootScope.apiHost + "order/export", obj);
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
