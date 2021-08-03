(function(){
  'use strict';

  angular
    .module('support')
    .controller('SurveyController', SurveyController);

  /** @ngInject */
  function SurveyController($log, $rootScope, $scope, $state, $cookies, $filter, ngDialog, SurveySrv){
    $rootScope.search = {show:false, text:"", adv:false};
    $rootScope.selectedMenu = 2;

    if($state.params.id){
      $rootScope.auth = $cookies.getObject("supportAuth");
    }

    $scope.surveyLoading = true;
    $scope.resultLoading = true;

    $scope.loadSurvey = function(){
      if($rootScope.curState == "s.survey"){
        SurveySrv.getSurvey($state.params.id).then(
          function(data){
            $scope.surveyLoading = false;
            if(data && data.code){
              $scope.hasMsg = true;
              if(data.code == 17005){
                $scope.hasType = "noQuestion";
              } else if(data.code == 17006){
                $scope.hasType = "notFound";
              }
            } else{
              $scope.survey = data;
              $scope.surveyCopy = angular.copy($scope.survey);
            }
          },
          function(err){
            $log.error(err);
          }
        );
      } else if($scope.curState == "support.result"){
        $scope.decId = $scope.hubDecrypt($state.params.id);
        SurveySrv.getResult($scope.decId).then(
          function(data){
            $scope.resultLoading = false;
            $scope.result = data;
          },
          function(err){
            $scope.resultLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $scope.loadSurvey();

    $scope.surveyFx = function(){
      $scope.surveyProcessing = true;
      $scope.hasMsg = false;
      $scope.hasType = "";
      //remove -1 from isSelected key
      if($scope.survey.q.length>0){
        $scope.survey.q.forEach(function(item) {
          if(item.isSelected < 0){
              item.isSelected = "";
          }
        });
      }
      SurveySrv.saveSurvey($scope.survey).then(
        function(data){
          $scope.surveyProcessing = false;
          $state.go("s.thanks", {id:$state.params.id});
        },
        function(err){
          $scope.surveyProcessing = false;
          $log.error(err);
        }
      );
    }

    $scope.resetFx = function(){
      $scope.survey = angular.copy($scope.surveyCopy);
    }

    $rootScope.$on("$stateChangeStart", function(event, toState){
      $scope.loadSurvey();
    });
    if($rootScope.curState != "s.survey" && $rootScope.curState != "s.thanks" && !$rootScope.auth){
      $state.go("login");
    }

    $scope.downloadResultFx = function(sId){
      $scope.download = {url:""};
      SurveySrv.downloadResult(sId).then(
        function(data){
          $scope.download.url = data.download;
          ngDialog.open({
            template: 'app/settings/survey/popup/downloadRes.html',
            width: 500,
            scope: $scope,
            trapFocus: false,
            data: $scope.logs,
            closeByDocument: false
          });
        },
        function(err){
          $log.error(err);
        }
      );
    }
  }
})();
