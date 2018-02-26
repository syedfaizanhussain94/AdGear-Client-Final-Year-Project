angular.module('app')
  .controller('loginCtrl', function ($scope, login, Video) {
    Video.stop();
    $scope.user = {
      username: "client01",
      password: "client01"
    };
    $scope.login = function (user) {
      login.userLogin(user.username, user.password);
    };
  });
