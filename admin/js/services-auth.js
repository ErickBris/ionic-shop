angular.module('noodlio.services-auth', [])

.factory('Auth', function($q) {
    var self = this;
    
    self.AuthData = {};
    
    /**
     * E-mail Firebase Authentication
     * https://www.firebase.com/docs/web/guide/login/password.html
     */
    self.authWithEmail = function(emailValue, passwordValue) {
        var qAuth = $q.defer();
        var ref = new Firebase(FBURL);
        
        ref.authWithPassword({
            email    : emailValue,
            password : passwordValue
        }, function(error, AuthData) {
            if (error) {
                console.log("Login failed!", error)
                qAuth.reject(error);
            } else {
                
                
                self.checkAdminRights(AuthData.uid).then(
                    function(success){
                        console.log("Authenticated successfully with payload:", AuthData);
                        
                        self.AuthData = AuthData;
                        qAuth.resolve(AuthData);
                    },
                    function(error){
                        console.log("Login failed!", error)
                        
                        qAuth.reject(error);
                    }
                );
            }
        });
        return qAuth.promise;
    };
    
    self.checkAdminRights = function(uid) {
        var qGet = $q.defer();
        var ref = new Firebase(FBURL);
        ref.child("admin").on("value", function(snapshot) {
            var allowedUID = snapshot.val();
            
            if(allowedUID === uid && allowedUID != null) {
                qGet.resolve(snapshot.val());
            } else {
                qGet.reject("AUTH_NO_ACCESS");
            }
        }, function (errorObject) {
            qGet.reject(errorObject);
        });
        return qGet.promise;
    }
    
    /**
     * Github Firebase Authentication
     * https://www.firebase.com/docs/web/guide/login/github.html
     */
    self.authWithGithub = function() {
        var qGithub = $q.defer();
        var ref = new Firebase(FBURL);
        
        ref.authWithOAuthPopup("github", function(error, AuthData) {
            if (error) {
                qGithub.reject(error);
            } else {
                self.AuthData = AuthData;
                qGithub.resolve(AuthData);
            }
        })
        
        return qGithub.promise;
    };
    

    /**
     * Monitor the authentication state
     * https://www.firebase.com/docs/web/guide/user-auth.html#section-monitoring-authentication
     */
    self.checkAuthState = function() {
        var qCheck = $q.defer();
        var ref = new Firebase(FBURL);
        var AuthData = ref.getAuth();
        
        if (AuthData) {
            // user is logged in with payload AuthData
            self.AuthData = AuthData;
            qCheck.resolve(AuthData);
        } else {
            qCheck.reject(AuthData);
        }
        return qCheck.promise;
    };
    
    
    self.unAuth = function() {
        var ref = new Firebase(FBURL);
        ref.unauth();
        self.AuthData = {};
    };
  
    return self;
})