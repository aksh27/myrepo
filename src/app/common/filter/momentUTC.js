(function(){
  'use strict';

  angular
    .module('support')
    .filter('momentutc', momentutc);

  /** @ngInject */
  function momentutc(){
  	return function(dateTime, format){
  		return moment(dateTime).utc().format(format);
  	}
  }
})();
