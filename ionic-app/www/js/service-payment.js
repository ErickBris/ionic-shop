angular.module('starter.service-payment', [])

.factory('PaymentManager', function($q, OrdersManager, StripeCharge) {

  var self = this;

  self.doCheckOut = function(uid, ProductsMeta, Cart) {
    var qPay = $q.defer();
    var SaleObj = {}; // keeps track of the status

    // use a custom description here
    var headerData = {
      name: "Checkout with Stripe",
      description: "Your company name",
      amount: Cart.totalPrice,
    };

    /**
    * [1] first get the Stripe token
    */
    updateStatus('Initializing payment');
    StripeCharge.getStripeToken(headerData).then(
      function(stripeToken){
        //
        // -->
        proceedCharge(stripeToken);
      },
      function(error){
        handleError(error);
      }
    ); // ./ getStripeToken

    /**
    * [2] then charge using your node-server-api
    */
    function proceedCharge(stripeToken) {

      // send update
      updateStatus('Processing your payment...');

      // then chare the user through your custom node.js server (server-side)
      StripeCharge.chargeUser(stripeToken, headerData).then(
        function(StripeInvoiceData){
          //
          // -->
          registerOrder(StripeInvoiceData);
        },
        function(error){
          handleError(error);
        }
      );

    }; // ./ proceedCharge


    /**
    * [3] register the order for the user
    */
    function registerOrder(StripeInvoiceData) {

      // ** send update
      updateStatus('Registering the order...');

      // prepare the OrderData
      var OrderData = OrdersManager.prepareOrderData(ProductsMeta, Cart, StripeInvoiceData.balance_transaction);

      // record the order in the firebase database
      OrdersManager.addOrder(uid, OrderData).then(
        function(orderId){
          //
          // -->
          registerInvoice(StripeInvoiceData, orderId)
        },
        function(error){
          handleError(error);
        }
      );
    }; // ./ registerOrder

    /**
    * [4] register the invoice data (admin only)
    */
    function registerInvoice(StripeInvoiceData, orderId) {

      // send update
      updateStatus('Registering the invoice...');

      var ref = new Firebase(FBURL);
      var onComplete = function(error) {
        if (error) {
          handleError(error);
        } else {
          // <--
          handleSuccess(orderId);
        }
      };
      ref.child('invoices').child(uid).child(orderId).set(StripeInvoiceData, onComplete);
    }; // ./ registerInvoice


    // ===================================================================
    //  Updates and Error Handling
    // ===================================================================

    function handleSuccess(orderId) {
      SaleObj['status'] = 'success';
      SaleObj['message'] = "Payment confirmed!";
      qPay.notify(SaleObj);
      qPay.resolve(orderId);
    };

    function handleError(error) {
      switch(error) {
        case 'ERROR_CANCEL':
          //
          SaleObj = {};
          qPay.reject(SaleObj);
          break
        default:
          //
          SaleObj['status'] = 'error';
          SaleObj['message'] = "Oops.. something went wrong";

          qPay.reject(SaleObj);
          break
      }
    };

    function updateStatus(message) {
      SaleObj['status'] = 'loading';
      SaleObj['message'] = message;
      qPay.notify(SaleObj);
    };


    return qPay.promise;
  }; // ./ self.doCheckOut $qPay


  return self;
})

.factory('StripeCharge', function($q, $http, StripeCheckout) {
  var self = this;

  // Authorization headers for the payment gateway
  $http.defaults.headers.common['X-Mashape-Key']  = NOODLIO_PAY_API_KEY;
  $http.defaults.headers.common['Content-Type']   = 'application/x-www-form-urlencoded';
  $http.defaults.headers.common['Accept']         = 'application/json';

  /**
   * Connects with the backend (server-side) to charge the customer
   *
   * # Note on the determination of the price
   * In this example we base the $stripeAmount on the object ProductMeta which has been
   * retrieved on the client-side. For safety reasons however, it is recommended to
   * retrieve the price from the back-end (thus the server-side). In this way the client
   * cannot write his own application and choose a price that he/she prefers
   */
  self.chargeUser = function(stripeToken, headerData) {
    var qCharge = $q.defer();

    // v3; (previously curlData)
    var param = {
      source: stripeToken,
      amount: Math.floor(headerData.amount*100), // amount in cents
      currency: "usd",
      description: headerData.description,
      stripe_account: STRIPE_ACCOUNT_ID,
      test: TEST_MODE,
    };
    var chargeUrl = NOODLIO_PAY_API_URL + "/charge/token"; //v3
    $http.post(chargeUrl, param)
    .success(
      function(StripeInvoiceData){
        qCharge.resolve(StripeInvoiceData);
        // you can store the StripeInvoiceData for your own administration
      }
    )
    .error(
      function(error){
        console.log(error)
        qCharge.reject(error);
      }
    );
    return qCharge.promise;
  };


  /**
   * Get a stripe token through the checkout handler
   */
  self.getStripeToken = function(headerData) {
    var qToken = $q.defer();

    var handlerOptions = {
      name: headerData.name,
      description: headerData.description,
      amount: Math.floor(headerData.amount*100),
      image: "img/ionic.png",
    };

    var handler = StripeCheckout.configure({
        name: headerData.title,
        token: function(token, args) {
          //console.log(token.id)
        }
    })

    handler.open(handlerOptions).then(
      function(result) {
        var stripeToken = result[0].id;
        if(stripeToken != undefined && stripeToken != null && stripeToken != "") {
            //console.log("handler success - defined")
            qToken.resolve(stripeToken);
        } else {
            //console.log("handler success - undefined")
            qToken.reject("ERROR_STRIPETOKEN_UNDEFINED");
        }
      }, function(error) {
        if(error == undefined) {
            qToken.reject("ERROR_CANCEL");
        } else {
            qToken.reject(error);
        }
      } // ./ error
    ); // ./ handler
    return qToken.promise;
  };


  return self;
})
