angular.module('support').service('LocalizationSrv', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope){
  var httpReq;
  this.getLocalization = function(lang){
    httpReq = $http.get("app/libraries/json/localization/" + lang + ".json?"+new Date().getTime());
    return httpReq.then(this.handleSuccess, this.handleError);
  }

  this.handleSuccess = function (response){
    if(response.data.code == 4004){
      $rootScope.toastNotificationFx("danger", response.data, response.data.deletedBy);
    }
    return (response.data);
  }
  this.handleError = function (response){
    if(!angular.isObject(response.data) || !response.data.message){
      return ($q.reject("An unknown error occurred."));
    }
    return ($q.reject(response.data.message));
  }
}]);
