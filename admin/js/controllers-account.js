angular.module('noodlio.controllers-account', [])


.controller('AccountCtrl', function($state, $anchorScroll, $location, $rootScope, $stateParams, $timeout,
    Auth) {
        
    var account         = this;
    account.AuthData    = Auth.AuthData;
    
    account.initView = function() {
        $location.hash('page-top');
        $anchorScroll();
        
        checkAuth();
    };
    
    function checkAuth() { // can be put in a resolve in app.js
        if(!Auth.AuthData.hasOwnProperty('uid')) {
            Auth.checkAuthState().then(
                function(loggedIn){
                    account.AuthData = Auth.AuthData;
                },
                function(notLoggedIn) {
                    $state.go('admin.login')
                }
            )
        };
    };
    
    /**
     * -------------------------------------------------------------------------
     * 
     * Authentication and other
     * 
     * -------------------------------------------------------------------------
     */
    account.inputData = {
        signIn: {}
    }
     
    account.authModeBoolean = false;
    account.authWithEmail = function() {
        account.authModeBoolean = true;
        
        account.inputData["signIn"]["message"] = "Logging in...";
        
        if(account.inputData["signIn"]["email"] && account.inputData["signIn"]["password"]) {
            Auth.authWithEmail(account.inputData["signIn"]["email"], account.inputData["signIn"]["password"]).then(
                function(AuthData){
                    account.AuthData = Auth.AuthData;
                    broadcastAuthChange();
                    account.authModeBoolean = false;
                    $state.go('admin.home')
                },
                function(error){
                    account.inputData["signIn"]["message"] = "Login failed. Check your console for the reason";
                    account.authModeBoolean = false;
                }
            )
        } else {
            account.inputData["signIn"]["message"] = "Wrong input";
        }
    };
 
    account.unAuth = function() {
        Auth.unAuth();
        broadcastAuthChange();
        $state.go('market.login');
    };

    function broadcastAuthChange() {
        $rootScope.$broadcast('rootScope:authChange', {});
    };
    
    /**
     * Other
     */
    account.goToProduct = function(categoryName, productId) {
        $state.go("market.product", {productId: productId})
    };
    
    account.editProduct = function(productId) {
        //console.log("account.editProduct")
        $state.go("market.submit", {productId: productId})
    };
 

    
    
  
})