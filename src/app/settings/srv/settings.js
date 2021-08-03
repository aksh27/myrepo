angular.module('support').service('SettingsSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  /*Domains*/
  this.getDomains = function(){
    httpReq = $http.get($rootScope.apiHost + "tickets/domains");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getDomainDetails = function(id){
    httpReq = $http.get($rootScope.apiHost + "tickets/"+id+"/domain");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.verifyEmail = function(email){
    httpReq = $http.post($rootScope.apiHost + "tickets/domain/verify/email", email);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveDomain = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/domain", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteDomains = function(ids){
    httpReq = $http.delete($rootScope.apiHost + "tickets/" + ids + "/domain");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  /*Non Ticket Emails*/
  this.getNTEmails = function(){
    httpReq = $http.get($rootScope.apiHost + "tickets/nontickets");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveNTEmail = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/nontickets", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteNTEmails = function(ids){
    httpReq = $http.delete($rootScope.apiHost + "tickets/" + ids + "/nontickets");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  /*Label*/
  this.getLabels = function(){
    httpReq = $http.get($rootScope.apiHost + "tickets/labels");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveLabel = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/label", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteLabels = function(ids){
    httpReq = $http.delete($rootScope.apiHost + "tickets/" + ids + "/labels");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.labelsAR = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/assign/label", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  /*Category*/
  this.getCategories = function(){
    httpReq = $http.get($rootScope.apiHost + "tickets/categories");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveCategory = function(obj){
    httpReq = $http.post($rootScope.apiHost + "tickets/categories", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteCategories = function(ids){
    httpReq = $http.delete($rootScope.apiHost + "tickets/" + ids + "/categories");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getCategoryDetails = function(id){
    httpReq = $http.get($rootScope.apiHost + "tickets/"+id+"/categories");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getHashList = function(){
    httpReq = $http.get($rootScope.apiHost + "users/hash");
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  /* Survey */
  this.createSurvey = function(obj){
    httpReq = $http.post($rootScope.apiHost + "survey", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getSurvey = function(){
    httpReq = $http.get($rootScope.apiHost + "survey");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteSurvey = function(id){
    httpReq = $http.delete($rootScope.apiHost + "survey/" + id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  /* Vendor */
  this.deleteVendor = function(id){
    httpReq = $http.delete($rootScope.apiHost + "vendors/" + id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  /*Courier Service*/
  this.getCouriers = function(){
    httpReq = $http.get($rootScope.apiHost + "couriers");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.addCourier = function(obj){
    httpReq = $http.post($rootScope.apiHost + "couriers", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.deleteCourier = function(id){
    httpReq = $http.delete($rootScope.apiHost + "couriers/" + id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleError = function(response){
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
