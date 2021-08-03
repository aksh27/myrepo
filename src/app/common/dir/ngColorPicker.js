angular.module('support').directive('ngColorPicker', function(){
  return {
    restrict: 'E',
    scope: {
      selectedColor: '=',
      selectedType: '=' //Two-way data binding
    },
    controller: "ColorPickerController",
    templateUrl: 'app/common/dir/ngColorPicker.html'
  }
});
