angular.module('App',['ui.bootstrap', 'upload.button'])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', { controller: 'MainCtrl', templateUrl: '/main.html'})
      .when('/dashboard', { controller: 'MainCtrl', 
        templateUrl: '/dashboard.html'})
      .otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
  })
  .constant('$eio', eio)
  .controller('MainCtrl', function($scope, $eio) {
    $scope.uploads = {};
    var socket = new $eio.Socket();
    socket.on('open', function () {
       socket.on('message', function (data) {  
         $scope.$apply(function() {
           var info = JSON.parse(data);
           if (info.percent < 50) {
             $scope.uploads[info.name] = [{ value: info.percent,
               type: 'info'}];
           } else {
             $scope.uploads[info.name] = [
              { value: 50, type: 'info'}, 
              { value: (info.percent / 2), type: 'success'}];
           }
         });
       });
    //   //socket.on('close', function () { });
     });
  });
