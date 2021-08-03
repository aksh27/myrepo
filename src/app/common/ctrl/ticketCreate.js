(function (){
  'use strict';

  angular
    .module('support')
    .controller('TicketsCreateController', TicketsCreateController);

  /** @ngInject */
  function TicketsCreateController($log, $rootScope, $scope, $state, ngDialog, FileModelUploadSrv){
    $scope.popupSFiles = [];
    $scope.popupUFiles = [];
    $scope.replyObj = {eOpt:"m", dataOpt:false, dueDate:{startDate:moment()._d, endDate:moment()._d}, dueTime:moment().utc().format()};
    $rootScope.createFilelUploadFx = function(sFile, uFile){
      if(!$scope.popupSFiles.length){
        $scope.popupSFiles = sFile;
      } else{
        angular.forEach(sFile, function(curItem){
          $scope.isPopSFileDup = false;
          angular.forEach($scope.popupSFiles, function(item){
            if(curItem.name == item.name && curItem.size == item.size){
              $scope.isPopSFileDup = true;
              return false;
            }
          });
          if(!$scope.isPopSFileDup){
            $scope.popupSFiles.push(curItem);
          }
        });
      }

      if(!$scope.popupUFiles.length){
        $scope.popupUFiles = uFile;
      } else{
        angular.forEach(uFile, function(curItem){
          $scope.isPopUFileDup = false;
          angular.forEach($scope.popupUFiles, function(item){
            if(curItem.name == item.name && curItem.size == item.size){
              $scope.isPopUFileDup = true;
              return false;
            }
          });
          if(!$scope.isPopUFileDup){
            $scope.popupUFiles.push(curItem);
          }
        });
      }
    }

    $scope.ticketFx = function(){
      $scope.hasErrPop = false;
      $scope.errType = "";
      if($scope.replyObj.eOpt === "o" && (!$scope.ticket.email || $scope.ticket.email == "")){
        $scope.hasErrPop = true;
        $scope.errType = "email";
      }
      else if($scope.ticket.subject == ""){
        $scope.hasErrPop = true;
        $scope.errType = "subject";
      }
      // else if($scope.ticket.body == ""){
      //   $scope.hasErrPop = true;
      //   $scope.errType = "body";
      // }
      else{
        $scope.popupProcessing = true;
        if($scope.replyObj.eOpt === "m"){
          $scope.ticket.email = $scope.auth.email;
        } else if($scope.ticket.email){
          $scope.ticket.email = $scope.ticket.email.replace(/'/g, "");
        }

        if($scope.replyObj.dataOpt){
          // $scope.ticket.dueDate = moment(angular.copy($scope.replyObj.dueDate.startDate)).format("YYYY-MM-DD");
          // $scope.ticket.dueTime = moment(angular.copy($scope.replyObj.dueTime)).format("HH:mm:ss");
          $scope.ticket.dueDate = moment(angular.copy($scope.replyObj.dueDate.startDate)).format("YYYY-MM-DD");
          $scope.ticket.dueTime = moment(angular.copy($scope.replyObj.dueTime)).utc().format("HH:mm:ss");
        } else{
          $scope.ticket.dueTime = null;
          $scope.ticket.dueDate = null;
        }

        FileModelUploadSrv.uploadFileAndData("tickets", $scope.ticket, $scope.popupSFiles).then(
          function(data){
            $rootScope.toastNotificationFx("info", data);
            $scope.curfilterObj = angular.fromJson(localStorage.getItem("curfilterObj"));
            if($scope.curfilterObj && ($scope.curState === "support.tickets.a" || $scope.curState === "support.tickets.o" || $scope.curState === "support.tickets.r" || $scope.curState === "support.tickets.n")){
              // localStorage.removeItem("curfilterObj");/*Clear filter obj*/
              $state.reload();
            }
            $scope.popupLoading = false;
            ngDialog.close();
          },
          function(err){
            $rootScope.toastNotificationFx("danger", {"code":5000});
            $scope.popupLoading = false;
            $log.error(err);
          }
        );

        // TicketSrv.createTicket($scope.ticket).then(
        //   function(data){
        //     $scope.popupLoading = false;
        //
        //     //$state.go("support.tickets.o");
        //     ngDialog.close();
        //     // $scope.getTickets();
        //   },
        //   function(err){
        //     $log.error(err);
        //   }
        // );
      }
    }

    $scope.popAttachRemoveFx = function(caller, index){
      if(caller == "s"){
        $scope.popupSFiles.splice(index, 1);
      } else if(caller == "u"){
        $scope.popupUFiles.splice(index, 1);
      }
    }

  }
})();
