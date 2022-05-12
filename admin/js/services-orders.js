angular.module('noodlio.services-orders', [])


.factory('OrdersManager', function($q) {
  var self = this;

  self.OrdersData = {}; //cache
  self.OrdersDataArray = [];

  self.getOrders = function(uid) {
    var qGet = $q.defer();
    var ref = new Firebase(FBURL);
    var iter = 0;
    ref.child('orders').child(uid).on("value", function(snapshot) {

      self.OrdersData = snapshot.val();

      // we transform it into an array to handle the sorting
      snapshot.forEach(function(childSnapshot) {
        self.OrdersDataArray[iter] = {
          key: childSnapshot.key(),
          value: childSnapshot.val()
        };
        iter = iter+1;
      });

      qGet.resolve(self.OrdersDataArray);

    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      qGet.reject(errorObject);
    });
    return qGet.promise;
  };
  
  self.getAllOrders = function() {
    var qGet = $q.defer();
    var ref = new Firebase(FBURL);
    var iter = 0;
    self.totalSales = {nb: 0, value: 0};
    ref.child('orders').on("value", function(snapshot) {

      self.OrdersData = snapshot.val();

      // we transform it into an array to handle the sorting
      snapshot.forEach(function(childSnapshot) {
        // 1
        var userId = childSnapshot.key();
        childSnapshot.forEach(function(subChildSnapshot){
          // 2
          var orderId = subChildSnapshot.key();
          self.OrdersDataArray[iter] = {
            key:    orderId,
            userId: userId,
            value:  subChildSnapshot.val()
          };
          self.totalSales["nb"]     = self.totalSales["nb"] + 1;
          self.totalSales["value"]  = self.totalSales["value"] + self.OrdersDataArray[iter].value.totalPrice;
          iter = iter+1;
        })
      });
      qGet.resolve(self.OrdersDataArray);
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      qGet.reject(errorObject);
    });
    return qGet.promise;
  };

  self.addOrder = function(uid, OrderData) {
    var qUpdate = $q.defer();
    var ref = new Firebase(FBURL);
    var orderId = generateOrderId();
    var onComplete = function(error) {
      if (error) {
        qUpdate.reject(error);
        console.log('Synchronization failed', error);
      } else {
        qUpdate.resolve(orderId);
        console.log('Synchronization succeeded');
      }
    };
    ref.child('orders').child(uid).child(orderId).set(OrderData, onComplete);
    return qUpdate.promise;
  };
  
  // get user profile
  self.getUserProfile = function(userId) {
    var qLoad = $q.defer();
    var ref = new Firebase(FBURL);
    //
    ref.child("users").child(userId).on("value", function(snapshot) {
        qLoad.resolve(snapshot.val());
    }, function (errorObject) {
        qLoad.reject(errorObject);
    });
    return qLoad.promise;
  };
  
  // prepare OrderData
  self.prepareOrderData = function(ProductsMeta, Cart, paymentId) {
    var OrderData = {
      timestamp: Firebase.ServerValue.TIMESTAMP,
      nbItems: Cart.nbItems,
      totalPrice: Cart.totalPrice,
      paymentId: paymentId,
      ItemsProductsMeta: getItemsProductsMeta(),
    };

    function getItemsProductsMeta() {
      var ItemsProductsMeta = {};
      angular.forEach(Cart.items, function(value, productId){
        ItemsProductsMeta[productId] = ProductsMeta[productId];
        ItemsProductsMeta[productId]['count'] = Cart.items[productId];
      })
      return ItemsProductsMeta;
    };

    return OrderData;
  }

  // generic function to generate order id
  function generateOrderId() {
    var d = new Date();

    var wordString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var letterPart = "";
    for (var i=0; i<3; i++) {
      letterPart = letterPart + wordString[Math.floor(26*Math.random())]
    };

    var fyear = d.getFullYear();
    var fmonth = d.getMonth()+1;
    var fday = d.getDate();
    var fhour = d.getHours();
    var fminute = d.getMinutes();

    fmonth = fmonth < 10 ? '0'+fmonth : fmonth;
    fday = fday < 10 ? '0'+fday : fday;
    fhour = fhour < 10 ? '0'+fhour : fhour;
    fminute = fminute < 10 ? '0'+fminute : fminute;

    var ftime = d.getTime();

    d = d.getTime();
    d = d.toString();

    return "O" + fyear + fmonth + fday + fhour + fminute + d.substr(d.length-3,d.length-1);
  };

  return self;

});
