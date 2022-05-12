angular.module('starter.controller-item', [])

.controller('ItemDetailCtrl', function($scope, $state, $stateParams, Items, CartManager, $ionicSlideBoxDelegate, $ionicSideMenuDelegate) {

  $scope.status = {'loadingMeta': true, 'loadingImages': true};
  $scope.Cart = CartManager.Cart;



  $scope.$on('$ionicView.enter', function(e) {
    $scope.productId = $stateParams.productId;
    if($state.current.name == 'app.item' && $scope.productId != undefined) {
      // load the data and images
      getProductMeta($scope.productId);
      getProductImages($scope.productId);
    };
    // avoid dragging out when swiping between images
    $ionicSideMenuDelegate.canDragContent(true)
  });
  $scope.$on('$ionicView.leave', function(e) {
    // restore when leaving
    $ionicSideMenuDelegate.canDragContent(true)
  });

  // ----------------------------------------------------------------------------

  $scope.addToCart = function(productId) {
    CartManager.addToCart(productId);
    $scope.Cart = CartManager.Cart;
  };

  $scope.removeOneFromCart = function(productId) {
    CartManager.removeOneFromCart(productId);
    $scope.Cart = CartManager.Cart;
  };

  $scope.goToCart = function() {
    $state.go('app.overview')
  };


  // ----------------------------------------------------------------------------

  // retrieve the dependencies (of ProductsMeta)
  function getProductMeta(productId) {
    $scope.status['loadingMeta'] = true;
    Items.getProductMeta(productId).then(
      function(ProductMeta){
        $scope.ProductMeta = ProductMeta;
        $scope.status['loadingMeta'] = false;
      },
      function(error){
        $scope.status['loadingMeta'] = false;
        console.log(error)
      }
    )
  };

  // retrieve the dependencies (of ProductsMeta)
  function getProductImages(productId) {
    $scope.status['loadingImages'] = true;
    Items.getProductScreenshots(productId).then(
      function(ProductImages){
        $scope.ProductImages = ProductImages;
        $scope.status['loadingImages'] = false;
        $ionicSlideBoxDelegate.update();
      },
      function(error){
        $scope.status['loadingImages'] = false;
        console.log(error)
      }
    )
  };

  function getProductRatings(ProductMeta) {
    $scope.status['loadingRatings'] = true;
    angular.forEach(ProductMeta, function(value, productId){
      ProductRatings.loadCache(productId).then(
        function(productRatingCache){
          $scope.ProductRatings = productRatingCache;
          $scope.status['loadingRatings'] = false;
        },
        function(error){
          $scope.status['loadingRatings'] = false;
          console.log(error)
        }
      )
    });
  };
})
