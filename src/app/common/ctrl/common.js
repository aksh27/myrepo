(function (){
  'use strict';

  angular
    .module('support')
    .controller('CommonController', CommonController);

  /** @ngInject */
  function CommonController($log, $rootScope, $scope, $state, $cookies, $filter, $http, $window, $timeout, $location, $translate, ngDialog, Notification, LocalizationSrv, TicketSrv, TicketDetailSrv, FileModelUploadSrv, CommonSrv, OdSrv){ //fancyboxService

    $rootScope.search = {show:true, text:"", adv:false};
    $rootScope.timestamp = new Date().getTime();
    $rootScope.selectedMenu = 0;
    $rootScope.selectedT = 1;

    $scope.searchRegExp = new RegExp("'", "gi");
    $scope.searchReplaceChar = "&apos;"//&apos; &#39;

    $scope.beforeDate = moment(moment()._d).add('days', 1).format('YYYY-MM-DD');
    $scope.curDate = moment(moment()._d).format('YYYY-MM-DD');

    $scope.futureTimestamp = moment().add('days', 1).set('hour', 23).set('minute', 59).set('second', 59).format("x");
    // $scope.curTimestamp = moment().format("x");

    //$rootScope.contactRegExp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
    $scope.videoParam = "?autoplay=1&amp;rel=0&amp;showinfo=0";
    $scope.videoEmbed = "https://www.youtube.com/embed/";

    $scope.totalNotifications = 0;
    $scope.descriptionLimit = 500;
    $scope.notifications = {};
    $scope.selectedData = {};
    $scope.inputLimit = 100;
    $scope.auth = {};
    $scope.auth = $cookies.getObject("supportAuth");

    // $rootScope.sFiles = {img:[], vid:[], aud:[], ot:[]};
    $rootScope.sFilesExt = {
      "img":["gif","jpeg","jpg","png"],
      "vid":["mp4"],
      "ot":["csv","doc","docx","pdf","ppt","pptx","rar","txt","xls","xlsx","zip"]
    }

    /*Localization*/
    $translate.use($scope.auth.lang);
    $translate.refresh($scope.auth.lang);

    $scope.getLang = angular.fromJson(localStorage.getItem("supportLang"));
    $scope.toastNotification = $scope.getLang.notification;

    $http.defaults.headers.common.Authorization = $scope.auth.token;
    $scope.selectedData.token = $scope.auth.token;
    $scope.selectedData.uid = $scope.auth.uid;
    $scope.userName = $scope.auth.fName +" "+ $scope.auth.lName;
    $scope.userImg = $scope.auth.uimg;
    if(!$scope.userImg){
      $scope.userImg = "";
    }
    $scope.isPageaccessible = true;

    $scope.curTime = new Date(); //moment().format();
    $scope.curTimezone = $scope.curTime.getTimezoneOffset();

    $scope.settingFx = function(){
      $scope.hasErr = false;
      $scope.errType = "";
      if($scope.settings.pro.fName == "" || $scope.settings.pro.lName == ""){
        $scope.errType = "name";
        $scope.hasErr = true;
      } else{
        $scope.updateProcessing = true;
        MySettingsSrv.updateSettings($scope.settings.pro).then(
          function(data){
            $scope.auth = $cookies.getObject("supportAuth");
            $scope.auth.fName = $scope.settings.pro.fName;
            $scope.auth.lName = $scope.settings.pro.lName;
            $scope.auth.lang = $scope.settings.pro.lang;
            $scope.auth.uLog = $scope.settings.pro.isActivitylog;

            $cookies.putObject('supportAuth', $scope.auth);

            /*Localization*/
            if($scope.auth.lang != angular.fromJson(localStorage.getItem("supportAuthLang"))){
              LocalizationSrv.getLocalization($scope.auth.lang).then(
                function(data){
                  localStorage.setItem("supportAuthLang", JSON.stringify($scope.auth.lang));
                  localStorage.setItem("supportLang", JSON.stringify(data));
                  $window.location.reload();
                },
                function(err){
                  $log.error(err);
                }
              );
            } else{
              $state.reload();
            }
            $scope.updateProcessing = false;
          },
          function(err){
            $log.error(err);
            $scope.updateProcessing = false;
          }
        );
      }
    }


    $scope.uiVersionFx = function(){
      if(temp == "manual"){
        if(!$rootScope.uiVersion || $rootScope.uiVersion !== data.version){
          $translate.refresh();
          $window.location.reload();
          setTimeout(function(){
            $translate.refresh();
            $window.location.reload();
          }, 100);
        }
      } else {
        CommonSrv.getUIVersion().then(
          function(data){
            if(!$rootScope.uiVersion || $rootScope.uiVersion !== data.version){
              $translate.refresh();
              $window.location.reload();
              setTimeout(function(){
                $translate.refresh();
                $window.location.reload();
              }, 100);
            }
          },
          function(err){
            $log.error(err);
          }
        );
      }
    }
    $scope.uiVersionFx();

    /*State change*/
    var unregister = $rootScope.$on("$stateChangeStart", function(event, toState){
      $state.current = toState;
      $rootScope.search.text = "";
      $scope.curState = $state.current.name;
      $rootScope.timestamp = new Date().getTime();1
      $rootScope.$broadcast('curStateBroadcast', {curState: $scope.curState});
      $scope.futureTimestamp = moment().add('days', 1).set('hour', 23).set('minute', 59).set('second', 59).format("x");

      if(temp == "manual"){
        localStorage.removeItem("curfilterObj");
        localStorage.removeItem("ticketType");
      } else {
        if($scope.curState !== "support.tickets.a" && $scope.curState !== "support.tickets.o" && $scope.curState !== "support.tickets.r" && $scope.curState !== "support.tickets.n" && $scope.curState !== "support.tDetails"){
          /*Clear filter obj*/
          localStorage.removeItem("curfilterObj");
          localStorage.removeItem("ticketType");
        }
      }

      if($scope.curState !== "support.order.r" && $scope.curState !== "support.order.d" && $scope.curState !== "support.order.cm" && $scope.curState !== "support.order.cl" && $scope.curState !== "support.order.cn" && $scope.curState !== "support.order.odcu"){
        localStorage.removeItem("curOdFilterObj");
      }
    });
    $rootScope.$on('$destroy', unregister);

    // $('body').on('mousedown', function(e){
    //    e.preventDefault();
    //    this.blur();
    //    window.focus();
    // });

    $scope.ticketOpen = function(type){
      $scope.ticketType = 0;
      if(type == "task"){
        $scope.ticketType = 1;
      }
      $scope.ticket = {email:"", subject:"", body:"", agent:null, server:"", type:$scope.ticketType};
      $scope.popupProcessing = false;
      $scope.popupUFiles = [];
      $scope.popupSFiles = [];
      $scope.hasErrPop = false;
      $scope.errType = "";
      TicketDetailSrv.getAgent(0, "a").then(
        function(data){
          $scope.popupLoading = false;
          $scope.users = data;
        },
        function(err){
          $scope.popupLoading = false;
          $log.error(err);
        }
      );
      TicketDetailSrv.getCategory().then(
        function(data){
          $scope.categoryList = data;
        },
        function(err){
          $log.error(err);
        }
      );
      /*TicketDetailSrv.getDomain().then(
        function(data){
          if(data.domains.length){
            $scope.domainList = data.domains;
          }
        },
        function(err){
          $log.error(err);
        }
      );*/
      ngDialog.open({
        template:'app/common/popup/ticket.html',
        width: 650,
        scope: $scope,
        controller: "TicketsCreateController",
        closeByDocument: false
      });
    }

    // $rootScope.fileModelUploadFx = function(sFile, uFile){
    //   $scope.popupSFiles = sFile;
    //   $scope.popupUFiles = uFile;
    // }

    $scope.getToday = function(tDate){
      // if(moment(tDate).format('DDMMYYYY') == moment().format('DDMMYYYY')){
      //   return true;
      // }
      if(new Date(tDate).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)){
        return true;
      }
    }

    $scope.getDateFormat = function(tDate, format){
      if(format == 'dt'){
        return 'MMM dd, yyyy h:mm a';
      }
      if(format == "md"){
        if(new Date(tDate).getYear() != new Date().getYear()){
          return 'MMM dd, yyyy';
        } else{
          return 'MMM dd';
        }
      }
      if(new Date(tDate).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)){
        return 'h:mm a';
      } else if(new Date(tDate).getFullYear() != new Date().getFullYear()){
        if(format == "oDT"){
          return 'MMM dd, yyyy h:mm a';
        } else {
          return 'MMM dd, yyyy';
        }
      } else if(new Date(tDate).getYear() != new Date().getYear()){
        return 'MMM dd, yyyy';
      } else{
        if(format == "date"){
          return 'MMM dd';
        } else if(format == "oDT"){
          return 'MMM dd, yyyy h:mm a';
        } else{
          return 'MMM dd, yyyy h:mm a';
        }
      }
    }

    $scope.tabFx = function(tab, tabFx){
      $rootScope.selectedT = tab;
      if(tabFx == 'tabFx'){
        $scope.selectedTabFx();
      }
    }
    $scope.backBtnFx = function(){
      $rootScope.selectedT = $rootScope.selectedT - 1;
    }

    var myEvent = window.attachEvent || window.addEventListener;
    var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compitable

    $scope.ngDialogOpenedCount = 0;
    $rootScope.$on('ngDialog.opened', function(e, $dialog){
      $scope.ngDialogOpenedCount++;
      $rootScope.isPopupOpen = true;
      $rootScope.ngDialogId = $dialog.attr('id');
      $rootScope.resetSession();
      $rootScope.keepSessionAlive();
    });
    $rootScope.$on('ngDialog.closed', function(e, $dialog){
      $scope.ngDialogOpenedCount--;
      if($scope.ngDialogOpenedCount <= 0){
        $rootScope.isPopupOpen = false;
        $timeout.cancel($rootScope.sessionTimeoutTimer);
        $timeout.cancel($rootScope.sessionMsgHideTimer);
        $timeout.cancel($rootScope.restartSessionTimer);
        $rootScope.sessionTimoutFx();
      }
    });

    $scope.getAvailableHeight = function(deductableHeight){
      if(document.body && document.body.offsetWidth){
        $scope.winH = document.body.offsetHeight;
      }
      if(document.compatMode == 'CSS1Compat' && document.documentElement && document.documentElement.offsetWidth){
        $scope.winH = document.documentElement.offsetHeight;
      }
      if(window.innerWidth && window.innerHeight){
        $scope.winH = window.innerHeight;
      }
      $scope.winH = $scope.winH - deductableHeight;
      return $scope.winH;
    }

    $scope.mainContainerWidth = function(deductableWidth){
      if(!deductableWidth){
        deductableWidth = 0;
      }
      return angular.element(document).find(".mainContainer")[0].clientWidth - deductableWidth;
    }

    $scope.getAvailableWidth = function(deductableWidth){
      $scope.htmlWidth = angular.element(document)[0].children[0].clientWidth;
      $scope.winW = angular.element(document).find(".mainContainer")[0].clientWidth - deductableWidth;

      if($scope.htmlWidth < 1200){
        $scope.tempW = 1200 - $scope.htmlWidth;
        return $scope.winW - $scope.tempW +"px";
      } else{
        return $scope.winW +"px";
      }
    }

    angular.element($window).bind('resize', function(){
      $scope.$apply();
    });

    $rootScope.logOutFx = function(){
      CommonSrv.logOut({"token":$scope.auth.token}).then(
        function(data){
          localStorage.removeItem("supportAuthLang");
          localStorage.removeItem("curfilterObj");
          localStorage.removeItem("curOdFilterObj");
          $cookies.remove("supportAuth");
          $scope.supportCookies = $cookies.getAll();
          // angular.forEach($scope.supportCookies, function(v, k){
          //   $cookies.remove(k);
          // });
          //$state.go("login");
          ngDialog.close();
          $window.location.reload();
        },
        function(err){
          $log.error(err);
        }
      );
      //CommonSrv.logOut({"token":$scope.auth.token});
    }

    $scope.arraytoStringFx = function(object){
      $scope.stringIds = [];
      angular.forEach(object, function(obj){
        $scope.stringIds.push(obj.id);
      });
    }

    $scope.reverse = function(s){
      $scope.reverseStr = "";
      for(var i = s.length - 1; i >= 0; i--)
        $scope.reverseStr += s[i];
        return $scope.reverseStr;
    }

    $scope.hubEnc = function(id){
      return btoa($scope.reverse($scope.auth.token) + id + $scope.auth.email);
    }
    $scope.hubDec = function(id){
      return atob(id).split($scope.reverse($scope.auth.token))[1].split($scope.auth.email)[0];
    }
    $scope.hubEncrypt = function(id){
      return btoa($scope.auth.token + id + $scope.auth.fName);
    }
    $scope.hubDecrypt = function(id){
      return atob(id).split($scope.auth.token)[1].split($scope.auth.fName)[0];
    }
    $scope.trim = function(str){
			return str.replace(/^\s+|\s+$/g, '');
		}
    $scope.removeInArray = function(array, id){
      angular.forEach(array, function(item){
        if(item.id == id){
          array.splice(array.indexOf(item), 1);
        }
      });
    }

    /*Save Link As Popup*/
    $scope.linkOpenFx = function(url, size, type){
      ngDialog.open({
        template: "app/common/popup/saveLinkAs.html",
        width: 500,
        scope: $scope,
        data: {url:url, size:size, type:type},
        closeByDocument: false
      });
    }

    /*Notifications*/
    $scope.loadNotification = function(){
      CommonSrv.getNotifications().then(
        function(data){
          $scope.notifications = data;
          $scope.auth = $cookies.getObject("supportAuth");
          $scope.auth.life = $scope.notifications.life;
          $scope.totalNotifications = 0;
          if($scope.notifications.uc > 0){//unapproved content
            $scope.totalNotifications++;
          }
          if($scope.notifications.ec > 0){//expired content
            $scope.totalNotifications++;
          }
          if($scope.notifications.dc > 0){//deleted content
            $scope.totalNotifications++;
          }
          if($scope.notifications.ut > 0){//unapproved template
            $scope.totalNotifications++;
          }
          if($scope.notifications.it > 0){//incomplete template
            $scope.totalNotifications++;
          }
          if($scope.notifications.us > 0){//unapproved schedule
            $scope.totalNotifications++;
          }
          if($scope.notifications.is > 0){//incomplete schedule
            $scope.totalNotifications++;
          }
          if($scope.notifications.es > 0){//expired schedule
            $scope.totalNotifications++;
          }
          if($scope.notifications.ufl > 0){//unapproved frame layout
            $scope.totalNotifications++;
          }
          if($scope.notifications.if > 0){//incomplete frame layout
            $scope.totalNotifications++;
          }
          if($scope.notifications.efla > 0){//expired frame layout assignment
            $scope.totalNotifications++;
          }
          if($scope.notifications.inv > 0){//Invoice generated
            $scope.totalNotifications++;
          }
          if($scope.notifications.ucs > 0){//unapproved creative services
            $scope.totalNotifications++;
          }
          //$scope.totalNotifications = $scope.notifications.efla + $scope.notifications.uc + $scope.notifications.ut + $scope.notifications.ufl + $scope.notifications.us + $scope.notifications.inv + $scope.notifications.ucs + $scope.notifications.dc + $scope.notifications.it + $scope.notifications.if + $scope.notifications.is;
          //$scope.totalNotifications = $scope.notifications.efla + $scope.notifications.uc + $scope.notifications.ut + $scope.notifications.ufl + $scope.notifications.us + $scope.notifications.inv + $scope.notifications.ucs;
          if(!$rootScope.uiVersion || $rootScope.uiVersion !== $scope.notifications.ui){
            $translate.refresh();
            $window.location.reload();
          }
        },
        function(err){
          $log.error(err);
        }
      );
    }
    // $scope.loadNotification();

    $(document).on("click",".input-group-addon", function(e){
      e.preventDefault();
      e.stopPropagation();
      if(!$(this).siblings(".picker").is(':disabled')){
        $(this).siblings(".picker").click();
      }
    });

    $scope.connection = navigator.onLine;
    $window.addEventListener("offline", function(){
      $rootScope.$apply(function(){
        $scope.connection = false;
        $scope.isConnection = false;
        $scope.connectionFx();
      });
    }, false);
    $window.addEventListener("online", function(){
      $rootScope.$apply(function(){
        $scope.connection = true;
        if(!$scope.isConnection){
          Notification.clearAll();
        }
      });
    }, false);
    $scope.connectionFx = function(){
      Notification.error({message:$filter("translate")('cm.msg.27'), positionX:'center', delay:null, replaceMessage:true});
    }
    if(!$scope.connection){
      $scope.connectionFx();
    }
    $rootScope.toastNotificationFx = function(type, data, suffix){
      if(!suffix){
        suffix = "";
      }
      if($scope.connection){
        $scope.isConnection = true;
        angular.forEach($scope.toastNotification, function(toast){
          if(data && (toast.id == data.code)){
            if(data.code == 5000){
              Notification.error({message:toast.en, positionX:'center', replaceMessage:true});
            } else if(data.code == 15012){
              Notification.error({message:toast.en, positionX:'center', replaceMessage:true});
            } else if(data.code == 4004){
              Notification.error({message:toast.en + " " + suffix, positionX:'center', replaceMessage:true});
            } else{
              if(type == "success"){
                Notification.success({message:toast.en + suffix, positionX:'center', replaceMessage:true});
              } else if(type == "info"){
                Notification.warning({message:toast.en + suffix, positionX:'center', replaceMessage:true});
              } else if(type == "danger"){
                Notification.error({message:toast.en + suffix, positionX:'center', replaceMessage:true});
              }
              //$scope.loadNotification();
            }
          } else if(data && data.code == 99999){
           $state.go("login");
         }
        });
      }
    }
    $rootScope.itemInArray = function(arr, obj){
			for(var i=0; i<arr.length; i++){
				if(arr[i] == obj) return true;
			}
		}

    $scope.noDuplicates = function(arr){
    	var curArr = [];
    	angular.forEach(arr, function(item){
    		var exists = false;
    		angular.forEach(curArr, function(item1){
    			if(angular.equals(item.Id, item1.Id)){
    			  exists = true;
    			}
    		});
    		if(exists === false && item.Id !== ""){
    		  curArr.push(item);
    		}
    	});
      return curArr;
    };

    $scope.sortFx = function(sType, sVal, targetList, moduleName, targetList2){
      if(sType === "l"){//label
        if(sVal === "a"){
          targetList = targetList.sort(function(a, b){
            return a.label.toString().localeCompare(b.label);
          });
          if(targetList2){
            targetList2 = targetList2.sort(function(a, b){
              return a.label.toString().localeCompare(b.label);
            });
          }
        }
        else if(sVal === "d"){
          targetList = targetList.sort(function(a, b){
            return b.label.toString().localeCompare(a.label);
          });
          if(targetList2){
            targetList2 = targetList2.sort(function(a, b){
              return b.label.toString().localeCompare(a.label);
            });
          }
        }
      }
      else if(sType === "c"){//CreatedOn
        if(sVal === "a"){
          targetList = targetList.sort(function(a, b){
            return a.createdOn - b.createdOn;
          });
          if(targetList2){
            targetList2 = targetList2.sort(function(a, b){
              return a.createdOn - b.createdOn;
            });
          }
        }
        else if(sVal === "d"){
          targetList = targetList.sort(function(a, b){
            return b.createdOn - a.createdOn;
          });
          if(targetList2){
            targetList2 = targetList2.sort(function(a, b){
              return b.createdOn - a.createdOn;
            });
          }
        }
      }
      else if(sType === "a"){//Assigned to
        if(sVal === "a"){
          targetList = targetList.sort(function(a, b){
            console.log("Assigned a b ", a , b)
            return a.to.toString().localeCompare(b.to);
          });
          if(targetList2){
            targetList2 = targetList2.sort(function(a, b){
              return a.to.toString().localeCompare(b.to);
            });
          }
        }
        else if(sVal === "d"){
          targetList = targetList.sort(function(a, b){
            return b.to.toString().localeCompare(a.to);
          });
          if(targetList2){
            targetList2 = targetList2.sort(function(a, b){
              return b.to.toString().localeCompare(a.to);
            });
          }
        }
      }
      else if(sType === "u"){//UpdatedOn
        if(sVal === "a"){
          targetList = targetList.sort(function(a, b){
            return a.date - b.date;
          });
          if(targetList2){
            targetList2 = targetList2.sort(function(a, b){
              if(a.date - b.date){
                return a.date - b.date;
              } else{
                return a.label.toString().localeCompare(b.label);
              }
            });
          }
        }
        else if(sVal === "d"){
          targetList = targetList.sort(function(a, b){
            return b.date - a.date;
          });
          if(targetList2){
            targetList2 = targetList2.sort(function(a, b){
              if(a.date - b.date){
                return b.date - a.date;
              } else{
                return a.label.toString().localeCompare(b.label);
              }
            });
          }
        }
      }
      CommonSrv.setSort({"type":sType,"val":sVal,"module":moduleName}).then(
        function(data){
          $scope.auth = $cookies.getObject("supportAuth");
          if(moduleName == "t"){
            $scope.auth.sort.t = {type:sType, val:sVal};
          }
          $cookies.putObject('supportAuth', $scope.auth);
        },
        function(err){
          $log.error(err);
        }
      );
    }

    $scope.activeColumnFx = function(col){
      $scope.activeCol = col;
    }

    $scope.columnSortFx = function(sType, sVal, targetList, moduleName){
      $scope.saveProcessing = true;

      //clear temp sorting value
      if($scope.curState == "support.order.r"){
        if($rootScope.tmpSortVal == 'd'){
          sVal = 'a';
        }
        $rootScope.tmpSortVal = "";
      }

      if(moduleName === 'cust'){
        if(sType === "l"){//customer, category, label
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.label.toString().localeCompare(b.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.label.toString().localeCompare(a.label);
            });
          }
        }
      }
      if(moduleName === 'label' || moduleName === 'cat' || moduleName === 'ven' || moduleName === 'courier' || moduleName === 'invt'){
        if(sType === "l"){//customer, category, label
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.label.toString().localeCompare(b.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.label.toString().localeCompare(a.label);
            });
          }
        }
      }
      if(moduleName ==='sur'){
        if(sType === "t"){//
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.title.toString().localeCompare(b.title);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.title.toString().localeCompare(a.title);
            });
          }
        }
      }
      if(moduleName === 'ntem'){
        if(sType === "e"){//survey, non ticket email
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.email.toString().localeCompare(b.email);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.email.toString().localeCompare(a.email);
            });
          }
        }
      }
      if(moduleName === 'user'){
        if(sType === "n"){//
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.label.toString().localeCompare(b.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.label.toString().localeCompare(a.label);
            });
          }
        }

        if(sType === "t"){//userType
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              if(a.userType=='1'){
                a.userName = 'Support';
              } else if(a.userType=='2'){
                a.userName = 'Sales';
              } else if(a.userType=='3'){
                a.userName = 'Accounts';
              } else if(a.userType=='4'){
                a.userName = 'Admin';
              } else if(a.userType=='5'){
                a.userName = 'Super Admin';
              }

              if(b.userType=='1'){
                b.userName = 'Support';
              } else if(b.userType=='2'){
                b.userName = 'Sales';
              } else if(b.userType=='3'){
                b.userName = 'Accounts';
              } else if(b.userType=='4'){
                b.userName = 'Admin';
              } else if(b.userType=='5'){
                b.userName = 'Super Admin';
              }

              return a.userName.toString().localeCompare(b.userName);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              if(a.userType=='1'){
                a.userName = 'Support';
              } else if(a.userType=='2'){
                a.userName = 'Sales';
              } else if(a.userType=='3'){
                a.userName = 'Accounts';
              } else if(a.userType=='4'){
                a.userName = 'Admin';
              } else if(a.userType=='5'){
                a.userName = 'Super Admin';
              }

              if(b.userType=='1'){
                b.userName = 'Support';
              } else if(b.userType=='2'){
                b.userName = 'Sales';
              } else if(b.userType=='3'){
                b.userName = 'Accounts';
              } else if(b.userType=='4'){
                b.userName = 'Admin';
              } else if(b.userType=='5'){
                b.userName = 'Super Admin';
              }

              return b.userName.toString().localeCompare(a.userName);
            });
          }
        }
      }
      if(moduleName === 'kbar' && moduleName === 'kbvi'){
        if(sType === "t"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.label.toString().localeCompare(b.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.label.toString().localeCompare(a.label);
            });
          }
        }
      }
      if(moduleName === 'ord'){
        if(sType === "i"){//order id
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.id - b.id;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.id - a.id;
            });
          }
        } else if(sType === "cr"){//CreatedBy
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.createdBy.label.toString().localeCompare(b.createdBy.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.createdBy.label.toString().localeCompare(a.createdBy.label);
            });
          }
        } else if(sType === "dept"){//Department/assignedTo
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.dept.toString().localeCompare(b.dept);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.dept.toString().localeCompare(a.dept);
            });
          }
        } else if(sType === "dis"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.dispatchedBy.label.toString().localeCompare(b.dispatchedBy.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.dispatchedBy.label.toString().localeCompare(a.dispatchedBy.label);
            });
          }
        } else if(sType === "comp"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.completedBy.label.toString().localeCompare(b.completedBy.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.completedBy.label.toString().localeCompare(a.completedBy.label);
            });
          }
        } else if(sType === "clos"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.closedBy.label.toString().localeCompare(b.closedBy.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.closedBy.label.toString().localeCompare(a.closedBy.label);
            });
          }
        } else if(sType === "canc"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.cancelledBy.label.toString().localeCompare(b.cancelledBy.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.cancelledBy.label.toString().localeCompare(a.cancelledBy.label);
            });
          }
        }
      }
      if(moduleName === 'invd' || moduleName === 'invo'){//inventory
        if(sType === "sn"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.sn.toString().localeCompare(b.sn);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.sn.toString().localeCompare(a.sn);
            });
          }
        } else if (sType === "n"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.type.label.toString().localeCompare(b.type.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.type.label.toString().localeCompare(a.type.label);
            });
          }
        } else if (sType === "m"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.model.label.toString().localeCompare(b.model.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.model.label.toString().localeCompare(a.model.label);
            });
          }
        } else if (sType === "c"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.cost - b.cost;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.cost - a.cost;
            });
          }
        }
      }
      if(moduleName === 'ts'){//timesheet
        if(sType === "n"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.uName.toString().localeCompare(b.uName);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.uName.toString().localeCompare(a.uName);
            });
          }
        } else if (sType === "ws"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.date.start - b.date.start;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.date.start - a.date.start;
            });
          }
        } else if (sType === "wh"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.total - b.total;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.total - a.total;
            });
          }
        }
      }
      if(moduleName === 'ser_ser'){//server
        if(sType === "n"){//name
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.label.toString().localeCompare(b.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.label.toString().localeCompare(a.label);
            });
          }
        } else if(sType === "cr"){//created by
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.cr.fname.toString().localeCompare(b.cr.fname);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.cr.fname.toString().localeCompare(a.cr.fname);
            });
          }
        } else if(sType === "pa"){//prime admin
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.pa.email.toString().localeCompare(b.pa.email);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.pa.email.toString().localeCompare(a.pa.email);
            });
          }
        } else if (sType === "l"){//license
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.licenses - b.licenses;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.licenses - a.licenses;
            });
          }
        } else if (sType === "d"){//devices
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.devices - b.devices;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.devices - a.devices;
            });
          }
        }
      }
      if(moduleName === 'ser_dev'){//servers - device
        if(sType === "n"){//name
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.label.toString().localeCompare(b.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.label.toString().localeCompare(a.label);
            });
          }
        } else if(sType === "m"){//mac
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.mac.toString().localeCompare(b.mac);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.mac.toString().localeCompare(a.mac);
            });
          }
        } else if(sType === "t"){//type
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.type.toString().localeCompare(b.type);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.type.toString().localeCompare(a.type);
            });
          }
        } else if (sType === "v"){//version
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.sVer.toString().localeCompare(b.sVer);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.sVer.toString().localeCompare(a.sVer);
            });
          }
        } else if (sType === "s"){//server
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.slabel.toString().localeCompare(b.slabel);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.slabel.toString().localeCompare(a.slabel);
            });
          }
        } else if (sType === "a"){//addOn
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.createdOnTS - b.createdOnTS;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.createdOnTS - a.createdOnTS;
            });
          }
        } else if (sType === "l"){//lastping
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.pingTS - b.pingTS;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.pingTS - a.pingTS;
            });
          }
        }
      }
      if(moduleName === 'ser_user'){//servers - users
        if(sType === "n"){//name
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return (a.fname + " " + a.lname).toString().localeCompare(b.fname + " " + b.lname);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return (b.fname + " " + b.lname).toString().localeCompare(a.fname + " " + a.lname);
            });
          }
        } else if(sType === "e"){//email
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.email.toString().localeCompare(b.email);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.email.toString().localeCompare(a.email);
            });
          }
        } else if(sType === "rr"){//server role
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.type.toString().localeCompare(b.type);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.type.toString().localeCompare(a.type);
            });
          }
        } else if (sType === "ll"){//last login
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.loginTS - b.loginTS;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.loginTS - a.loginTS;
            });
          }
        }
      }
      if(moduleName === 'ser_wid'){//servers - widget
        if(sType === "n"){//type
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.name.toString().localeCompare(b.name);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.name.toString().localeCompare(a.name);
            });
          }
        } else if(sType === "s"){//schedule
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.sc - b.sc;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.sc - a.sc;
            });
          }
        } else if(sType === "a"){//server role
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.ac - b.ac;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.ac - a.ac;
            });
          }
        }
      }
      if(moduleName ==='invm'){
        if(sType === "t"){//type
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.typeLabel.toString().localeCompare(b.typeLabel);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.typeLabel.toString().localeCompare(a.typeLabel);
            });
          }
        } else if(sType === "l"){//model
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.label.toString().localeCompare(b.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.label.toString().localeCompare(a.label);
            });
          }
        }
      }
      if(moduleName === 't'){//ticket
        if(sType === "l"){//label
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.label.toString().localeCompare(b.label);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.label.toString().localeCompare(a.label);
            });
          }
        } if(sType === "s"){//subject
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.sub.toString().localeCompare(b.sub);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.sub.toString().localeCompare(a.sub);
            });
          }
        } if(sType === "a"){//subject
          if(sVal === "a"){//assignee
            targetList = targetList.sort(function(a, b){
              return a.to.toString().localeCompare(b.to);
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.to.toString().localeCompare(a.to);
            });
          }
        } else if (sType === "u"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.date - b.date;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.date - a.date;
            });
          }
        } else if (sType === "c"){
          if(sVal === "a"){
            targetList = targetList.sort(function(a, b){
              return a.createdOn - b.createdOn;
            });
          }
          else if(sVal === "d"){
            targetList = targetList.sort(function(a, b){
              return b.createdOn - a.createdOn;
            });
          }
        }
      }

      CommonSrv.setSort({"type":sType,"val":sVal,"module":moduleName}).then(
        function(data){
          $scope.saveProcessing = false;
          $scope.auth = $cookies.getObject("supportAuth");
          if(moduleName == "cust"){
            $scope.auth.sort.cust = {type:sType, val:sVal};
          } else if(moduleName == "label"){
            $scope.auth.sort.label = {type:sType, val:sVal};
          } else if(moduleName == "cat"){
            $scope.auth.sort.cat = {type:sType, val:sVal};
          } else if(moduleName == "sur"){
            $scope.auth.sort.sur = {type:sType, val:sVal};
          } else if(moduleName == "ven"){
            $scope.auth.sort.ven = {type:sType, val:sVal};
          } else if(moduleName == "ntem"){
            $scope.auth.sort.ntem = {type:sType, val:sVal};
          } else if(moduleName == "user"){//Users sec
            $scope.auth.sort.user = {type:sType, val:sVal};
          } else if(moduleName == "kbar"){//KB articles
            $scope.auth.sort.kbar = {type:sType, val:sVal};
          } else if(moduleName == "kbvi"){//KB videos
            $scope.auth.sort.kbvi = {type:sType, val:sVal};
          } else if(moduleName == "ord"){//order
            $scope.auth.sort.ord = {type:sType, val:sVal};
          } else if(moduleName == "invd"){//inventory device
            $scope.auth.sort.invd = {type:sType, val:sVal};
          } else if(moduleName == "invo"){//inventory device
            $scope.auth.sort.invo = {type:sType, val:sVal};
          } else if(moduleName == "ts"){//timesheet
            $scope.auth.sort.ts = {type:sType, val:sVal};
          } else if(moduleName == "ser_ser"){//servers - server
            $scope.auth.sort.ser_ser = {type:sType, val:sVal};
          } else if(moduleName == "ser_dev"){//servers - device
            $scope.auth.sort.ser_dev = {type:sType, val:sVal};
          } else if(moduleName == "ser_user"){//servers - user
            $scope.auth.sort.ser_user = {type:sType, val:sVal};
          } else if(moduleName == "ser_wid"){//servers - widget
            $scope.auth.sort.ser_wid = {type:sType, val:sVal};
          } else if(moduleName == "t"){//ticket
            $scope.auth.sort.t = {type:sType, val:sVal};
          } else if(moduleName == "courier"){//ticket
            $scope.auth.sort.courier = {type:sType, val:sVal};
          } else if(moduleName == "invt"){//ticket
            $scope.auth.sort.invt = {type:sType, val:sVal};
          } else if(moduleName == "invm"){//ticket
            $scope.auth.sort.invm = {type:sType, val:sVal};
          }

          $cookies.putObject('supportAuth', $scope.auth);
        },
        function(err){
          $log.error(err);
          $scope.saveProcessing = false;
        }
      );
    }

    //KB article search box
    $scope.tabListSearchFx = function(key){
      $scope.folderCount = $scope.contentCount = 0;
      $scope.searchMsg = false;

      $scope.searchRegExp = new RegExp(key, "gi");
      $scope.curSearch = $filter('findAndReplace')($rootScope.search.text,"'", $scope.searchReplaceChar);
    	if($("#tab-list").length > 0){
        $scope.allFolderCount = $("#tab-list .folderQuad").length;
        $scope.allContentCount = $("#tab-list li").length;

    		$("#tab-list li").each(function(e){
    			$scope.searchRegExp.lastIndex = 0;
    			if($scope.searchRegExp.test($(this).find("div:nth-child(1)").text())){
            $(this).removeClass("sch-hide");
            $(this).show();
    			}
    			else{
    				//searchHideCounter++;
            $(this).addClass("sch-hide");
    				$(this).hide();
            if($(this).length){
              $scope.contentCount++;
            }
    			}
    		});
        $("#tab-list .folderQuad").each(function(e){
          $scope.searchRegExp.lastIndex = 0;
          if($scope.searchRegExp.test($(this).find("a").text())){
            $(this).show();
            $(this).find("li").each(function(e){
              $(this).removeClass("sch-hide");
              $(this).show();
            })
    			}
          else{
            $scope.allChildHidden = true;
            $(this).find("li").each(function(e){
              if(!$(this).hasClass("sch-hide")){
                $scope.allChildHidden = false;
                return false;
              }
            });
            if($scope.allChildHidden){
              $(this).hide();
            }
            else{
              $(this).show();
            }
            if($(this).length){
              $scope.folderCount++;
            }
          }
        });

        if(($scope.folderCount == $scope.allFolderCount) && ($scope.contentCount == $scope.allContentCount)){
          $scope.searchMsg = true;
        }

        if(key.length == 0){
          $scope.searchRegExp = new RegExp("'", "gi");
        }

    		// if(searchHideCounter == $("#ordersList div.row:not(.th)").length){
    		// 	$("#ordersList").append('<div class="highlightMsg noSearchResult marT10">Your search - <span class="text-bold">' + $("#searchTbx").val() + '</span> - did not match any item. Try different keyword.</div>');
    		// }
    	}
    }

    /*Timepicker*/
    $scope.ismeridian = true;
    $scope.toggleMode = function(){
      $scope.ismeridian = ! $scope.ismeridian;
    };

    /*FancyBox Control*/
    $scope.fbTitleInside = {
      helpers: {
        title: {
          type: "inside"
        }
      }
    }
    $scope.fbGroup = {
      loop: false,
      nextSpeed: 250,
      prevMethod: false,
      nextMethod: "resizeIn",
      helpers: {
        title: {
          type: "inside"
        }
      }
    }
    $scope.fbMedia = {
      openEffect: "none",
      closeEffect: "none",
      helpers: {
        media: {},
        title: {
          type: "inside"
        }
      }
    }
    $scope.fbVideoFx = function (url, title){
      $.fancybox({
        type: "iframe",
        helpers: {
          title: {
            type: "inside"
          }
        },
        content: '<video width="635" controls preload><source src="' + url + '" type="video/mp4" /></video>',
        beforeShow: function (){
          var video = $('.fancybox-inner').find("video").get(0);
          video.load();
          video.play();
        },
        afterLoad: function (){
          this.title = title;
        },
      });
    }
    $scope.fbAudioFx = function (url, title){
      $.fancybox({
        type: "iframe",
        helpers: {
          title: {
            type: "inside"
          }
        },
        minHeight: "auto",
        content: '<audio controls preload><source src="' + url + '" type="audio/mp3" /></audio>',
        beforeShow: function (){
          var audio = $('.fancybox-inner').find("audio").get(0);
          audio.load();
          audio.play();
        },
        afterLoad: function (){
          this.title = title;
        },
      });
    }
    $scope.fbFlashFx = function (url, title, dimension){
      if(dimension){
        $scope.flashWidth = dimension.split(", ")[0].split("W [")[1].split("]")[0];
        $scope.flashHeight = dimension.split(", ")[1].split("H [")[1].split("]")[0];
      } else{
        $scope.flashWidth = "auto";
        $scope.flashHeight = "auto";
      }
      $.fancybox({
        type: "iframe",
        helpers: {
          title: {
            type: "inside"
          }
        },
        content: '<object width="'+ $scope.flashWidth +'" height="'+ $scope.flashHeight +'" data="'+ url +'"></object>',
        afterLoad: function (){
          this.title = title;
        },
      });
    }
  }
})();
