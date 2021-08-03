angular.module('support').filter('filesize', function(){
  return function(filesize, decimals){
    if(filesize != null){
      filesize = filesize / 1024;
      if(filesize == 0) return '0 KB';
      if(filesize > 0 && filesize < 1) return (filesize).toFixed(2) +' KB';
      var k = 1024; // or 1000 for binary
      var dm = decimals + 1 || 2;
      var sizes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var i = Math.floor(Math.log(filesize) / Math.log(k));
      return parseFloat((filesize / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
  }
});
