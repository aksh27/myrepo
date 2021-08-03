(function(){
  'use strict';

  angular
    .module('support')
    .controller('ReportsController', ReportsController);

  /** @ngInject */
  function ReportsController($log, $rootScope, $scope, $state, $sce, $filter, ngDialog, TicketSrv, ReportsSrv){
    $rootScope.search = {show:false, text:"", adv:false};
    $rootScope.selectedMenu = 5;

    $scope.maxDate = moment().format('YYYY-MM-DD');
    $scope.curState = $state.current.name;
    $scope.pageLoading = false;
    $scope.download = "";

    $scope.getReports = function(){
      $scope.reports = {tType:"all", type:"", rType:"cu", rVal:"all", dateRange:{startDate: moment().subtract(1, "month")._d, endDate: moment()._d, sd:"", ed:""}};
      $scope.saveProcessing = false;
      $scope.selectedObj = {cu:"", ca:"", asTo:"", la:""};
      $scope.pageLoading = true;
      $scope.hasErr = false;
      $scope.download = "";
      $scope.errType = "";
      // var caller;
      if($scope.curState === "support.reports.tr"){
        $scope.typeList = {};
        TicketSrv.getFilters().then(
          function(data){
            $scope.pageLoading = false;
            $scope.typeList = data;
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }
    }
    $scope.getReports();
    $scope.uiVersionFx();

    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
      $scope.getReports();
    });

    $scope.typeFx = function(){
      $scope.download = "";
    }

    $scope.rangeFx = function(){
      $scope.download = "";
    }

    $scope.rTypeChange = function(){
      $scope.reports.dateRange = {startDate: moment().subtract(1, "month")._d, endDate: moment()._d};
      $scope.reports.rVal = "all";
      $scope.reports.type = "";
      $scope.hasErr = false;
      $scope.download = "";
      $scope.errType = "";
    }

    $scope.reportsFx = function(){
      $scope.selectedObj = {cu:"", ca:"", asTo:"", la:""};
      $scope.hasErr = false;
      $scope.download = "";
      $scope.errType = "";

      if($scope.reports.type == ""){
        $scope.errType = "empty";
        $scope.hasErr = true;
        return true;
      }
      if($scope.reports.type == "c"){
        $scope.reports.dateRange.sd = moment($scope.reports.dateRange.startDate).format("YYYY-MM-DD");
        $scope.reports.dateRange.ed = moment($scope.reports.dateRange.endDate).format("YYYY-MM-DD");
      }
      $scope.saveProcessing = true;
      if($scope.curState === "support.reports.tsr"){
        ReportsSrv.generateReportTime($scope.reports).then(
          function(data){
            $scope.saveProcessing = false;
            if(data.code == 11001){
              $scope.errType = "date";
              $scope.hasErr = true;
            }
            if(data.code == 11002){
              $scope.errType = "noData";
              $scope.hasErr = true;
            }
            else if(data.download){
              $scope.download = data.download;
            }
          },
          function(err){
            $scope.saveProcessing = false;
            $log.error(err);
          }
        );
      } else if($scope.curState === "support.reports.tr"){
        ReportsSrv.generateReportCustomer($scope.reports).then(
          function(data){
            $scope.saveProcessing = false;
            if(data.code == 11001){
              $scope.errType = "date";
              $scope.hasErr = true;
            }
            if(data.code == 11002){
              // $scope.errType = "noData";
              $scope.hasErr = true;

              // if($scope.reports.rVal != "all"){
                $scope.errType = "noDataC";
                if($scope.reports.rType == "cu"){
                  if($scope.reports.rVal == "all"){
                    $scope.selectedObj.cu = {label:"All"};
                  } else{
                    for(var i=0; i<$scope.typeList.customer.length; i++){
                      if($scope.reports.rVal == $scope.typeList.customer[i].id){
                        $scope.selectedObj.cu = $scope.typeList.customer[i];
                        break;
                      }
                    }
                  }
                }
                else if($scope.reports.rType == "ca"){
                  if($scope.reports.rVal == "all"){
                    $scope.selectedObj.ca = {label:"All"};
                  } else{
                    for(var i=0; i<$scope.typeList.category.length; i++){
                      if($scope.reports.rVal == $scope.typeList.category[i].id){
                        $scope.selectedObj.ca = $scope.typeList.category[i];
                        break;
                      }
                    }
                  }
                }
                else if($scope.reports.rType == "asTo"){
                  if($scope.reports.rVal == "all"){
                    $scope.selectedObj.asTo = {label:"All"};
                  } else{
                    for(var i=0; i<$scope.typeList.assigned.length; i++){
                      if($scope.reports.rVal == $scope.typeList.assigned[i].id){
                        $scope.selectedObj.asTo = $scope.typeList.assigned[i];
                        break;
                      }
                    }
                  }
                }
                else if($scope.reports.rType == "la"){
                  if($scope.reports.rVal == "all"){
                    $scope.selectedObj.la = {label:"All"};
                  } else{
                    for(var i=0; i<$scope.typeList.label.length; i++){
                      if($scope.reports.rVal == $scope.typeList.label[i].id){
                        $scope.selectedObj.la = $scope.typeList.label[i];
                        break;
                      }
                    }
                  }
                }
              // }
            }
            else if(data.download){
              $scope.download = data.download;
            }
          },
          function(err){
            $scope.saveProcessing = false;
            $log.error(err);
          }
        );
      }
    }

    $scope.odrReportsFx = function(){
      $scope.hasErr = false;
      $scope.download = "";
      $scope.errType = "";

      $scope.curDate = angular.element(document).find(".picker").val();
      $scope.curDate = $scope.curDate.split(" - ");
      $scope.customDate = {startDate: moment(new Date($scope.curDate[0])).format('YYYY-MM-DD'), endDate:moment(new Date($scope.curDate[1])).format('YYYY-MM-DD')};

      $scope.odr = {range: $scope.customDate}
      $scope.saveProcessing = true;
      ReportsSrv.generateOdrReport($scope.odr).then(
        function(data){
          if(data.code == 13022){
            $scope.errType = "noData";
            $scope.hasErr = true;
          }
          else if(data.download){
            $scope.download = data.download;
          }
          $scope.saveProcessing = false;
        },
        function(err){
          $scope.saveProcessing = false;
          $log.error(err);
        }
      );
    }
  }
})();
