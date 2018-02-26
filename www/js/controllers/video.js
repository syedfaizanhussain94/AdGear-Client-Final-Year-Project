angular.module('app')
  .controller("videoCtrl", function ($sce, $scope, Video, $stateParams, $ionicHistory, $state, $rootScope) {
    var video_id = $stateParams.id;
    $scope.video = null;
    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };
    var player = null;
    $scope.$on('vjsVideoReady', function (e, data) {
      player = data.player;
    });
    $scope.$on('$destroy', function () {
      player && player.pause();
    });
    Video.get(video_id)
      .then(function (_video) {
        $scope.video = _video;
        $scope.video.url = $scope.video.get('upload')._url;
      });
  });
