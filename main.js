angular.module('App',['ui.bootstrap'])
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
           $scope.uploads[info.name] = info.percent;
         });
       });
    //   //socket.on('close', function () { });
     });
  });
