angular.module('app')
  .controller('videosCtrl', function ($rootScope, $scope, Video, $stateParams, $ionicHistory, $state) {
    $scope.isLoading = true;
    Video.start();
    $scope.videos = [];
    Video.all()
      .finally(function () {
        $scope.isLoading = false;
      });
    $rootScope.$on('Videos:updated', function (event, videos) {
      $scope.videos = videos;
      $scope.isLoading = false;
    });
    $scope.selectVideo = function (video) {
      var path = video.downloadedPath || video.file_url;
      window.VideoPlayer && VideoPlayer.play(path, {}, function (arg) {
        console.log('completed', arg)
      }, function (arg) {
        console.log('error', arg)
      });
      // $state.go('home.video', {id: video.id})
    };
  });
