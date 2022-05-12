angular.module('starter.service-utils', [])

/**
 * All other complementary functions
 */
.factory('Utils', function($ionicLoading, $timeout) {
  var self = this;

  //
  // ionic loading notification
  self.showMessage = function(message, optHideTime) {
    if(optHideTime != undefined && optHideTime > 100) {
      // error message or notification (no spinner)
      $ionicLoading.show({
          template: message
      });
      $timeout(function(){
          $ionicLoading.hide();
      }, optHideTime)
    } else {
      // loading (spinner)
      $ionicLoading.show({
          template: message + '<br><br>' + '<ion-spinner style="fill: #fff;"></ion-spinner>'
      });
      $timeout(function(){    // close if it takes longer than 10 seconds
          $ionicLoading.hide();
      }, 10000)
    }
  };

  self.arrayValuesAndKeys = function(targetObject) {
    return Object.keys(targetObject).map(
      function (key) {
        return {
          key: key,
          value: targetObject[key]
        }
      }
    );
  };

  self.arrayValues = function(targetObject) {
    return Object.keys(targetObject).map(
      function (key) {
        return targetObject[key]
      }
    );
  };

  self.arrayKeys = function(targetObject) {
    return Object.keys(targetObject).map(
      function (key) {
        return key;
      }
    );
  };

  self.sortArray = function(targetObject, sortOptions) {
    console.log(targetObject)
    var sortProperty = sortOptions.property.toLowerCase();
    if(sortProperty == 'date') {
      sortProperty = "timestamp_creation";
    }
    switch(sortOptions.method){
      case 'asc':
        //
        return targetObject.sort(compareDesc);
      break
      case 'desc':
        //
        return targetObject.sort(compareAsc);
      break
    }
    function compareDesc(a,b) {
        a = a['value'];
        b = b['value'];
        console.log(a, b)
        if (a[sortProperty] < b[sortProperty])
            return -1;
        else if (a[sortProperty] > b[sortProperty])
            return 1;
        else
            return 0;
    };
    function compareAsc(a,b) {
        a = a['value'];
        b = b['value'];
        if (a[sortProperty] > b[sortProperty])
            return -1;
        else if (a[sortProperty] < b[sortProperty])
            return 1;
        else
            return 0;
    };
  };

  self.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  self.formatTimestamp = function(timestamp) {
    var date = new Date(timestamp);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  };

  return self;
})
