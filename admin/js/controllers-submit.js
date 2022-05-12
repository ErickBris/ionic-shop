angular.module('noodlio.controllers-submit', [])

.controller('SubmitCtrl', function(
    $state, $timeout, $location, $anchorScroll, $stateParams,
    Auth, Items, Utils, Categories) {
        
    var submit          = this;
    submit.AuthData     = Auth.AuthData; // no check here as assuming redirected from admin.home
    submit.FormData     = {};
    submit.Images       = {};
    submit.statusObj    = {};
    submit.Categories   = Categories;
    var productId       = $stateParams.productId;   // when in edit mode
    var oldFormData     = {};

    submit.initView = function() {
        $location.hash('page-top');
        $anchorScroll();
        
        checkMode()
    };
    
    // loads the product data when in edit mode
    submit.statusObj['loading'] = true;
    function checkMode() {
        
        
        // check if product exists
        if(productId != null && productId != "" && productId != undefined) {
            Items.getProductMeta(productId).then(
                function(ProductMeta){
                    if(ProductMeta != null) {
                        
                        // @preparation
                        submit.FormData         = ProductMeta;
                        submit.ProductMeta      = ProductMeta;
                        loadEditableData();
                        
                        submit.statusObj['loading'] = false;

                    }
                },
                function(error){
                    submit.statusObj['loading'] = false;
                    submit.statusObj['generalmessage'] = "Something went wrong.. check your console";
                    console.log("Warning!", error)
                }
            )
        } else {
            submit.statusObj['loading'] = false;
        };
    };

    submit.goTo = function(nextState) {
        $state.go(nextState);
    };
    
    
    /**
     * 
     * Submit
     * 
     */
    
    submit.ErrorMessages = {};
    submit.submitForm = function() {
        
        submit.loadingMode = true;
        addReferentialData();

        console.log(submit.FormData, oldFormData)
        
        Items.submitProduct(
        submit.Images, submit.FormData, submit.AuthData.auth.uid, productId, oldFormData).then(      
            function(productId){
                
                // todo
                submit.loadingMode      = false;
                $state.go('admin.items');
                
            }, function(error){
                
                // error synchronisation
                submit.loadingMode      = false;
                submit.containsNoError  = false;
                
                submit.ErrorMessages['general'] = "Ooops Something went wrong... Check the console for errors";
                
            }
        )
        
        
    };
    
    /**
     * Used for filtering
     */
    function addReferentialData() {
        
        submit.FormData["uid"]  = submit.AuthData.uid;
        
        submit.FormData["timestamp_update"] = Firebase.ServerValue.TIMESTAMP;
        if(!submit.FormData.hasOwnProperty('timestamp_creation')) {
            submit.FormData["timestamp_creation"] = Firebase.ServerValue.TIMESTAMP;
        }
        
        if(!submit.FormData.hasOwnProperty('price')) {
            submit.FormData["price"] = 1;
        }
        
        if(submit.FormData.hasOwnProperty('price')) {
            if(submit.FormData.price < 0) {
                submit.FormData["price"] = 1;
            }
        }
        
        if(!submit.FormData.hasOwnProperty('categoryId')) {
            submit.FormData["categoryId"] = "jeans";
            console.log("Warning: you did not choose a category. Random value has been assigned")
        }
        
    };
    
     // only triggered when in edit mode
    function loadEditableData() {
        
        // set old formdata
        oldFormData["categoryId"]   = submit.ProductMeta["categoryId"];
        console.log(oldFormData)
        
        // load icon
        Items.getProductIcon(productId).then(
            function(IconData){
                submit.Images["icon"] = IconData;
            },
            function(error){
                //console.log(error);
                submit.generalView = "error";
            }
        )
        
        // load images
        Items.getProductScreenshots(productId).then(
            function(ScreenshotsData){
                if(ScreenshotsData != null) {
                    processScreenshotsData(ScreenshotsData);
                }
            },
            function(error){
                //console.log(error);
                submit.generalView = "error";
            }
        )
        
        // handling 
        // Uncaught Error: Firebase.set failed: First argument contains undefined in property 'screenshot3'
        function processScreenshotsData(ScreenshotsData) {
            if(ScreenshotsData.hasOwnProperty("screenshot1")){
                submit.Images["screenshot1"] = ScreenshotsData["screenshot1"];
            }
            if(ScreenshotsData.hasOwnProperty("screenshot2")){
                submit.Images["screenshot2"] = ScreenshotsData["screenshot2"];
            }
            if(ScreenshotsData.hasOwnProperty("screenshot3")){
                submit.Images["screenshot3"] = ScreenshotsData["screenshot3"];
            }
            if(ScreenshotsData.hasOwnProperty("screenshot4")){
                submit.Images["screenshot4"] = ScreenshotsData["screenshot4"];
            }
            if(ScreenshotsData.hasOwnProperty("screenshot5")){
                submit.Images["screenshot5"] = ScreenshotsData["screenshot5"];
            }
        }
        
    };
   
   
    
     
    /**
     * 
     * Base 64 File Upload
     * 
     */
    submit.dimensions = {
        icon: {
            w: 375,
            h: 375
        },
        screenshot: {
            w: 375,
            h: 375
        }
    }
     
    // icon
    submit.onLoad0 = function (e, reader, file, fileList, fileOjects, fileObj) {
        Utils.resizeImage("canvas0", fileObj.base64, submit.dimensions["icon"].w, submit.dimensions["icon"].h).then(
            function(resizedBase64){
                submit.Images["icon"] = resizedBase64;
            }, function(error){
                //console.log(error)
            }
        )
    };
    // screenshot 1
    submit.onLoad1 = function (e, reader, file, fileList, fileOjects, fileObj) {
        Utils.resizeImage("canvas1", fileObj.base64, submit.dimensions["screenshot"].w, submit.dimensions["screenshot"].h).then(
            function(resizedBase64){
                submit.Images["screenshot1"] = resizedBase64;
            }, function(error){
                //console.log(error)
            }
        )
    };
    // screenshot 1
    submit.onLoad2 = function (e, reader, file, fileList, fileOjects, fileObj) {
        Utils.resizeImage("canvas2", fileObj.base64, submit.dimensions["screenshot"].w, submit.dimensions["screenshot"].h).then(
            function(resizedBase64){
                submit.Images["screenshot2"] = resizedBase64;
            }, function(error){
                //console.log(error)
            }
        )
    };
    // screenshot 1
    submit.onLoad3 = function (e, reader, file, fileList, fileOjects, fileObj) {
        Utils.resizeImage("canvas3", fileObj.base64, submit.dimensions["screenshot"].w, submit.dimensions["screenshot"].h).then(
            function(resizedBase64){
                submit.Images["screenshot3"] = resizedBase64;
            }, function(error){
                //console.log(error)
            }
        )
    };
    // screenshot 4
    submit.onLoad4 = function (e, reader, file, fileList, fileOjects, fileObj) {
        Utils.resizeImage("canvas4", fileObj.base64, submit.dimensions["screenshot"].w, submit.dimensions["screenshot"].h).then(
            function(resizedBase64){
                submit.Images["screenshot4"] = resizedBase64;
            }, function(error){
                //console.log(error)
            }
        )
    };
    // screenshot 5
    submit.onLoad5 = function (e, reader, file, fileList, fileOjects, fileObj) {
        Utils.resizeImage("canvas5", fileObj.base64, submit.dimensions["screenshot"].w, submit.dimensions["screenshot"].h).then(
            function(resizedBase64){
                submit.Images["screenshot5"] = resizedBase64;
            }, function(error){
                //console.log(error)
            }
        )
    };

})