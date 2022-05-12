angular.module('starter.service-items', [])

.factory('Items', function($q) {
  var self = this;

  /**
   * Retrieve products_index and fill it with products_meta
   */
  self.getViewProductMeta = function(viewId, sortNode, limitValue, optFormData) {
    var ViewRef = getViewReferential(viewId, optFormData);
    var qFilter = $q.defer();
    var ref = new Firebase(FBURL);

    ref.child("products_index").child(ViewRef.childRef).orderByChild(sortNode).limitToLast(limitValue).on("value", function(snapshot) {
      var ProductList = snapshot.val();
      if(ProductList != null) {
        // iterate over the list and retrieve products meta
        self.getProductMetaFromList(ProductList).then(
          function(ProductsMeta){
            qFilter.resolve(ProductsMeta);
          },
          function(error){
            qFilter.reject(error);
          }
        )
      } else {
        qFilter.resolve(null);
      }
      // --
    }, function (errorObject) {
      qFilter.reject(errorObject);
    })
    return qFilter.promise;
  };

  /**
  * Caches ProducsMeta (sesson-only) in self.getProductMeta
  * todo: can be extended to save in localstorage
  */
  self.cachedProductsMeta = {};

  /**
  * Helper function to iterate over the corresponding view
  */
  function getViewReferential(viewId, FormData) {
    var childRef = null;
    var nextViewId = null;
    switch(viewId) {
      case 'view-all':
        //
        childRef = viewId;
        nextViewId = 'view-categoryId';
        break
      case 'view-categoryId':
        //
        childRef = viewId + "/" + FormData.categoryId;
        nextViewId = 'none';
        break
    }
    return {
        childRef: childRef,
        nextViewId: nextViewId
    }
  };

  /**
  * Returns all available categories
  */
  self.getBrowseCategories = function() {
    var qBrowse = $q.defer();
    var ref = new Firebase(FBURL);
    //
    //console.log(filterNode, filterValue, limitValue)
    ref.child("products_index").child('view-categoryId').on("value", function(snapshot) {
      qBrowse.resolve(snapshot.val());
    }, function (errorObject) {
      qBrowse.reject(errorObject);
    });
    return qBrowse.promise;
  };

  /**
  * Iterates over a list of productIds (@key) and fills it
  * async. with data from the node products_meta
  */
  self.getProductMetaFromList = function(productIdList) {
    var promises = {};
    angular.forEach(productIdList, function(value, productId) {
        if(productId != undefined && productId != null) {
            var promise = getProductMetaPromise(productId)
            if(promise != null) {
                promises[productId]=promise;
            }
        }
    })
    // how about just return self.getProductMeta(productId)?
    function getProductMetaPromise(productId) {
      var qGet = $q.defer();
      self.getProductMeta(productId).then(
        function(ProductMeta){
          if(ProductMeta != null) {
              qGet.resolve(ProductMeta);
          } else {
              qGet.reject(null);
          }
        },
        function(error){
          qGet.reject(error);
        }
      )
      return qGet.promise;
    }
    return $q.all(promises);
  };

  /**
   * products_meta
   */
  self.getProductMeta = function(productId) {
      var qLoad = $q.defer();
      var ref = new Firebase(FBURL);
      //
      ref.child("products_meta").child(productId).on("value", function(snapshot) {
          var ProductMeta = snapshot.val();
          if(ProductMeta!= null) {
            self.cachedProductsMeta[productId]=ProductMeta;
          }
          qLoad.resolve(snapshot.val());
      }, function (errorObject) {
          qLoad.reject(errorObject);
      });
      return qLoad.promise;
  };

  /**
   * products_icons
   */
  self.getProductIcon = function(productId) {
      var qIcon = $q.defer();
      var ref = new Firebase(FBURL);
      //
      ref.child("products_images").child(productId).child("icon").on("value", function(snapshot) {
          qIcon.resolve(snapshot.val());
      }, function (errorObject) {
          qIcon.reject(errorObject);
      });
      return qIcon.promise;
  };

  /**
   * products_screenshots
   */
  self.getProductScreenshots = function(productId) {
      var qScreen = $q.defer();
      var ref = new Firebase(FBURL);
      //
      ref.child("products_images").child(productId).on("value", function(snapshot) {
          qScreen.resolve(snapshot.val());
      }, function (errorObject) {
          qScreen.reject(errorObject);
      });
      return qScreen.promise;
  };

  return self;
})
