angular.module('app')
  .factory('login', function ($ionicPopup, $state, $ionicLoading, $q) {

    var userLogin = function (username, password) {
      $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
      var user = Parse.User.current();
      Parse.User.logIn(username, password, {
        success: function (user) {
          console.log(user);
          $ionicLoading.hide();
          $state.go('home.videos');
        },
        error: function (error) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Sorry',
            template: error.message,
            okType: 'button-positive'
          });
        }
      });

    };

    var userReset = function (email) {
      Parse.User.requestPasswordReset(email, {
        success: function () {
          // Password reset request was sent successfully
          $ionicPopup.alert({
            title: 'Success',
            template: 'password was sent to ' + email,
            okType: 'button-balanced'
          });
        },
        error: function (error) {
          // Password reset failed
          $ionicPopup.alert({
            title: 'Sorry',
            template: error.message,
            okType: 'button-balanced'
          });
        }
      });
    };


    return {
      userReset: userReset,
      userLogin: userLogin
    };
  });
