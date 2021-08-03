(function(){
  'use strict';

  angular
    .module('support')
    .controller('DashboardController', DashboardController);

  /** @ngInject */
  function DashboardController($log, $rootScope, $scope, $state, $interval, Restangular, ngDialog, DashboardSrv){
    $rootScope.search = {show:false, text:"", adv:false};
    $rootScope.selectedMenu = 0;
    var dashboardCtrl = this;

    $scope.totalTickets = 0;
    $scope.ticketList = {};
    $scope.dashboard = {};
    $scope.pieData = [];
    $scope.bucket = "";
    $scope.tim = "";

    $scope.curState = $state.current.name;
    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
    });

    $scope.getDashboard = function(){
      if($scope.curState == "support.dashboard"){
        DashboardSrv.getDashboard().then(
          function(data){
            $scope.dashboard = data;
            $scope.ticketList = $scope.dashboard.assigned;
            $scope.totalTickets = $scope.dashboard.bar.a + $scope.dashboard.bar.r + $scope.dashboard.bar.o;
            //$scope.lineChartCategories = $scope.dashboard.line.categories.split(",");

            // Highcharts.chart('ticketgraph', {
            //   chart:{height:170},
            //   title:{text:false},
            //   subtitle:{text:false},
            //   credits:{enabled:false},
            //   exporting:{enabled:false},
            //   xAxis:{categories:$scope.dashboard.line.categories,crosshair:true},
            //   yAxis:{title:{text:''}},
            //   legend:{layout:'vertical',align:'right',verticalAlign:'middle'},
            //   series: $scope.dashboard.line.series
            // });
            //$scope.dashboard.timeLine = {color:true, hours:[0, 0, 11.583, 0.0, 8.666, 11.916, 0.166, 0.0], users: ["Brent", "Farhan", "Safouan", "Shantheni", "Shreya", "Steven", "Swati", "Uma"]};
            Highcharts.chart('timesheetgraph', {
              chart:{height:170},
              title:{text:"Timesheet this week"},
              subtitle:{text:false},
              credits:{enabled:false},
              exporting:{enabled:false},
              xAxis:{categories:$scope.dashboard.timeLine.users},
              yAxis:{title:{text:'Hours'}},
              tooltip: {
                  formatter: function() {
                      //return this.x + '<br> <b>' + this.y + ' hours</b>';
                      return this.x + '<br> <b>' + this.y.toString().split(".")[0] + ' hours ' + Math.round((Number(this.y.toString().split(".")[1])/1000) * 60) + ' minutes</b>';
                  }
              },
              series: [{
                  type: 'column',
                  colorByPoint: $scope.dashboard.timeLine.color,
                  data:$scope.dashboard.timeLine.hours,
                  showInLegend: false
              }]
            });

          },
          function(err){
            $log.error(err);
          }
        );
      }
    }
    $scope.uiVersionFx();
    $scope.getDashboard();
    var timer = $interval(function(){
      $scope.getDashboard();
    }, 30000);
    $scope.$on("$destroy", function(){
      if(timer){
        $interval.cancel(timer);
      }
    });

    $scope.ticketFilterFx = function(data){
      // localStorage.setItem("curfilterObj", JSON.stringify({apply:true, customer:"", category:"", assignedTo:data, label:"", email:"", keywords:""}));
      localStorage.setItem("curfilterObj", JSON.stringify({assignedTo:data, customer:"", category:"", createdBy:"", createdOn:{isOn:false}, resolvedOn:{isOn:false}, email:"", keywords:"", label:""}));
      $state.go("support.tickets.a");
    }
    /*Clear filter obj*/
    // localStorage.removeItem("curfilterObj");
  }
})();
