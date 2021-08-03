(function() {
  'use strict';

  angular
    .module('support')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
      url: '/:id',
      templateUrl: 'app/login/login.html',
      controller: 'LoginController',
      controllerAs: 'login',
      data: {
        id: 51,
        pageTitle: 'Login'
      }
    })
    .state('forgotPassword', {
      url: '/forgotPassword/',
      templateUrl: 'app/login/fp.html',
      controller: 'FPController',
      controllerAs: 'fPass',
      data: {
        id: 52,
        pageTitle: 'Forgot Password'
      }
    })
    .state('showPassword', {
      url: '/showPassword/:id/:email',
      templateUrl: 'app/login/sp.html',
      controller: 'SPController',
      controllerAs: 'spCtrl',
      data: {
        id: 53,
        pageTitle: 'Show Password'
      }
    })
    .state('resetPass', {
      url: '/resetPassword/:id',
      templateUrl: 'app/login/rp.html',
      controller: 'ResetPassController',
      controllerAs: 'resetPassCtrl',
      data:{
        id:63,
        pageTitle:'Reset Password'
      }
    })
    .state('assignToMe', {
      url: '/atm/:uId/:thId/:tiId',
      templateUrl: 'app/login/atm.html',
      controller: 'ATMController',
      controllerAs: 'atmCtrl',
      data: {
        id: 54,
        pageTitle: 'Assign to me'
      }
    })

    .state('support', {
      url: '/support',
      views: {
        '': {
          templateUrl: 'app/common/home.html',
          controller: 'CommonController',
          controllerAs: 'common'
        },
        "header@support": {
          templateUrl: 'app/common/header.html'
        },
        "leftPanel@support": {
          templateUrl: 'app/common/leftPanel.html'
        },
        "footer@support": {
          templateUrl: 'app/common/footer.html'
        }
      }
    })

    /*Dashboard*/
    .state('support.dashboard', {
      url: '/dashboard/',
      templateUrl: 'app/dashboard/dashboard.html',
      controller: 'DashboardController',
      controllerAs: 'dashboardCtrl',
      data: {
        id: 0,
        pageTitle: 'Dashboard'
      }
    })

    /*Tickets*/
    .state('support.tickets', {
      url: '/tickets',
      templateUrl: 'app/ticket/tickets.html',
      controller: 'TicketController',
      controllerAs: 'ticketCtrl',
      data: {
        id: 1,
        pageTitle: 'Tickets'
      }
    })
      /*Tickets Tab's*/
      .state('support.tickets.a', {
        url: '/a/',
        views: {
          "tabView": {
            templateUrl: 'app/ticket/a.html'
          }
        }
      })
      .state('support.tickets.o', {
        url: '/o/',
        views: {
          "tabView": {
            templateUrl: 'app/ticket/o.html'
          }
        }
      })
      .state('support.tickets.r', {
        url: '/r/',
        views: {
          "tabView": {
            templateUrl: 'app/ticket/r.html'
          }
        }
      })
      .state('support.tickets.n', {
        url: '/n/',
        views: {
          "tabView": {
            templateUrl: 'app/ticket/n.html'
          }
        }
      })
      .state('support.tDetails', {
        url: '/tickets/details/:id',
        templateUrl: 'app/ticket/details.html',
        controller: 'tDetailsController',
        controllerAs: 'tDetailsCtrl',
        data: {
          id: 1,
          pageTitle: 'Tickets'
        }
      })


      /*Apps*/
      .state('support.settings', {
        url: '/settings',
        templateUrl: 'app/settings/settings.html',
        controller: 'SettingsController',
        controllerAs: 'settingsCtrl',
        data: {
          id: 2,
          pageTitle: 'Settings'
        }
      })
        /*Apps Tab's*/
        .state('support.settings.d', {
          url: '/d/',
          views: {
            "tabView": {
              templateUrl: 'app/settings/d.html'
            }
          }
        })
        .state('support.settings.nt', {
          url: '/nt/',
          views: {
            "tabView": {
              templateUrl: 'app/settings/nt.html'
            }
          }
        })
        .state('support.settings.l', {
          url: '/l/',
          views: {
            "tabView": {
              templateUrl: 'app/settings/l.html'
            }
          }
        })
        .state('support.settings.c', {
          url: '/c/',
          views: {
            "tabView": {
              templateUrl: 'app/settings/c.html'
            }
          }
        })
        .state('support.settings.s', {
          url: '/s/',
          views: {
            "tabView": {
              templateUrl: 'app/settings/s.html'
            }
          }
        })
        .state('support.settings.v', {
          url: '/v/',
          views: {
            "tabView": {
              templateUrl: 'app/settings/v.html'
            }
          }
        })
        .state('support.settings.cs', {
          url: '/cs/',
          views: {
            "tabView": {
              templateUrl: 'app/settings/cs.html'
            }
          }
        })

        /* Survey */
        .state('support.scu', {
          url: '/settings/scu/:id',
          templateUrl: 'app/settings/survey/scu.html',
          controller: 'SurveyCUController',
          controllerAs: 'surveyCUCtrl',
          data: {
            id: 2,
            pageTitle: 'Settings'
          }
        })
        .state('support.result', {
          url: '/setting/s/r/:id',
          templateUrl: 'app/settings/survey/result.html',
          controller: 'SurveyController',
          controllerAs: 'surveyCtrl',
          data: {
            id: 2,
            pageTitle: 'Settings'
          }
        })
        .state('s', {
          url: '/survey',
          views: {
            '': {
              templateUrl: 'app/settings/survey/home.html',
              controller: 'SurveyController'
            }
          }
        })
        .state('s.survey', {
          url: '/:id',
          templateUrl: 'app/settings/survey/participate.html',
          data: {
            id: 56,
            pageTitle: 'Survey Participate'
          }
        })
        .state('s.thanks', {
          url: '/thanks/:id',
          templateUrl: 'app/settings/survey/thanks.html',
          data: {
            id: 57,
            pageTitle: 'Survey Thanks'
          }
        })

      /* Vendors */
      .state('support.vcu', {
        url: '/settings/vcu/:id',
        templateUrl: 'app/settings/vendor/vcu.html',
        controller: 'VendorCUController',
        controllerAs: 'vendorCUCtrl'
      })


      /*Knowledge Base*/
      .state('support.kb', {
        url: '/kb',
        templateUrl: 'app/knowledgeBase/kb.html',
        controller: 'KBController',
        controllerAs: 'kbCtrl',
        data: {
          id: 3,
          pageTitle: 'Knowledge Base'
        }
      })
        /*Knowledge Base Tab's*/
        .state('support.kb.a', {
          url: '/a/',
          views: {
            "tabView": {
              templateUrl: 'app/knowledgeBase/a.html'
            }
          }
        })
        .state('support.kb.v', {
          url: '/v/',
          views: {
            "tabView": {
              templateUrl: 'app/knowledgeBase/v.html'
            }
          }
        })
        .state('support.kb.d', {
          url: '/d/',
          views: {
            "tabView": {
              templateUrl: 'app/knowledgeBase/d.html'
            }
          }
        })

        /*Inventory*/
        .state('support.i', {
          url: '/i',
          templateUrl: 'app/inventory/inventories.html',
          controller: 'IController',
          controllerAs: 'iCtrl',
          data: {
            id: 6,
            pageTitle: 'Inventory'
          }
        })
          /*Inventory Tab's*/
          .state('support.i.d', {
            url: '/d/:types',
            views: {
              "tabView": {
                templateUrl: 'app/inventory/d.html',
                controller: 'IController',
                controllerAs: 'icuCtrl'
              }
            }
          })
          .state('support.i.o', {
            url: '/o/:types',
            views: {
              "tabView": {
                templateUrl: 'app/inventory/o.html',
                controller: 'IController',
                controllerAs: 'icuCtrl'
              }
            }
          })
          .state('support.i.cu', {
            url: '/cu/:types/:id',
            views: {
              "tabView": {
                templateUrl: 'app/inventory/cu.html',
                controller: 'IcuController',
                controllerAs: 'icuCtrl'
              }
            }
          })
          .state('support.i.t', {
            url: '/t/:types',
            views: {
              "tabView": {
                templateUrl: 'app/inventory/t.html',
                controller: 'IController',
                controllerAs: 'icuCtrl'
              }
            }
          })
          .state('support.i.m', {
            url: '/m/:types',
            views: {
              "tabView": {
                templateUrl: 'app/inventory/m.html',
                controller: 'IController',
                controllerAs: 'icuCtrl'
              }
            }
          })

      /*Order*/
      .state('support.order', {
        url: '/order',
        templateUrl: 'app/order/order.html',
        controller: 'OrderController',
        controllerAs: 'orderCtrl',
        data: {
          id: 7,
          pageTitle: 'Order'
        }
      })
      /*Order Base Tab's*/
      .state('support.order.d', {
        url: '/d/:types',
        views: {
          "tabView": {
            templateUrl: 'app/order/d.html',
            controller: 'OrderController'
          }
        }
      })
      .state('support.order.r', {
        url: '/r/:types',
        views: {
          "tabView": {
            templateUrl: 'app/order/r.html',
            controller: 'OrderController'
          }
        }
      })
      .state('support.order.cm', {
        url: '/cm/:types',
        views: {
          "tabView": {
            templateUrl: 'app/order/cm.html',
            controller: 'OrderController'
          }
        }
      })
      .state('support.order.cn', {
        url: '/cn/:types',
        views: {
          "tabView": {
            templateUrl: 'app/order/cn.html',
            controller: 'OrderController'
          }
        }
      })
      .state('support.order.cl', {
        url: '/cl/:types',
        views: {
          "tabView": {
            templateUrl: 'app/order/cl.html',
            controller: 'OrderController'
          }
        }
      })
      .state('support.order.odcu', {
        url: '/odcu/:types/:id',
        views: {
          "tabView": {
            templateUrl: 'app/order/odcu.html',
            controller: 'OrderCUController',
            controllerAs: 'orderCUCtrl'
          }
        }
      })
      .state('support.order.detail', {
        url: '/detail/:types/:id',
        views: {
          "tabView": {
            templateUrl: 'app/order/detail.html',
            controller: 'OrderDetailController',
            controllerAs: 'orderDetailCtrl'
          }
        }
      })
      // .state('support.order.detail', {
      //   url: '/detail/:types/:id',
      //   views: {
      //     "tabView": {
      //       templateUrl: 'app/order/detail.html',
      //       controller: 'OrderController',
      //       controllerAs: 'orderCtrl'
      //     }
      //   }
      // })
      /*Users*/
      .state('support.users', {
        url: '/users',
        templateUrl: 'app/users/users.html',
        controller: 'UsersController',
        controllerAs: 'usersCtrl',
        data: {
          id: 4,
          pageTitle: 'Users'
        }
      })
        /*Users Tab's*/
        .state('support.users.ul', {
          url: '/ul/',
          views: {
            "tabView": {
              templateUrl: 'app/users/ul.html'
            }
          }
        })
        .state('support.users.sc', {
          url: '/sc/',
          views: {
            "tabView": {
              templateUrl: 'app/users/sc.html'
            }
          }
        })

      /*Reports*/
      .state('support.reports', {
        url: '/reports',
        templateUrl: 'app/reports/reports.html',
        controller: 'ReportsController',
        controllerAs: 'reportsCtrl',
        data: {
          id: 5,
          pageTitle: 'Reports'
        }
      })
        /*Reports Tab's*/
        .state('support.reports.tr', {
          url: '/tr/',
          views: {
            "tabView": {
              templateUrl: 'app/reports/tr.html'
            }
          }
        })
        .state('support.reports.tsr', {
          url: '/tsr/',
          views: {
            "tabView": {
              templateUrl: 'app/reports/tsr.html'
            }
          }
        })
        .state('support.reports.odr', {
          url: '/odr/',
          views: {
            "tabView": {
              templateUrl: 'app/reports/odr.html'
            }
          }
        })

      /*Time Sheet*/
      .state('support.timeSheet', {
        url: '/timeSheet',
        templateUrl: 'app/timeSheet/timeSheet.html',
        controller: 'TimeSheetController',
        controllerAs: 'timeSheetCtrl',
        data: {
          id: 9,
          pageTitle: 'Time Sheet'
        }
      })
        .state('support.timeSheet.o', {
          url: '/o/',
          views: {
            "tabView": {
              templateUrl: 'app/timeSheet/o.html'
            }
          }
        })
        .state('support.timeSheet.s', {
          url: '/s/',
          views: {
            "tabView": {
              templateUrl: 'app/timeSheet/s.html'
            }
          }
        })
        .state('support.timeSheet.a', {
          url: '/a/',
          views: {
            "tabView": {
              templateUrl: 'app/timeSheet/a.html'
            }
          }
        })

        /*Time Sheet Tab's*/
        .state('support.tsDetails', {
          url: '/timeSheet/details/:id',
          templateUrl: 'app/timeSheet/details.html',
          controller: 'TSDetailsController',
          controllerAs: 'tsDetailsCtrl',
          data: {
            id: 9,
            pageTitle: 'Time Sheet'
          }
        })

      /*Servers*/
      .state('support.servers', {
        url: '/servers',
        templateUrl: 'app/servers/servers.html',
        controller: 'ServersController',
        controllerAs: 'serversCtrl',
        data: {
          id: 10,
          pageTitle: 'Servers'
        }
      })
        .state('support.sList', {
          url: '/list',
          templateUrl: 'app/servers/list.html',
          controller: 'ServersListController',
          controllerAs: 'serversListCtrl',
          data: {
            id: 10,
            pageTitle: 'Servers'
          }
        })
        .state('support.sList.s', {
          url: '/s/',
          views: {
            "tabView": {
              templateUrl: 'app/servers/s.html'
            }
          }
        })
        .state('support.sList.d', {
          url: '/d/',
          views: {
            "tabView": {
              templateUrl: 'app/servers/d.html'
            }
          }
        })
        .state('support.sList.u', {
          url: '/u/',
          views: {
            "tabView": {
              templateUrl: 'app/servers/u.html'
            }
          }
        })
        .state('support.sList.l', {
          url: '/l/',
          views: {
            "tabView": {
              templateUrl: 'app/servers/l.html'
            }
          }
        })
        .state('support.sList.r', {
          url: '/r/',
          views: {
            "tabView": {
              templateUrl: 'app/servers/r.html'
            }
          }
        })
        .state('support.al', {
          url: '/servers/al',
          templateUrl: 'app/servers/al.html',
          controller: 'ServersController',
          controllerAs: 'serversCtrl',
          data: {
            id: 10,
            pageTitle: 'Servers'
          }
        })
        .state('support.cs', {
          url: '/servers/cs',
          templateUrl: 'app/servers/cs.html',
          controller: 'ServerCUController',
          controllerAs: 'serverCUCtrl',
          data: {
            id: 10,
            pageTitle: 'Servers'
          }
        })
        .state('support.sList.w', {
          url: '/w/',
          views: {
            "tabView": {
              templateUrl: 'app/servers/w.html'
            }
          }
        })
        // .state('support.sList.vm', {
        //   url: '/vm/',
        //   views: {
        //     "tabView": {
        //       templateUrl: 'app/servers/vm.html'
        //     }
        //   }
        // })


      /*My Settings*/
      .state('support.mySettings', {
        url: '/mySettings',
        templateUrl: 'app/common/mySettings.html',
        controller: 'MySettingsController',
        controllerAs: 'mysCtrl',
        data: {
          id: 55,
          pageTitle: 'My Settings'
        }
      });

    $urlRouterProvider.otherwise('/');
  }
})();
