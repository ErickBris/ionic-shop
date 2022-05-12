/**
 * Admin for Ionic-Stripe-Shop
 *
 * @version:  3.0
 * @date:     2016-04-19
 * @author:   Noodlio (www.noodl.io)
 * @email:    noodlio@seipel-ibisevic.com
 * @website: www.noodl.io
 *
*/

var FBURL                       = '<YOUR-FB-URL>';

angular.module('noodlio', [
  'ui.router',
  'firebase',
  'naif.base64',
  'btford.markdown',
  'noodlio.controllers-account',
  'noodlio.controllers-home',
  'noodlio.controllers-items',
  'noodlio.controllers-sales',
  'noodlio.controllers-navbar',
  'noodlio.controllers-submit',
  'noodlio.services-auth',
  'noodlio.services-categories',
  'noodlio.services-items',
  'noodlio.services-orders',
  'noodlio.services-utils',
  ]
)

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    //$locationProvider.html5Mode(true);
    //$locationProvider.hashPrefix('!');
    $urlRouterProvider.otherwise('/admin/home');
    $stateProvider

    // abstract state in the form of a navbar
    .state('admin', {
        url: '/admin',
        templateUrl: '/templates/navbar.html',
        abstract: true,
        controller:'NavBarCtrl as navbar',
    })

    // home
    .state('admin.home', {
        url: '/home',
        templateUrl: '/templates/home.html',
        controller:'HomeCtrl as home',

    })

    .state('admin.login', {
        url: '/login',
        templateUrl: '/templates/login.html',
        controller:'AccountCtrl as account',
    })


    .state('admin.items', {
        url: '/items',
        templateUrl: '/templates/items.html',
        controller:'ItemsCtrl as items',
    })

    .state('admin.sales', {
        url: '/sales',
        templateUrl: '/templates/sales.html',
        controller:'SalesCtrl as sales',
    })
    .state('admin.sales-detail', {
        url: '/sales/:index/:orderId',
        templateUrl: '/templates/sales-detail.html',
        controller:'SalesDetailCtrl as salesdetail',
    })

    .state('admin.submit', {
        url: '/submit/:productId',
        templateUrl: '/templates/submit.html',
        controller:'SubmitCtrl as submit',
    })

})
