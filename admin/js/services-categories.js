angular.module('noodlio.services-categories', [])

.factory('Categories', function() {
  /**
  * List of pre-defined categories (example only!)
  *
  * If you expect that the categories might change frequently over time,
  * then it is recommended to store them on the server-side (Firebase)
  * and retrieve the list from here.
  *
  * A good working example is Ionic Shop (Advanced Edition)
  * Download it from here: https://www.noodl.io/market/product/P201602271203444/ionic-shop-advanced-edition-full-ecommerce-app-w-stripe-payments-and-admin
  *
  */
  return {
    't-shirts': {
        title: "T-shirts"
    },
    'jeans': {
        title: "Jeans"
    },
    'sweaters': {
        title: "Sweaters"
    },
    'pyjamas': {
        title: "Pyjamas"
    }
  }
});
