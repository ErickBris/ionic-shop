angular.module('starter.service-codes', [])


/**
 * Handles error codes from Firebase and e.g.
 */
.factory('Codes', function(Utils) {
  var self = this;

  self.handleError = function(error) {
    Utils.showMessage(self.getUpdateMessage(error), 1500);
  };

  self.getUpdateMessage = function(error) {
    var updateMessage = "";
    if (error.hasOwnProperty('code')){
      switch(error.code) {
        case 'INVALID_USER':
          //
          updateMessage = "User does not excist... Sign up!"
          // perhaps an automatic redirect
          break
        case 'INVALID_EMAIL':
          //
          updateMessage = "Invalid E-mail. Try again"
          break
        case 'INVALID_PASSWORD':
          //
          updateMessage = "Incorrect password"
          break
        case 'INVALID_INPUT':
          //
          updateMessage = "Invalid E-mail or password. Try again"
          break
        case 'EMAIL_TAKEN':
          //
          updateMessage = "E-mail is already taken"
          break
        case 'USERNAME_TAKEN':
          //
          updateMessage = "Username is already taken. Try again"
          break
        case 'USERNAME_NONEXIST':
          //
          updateMessage = "User not found. Check your spelling"
          break
      }
    } else {
      updateMessage = "Oops. Something went wrong..."
    }
    return updateMessage;
  };

  return self;
})
