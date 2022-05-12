angular.module('starter.controller-account', [])

.controller('AccountCtrl', function($rootScope, $scope, $state, $stateParams, $timeout, $ionicModal, $ionicHistory, Auth, Profile, Codes, Utils) {



  // ----
  // Init other

  // global variables
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    loading: true,
    loadingProfile: true,
    changePasswordMode: "lost",
    updateMessage: "Update account", //default
    updateButtonClass: 'button-balanced', //default
  };


  /**
  * ---------------------------------------------------------------------------------------
  * AuthState monitoring
  * ---------------------------------------------------------------------------------------
  */

  // prepate the state upon entering
  $scope.$on('$ionicView.enter', function(e) {
    checkAuth();
  });

  // monitor and redirect the user based on its authentication state
  function checkAuth() {
    $scope.AuthData = Auth.AuthData;
    if(!$scope.AuthData.hasOwnProperty('uid')){
      Auth.getAuthState().then(
        function(AuthData){
          console.log("success")
          $scope.AuthData = AuthData;
          console.log($scope.AuthData)
          handleLoggedIn();
        },
        function(notLoggedIn){
          console.log("false")
          handleLoggedOut();
        }
      )
    } else {
      handleLoggedIn();
    };
  }; // ./ checkAuth()

  // handles when the user is logged in
  function handleLoggedIn() {
    $scope.status['loading'] = false;

    console.log($scope.AuthData)

    // @dependency
    loadProfileData();

    // proceed to next state if specified (for instance when user comes from checkout)
    if($stateParams.nextState != undefined && $stateParams.nextState != null && $stateParams.nextState != "") {
      $state.go($stateParams.nextState);
    }
  };

  // handles when the user is logged out
  function handleLoggedOut() {
    openLogin();
    $scope.status['loadingProfile'] = false;
  };

  // update auth status in other controllers
  function broadcastAuthChange() {
    $rootScope.$broadcast('rootScope:authChange', {});
  };

  /**
  * ---------------------------------------------------------------------------------------
  * Update profile (delivery details in this exercise)
  * ---------------------------------------------------------------------------------------
  */

  $scope.ProfileData = {};
  function loadProfileData() {
    if($scope.AuthData.hasOwnProperty('uid')){
      Profile.getProfile($scope.AuthData.uid).then(
        function(ProfileData) {
          if(ProfileData != null) {
            $scope.ProfileData = ProfileData;
          }
          $scope.status['loadingProfile'] = false;
        }
      ),
      function(error){
        $scope.status['loadingProfile'] = false;
      }
    };
  };



  $scope.updateProfile = function() {
    if($scope.AuthData.hasOwnProperty('uid')){
      $scope.status['updateMessage'] = "Updating profile...";
      $scope.status['updateButtonClass'] = 'button-energized';

      console.log($scope.AuthData.uid, $scope.ProfileData)

      Profile.updateProfile($scope.AuthData.uid, $scope.ProfileData).then(
        function(successMessage){
          $scope.status['updateMessage'] = successMessage;
          $scope.status['updateButtonClass'] = 'button-balanced button-outline';
          handleUpdate();
        },
        function(errorMessage){
          $scope.status['updateMessage'] = errorMessage;
          $scope.status['updateButtonClass'] = 'button-assertive button-outline';
          handleUpdate();
        }
      )
    };
    function handleUpdate(){
      $timeout(function(){
        $scope.status['updateMessage'] = "Update account"; //default
        $scope.status['updateButtonClass'] = 'button-balanced';
      }, 2000)
    }
  };


  /**
  * ---------------------------------------------------------------------------------------
  * MODAL: Login
  * ---------------------------------------------------------------------------------------
  */

  // Form data for the login modal
  $scope.loginData = {};

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    $state.go('app.browse');
  };

  // Open the login modal
  $scope.login = function() {
    openLogin();
  };
  function openLogin() {
    if($scope.modal != undefined) {
      $scope.modal.show();
    } else {
      $timeout(function(){
        openLogin();
      }, 1500)
    }
  };

  $scope.unAuth = function() {
    Auth.unAuth();
    $scope.AuthData = {};
    broadcastAuthChange();
    handleLoggedOut();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    if($scope.loginData.userEmail && $scope.loginData.userPassword) {
      Utils.showMessage("Signing in user... ");
      Auth.signInPassword($scope.loginData.userEmail, $scope.loginData.userPassword).then(
        function(AuthData){

          // hide modals
          $scope.modal.hide();
          $scope.modalSignUp.hide();
          $scope.modalChangePassword.hide();

          broadcastAuthChange();
          Utils.showMessage("Signed in!", 500);

          // handle logged in
          $scope.AuthData = AuthData;
          handleLoggedIn();
        },
        function(error){
          Codes.handleError(error);
        }
      )
    }
  };


  // ---------------------------------------------------------------------------
  //
  // MODAL: Sign Up
  //
  // ---------------------------------------------------------------------------

  // Form data for the signUp modal
  $scope.signUpData = {};

  // Create the signUp modal that we will use later
  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalSignUp = modal;
  });
  $scope.closeSignUp = function() {
    $scope.modalSignUp.hide();
    $scope.modal.show();
  };
  $scope.signUp = function() {
    $scope.modal.hide();
    $scope.modalSignUp.show();
  };
  $scope.doSignUp = function() {       console.log('Doing signUp', $scope.signUpData);
    if($scope.signUpData.userEmail && $scope.signUpData.userPassword) {
        Utils.showMessage("Creating user... ");
        Auth.signUpPassword($scope.signUpData.userEmail, $scope.signUpData.userPassword).then(
            function(AuthData){

                $scope.loginData = $scope.signUpData;
                $scope.doLogin();

            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };



  // ---------------------------------------------------------------------------
  //
  // MODAL: Change Password
  //
  // ---------------------------------------------------------------------------

  // Form data for the signUp modal
  $scope.changePasswordData = {};

  // Create the signUp modal that we will use later
  $ionicModal.fromTemplateUrl('templates/change-password.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalChangePassword = modal;
  });
  $scope.closeChangePassword = function() {
    $scope.modalChangePassword.hide();
    if($scope.status.changePasswordMode == 'lost') {
      $scope.modal.show();
    }
  };
  $scope.changePassword = function(mode) {
    // when authenticated
    if($scope.AuthData.hasOwnProperty('password')){
      $scope.changePasswordData = {
          userEmail: $scope.AuthData.password.email
      }
    }
    $scope.status['changePasswordMode'] = mode;
    $scope.modal.hide();
    $scope.modalChangePassword.show();
  };

  //
  // step 1: reset password
  //
  $scope.resetPassword = function() {
      if($scope.changePasswordData.userEmail) {
        Utils.showMessage("Resetting password");
        Auth.resetPassword(
            $scope.changePasswordData.userEmail).then(
            function(success){
                Utils.showMessage("Password has been reset. Please check your email for the temporary password", 2000);
                $scope.status['changePasswordMode'] = 'change';
            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };

  //
  // step 2: change password
  //
  $scope.doChangePassword = function() {
    if($scope.changePasswordData.userEmail && $scope.changePasswordData.oldPassword && $scope.changePasswordData.newPassword) {
        Utils.showMessage("Changing password... ");
        Auth.changePassword(
            $scope.changePasswordData.userEmail,
            $scope.changePasswordData.oldPassword,
            $scope.changePasswordData.newPassword).then(
            function(AuthData){

                //
                Utils.showMessage("Password Changed!");
                //
                $scope.loginData = {
                    userEmail:      $scope.changePasswordData.userEmail,
                    userPassword:   $scope.changePasswordData.newPassword,
                }
                $scope.doLogin();

            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };


  // ---------------------------------------------------------------------------
  //
  // MODAL: Change E-mail
  //
  // ---------------------------------------------------------------------------

  // Form data for the login modal
  $scope.changeEmailData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/change-email.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalChangeEmail = modal;
  });
  $scope.closeChangeEmail = function() {
    $scope.modalChangeEmail.hide();
  };
  $scope.changeEmail = function() {
    // when authenticated
    if($scope.AuthData.hasOwnProperty('password')){
        $scope.changeEmailData = {
            oldEmail: $scope.AuthData.password.email
        }
    }
    $scope.modal.hide();
    $scope.modalChangeEmail.show();
  };
  $scope.doChangeEmail = function() {       console.log('changeEmail', $scope.changeEmailData);
    if($scope.changeEmailData.oldEmail && $scope.changeEmailData.newEmail && $scope.changeEmailData.userPassword) {

        Utils.showMessage("Changing e-mail...")

        Auth.changeEmail(
            $scope.changeEmailData.oldEmail,
            $scope.changeEmailData.newEmail,
            $scope.changeEmailData.userPassword).then(
            function(success){

                //
                $scope.closeChangeEmail();
                Utils.showMessage("E-mail changed!", 500)

            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };



});
