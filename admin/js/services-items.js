angular.module('noodlio.services-items', [])


.factory('Items', function($q, Utils) {
    var self = this;


    /**
     * Retrieve products_index and fill it
     */
    self.getViewProductMeta = function(viewId, sortNode, limitValue, optFormData) {
        var ViewRef = getViewReferential(viewId, optFormData);
        var qFilter = $q.defer();
        var ref = new Firebase(FBURL);
        //
        ref.child("products_index").child(ViewRef.childRef).orderByChild(sortNode).limitToLast(limitValue).on("value", function(snapshot) {
            var ProductList = snapshot.val();
            // --
            if(ProductList != null) {
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

    function getViewReferential(viewId, FormData) {
        var childRef = null;
        var nextViewId = null;

        // fix for David
        if(!FormData.hasOwnProperty('categoryId')) {
          FormData['categoryId'] = 'all';
        };

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

     //@key: productId
     // rewrite to function
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

    // https://www.firebase.com/docs/web/api/query/
    self.filterProductsMeta = function(filterNode, filterValue, limitValue) {
        var qFilter = $q.defer();
        var ref = new Firebase(FBURL);
        //
        //console.log(filterNode, filterValue, limitValue)
        ref.child("products_meta").orderByChild(filterNode).equalTo(filterValue).limitToLast(limitValue).on("value", function(snapshot) {
            qFilter.resolve(snapshot.val());
        }, function (errorObject) {
            qFilter.reject(errorObject);
        });
        return qFilter.promise;
    };

    //
    self.sortProductsMeta = function(sortNode, limitValue) {
        var qFilter = $q.defer();
        var ref = new Firebase(FBURL);
        //
        ref.child("products_meta").orderByChild(sortNode).limitToLast(limitValue).on("value", function(snapshot) {
            qFilter.resolve(snapshot.val());
        }, function (errorObject) {
            qFilter.reject(errorObject);
        });
        return qFilter.promise;
    };

    //
    // http://stackoverflow.com/questions/33336697/nosql-database-design-for-queries-with-multiple-restrictions-firebase/33338559#33338559
    self.orderBy_StartAt_LimitToLast_ProductsMeta = function(sortNode, sortNodeStartAt, loadSize) {
        var qFilter = $q.defer();
        var ref = new Firebase(FBURL);

        ref.child("products_meta").orderByChild(sortNode).startAt(sortNodeStartAt).limitToLast(loadSize).on("value", function(snapshot) {
            qFilter.resolve(snapshot.val());
        }, function (errorObject) {
            qFilter.reject(errorObject);
        });
        return qFilter.promise;
    };




    self.getProductMeta = function(productId) {
        var qLoad = $q.defer();
        var ref = new Firebase(FBURL);
        //
        ref.child("products_meta").child(productId).on("value", function(snapshot) {
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




    /**
     * Submit / Edit
     */
    self.submitProduct = function(Images, FormData, userId, optProductId, optOldFormData) {
        var qSubmit = $q.defer();
        var ref = new Firebase(FBURL);

        // define the productId (edit or submit mode)
        var productId = null;
        if(optProductId != undefined && optProductId != null && optProductId != "") {
            // edit mode (delete before submitting)
            productId = optProductId;
            self.deleteProduct(productId, optOldFormData).then(
                function(success){
                    //
                    // -->
                    console.log('old edit success')
                    submitMeta();
                },
                function(error){
                    qSubmit.reject(error)
                }
            )
        } else {
            // submit mode
            productId = generateProductId();
            submitMeta();
        }



        /**
         * Submit PRODUCT_META
         */



        function submitMeta() {

            // callback
            var onComplete = function(error) {
                if (error) {
                    //console.log('Synchronization failed 1', error);
                    qSubmit.reject({
                        error: error,
                        productId: productId
                    });
                } else {
                    // -->
                    //console.log('Synchronization succeeded 1');
                    submitImages();
                }
            }

            // synchronisation
            // root/products_meta/$category/$productId
            ref.child("products_meta").child(productId).set(
                FormData,
                onComplete
            )
        };


        /**
         * Submit PRODUCTS_IMAGES
         */

        function submitImages() {

            // callback
            var onComplete = function(error) {
                if (error) {
                    //console.log('Synchronization failed 2', error);
                    qSubmit.reject({
                        error: error,
                        productId: productId
                    });
                } else {
                    // -->
                    //console.log('Synchronization succeeded 2');
                    submitIndex('view-all')
                }
            }

            // synchronisation
            // root/products_images/$productId
            ref.child("products_images").child(productId).set(
                Images,
                onComplete
            )

        };


        /**
         * Submit PRODUCTS_INDEX
         * todo: generalize such that it can han handle nb_downloads update
         */

        function submitIndex(viewId) {

            //console.log(viewId)


            var smallMeta           = {
                timestamp_creation: FormData.timestamp_creation,
                timestamp_update:   FormData.timestamp_update,
                price:              FormData.price
            }

            var ViewRef     = getViewReferential(viewId, FormData);
            var childRef    = ViewRef.childRef + "/" + productId;
            var nextViewId  = ViewRef.nextViewId;

            if(viewId == 'none') {

                qSubmit.resolve(productId);

            } else {

                // callback
                var onComplete = function(error) {
                    if (error) {
                        //console.log('Synchronization failed 2', error);
                        qSubmit.reject({
                            error: error,
                            index_error: viewId,
                            productId: productId
                        });
                    } else {
                        // -->
                        //console.log('Synchronization succeeded 2');
                        submitIndex(nextViewId);
                    }
                }

                // synchronisation
                // root/products_images/$productId
                ref.child("products_index").child(childRef).set(
                    smallMeta,
                    onComplete
                )

            }



        };

        return qSubmit.promise;
    };



    /**
     * Delete / Edit
     */
    self.deleteProduct = function(productId, FormData) {
        var qDelete = $q.defer();
        var ref = new Firebase(FBURL);


        /**
         * Delete PRODUCT_IMAGES
         */

        // callback
        var onComplete = function(error) {
            if (error) {
                //console.log('Synchronization failed 1', error);
                qDelete.reject({
                    error: error,
                    productId: productId
                });
            } else {
                // -->
                //console.log('Synchronization succeeded 1');
                deleteIndex('view-all');
            }
        }

        // synchronisation
        // root/products_meta/$category/$productId
        ref.child("products_images").child(productId).remove(onComplete)


        /**
         * DELETE PRODUCTS_INDEX
         */
        function deleteIndex(viewId) {

            var ViewRef     = getViewReferential(viewId, FormData);
            var childRef    = ViewRef.childRef + "/" + productId;
            var nextViewId  = ViewRef.nextViewId;

            if(viewId == 'none') {

                deleteMeta();

            } else {

                // callback
                var onComplete = function(error) {
                    if (error) {
                        //console.log('Synchronization failed 2', error);
                        qDelete.reject({
                            error: error,
                            index_error: viewId,
                            productId: productId
                        });
                    } else {
                        // -->
                        //console.log('Synchronization succeeded 2');
                        deleteIndex(nextViewId);
                    }
                }

                // synchronisation
                // root/products_images/$productId
                ref.child("products_index").child(childRef).remove(onComplete)

            }



        };


        /**
         * Delete PRODUCTS_META
         */

        function deleteMeta() {

            // callback
            var onComplete = function(error) {
                if (error) {
                    //console.log('Synchronization failed 2', error);
                    qDelete.reject({
                        error: error,
                        productId: productId
                    });
                } else {
                    // -->
                    //console.log('Synchronization succeeded 2');
                    qDelete.resolve(productId)
                }
            }

            // synchronisation
            // root/products_images/$productId
            ref.child("products_meta").child(productId).remove(onComplete)

        };

        return qDelete.promise;
    };




    function generateProductId() {
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

        return "P" + fyear + fmonth + fday + fhour + fminute + d.substr(d.length-3,d.length-1);
    };

    return self;
})
