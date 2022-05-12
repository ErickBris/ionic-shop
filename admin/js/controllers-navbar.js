angular.module('noodlio.controllers-navbar', [])

.controller('NavBarCtrl', function(
    $rootScope, $state, $location, $anchorScroll, 
    Auth, Utils) {
    
    var navbar = this;
    navbar.randomImageUrl   = "img/user-icons/user-icon-e.png";
    navbar.randomButton     = "btn-random-e";
    navbar.AuthData         = Auth.AuthData;
    navbar.statusObj        = {};
    
    $rootScope.$on('rootScope:authChange', function (event, data) {
        navbar.AuthData = Auth.AuthData;
        if(navbar.AuthData.hasOwnProperty('uid')) {
            navbar.statusObj['loggedIn']    = true;
        }
    });
    
    
    navbar.statusObj['loading'] = true;
    if(!Auth.AuthData.hasOwnProperty('uid')) {
        Auth.checkAuthState().then(
            function(loggedIn){
                navbar.statusObj['loading']     = false;
                navbar.statusObj['loggedIn']    = true;
                navbar.AuthData = Auth.AuthData;
            },
            function(notLoggedIn) {
                navbar.statusObj['loading']     = false;
                navbar.statusObj['loggedIn']    = false;
                $state.go('admin.login')
            }
        )
    };
    
    
    navbar.unAuth = function() {
        Auth.unAuth();
        navbar.statusObj['loggedIn']    = false;
        $rootScope.$broadcast('rootScope:authChange', {});
        $state.go('admin.login');
    };
    
    navbar.goTo = function(nextState, dataObj) {
        $state.go(nextState, dataObj)
    };

    
})