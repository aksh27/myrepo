angular.module('support').filter('timeConvert', function(){
  return function(min){
    var tHours = (min / 60);
    var rHours = Math.floor(tHours);
    var tMinutes = (tHours - rHours) * 60;
    var rMinutes = Math.round(tMinutes);
    return rHours +":"+ rMinutes;
  }
});
