angular.module('support').service('TicketDetailSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.getDetails = function(thid, read){
    httpReq = $http.get($rootScope.apiHost + "tickets/" +thid+ "/details?isAuto="+ read);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.reply = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/reply", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getAgent = function(thid, uType){
    httpReq = $http.get($rootScope.apiHost + "tickets/" +thid+ "/" + uType);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getHistory = function(thid, tzOffset){
    httpReq = $http.get($rootScope.apiHost + "tickets/" +thid+ "/history?tz=" + tzOffset);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.status = function(thid, action, isMail, email){
    httpReq = $http.patch($rootScope.apiHost + "tickets/" +thid+ "/" + action + "/" + isMail, email);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.delete = function(thid){
    httpReq = $http.delete($rootScope.apiHost + "tickets/" +thid);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.updateAgent = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/assign", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.dueDateTime = function(obj){
    httpReq = $http.put($rootScope.apiHost + "tickets/dueDatetIme", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.getDomain = function(opt){
    if(opt){
      httpReq = $http.get($rootScope.apiHost + "tickets/domains/" + opt);
    } else{
      httpReq = $http.get($rootScope.apiHost + "tickets/domains");
    }
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveDomain = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/assign/domain", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.getCategory = function(opt){
    // if(opt){
    //   httpReq = $http.get($rootScope.apiHost + "tickets/categories/" + opt);
    // } else{
      httpReq = $http.get($rootScope.apiHost + "tickets/categories");
    // }
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveCategory = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/assign/categories", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.getNotTicketEmail = function(){
    httpReq = $http.get($rootScope.apiHost + "tickets/notATicketEmail");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveNotTicketEmail = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/notATicketEmail", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getAttachment = function(mId, aId){
    httpReq = $http.get($rootScope.apiHost + "tickets/attach/"+mId+"/"+aId);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveTime = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/watch", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.readMsg = function(thid){
    httpReq = $http.patch($rootScope.apiHost + "tickets/message/"+thid+"/show");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.unread = function(thid){
    httpReq = $http.get($rootScope.apiHost + "tickets/"+thid+"/unread");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.msgVersion = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/message/version", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getVersions = function(thId, mId){
    httpReq = $http.get($rootScope.apiHost + "tickets/"+thId+"/message/"+mId+"/version");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  /* Survey */
  this.getSurvey = function(){
    httpReq = $http.get($rootScope.apiHost + "survey");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleError = function(response){
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
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
