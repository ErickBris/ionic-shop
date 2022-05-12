angular.module('starter.controller-app', [])

.controller('AppCtrl', function($rootScope, $state, $scope, Auth, CartManager) {

  $scope.AuthData = Auth.AuthData;
  $scope.Cart = CartManager.Cart;

  if(!Auth.AuthData.hasOwnProperty('uid')) {
    Auth.getAuthState().then(
      function(loggedIn){
        $scope.AuthData = Auth.AuthData;
      }
    )
  };

  $rootScope.$on('rootScope:authChange', function (event, data) {
    $scope.AuthData = Auth.AuthData;
  });

  $rootScope.$on('rootScope:cartChange', function (event, data) {
    $scope.Cart = CartManager.Cart;
  });

  $scope.goToCart = function() {
    $state.go('app.overview')
  };

})
