angular.module('starter.service-profile', [])

/**
* Retrieves and sets the ProfileData (delivery details in this exercise)
* node: users/$uid
*/
.factory('Profile', function($q) {
  var self = this;

  self.ProfileData = {}; //cache

  self.getProfile = function(uid) {
    var qGet = $q.defer();
    var ref = new Firebase(FBURL);
    // Attach an asynchronous callback to read the data at our posts reference
    ref.child('users').child(uid).on("value", function(snapshot) {
      self.ProfileData = snapshot.val();
      qGet.resolve(snapshot.val());
    }, function (errorObject) {
      //console.log("The read failed: " + errorObject.code);
      qGet.reject(errorObject);
    });
    return qGet.promise;
  };

  self.updateProfile = function(uid, ProfileData) {
    var qUpdate = $q.defer();
    var ref = new Firebase(FBURL);

    //console.log("Updating profile", uid)
    //console.log("Updating profile", ProfileData)

    var onComplete = function(error) {
      if (error) {
        qUpdate.reject("Oops... something went wrong");
        //console.log('Synchronization failed', error);
      } else {
        qUpdate.resolve("Profile updated!");
        //console.log('Synchronization succeeded');
      }
    };
    ref.child('users').child(uid).set(ProfileData, onComplete);
    return qUpdate.promise;
  };

  //
  return self;
});
