angular.module('support').directive('fileModel', function(ngDialog, $rootScope, $filter){
  return{
    restrict: 'EA',
    transclude: 'true',
    scope: {
      fileModel: '=' //Two-way data binding
    },
    link: function($scope, element, attrs){
      $scope.attachFormat = ["jpg","jpeg","png","gif","mp4","txt","doc","docx","xls","xlsx","ppt","pptx","csv","pdf","zip","rar"];
      $scope.orderFormat = ["jpg","jpeg","png","doc","docx","pdf"];
      $scope.sFilesExt = {
        "img":["gif","jpeg","jpg","png"],
        "vid":["mp4"],
        "ot":["csv","doc","docx","pdf","ppt","pptx","rar","txt","xls","xlsx","zip"]
      }
      $scope.docFormat = ["doc","docx","pdf","ppt","pptx","xls","xlsx"];
      element.bind('change', function(){
        $scope.$apply(function(){
          $scope.options = $scope.$eval(attrs.options);
          $rootScope.uploadError = false;
          $rootScope.hasErr = false;
          $scope.errorMsg = "";
          $scope.uFiles = [];
          $scope.sFile = [];

          $scope.sizeOptFx = function(caller){
            if($scope.options.callback && $scope.options.multiple && !$scope.options.value){
              if($scope.options.caller == "c"){
                $rootScope.createFilelUploadFx($scope.sFile, $scope.uFiles);
              }
              if($scope.options.caller == "s"){
                $rootScope.sendFileUploadFx($scope.sFile, $scope.uFiles);
              }
            }
            if($scope.options.callback && !$scope.options.multiple && !$scope.options.value){
              $rootScope.fileModelUploadFx(element[0].files[0]);
            }
            if($scope.options.callback && $scope.options.value){
              $rootScope.fileModelUploadFx(element[0].files[0], $scope.options.value);
            }
            if(!$scope.options.multiple){
              $scope.fileModel = element[0].files[0];
            }
          }
          $scope.sizeFx = function(){
            if($scope.options.size){
              if(element[0].files[0].size == 0){
                $scope.errorMsg = "sizeZero";
              } else if(element[0].files[0].size < $scope.options.size){
                $scope.sizeOptFx();
              } else{
                $scope.errorMsg = "size";
              }
            } else{
              $scope.sizeOptFx();
            }
          }
          $scope.cursFiles = [];
          $scope.curuFiles = [];
          $scope.isSupported = false;
          if($scope.options.format[0] == "attach" || $scope.options.format[0] == "article" || $scope.options.format[0] == "order"){
            $scope.curSize = 0;
            angular.forEach(element[0].files, function(file){
              $scope.curExt = angular.lowercase(file.name.substring(file.name.lastIndexOf(".") + 1));

              if($scope.options.format[0] == "attach"){
                if($rootScope.itemInArray($scope.attachFormat, $scope.curExt)){
                  $scope.cursFiles.push(file);
                } else{
                  $scope.curuFiles.push(file);
                }
                $scope.isSupported = $rootScope.itemInArray($scope.attachFormat, $scope.curExt);
                if($scope.isSupported || $scope.cursFiles.length){
                  $scope.curSize = $scope.curSize + file.size;
                }
              } else if($scope.options.format[0] == "article"){
                if($rootScope.itemInArray($scope.docFormat, $scope.curExt)){
                  $scope.cursFiles.push(file);
                } else{
                  $scope.curuFiles.push(file);
                }
                $scope.isSupported = $rootScope.itemInArray($scope.docFormat, $scope.curExt);
                if($scope.isSupported || $scope.cursFiles.length){
                  $scope.curSize = $scope.curSize + file.size;
                }
              } else if($scope.options.format[0] == "order"){
                if($rootScope.itemInArray($scope.orderFormat, $scope.curExt)){
                  $scope.cursFiles.push(file);
                } else{
                  $scope.curuFiles.push(file);
                }
                $scope.isSupported = $rootScope.itemInArray($scope.orderFormat, $scope.curExt);
                if($scope.isSupported || $scope.cursFiles.length){
                  $scope.curSize = $scope.curSize + file.size;
                }
              }
            });

            if($scope.isSupported || $scope.cursFiles.length){
              if($scope.options.size){
                if($scope.curSize == 0){
                  $scope.errorMsg = "sizeZero";
                } else if($scope.curSize < $scope.options.size){
                  angular.forEach($scope.curuFiles, function(item){
                    $scope.uFiles.push(item);
                  });
                  if($scope.sFile.length){
                    $scope.sFileSize = 0;
                    angular.forEach($scope.sFile, function(item){
                      $scope.sFileSize = $scope.sFileSize + item.size;
                    });

                    $scope.curFileSize = $scope.sFileSize + $scope.curSize;

                    if($scope.curFileSize < $scope.options.size){
                      angular.forEach($scope.cursFiles, function(item){
                        $scope.sFile.push(item);
                        $scope.sizeOptFx("if");
                      });
                    } else{
                      $scope.errorMsg = "size";
                    }

                  } else{
                    angular.forEach($scope.cursFiles, function(item){
                      $scope.sFile.push(item);
                      $scope.sizeOptFx("else");
                    });
                  }
                } else{
                  $scope.errorMsg = "size";
                }
              } else{
                // $scope.sFile = $scope.cursFiles;
                // $scope.uFiles = $scope.curuFiles;
              }
              //$scope.sizeFx();
            }
            else{
              $scope.errorMsg = "format";
            }
          }

          //Error
          if($scope.errorMsg != ""){
            $scope.fileModel = "";
            $('input[type="file"]').val(null);
            if(angular.isUndefined($scope.options.errorPop)){
              $scope.fileSize = $filter("filesize")($scope.options.size);
              ngDialog.open({
                template: '\
                  <section class="panel">\
                    <div class="panel-body">\
                      <span ng-if="errorMsg == \'format\'">\
                        <p>{{"cm.msg.23" | translate}}</p>\
                        <div class="text-left" ng-if="options.format[0] == \'attach\'">\
                          <div ng-if="sFilesExt.img.length > 0" class="bdrBtm padB10 noMarB">\
                            <div class="text-bold">{{"cm.label.24" | translate}}</div>\
                            <div class="text-ucase">\
                              <span ng-repeat="ext in sFilesExt.img">{{ext}}<span ng-if="!$last">, </span></span>\
                            </div>\
                          </div>\
                          <div ng-if="sFilesExt.vid.length > 0" class="bdrBtm padB10 noMarB">\
                            <div class="spaceH"></div>\
                            <div class="text-bold">{{"cm.label.25" | translate}}</div>\
                            <div class="text-ucase">\
                              <span ng-repeat="ext in sFilesExt.vid">{{ext}}<span ng-if="!$last">, </span></span>\
                            </div>\
                          </div>\
                          <div ng-if="sFilesExt.ot.length > 0">\
                            <div class="spaceH"></div>\
                            <div class="text-bold">{{"cm.label.26" | translate}}</div>\
                            <div class="text-ucase">\
                              <span ng-repeat="ext in sFilesExt.ot">{{ext}}<span ng-if="!$last">, </span></span>\
                            </div>\
                          </div>\
                        </div>\
                        <div class="text-left" ng-if="options.format[0] == \'article\'">\
                          <div class="text-ucase">\
                            <span ng-repeat="ext in docFormat">{{ext}}<span ng-if="!$last">, </span></span>\
                          </div>\
                        </div>\
                        <div class="text-left" ng-if="options.format[0] == \'order\'">\
                          <div class="text-ucase">\
                            <span ng-repeat="ext in orderFormat">{{ext}}<span ng-if="!$last">, </span></span>\
                          </div>\
                        </div>\
                      </span>\
                      <span ng-if="errorMsg == \'size\'">{{"cm.msg.24" | translate:{fileSize:fileSize} }}</span>\
                      <span ng-if="errorMsg == \'sizeZero\'">{{"cl.p_c.m4" | translate}}</span>\
                    </div>\
                    <footer class="panel-footer">\
                      <button type="button" class="btn btn-default btn-sm" ng-click="closeThisDialog();">{{"cm.btn.1" | translate}}</button>\
                    </footer>\
                  </section>',
                plain: true,
                width: 450,
                scope: $scope,
                closeByDocument: false,
                className: 'ngdialog-theme-default ngdialog-confirm',
              });
            } else{
              $rootScope.uploadError = true;
              $rootScope.uploadErrorType = $scope.errorMsg;
            }
          }

          if(!$scope.options.multiple && element[0].files[0] && $scope.options.format[0] != "attach" && $scope.options.format[0] != "article" && $scope.options.format[0] != "order"){
            $scope.curName = element[0].files[0].name;
            $scope.curType = element[0].files[0].type.split("/");
            $scope.curEleFormat = angular.lowercase($scope.curName.substring($scope.curName.lastIndexOf(".") + 1));
            console.warn($rootScope.sFiles);
            
            if($scope.options.sFiles){
              if($scope.options.format[0] == "image" && $rootScope.itemInArray($rootScope.sFiles.img, $scope.curEleFormat)){
                $scope.sizeFx();
              } else if($scope.options.format[0] == "video" && $rootScope.itemInArray($rootScope.sFiles.vid, $scope.curEleFormat)){
                $scope.sizeFx();
              } else if($scope.options.format[0] == "audio" && $rootScope.itemInArray($rootScope.sFiles.aud, $scope.curEleFormat)){
                $scope.sizeFx();
              }
              else if($scope.options.format[1] === "doc" || $scope.options.format[1] === "docx" || $scope.options.format[1] === "odt"){
                if($scope.curEleFormat === "doc" || $scope.curEleFormat === "docx" || $scope.curEleFormat === "odt"){
                  if($rootScope.itemInArray($rootScope.sFiles.ot, $scope.curEleFormat)){
                    $scope.sizeFx();
                  } else{
                    $scope.errorMsg = "format";
                  }
                } else{
                  $scope.errorMsg = "format";
                }
              }
              else if($scope.options.format[1] === "odp" || $scope.options.format[1] === "pps" || $scope.options.format[1] === "ppt" || $scope.options.format[1] === "pptx" || $scope.options.format[1] === "ppsx"){
                if($scope.curEleFormat === "odp" || $scope.curEleFormat === "pps" || $scope.curEleFormat === "ppt" || $scope.curEleFormat === "pptx" || $scope.curEleFormat === "ppsx"){
                  if($rootScope.itemInArray($rootScope.sFiles.ot, $scope.curEleFormat)){
                    $scope.sizeFx();
                  } else{
                    $scope.errorMsg = "format";
                  }
                } else{
                  $scope.errorMsg = "format";
                }
              }
              else if($scope.options.format[1] == $scope.curEleFormat && $rootScope.itemInArray($rootScope.sFiles.ot, $scope.curEleFormat)){
                $scope.sizeFx();
              }
              else{
                $scope.errorMsg = "format";
              }
            } else if($filter("filter")($scope.options.format, "image")[0] == $scope.curType[0] && element[0].files[0].type != "image/x-icon"){
              $scope.sizeFx();
            } else if($filter("filter")($scope.options.format, "video")[0] == $scope.curType[0]){
              $scope.sizeFx();
            } else if($filter("filter")($scope.options.format, "audio")[0] == $scope.curType[0]){
              $scope.sizeFx();
            } else if($scope.options.format[0] == "image" && $rootScope.itemInArray($rootScope.sFiles.img, $scope.curEleFormat)){
              $scope.sizeFx();
            } else if($scope.options.format[0] == "video" && $rootScope.itemInArray($rootScope.sFiles.vid, $scope.curEleFormat)){
              $scope.sizeFx();
            } else if($scope.options.format[0] == "audio" && $rootScope.itemInArray($rootScope.sFiles.aud, $scope.curEleFormat)){
              $scope.sizeFx();
            }
            else if($filter("filter")($scope.options.format, "csOther")[0] == "csOther"){
              if($scope.curEleFormat == "ai" ||
                $scope.curEleFormat == "eps" ||
                $scope.curEleFormat == "psd" ||
                $scope.curEleFormat == "pdf" ||
                $scope.curEleFormat == "ppt" ||
                $scope.curEleFormat == "pptx"||
                $scope.curEleFormat == "doc" ||
                $scope.curEleFormat == "docx"||
                $scope.curEleFormat == "zip" ||
                $scope.curEleFormat == "rar"){
                $scope.sizeFx();
              } else{
                $scope.errorMsg = "format";
              }
            }
            else if($rootScope.itemInArray($rootScope.sFiles.ot, $scope.curEleFormat)){
              if($scope.curEleFormat == "swf" && $scope.options.format[1] == "swf"){
                $scope.sizeFx();
              } else if($scope.curEleFormat == "pdf" && $scope.options.format[1] == "pdf"){
                $scope.sizeFx();
              } else if(($scope.curEleFormat == "doc" || $scope.curEleFormat == "docx" || $scope.curEleFormat == "odt") && ($scope.options.format[1] == "doc" || $scope.options.format[1] == "docx" || $scope.options.format[1] == "odt")){
                $scope.sizeFx();
              } else if(($scope.curEleFormat == "ppt" || $scope.curEleFormat == "pptx" || $scope.curEleFormat == "pps" || $scope.curEleFormat == "odp") && ($scope.options.format[1] == "ppt" || $scope.options.format[1] == "pptx" || $scope.options.format[1] == "pps" || $scope.options.format[1] == "odp")){
                $scope.sizeFx();
              } else if(($scope.curEleFormat == "pps" || $scope.curEleFormat == "ppsx") && ($scope.options.format[1] == "pps" || $scope.options.format[1] == "ppsx")){
                $scope.sizeFx();
              } else{
                $scope.errorMsg = "format";
              }
            }
            else if($scope.options.format[0] == "imgOnly"){
              if($rootScope.itemInArray(['jpg', 'jpeg', 'png', 'gif'], $scope.curEleFormat)){
                $scope.sizeFx();
              } else{
                $scope.errorMsg = "format";
              }
            }
            else if($scope.options.format[0] == "xml"){
              if($rootScope.itemInArray(['xml'], $scope.curEleFormat)){
                $scope.sizeFx();
              } else{
                $scope.errorMsg = "format";
              }
            }
            else if($scope.options.format[0] == "excel"){
              if($rootScope.itemInArray(['xls', 'xlsx'], $scope.curEleFormat)){
                $scope.sizeFx();
              } else{
                $scope.errorMsg = "format";
              }
            }
            else if($scope.options.format[0] == "csv"){
              if($rootScope.itemInArray(['csv'], $scope.curEleFormat)){
                $scope.sizeFx();
              } else{
                $scope.errorMsg = "format";
              }
            }
            else if($scope.options.format[0] == "srt"){
              if($rootScope.itemInArray(['srt'], $scope.curEleFormat)){
                $scope.sizeFx();
              } else{
                $scope.errorMsg = "format";
              }
            }
            else{
              $scope.errorMsg = "format";
            }
            // else if(!angular.isUndefined($scope.options.format[1]) && ($scope.curEleFormat == $scope.options.format[1])){
            //   $scope.sizeFx();
            // }

            //Error
            if($scope.errorMsg != ""){
              $scope.fileModel = "";
              $('input[type="file"]').val(null);
              if(angular.isUndefined($scope.options.errorPop)){
                $scope.fileSize = $filter("filesize")($scope.options.size);
                ngDialog.open({
                  template: '\
                    <section class="panel">\
                      <div class="panel-body">\
                        <span ng-if="errorMsg == \'format\'">{{"cm.msg.23" | translate}}</span>\
                        <span ng-if="errorMsg == \'size\'">{{"cm.msg.24" | translate: {fileSize: fileSize} }}</span>\
                        <span ng-if="errorMsg == \'sizeZero\'">{{"cl.p_c.m4" | translate}}</span>\
                      </div>\
                      <footer class="panel-footer">\
                        <button type="button" class="btn btn-default btn-sm" ng-click="closeThisDialog();">{{"cm.btn.1" | translate}}</button>\
                      </footer>\
                    </section>',
                  plain: true,
                  width: 450,
                  scope: $scope,
                  closeByDocument: false,
                  className: 'ngdialog-theme-default ngdialog-confirm',
                });
              } else{
                $rootScope.uploadError = true;
                $rootScope.uploadErrorType = $scope.errorMsg;
              }
            }
          }
        });
      });
    }
  };
});
