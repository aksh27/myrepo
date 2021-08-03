(function(){
  'use strict';

  angular
    .module('support')
    .controller('TicketController', TicketController);

  /** @ngInject */
  function TicketController($log, $rootScope, $scope, $state, $window, $filter, $interval, ngDialog, TicketSrv, SettingsSrv){
    $rootScope.search = {show:true, text:"", adv:true};
    $rootScope.selectedMenu = 1;

    $scope.curFilter = {apply:false, popApply:false, customer:null, category:null, assignedTo:null, createdBy:null, createdOn:{isOn:false}, resolvedOn:{isOn:false}, label:null, email:null, tId:null, keywords:null};
    $scope.curState = $state.current.name;
    $scope.allTicketsLoaded = false;
    $scope.curTicketList = {};
    $scope.ticketType = "all";
    $scope.curStateName = "";
    $scope.refreshCount = 0;
    $scope.ticketList = {};
    $scope.bucket = "";
    $scope.offset = 0;
    $scope.tim = "";

    $(window).scroll(function(){
      if($(window).scrollTop() == $(document).height() - $(window).height()){
        if(!$scope.allTicketsLoaded && !$scope.pageLoading && ($scope.curState === "support.tickets.r" || $scope.curState === "support.tickets.n")){
          $scope.offset = $scope.ticketList.length;
          $rootScope.getTickets("more");
        }
      }
    });

    if(localStorage.getItem("ticketType")){
      $scope.ticketType = localStorage.getItem("ticketType");
    }

    $rootScope.getTickets = function(caller){
      if(!caller){
        $scope.allTicketsLoaded = false;
        $scope.pageLoading = true;
        $scope.refreshCount = 0;
        $scope.offset = 0;
        $scope.filterObj = {};
      }
      var state;
      if($scope.curState === "support.tickets.a"){
        state = "a";
        $scope.curStateName = "a";
      } else if($scope.curState === "support.tickets.o"){
        state = "o";
        $scope.curStateName = "o";
      } else if($scope.curState === "support.tickets.r"){
        state = "r";
        $scope.curStateName = "r";
      } else if($scope.curState === "support.tickets.n"){
        state = "n";
        $scope.curStateName = "n";
      }

      if($scope.auth.sort.t.type == 'l'){
        $scope.activeColumnFx('label');
      } else if($scope.auth.sort.t.type == 's'){
        $scope.activeColumnFx('sub');
      } else if($scope.auth.sort.t.type == 'a'){
        $scope.activeColumnFx('assigned');
      } else if($scope.auth.sort.t.type == 'u'){
        $scope.activeColumnFx('updated');
      } else if($scope.auth.sort.t.type == 'c'){
        $scope.activeColumnFx('created');
      }

      // $scope.filterObj = {customer:"", category:"", assignedTo:"", label:"", email:"", keywords:""};

      $scope.curfilterObj = angular.fromJson(localStorage.getItem("curfilterObj"));
      if(state == "r" && $scope.curfilterObj && !$scope.curfilterObj.resolvedOn &&  $scope.curfilterObj.resolvedOn.isOn){
        $scope.curfilterObj.resolvedOn.isOn = false;
        $scope.clearFilterFx("ro");
        // localStorage.removeItem("curfilterObj");/*Clear filter obj*/
        // localStorage.setItem("curfilterObj", JSON.stringify($scope.curfilterObj));
      }
      if($scope.curfilterObj){
        //$scope.pageLoading = true;
        TicketSrv.filter($scope.curStateName, $scope.curfilterObj, caller, $scope.offset, $scope.refreshCount).then(
          function(data){
            $scope.curFilter = {apply:true, customer:$scope.curfilterObj.customer, category:$scope.curfilterObj.category, assignedTo:$scope.curfilterObj.assignedTo, createdBy:$scope.curfilterObj.createdBy, createdOn:$scope.curfilterObj.createdOn, resolvedOn:$scope.curfilterObj.resolvedOn, label:$scope.curfilterObj.label, email:$scope.curfilterObj.email, tId:$scope.curfilterObj.tId, keywords:$scope.curfilterObj.keywords};
            // $scope.ticketList = data.tickets;
            $scope.pageLoading = false;
            if(caller == "more"){
              if($scope.offset > data.tickets.length){
                $scope.allTicketsLoaded = true;
              }
              if(data.tickets && data.tickets.length > 0){
                $scope.ticketList = $scope.ticketList.concat(data.tickets);
                $scope.curTicketList = $scope.curTicketList.concat(data.tickets);
                $scope.offset = $scope.ticketList.length;
              } else{
                $scope.allTicketsLoaded = true;
              }
            } else if(caller == "refresh"){
              if(data.tickets && data.tickets.length > 0){
                $scope.ticketList = data.tickets;
                $scope.curTicketList = data.tickets;
              }
            } else{
              $scope.ticketList = data.tickets;
              $scope.curTicketList = data.tickets;
            }
            if(data.tickets && data.tickets.length > 0){
              $scope.refreshCount = $scope.ticketList.length;
            }
            $scope.ticketListCopy = angular.copy($scope.curTicketList);
            $scope.ticketFilterFx();
            // $rootScope.search.text="";
          },
          function(err){
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
        return;
      }
      if(state){
        localStorage.setItem("curState", $scope.curState);
        if(!$scope.curFilter.apply){
          TicketSrv.getTicket(state, caller, $scope.offset, $scope.refreshCount).then(
            function(data){
              $scope.pageLoading = false;
              if(caller == "more"){
                if($scope.offset > data.tickets.length){
                  $scope.allTicketsLoaded = true;
                }
                if(data.tickets && data.tickets.length > 0){
                  $scope.ticketList = $scope.ticketList.concat(data.tickets);
                  $scope.curTicketList = $scope.curTicketList.concat(data.tickets);
                  $scope.offset = $scope.ticketList.length;
                } else{
                  $scope.allTicketsLoaded = true;
                }
              } else if(caller == "refresh"){
                if(data.tickets && data.tickets.length > 0){
                  $scope.ticketList = data.tickets;
                  $scope.curTicketList = data.tickets;
                }
              } else{
                $scope.ticketList = data.tickets;
                $scope.curTicketList = data.tickets;
              }
              if(data.tickets && data.tickets.length > 0){
                $scope.refreshCount = $scope.ticketList.length;
              }
              $scope.ticketListCopy = angular.copy($scope.curTicketList);
              $scope.ticketFilterFx();
              // console.warn($scope.ticketList.length);
            },
            function(err){
              $scope.pageLoading = false;
              $log.error(err);
            }
          );
        } else if(!$scope.curFilter.popApply){
          $rootScope.filterFx('tab');
        }
      }
    }
    $rootScope.getTickets();
    $scope.uiVersionFx();
    var timer = $interval(function(){
      $rootScope.getTickets("refresh");
    }, 30000);

    $scope.$on("$destroy", function(){
      if(timer){
        $interval.cancel(timer);
      }
    });
    $scope.$on('curStateBroadcast', function(event, args){
      $scope.curState = args.curState;
      //$scope.curFilter = {apply:false, domain:null};
      $rootScope.getTickets();
    });

    $scope.ticketExportFx = function(){
      TicketSrv.ticketExport("resolved").then(
        function(data){
          if(data && data.download){
            $scope.linkOpenFx(data.download);
            // $window.open(data.download, '_blank');
          }
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.ticketFilterFx = function(caller){
      if(caller == "all"){
        $scope.ticketType = "all";
        $scope.ticketList = angular.copy($scope.ticketListCopy);
        localStorage.removeItem("ticketType");
      } else{
        if(caller){
          $scope.ticketType = caller;
          localStorage.setItem("ticketType", caller);
        }
        if($scope.ticketType !== "all"){
          $scope.ticketList = $filter("filter")($scope.ticketListCopy, {type:$scope.ticketType});
        }
      }
      // this is commented because when we change from assign to non ticket then it was calling
      // if($scope.curState != 'support.tickets.a' && $scope.curState != 'support.tickets.r' && $scope.auth.sort.t.type == "a"){
      //   $scope.sortFx('c', 'd', $scope.ticketList, 't');
      // }
    }

    /*Filter*/
    $rootScope.tFilterOpen = function(){
      $scope.filterObj = {assignedTo:"", customer:"", category:"", label:"", email:"", keywords:"", tId:"",
        createdOn:{isOn:false, dateRange:{startDate:moment().subtract(1, "month")._d, endDate:moment()._d, sd:"", ed:""}},
        resolvedOn:{isOn:false, dateRange:{startDate:moment().subtract(1, "month")._d, endDate:moment()._d, sd:"", ed:""}}
      };

      $scope.popupProcessing = false;
      $scope.popupLoading = true;
      $scope.hasErrPop = false;
      $scope.filters = {};
      // $scope.curFilter.popApply = true;
      TicketSrv.getFilters().then(
        function(data){
          $scope.popupLoading = false;
          $scope.filters = data;
          if($scope.curFilter.apply){
            $scope.filterObj.assignedTo = $scope.curFilter.assignedTo;
            $scope.filterObj.resolvedOn = $scope.curFilter.resolvedOn;
            $scope.filterObj.createdBy = $scope.curFilter.createdBy;
            $scope.filterObj.createdOn = $scope.curFilter.createdOn;
            $scope.filterObj.customer = $scope.curFilter.customer;
            $scope.filterObj.category = $scope.curFilter.category;
            $scope.filterObj.tId = $scope.curFilter.tId;
            $scope.filterObj.keywords = $scope.curFilter.keywords;
            $scope.filterObj.label = $scope.curFilter.label;
            $scope.filterObj.email = $scope.curFilter.email;
            if($scope.curState === "support.tickets.r"){
              $scope.filterObj.resolvedOn = $scope.curFilter.resolvedOn;
            }
          }
        },
        function(err){
          $scope.popupLoading = false;
          $log.error(err);
        }
      );
      ngDialog.open({
        template:'app/ticket/popup/ticketFilter.html',
        width: 850,
        scope: $scope,
        closeByDocument: false,
        preCloseCallback: function(caller){
          if(angular.isUndefined(caller)){
            $scope.curFilter.popApply = false;
          }
        }
      });
    }

    $rootScope.filterFx = function(caller){
      localStorage.removeItem("ticketType");
      $scope.ticketType = "all";
      $scope.hasErrPop = false;
      if(caller == "tab"){
        $scope.pageLoading = true;
      } else if(caller == "clear"){
        $scope.filterObj.assignedTo = $scope.curFilter.assignedTo;
        $scope.filterObj.createdBy = $scope.curFilter.createdBy;
        $scope.filterObj.createdOn = $scope.curFilter.createdOn;
        $scope.filterObj.customer = $scope.curFilter.customer;
        $scope.filterObj.category = $scope.curFilter.category;
        $scope.filterObj.tId = $scope.curFilter.tId;
        $scope.filterObj.keywords = $scope.curFilter.keywords;
        $scope.filterObj.label = $scope.curFilter.label;
        $scope.filterObj.email = $scope.curFilter.email;
        $scope.filterObj.resolvedOn = $scope.curFilter.resolvedOn;
      }
      if((!$scope.filterObj.customer || $scope.filterObj.customer === "") && (!$scope.filterObj.category || $scope.filterObj.category === "") && (!$scope.filterObj.assignedTo || $scope.filterObj.assignedTo === "") && (!$scope.filterObj.createdBy || $scope.filterObj.createdBy === "") && (!$scope.filterObj.label || $scope.filterObj.label === "") && !$scope.filterObj.createdOn.isOn && !$scope.filterObj.resolvedOn.isOn && $scope.filterObj.tId === "" && $scope.filterObj.keywords === "" && $scope.filterObj.email === ""){
        $scope.hasErrPop = true;
      } else{
        if(!caller){
          $scope.popupProcessing = true;
        }

        if($scope.filterObj.createdOn.isOn){
          $scope.filterObj.createdOn.dateRange.sd = moment($scope.filterObj.createdOn.dateRange.startDate).format("YYYY-MM-DD");
          $scope.filterObj.createdOn.dateRange.ed = moment($scope.filterObj.createdOn.dateRange.endDate).format("YYYY-MM-DD");
        }
        if($scope.curState === "support.tickets.r" && $scope.filterObj.resolvedOn.isOn){
          $scope.filterObj.resolvedOn.dateRange.sd = moment($scope.filterObj.resolvedOn.dateRange.startDate).format("YYYY-MM-DD");
          $scope.filterObj.resolvedOn.dateRange.ed = moment($scope.filterObj.resolvedOn.dateRange.endDate).format("YYYY-MM-DD");
        }

        localStorage.removeItem("curfilterObj");/*Clear filter obj*/
        localStorage.setItem("curfilterObj", JSON.stringify($scope.filterObj));
        TicketSrv.filter($scope.curStateName, $scope.filterObj, "", $scope.offset, $scope.refreshCount).then(
          function(data){
            $scope.curFilter = {apply:true, customer:$scope.filterObj.customer, category:$scope.filterObj.category, assignedTo:$scope.filterObj.assignedTo, createdBy:$scope.filterObj.createdBy, createdOn:$scope.filterObj.createdOn, resolvedOn:$scope.filterObj.resolvedOn, label:$scope.filterObj.label, email:$scope.filterObj.email, tId:$scope.filterObj.tId, keywords:$scope.filterObj.keywords};
            // if($scope.curState === "support.tickets.r"){
            //   $scope.curFilter.resolvedOn = $scope.filterObj.resolvedOn;
            // }
            $scope.ticketList = data.tickets;
            $scope.curTicketList = data.tickets;
            $scope.ticketListCopy = angular.copy($scope.curTicketList);
            $scope.popupProcessing = false;
            $rootScope.search.text = "";
            $scope.pageLoading = false;
            if(!caller){
              $scope.curFilter.popApply = false;
              ngDialog.close();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $scope.pageLoading = false;
            $log.error(err);
          }
        );
      }
    }

    $scope.clearFilterFx = function(caller){
      if(caller == "cus"){
        $scope.curFilter.customer = null;
      }
      else if(caller == "cat"){
        $scope.curFilter.category = null;
      }
      else if(caller == "a"){
        $scope.curFilter.assignedTo = null;
      }
      else if(caller == "cr"){
        $scope.curFilter.createdBy = null;
      }
      else if(caller == "cro"){
        $scope.curFilter.createdOn.isOn = false;
      }
      else if(caller == "ro"){
        $scope.curFilter.resolvedOn.isOn = false;
      }
      else if(caller == "l"){
        $scope.curFilter.label = null;
      }
      else if(caller == "e"){
        $scope.curFilter.email = null;
      }
      else if(caller == "t"){
        $scope.curFilter.tId = null;
      }
      else if(caller == "k"){
        $scope.curFilter.keywords = null;
      }
      localStorage.removeItem("curfilterObj");/*Clear filter obj*/
      localStorage.setItem("curfilterObj", JSON.stringify($scope.curFilter));

      if(caller == "all" || (!$scope.curFilter.customer && !$scope.curFilter.category && !$scope.curFilter.assignedTo && !$scope.curFilter.createdBy && !$scope.curFilter.createdOn.isOn && !$scope.curFilter.resolvedOn.isOn && !$scope.curFilter.label && !$scope.curFilter.email && !$scope.curFilter.tId && !$scope.curFilter.keywords)){
        localStorage.removeItem("curfilterObj");/*Clear filter obj*/
        $scope.curFilter = {apply:false, customer:null, category:null, assignedTo:null, createdBy:null, createdOn:null, resolvedOn:null, label:null, email:null, tId:null, keywords:null};
        $scope.search.text="";
        $rootScope.getTickets();
      } else{
        $rootScope.filterFx("clear");
      }
    }

    /*Checkbox*/
    $scope.allChecked = false;
    $scope.checkboxFx = function(caller, event){
      if(caller == "all"){
        $scope.selectedTickets = [];//$scope.selectedItems = [];
        angular.forEach($scope.ticketList, function(ticket){
          ticket.isChecked = event;
          if(event){
            $scope.selectedTickets.push(ticket);
          }
        });
      } else{
        $scope.selectedTickets = [];
        angular.forEach($scope.ticketList, function(ticket){
          if(ticket.isChecked){
            $scope.selectedTickets.push(ticket);
          }
        });
      }
      if($scope.ticketList.length === $scope.selectedTickets.length){
        $scope.allChecked = true;
      } else{
        $scope.allChecked = false;
      }
    }

    /*Label*/
    $scope.getLabels = function(){
      $scope.labels = {};
      SettingsSrv.getLabels().then(
        function(data){
          $scope.labels = data;
        },
        function(err){
          $log.error(err);
        }
      );
    }
    // $scope.getLabels();

    $scope.labelOpenCheckFx = function(){
      $scope.isApply = false;
      $scope.ddLabel = angular.copy($scope.labels);
      if($scope.selectedTickets.length == 1){
        angular.forEach($scope.ddLabel, function(label){
          angular.forEach($scope.details.labels, function(item){
            if(label.id == item.id){
              label.selected = true;
            }
          });
        });
      }
    }

    $scope.isApply = false;
    $scope.labelChangeFx = function(){
      $scope.curLabelIds = [];
      $scope.tempLabelIds = [];
      angular.forEach($scope.details.labels, function(label){
        $scope.curLabelIds.push(label.id);
      });
      angular.forEach($scope.ddLabel, function(label){
        if(label.selected){
          $scope.tempLabelIds.push(label.id);
        }
      });
      if(angular.equals($scope.curLabelIds.toString(), $scope.tempLabelIds.toString())){
        $scope.isApply = false;
      } else{
        $scope.isApply = true;
      }
    }

    $scope.labelAUFx = function(caller, id, index){
      $scope.lbIdsArr = [];
      if(caller == "a"){
        $scope.tempSelected = [];
        angular.forEach($scope.ddLabel, function(label){
          if(label.selected){
            $scope.tempSelected.push(label.id);
          }
        });
        $scope.lbIdsArr = angular.copy($scope.tempSelected);
        $scope.curLabelObj = {labelIds:$scope.lbIdsArr, thids:[$scope.details.thid], type:"assign"};
      } else if(caller == "u"){
        angular.forEach($scope.details.labels, function(item){
          if(item.selected){
            // $scope.details.labels.push(item);
            $scope.lbIdsArr.push(item.id);
          }
        });
        $scope.curLabelObj = {labelIds:[id], thids:[$scope.details.thid], type:"remove"};
      }
      if(!$scope.curLabelObj.labelIds.length && !$scope.details.labels.length){
        $scope.isApply = false;
      } else{
        SettingsSrv.labelsAR($scope.curLabelObj).then(
          function(data){
            $scope.popupProcessing = false;
            if(caller == "a" && (data.code == 5004 || data.code == 5005)){
              $scope.details.labels = [];
              angular.forEach($scope.ddLabel, function(item){
                if(item.selected){
                  $scope.details.labels.push(item);
                }
              });
            } else if(data.code == 5005){
              angular.forEach($scope.details.labels, function(item){
                if(item.id == id){
                  $scope.details.labels.splice($scope.details.labels.indexOf(item), 1);
                }
              });
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
    }

    $scope.labelCUOpen = function(){
      $scope.popupProcessing = false;
      $scope.hasErrPop = false;
      $scope.errType = "";

      $scope.ntLObj = {label:"", bg:"#cccccc", bgType:"monochrome", color:"#000000", cType:"monochrome", caller:"l"};
      ngDialog.open({
        template: 'app/settings/popup/ntL.html',
        width: 500,
        scope: $scope,
        closeByDocument: false
      });
    }
    $scope.addSettingsFx = function(){
      if($scope.ntLObj.label == ""){
        $scope.hasErrPop = true;
        $scope.errType = "name";
      } else{
        $scope.popupProcessing = true;
        SettingsSrv.saveLabel($scope.ntLObj).then(
          function(data){
            $scope.popupProcessing = false;
            if(data.code == 5007){
              $scope.hasErrPop = true;
              $scope.errType = "lExist";
            } else{
              $scope.getLabels();
              ngDialog.close();
            }
          },
          function(err){
            $scope.popupProcessing = false;
            $log.error(err);
          }
        );
      }
    }
  }
})();
