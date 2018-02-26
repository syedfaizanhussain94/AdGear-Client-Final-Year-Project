angular.module('app')
  .factory('Video', function ($rootScope, $cordovaNetwork, $ionicPlatform, $ionicPopup, $state, $ionicLoading, $q, $cordovaLocalNotification, $cordovaGeolocation, $cordovaNetwork, $cordovaFileTransfer, $cordovaToast) {
    // var INTERVAL = 60 * 1000;
    var INTERVAL = 60 * 1000;
    var interval = null;
    var RADIUS = 100;
    var isPlaying = false;
    var videos = [];
    var currentIndex = 0;
    if (!window.cordova) {
      window.cordova = {
        file: {}
      }
    }
    var all = function () {
      var q = $q.defer();
      $ionicPlatform.ready(function () {
        if ($cordovaNetwork.isOnline()) {
          var user = Parse.User.current();
          var Video = Parse.Object.extend("Video");
          var query = new Parse.Query(Video);
          query.equalTo("user", user);
          query.find({
            success: function (data) {
              var videos = data || [];
              videos = videos.map(function (_video) {
                var video = {id: _video.id};
                angular.extend(video, _video.attributes);
                video.user = video.user.id;
                video.file_url = video.upload.url();
                video.file_name = video.upload.name();
                delete  video.upload;
                return video;
              });
              var _videos = getVideos();
              videos.forEach(function (video) {
                if (!_videos.some(function (v) {
                    return v.id == video.id;
                  })) {
                  _videos.push(video);
                }
              });
              _videos.forEach(function (video, index) {
                if (!videos.some(function (v) {
                    return v.id == video.id
                  })) {
                  video.downloaded && removeFile(video.downloadedPath);
                  _videos.splice(index, 1);
                }
              });

              setVideos(_videos);
              q.resolve(_videos);
              startDownloading(angular.copy(_videos));
              $rootScope.$broadcast('Videos:updated', _videos);
            },
            error: function (error) {
              q.reject(error);
            }
          });
        } else {
          $cordovaToast.showShortBottom('Network Unavailable');
          var videos = getVideos();
          q.resolve(videos);
          $rootScope.$broadcast('Videos:updated', videos);
        }
      });
      return q.promise;
    };
    var get = function (id) {
      var q = $q.defer();
      var user = Parse.User.current();
      var Video = Parse.Object.extend("Video");
      var query = new Parse.Query(Video);
      query.equalTo("user", user);
      query.get(id, {
        success: function (data) {
          q.resolve(data);
        },
        error: function (error) {
          q.reject(error);

        }
      });
      return q.promise;
    };
    var startDownloading = function (videos) {
      if (videos.length > 0) {
        var video = videos[0];
        download(video, function () {
          videos.shift();
          startDownloading(videos);
        })
      }
    };
    var download = function (v, cb) {
      if (v.downloaded) return cb();
      var url = v.file_url;
      var directory = ionic.Platform.isAndroid() ? cordova.file.externalDataDirectory : cordova.file.dataDirectory;
      var targetPath = directory + v.file_name;
      var currentObj = v;
      if (!window.FileTransfer) return false;
      return $cordovaFileTransfer.download(url, targetPath, {}, true)
        .then(function (result) {
          currentObj.downloaded = true;
          currentObj.downloadedPath = targetPath;
          console.log("download:success", result);
          // $cordovaToast.showShortBottom(currentObj.name + ' downloaded');
          $cordovaLocalNotification.schedule({
            id: +new Date(),
            title: 'Video Downloaded',
            text: currentObj.name + ' video has been downloaded'
          }).then(function (result) {
            // ...
          });
          var videos = getVideos();
          videos.forEach(function (video, index) {
            if (video.id == currentObj.id) {
              videos[index] = currentObj;
            }
          });
          setVideos(videos);
          cb()
        }, function (err) {
          currentObj.downloaded = false;
          console.log("download:error", err);
          $cordovaToast.showShortBottom('Download Error');
          // Error
        }, function (progress) {
        });
    };
    var start = function (location) {
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation.watchPosition(posOptions)
        .then(function (data) {
          console.log(data)
        });
      $cordovaGeolocation.getCurrentPosition(posOptions);
      interval = setInterval(function () {
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (location) {
            all()
              .then(function (_videos) {
                videos = _videos.filter(function (video) {
                  return video.downloaded && geolib.isPointInCircle(
                      {latitude: location.coords.latitude, longitude: location.coords.longitude},
                      {latitude: video.location.latitude, longitude: video.location.longitude},
                      video.radius || RADIUS)
                });
                setVideos(videos);
                $rootScope.$broadcast('Videos:updated', videos);
                playVideo()
              })
          }, function (err) {
            console.log(err)
          })

      }, INTERVAL)

    };
    var stop = function () {
      interval && clearInterval(interval);
    };
    var playVideo = function () {
      if (currentIndex == videos.length) {
        currentIndex = 0
      }
      var video = videos[currentIndex];
      if (!isPlaying) {
        isPlaying = true;
        $cordovaToast.showShortBottom(video.name + ' Playing');
        window.VideoPlayer && VideoPlayer.play(video.downloadedPath, {}, function (arg) {
          isPlaying = false;
          playVideo();
        }, function (arg) {
        });
        currentIndex = +1;
      }
    };
    var removeFile = function (path) {
      window.resolveLocalFileSystemURL(path, function (entry) {
        console.log(entry);
        entry.remove(function () {
          console.log(path + " file removed")
        }, function (err) {
          console.log("file err", err)
        });
      })
    };
    var getVideos = function () {
      return (localStorage.getItem('videos') && JSON.parse(localStorage.getItem('videos'))) || []
    };
    var setVideos = function (videos) {
      videos = (videos && JSON.stringify(videos)) || '[]';
      return JSON.stringify(localStorage.setItem('videos', videos))
    };
    return {
      all: all,
      get: get,
      start: start,
      stop: stop
    }
  })
;
