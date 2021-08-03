(function(){
  'use strict';

  angular
    .module('support')
    .filter('removeHtmlTags', removeHtmlTags);

  /** @ngInject */
  function removeHtmlTags(){
  	return function(text){
  		return text ? String(text).replace(/<[^>]+>/gm, ' ') : ' ';
  	}
  }
})();
