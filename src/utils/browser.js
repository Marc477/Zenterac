
ZUtils.Browser = {};

ZUtils.Browser.GoFullScreen = function(el){
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if(rfs){
        rfs.call(el);
    }
};

ZUtils.Browser.ExitFullScreen = function(){
    var rfs = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if(rfs){
        rfs.call(document);
    }
};

ZUtils.Browser.IsFullScreenSupported = function(){
    var rfs = document.fullscreenEnabled || document.mozFullscreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
    return (rfs) ? true : false;
};

ZUtils.Browser.FullScreenChange = function(callback){
    var isFullScreen = "fullscreenElement", fullscreenchange = "fullscreenchange";
    if (document.fullscreenEnabled) { // Opera 12.10 and Firefox 18 and later support 
        isFullScreen = "fullscreenElement";
        fullscreenchange = "fullscreenchange";
    } else if (document.mozFullScreenEnabled) {
        isFullScreen = "mozFullScreenElement";
        fullscreenchange = "mozfullscreenchange";
    } else if (document.msFullscreenEnabled) {
        isFullScreen = "msFullscreenElement";
        fullscreenchange = "msfullscreenchange";
    } else if (document.webkitFullscreenEnabled) {
        isFullScreen = "webkitFullscreenElement";
        fullscreenchange = "webkitfullscreenchange";
    }
    
    document.addEventListener(fullscreenchange, function( event ) {
        callback(document[isFullScreen]);
    });
    
    var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
    window.addEventListener(orientationEvent, function() {
        callback(document[isFullScreen]);
    }, false);
};

ZUtils.Browser.VisiblityChange = function(callback){
    var isHidden = "hidden", visibilityChange = "visibilitychange";
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
        isHidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        isHidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        isHidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        isHidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    
    document.addEventListener(visibilityChange, function() {
        callback(document[isHidden]);
    });
};

ZUtils.Browser.IsMobile = function(){
    return ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
};

ZUtils.Browser.IsIOS = function(){
    return ( /iPhone|iPad|iPod/i.test(navigator.userAgent) );
};

ZUtils.Browser.IsIPhone = function(){
    return ( /iPhone|iPod/i.test(navigator.userAgent) );
};

ZUtils.Browser.Get = function(){
    
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        // At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
    var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6  
    
    if(isOpera) return "opera";
    if(isFirefox) return "firefox";
    if(isSafari) return "safari";
    if(isChrome) return "chrome";
    if(isIE) return "ie";
};

ZUtils.Browser.GetOS = function(){
    var OSName = "unknown";
    if(!ZUtils.Browser.IsMobile()){
        //Desktop
        if (navigator.appVersion.indexOf("X11")!== -1) OSName = "unix";
        if (navigator.appVersion.indexOf("Linux")!== -1) OSName = "linux";
        if (navigator.appVersion.indexOf("Win")!== -1) OSName = "windows";
        if (navigator.appVersion.indexOf("Mac")!== -1) OSName = "mac";
    }else{
        //Mobile
        if( /BlackBerry/i.test(navigator.userAgent) ) OSName = "blackberry";
        if( /IEMobile/i.test(navigator.userAgent) ) OSName = "win-mobile";
        if( /Android/i.test(navigator.userAgent) ) OSName = "android";
        if( /iPhone|iPad|iPod/i.test(navigator.userAgent) ) OSName = "ios";
    }
    return OSName;
};

// mseType is webm, mp4 or ts
ZUtils.Browser.HasMSE = function(mseType){
    if (!!!window.MediaSource) {
       return false;
    } else { 
        var medias = ""; 
       
        if(MediaSource.isTypeSupported('video/webm; codecs="vorbis,vp8"'))
            medias += "webm-";
        if(MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"'))
            medias += "mp4-";
        if(MediaSource.isTypeSupported('video/mp2t; codecs="avc1.42E01E,mp4a.40.2"'))
            medias += "ts-";
        
        if(medias.length > 0){
            medias = medias.substring(0, medias.length-1);
            
            //If param, return true or false
            if(mseType){
                if(medias.indexOf(mseType) !== -1)
                    return true;
                else
                    return false;
            }
            
            //Else return media list
            return medias;
        }
        
        return false;
    }  
};

ZUtils.Browser.HasHLS = function(){
    return (!!document.createElement('video').canPlayType('application/vnd.apple.mpegURL'));
};

ZUtils.Browser.HasFlash = function(){
    var hasFlash = false;
    try {
        hasFlash = Boolean(new ActiveXObject('ShockwaveFlash.ShockwaveFlash'));
    } catch(exception) {
        hasFlash = ('undefined' !== typeof navigator.mimeTypes['application/x-shockwave-flash']);
    }
    return hasFlash;
};

ZUtils.Browser.IsOGVJS = function(){
    return (ZUtils.Browser.GetBestTech() === 'ogv');
};

ZUtils.Browser.GetBestTech = function(){
  
    var os = ZUtils.Browser.GetOS();
    var hasMSE = ZUtils.Browser.HasMSE();
    var hasFlash = ZUtils.Browser.HasFlash();
    var hasHLS = ZUtils.Browser.HasHLS();
    
    var bestTech = "html5";
    
    if(hasHLS){
        bestTech = "hls";
    }else if(hasMSE && hasMSE.indexOf("mp4") !== -1){
        bestTech = "dash";
    }else if(hasFlash){
        //bestTech = "flash"; //Not working correctly
    }
    
    //HLS and dash are weak on android
    if(os === "android"){
        bestTech = "html5";
    }
    
    //For now html5 is enabled by default
    bestTech = "html5";
    
    if(ZUtils.Browser.IsIPhone()){
        bestTech = "ogv";
    }
    
    return bestTech;
};

ZUtils.Browser.IsAPISupported = function(){
    if(ZUtils.Browser.IsHTML5Supported()){
        return true;
    }
    return false;
};

ZUtils.Browser.IsHTML5Supported = function(){
   var canPlay = false;
   var v = document.createElement('video');
   if(v.canPlayType && v.canPlayType('video/mp4').replace(/no/, '')) {
       canPlay = true;
   }
   return canPlay;
};