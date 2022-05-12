angular.module('noodlio.controllers-items', [])


.controller('ItemsCtrl', function($location, $anchorScroll, $stateParams, $state, 
    Auth, Items, Utils) {
        
    var items               = this;
    items.AuthData          = Auth.AuthData;
    items.statusObj         = {'loading': true};
    items.ProductsMeta      = {};
    items.ProductsIcons     = {};

    items.initView = function() {
        $location.hash('page-top');
        $anchorScroll();
        
        checkAuth();
        loadLatestItems();
    };
    
    function checkAuth() { // can be put in a resolve in app.js
        if(!Auth.AuthData.hasOwnProperty('uid')) {
            Auth.checkAuthState().then(
                function(loggedIn){
                    items.AuthData = Auth.AuthData;
                },
                function(notLoggedIn) {
                    $state.go('admin.login')
                }
            )
        };
    };
    
    function loadLatestItems() {
        items.statusObj['loading'] = true;
        Items.getViewProductMeta('view-all', 'timestamp_creation', 100000).then(
            function(ProductsMeta){
                if(ProductsMeta != null) {
                    
                    items.ProductsMeta     = Utils.arrayValuesAndKeys(ProductsMeta);
                    console.log(items.ProductsMeta )
                    
                    // @dependencies
                    getProductsIcons(ProductsMeta);
                };
                items.statusObj["loading"] = false;
            }, function(error){
                console.log(error)
            }
        )
    };
    
    function getProductsIcons(ProductsMeta) {
        angular.forEach(ProductsMeta, function(value, productId){
            Items.getProductIcon(productId).then(
                function(productIcon){
                    items.ProductsIcons[productId] = productIcon;
                }
            )
        })
    }
    
    // custom functions to avoid Lexer error
    // https://docs.angularjs.org/error/$parse/lexerr?p0=Unterminated
    items.getProductsMeta = function() {
        return items.ProductsMeta;
    };
    items.getProductIcon = function(productId) {
        return items.ProductsIcons[productId];
    };
    
    items.editItem = function(productId) {
        $state.go('admin.submit', {productId: productId})
    };
    
    items.deleteItem = function(index) {
        // recommended add some control mechanism here 
        // in case you accidentely press on delete
        
        items.statusObj['loading'] = true;
        
        var productId = items.ProductsMeta[index].key;
        var FormDataTemp = {
            categoryId: items.ProductsMeta[index].value.categoryId
        }
        
        console.log(productId, FormDataTemp)
        Items.deleteProduct(productId, FormDataTemp).then(
            function(deleted){
                
                loadLatestItems();
            },
            function(error){
                console.log(error);
                items.statusObj['loading'] = false;
                items.statusObj['generalmessage'] = "Something went wrong.. check your console";
            }
        )
    };
    
    items.formatTimestamp = function(timestamp) {
        return Utils.formatTimestamp(timestamp);
    }
    
    items.goTo = function(nextState) {
        $state.go(nextState);  
    };
    
    
})




