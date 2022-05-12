angular.module('noodlio.controllers-sales', [])


.controller('SalesCtrl', function($location, $anchorScroll, $stateParams, $state, 
    Auth, Items, Utils, OrdersManager) {
        
    var sales               = this;
    sales.AuthData          = Auth.AuthData;
    sales.statusObj         = {'loading': true};
    sales.ProductsMeta      = {}; //**
    sales.ProductsIcons     = {}; //**
    sales.SalesObj          = {}; //**

    sales.initView = function() {
        $location.hash('page-top');
        $anchorScroll();
        
        checkAuth();
        loadLatestSales();
    };
    
    function checkAuth() { // can be put in a resolve in app.js
        if(!Auth.AuthData.hasOwnProperty('uid')) {
            Auth.checkAuthState().then(
                function(loggedIn){
                    sales.AuthData = Auth.AuthData;
                },
                function(notLoggedIn) {
                    $state.go('admin.login')
                }
            )
        };
    };
    
    // sales is here a synonym for orders
    function loadLatestSales() {
        if(sales.AuthData.hasOwnProperty('uid')){
          sales.statusObj['loading'] = true;
          OrdersManager.getAllOrders().then(
            function(OrdersDataArray){
              sales.totalSales = OrdersManager.totalSales;
              sales.OrdersDataArray  = OrdersDataArray;
              sales.statusObj['loading'] = false;
    
              if(sales.OrdersDataArray == null) {
                sales.statusObj['no-orders'] = true;
                sales.statusObj["generalmessage"] = "No sales yet";
              }
            },
            function(error){
              // handle your errors here
              sales.statusObj["generalmessage"] = "Oops.. something went wrong :(";
              sales.statusObj['loading'] = false;
              console.log(error);
            }
          );
        };
        
    };
    
    
    
    
    sales.formatTimestamp = function(timestamp) {
        return Utils.formatTimestamp(timestamp);
    };
    
    sales.goTo = function(nextState) {
        $state.go(nextState);  
    };
    
    sales.goToOrder = function(notUsed, orderId) {
      for(var i=0; i<sales.OrdersDataArray.length; i++) {
        if(sales.OrdersDataArray[i].key == orderId){
          $state.go('admin.sales-detail', {index: i, orderId: orderId});  
          break
        }
      }
    };
    
    
})


.controller('SalesDetailCtrl', function($state, $stateParams, Utils, OrdersManager) {
  var salesdetail = this;

  salesdetail.statusObj = {
    loading: true
  };
    
  salesdetail.initView = function() {
    if($stateParams.orderId != undefined && $stateParams.orderId != null && $stateParams.orderId != "" &&
       $stateParams.index != undefined && $stateParams.index != null && $stateParams.index != "") {
        if(OrdersManager.OrdersDataArray.length <= 0){
          $state.go('admin.sales');
        } else {
          salesdetail.OrderData            = OrdersManager.OrdersDataArray[$stateParams.index];  //console.log(salesdetail.OrderData)
          salesdetail.ItemsProductsMeta    = salesdetail.OrderData.value.ItemsProductsMeta;
          salesdetail.orderId              = $stateParams.orderId;
          
          
          // -->
          getUserData(salesdetail.OrderData.userId)
          
        }
    } else {
      $state.go('admin.sales');
    };
  };
  
  // load user address
  function getUserData(userId) {
    OrdersManager.getUserProfile(userId).then(
      function(UserData){
        if(UserData == null){
          salesdetail.statusObj['generalmessage'] = "User has not specified an address";
        } else {
          salesdetail.UserData = UserData;
        }
        salesdetail.statusObj['loading'] = false;
      },
      function(error){
        salesdetail.statusObj['generalmessage'] = "Could not retrieve address of user";
        salesdetail.statusObj['loading'] = false;
      }
    )
  };

  // helper functions
  salesdetail.formatTimestamp = function(timestamp) {
    return Utils.formatTimestamp(timestamp);
  };
  
  salesdetail.goTo = function(nextState) {
    $state.go(nextState);  
  };
})



