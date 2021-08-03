(function(){
  'use strict';

  angular.module('fancyboxplus', [])
    .service('fancyboxService', fancyboxService)
    .directive('fancyboxable', fancyboxableDirective)
    .directive('fancybox', fancyboxDirective);

  function fancyboxService(){
    //Fancybox-Plus JavaScript API reference:
    // http://igorlino.github.io/fancybox-plus/api.htm

    var service = {
      fancyboxPlus: fancyboxPlus, //returns the fancyboxplus jquery plugin
      showActivity: showActivity, //Shows loading animation
      hideActivity: hideActivity, //Hides loading animation
      next: next, //Displays the next gallery item
      prev: prev, //Displays the previous gallery item
      pos: pos, //Displays item by index from gallery
      cancel: cancel, //Cancels loading content
      close: close, //Hides FancyBox. Within an iframe use - parent.close();
      resize: resize, //Auto-resizes FancyBox height to match height of content
      center: center //Centers FancyBox in viewport
    };
    return service;

    ////////////

    function fancyboxPlus(){
      return $.fancybox;
    }

    function showActivity(){
      fancyboxPlus().showActivity();
    }

    function hideActivity(){
      fancyboxPlus().hideActivity();
    }

    function pos(){
      fancyboxPlus().pos();
    }

    function cancel(){
      fancyboxPlus().cancel();
    }

    function center(){
      fancyboxPlus().center();
    }

    function next(){
      fancyboxPlus().next();
    }

    function prev(){
      fancyboxPlus().prev();
    }

    function close(){
      fancyboxPlus().close();
    }

    function resize(){
      fancyboxPlus().resize();
    }
  }

  fancyboxableDirective.$inject = ['$compile', '$rootScope', '$http', '$parse', '$timeout', 'fancyboxService'];

  function fancyboxableDirective($compile, $rootScope, $http, $parse, $timeout, fancyboxService){
    var service = {
      restrict: 'A',
      link: fancyboxableLink,
      priority: 100 // must lower priority than ngSrc (99)
    };
    return service;

    ////////////////////////////


    fancyboxableLink.$inject = ['$scope', '$element', '$attributes'];

    function fancyboxableLink($scope, $element, $attributes, controller){
      var fbp = null;

      $scope.$on('$destroy', function(){
        $element.remove();
      });

      init();

      function init(open){
        var options = {
          href: $attributes.src ? $attributes.src : $attributes.href,
          onComplete: function(){
            onComplete();
          }
        };

        //generic way that sets all (non-function) parameters of fancybox-plus.
        if($attributes.fancyboxable && $attributes.fancyboxable.length > 0){
          var fbpOptionsFunc = $parse($attributes.fancyboxable);
          var fbpOptions = fbpOptionsFunc($scope);
          angular.extend(options, fbpOptions);
        }

        //clean undefined
        for(var key in options){
          if(options.hasOwnProperty(key)){
            if(typeof(options[key]) === 'undefined'){
              delete options[key];
            }
          }
        }

        if(typeof(open) !== 'undefined'){
          options.open = open;
        }

        //wait for the DOM view to be ready
        $timeout(function(){
          if(!$attributes.ngSrc){
            //opens the fancybox using an href.
            fbp = $($element).fancybox(options);
          } else{
            //$element.bind('load', function(){
            /*$scope.$apply(function (){
             options.href = $attributes.src ? $attributes.src : $attributes.href;
             cb = $.colorbox(options);
             });*/
            //wait for the DOM view to be ready
            $timeout(function(){
              options.href = $attributes.src ? $attributes.src : $attributes.href;
              fbp = $($element).fancybox(options);
            }, 300);
            //});
          }
        }, 0);
      }

      function onComplete(){
        $rootScope.$apply(function(){
          var content = $('#fbplus-content');
          $compile(content)($rootScope);
        });
      }
    }
  }

  fancyboxDirective.$inject = ['$compile', '$rootScope', '$http', '$parse', '$timeout', 'fancyboxService'];

  function fancyboxDirective($compile, $rootScope, $http, $parse, $timeout, fancyboxService){
    var service = {
      restrict: 'E',
      scope: {
        open: '=',
        options: '=',
        templateUrl: '&',

        onStart: '&', //Will be called right before attempting to load the content
        onCancel: '&', //Will be called after loading is canceled
        onComplete: '&', //Will be called once the content is displayed
        onCleanup: '&', //Will be called just before closing
        onClosed: '&' //Will be called once FancyBox is closed

      },
      require: 'fancybox',
      link: link,
      controller: controller,
      controllerAs: 'vm'
    };
    return service;

    ////////////////////////////

    controller.$inject = ['$scope'];

    function controller($scope){}
    link.$inject = ['$scope', '$element', '$attributes'];

    function link($scope, $element, $attributes, controller){
      var fbp = null;
      $scope.$watch('open', function(newValue, oldValue){
        if(oldValue !== newValue){
          updateOpen(newValue);
        }
      });
      $scope.$on('$destroy', function(){
        $element.remove();
      });
      init();

      function updateOpen(newValue){
        if(newValue){
          init(newValue);
        } else{
          fancyboxService.close();
        }
      }

      function init(open){
        var options = {
          href: $attributes.src,
          boxFor: $attributes.boxFor,
          onOpen: function(){
            if($scope.onOpen && $scope.onOpen()){
              $scope.onOpen()();
            }
          },
          onCancel: function(){
            if($scope.onCancel && $scope.onCancel()){
              $scope.onCancel()();
            }
          },
          onComplete: function(){
            onComplete();
            if($scope.onComplete && $scope.onComplete()){
              $scope.onComplete()();
            }
          },
          onCleanup: function(){
            if($scope.onCleanup && $scope.onCleanup()){
              $scope.onCleanup()();
            }
          },
          onClosed: function(){
            $scope.$apply(function(){
              $scope.open = false;
            });
            if($scope.onClosed && $scope.onClosed()){
              $scope.onClosed()();
            }
          }
        };
        //generic way that sets all (non-function) parameters of fancybox-plus.
        if($scope.options){
          angular.extend(options, $scope.options);
        }
        //clean undefined
        for(var key in options){
          if(options.hasOwnProperty(key)){
            if(typeof(options[key]) === 'undefined'){
              delete options[key];
            }
          }
        }
        if(typeof(open) !== 'undefined'){
          options.open = open;
        }
        //wait for the DOM view to be ready
        $timeout(function(){
          if(options.boxFor){
            //opens the element by id boxFor
            fbp = $(options.boxFor).fancybox(options);
          } else if(options.href){
            //opens the fancybox-plus using an href.
            fbp = $.fancybox(options);
          }
        }, 0);
      }

      function onComplete(){
        $rootScope.$apply(function(){
          var content = $('#fbplus-content');
          $compile(content)($rootScope);
        });
      }
    }
  }
})
();
/*resizeIn*/
(function($, F){
  F.transitions.resizeIn = function(){
    var previous = F.previous,
      current = F.current,
      startPos = previous.wrap.stop(true).position(),
      endPos = $.extend({
        opacity: 1
      }, current.pos);
    startPos.width = previous.wrap.width();
    startPos.height = previous.wrap.height();
    previous.wrap.stop(true).trigger('onReset').remove();
    delete endPos.position;
    current.inner.hide();
    current.wrap.css(startPos).animate(endPos, {
      duration: current.nextSpeed,
      easing: current.nextEasing,
      step: F.transitions.step,
      complete: function(){
        F._afterZoomIn();
        current.inner.fadeIn("fast");
      }
    });
  };
}(jQuery, jQuery.fancybox));
