(function() {
  'use strict';

  angular
    .module('support')
    .config(config);

  /** @ngInject */
  function config($logProvider, $provide, toastrConfig, $translateProvider) {
    // Enable log
    $logProvider.debugEnabled(true);

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;

    /*Localization*/
    var supportAuthLang = angular.fromJson(localStorage.getItem("supportAuthLang"));
    var supportLang = angular.fromJson(localStorage.getItem("supportLang"));
    $translateProvider.useStaticFilesLoader({
      prefix: 'app/libraries/json/localization/',
      suffix: '.json?'+new Date().getTime()
    });
    $translateProvider.translations(supportAuthLang, supportLang);
    $translateProvider.useSanitizeValueStrategy();


    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
      taRegisterTool('test', {
          buttontext: 'Test',
          action: function(){
            alert('Test Pressed');
          }
      });
      taOptions.toolbar[1].push('test');
      taRegisterTool('colourRed', {
          iconclass: "fa fa-square red",
          action: function() {
              this.$editor().wrapSelection('forecolor', 'red');
          }
      });
      // add the button to the default toolbar definition
      taOptions.toolbar[1].push('colourRed');
      taOptions.toolbar = [
        ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol'], //, 'redo', 'undo', 'clear'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent']
      ];
      return taOptions;
    }]);


  }

})();
