(function(){
  'use strict';

  angular
    .module('support')
    .filter('fileExt', fileExt);

  /** @ngInject */
  function fileExt(){
  	return function(type, name){
      if(type){
        var curType = type.split("/");
        var curExt = name.split(".")[name.split(".").length - 1];
        var ext = "";
        if(curType[0]=="image"){
          return ext = "image";
        } else if(curType[0]=="video"){
          return ext = "video";
        } else if(curType[0]=="audio"){
          return ext = "audio";
        } else if(curExt=="csv"){
          return ext = "csv";
        } else if(curType[1]=="pdf"){
          return ext = "pdf";
        } else if(curExt=="zip" || curExt=="rar"){
          return ext = "zip";
        } else if(curExt=="doc" || curExt=="docx"){
          return ext = "doc";
        } else if(curExt=="xls" || curExt=="xlsx"){
          return ext = "xls";
        } else if(curExt=="ppt" || curExt=="pptx" || curExt=="ppsx"){
          return ext = "ppt";
        } else if(curType[1]=="plain" || curType[1]=="json" || curType[1]=="css"){
          return ext = "text";
        } else if(curType[1]=="html" || curExt=="xml" || curType[1]=="octet-stream" && (curExt=="md" || curExt=="php")){
          return ext = "code";
        } else if(curExt=="swf" || curExt=="bak" || curExt=="woff" || curExt=="ttf" || curExt=="eot" || curExt=="asar" || curExt=="ini"){
          return ext = "file";
        } else if(curType[0]=="application"){/*Note: No code add after this*/
          return ext = "file";
        }
      }
  	}
  }
})();
