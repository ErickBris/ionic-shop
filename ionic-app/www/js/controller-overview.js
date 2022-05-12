angular.module('starter.controller-overview', [])

.controller('OverviewCtrl', function($scope, $state, $ionicHistory, Auth, Items, CartManager) {

  // global variables
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    loading: true,
    loggedIn: false
  };

  /**
  * ---------------------------------------------------------------------------------------
  * Initialize the view
  * ---------------------------------------------------------------------------------------
  */

  $scope.$on('$ionicView.enter', function(e) {

    // init
    $scope.status['loading'] = true;

    $scope.Cart                 = CartManager.Cart;
    $scope.CartItems            = CartManager.Cart.items;
    $scope.ProductsMeta         = Items.cachedProductsMeta;  //** holds only for session, todo: add to localstorage

    // define the mode
    if(CartManager.Cart.nbItems > 0) {$scope.status['checkout'] = 'not-empty';} else {$scope.status['checkout'] = 'empty';};

    // -->
    checkAuth();

  });

  // monitor and redirect the user based on its authentication state
  function checkAuth() {
    $scope.AuthData = Auth.AuthData;
    if(!$scope.AuthData.hasOwnProperty('uid')){
      Auth.getAuthState().then(
        function(AuthData){
          $scope.AuthData = Auth.AuthData;
          handleLoggedIn();
        },
        function(notLoggedIn){
          handleLoggedOut();
        }
      )
    } else {
      handleLoggedIn();
    };
  }; // ./ checkAuth()

  // handles when the user is logged in
  function handleLoggedIn() {
    $scope.status['loading'] = false;
    $scope.status['loggedIn'] = true;
    $scope.status['proceedMessage'] = "Proceed order";
  };

  // handles when the user is logged out
  function handleLoggedOut() {
    $scope.status['loading'] = false;
    $scope.status['loggedIn'] = false;
    $scope.status['proceedMessage'] = "Sign in to proceed";
  };

  /**
  * ---------------------------------------------------------------------------------------
  * Edit the basket
  * ---------------------------------------------------------------------------------------
  */
  $scope.addToCart = function(productId) {
    CartManager.addToCart(productId);
  };
  $scope.removeOneFromCart = function(productId) {
    CartManager.removeOneFromCart(productId);
    // define the mode
    if(CartManager.Cart.nbItems > 0) {$scope.status['checkout'] = 'not-empty';} else {$scope.status['checkout'] = 'empty';};
  };
  $scope.clearCart = function(productId) {
    CartManager.clearCart();
    // define the mode
    $scope.status['checkout'] = 'empty';
  };

  /**
  * ---------------------------------------------------------------------------------------
  * Proceed order
  * ---------------------------------------------------------------------------------------
  */

  $scope.proceedOrder = function() {
    if($scope.status.loggedIn) {
      // delets the back button
      $ionicHistory.nextViewOptions({disableBack: true});
      $state.go('app.checkout');
    } else {
      $state.go('app.account', {nextState: 'app.overview'});
    }
  };

  $scope.goTo = function(nextState) {
    $ionicHistory.nextViewOptions({disableBack: true});
    $state.go(nextState)
  };

})
