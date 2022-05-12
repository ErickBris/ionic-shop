angular.module('starter.service-cart', [])

.factory('CartManager', function($rootScope, Items) {

  var self = this;

  // Cart
  //    /nbItems
  //    /items
  //      /$productId: amount
  self.Cart = {nbItems: 0, totalPrice: 0, items: {}};

  // Adds the productId to the Cart
  // if the product is already in the Cart, then increases the amount
  self.addToCart = function(productId) {
    if(self.Cart['items'].hasOwnProperty(productId)){
      self.Cart['items'][productId] = self.Cart['items'][productId] + 1;
    } else {
      self.Cart['items'][productId] = 1;
      self.Cart['nbItems'] = self.Cart['nbItems'] + 1;
    }
    broadcastCartChange();
  };

  // Decreases the count for the specific productId
  // if it reaches zero, then the key productId is removed from the Cart items
  self.removeOneFromCart = function(productId) {
    // item is in the cart
    if(self.Cart['items'].hasOwnProperty(productId)){
      // the count for the item is higher than one
      if(self.Cart['items'][productId] > 1) {
        self.Cart['items'][productId] = self.Cart['items'][productId] - 1;
      } else {
        delete self.Cart['items'][productId];
        self.Cart['nbItems'] = self.Cart['nbItems'] - 1;
      };
      broadcastCartChange();
    };
  };

  self.removeFromCart = function(productId) {
    delete self.Cart['items'][productId];
    self.Cart['nbItems'] = self.Cart['nbItems'] - 1;
    broadcastCartChange();
  };

  self.clearCart = function() {
    self.Cart = {nbItems: 0, totalPrice: 0, items: {}};
    broadcastCartChange();
  };

  // communicates with other services and controllers
  function broadcastCartChange() {
    self.Cart['totalPrice'] = calculateTotalPrice();
    $rootScope.$broadcast('rootScope:cartChange', {});
  };

  function calculateTotalPrice() {
    self.ProductsMeta = Items.cachedProductsMeta; //** holds only for session, todo: add to localstorage

    var totalPrice = 0;
    angular.forEach(self.Cart.items, function(value, productId){
      totalPrice = totalPrice + (self.ProductsMeta[productId].price * self.Cart.items[productId]);
    })
    return totalPrice;
  };

  return self;
});
