angular.module('noodlio.controllers-home', [])


.controller('HomeCtrl', function($rootScope, $state, $anchorScroll, $location, Auth) {
    
    var home        = this;
    home.AuthData   = Auth.AuthData;
    
    home.initView = function() {
        $location.hash('page-top');
        $anchorScroll();
        
        checkAuth();
    };
    
    function checkAuth() { // can be put in a resolve in app.js
        home.AuthData   = Auth.AuthData;
        if(!Auth.AuthData.hasOwnProperty('uid')) {
            Auth.checkAuthState().then(
                function(loggedIn){
                    
                    home.AuthData = Auth.AuthData;
                },
                function(notLoggedIn) {
                    $state.go('admin.login')
                }
            )
        };
        
    };
    
    home.goTo = function(nextState) {
        $state.go(nextState)
    };
    

  
})