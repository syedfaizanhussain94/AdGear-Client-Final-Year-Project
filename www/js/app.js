angular.module('app', ['ionic', 'ngCordova', 'vjs.video'])
  .config(function ($urlRouterProvider, $stateProvider, $ionicConfigProvider) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
    $urlRouterProvider.otherwise('/login');
    $stateProvider
      .state('home', {
        url: "/home",
        abstract: true,
        templateUrl: "templates/home.html"
      })
      .state('home.videos', {
        cache: false,
        url: '/videos',
        views: {
          'home-videos': {
            templateUrl: 'templates/videos.html',
            controller: 'videosCtrl'
          }
        }
      })
      .state('home.video', {
        url: '/video/:id',
        views: {
          'home-videos': {
            templateUrl: 'templates/video.html',
            controller: 'videoCtrl'
          }
        }
      })
      .state('home.account', {
        cache: false,
        url: '/account',
        views: {
          'home-account': {
            templateUrl: 'templates/account.html',
            controller: 'accountCtrl'
          }
        }
      })
      .state('reset', {
        url: '/reset',
        templateUrl: 'templates/reset.html',
        controller: 'resetCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      })
  })

  .run(function ($ionicPlatform, $state, $timeout) {
    Parse.initialize("gozCzNAeYNW0xNy1KOsEc44reIrmOaj53HRaWvtb", "uwJ7ewrgjsZPgwGpiEfIrlNEAYstN3KgxDAyaL3o");
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
    if (Parse.User.current()) {
      $timeout(function () {
        $state.go('home.videos')
      })
    }

  });
