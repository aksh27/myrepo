angular.module('support').service('FileModelUploadSrv', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope){
  var httpReq;
  this.uploadFile = function (uploadUrl, file){
    var fd = new FormData();
    fd.append('file', file);
    httpReq = $http.post($rootScope.apiHost + uploadUrl, fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    })
    return httpReq.then(this.handleSuccess, this.handleError);
  }
  this.uploadFileAndData = function (uploadUrl, obj, file){
    var fd = new FormData();
    fd.append('data', angular.toJson(obj));
    if(file.length){
      angular.forEach(file, function(f){
        fd.append('file[]', f);
      });
    } else{
      fd.append('file', file);
    }

    httpReq = $http.post($rootScope.apiHost + uploadUrl, fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type':undefined}
    })
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

  // this.uploadFile = function (uploadUrl, file){
  //   var fd = new FormData();
  //   fd.append('file', file);
  //   $http.post($rootScope.apiHost + uploadUrl, fd, {
  //     transformRequest: angular.identity,
  //     headers: {'Content-Type': undefined}
  //   })
  //   .success(function(){
  //     ngDialog.close();
  //     if(file != "delete"){
  //       $state.reload();
  //     }
  //   })
  //   .error(function(){
  //     console.error("An unknown error occurred.");
  //   });
  // }
}]);
