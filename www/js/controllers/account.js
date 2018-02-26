angular.module('app')
  .controller('accountCtrl', function ($scope, $state) {
    $scope.user = Parse.User.current().attributes;
    $scope.logout = function () {
      Parse.User.logOut().then(function () {
        $state.go('login')
      });
    }
  });
