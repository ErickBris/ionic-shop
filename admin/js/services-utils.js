angular.module('noodlio.services-utils', [])

/**
 * 
 * Utilities libraries that might help you speed up your next project
 * 
 */
.factory('Utils', function($q) {
    var self = this;
    
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
    
    self.randomNumber = function() {
        var d = new Date();
        return d.getTime();
    };
    
    // resize base64 strings based on their target w and h
    // use an offscreen canvas for enhanced rendering
    self.resizeImage = function(canvasName, base64, targetWidth, targetHeight) {
        
        var qResize = $q.defer();
        
        var img = new Image;
        img.onload = resizeImage;
        img.src = base64ToDataUri(base64);
        
        
        function resizeImage() {
            imageToDataUri(this, targetWidth, targetHeight);
        }
        
        function base64ToDataUri(base64) {
            return 'data:image/png;base64,' + base64;
        }
        
        function imageToDataUri(img, targetWidth, targetHeight) {

            var canvas = document.getElementById(canvasName);;
            var ctx = canvas.getContext('2d');
            
            var dd = scaleDimensions(img.width, img.height, targetWidth, targetHeight);
        
            canvas.width = img.width = dd.iw;
            canvas.height = img.height = dd.ih;
 
            ctx.drawImage(img, 0, 0, dd.iw, dd.ih);
            
            if(canvasName == "canvas0") { // "icon"
                qResize.resolve(canvas.toDataURL());
            } else {
                qResize.resolve(canvas.toDataURL("image/jpeg", 0.9));
            }
            
        }
        
        function scaleDimensions(imgWidth, imgHeight, targetWidth, targetHeight) {
            var scaleFactor = 1;
            var dd = {iw: imgWidth, ih: imgHeight};
            if (imgWidth < targetWidth && imgHeight < targetHeight) {
                scaleFactor = 1; // do not scale
            } else {
                if (imgWidth > imgHeight){
                    scaleFactor = targetWidth/imgWidth;
                } else {
                    scaleFactor = targetHeight/imgHeight;
                }
            }
            dd["iw"] = Math.floor(imgWidth*scaleFactor);
            dd["ih"] = Math.floor(imgHeight*scaleFactor);
            
            return dd;
        }
        
        return qResize.promise;
    };
    
    self.capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
    self.formatTimestamp = function(timestamp) {
        var date = new Date(timestamp);
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
    };
    
    
    self.getFormattedDateNextMonth = function() {
        var date = new Date();
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1); // note: returns day start of next month (00:00)
        lastDay = lastDay.getTime();
        return self.formatTimestamp(lastDay);
    };

    
    self.returnUrlSlug = function(title) {
        return title.replace(/\W+/g, '-').toLowerCase();
    };
    
    return self;
})