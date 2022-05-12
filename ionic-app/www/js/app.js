/**
 * Ionic Shop with Stripe Payments
 *
 * @version: v3.0
 * @date: 2016-04-19
 * @author: Noodlio <noodlio@seipel-ibisevic.com>
 * @website: www.noodl.io
 *
 * versions: {
 *  ionic:        1.2.4
 *  firebase:     2.4.0
 *  angularfire:  1.1.3
 * }
 *
 * To edit the SASS, please install gulp first:
 * npm install -g gulp
 *
 * If you are packaging this project with Phonegap Build (or other), make sure
 * that you have added all the Cordova dependencies in your config.xml. You can
 * find an overview in the folder /plugins
 *
 * To edit the design, it is recommended to use SASS. To setup SASS in your workspace
 * follow these instructions: http://ionicframework.com/docs/cli/sass.html
 *
 */

// ---------------------------------------------------------------------------------------------------------
// !important settings
// Please fill in the following constants to get the project up and running
// You might need to create an account for some of the constants.

// Obtain your unique Mashape ID from here:
// https://market.mashape.com/noodlio/noodlio-pay-smooth-payments-with-stripe
var NOODLIO_PAY_API_URL         = "https://noodlio-pay.p.mashape.com";
var NOODLIO_PAY_API_KEY         = "<YOUR-UNIQUE-MASHAPE-ID>";
var NOODLIO_PAY_CHECKOUT_KEY    = {test: "pk_test_QGTo45DJY5kKmsX21RB3Lwvn", live: "pk_live_ZjOCjtf1KBlSHSyjKDDmOGGE"};

// Obtain your unique Stripe Account Id from here:
// https://www.noodl.io/pay/connect
// Please also connect your account on this address
// https://www.noodl.io/pay/connect/test
var STRIPE_ACCOUNT_ID           = "<YOUR-UNIQUE-STRIPE-ID>";

// Set your Firebase url
var FBURL                       = '<YOUR-FB-URL>';

// Define whether you are in development mode (TEST_MODE: true) or production mode (TEST_MODE: false)
var TEST_MODE = true;

// ---------------------------------------------------------------------------------------------------------

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'firebase',
  'stripe.checkout',
  'starter.controller-account',
  'starter.controller-app',
  'starter.controller-browse',
  'starter.controller-checkout',
  'starter.controller-item',
  'starter.controller-orders',
  'starter.controller-overview',
  'starter.service-auth',
  'starter.service-cart',
  'starter.service-categories',
  'starter.service-codes',
  'starter.service-items',
  'starter.service-orders',
  'starter.service-payment',
  'starter.service-profile',
  'starter.service-utils',
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, StripeCheckoutProvider) {

  // Defines your checkout key
  switch (TEST_MODE) {
    case true:
      //
      StripeCheckoutProvider.defaults({key: NOODLIO_PAY_CHECKOUT_KEY['test']});
      break
    default:
      //
      StripeCheckoutProvider.defaults({key: NOODLIO_PAY_CHECKOUT_KEY['live']});
      break
  };

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html',
          controller: 'BrowseCtrl'
        }
      }
  })

  .state('app.browse-category', {
      url: '/browse/:categoryId',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse-category.html',
          controller: 'BrowseCtrl'
        }
      }
  })

  .state('app.item', {
      url: '/item/:productId',
      views: {
        'menuContent': {
          templateUrl: 'templates/item.html',
          controller: 'ItemDetailCtrl'
        }
      }
  })

  .state('app.overview', {
      url: '/overview',
      views: {
        'menuContent': {
          templateUrl: 'templates/overview.html',
          controller: 'OverviewCtrl'
        }
      }
  })
  .state('app.checkout', {
      url: '/checkout',
      views: {
        'menuContent': {
          templateUrl: 'templates/checkout.html',
          controller: 'CheckOutCtrl'
        }
      },
      resolve: {
        // checkout.js isn't fetched until this is resolved.
        stripe: StripeCheckoutProvider.load
      }
  })

  .state('app.account', {
    url: '/account/:nextState',
    views: {
      'menuContent': {
        templateUrl: 'templates/account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('app.orders', {
    url: '/orders',
    views: {
      'menuContent': {
        templateUrl: 'templates/orders.html',
        controller: 'OrdersCtrl'
      }
    }
  })

  .state('app.order-detail', {
    url: '/orders/:orderId',
    views: {
      'menuContent': {
        templateUrl: 'templates/order-detail.html',
        controller: 'OrderDetailCtrl'
      }
    }
  })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/browse');
});
