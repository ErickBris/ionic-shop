angular.module('starter.controller-orders', [])

.controller('OrdersCtrl', function($scope, $state, Utils, Auth, OrdersManager) {

  // global variables
  $scope.status = {
    'loading': true,
  };

  $scope.$on('$ionicView.enter', function(e) {
    checkAuthAndLoadOrders();
  });


  /**
  * ---------------------------------------------------------------------------------------
  * Initialize the view
  * ---------------------------------------------------------------------------------------
  */

  // monitor and redirect the user based on its authentication state
  function checkAuthAndLoadOrders() {
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

    // @dependency
    loadOrders()
  };

  // handles when the user is logged out
  function handleLoggedOut() {
    $scope.status['loading'] = false;
    $scope.status['loggedIn'] = false;
  };


  /**
  * ---------------------------------------------------------------------------------------
  * Orders Management
  * ---------------------------------------------------------------------------------------
  */

  $scope.doRefresh = function() {
    loadOrders();
  };

  function loadOrders() {
    if($scope.AuthData.hasOwnProperty('uid')){
      $scope.status['loading'] = true;
      OrdersManager.getOrders($scope.AuthData.uid).then(
        function(OrdersDataArray){

          $scope.OrdersDataArray  = OrdersDataArray;
          $scope.status['loading'] = false;
          $scope.$broadcast('scroll.refreshComplete');

          if($scope.OrdersDataArray == null) {
            $scope.status['no-orders'] = true;
          }
        },
        function(error){
          // handle your errors here
          $scope.status['loading'] = false;
          console.log(error);
        }
      );
    };
  };

  // helper functions
  $scope.formatTimestamp = function(timestamp) {
    return Utils.formatTimestamp(timestamp);
  };
  $scope.goToOrder = function(orderId) {
    console.log("goToOrder", orderId)
    $state.go('app.order-detail', {orderId: orderId})
  };

})

.controller('OrderDetailCtrl', function($scope, $state, $stateParams, $ionicHistory, Utils, OrdersManager) {
  //$scope.chat = Chats.get($stateParams.chatId);

  $scope.status = {
    loading: true
  };

  $scope.$on('$ionicView.enter', function(e) {
    if($stateParams.orderId != undefined && $stateParams.orderId != null && $stateParams.orderId != "") {
      if(OrdersManager.OrdersData.hasOwnProperty($stateParams.orderId)) {
        //
        $scope.OrderData            = OrdersManager.OrdersData[$stateParams.orderId];  console.log($scope.OrderData)
        $scope.ItemsProductsMeta    = $scope.OrderData.ItemsProductsMeta;
        $scope.orderId              = $stateParams.orderId;

        $scope.status['loading'] = false;

        //
      } else {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('app.orders');
      }
    } else {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.orders');
    };
  });

  // helper functions
  $scope.formatTimestamp = function(timestamp) {
    return Utils.formatTimestamp(timestamp);
  };
})
