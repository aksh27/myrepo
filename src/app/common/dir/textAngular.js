angular.module('support').directive('textAngular', ['$parse', '$timeout', 'textAngularManager',
  function($parse, $timeout, textAngularManager){
    return{
      link:function(scope, element, attributes){
        var shouldFocus = $parse(attributes.focus)(scope);
        if(!shouldFocus)return;
        $timeout(function(){
          var editorScope = textAngularManager.retrieveEditor(attributes.name).scope;
          editorScope.displayElements.text.trigger('focus');
        }, 0, false);
      }
    };
  }
]);
