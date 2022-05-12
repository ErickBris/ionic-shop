angular.module('starter.controller-browse', [])


.controller('BrowseCtrl', function($scope, $state, $stateParams, Items, Categories, Utils) {

  // --------------------------------------------------------------------------------
  // INIT
  $scope.ProductsMeta = {};
  $scope.ProductsIcons = {};
  $scope.ProductsRatings = {}; // **
  $scope.status     = Categories;
  $scope.Categories = Categories;
  $scope.CategoryNonEmpty = {};

  $scope.doRefresh = function() {
    $state.go($state.current, {}, {reload: true});
    $scope.$broadcast('scroll.refreshComplete');
    // this might need to be updated to reload the data
  };

  $scope.$on('$ionicView.enter', function(e) {

    // Avoids empty screen at beginning
    $scope.status['initLoading']  = true;

    // check whether categoryName, id, etc. is defined
    $scope.categoryId = $stateParams.categoryId;
    if($scope.categoryId != undefined && $scope.Categories.hasOwnProperty($scope.categoryId)) {
      $scope.status['categoryName'] = $scope.Categories[$scope.categoryId].title
    };

    // define what to load
    if($state.current.name == 'app.browse-category' && $scope.categoryId != undefined) {
      // load only one category
      load($scope.categoryId, 1000)
    } else {
      // load all categories
      loadProducts();
    }
  });

  // --------------------------------------------------------------------------------
  // SORTING

  // default sorting options
  $scope.status['sort'] = {
    property: 'Date',
    method: 'desc',
    selectMode: false,
  };

  // method to change sorting options
  $scope.sortBy = function(property, method) {
    $scope.status['sort'] = {
      property: property,
      method: method,
    }
    $scope.status.sort["selectMode"] = false;
    $scope.loadLatest($scope.categoryId, 1000);
  };

  // collapse or trigger the selections
  $scope.selectSort = function() {
    if(!$scope.status.sort.selectMode) {
      $scope.status.sort["selectMode"] = true;
    } else {
      $scope.status.sort["selectMode"] = false;
    }
  };


  // --------------------------------------------------------------------------------
  // PRODUCTS
  function loadProducts() {
    console.log('loading')
    // iterate over all categories and load one by one
    angular.forEach(Categories, function(value, categoryId){
      load(categoryId, 4)
    })
  };

  // function that loads the individual category
  // limitValue: how many products per category to be shown
  $scope.loadLatest = function(categoryId, limitValue){
    load(categoryId, limitValue);
  };
  function load(categoryId, limitValue) {
    if(categoryId != null && categoryId != undefined && categoryId != "") {

      $scope.status[categoryId]['loading'] = true;
      var optFormData = {categoryId: categoryId};

      // retrieve the latest data
      Items.getViewProductMeta('view-categoryId', 'timestamp_creation', limitValue, optFormData).then(
        function(ProductsMeta){
          if(ProductsMeta != null) {

              // format it to an array (used for sorting)
              $scope.ProductsMeta[categoryId]     =
              Utils.sortArray(Utils.arrayValuesAndKeys(ProductsMeta), $scope.status.sort);

              // switch from initloading to categoryLoading
              $scope.status['initLoading']          = false;
              $scope.status[categoryId]['loading'] = false;

              // --> @dependencies
              getProductsIcons(ProductsMeta, categoryId);
          };

           // hide empty categories
          $scope.CategoryNonEmpty[categoryId]   = ProductsMeta != null;
        }, function(error){
          $scope.status[categoryId]['loading']  = false;
          $scope.status['initLoading']          = false;
          console.log(error)
        }
      )
    }
  };

  // retrieve the dependencies (of ProductsMeta)
  function getProductsIcons(ProductsMeta, categoryId) {
    console.log('get product icons')
    angular.forEach(ProductsMeta, function(value, productId){
      Items.getProductIcon(productId).then(
        function(productIcon){
            console.log('icon loaded')
            $scope.ProductsIcons[productId] = productIcon;
        },
        function(error){
          console.log(error)
        }
      )
    });
  };


  // --------------------------------------------------------------------------------
  // OTHER
  // custom functions to avoid Lexer error
  // https://docs.angularjs.org/error/$parse/lexerr?p0=Unterminated
  $scope.getLoadingMode = function(categoryId) {
    return $scope.status[categoryId]['loading'];
  };
  $scope.getProductsMeta = function(categoryId) {
    return $scope.ProductsMeta[categoryId];
  };
  $scope.getProductIcon = function(productId) {
    return $scope.ProductsIcons[productId];
  };

  // functions to handle next states
  $scope.goToCategory = function(categoryId) {
    $state.go("app.browse-category", {categoryId: categoryId})
  };
  $scope.goToItem = function(productId) {
    $state.go("app.item", {productId: productId})
  };
  $scope.goTo = function(nextState) {
    $state.go(nextState)
  };

  /**
  * todo: add lazy loading
  */


})
