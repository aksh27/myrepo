(function(){
  'use strict';

  angular
    .module('support')
    .controller('SurveyCUController', SurveyCUController);

  /** @ngInject */
  function SurveyCUController($log, $rootScope, $scope, $state, $filter, ngDialog, SurveySrv, SettingsSrv){
    $rootScope.search = {show:false, text:"", adv:false};
    $rootScope.selectedMenu = 2;

    $scope.count = 1;
    $scope.curSort = 1;
    $scope.optLabel = "A";
    $scope.columnArr = [];
    $scope.isQDR = false;
    $scope.pageLoading = false;
    $scope.curState = $state.current.name;
    $scope.survey = {title:"", descr:"", ticketBodyText:""};
    $scope.survey.q = [];
    $scope.optArr = [{ id: "tmp-"+$scope.count, opt: "", label: $scope.optLabel}];
    $scope.addQuestion = {id:"q-"+$scope.curSort, q:"", opt:"", type:0, sort:$scope.curSort};

    //reset survey table column
    $scope.resetTableCol = function(arr){
      var x = 0;
      angular.forEach(arr, function(item, index) {
        if(item.opt.length > x && item.type != 2){
          x = item.opt.length;
          $scope.columnArr = item.opt;
          $scope.maxW = (100/$scope.columnArr.length);
          $scope.colWidthStyle={"width": $scope.maxW+"%"}
        } else if(item.opt.length == x && item.type == 2){
          $scope.columnArr = [];
          $scope.colWidthStyle={"width": "100%"}
        }
      });
    }

    if($state.params.id){
      $scope.decId = $scope.hubDecrypt($state.params.id);
      $scope.pageLoading = true;
      SurveySrv.getSurveyDetail($scope.decId).then(
        function(data){
          $scope.survey = data;
          $scope.pageLoading = false;
          $scope.resetTableCol($scope.survey.q);
        },
        function(err){
          $scope.pageLoading = false;
          $log.error(err);
        }
      );
    }

    $scope.addQuestionFx = function(action){
      $scope.hasListErr = false;
      $scope.hasErr = false;
      $scope.errType = "";
      $scope.curOptCount = 0;

      if($scope.addQuestion.q == ""){
        $scope.hasListErr = true;
        $scope.errType = "question";
      } else if($scope.optArr.length < 2 && !$scope.isQDR){
        $scope.hasListErr = true;
        $scope.errType = "opt";
      } else {
        var isEmpty = false;
        if(!$scope.isQDR){
          if($scope.optEmptyCount($scope.optArr) < 2){
              isEmpty = true;
          }
        }
        if(isEmpty){
          $scope.hasListErr = true;
          $scope.errType = "opt";
        } else if($scope.survey.q.length >= 5 && action != 'e'){
          $scope.hasListErr = true;
          $scope.errType = "maxQ";
        } else {
          $scope.optArr = $scope.reArrangeOpt($scope.optArr);
          if($scope.columnArr.length < $scope.optArr.length){
            $scope.columnArr = $scope.optArr;
            $scope.maxW = (100/$scope.columnArr.length);
            $scope.colWidthStyle={"width": $scope.maxW+"%"}
          }
          $scope.addQuestion.opt = $scope.optArr;
          if(action == 'e'){
            //update list
            angular.forEach($scope.survey.q, function(item, index){
              if(item.id==$scope.addQuestion.id){
                  $scope.survey.q[index] = $scope.addQuestion;
              }
            });
            $scope.editQForm = {isEdit: false};
            $scope.resetTableCol($scope.survey.q);
          } else {
            $scope.survey.q.push($scope.addQuestion);
            $scope.curSort++;
          }
          $scope.resetQuestionFx();
        }
      }
    }
    $scope.resetQuestionFx = function(){
      $scope.hasListErr = false;
      $scope.isQDR = false;
      $scope.count = 1;
      $scope.optLabel = "A";
      $scope.optArr = [{ id: "tmp-"+$scope.count, opt: "", label: $scope.optLabel}];
      $scope.addQuestion = {id:"q-"+$scope.curSort, q:"", opt:[], type:0, sort:$scope.curSort};
    }
    $scope.queTypeFx = function(qType){
      $scope.hasListErr = false;
      $scope.hasErr = false;
      if(qType == 0 || qType == 1){
        $scope.isQDR = false;
      } else {
        $scope.isQDR = true;
      }
    }

    $scope.removeOpen = function(index){
      $scope.questionObj = {index:index};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">\
              {{"Record for the votes on this question will also get deleted if you delete the question. Are you sure you want to delete this question?" | translate}}\
            </div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-sm btn-danger" ng-click="removeQuestionFx();" focus-me="true">{{"cm.btn.2" | translate}}</button>\
              <button type="button" class="btn btn-link btn-sm" ng-click="closeThisDialog();">{{"cm.btn.3" | translate}}</button>\
            </footer>\
          </section>',
        plain: true,
        width: 480,
        scope: $scope,
        closeByDocument: false,
        className: 'ngdialog-theme-default ngdialog-confirm'
      });
    }
    $scope.removeQuestionFx = function(){
      $scope.survey.q.splice($scope.questionObj.index, 1);
      $scope.resetTableCol($scope.survey.q);
      ngDialog.close();
    }

    $scope.editQFx = function(data){
      $scope.editQForm = {isEdit:true};
      $scope.addQuestion = angular.copy(data);
      $scope.optArr = angular.copy(data.opt);
      if(data.type!=2 && data.type!=3){
        $scope.curSort = data.opt.length;
        $scope.optLabel = String.fromCharCode(data.opt[$scope.curSort-1].label.charCodeAt(0));
      } else {
        $scope.queTypeFx(data.type);
      }
    }

    //re-arrange alphabet order
    $scope.reArrangeOpt = function(optArr){
      var count = 1;
      var oChar = "A";
      $scope.newArr = [];
      angular.forEach(optArr, function(item, $index){
        if(item.opt != ""){
          $scope.newArr.push({id:"tmp-"+count, opt:item.opt, label:oChar});
          count++;
          oChar = $scope.increamentChar(oChar);
        }
      });
      return $scope.newArr;
    }
    $scope.optEmptyCount = function(){
      var count = 0;
      angular.forEach($scope.optArr, function(item){
        if(item.opt != ""){
          count++;
        }
      });
      return count;
    }
    $scope.addMoreOptFx = function(){
      if($scope.optArr.length < 10){
        $scope.count++;
        $scope.optLabel = String.fromCharCode($scope.optLabel.charCodeAt(0) + 1);
        $scope.optArr.push({id: "tmp-"+$scope.count, opt: "", label:$scope.optLabel});
      } else {
        $scope.hasListErr = true;
        $scope.errType = "maxopt";
      }
    }

    $scope.increamentChar = function(char){
      return String.fromCharCode(char.charCodeAt(0) + 1);
    }

    $scope.delOpt = function(index){
      $scope.confirmOthObj = {index:index};
      ngDialog.open({
        template: '\
          <section class="panel">\
            <div class="panel-body">Do you want to remove this option?</div>\
            <footer class="panel-footer">\
              <button type="button" class="btn btn-danger" ng-click="delOptFx();" ng-disabled="popupProcessing"><span class="fa" ng-class="popupProcessing?\'fa-redo fa-spin\':\'fa-check\'"></span>{{"cm.btn.2" | translate}}</button>\
              <button type="button" class="btn btn-link" ng-click="closeThisDialog();">{{"cm.btn.10" | translate}}</button>\
            </footer>\
          </section>',
        plain: true,
        width: 500,
        scope: $scope,
        closeByDocument: false,
        className: "ngdialog-theme-default ngdialog-confirm"
      });
    }
    $scope.delOptFx = function(){
      $scope.popupProcessing = false;
      $scope.hasListErr = false;
      $scope.optArr.splice($scope.confirmOthObj.index, 1);
      if($scope.optArr.length <= 1){
        $scope.count = 1;
        $scope.optLabel ="A";
        $scope.optArr = [{ id: "tmp-"+$scope.count, opt: "", label: $scope.optLabel}];
      }
      ngDialog.close();
    }

    $scope.createSurveyFx = function(){
      $scope.popupProcessing = true;
      $scope.hasErr = false;
      if($scope.survey.title == null || $scope.survey.title == ""){
        $scope.errType = "title";
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      } else if($scope.survey.descr == null || $scope.survey.descr == ""){
        $scope.errType = "descr";
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      } else if($scope.survey.q.length == 0){
        $scope.errType = "que";
        $scope.hasErr = true;
        $scope.popupProcessing = false;
      } else {
        SettingsSrv.createSurvey($scope.survey).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code == 17001 || data.code == 17002){
              $state.go('support.settings.s');
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $rootScope.toastNotificationFx("danger", {"code":5000});
            $log.error(err);
          }
        );
      }
    }
  }
})();
