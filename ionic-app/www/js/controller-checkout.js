angular.module('starter.controller-checkout', [])

// do the actual payment and processing
.controller('CheckOutCtrl', function($scope, $state, $ionicHistory, Auth, Profile, Items, CartManager, PaymentManager) {

  // all cached data used in the checkout
  $scope.status = {
    modeIter: 0,
    nextUpdateProfile: true,
  };
  $scope.$on('$ionicView.enter', function(e) {
    initData();
  })
  $scope.$on('$ionicView.leave', function(e) {
    $scope.status['modeIter'] = 0;
  })

  function initData() {

    // auth and meta
    $scope.AuthData       = Auth.AuthData;
    $scope.ProductsMeta   = Items.cachedProductsMeta;
    $scope.Cart           = CartManager.Cart;
    $scope.CartItems      = CartManager.Cart.items;

    // prevent doing a checkout if basket is empty
    if($scope.Cart.nbItems == 0){$state.go('app.browse'); $ionicHistory.nextViewOptions({disableAnimate: true,disableBack: true});};

    // delivery details
    loadProfileData();

    // mode handling
    $scope.modes = ['delivery-details', 'confirm', 'confirmation']; // tracks the progress
    $scope.status['mode'] = $scope.modes[$scope.status.modeIter];

  };

  $scope.prevMode = function() {
    $scope.status['modeIter'] = $scope.status['modeIter'] - 1;
    if($scope.status['modeIter'] <0){$ionicHistory.nextViewOptions({disableBack: true}); $scope.status['modeIter']=0; $state.go('app.overview')}
    else {$scope.status['mode'] = $scope.modes[$scope.status['modeIter']];}
  };
  $scope.nextMode = function() {
    switch($scope.status.mode) {
      case $scope.modes[0]:
        //
        updateProfile();
        $scope.status['modeIter'] = $scope.status['modeIter'] + 1;
        $scope.status['mode'] = $scope.modes[$scope.status['modeIter']];
        break
      case $scope.modes[1]:
        //
        doCheckOut();
        break
    };
  };


  /**
  * ---------------------------------------------------------------------------------------
  * Update profile (delivery details in this exercise)
  * ---------------------------------------------------------------------------------------
  */

  $scope.ProfileData = {};
  function loadProfileData() {
    if($scope.AuthData.hasOwnProperty('uid')){
      $scope.status['loadingProfile'] = true;
      Profile.getProfile($scope.AuthData.uid).then(
        function(ProfileData) {
          if(ProfileData != null) {
            $scope.ProfileData = ProfileData;
          }
          $scope.status['loadingProfile'] = false;
        }
      ),
      function(error){
        console.log(error);
        $scope.status['loadingProfile'] = false;
      }
    };
  };

  function updateProfile() {
    if($scope.AuthData.hasOwnProperty('uid') && $scope.status.nextUpdateProfile){
      Profile.updateProfile($scope.AuthData.uid, $scope.ProfileData)
    };
  };

  /**
  * ---------------------------------------------------------------------------------------
  * Checkout with Stripe
  * ---------------------------------------------------------------------------------------
  */

  $scope.SaleObj = {};
  function doCheckOut() {

    // make the payment and handle status updates
    PaymentManager.doCheckOut($scope.AuthData.uid, $scope.ProductsMeta, $scope.Cart).then(
      function(orderId){
        $scope.status['orderId'] = orderId;
        handleSuccess();
      },
      function(SaleObj){
        $scope.SaleObj = SaleObj;
      },
      function(SaleObj){
        $scope.SaleObj = SaleObj;
      }
    );

    // fnSuccess
    function handleSuccess() {
      $scope.status['modeIter'] = $scope.status['modeIter'] + 1;
      $scope.status['mode']     = $scope.modes[$scope.status['modeIter']];

      // clear the Cart and SaleObj
      $scope.SaleObj = {};
      CartManager.clearCart();
    };


  };


  // finish the checkout and go to orders
  $scope.finishCheckOut = function() {
    $ionicHistory.nextViewOptions({disableBack: true});
    $state.go('app.orders');
  };

})
