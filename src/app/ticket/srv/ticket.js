angular.module('support').service('TicketSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.getTicket = function(status, caller, offset, count){
    if(status == "a" || status == "o"){
      httpReq = $http.get($rootScope.apiHost + "tickets/" + status);
    } else{
      if(caller == "refresh"){
        httpReq = $http.get($rootScope.apiHost + "tickets/" + status + "?count=" + count);
      } else{
        httpReq = $http.get($rootScope.apiHost + "tickets/" + status + "?offset=" + offset);
      }
    }
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.createTicket = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.ticketExport = function(thid){
    httpReq = $http.get($rootScope.apiHost + "tickets/" +thid+ "/export");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.getFilters = function(){
    // httpReq = $http.get($rootScope.apiHost + "tickets/filters");
    httpReq = $http.get($rootScope.apiHost + "common/filters/t");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.filter = function(status, obj, caller, offset, count){
    if(status == "a" || status == "o"){
      httpReq = $http.post($rootScope.apiHost + "tickets/filters/" + status, obj);
    }
    else{
      if(caller == "refresh"){
        httpReq = $http.post($rootScope.apiHost + "tickets/filters/" + status + "?count=" + count, obj);
      } else{
        httpReq = $http.post($rootScope.apiHost + "tickets/filters/" + status + "?offset=" + offset, obj);
      }
    }
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  // this.filter = function(status, obj){
  //   httpReq = $http.post($rootScope.apiHost + "tickets/filters/" + status, obj);
  //   return httpReq.then(this.handleSuccess, this.handleError);
  // }

  this.handleError = function(response){
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
    $rootScope.toastNotificationFx("danger", {"code": 5000});
    return ($q.reject(response.data.message));
  }
  this.handleSuccess = function(response){
    $rootScope.toastNotificationFx("info", response.data);
    return (response.data);
  }
}]);
