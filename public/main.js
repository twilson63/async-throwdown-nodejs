angular.module('App',['ui.bootstrap', 'upload.button'])
  // handle 2 routes and html5 support
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', { controller: 'MainCtrl', templateUrl: '/main.html'})
      .when('/dashboard', { controller: 'MainCtrl', 
        templateUrl: '/dashboard.html'})
      .otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
  })
  // get socket client and set as constant
  .constant('$eio', eio)
  // handle both the file upload and dashboard....
  .controller('MainCtrl', function($scope, $eio) {
    $scope.uploads = {};
    var socket = new $eio.Socket();
    socket.on('open', function () {
      socket
       .on('error', function(err) {
         alert(JSON.stringify(err));
       })
       .on('message', function (data) {  
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
     });
  });
