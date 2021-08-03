angular.module('support').service('SurveySrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  /*Survey*/
  this.getSurveyDetail = function(id){
    httpReq = $http.get($rootScope.apiHost + "survey/"+id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getSurvey = function(id){
    httpReq = $http.get($rootScope.apiHost + "auth/survey/"+id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveSurvey = function(obj){
    httpReq = $http.post($rootScope.apiHost + "auth/survey", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getResult = function(id){
    httpReq = $http.get($rootScope.apiHost + "survey/result/"+id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.downloadResult = function(sId){
    httpReq = $http.get($rootScope.apiHost + "survey/result/export/"+sId);
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
