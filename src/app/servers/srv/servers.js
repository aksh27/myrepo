angular.module('support').service('ServersSrv', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
  var httpReq;
  this.getServers = function(){
    httpReq = $http.get($rootScope.apiHost + "servers");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getServerInfo = function(endpoint){
    httpReq = $http.get(endpoint + "supportDesk");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getServerList = function(endpoint, type, val){
    if(type=="" && val==""){
      httpReq = $http.get(endpoint + "supportDesk/servers");
    } else{
      httpReq = $http.get(endpoint + "supportDesk/servers?sortBy=" + type + "&sortType=" +val);
    }
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getDeviceList = function(endpoint, type, val){
    httpReq = $http.get(endpoint + "supportDesk/devices?sortBy=" + type + "&sortType=" +val);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getUserList = function(endpoint, type, val){
    httpReq = $http.get(endpoint + "supportDesk/users?sortBy=" + type + "&sortType=" +val);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getLicenseList = function(sId){
    httpReq = $http.get($rootScope.apiHost + "servers/licenses/"+sId);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getWidgetList = function(endpoint, type, val){
    httpReq = $http.get(endpoint + "supportDesk/content/widgets?sortBy=" + type + "&sortType=" +val);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  // this.getVMList = function(id){
  //   httpReq = $http.get($rootScope.apiHost + "servers/vm/"+id);
  //   return httpReq.then(this.handleSuccess, this.handleError);
  // }
  this.getVMUrl = function(id){
    httpReq = $http.get($rootScope.apiHost + "servers/vm/url/" + id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getVerify = function(id){
    httpReq = $http.get($rootScope.apiHost + "servers/verify/vm/"+id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.verifySSO = function(endpoint, id){
    httpReq = $http.get(endpoint + "supportDesk/users/verifySSO/"+id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.allotLicense = function(endpoint, obj){
    httpReq = $http.post(endpoint + "supportDesk/licenses", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getAdminAccount = function(){
    httpReq = $http.get($rootScope.apiHost + "users/admin_account");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.createServer = function(endpoint, obj){
    httpReq = $http.post(endpoint + "supportDesk/servers", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.saveLSInfo = function(obj){
    httpReq = $http.post($rootScope.apiHost + "servers/licenses", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.exportList = function(endpoint, type){
    httpReq = $http.get(endpoint + "supportdesk/export/"+ type);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.exportAllWidgetList = function(endpoint){
    httpReq = $http.get(endpoint + "supportdesk/content/widgets/export");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.exportWidget = function(endpoint, id){
    httpReq = $http.get(endpoint + "supportdesk/content/widgets/export?id=" + id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getPAPhoneNo = function(endpoint, email){
    httpReq = $http.get(endpoint + "supportdesk/users/phone/"+ email);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.updateMacId = function(endpoint, obj){
    httpReq = $http.put(endpoint + "supportDesk/deviceId", obj);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.getPartnerList = function(endpoint){
    httpReq = $http.get(endpoint + "supportDesk/partners");
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.generatePartnerReport = function(endpoint, id){
    httpReq = $http.get(endpoint + "supportDesk/export/partnerServerDeviceSummary/"+id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.sendPassword = function(endpoint, id){
    httpReq = $http.get(endpoint + "supportDesk/users/sendPassword/" + id);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.vmRestart = function(endpoint, id, sId){
    httpReq = $http.put(endpoint + "supportDesk/restart/" + id + "/" + sId);
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.vmTurnOn = function(endpoint, id, sId){
    httpReq = $http.put(endpoint + "supportDesk/on/" + id + "/" + sId);
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleSuccess = function(response){
    $rootScope.toastNotificationFx("info", response.data);
    return (response.data);
  }
  this.handleError = function(response){
    /*$rootScope.toastNotificationFx("danger", {"code":5000});
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }*/
    // console.log("handle: ", response);
    // $rootScope.toastNotificationFx("danger", {"code":5000});
    // if(!angular.isObject(response.data) || !response.data.message){
    //   return ($q.reject("An unknown error occurred."));
    // }
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
    $rootScope.toastNotificationFx("danger", {"code": 5000});
    return ($q.reject(response.data.message));
  }
}]);
