
if(ZUtils){
    throw "ZUtils is already defined, conflicts may occurs";
}

if(Zenterac){
    throw "Zenterac is already defined, conflicts may occurs";
}

/**
 * @namespace ZUtils
 */
var ZUtils = {};

/**
 * @namespace Zenterac
 */
var Zenterac = {};


/* Main entry point for Zenteract API */

/**
 * Enable or disable debug logging
 * @type Bool
 */
Zenterac.debug = false;

/**
 * Get the version of the API
 * @type Number
 * @const
 */
Zenterac.version = "1.04";

/**
 * Server hosting the videos
 * @type String
 */
//Zenterac.server = "//api.dev.zenterac.com";
Zenterac.server = "//api.zenterac.com";


/** @function create
 * @memberof Zenterac
 * @desc Main function to create a new video player
 * @param {string} user - The ID of the user
 * @param {string} divID - The ID of the div where the video will be displayed
 * @return {Zenterac.VideoPlayer} A VideoPlayer
 * @example Zenterac.create('demo', 'vframe');
 */
Zenterac.create = function(user, divID){
    
    //Check input
    if( divID && typeof user !== "string" )
         throw "First parameter of Zenterac.create must be a user name (string)";
    
    if( divID && typeof divID !== "string" && typeof divID !== "object" )
        throw "Second parameter of Zenterac.create must be a string or div";
     
    if( !divID && typeof user !== "string" && typeof user !== "object" )
        throw "First parameter of Zenterac.create must be a string or div";
    
    var aDiv = divID || user;
    var aUser = (divID) ? user : null;
    
    //Find div in document
    var divTag = null;
    if( typeof aDiv === "string" )
        divTag = document.getElementById(aDiv);
    else
        divTag = aDiv;
    
    if( !divTag || divTag.tagName !== "DIV" )
         throw "Cannot find div " + aDiv + " in document";
    
    //Create new player
    var player = new Zenterac.VideoPlayer(divTag);
    player.useCustomServer = (aUser === null);
    player.user = aUser || "default";
    return player;
};

Zenterac.lastLog = "";

Zenterac.log = function(){
    if(Zenterac.debug){
        console.log.apply(console, arguments);
    }
    Zenterac.lastLog = "";
    for(var i=0; i<arguments.length; i++){
        Zenterac.lastLog += arguments[i];
    }
};

Zenterac.GetLastLog = function(){
    return Zenterac.lastLog;
};

Zenterac.protocol = ""; //Find it auto

(function(){
    var proto = window.location.href.split("/")[0];
    if(proto === "file:"){
        Zenterac.protocol = "http:";
        Zenterac.server = Zenterac.protocol + Zenterac.server;
    }
})();

/** @function 
 * @memberof ZUtils
 * @desc Send ajax get request
 * @param {type} aUrl - the url
 * @param {type} succesCB - success callback
 */
ZUtils.Ajax = function(aUrl, succesCB)
{
    if(!aUrl)
        return;
    
    //Add cache buster
    var startTime = (new Date()).getTime();
    var cacheBuster = "&_=" + startTime;
    aUrl += cacheBuster;
    
    //Call ajax
    new ZUtils.microAjax(aUrl, function(msg, status){
        if (typeof succesCB === "function") {
            succesCB(msg, status);
        }
    });
};

/** @function 
 * @memberof ZUtils
 * @desc Send ajax post request
 * @param {type} aUrl - the url
 * @param {type} aData - post data
 * @param {type} succesCB - success callback
 */
ZUtils.AjaxPost = function(aUrl, aData, succesCB)
{
    if(!aUrl)
        return;
    
    //Add cache buster
    var startTime = (new Date()).getTime();
    var cacheBuster = "&_=" + startTime;
    aUrl += cacheBuster;
    
    //Call ajax
    new ZUtils.microAjax(aUrl, function(msg, status){
        if (typeof succesCB === "function") {
            succesCB(msg, status);
        }
    }, aData);
};


//Post in new tab
ZUtils.Post = function(aUrl, aData, target)
{
    var form = document.createElement("form");
    form.method = "POST";
    form.action = aUrl;   
    form.target = target || "_top";

    for(var key in aData){
        var elem = document.createElement("input");
        elem.name = key;
        elem.value = aData[key];
        form.appendChild(elem);  
    }
    
    form.submit();
};

ZUtils.SerializePost = function(data){
    var str = [];
    for(var p in data)
      if (data.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
      }
    return str.join("&"); 
};

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

ZUtils.IsEnum = function(aVal, aEnum){
    
    for (var key in aEnum) {
        if(aEnum[key] === aVal){
            return true;
        }
    }
    return false;
};




ZUtils.Event = function(eName){
    
    this.name = eName;
    this.callbacks = [];
    
    ZUtils.Event.list.push(this);
    
    this.addListener = function(callback){
        if(typeof callback === "function"){
            this.callbacks.push(callback);
        }
    };
    
    this.fire = function(){
        for(var i=0; i<this.callbacks.length; i++){
            this.callbacks[i].apply(this, arguments);
        }
    };
    
};

ZUtils.Event.list = [];

ZUtils.Event.find = function(eName){
    for(var i=0; i<ZUtils.Event.list.length; i++){
        var event = ZUtils.Event.list[i];
        if(event.name === eName){
            return event;
        }
    }
    return null;
};



ZUtils.IDList = [];

//length: size of uid, Max: 100
ZUtils.GenUID = function(length)
{
    if(isNaN(length) || length < 0)
        throw "Length must be a number";
    
    var aLenght = Math.min(length, 100);
    
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    
    var uid = null;
    while(!uid || ZUtils.IDList.indexOf(uid) !== -1){
        uid = (s4() + s4() + s4() + s4() + s4() + s4() + s4()).substring(0, aLenght);
    }
      
    ZUtils.IDList.push(uid);
    return uid;
};

/*Copyright (c) 2008 Stefan Lange-Hegermann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

ZUtils.microAjax = function(url, callbackFunction)
{
	this.bindFunction = function (caller, object) {
		return function() {
			return caller.apply(object, [object]);
		};
	};

	this.stateChange = function (object) {
		if (this.request.readyState===4)
			this.callbackFunction(this.request.responseText, this.request.status);
	};

	this.getRequest = function() {
		if (window.ActiveXObject)
			return new ActiveXObject('Microsoft.XMLHTTP');
		else if (window.XMLHttpRequest)
			return new XMLHttpRequest();
		return false;
	};

	this.postBody = (arguments[2] || "");

	this.callbackFunction=callbackFunction;
	this.url=url;
	this.request = this.getRequest();
	
	if(this.request) {
		var req = this.request;
		req.onreadystatechange = this.bindFunction(this.stateChange, this);

		if (this.postBody!=="") {
			req.open("POST", url, true);
		} else {
			req.open("GET", url, true);
		}

		req.send(this.postBody);
	}
};


/** @function 
* @memberof ZUtils
* @desc Show an html DOM element
* @param {Object} htmlElem - the html element
*/
ZUtils.show = function(htmlElem){
  
  if(htmlElem){
    htmlElem.style.display = 'block';
  }
};

/** @function 
* @memberof ZUtils
* @desc Hide an html DOM element
* @param {Object} htmlElem - the html element
*/
ZUtils.hide = function(htmlElem){
  
  if(htmlElem){
    htmlElem.style.display = 'none';
  }
};

ZUtils.isNumber = function(value){
    if(typeof value === "number"){
        if(!isNaN(value)){
            return true;
        }
    }
    if(typeof value === "string"){
        if(value && !isNaN(value)){
            return true;
        }
    }
    return false;
};

ZUtils.Shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

/** @function 
* @memberof ZUtils
* @desc Get the anchor tag in the url ( #anchor )
* @returns {String}
*/
ZUtils.GetAnchor = function(){
    var hash = window.location.hash.substring(1);
    return hash;
};

ZUtils.GetQuery = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};


ZUtils.MeasureConnectionSpeed = function(imgLink, imgSize, loadCB) {
    
    var startTime, endTime;
    var download = new Image();
    download.onload = function () {
        endTime = (new Date()).getTime();
        
        var duration = (endTime - startTime) / 1000;
        var bitsLoaded = imgSize * 8;
        var speedBps = (bitsLoaded / duration).toFixed(2);
        var speedKbps = (speedBps / 1024).toFixed(2);
        var speedMbps = (speedKbps / 1024).toFixed(2);
        
        loadCB(speedKbps);
    };
    
    download.onerror = function (err, msg) {
        throw "Invalid image, or error downloading";
    };
    
    startTime = (new Date()).getTime();
    var cacheBuster = "&_=" + startTime;
    download.src = imgLink + cacheBuster;
};

ZUtils.Timer = {
    
    //Start timer
    Start: function(){
        return (new Date()).getTime();
    },
    
    Get: function(timestamp, precision){
        var preci = !isNaN(precision) ? precision : 3; // 3 decimal places
        var elapsed = ((new Date()).getTime() - timestamp).toFixed(preci); 
        return elapsed;
    }
 
};

Zenterac.InteractiveEngine = function(player){
  
    this.player = player;
    
    this.CreateSession = function(){};
    this.ReuseSession = function(){};
    this.TestSession = function(){};
    this.GetFallbackUrl = function(){};
    
    this.UploadPlaylist = function(){};
    this.PreprocessVideo = function(){};
    this.PreloadVideo = function(){};
    this.UpdateClientInfo = function(){};
    this.GetVideoInfo = function(){};
    this.GetVideoUrl = function(){};
};

Zenterac.ClientEngine = function(player){

    Zenterac.InteractiveEngine.call(this, player);
    
    this.sessionList = {};
    this.session = null;
    
    var engine = this;
    
    try{
        var sessList = JSON.parse(localStorage.Zenterac_SessionList);
        if(typeof sessList === "object"){
            engine.sessionList = sessList;
        }
    }catch(e){}
    
    var _AddPlaylist = function(playlist, newPlaylist){
        
        //Add new playlist correctly to old playlist, returns result
        var nPlaylist = newPlaylist.list;
        var addMode = newPlaylist.addMode;
        var playOrder = newPlaylist.playOrder;
        var curVideo = engine.session.cInfo.cur;
        
        //Randomize array if needed
        if(playOrder === "random"){
            ZUtils.Shuffle(nPlaylist);
        }
        
        //Remove loop of last video if it has been added by this.loop
        if(playlist[curVideo] && playlist[curVideo].playMode === "loop"){
            if(curVideo+2 === playlist.length && playlist[curVideo] === playlist[curVideo+1]){
                playlist = playlist.slice(0, curVideo + 1);
                playlist[curVideo].playMode = "all";
            }
        }
        
        //Add to the and of the current playlist
        if(addMode === "append"){
            playlist = playlist.concat(nPlaylist);
        }
        
        //Insert between current video and next video
        if(addMode === "insert"){
            playlist.splice.apply(playlist, [curVideo + 1, 0].concat(nPlaylist));
        }
        
        //Replace playlist starting at next video index
        if(addMode === "replace"){
            playlist = playlist.slice(0, curVideo + 1).concat(nPlaylist);
        }
        
        //Restart a completly new playlist
        if(addMode === "new"){
            playlist = nPlaylist;
        }
        
        return playlist;
    };
    
    var _FilterPlaylist = function(playlist, startingIndex){
        
        var vidseen = engine.session.seen;
        
        if(startingIndex < playlist.length)
        {
            var seenVid = vidseen.slice(); //Copy seen video
            var oldList = playlist.slice(startingIndex);
            playlist = playlist.slice(0, startingIndex);
            
            //Add current playlist previous videos to seen videos
            for(var i=0; i<playlist.length; i++)
            {
                if(seenVid.indexOf(playlist[i].id) === -1){
                    seenVid.push(playlist[i].id);
                }
            }
            
            //Iterate on old list to see if we remove videos
            for(var k=0; k<oldList.length; k++)
            {
                var video = oldList[k];
                
                //Add video
                if(video.playMode === "all" || video.playMode === "loop"){
                    playlist.push(video);
                }
                
                //Add video if seen previously
                if(video.playMode === "seen"){
                    if(seenVid.indexOf(video.id) !== -1)
                        playlist.push(video);
                }
                
                //Add video if never seen during session
                if(video.playMode === "unseen"){
                    if(seenVid.indexOf(video.id) === -1)
                        playlist.push(video);
                }
            }
        }
        return playlist;
    };
    
    var _LoopPlaylist = function(playlist, index){
        var isLooping = (playlist.length > 0 && playlist[playlist.length-1].playMode === "loop");
        
        if(isLooping && index >= playlist.length)
        {
            //--------- OLD CODE NOT WORKING (MULTI LOOP) -----------
            //Find loop length
            /*var loopLength = 0;
            var i = playlist.length-1;
            while(i >= 0 && playlist[i].playMode === "loop"){
                loopLength++;
                i--;
            }  

            //Find next video
            var loopIndex = (index - playlist.length) % loopLength;
            var chosenIndex = loopIndex + (playlist.length-loopLength);
            var chosenVid = playlist[chosenIndex];*/
            
            var chosenVid = playlist[playlist.length-1]; //Fallback (only one loop)
            
            //Add loop video to list
            playlist.push(chosenVid); //Add to list
        }
        
        return playlist;
    };
    
    this.CreateSession = function(user, version, callback){
        var nId = Object.keys(this.sessionList).length;
        var session = new Zenterac.Session(user, 'token-' + nId, 'localhost');
        session.videos = {};
        session.cInfo = {};
        session.playlist = [];
        session.seen = [];
        session.version = version;
        this.sessionList[session.token] = session;
        this.session = session;
        localStorage.Zenterac_SessionList = JSON.stringify(this.sessionList);
        callback(session);
    };
    
    this.ReuseSession = function(session, callback){
        var oldSessoin = this.sessionList[session.token];
        if(oldSessoin){
            callback(session);
        }else{
            this.CreateSession(player.user, function(session){
                callback(session);
            });
        }
    };
    
    this.TestSession = function(session, callback){
        var isValid = (this.sessionList[session.token]) ? true : false;
        callback(isValid);
    };
    
    this.GetFallbackUrl = function(fallbackVideo){
        var url = (typeof fallbackVideo === 'object') ? fallbackVideo.url : fallbackVideo;
        return url;
    };
    
    this.UploadPlaylist = function(playlist, callback){
        this.session.playlist = _AddPlaylist(this.session.playlist, playlist);
        this.session.playlist = _FilterPlaylist(this.session.playlist, engine.session.cur + 1);
        for(var i=0; i<playlist.list.length; i++){
            var video = playlist.list[i];
            video.playMode = video.playMode || playlist.playMode || Zenterac.PlayMode.ALL;
            this.session.videos[video.getName()] = video;
        }
        
        localStorage.Zenterac_SessionList = JSON.stringify(this.sessionList);
        if(callback){callback(true);}
    };
    
    this.PreloadVideo = function(video){
        this.session.videos[video.getName()] = video;
    };
    
    this.UpdateClientInfo = function(cInfo, callback){
        for (var key in cInfo) { 
            //Add seen value to seenlist
            if(key === "seen" && this.session.seen.indexOf(cInfo[key]) === -1) {
                this.session.seen.push(cInfo[key]);
            }
            
            //Add all other keys as attributes
            this.session.cInfo[key] = cInfo[key];
        }
        
        localStorage.Zenterac_SessionList = JSON.stringify(this.sessionList);
        if(callback){callback();}
    };
    
    this.GetVideoInfo = function(value, callback){
        var videos = this.session.videos;
        var playlist = this.session.playlist;
        var playLength =  playlist.length;
        var video = null;
        
        if(ZUtils.isNumber(value)){
            var index = parseInt(value);
            this.session.playlist = _FilterPlaylist(playlist, index);
            this.session.playlist = _LoopPlaylist(playlist, index);
            video = playlist[value];
            
            //Edit playlist length when looping
            if(playLength > 0 && playlist[playLength-1].playMode === "loop"){
                playLength = index + 2; //Make sure it is not the last video
            }
        }else{
            video = videos[value];
        }
        
        var info = {};
        if(video){
            info.id = video.id;
            info.start = video.start;
            info.duration = video.duration;
            info.type = video.type;
            info.html = video.html;
            info.name = video.getName();
            info.url = video.url;
            info.rez = 0;
            info.listLength = playLength;
        }
        
        callback(info);
    };
    
    this.GetVideoUrl = function(videoInfo, techName){
        var video = this.session.videos[videoInfo.name];
        var url = video ? video.url : "";
        url = url || videoInfo.url || "";
        return url;
    };
    
    this.ClearPlaylist = function(callback){
        var curVideo = engine.session.cInfo.cur;
        this.session.playlist = this.session.playlist.slice(0, curVideo + 1);
        if(callback){callback(true);}
    };
    
};

Zenterac.ServerEngine = function(player){
  
    Zenterac.InteractiveEngine.call(this, player);
    
    var htmlZones = {};
    
    var _SaveHtmlZone = function(id, html){
        htmlZones[id] = html;
    };
    
    var _GetHtmlZone = function(id){
        return htmlZones[id] || document.createElement('div');
    };
    
    this.CreateSession = function(user, version, callback){
        
        ZUtils.Ajax(Zenterac.server + "/stream/?a=init&u=" + user + "&v=" + version, function(response, status){
        
            if(status !== 200){
                callback(null, response);
                return;
            }

            var resData = JSON.parse(response);
            var session_id = resData.token;
            var server_host = resData.hostname;

            var session = new Zenterac.Session(user, session_id, server_host);

            callback(session);
        });
    };
    
    this.ReuseSession = function(session, callback){
        
        ZUtils.Ajax(session.getLink() + "/stream/?a=init&u=" + session.user + "&s=" + session.token, function(response, status){

            if(status !== 200){
                callback(null, null, null, null, response);
                return;
            }

            var resData = JSON.parse(response);
            var session_id = resData.token;
            var server_host = resData.hostname;
            var isNew = resData.isNew === "true" ? true : false;
            var curVid = parseInt(resData.curVideo);
            var listLength = parseInt(resData.listLength);

            var nSession = new Zenterac.Session(session.user, session_id, server_host);

            callback(nSession, isNew, curVid, listLength);
        });
    };
    
    this.TestSession = function(session, callback){
        ZUtils.Ajax(session.getLink() + "/stream/?a=test&u=" + session.user + "&s=" + session.token, function(response){
            callback(response === "VALID");
        });
    };
    
    this.GetFallbackUrl = function(fallbackVideo){
        var tech = ZUtils.Browser.GetBestTech();
        var vid = (typeof fallbackVideo === 'object') ? fallbackVideo.id : fallbackVideo;
        return Zenterac.server + "/stream/?a=fallback&u=" + player.user + "&v=" + vid + "&t=" + tech + "&vph=" + player.htmlDiv.clientHeight;  
    };
    
    this.UploadPlaylist = function(playlist, callback){
        
        //Save html zones
        for(var i=0; i<playlist.list.length; i++){
            var hZone = playlist.at(i);
            if(hZone.type === 'html'){
                _SaveHtmlZone(hZone.id, hZone.html);
            }
        }
        
        var postData = JSON.stringify(playlist);
        ZUtils.AjaxPost(player.session.getLink() + "/stream/?a=list" + "&s=" + player.session.token, postData, function(response, status){
            var isSuccess = (response && status === 200);
            callback(isSuccess);
        });
    };
    
    this.PreprocessVideo = function(video){
        var pData = {v: video.id, f: video.start, d: video.duration};
        ZUtils.AjaxPost(player.session.getLink() + "/stream/?a=process&s=" + player.session.token, JSON.stringify(pData));
    };
    
    this.UpdateClientInfo = function(cInfo, callback){
        var cData = JSON.stringify(cInfo);
        ZUtils.AjaxPost(player.session.getLink() + "/stream/?a=cinfo&s=" + player.session.token, cData, function(){
            if(callback){ callback(); }
        });
    };
    
    this.GetVideoInfo = function(value, callback){
        ZUtils.Ajax(player.session.getLink() + "/stream/?a=info&v=" + value + "&s=" + player.session.token, function(response){
                var resData = JSON.parse(response);
                
                var info = {};
                info.listLength = parseInt(resData.listLength);
                info.id = resData.vid;
                info.start = parseInt(resData.start);
                info.duration = parseInt(resData.duration);
                info.name = resData.name;
                info.playMode = resData.playMode;
                info.type = resData.type;
                info.url = resData.url;
                info.rez = resData.rez;
                info.html = _GetHtmlZone(info.id);
                
                callback(info);
        });
    };
    
    this.GetVideoUrl = function(videoInfo, techName){
        var vidUrl = "";
        var session = player.session;
        var startTime = (new Date()).getTime();
        var cacheBuster = "&_=" + startTime;
        
        if(videoInfo.url){
            //Using signed url to download from storage directly
            vidUrl = videoInfo.url;
        }else{
            //Use api server as proxy
            switch(techName){
                case "HTML": vidUrl = session.getLink() + "/stream/video.mp4?a=mp4&v=" + videoInfo.name + "&s=" + session.token; break;
                case "HLS": vidUrl = session.getLink() + "/stream/video.m3u8?a=hls&v=" + videoInfo.name + "&s=" + session.token + cacheBuster; break;
                case "DASH": vidUrl = session.getLink() + "/stream/video.mpd?a=mpd&v=" + videoInfo.name + "&s=" + session.token + cacheBuster; break;
                case "OGV": vidUrl = session.getLink() + "/stream/video.ogv?a=ogv&v=" + videoInfo.name + "&s=" + session.token + cacheBuster; break;
                default: break;
            }
        }
        return vidUrl;
    };
    
    this.ClearPlaylist = function(callback){
        ZUtils.Ajax(player.session.getLink() + "/stream/?a=clear" + "&s=" + player.session.token, function(response, status){
            var isSuccess = (response && status === 200);
            callback(isSuccess);
        });
    };
    
};

/** Playlist Add Actions
 * @enum {String}
 * @const
 * @memberof Zenterac
 */
Zenterac.AddMode = {
    /** Add playlist to the end of the current playlist (Default) */
    APPEND: "append",
    /** Insert after current video, remaining unplayed videos will be played after the new playlist */
    INSERT: "insert",
    /** Replace remaining unplayed videos with the new playlist, switch video after current video */
    REPLACE: "replace",
    /** Replace whole playlist and switch NOW */
    NEW: "new"
};

/** Playlist Play Modes
 * @enum {String}
 * @const
 * @memberof Zenterac
 */
Zenterac.PlayMode = {
    /** Inherit from parent playlist, or play all videos (Default) */
    NONE: "",
    /** Play all videos in the playlist */
    ALL: "all",
    /** Play only videos not watched by the user */
    UNSEEN: "unseen",
    /** RePlay only videos previously watched by the user */
    SEEN: "seen",
    /** Repeat the playlist until a new playlist is sent */
    LOOP: "loop"
};

/** Playlist Play Modes
 * @enum {String}
 * @const
 * @memberof Zenterac
 */
Zenterac.PlayOrder = {
    /** Play videos in the sequence of the playlist (Default) */
    LIST: "list",
    /** Play each video once in any order */
    RANDOM: "random"
};

/** Video Quality 
 * @enum {Number}
 * @const
 * @memberof Zenterac
 */
Zenterac.VideoQuality = {
    AUTO: 0,
    Q240: 240,
    Q360: 360,
    Q480: 480,
    Q720: 720,
    Q1080: 1080
};

/** @class
 * @memberof Zenterac
 * @param {String} id - ID of the video
 * @param {Number} options - Video options (id, start, duration, playMode, url)
 * @example var video = new Zenterac.Video("bunny", {start: 10, duration: 10});
 */
Zenterac.Video = function(id, options, duration, playMode){
    
    //Alternate params method: new Zenterac.Video('ID', {start:0, duration:10});
    var obj = (typeof arguments[0] === "object") ? arguments[0] : (typeof arguments[1] === "object") ? arguments[1] : null;
    var aId = obj ? obj.id || id : id;
    var aStart = obj ? obj.start : options;
    var aDuration = obj ? obj.duration : duration;
    var aMode = obj ? obj.playMode : playMode;
    var aUrl = obj ? obj.url : "";
    
    if(typeof aId !== "string")
        throw "Video parameter #1 must be a string";
    
    /** @type {String}
     * @desc The ID of the video */
    this.id = aId;
    
    /** @type {Number}
     * @desc Start position of the video (seconds) */
    this.start = aStart || 0;
    
    /** @type {Number}
     * @desc Duration before switching (seconds) */
    this.duration = aDuration || 0;
    
    /** @type {Zenterac.PlayMode}
     * @desc Video can be looped, or played only if seen/unseen, etc. */
    this.playMode = aMode || Zenterac.PlayMode.NONE;
    
    /** @type {String}
     * @desc Video url for custom mode (player.useCustomServer) */
    this.url = aUrl;
    
    this.type = 'video'; //Internal use only
    
    /** @function
     * @desc Return the name of the video: videoID_start-duration
     * @return {string} */
    this.getName = function(){
        return (this.id + "_" + Math.floor(this.start) + "-" + Math.ceil(this.duration));
    };
    
};

Zenterac.Video.CreateFromName = function(vidName){
    
    if(typeof vidName !== "string")
        throw "Video parameter #1 must be a string";
    
    var video = null;
    
    var separ = vidName.lastIndexOf("_");
    var vidID = vidName.substring(0, separ);

    if(vidID){
        
        var vidTime = vidName.substring(separ+1);
        var separ2 = vidTime.lastIndexOf("-");
        
        var start = parseFloat(vidTime.substring(0, separ2));
        var duration = parseFloat(vidTime.substring(separ2+1));
        
        video = new Zenterac.Video(vidID, start, duration);
    }
    return video;
};

/** @function 
* @memberof Zenterac.Video
* @desc Create a video from the anchor in the url ( #anchor )
* @returns {Zenterac.Video}
*/
Zenterac.Video.GetAnchorVideo = function(){
    var hash = window.location.hash.substring(1);
    return new Zenterac.Video(hash);
};

/** @class
 * @desc Instead of a video, an HTML div can be added to a playlist
 * @memberof Zenterac
 * @param {String} id - ID of the html zone
 * @param {Number} html - Html div element
 */
Zenterac.HtmlZone = function(id, html){
    
    if(typeof id !== "string")
        throw "HtmlZone parameter #1 must be a string";

    if(typeof html !== "object" || html.tagName !== 'DIV')
        throw "HtmlZone parameter #2 must be an div element";
    
    /** @type {String}
     * @desc The ID of the zone */
    this.id = id;
    
    /** @type {Object}
     * @desc The html div to display */
    this.html = html;
    
    this.type = 'html';
    
    //For compatibility only
    this.start = 0;
    this.end = 0;
    this.getName = function(){
        return this.id;
    };
};

/** @class
 * @desc A list of videos
 * @memberof Zenterac
 * @param {Zenterac.Video | Zenterac.Playlist | String} [...] - Init playlist with video list
 * @example var playlist = new Zenterac.Playlist("video1", new Zenterac.Video("video2", 10), "video3", playlist2);
 */
Zenterac.Playlist = function(){
    
    this.list = [];
    
    /** @type {Zenterac.LoadAction}
     * @desc Describe the way the playlist should be uploaded */
    this.addMode = Zenterac.AddMode.APPEND;
    
    /** @type {Zenterac.PlayOrder}
     * @desc Describe the order in which videos will be played */
    this.playOrder = Zenterac.PlayOrder.LIST;
    
    /** @type {Zenterac.PlayMode}
     * @desc Describe which videos will be played */
    this.playMode = Zenterac.PlayMode.ALL;
    
    /** @function 
     * @desc Add a video, or another playlist to this playlist
     * @param {Zenterac.Video|Zenterac.Playlist|String|Object} elem - The element to add
     * @param {Number} start - If elem is a string (videoID), start video at X seconds
     * @param {Number} duration - If elem is a string (videoID), video will play for X seconds
     */
    this.add = function(elem, start, duration){
        if(typeof elem === "string"){
            //Add video via string
            this.list.push(new Zenterac.Video(elem, start, duration));
        }
        else if(elem instanceof Zenterac.Video || elem instanceof Zenterac.HtmlZone){
            //Add video
            this.list.push(elem);
        }
        else if(elem instanceof Zenterac.Playlist){  
            //Add Playlist
            for(var i=0; i<elem.list.length; i++){
                var video = elem.list[i];
                var nVideo = new Zenterac.Video(video.id, video.start, video.duration, video.playMode || elem.playMode);
                nVideo.url = video.url;
                this.list.push(nVideo);
            }
        }
        else if(typeof elem === "object"){  
            //Add option
            for (var key in elem){
                if(this[key]){
                    this[key] = elem[key];
                }
            }
        }
    };
    
    /** @function 
     * @desc Get video at index
     * @param {Number} index
     */
    this.at = function(index){
       return this.list[index];
    };
    
    //Init playlist
    for (var i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
    }
};

Zenterac.Playlist.prototype = {
    
    /** @type {Number} 
     * @desc The length of the playlist */
    get length(){
        return this.list.length;
    }
};

/* @class
 * @memberof Zenterac
 * @param {String} sToken - Session token
 * @param {Number} sIP - IP address of session's server
 * @param {Number} sPort - Port of session's server
 */
Zenterac.Session = function(sUser, sToken, sHost){

    /* @type {string}
     * @desc Session token */
    this.token = sToken;
    
    /* @type {string}
     * @desc Session's server address or ip */
    this.host = sHost;
    
    /* @type {string}
     * @desc Session user */
    this.user = sUser;
    
    /* @function
     * @desc Returns session link
     * @returns {string} */
    this.getLink = function(){
        return Zenterac.protocol + "//" + this.host;
    };
    
};
/* Tech Player Class */
/* This class is instanced differently depending of the tech used for the video player */


//Base class
Zenterac.TechPlayer = function(canvas){
    
    //Protected members
    this._p = {};
    this._p.tPlayer = null; //3rd party player
    this._p.videoTag = null;
    this._p.videoContainer = null;
    this._p.src = "";
    
    //Public members
    this.techname = "";
    
    //Constructor
    var videoTag = document.createElement('video');
    videoTag.autoPlay = true;
    videoTag.controls = false;
    videoTag.setAttribute("webkit-playsinline", "");
    videoTag.className = "zen_video";
    videoTag.preload = "auto";
    videoTag.innerHtml = "Your browser does not support the video tag.";
    videoTag.style.width = "100%";
    
    //Css bug on old version of IOS
    //Not used on other devices to maintain video aspect ratio
    if(ZUtils.Browser.IsIOS()){
        videoTag.style.height = "100%";
    }
    
    var vidContainer = document.createElement('div');
    vidContainer.style.overflow = "hidden";
    vidContainer.style.height = "0";
    
    this._p.videoTag = videoTag;
    this._p.videoContainer = vidContainer;
    canvas.appendChild(vidContainer);
    vidContainer.appendChild(videoTag);
    
    //Public functions
    this.play = function(){
        this._p.videoTag.play();
    };
    
    this.pause = function(){
        this._p.videoTag.pause();
    };
    
    this.show = function(){
        this._p.videoContainer.style.height = "100%";
    };
    
    this.hide = function(){
        this._p.videoContainer.style.height = "0";
    };
    
    this.hidden = function(){
        return (this._p.videoContainer.style.height === "0") ||
            (this._p.videoContainer.style.height === "0px") ||
            (this._p.videoContainer.style.height === "0%");
    };
    
    this.unlock = function(){
        this._p.videoTag.play();
    };
    
    this.clear = function(){
        this._p.src = "";
        this._p.videoTag.src = "";
    };
    
    //Function templates
    this.loadVideo = function(videoUrl){};
    
    //VideoTag setters
    this.__defineSetter__("oncanplay", function(val){
        this._p.videoTag.addEventListener('canplay', val);
    });
    
    this.__defineSetter__("ondurationchange", function(val){
        this._p.videoTag.addEventListener('durationchange', val);
    });
    
    this.__defineSetter__("ontimeupdate", function(val){
        this._p.videoTag.addEventListener('timeupdate', val);
    });
    
    this.__defineSetter__("onended", function(val){
        this._p.videoTag.addEventListener('ended', val);
    });
    
    this.__defineSetter__("onplaying", function(val){
        this._p.videoTag.addEventListener('playing', val);
    });
    
    this.__defineSetter__("onwaiting", function(val){
        this._p.videoTag.addEventListener('waiting', val);
    });
    
    this.__defineSetter__("currentTime", function(val){
        this._p.videoTag.currentTime = val;
    });
    
    this.__defineSetter__("volume", function(val){
        this._p.videoTag.volume = val;
    });
    
    
    //VideoTag Getters 
    this.__defineGetter__("id", function(){
        return this._p.videoTag.id;
    });
    
    this.__defineGetter__("paused", function(){
        return this._p.videoTag.paused;
    });
    
    this.__defineGetter__("currentTime", function(){
        return this._p.videoTag.currentTime;
    });
    
    this.__defineGetter__("duration", function(){
        return this._p.videoTag.duration;
    });
    
    this.__defineGetter__("volume", function(){
        return this._p.videoTag.volume;
    });
};

//Tech player factory to create the right player
Zenterac.TechPlayer.Create = function(canvas){
    
    var bestTech = ZUtils.Browser.GetBestTech();
    
    switch(bestTech){
        case "dash": return new Zenterac.TechPlayerDash(canvas);
        case "hls": return new Zenterac.TechPlayerHLS(canvas);
        case "flash": return new Zenterac.TechPlayerFlash(canvas);
        case "ogv": return new Zenterac.TechPlayerOGV(canvas);
        default: return new Zenterac.TechPlayerHTML(canvas);
    }
    
};

//TechPlayerHTML for simple live streaming
Zenterac.TechPlayerHTML = function(canvas){
    
    Zenterac.TechPlayer.call(this, canvas);
    this.techname = "HTML";
 
    //Public functions
    this.loadVideo = function(videoUrl){
        this._p.src = videoUrl;
        this._p.videoTag.src = this._p.src;
        this._p.videoTag.play();
    };
    
};

Zenterac.TechPlayerOGV = function(canvas){
    
    Zenterac.TechPlayer.call(this, canvas);
    this.techname = "OGV";
    var self = this;
    
    var ogvPlayer = new OGVPlayer();
    ogvPlayer.style.top = "0%";
    ogvPlayer.style.bottom = "0%";
    ogvPlayer.style.left = "0%";
    ogvPlayer.style.right = "0%";
    ogvPlayer.style.position = "absolute";
    ogvPlayer.style.width = "100%";
    ogvPlayer.style.height = "100%";
    self._p.videoTag = ogvPlayer;

    self._p.videoContainer.innerHTML = "";
    self._p.videoContainer.appendChild(ogvPlayer);
    self._p.videoTag.addEventListener('loadedmetadata', function(){this.play();});
 
    //Public functions
    this.loadVideo = function(videoUrl){
        //document.getElementById('debug').innerHTML = 'load';
        this._p.src = videoUrl;
        this._p.videoTag.stop();
        this._p.videoTag.src = this._p.src;
        this._p.videoTag.load();
    };
    
    this.unlock = function(){
        this._p.videoTag.src = Zenterac.server + "/media/void.ogv";
        this._p.videoTag.load();
        this._p.videoTag.play();
    };
    
    this.clear = function(){
        //document.getElementById('debug').innerHTML = 'clear';
        this._p.src = "";
        this._p.videoTag.stop();
    };
    
    //VideoTag setters
    this.__defineSetter__("oncanplay", function(val){
        this._p.videoTag.addEventListener('play', val);
    });
    
    this.__defineSetter__("ondurationchange", function(val){
        //this._p.videoTag.addEventListener('loadedmetadata', val);
    });
    
    this.__defineSetter__("ontimeupdate", function(val){
        this._p.videoTag.addEventListener('framecallback', val);
    });
    
    this.__defineSetter__("onended", function(val){
        this._p.videoTag.addEventListener('ended', val);
    });
    
    this.__defineSetter__("currentTime", function(val){
        //Seeking make it crash
        //this._p.videoTag.currentTime = val;
    });
    
    
    //Unnesssessary
    this.play = function(){
        //document.getElementById('debug').innerHTML = 'play';
        if(this._p.videoTag.paused){ //Required to avoid crashes
            this._p.videoTag.play();
        }
    };
    
    this.pause = function(){
        //document.getElementById('debug').innerHTML = 'pause';
        this._p.videoTag.pause();
    };
    
    this.__defineSetter__("volume", function(val){
        //document.getElementById('debug').innerHTML = 'volume ' + val;
        this._p.videoTag.volume = val;
        this._p.videoTag.muted = (val < 0.5) ? true : false;
    });
};

Zenterac.TechPlayerHLS = function(canvas){
    
    Zenterac.TechPlayer.call(this, canvas);
    this.techname = "HLS";
    
    //Public functions
    this.loadVideo = function(videoUrl){
        this._p.src = videoUrl;
        this._p.videoTag.src = this._p.src;
        this._p.videoTag.play();
    };
    
};

//TechPlayerDash uses Dash.js player
Zenterac.TechPlayerDash = function(canvas){
 
    Zenterac.TechPlayer.call(this, canvas);
    this.techname = "DASH";
 
    //Constructor
    var context = Zenterac.TechPlayerDash.context;
    
    if(!context){
        context = new Dash.di.DashContext();
        Zenterac.TechPlayerDash.context = context;
    }

    this._p.tPlayer = new MediaPlayer(context);
    this._p.tPlayer.startup();
    
    //Public functions
    this.loadVideo = function(videoUrl){
        this._p.src = videoUrl;
        this._p.tPlayer.reset();
        this._p.tPlayer.attachView(this._p.videoTag);
        this._p.tPlayer.attachSource(this._p.src);
        this._p.videoTag.play();
    };
    
    this.clear = function(){
        this._p.src = "";
        this._p.tPlayer.reset();
        this._p.tPlayer.attachSource("");
    };
    
};

Zenterac.TechPlayerDash.context = null;


//Load OGV scripts
if(ZUtils.Browser.GetBestTech() === 'ogv'){
    var url = Zenterac.server + "/lib/ogv/ogv.js";
    var scriptNode = document.createElement('script');
    scriptNode.src = url;
    var currentScript = document.currentScript || document.head.lastChild;
    currentScript.parentNode.insertBefore(scriptNode, currentScript.nextSibling);
}



/** @class
 * @desc A group of videos
 * @memberof Zenterac
 * @param {Zenterac.Video} [...] - Init playlist with video list
 * @example var playlist = new Zenterac.VideoGroup(video1, video2, video3);
 */
Zenterac.VideoGroup = function(){
    
    this.list = [];
    
    /** @function 
     * @desc Get group size
     */
    this.size = function(){
        return this.list.length;
    };
    
    /** @function 
     * @desc Add a video to the group
     * @param {Zenterac.Video} video - The video to add
     */
    this.add = function(video){
        if(video instanceof Zenterac.Video || video instanceof Zenterac.VideoGroup){
            this.list.push(video);
        }
    };
    
    /** @function 
     * @desc Convert VideoGroup to a string
     * @return {String}
     */
    this.getName = function(){
        var value = "";
        for(var i=0; i<this.list.length; i++){
            var elem = this.list[i];
            if(elem instanceof Zenterac.VideoGroup){
                value += "[";
                value += elem.getName();
                value += "],";
            }
            if(elem instanceof Zenterac.Video){
                value += elem.getName();
                value += ",";
            }
        }
        return value.substring(0, value.length-1);
    };
    
    /** @function 
     * @desc Check if video or group is in group, returns index in group
     * @param {Zenterac.Video | Zenterac.VideoGroup | String} video - Video, group or id to find
     * @param {Bool} [findInSubGroup] - If true, search inside sub-groups
     * @return {Number}
     */
    this.find = function(video, findInSubGroup){
        var findSG = findInSubGroup || false;
        
        for(var i=0; i<this.list.length; i++){
            var elem = this.list[i];
            
            //Find by video or group
            if(video instanceof Zenterac.Video || video instanceof Zenterac.VideoGroup){
                if(video.getName() === elem.getName()){
                    return i;
                }
            }
            
            //Find by string
            if(typeof video === "string" && elem instanceof Zenterac.Video){
                if(video === elem.id || video === elem.getName()){
                    return i;
                }
            }
            
            //Recursive find
            if(findSG && elem instanceof Zenterac.VideoGroup){
                if(elem.find(video) >= 0){
                    return i;
                }
            }
        }
        return -1;
    };
    
    /** @function 
     * @desc Check if video is in group
     * @param {Zenterac.Video | String} video - Video or id to find
     * @return {Bool}
     */
    this.contains = function(video){
        if(video instanceof Zenterac.Video || typeof video === "string"){
            return (this.find(video, true) >= 0);
        }
    };
    
    /** @function 
     * @desc Get video at index
     * @param {Number} index
     * @return {Zenterac.Video | Zenterac.VideoGroup}
     */
    this.at = function(index){
       return this.list[index];
    };
    
    /** @function 
     * @desc Create a playlist from the group
     * @param {Object} options - Playlist options
     * @return {Zenterac.Playlist}
     */
    this.getPlaylist = function(options){
        if(typeof options === "object"){
            var playlist = Zenterac.Playlist(options);
            for(var i=0; i<this.list.length; i++){
                if(this.list[i] instanceof Zenterac.Video){
                    playlist.add(this.list[i]);
                }
            }
            return playlist;
        }
        return null;
    };
    
    //Init playlist
    for (var i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
    }
};


Zenterac.VideoInfo = function(){
    
    this.id = null; //Id of video
    this.start = 0;
    this.duration = 0;
    this.end = 1e8;
    this.type = 'video';
    this.html = null;
    this.name = null; //Id + timing (id_start-duration)
    this.playMode = Zenterac.PlayMode.NONE;
    this.timeCodes = [];
    
    this.setTimeCodes = function(timeCodes){
        this.timeCodes = [];
        
        if(this.id){
            //Add related cue points
            for(var i=0; i<timeCodes.length; i++){
                var time = timeCodes[i];
                if(!time.vid || time.vid === this.id || time.vid === this.name){
                    this.timeCodes.push(time);
                }
            }

            //Sort by time
            this.timeCodes.sort(function(a, b){
                if(a.time < b.time) return -1;
                if(a.time > b.time) return 1;
                return 0;
            });
        }
    };
    
};


/* Video Player Class */

/** VideoPlayer states
 * @enum {Number}
 * @const
 * @memberof Zenterac
 */
Zenterac.PlayerState = {
  
    /** Player is uninitialised */
    NONE: 0,
    /** Player is sending playlist to server and/or loading data */
    LOADING: 1,
    /** Player is ready to play videos */
    READY: 2,
    /** Player is switching video */
    SWITCHING: 3,
    /** Player is waiting for user action */
    WAITING: 4
    
};

/** @class
 * @desc A video player for interactive video broadcast
 * @memberof Zenterac
 * @param {div} divTag - Html element where the video will be displayed
 * @return {Zenterac.VideoPlayer} A VideoPlayer
 */
Zenterac.VideoPlayer = function(divTag){
     
    //----- Param validation -----
    if(!divTag || divTag.tagName !== "DIV")
        throw "Invalid parameter for creating a new VideoPlayer";
    
    //----- Private members -----
    
    //Todo lists
    var playlistsToSend = [];
    var videoToPreprocess = [];
    
    //Video managing
    var videoInfoMap = {};
    var videoInfoIndexMap = {};
    var videoSegmentList = [];
    var timeCodesList = [];
    var htmlZones = {};
    var playerBookmarks = {};
    var videoSegmentCurrent = null;
    var htmlZoneCurrent = null;
    var nextVideoName = null;
    var curVideo = -1;
    var playlistLength = 0;
    
    //Html divs
    var canvasZone = null;
    var videoZone = null;
    var htmlDivZone = null;
    var logoZone = null;
    var loadingZone = null;
    var overlayZone = null;
    var unlockZone = null;
    var bigPlayZone = null;
    var warningZone = null;
    
    //Flags
    var canUpload = false;
    var sentClientInfo = false;
    var shouldRefresh = false;
    var shouldSeek = null;
    var syncNextVideo = false;
    var syncOffset = 0.0;
    var isUnlocked = !ZUtils.Browser.IsMobile(); //Mobiles needs to be unlocked
    
    //Others
    var loopInterval = null;
    var keepInterval = null;
    var speed_kbps = 0;
    
    
    // ----- Public members -------
    
    /** @type {Zenterac.Session}
     * @readonly
     * @desc The session being used */
    this.session = null;
    
    /** @type {Number}
     * @desc Get or set the user of the player */
    this.user = "default";
    
    /** @type {div}
     * @readonly
     * @desc Div where the video is displayed */
    this.htmlDiv = divTag;
    
    /** @type {Zenterac.Controls}
     * @readonly
     * @desc Get the player user interface */
    this.UI = null;
    
    /** @type {Zenterac.PlayerState}
     * @readonly
     * @desc State of the player */
    this.state = Zenterac.PlayerState.NONE;
    
    /** @type {Bool}
     * @readonly
     * @desc Returns true if the player is paused */
    this.paused = true;
    
    /** @type {Number}
     * @readonly
     * @desc Current time of the current video */
    this.currentTime = 0.0;
    
    /** @type {Number}
     * @readonly
     * @desc Duration of the current video */
    this.duration = 0.0;
    
    /** @type {Bool}
     * @desc Set if the players auto plays or stops between videos in a playlist (default: true) */
    this.autoplay = true;
    
    /** @type {Number}
     * @desc Get or set the volume of the player */
    this.volume = 1.0;
    
    /** @type {Number}
     * @readonly
     * @desc Width of the player */
    this.width = 0;
    
    /** @type {Number}
     * @readonly
     * @desc Height of the player */
    this.height = 0;
    
    //Aliases
    this.__defineSetter__("controls", function(val){
        this.UI.showHide('controls', val);
    });
    this.__defineGetter__("controls", function(){
        return !this.UI.isHidden();
    });
    
    /** @type {Zenterac.VideoQuality}
     * @desc Prefered video streaming quality (Default: Zenterac.VideoQuality.AUTO) */
    this.favoriteQuality = Zenterac.VideoQuality.AUTO;
    
    /** @type {Zenterac.Video | String}
     * @desc Set fallback video ID for devices not supporting interactive videos */
    this.fallbackVideo = null;
    
    /** @type {String}
     * @desc DOM element to be displayed for non-HTML5 browser */
    this.fallbackElement = null;
    
    /** @type {Number}
     * @desc Maximum number of video preload, has to be set before creating a player */
    this.maxSegments = ZUtils.Browser.IsMobile() ? 2 : 5;
    
    /** @type {Bool}
     * @desc If true, preloading is enabled (via this.preload()), disabled by default on mobiles */
    this.usePreloading = ZUtils.Browser.IsMobile() ? false : true;
    
    /** @type {Bool}
     * @desc If true, will use multiple video segments (require more CPU power, but required for preload, disabled by default on weak devices) */
    this.useMultiSegment = (!ZUtils.Browser.IsIOS() && ZUtils.Browser.Get() !== 'safari') ? true : false;
    
    //Hidden params
    this.switchOffset = 0.1;
    this.seenPercent = 0.3;
    this.isFullScreen = false;
    this.useCustomServer = false;
    
    //Engine
    this.engine = null;
    
    //----- Events -----
    
    /** @type {Event} 
     * @desc Fired during initialization, only if a new session has been created
     * @example player.on('init', function(){}); */
    var initEvent = new ZUtils.Event('init');
    
    /** @type {Event}
     * @desc init and restart events combined, ideal event for uploading the playlist
     * @example player.on('start', function(){}); */
    var startEvent = new ZUtils.Event('start');
    
    /** @type {Event}
     * @desc Fired when the playlist is restarted
     * @example player.on('restart', function(){}); */
    var restartEvent = new ZUtils.Event('restart');
    
    /** @type {Event}
     * @desc Fired when the player is ready to play
     * @example player.on('ready', function(){}); */
    var readyEvent = new ZUtils.Event('ready');
    
    /** @type {Event}
     * @desc Fired when the time is updated
     * @example player.on('timeupdate', function(){}); */
    var timeupdateEvent = new ZUtils.Event('timeupdate');
    
    /** @type {Event}
     * @desc Fired when a new video starts in the playlist (Alias: next)
     * @example player.on('switch', function(newVideoID, prevVideoID){  }); */
    var switchEvent = new ZUtils.Event('switch');
    var nextEvent = new ZUtils.Event('next');
    
    /** @type {Event}
     * @desc Fired when the playlist has ended and the player stopped
     * @example player.on('end', function(){}); */
    var endEvent = new ZUtils.Event('end');
    
    //------- Private functions --------------
    
    var player = this; //Private functions reference
    
    //Get first segment available and return it for use
    var _GetNextSegment = function(){
        
        var vSegment = null;
        var index = 0;
        
        if(videoSegmentList.length > 0){
            
            //Find first segment that is not the next video
            while(index < videoSegmentList.length && !vSegment){
                var vinfo = videoSegmentList[index].videoInfo;
                if(!vinfo || vinfo.name !== nextVideoName){
                    //Push segment to the end of array
                    vSegment = videoSegmentList[index];
                    videoSegmentList.splice(index, 1);
                    videoSegmentList.push(vSegment);
                }
                index++;
            }
        }
        return vSegment;
    };
    
    //Remove segment from available pool
    var _RemoveSegment = function(segment){
        if(segment){
            for(var i=0; i<videoSegmentList.length; i++){
                if(videoSegmentList[i] === segment){
                    videoSegmentList.splice(i, 1);
                }
            }
        }
    };
    
    //Add to available segments pool
    var _AddSegment = function(segment){
        if(segment){
            videoSegmentList.push(segment);
        }
    };
    
    //Find segment by its name in segment list
    var _GetSegment = function(videoName){
        if(videoName){
            //Find in use first
            for(var i=0; i<videoSegmentList.length; i++){
                var vInfo = videoSegmentList[i].videoInfo;
                if(vInfo && vInfo.name === videoName){
                    var segment = videoSegmentList[i];
                    return segment;
                }
            }
        }
        return null;
    };
    
    var _ClearSegments = function(){
        
        videoSegmentCurrent.stop();
        videoSegmentCurrent.videoInfo = null;
        
        for(var i=0; i<videoSegmentList.length; i++){
            videoSegmentList[i].stop();
            videoSegmentList[i].videoInfo = null;
        }
        videoInfoMap = {};
        videoInfoIndexMap = {};
        nextVideoName = null;
    };
    
    //Create HTML zones depending of device support (not related to Zenterac.HtmlZone)
    var _CreateHTMLZones = function()
    {
        if(ZUtils.Browser.IsAPISupported()){
            //Start Full interactive video
            _CreateHTMLZonesFull();
        }
        else if(ZUtils.Browser.IsHTML5Supported()){
            //Start Flallback HTML5 static video
            _CreateHTMLZonesHalf();
        }
        else{
            //Display error message
            _CreateHTMLZonesNot();
        }
    };
    
    var _CreateHTMLZonesNot = function()
    {
        var supportZone = document.createElement('div');
        supportZone.className = "zen_notsupported";
        
        if(player.fallbackElement && typeof player.fallbackElement === "object"){
            supportZone.appendChild(player.fallbackElement);
        }
        else{
            var supportText = document.createElement('div');
            supportText.className = "zen_notsupported_text";
            supportText.innerHTML = "HTML5 video not supported";
            supportZone.appendChild(supportText);
        }
        
        while(player.htmlDiv.firstChild) {
            player.htmlDiv.removeChild(player.htmlDiv.firstChild);
        }
        
        player.htmlDiv.appendChild(supportZone);
    };
    
    var _CreateHTMLZonesHalf = function()
    {
        canvasZone = document.createElement('div');
        canvasZone.className = "zen_canvas";
        
        var vidZone = document.createElement('video');
        vidZone.className = "zen_video";
        vidZone.controls = true;
        vidZone.style.width = "100%";
        
        if(player.useCustomServer){
            player.engine = new Zenterac.ClientEngine(player);
            player.UI.hide('quality');
        }else{
            player.engine = new Zenterac.ServerEngine(player);
        }
        
        var fallbackVideo = player.fallbackVideo || "";
        vidZone.src = player.engine.GetFallbackUrl(fallbackVideo);
        canvasZone.appendChild(vidZone);
        
        while(player.htmlDiv.firstChild) {
            player.htmlDiv.removeChild(player.htmlDiv.firstChild);
        }
        
        player.htmlDiv.appendChild(canvasZone);
    };
    
    var _CreateHTMLZonesFull = function()
    {
        canvasZone = document.createElement('div');
        canvasZone.className = "zen_canvas";
        
        var frameZone = document.createElement('div');
        frameZone.className = "zen_frame";
        
        videoZone = document.createElement('div');
        videoZone.className = "zen_video_zone";
        
        htmlDivZone = document.createElement('div');
        htmlDivZone.className = "zen_html_zone";
        htmlDivZone.style.display = "none";
        
        overlayZone = document.createElement('div');
        overlayZone.className = "zen_overlay";
        overlayZone.style.display = "none";
        
        logoZone = document.createElement('div');
        logoZone.className = "zen_logo";
        logoZone.innerHTML = "<div class='zen_logo_img'></div>";
        logoZone.style.display = "none";
        logoZone.onclick = function(){player.restart();};
        
        unlockZone = document.createElement('div');
        unlockZone.className = "zen_unlock";
        unlockZone.onclick = function(){player.unlock();};
        unlockZone.style.display = "none";
        unlockZone.innerHTML = "<div class='zen_play_button'></div>";
        
        bigPlayZone = document.createElement('div');
        bigPlayZone.className = "zen_unlock";
        bigPlayZone.onclick = function(){player.play();};
        bigPlayZone.style.display = "none";
        bigPlayZone.innerHTML = "<div class='zen_play_button'></div>";
        
        warningZone = document.createElement('div');
        warningZone.className = "zen_warning";
        warningZone.title = "Warning: Your browser does not support modern video streaming technologies (Media Source Extensions or HTTP Live Streaming), streaming may be slower and some features may not work correctly!";
        warningZone.innerHTML = "<a target='_blank' href='http://www.youtube.com/html5'><div class='zen_warning_img'></div></a>";
        
        loadingZone = document.createElement('div');
        loadingZone.className = "zen_loading";
        loadingZone.innerHTML = '<div class="zen_spinner">' +
            '<div class="zen_spinner_container zen_spinner_container1">' +
              '<div class="zen_spinner_circle1"></div>' +
              '<div class="zen_spinner_circle2"></div>' +
              '<div class="zen_spinner_circle3"></div>' +
              '<div class="zen_spinner_circle4"></div>' +
            '</div>' +
            '<div class="zen_spinner_container zen_spinner_container2">' +
              '<div class="zen_spinner_circle1"></div>' +
              '<div class="zen_spinner_circle2"></div>' +
              '<div class="zen_spinner_circle3"></div>' +
              '<div class="zen_spinner_circle4"></div>' +
            '</div>' +
            '<div class="zen_spinner_container zen_spinner_container3">' +
              '<div class="zen_spinner_circle1"></div>' +
              '<div class="zen_spinner_circle2"></div>' +
              '<div class="zen_spinner_circle3"></div>' +
              '<div class="zen_spinner_circle4"></div>' +
            '</div></div>';
    
        //Mobile
        if(ZUtils.Browser.IsMobile() && !ZUtils.Browser.IsIPhone()){
            unlockZone.style.display = "block";
            logoZone.style.display = "none";
            loadingZone.style.display = "none";
        }
        
        //Iphone
        if(ZUtils.Browser.IsIPhone()){
            //Fav quality fixed
            player.favoriteQuality = 144;
            player.UI.hide('quality');
            //Iphone crashes when clicking too soon, display only in some secs
            logoZone.style.display = "block";
            loadingZone.style.display = "block";
            setTimeout(function(){  
                unlockZone.style.display = "block";
                logoZone.style.display = "none";
                loadingZone.style.display = "none";
            }, 4000);
        }
        
        //IOS
        if(ZUtils.Browser.IsIOS() || ZUtils.Browser.IsOGVJS()){
            //Force multi segment = false
            player.useMultiSegment = false;
        }
        
        //Hide warning
        if(player.UI.hideWarning || ZUtils.Browser.HasMSE('mp4') || ZUtils.Browser.HasHLS() ){
            warningZone.style.display = "none";
        }
        
        //Add children
        var childArray = [];
        while (player.htmlDiv.firstChild) {
            childArray.push(player.htmlDiv.firstChild);
            player.htmlDiv.removeChild(player.htmlDiv.firstChild);
        }
        
        while (childArray.length > 0) {
            overlayZone.appendChild(childArray.shift());
        }
        
        frameZone.appendChild(videoZone);
        frameZone.appendChild(htmlDivZone);
        frameZone.appendChild(logoZone);
        frameZone.appendChild(loadingZone);
        frameZone.appendChild(overlayZone);
        frameZone.appendChild(unlockZone);
        frameZone.appendChild(bigPlayZone);
        frameZone.appendChild(warningZone);
        frameZone.appendChild(player.UI.controls); 
        canvasZone.appendChild(frameZone);
        player.htmlDiv.appendChild(canvasZone);
        
        if(player.useMultiSegment){
            for(var i=0; i<player.maxSegments; i++){
                var aVidSegment = new Zenterac.VideoSegment(player, videoZone);
                _InitSegmentCallback(aVidSegment);
                videoSegmentList.push(aVidSegment);
            }
            videoSegmentCurrent = new Zenterac.VideoSegment(player, videoZone);
            _InitSegmentCallback(videoSegmentCurrent);
        }
        else{
            videoSegmentCurrent = new Zenterac.VideoSegment(player, videoZone);
            _InitSegmentCallback(videoSegmentCurrent);
        }
        
        if(player.useCustomServer){
            player.engine = new Zenterac.ClientEngine(player);
            player.UI.hide('quality');
        }else{
            player.engine = new Zenterac.ServerEngine(player);
        }
    };
    
    var isInitingSession = false;
    
    var _InitSession = function(){
        
        if(!player.session && !isInitingSession){
            
            isInitingSession = true;
            
            var savedSession = null;
            try{
                var sObj = JSON.parse(localStorage.Zenterac_Session);
                if(sObj.user && sObj.token && sObj.host && sObj.port){
                    savedSession = new Zenterac.Session(sObj.user, sObj.token, sObj.host);
                }
            }catch(e){}
            
            var zenLocal = localStorage.Zenterac_Action;
            var zenQuery = ZUtils.GetQuery('zen');
            localStorage.removeItem('Zenterac_Action');
            
            if(savedSession && (zenLocal === 'reload' || zenQuery === 'reload')){
                //Try copying previous session, if it is still valid
                player.engine.ReuseSession(savedSession, function(session, isNew, curVid, listLength, error){
                    if(session){
                        curVideo = curVid - 1; //Take previous vid
                        playlistLength = listLength;
                        isInitingSession = false;
                        _SessionInited(session, isNew);
                    }else{
                        loadingZone.style.display = "none";
                        canvasZone.innerHTML = '<div class="zen_error_msg">' + error + '</div>';
                    }
                });
            }
            else{
                //Force new session
                player.engine.CreateSession(player.user, Zenterac.version, function(session, error){
                    if(session){
                        isInitingSession = false;
                        _SessionInited(session, true);
                    }else{
                        loadingZone.style.display = "none";
                        canvasZone.innerHTML = '<div class="zen_error_msg">' + error + '</div>';
                    }
                });
            }
        }
    };
    
    var _SessionInited = function(session, isNew){
        
        player.session = session;
        localStorage.Zenterac_Session = JSON.stringify(session);
        canUpload = true;
        player.state = Zenterac.PlayerState.LOADING;
        playlistLength = curVideo + 5; //We dont know it yet
        
        if(canvasZone.clientWidth < 100 || canvasZone.clientHeight < 50)
            throw "Selected video div is too small or invisible! Did you forget to include zenterac.css?";
        
        _UpdateClientInfo();
        keepInterval = setInterval(_UpdateClientInfo, 30000); //Keeps session on: send req every 30 secs
        
        if(isNew){
            Zenterac.log("New Session: " + session.token);
            initEvent.fire();
            startEvent.fire();
        }else{
            Zenterac.log("Re-use Session: " + session.token);
        }
        
        //Start paypal retrieve
        Zenterac.Paypal.StartRetrieve();
    };
    
    var _UploadPlaylist = function(){
        
        if(player.session && sentClientInfo)
        {
            if(canUpload && playlistsToSend.length > 0)
            {
                var playlist = playlistsToSend[0];
                
                //Set playlist option
                canUpload = false; //Don't upload another playlist
                nextVideoName = null; //Don't play next, we will need to reload info
                playlistLength = curVideo + 5; //We dont know it yet
                
                if(playlist === null){
                    //null = Clear playlist
                    Zenterac.log("Clear playlist");
                    player.engine.ClearPlaylist(function(isSuccess){
                        _UploadPlaylistFinish(isSuccess);
                    });
                }
                else{
                    //Change state of player
                    if(playlist.addMode === Zenterac.AddMode.NEW){
                        player.next();
                        curVideo = -1;
                    }

                    //Add to playlist
                    Zenterac.log("Upload playlist");
                    player.engine.UploadPlaylist(playlist, function(isSuccess){
                        _UploadPlaylistFinish(isSuccess);
                    });
                }
            }
            
            if(videoToPreprocess.length > 0)
            {
                var video = videoToPreprocess.shift();
                player.engine.PreprocessVideo(video);
            }
        }
    };
    
    var _UploadPlaylistFinish = function(isSuccess){
        if(isSuccess){
            playlistsToSend.shift();
        }
        canUpload = true;
        videoInfoIndexMap = {}; //Clear video index map
    };
    
    var _InitSegmentCallback = function(vSegment){
        
        vSegment.onReady = function(e) {

            Zenterac.log("Can Play (" + vSegment.videoInfo.name + ") " + "???" + " ms");

            //If first video, play segment now!
            if(player.useMultiSegment){
                _StartPlaying();
            }
            else{
                _EndSwitch();
            }
        };

        vSegment.onTimeUpdate = function(e) {
            timeupdateEvent.fire();
        };

        vSegment.onEnd = function(e) {
            if(player.state === Zenterac.PlayerState.READY){
                player.state = Zenterac.PlayerState.SWITCHING;
                //Faster switching !! Call update NOW !
                if(!ZUtils.Browser.IsAPISupported()){
                    setTimeout(_UpdatePlayer, 0);
                }
            }
        };

        vSegment.onSeen = function(videoID){
            var cInfo = {seen: videoID};
            player.engine.UpdateClientInfo(cInfo);
        };
    };
    
    var _StartPlaying = function(){
        if(player.state === Zenterac.PlayerState.LOADING){

            Zenterac.log("Start Playing!"); 
            player.state = Zenterac.PlayerState.SWITCHING;
            player.paused = !player.autoplay && !ZUtils.Browser.IsMobile();
            readyEvent.fire();
        }
    };
    
    var _LoadInfo = function(value, setNextVid){
        
        //value is index of video name
        var videoMap = isNaN(value) ? videoInfoMap : videoInfoIndexMap;
        
        if(!videoMap[value]){
            
            Zenterac.log("Load Info (" + value + ")");
            videoMap[value] = new Zenterac.VideoInfo();

            //Load video info (video is an index or a name)
            player.engine.GetVideoInfo(value, function(vInfo){
                
                if(vInfo.name){
                    if(videoMap[value]){
                        videoMap[value].id = vInfo.id;
                        videoMap[value].start = vInfo.start;
                        videoMap[value].duration = vInfo.duration;
                        videoMap[value].name = vInfo.name;
                        videoMap[value].type = vInfo.type;
                        videoMap[value].html = vInfo.html;
                        videoMap[value].url = vInfo.url;
                        videoMap[value].rez = vInfo.rez;
                    }
                }
                
                if(setNextVid){
                    playlistLength = vInfo.listLength;
                    nextVideoName = vInfo.name || null;
                }
                
                _LoadSegment(value);
            });
        }
    };
    
    var _LoadSegment = function(video){
        
        //Video is a name or an index
        var vidInfo = isNaN(video) ? videoInfoMap[video] : videoInfoIndexMap[video];
        
        if(vidInfo && vidInfo.name && player.useMultiSegment){
            
            var vName = vidInfo.name;
            var vType = vidInfo.type;
            
            //No need to load HtmlZone
            if(vType === 'html'){
                htmlZones[vName] = vidInfo;
                return;
            }
            
            //Do not reload current video
            var curVidInfo = videoSegmentCurrent.videoInfo;
            if(curVidInfo && vName === curVidInfo.name){
                return;
            }
            
            //Check if already loaded
            var vSegment = _GetSegment(vName);
            
            if(!vSegment){

                //Retrive next segment and load new
                Zenterac.log("Load Segment (" + vName + ")");
                vSegment = vSegment || _GetNextSegment();
                
                if(!vSegment){
                    Zenterac.log("No segment available for preloading: " + vName + ", Consider increasing player.maxSegments");
                    return;
                }
                
                //Clear and load new segment
                vSegment.clear();
                vSegment.session = player.session;
                vSegment.load(vidInfo);
            }
            else{
                if(vSegment.isEnded()){
                    //Reinit segment to be able to play it again
                    Zenterac.log("Re-init Segment (" + vName + ")");
                    vSegment.reinit();
                }
            }
        }
    };
    
    var _LoadNext = function()
    {
        //Wait until all playlists have been sent before loading next segment
        if(sentClientInfo && (playlistsToSend.length === 0)){
            
            var nextVidIndex = curVideo + 1;
            
            if(nextVidIndex < playlistLength ){
                
                _LoadInfo(nextVidIndex, true);
                _LoadSegment(nextVidIndex);
            }
        }
    };
      
    var _SyncVideo = function(){
        if(syncNextVideo && player.useMultiSegment){
            var nextSegment = _GetSegment(nextVideoName);
            var curSegment = videoSegmentCurrent;
            
            //Same name ? Already synched!
            if(nextVideoName && curSegment.videoInfo.name === nextVideoName){
                return;
            }
        
            //Init syncing
            if(nextSegment && nextSegment.isReady){
                Zenterac.log("Start sync (" + nextSegment.videoInfo.name + ")");
                nextSegment.sync(curSegment, syncOffset);
                syncNextVideo = false;
            }
        }
    };
    
    var _PlayNext = function()
    {
        if(curVideo + 1 < playlistLength)
        {
            var hasSwitched = false;
            var vSegment = _GetSegment(nextVideoName);
            var curVidInfo = htmlZoneCurrent ? htmlZoneCurrent : videoSegmentCurrent.videoInfo;
            var previousID = curVidInfo ? curVidInfo.id : null;
            var nextSegmentID = previousID;
            
            //Same video looping
            if(nextVideoName && curVidInfo && !htmlZoneCurrent && nextVideoName === curVidInfo.name){
                if(!syncNextVideo){
                    Zenterac.log("Restart (" + curVidInfo.name + ")");
                    videoSegmentCurrent.restart();
                }
                videoSegmentCurrent.unswitchVideo();
                videoSegmentCurrent.videoInfo.setTimeCodes(timeCodesList);
                hasSwitched = true;
            }
            //New video
            else if(vSegment && vSegment.isReady){
                Zenterac.log("PlayNext (" + vSegment.videoInfo.name + ")");
                vSegment.play();
                videoSegmentCurrent.stop();

                //Swap next and current
                _RemoveSegment(vSegment);
                _AddSegment(videoSegmentCurrent);
                videoSegmentCurrent = vSegment;
                videoSegmentCurrent.videoInfo.setTimeCodes(timeCodesList);
                _ShowVideo();
                nextSegmentID = vSegment.videoInfo.id;
                hasSwitched = true;
            }
            //Next video is an html zone
            else if(htmlZones[nextVideoName]){
                var vInfo = htmlZones[nextVideoName];
                Zenterac.log("PlayNext html (" + vInfo.name + ")");
                videoSegmentCurrent.stop();
                _ShowHtmlZone(vInfo);
                nextSegmentID = vInfo.id;
                hasSwitched = true;
            }

            if(hasSwitched){
                //Update variables and fire events
                player.state = Zenterac.PlayerState.READY;
                curVideo++;
                nextVideoName = null;
                syncNextVideo = false;
                
                //Fire event
                nextEvent.fire(nextSegmentID, previousID);
                switchEvent.fire(nextSegmentID, previousID);

                //Warn server of current video
                var cInfo = {cur: curVideo};
                player.engine.UpdateClientInfo(cInfo);
            }
            else{
                //Video is not loaded yet, try in 500 ms
                //Zenterac.log("PlayNext delayed...");
                player.state = Zenterac.PlayerState.SWITCHING;
                videoSegmentCurrent.switchVideo();
                
                if(!player.UI.hideSwitchLoading && !syncNextVideo){
                    loadingZone.style.display = "block";
                }
                
                //Reload if not loaded (obsolete)
                /*if(!vSegment && nextVideoName){
                    Zenterac.log("Urgency reload (" + nextVideoName + ")");
                    _LoadInfo(nextVideoName);
                    _LoadSegment(nextVideoName);
                }*/
            }
        }
        else
        {
            Zenterac.log("End playlist");
            videoSegmentCurrent.stop();
            player.state = Zenterac.PlayerState.WAITING;
            endEvent.fire();
        }
    };
    
    var previousVideo = null;
            
    var _SwitchVideo = function(){
        
        var nextVidIndex = curVideo + 1;
        
        if(nextVidIndex < playlistLength)
        {
            var vidInfo = videoInfoIndexMap[nextVidIndex];
            var vSegment = videoSegmentCurrent;
            previousVideo = htmlZoneCurrent ? htmlZoneCurrent : videoSegmentCurrent.videoInfo;

            if(sentClientInfo && vidInfo && vidInfo.name && 
                !vSegment.isLoading() && (playlistsToSend.length === 0)){
            
                if(syncNextVideo){
                    shouldSeek = vSegment.currentTime + syncOffset;
                    syncNextVideo = false;
                }
                
                _StartPlaying();
                
                if(vidInfo.type === 'html'){
                    Zenterac.log("Switch html (" + vidInfo.name + ")");
                    vSegment.clear();
                    _ShowHtmlZone(vidInfo);
                    _EndSwitch();
                }
                else if(vSegment.videoInfo && vidInfo.name === vSegment.videoInfo.name && !ZUtils.Browser.IsOGVJS()){
                    //If same video, do not reload, except OGVJS which would crash
                    vSegment.restart();
                    _EndSwitch();
                }
                else{
                    Zenterac.log("Switch (" + vidInfo.name + ")");
                    vSegment.clear();
                    vSegment.session = player.session;
                    vSegment.load(vidInfo);
                    loadingZone.style.display = "block";
                    _ShowVideo();
                    //_EndSwitch() will be called when video is ready
                }
            }
        }
        else{
            Zenterac.log("End playlist");
            player.state = Zenterac.PlayerState.WAITING;
            videoSegmentCurrent.stop();
            endEvent.fire();
        }
    };
    
    var _EndSwitch = function(){
        player.state = Zenterac.PlayerState.READY;
        curVideo++;
        
        if(!htmlZoneCurrent && videoSegmentCurrent.videoInfo){
            Zenterac.log("Play (" + videoSegmentCurrent.videoInfo.name + ")");
            videoSegmentCurrent.videoInfo.setTimeCodes(timeCodesList);
            videoSegmentCurrent.play();
        }
        
        //Fire event
        var vInfo = htmlZoneCurrent ? htmlZoneCurrent : videoSegmentCurrent.videoInfo;
        nextEvent.fire(vInfo.id, previousVideo.id);
        switchEvent.fire(vInfo.id, previousVideo.id);

        //Warn server of current video
        var cInfo = {cur: curVideo};
        player.engine.UpdateClientInfo(cInfo);
    };
    
    var _ShowHtmlZone = function(vInfo){
        htmlZoneCurrent = vInfo;
        htmlDivZone.innerHTML = '';
        htmlDivZone.appendChild(vInfo.html);
        htmlDivZone.style.display = "block";
        videoZone.style.display = "none";
    };
    
    var _ShowVideo = function(){
        htmlZoneCurrent = null;
        htmlDivZone.style.display = "none";
        videoZone.style.display = "block";
    };
    
    var _RefreshVideo = function(){
        
        if(shouldRefresh){
            
            //Refresh during html
            if(htmlZoneCurrent){
                shouldRefresh = false;
                _ClearSegments();
                _LoadNext();
            }
            
            //Refresh during video
            if(!htmlZoneCurrent && videoSegmentCurrent.isCurrent()){
                var vidName = videoSegmentCurrent.videoInfo.name;
                var vidTime = videoSegmentCurrent.currentTime;
                shouldRefresh = false;

                if(vidName){
                    Zenterac.log("Refresh video (" + vidName + ")");
                    player.state = Zenterac.PlayerState.SWITCHING;
                    loadingZone.style.display = "block";
                    overlayZone.style.display = "none";
                    shouldSeek = vidTime;
                    curVideo -= 1;

                    //Unload all and Reload current segment with new quality
                    _ClearSegments();
                    _LoadNext();
                }
            }
        }
    };
    
    //Send info to server about client state
    var _UpdateClientInfo = function(cInfoCB){
        var clientHeight = canvasZone.clientHeight;
        var clientWidth = canvasZone.clientWidth;
        
        var cInfo = {cur: curVideo,
                tech: ZUtils.Browser.GetBestTech(),
                mobile: (ZUtils.Browser.IsMobile() ? "1" : "0"),
                favQuality: player.favoriteQuality,
                vph: clientHeight,
                vpw: clientWidth};
        
        if(player.session){
            player.engine.UpdateClientInfo(cInfo, function(){
                sentClientInfo = true;
                if(typeof cInfoCB === "function"){
                    cInfoCB();
                }
            });
        }
    };
    
    // -------- UpdatePlayer ---------------
    
    var _UpdatePlayerLoading = function(){
        
        bigPlayZone.style.display = "none";
        logoZone.style.display = !player.UI.hideLogo ? "block" : "none";
        loadingZone.style.display = "block";
        
        _InitSession();
        _UploadPlaylist();
        _LoadNext();
        
        if(!player.useMultiSegment){
            _SwitchVideo();
        }
    };
    
    var _UpdatePlayerSwitching = function(){
        
        //Update values
        player.currentTime = videoSegmentCurrent.currentTime;
        player.duration = videoSegmentCurrent.videoInfo ? videoSegmentCurrent.videoInfo.end : 0;
        
        bigPlayZone.style.display = "none";
        logoZone.style.display = "none";
        
        _UploadPlaylist();
        _LoadNext();
        
        if(player.useMultiSegment){
            _SyncVideo();
            _PlayNext();
        }else{
            _SwitchVideo();
        }
    };
    
    var _UpdatePlayerReady = function(){
        
        //Update values
        player.currentTime = videoSegmentCurrent.currentTime;
        player.duration = videoSegmentCurrent.videoInfo ? videoSegmentCurrent.videoInfo.end : 0;
        
        //UI
        if(player.paused){
            overlayZone.style.display = "none";
            bigPlayZone.style.display = "block";
            _StopUpdateLoop();
        }else{
            bigPlayZone.style.display = "none";
            overlayZone.style.display = htmlZoneCurrent ? "none" : "block";
        }
        
        loadingZone.style.display = "none";
        logoZone.style.display = "none";
        
        if((typeof shouldSeek === 'number') && videoSegmentCurrent.isCurrent()){
            videoSegmentCurrent.currentTime = shouldSeek;
            shouldSeek = null;
        }
        
        //Load next vid
        var startTime = videoSegmentCurrent.videoInfo ? videoSegmentCurrent.videoInfo.start : 0;
        var durationTime = videoSegmentCurrent.videoInfo ? videoSegmentCurrent.videoInfo.duration : 0;
        var loadTime = Math.max(player.duration - 20, startTime + durationTime/3);
        if(player.currentTime > loadTime || htmlZoneCurrent){
            _LoadNext();
        }
        
        _UploadPlaylist();
        _RefreshVideo();
    };
    
    var _UpdatePlayerWaiting = function(){
        
        logoZone.style.display = !player.UI.hideLogo ? "block" : "none";
        overlayZone.style.display = "none";
        loadingZone.style.display = "none";
        htmlDivZone.style.display = "none";
        videoZone.style.display = "block";
        
        _UploadPlaylist();
        _LoadNext();
        
        if(curVideo + 1 < playlistLength){
            player.state = Zenterac.PlayerState.SWITCHING;
        }else{
            _StopUpdateLoop();
        }
    };
    
    var _UpdatePlayer = function(){
        
        //Update player
        switch(player.state)
        {
            case Zenterac.PlayerState.NONE:
                _InitSession();
                break;
            case Zenterac.PlayerState.LOADING: 
                _UpdatePlayerLoading();
                break;
            case Zenterac.PlayerState.SWITCHING:
                _UpdatePlayerSwitching();
                break;
            case Zenterac.PlayerState.READY:
                _UpdatePlayerReady();
                break;
            case Zenterac.PlayerState.WAITING:
                _UpdatePlayerWaiting();
                break;
            default: break;
        }
        
        //Update width height
        player.width = canvasZone.clientWidth;
        player.height = canvasZone.clientHeight;
        
        //Update UI
        if(!player.UI.isHidden()){
            player.UI.update();
        }
        
        //Update segments
        videoSegmentCurrent.update(player.paused, player.volume);
        
        for(var i=0; i<videoSegmentList.length; i++){
            videoSegmentList[i].update(player.paused, player.volume);
        }
        
    };
    // -------- End UpdatePlayer -----
    
    var _StartUpdateLoop = function(){
        if(ZUtils.Browser.IsAPISupported() && isUnlocked && !loopInterval){
            loopInterval = setInterval(_UpdatePlayer, 200);
            _UpdatePlayer(); //Fast call!
        }
    };
    
    var _StopUpdateLoop = function(){
        if(loopInterval){
            clearInterval(loopInterval);
            loopInterval = null;
        }
    };
    
    //--------- End private ----------
    
    //------ Public functions -------
    
    /** @function
     * @desc Add a playlist to the player <br/>
     * <br/> Alias: VideoPlayer.append(playlist) = VideoPlayer.addPlaylist(playlist, Zenterac.AddMode.APPEND);
     * <br/> Alias: VideoPlayer.insert(playlist) = VideoPlayer.addPlaylist(playlist, Zenterac.AddMode.INSERT);
     * <br/> Alias: VideoPlayer.replace(playlist) = VideoPlayer.addPlaylist(playlist, Zenterac.AddMode.REPLACE);
     * @param {Zenterac.Playlist | Zenterac.Video | String} playlist - A playlist or a video to load
     * @param {Zenterac.AddMode} [addMode] - How the new new playlist should be added
     */
    this.addPlaylist = function(playlist, addMode){
        var aPlaylist = playlist;
        
        if(!player.session)
            throw "Playlist should be added after session initialisation, use the 'start' event";
        
        if(!ZUtils.IsEnum(addMode,Zenterac.AddMode))
            throw "Param #2 in VideoPlayer.addPlaylist() must be a Zenterac.AddMode";

        if(playlist instanceof Zenterac.Video || playlist instanceof Zenterac.HtmlZone || typeof playlist === "string"){
            aPlaylist = new Zenterac.Playlist(playlist);
        }

        if(aPlaylist instanceof Zenterac.Playlist){

            if(addMode){
                aPlaylist.addMode = addMode;
            }
            
            playlistsToSend.push(aPlaylist);
            _StartUpdateLoop();
        }
        else{
            throw "playlist is not a valid Playlist";
        }
    };
    
    /** @function
     * @desc Clear remaining playlist
     */
    this.clear = function(){
        playlistsToSend.push(null);
        _StartUpdateLoop();
    };
    
    /** @function
     * @desc Start the player or switch video
     * @param {Zenterac.Playlist} [playlist] - Optional:  A new playlist to play (using AddMode.REPLACE)
     */
    this.play = function(playlist){
        
        if(arguments.length > 1)
            throw "VideoPlayer.play() cannot have more than one argument (Playlist or Video)";
        
        if(playlist){
            this.addPlaylist(playlist, Zenterac.AddMode.REPLACE);
            this.next();
        }
        this.paused = false;
        
        _StartUpdateLoop();
    };
    
    /** @function
     * @desc Switch video using sync method (set time of next video to time of current video)
     * @param {Zenterac.Playlist} playlist - A new playlist to switch to (will sync to time of current video)
     * @param {Number} offset - Sync offset in seconds
     */
    this.playSync = function(playlist, offset){
        if(playlist){
            this.replace(playlist);
            this.nextSync(offset);
            this.paused = false;
            _StartUpdateLoop();
        }
    };
    
    /** @function
     * @desc Pause the player
     */
    this.pause = function(){
        this.paused = true;
    };
    
    /** @function
     * @desc Resume the player
     */
    this.resume = function(){
        this.paused = false;
        _StartUpdateLoop();
    };
    
    /** @function
     * @desc Seek current video to time
     * @param {Number} time - time in seconds
     */
    this.seek = function(time){
       shouldSeek = time;
    };
    
    /** @function
     * @desc Skip to next video in playlist
     */
    this.next = function(){
        if(this.state === Zenterac.PlayerState.READY){
            this.state = Zenterac.PlayerState.SWITCHING;
            _StartUpdateLoop();
        }
    };   
    
    /** @function
     * @desc Skip to next video in playlist, and sync it with current video
     * @param {Number} offset - Sync offset in seconds
     */
    this.nextSync = function(offset){
        if(this.state === Zenterac.PlayerState.READY){
            this.state = Zenterac.PlayerState.SWITCHING;
            syncNextVideo = true;
            syncOffset = offset || 0;
            _StartUpdateLoop();
        }
    };
    
    /**
     * Return current video being played
     * @returns {Zenterac.Video}
     */
    this.getCurrentVideo = function(){
        var segment = videoSegmentCurrent;
        var video = new Zenterac.Video('null');
        video.index = -1;
        
        if(htmlZoneCurrent){
            video = new Zenterac.HtmlZone(htmlZoneCurrent.id, htmlZoneCurrent.html);
            video.index = curVideo;
        }
        else if(segment.videoInfo && segment.videoInfo.name){
            video = Zenterac.Video.CreateFromName(segment.videoInfo.name);
            video.index = curVideo;
        }
        
        return video;
    };
    
    /** @function
     * @desc Restart the playlist defined in the 'init' event
     */
    this.restart = function(){
        player.state = Zenterac.PlayerState.LOADING;
        _ClearSegments();
        startEvent.fire();
        restartEvent.fire();
    };
    
    /** @function
     * @desc Force reload of current video, updating options, does not change playlist (useful for quality switch)
     */
    this.refresh = function(){
        _UpdateClientInfo(function(){
            shouldRefresh = true;
        });
    };
    
    /** @function
     * @desc Ask the player to pre-load video so it is ready to play
     * @param {Zenterac.Video} video - a video to pre-load
     */
    this.preload = function(video){
        if(video instanceof Zenterac.HtmlZone){
            return; //return without error
        }
        
        if(!(video instanceof Zenterac.Video)){
            throw "First parameter of preload must be a video";
        }
        
        if( this.usePreloading && this.useMultiSegment ){
            player.engine.PreloadVideo(video);
            _LoadInfo(video.getName());
            _LoadSegment(video.getName());
        }
    };
    
    /** @function
     * @desc Unload video client side to clear bandwidth and memory, will work only if video is not current video
     * @param {Zenterac.Video} video - a video to un-load, if undefined, will unload all videos except current
     */
    this.unload = function(video){
        if(video instanceof Zenterac.HtmlZone){
            return; //return without error
        }
        
        if(video && !(video instanceof Zenterac.Video)){
            throw "First parameter of preload must be a video";
        }
        
        if(this.useMultiSegment){
            if(video){
                var segment = _GetSegment(video.getName());

                if(segment){
                    segment.clear();
                }
            }else{
                for(var i=0; i<videoSegmentList.length; i++){
                    videoSegmentList[i].clear();
                }
            }
        }
    };
    
    /** @function
     * @desc Ask the server to pre-process video for faster loading when client will load it
     * @param {Zenterac.Video} video - a video to pre-process
     */
    this.preprocess = function(video){
        if(video instanceof Zenterac.HtmlZone){
            return; //return without error
        }
        
        if(!(video instanceof Zenterac.Video)){
            throw "First parameter of preprocess must be a video";
        }
        
        videoToPreprocess.push(video);
    };
    
    this.unlock = function(){
        if(!isUnlocked){
            
            videoSegmentCurrent.unlock();
            
            for(var i=0; i<videoSegmentList.length; i++){
                videoSegmentList[i].unlock();
            }
            
            isUnlocked = true;
            unlockZone.style.display = "none";
            _StartUpdateLoop();
        }
    };
    
    /** @function
     * @desc Add an event to the player
     * @param {string} eventName - event name (ready, timeupdate, restart, next, end)
     * @param {function} callback - event callback
     */
    this.on = function(eventName, callback){
        var event = ZUtils.Event.find(eventName);
        
        if(event){
            event.addListener(callback);
        }
    };
    
    this.toggleFullScreen = function(){
        if(this.isFullScreen)
            this.regularScreen();
        else
            this.fullScreen();
    };
    
    var asp = 16 / 9;
    
    this.fullScreen = function(){
        ZUtils.Browser.GoFullScreen(canvasZone);
    };
    
    this.regularScreen = function(){
        ZUtils.Browser.ExitFullScreen();
    };
    
    //Full screen event
    ZUtils.Browser.FullScreenChange(function(isFullScreen){
        player.isFullScreen = isFullScreen;
        if( isFullScreen ){
            var h = window.screen.height;
            var w = window.screen.width;
            
            //UI offset 
            var uiHeight = 30;
            var uiOffset = (w/asp) - h + uiHeight;
            uiOffset = Math.min(uiOffset, uiHeight);
            uiOffset = Math.max(uiOffset, 0);

            // Maintain aspect ratio
            if(w > h*asp){
                w = h*asp;
            }else{
                h = w/asp;
            }
            
            canvasZone.style.width = w + "px";
            canvasZone.style.height = (h + uiHeight - uiOffset) + "px";
            player.UI.controls.style.top = (h - uiOffset) + "px";
        }
        else{
            canvasZone.style.width = "";
            canvasZone.style.height = "";
            player.UI.controls.style.top = "";
        }
        
        //Update UI
        player.UI.update();
        
        //Update client info
        setTimeout(_UpdateClientInfo, 1000);
    });
    
    /** @function
     * @desc Add a time cue point that will call code
     * @param {String} video - Video ID of the video that will trigger the cue point, set to "" to trigger on all videos
     * @param {Number} time - Time at which the cue point will be triggered
     * @param {Function} callback - The function to call on the cue point, first param will be the ID of the video
     */
    this.onTime = function(video, time, callback){
        if(typeof video !== "string" && !(video instanceof Zenterac.Video))
            throw "param #1 must be a string";
        
        if(typeof time !== "number")
            throw "param #2 must be a number";
        
        if(typeof callback !== "function")
            throw "param #3 must be a function";
        
        var vidID = (video instanceof Zenterac.Video) ? video.getName() : video;
        var timecode = {vid: vidID, time: time, callback: callback};
        timeCodesList.push(timecode);
    };
    
    /** @function
     * @desc Add a bookmark to the player, run bookmarks with player.runBookmarks('bookmark_id')
     * @param {String} id - ID of the bookmark, can be null (default bookmark)
     * @param {function} callback - Function to call when running the bookmark
     */
    this.addBookmark = function(id, callback){
        
        if(id && typeof id !== "string")
            throw "param #1 must be a string";
        
        if(typeof callback !== "function")
            throw "param #2 must be a function";
        
        var aId = id || "";
        playerBookmarks[aId] = callback;
    };
    
    /** @function
     * @desc Run a bookmark added with player.addBookmarks('bookmark_id', function(){})<br/> 
     * If id is not found, default bookmark is called (bookmark with null id)<br/>
     * Alias: player.runAnchorBookmark() = runBookmark(ZUtils.GetAnchor())
     * @param {String} id - ID of the bookmark to run
     */
    this.runBookmark = function(id){
        
        if(id && typeof id !== "string")
            throw "param #1 must be a string";
        
        var aId = id || "";
        var bookmark = playerBookmarks[aId];
        var defaultBookmark = playerBookmarks[""];
        
        if(bookmark){
            bookmark();
        }
        else if(defaultBookmark){
            defaultBookmark();
        }
    };
    
    //--------- End public ------
    
    //------ Aliases ---------
    
    this.insert = function(playlist){
        
        if(arguments.length > 1)
            throw "VideoPlayer.insert() cannot have more than one argument (Playlist or Video)";
        
        this.addPlaylist(playlist, Zenterac.AddMode.INSERT);
    };
    
    this.insertNow = function(playlist){
        
        if(arguments.length > 1)
            throw "VideoPlayer.insertNow() cannot have more than one argument (Playlist or Video)";
        
        this.addPlaylist(playlist, Zenterac.AddMode.INSERT);
        this.next();//Switch video now!
    };
    
    this.replace = function(playlist){
        
        if(arguments.length > 1)
            throw "VideoPlayer.replace() cannot have more than one argument (Playlist or Video)";
        
        this.addPlaylist(playlist, Zenterac.AddMode.REPLACE);
    };
    
    this.replaceNow = function(playlist){
        
        if(arguments.length > 1)
            throw "VideoPlayer.replaceNow() cannot have more than one argument (Playlist or Video)";
        
        this.addPlaylist(playlist, Zenterac.AddMode.REPLACE);
        this.next(); //Switch video now!
    };
    
    this.append = function(playlist){
        
        if(arguments.length > 1)
            throw "VideoPlayer.append() cannot have more than one argument (Playlist or Video)";
        
        this.addPlaylist(playlist, Zenterac.AddMode.APPEND);
    };
    
    this.runAnchorBookmark = function(){
        player.runBookmark(ZUtils.GetAnchor());
    };
    
    //Log out browser info
    var os = ZUtils.Browser.GetOS();
    var browser = ZUtils.Browser.Get();
    var bestTech = ZUtils.Browser.GetBestTech();
    var hasMSE = ZUtils.Browser.HasMSE();
    var hasFlash = ZUtils.Browser.HasFlash();
    var hasHLS = ZUtils.Browser.HasHLS();
    Zenterac.log("OS: " + os + " | Browser: " + browser + " | Tech: " + bestTech);
    Zenterac.log("Techs supported: " + " | Dash: " + hasMSE + " | HLS: " + hasHLS + " | Flash: " + hasFlash);
    
    //--------- Constructor ----------
    
    //Controls
    player.UI = new Zenterac.Controls(player);
    
    //Leave tab event
    if(ZUtils.Browser.IsMobile()){
        ZUtils.Browser.VisiblityChange(function(isHidden){
            if(isHidden){
                player.pause();
            }
        });
    }
    
    setTimeout(function(){
        //Execute on next tick
        _CreateHTMLZones();
        _StartUpdateLoop();
    }, 0);
};

Zenterac.VideoState = {
  
    NONE: 0,
    LOADING: 1,
    INITING: 2,
    WAITING: 3,
    SYNCING: 4,
    CURRENT: 5,
    SWITCHING: 6,
    ENDED: 7
};

//Sync constants
Zenterac.SYNC_MAX_TRY = 5;
Zenterac.SYNC_MAX_MARGIN = 0.04;

//Creates a new video segment for the VideoPlayer
//Attach new segment to html canvas
Zenterac.VideoSegment = function(player, canvas){
    
    //Protected members
    this._p = {};
    this._p.techPlayer = null;
    this._p.player = player;
    
    //Sync var
    var approxDelayList = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
    var mobileOffset = ZUtils.Browser.IsMobile() ? -1.0 : 0.0;
    var syncTry = 0;
    var syncWith = null;
    var syncOffset = 0.0;

    //Public members
    this.session = null;
    this.state = Zenterac.VideoState.NONE;
    this.volume = 0.0;
    this.videoInfo = null;
    this.isSeen = false;
    this.isReady = false;
    this.timeSet = false;
    
    var self = this;
    
    this.clear = function(){
        this.session = null;
        this.volume = 0.0;
        this.state = Zenterac.VideoState.NONE;
        this.videoInfo = null;
        this.isSeen = false;
        this.isReady = false;
        this.timeSet = false;
        this._p.techPlayer.clear();
        this._p.techPlayer.hide();
    };
    
    this.restart = function(){
        //Reset, but right now!
        if(this.isReady){
            this.state = Zenterac.VideoState.CURRENT;
            this._p.techPlayer.currentTime = this.videoInfo.start;
        }
    };
    
    //Public functions
    this.play = function(){
        this.state = Zenterac.VideoState.CURRENT;
        setTimeout(function(){self.update();}, 0); //Make it faster
    };
    
    this.stop = function(){
        this.state = Zenterac.VideoState.ENDED;
        setTimeout(function(){self.update();}, 0); //Make it faster
    };
    
    this.reinit = function(){
        //Reinit segment for playing it again
        if(this.isReady){
            this.state = Zenterac.VideoState.INITING;
            this.isReady = false;
            this.timeSet = false;
            this._p.techPlayer.play();
        }
    };
    
    this.switchVideo = function(){
        //Video will continue playing but interaction will be disabled
        if(this.state === Zenterac.VideoState.CURRENT){
            this.state = Zenterac.VideoState.SWITCHING;
        }
    };
    
    this.unswitchVideo = function(){
        //Re-enable interaction
        if(this.state === Zenterac.VideoState.SWITCHING){
            this.state = Zenterac.VideoState.CURRENT;
        }
    };
    
    this.load = function(videoInfo){
        this.videoInfo = videoInfo;
        this.state = Zenterac.VideoState.LOADING;
        var videoUrl = player.engine.GetVideoUrl(this.videoInfo, this._p.techPlayer.techname);
        this._p.techPlayer.loadVideo(videoUrl);
    };
    
    this.isCurrent = function(){
        return (this.state === Zenterac.VideoState.CURRENT);
    };
    
    this.isLoading = function(){
        return (this.state === Zenterac.VideoState.LOADING ||
                this.state === Zenterac.VideoState.INITING);
    };
    
    this.isEnded = function(){
        return (this.state === Zenterac.VideoState.ENDED);
    };
    
    //Unlock play() on mobile devices when called on a click
    this.unlock = function(){
        this._p.techPlayer.unlock();
    };
    
    //Sync this segment with another segment with offset
    this.sync = function(segment, offset){
        if(segment && segment !== this){
            this.state = Zenterac.VideoState.SYNCING;
            this.isReady = false;
            this._p.techPlayer.play();
            syncTry = 0;
            syncWith = segment;
            syncOffset = offset || 0;
        }
    };
    
    this.update = function(playerPaused, playerVolume){
        
        playerPaused = playerPaused || false;
        
        if(typeof playerVolume === "number"){
            this.volume = playerVolume;
        }
        
        if(this.state === Zenterac.VideoState.CURRENT)
        {
            if(!playerPaused && this._p.techPlayer.paused){
                this._p.techPlayer.play();
            }

            if(playerPaused && !this._p.techPlayer.paused){
                this._p.techPlayer.pause();
            }

            if(this._p.techPlayer.hidden()){
                this._p.techPlayer.show();
            }
            
            if(this._p.techPlayer.volume !== this.volume){
                this._p.techPlayer.volume = this.volume;
            }
            
            //Check cue points
            if(this.videoInfo.timeCodes.length > 0){
                var timeCue = this.videoInfo.timeCodes[0];
                if(this._p.techPlayer.currentTime > timeCue.time){
                    this.videoInfo.timeCodes.shift();
                    timeCue.callback(this.videoInfo.id, timeCue.time);
                }
            }
            
            //Video is seen if a % has been watched
            var seenThreshold = this.videoInfo.start + this.videoInfo.duration * this._p.player.seenPercent;
            if(!this.isSeen && this._p.techPlayer.currentTime > seenThreshold)
            {
                //Warn server that video has been watched
                this.isSeen = true;
                this.onSeen(this.videoInfo.id);
            }
        }
        
        if(this.state === Zenterac.VideoState.ENDED){
            if(!this._p.techPlayer.paused || !this._p.techPlayer.hidden() || this._p.techPlayer.volume > 0){
                this._p.techPlayer.pause();
                this._p.techPlayer.hide();
                
                //Prepare video in case we go back to this segment (faster)
                if(this.isReady && this._p.player.useMultiSegment){
                    this._p.techPlayer.volume = 0.0;
                    this._p.techPlayer.currentTime = this.videoInfo ? this.videoInfo.start : 0;
                }
            }
        }
    };
    
    //Events
    this.onReady = function(){};
    this.onTimeUpdate = function(){};
    this.onEnd = function(){};
    this.onSeen = function(){};
    this.onPlaying = function(){};
    this.onWaiting = function(){};
    
    //Getters
    this.__defineGetter__("currentTime", function(){
        return this._p.techPlayer.currentTime;
    });
    
    this.__defineGetter__("duration", function(){
        return this._p.techPlayer.duration;
    });
    
    this.__defineSetter__("currentTime", function(val){
        this._p.techPlayer.currentTime = val;
    });
    
    //Constructor
    this._p.techPlayer = new Zenterac.TechPlayer.Create(canvas);
    
    //TechPlayer event callbacks
    var techPlayer = this._p.techPlayer;
    
    var _SetDuration = function(){
        if(self.videoInfo){
            if(ZUtils.Browser.IsOGVJS()){
                self.videoInfo.start = 0; //Seeking not working correctly
            }
            
            self.videoInfo.end = self.videoInfo.duration + self.videoInfo.start;
            if(self.videoInfo.duration < 0.01){
                self.videoInfo.end  = self._p.techPlayer.duration - self._p.player.switchOffset;
            }
        }
    };
    
    techPlayer.oncanplay = function(e) {

        //If video info is valid
        if(self.state === Zenterac.VideoState.LOADING)
        {
            Zenterac.log("Init segment (" + self.videoInfo.name + ")");
            self.state = Zenterac.VideoState.INITING;
            self._p.techPlayer.play();
            self.timeSet = false;
            
            if(self._p.player.useMultiSegment){
                self._p.techPlayer.volume = 0.0; //Volume=0 since this video is preloading in the background
            }
        }
    };
    
    techPlayer.ondurationchange = function(e){
        _SetDuration();
    };

    techPlayer.ontimeupdate = function(e) {
        
        if(self.state === Zenterac.VideoState.INITING){
            
            //ondurationchange event not working correctly on IOS
            if(ZUtils.Browser.IsIOS() || ZUtils.Browser.IsOGVJS()){
                _SetDuration();
            }
            
            if(ZUtils.Browser.IsOGVJS()){
                //No seeking (or crashes), skip to waiting now!!
                self.state = Zenterac.VideoState.WAITING;
                self.isReady = true;
                self._p.techPlayer.pause();
                self.onReady(); //Is ready to play
                return;
            }
            
            if(!this.timeSet && self.videoInfo.start > 0.5 && self._p.techPlayer.currentTime < self.videoInfo.start - 0.5){

                //TODO: Fix: Crashing on mobile if changing currentTime too soon (why?)
                if(!ZUtils.Browser.IsMobile() || self._p.techPlayer.currentTime > 1.0){
                    self._p.techPlayer.currentTime = self.videoInfo.start - 0.5;
                    this.timeSet = true;
                }
            }
            else if(self.videoInfo.start === 0 || self._p.techPlayer.currentTime >= self.videoInfo.start){
                //On Mobiles, wait until time is > 0.1, otherwise there will be a black screen
                if(!ZUtils.Browser.IsMobile() || self._p.techPlayer.currentTime > 0.1){
                    self.state = Zenterac.VideoState.WAITING;
                    self.isReady = true;
                    self._p.techPlayer.pause();
                    self.onReady(); //Is ready to play
                }
            }
        }
        
        if(self.state === Zenterac.VideoState.SYNCING){
            
            //Sync loop (move this to VideoSegment.js
            var diff = syncWith.currentTime - self.currentTime + syncOffset;
            
            //Find approx delay average
            var approxDelay = 0;
            for(var i=0; i<approxDelayList.length; i++){
                approxDelay += approxDelayList[i] / approxDelayList.length;
            }
            
            //Update approx delay if not first tries
            if(syncTry > 1){
                approxDelayList.unshift(diff);
                approxDelayList.slice(0, 10);
            }

            if( Math.abs(diff) < Zenterac.SYNC_MAX_MARGIN || syncTry >= Zenterac.SYNC_MAX_TRY )
            {
                self.state = Zenterac.VideoState.WAITING;
                self.isReady = true;
                
                Zenterac.log("Sync result: " + syncWith.id + ": " + syncWith.currentTime +
                        " | " + self.videoInfo.id + ": " + self.currentTime + " | Tries: " + syncTry);
            }
            else
            {
                var offset = diff + approxDelay + mobileOffset;
                var newTime = self._p.techPlayer.currentTime + offset;
                newTime = Math.min(newTime, self.videoInfo.end);
                newTime = Math.max(newTime, self.videoInfo.start);
                self._p.techPlayer.currentTime = newTime;
                syncTry++;
            }
            
            //Stop syncing
            if(self.videoInfo.end > 0.1 && self.currentTime > self.videoInfo.end){
                self.state = Zenterac.VideoState.WAITING;
                self.isReady = true;
            }
        }

        if(self.state === Zenterac.VideoState.CURRENT)
        {
            self.onTimeUpdate();
            
            //Check if end reached, this reduce delay and help sync (instead of waiting onended event)
            if(self.videoInfo.end - techPlayer.currentTime < 0.2){
                self.state = Zenterac.VideoState.ENDED;
                self.onEnd();
            }
        }
        
        if(self.state === Zenterac.VideoState.SWITCHING)
        {
            self.onTimeUpdate();
        }
    };

    techPlayer.onended = function(e) {
        
        if(self.state === Zenterac.VideoState.CURRENT){
            self.state = Zenterac.VideoState.ENDED;
            self.onEnd();
        }
    };
    
    techPlayer.onplaying = function(){
        if(self.state === Zenterac.VideoState.CURRENT){
            self.onPlaying();
        }
    };
    
    techPlayer.onwaiting = function(){
        if(self.state === Zenterac.VideoState.CURRENT){
            self.onWaiting();
        }
    };
};

/** @class
 * @desc Video controls UI, access with player.UI
 * @memberof Zenterac
 * @example var player = Zenterac.create('demo','vframe'); <br/> var UI = player.UI;
 */
Zenterac.Controls = function(player){
    
    var control = document.createElement('div');
    control.className = "zen_ctrl_control";
    control.style.display = "block";
    control.style.height = "0";
    control.innerHTML = '<div class="zen_ctrl_topControl">' +
                    '<div class="zen_ctrl_progress"><span class="zen_ctrl_bufferBar"></span><span class="zen_ctrl_timeBar"></span></div>' +
                    '<div class="zen_ctrl_time"><span class="zen_ctrl_current"></span> / <span class="zen_ctrl_duration"></span></div>' +
                    '</div>';
     
    var btmControl =  document.createElement('div');
    btmControl.className = "zen_ctrl_btmControl";
    btmControl.style.display = "none";
    control.appendChild(btmControl);
    
    var btnPlay =  document.createElement('div');
    btnPlay.className = "zen_ctrl_btnPlay zen_ctrl_btn";
    btnPlay.title = "Play/Pause video";
    btmControl.appendChild(btnPlay);
    
    var btnRestart =  document.createElement('div');
    btnRestart.className = "zen_ctrl_btnRestart zen_ctrl_btn";
    btnRestart.title = "Restart playlist";
    btnRestart.style.display = "block";
    btmControl.appendChild(btnRestart);
    
    var btnNext =  document.createElement('div');
    btnNext.className = "zen_ctrl_btnNext zen_ctrl_btn";
    btnNext.title = "Next video";
    btnNext.style.display = "none";
    btmControl.appendChild(btnNext);
    
    var seekCtrl =  document.createElement('div');
    seekCtrl.className = "zen_ctrl_seek";
    seekCtrl.title = "Set time";
    seekCtrl.style.display = "none";
    btmControl.appendChild(seekCtrl);
    
    var seekBar =  document.createElement('span');
    seekBar.className = "zen_ctrl_seekBar";
    seekCtrl.appendChild(seekBar);
    
    var btnFullScreen =  document.createElement('div');
    btnFullScreen.className = "zen_ctrl_btnFS zen_ctrl_btn";
    btnFullScreen.title = "Toggle Fullscreen";
    btnFullScreen.style.display = "block";
    btmControl.appendChild(btnFullScreen);
    
    var qualityCombo =  document.createElement('select');
    qualityCombo.className = "zen_ctrl_quality";
    qualityCombo.title = "Select video quality";
    qualityCombo.innerHTML = "";
    btmControl.appendChild(qualityCombo);
    
    var volumeCtrl =  document.createElement('div');
    volumeCtrl.className = "zen_ctrl_volume";
    volumeCtrl.title = "Set volume";
    btmControl.appendChild(volumeCtrl);
    
    var volumeBar =  document.createElement('span');
    volumeBar.className = "zen_ctrl_volumeBar";
    volumeCtrl.appendChild(volumeBar);
    
    var btnMute =  document.createElement('div');
    btnMute.className = "zen_ctrl_sound zen_ctrl_sound2 zen_ctrl_btn";
    btnMute.title = "Mute/Unmute sound";
    btmControl.appendChild(btnMute);
      
    //-----Player callbacks -----
    player.on('ready', function(){
        control.style.height = "30px";
        btmControl.style.display = "block";
    });
    
    // ----- Controls ---------
    //CONTROLS Buttons
    var TogglePlayPause = function(){
        if(player.paused) {
            player.play();
        }
        else {
            player.pause();
        }
        updatePlayPause();
    };
    
    btnPlay.onclick = function(){
        TogglePlayPause();
    };
    
    /** @function
     * @desc The event used to play/pause on space bar keypress
     * @example You can remove this event with: document.removeEventListener("keypress", player.UI.spaceEvent);
     */
    this.spaceEvent = function(e){
        if(e.keyCode === 32 && control.style.display === "block"){
            TogglePlayPause();
            e.preventDefault();
            return false;
        }
    };
    
    document.addEventListener("keypress", this.spaceEvent);
    
    btnRestart.onclick = function(){
        player.restart();
    };
    
    btnNext.onclick = function(){
        player.next();
    };
    
    btnFullScreen.onclick = function(){
        player.toggleFullScreen();
    };
    
    //VOLUME BAR
    var volumeDrag = false;
    volumeCtrl.onmousedown = function(e) {
        volumeDrag = true;
        btnMute.className = btnMute.className.replace( /(?:^|\s)zen_ctrl_muted(?!\S)/g , '');
        setVolume(e.pageX);
    };
    volumeCtrl.onmouseup = function(e) {
        if(volumeDrag) {
            volumeDrag = false;
            setVolume(e.pageX);
        }
    };
    volumeCtrl.onmousemove = function(e) {
        if(volumeDrag) {
            setVolume(e.pageX);
        }
    };
    volumeCtrl.onmouseleave = function(e){
        volumeDrag = false;
    };
    
    var previousSound = 0;
    btnMute.onclick = function() {
        if(!btnMute.className.match(/(?:^|\s)zen_ctrl_muted(?!\S)/)){
            previousSound = player.volume;
            setVolume(0, 0);
        }
        else{
            setVolume(0, previousSound);
        }
    };
    
    //Seeking BAR
    var seekDrag = false;
    seekCtrl.onmousedown = function(e) {
        seekDrag = true;
    };
    seekCtrl.onmouseup = function(e) {
        if(seekDrag) {
            seekDrag = false;
            setSeek(e.pageX);
        }
    };
    seekCtrl.onmouseleave = function(e){
        seekDrag = false;
    };
    
    //Quality control
    for(var q in Zenterac.VideoQuality){
        var option = document.createElement('option');
        option.value = Zenterac.VideoQuality[q];
        option.text = (Zenterac.VideoQuality[q] > 0) ? Zenterac.VideoQuality[q] + "p" : "Auto";
        qualityCombo.add(option);
    }
    
    var qualityNoEvent = false;
    qualityCombo.onchange = function(){
        if(!qualityNoEvent){
            player.favoriteQuality = qualityCombo.value;
            player.refresh();
        }
    };
    
    //---- Setters ---------------
    var getAbsPosition = function(el){
        var el2 = el;
        var curtop = 0;
        var curleft = 0;
        if (document.getElementById || document.all) {
            do  {
                curleft += el.offsetLeft-el.scrollLeft;
                curtop += el.offsetTop-el.scrollTop;
                el = el.offsetParent;
                el2 = el2.parentNode;
                while (el2 !== el) {
                    curleft -= el2.scrollLeft;
                    curtop -= el2.scrollTop;
                    el2 = el2.parentNode;
                }
            } while (el.offsetParent);

        } else if (document.layers) {
            curtop += el.y;
            curleft += el.x;
        }
        return {top:curtop, left:curleft};
    };
    
    var volume;
    var setVolume = function(x, vol) {

        var percentage;
        if(vol || vol === 0) {
            percentage = vol * 100;
        }
        else {
            var position = x - getAbsPosition(volumeCtrl).left;
            percentage = 100 * position / volumeCtrl.clientWidth;
        }

        percentage = Math.min(percentage, 100);
        percentage = Math.max(percentage, 0);

        volume = percentage / 100;
        player.volume = percentage / 100;

        updateVolume();
    };
    
    var setSeek = function(x){
        var position = x - getAbsPosition(seekCtrl).left;
        var percentage = 100 * position / seekCtrl.clientWidth;
        percentage = Math.min(percentage, 100);
        percentage = Math.max(percentage, 0);
        
        player.seek(player.duration * percentage / 100);
        updateSeek();
    };
    
    //--------- Update UI function ---------
    var updatePlayPause = function(){
        if(player.paused) {
            btnPlay.className = btnPlay.className.replace( /(?:^|\s)zen_ctrl_paused(?!\S)/g , '');
        }
        else if(btnPlay.className.indexOf('zen_ctrl_paused') === -1){
            btnPlay.className += ' zen_ctrl_paused';
        }
    };
    
    var updateVolume = function() {
        
        var percentage = volume * 100;
        volumeBar.style.width = percentage + '%';
        
        //change sound icon based on volume
        var muteClass = btnMute.className;
        if(volume === 0){
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_muted(?!\S)/g , '');
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_sound2(?!\S)/g , '');
            muteClass += " zen_ctrl_muted";
        }
        else if(volume > 0.5){
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_muted(?!\S)/g , '');
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_sound2(?!\S)/g , '');
            muteClass += " zen_ctrl_sound2";
        }
        else{
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_muted(?!\S)/g , '');
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_sound2(?!\S)/g , '');
        }
        
        //Change it
        if(muteClass !== btnMute.className){
            btnMute.className = muteClass;
        }
        
        //Responsive size
        if(player.width > 480){
            volumeCtrl.style.display = "block";
        }else{
            volumeCtrl.style.display = "none";
        }
    };
    
    var updateSeek = function(){
        if(player.duration > 0){
            var percentage = player.currentTime * 100 / player.duration;
            seekBar.style.width = percentage + '%';
        }else{
            seekBar.style.width = '0%';
        }
        
        //Responsive size
        if(player.width > 850){
            seekCtrl.style.width = "60%";
        }
        else if(player.width > 700){
            seekCtrl.style.width = "50%";
        }
        else if(player.width > 600){
            seekCtrl.style.width = "40%";
        }
        else if(player.width > 500){
            seekCtrl.style.width = "30%";
        }
        else if(player.width > 400){
            seekCtrl.style.width = "20%";
        }
    };
    
    var updateUI = function(){
        
        //Quality combo box
        if(qualityCombo.value !== player.favoriteQuality){
           qualityNoEvent = true;
           qualityCombo.value = player.favoriteQuality;
           qualityNoEvent = false;
        }
        
        //Full screen button
        if(ZUtils.Browser.IsFullScreenSupported()){
            var fsClass = btnFullScreen.className;
            if(player.isFullScreen){
                fsClass = fsClass.replace('zen_ctrl_btnFS', 'zen_ctrl_btnRS');
            }else{
                fsClass = fsClass.replace('zen_ctrl_btnRS', 'zen_ctrl_btnFS');
            }

            if(fsClass !== btnFullScreen.className){
                btnFullScreen.className = fsClass;
            }
        }else{
            //FullScreen is not supported, hide button
            if(btnFullScreen.style.display === "block"){
                btnFullScreen.style.display = "none";
            }
        }
    };
    
    this.hideSwitchLoading = false;
    this.hideWarning = true;
    this.hideLogo = false;
    
    /** @type {bool}
     * @name overlay
     * @desc If set to true, control bar will overlay video
     * @memberOf Zenterac.Controls
     * @instance
     * @example player.UI.overlay = true;
     */
    this.__defineSetter__("overlay", function(val){
        control.style.bottom = (val) ? "0px" : "";
    });
    
    this.__defineGetter__("overlay", function(){
        return (control.style.bottom === "0px");
    });
    
    this.update = function(){
        updatePlayPause();
        updateVolume();
        updateSeek();
        updateUI();
    };
    
    //------ Show / Hide -------
    
    /** @function
     * @desc Show a UI item: 'play', 'restart', 'next', 'quality', 'fullscreen', 'controls', 'loading', 'logo'
     * @param {String} id - the name of the item
     * @example player.UI.show('next');
     */
    this.show = function(id){
        switch(id){
            case 'play': btnPlay.style.display = "block"; break;
            case 'restart': btnRestart.style.display = "block"; break;
            case 'next': btnNext.style.display = "block"; break;
            case 'seek': seekCtrl.style.display = "block"; break;
            case 'quality': qualityCombo.style.display = "block"; break;
            case 'fullscreen': btnFullScreen.style.display = "block"; break;
            case 'controls' : control.style.display = "block"; break;
            case 'loading': this.hideSwitchLoading = false; break;
            case 'warning': this.hideWarning = false; break;
            case 'logo': this.hideLogo = false; break;
            default: break;
        }
    };
    
    /** @function
     * @desc Hide a UI item: 'play', 'restart', 'next', 'quality', 'fullscreen', 'controls', 'loading', 'logo'
     * @param {String} id - the name of the item
     * @example player.UI.hide('logo');
     */
    this.hide = function(id){
        switch(id){
            case 'play': btnPlay.style.display = "none"; break;
            case 'restart': btnRestart.style.display = "none"; break;
            case 'next': btnNext.style.display = "none"; break;
            case 'seek': seekCtrl.style.display = "none"; break;
            case 'quality': qualityCombo.style.display = "none"; break;
            case 'fullscreen': btnFullScreen.style.display = "none"; break;
            case 'controls' : control.style.display = "none"; break;
            case 'loading': this.hideSwitchLoading = true; break;
            case 'warning': this.hideWarning = true; break;
            case 'logo': this.hideLogo = true; break;
            default: break;
        }
    };
    
    /** @function
     * @desc Show or hide a UI item
     * @param {String} id - the name of the item
     * @param {Bool} show - show/hide
     *  @example player.UI.showHide('controls', false);
     */
    this.showHide = function(id, show){
        if(show)
            this.show(id);
        else
            this.hide(id);
    };
    
    /** @function
     * @desc True if controls are hidden
     * @return {Bool} 
     */
    this.isHidden = function(){
        return (control.style.display !== "block");
    };
    
    this.controls = control;

    //---- Initialisation ----
    setVolume(0, player.volume);
};

/** @class
 * @desc For easy Paypal payments
 * @memberof Zenterac
 * @param {string} merchant - Merchant email or ID
 * @param {string} productName - Product name
 * @param {Zenterac.Session} session - A session is required (May use player.session)
 */
Zenterac.Paypal = function(merchant, productName, session){
    
    if(!merchant || typeof merchant !== "string")
        throw "Must provide merchant email or ID";
    
    if(!productName || typeof merchant !== "string")
        throw "Must provide product name";

    if(!session || !(session instanceof Zenterac.Session))
        throw "Must provide a session: Zenterac.Session";

    /** @type {string}
     * @desc Unique id of transaction */    
    this.token = null;
    
    /** @type {string}
     * @desc Merchant email or ID */    
    this.merchant = merchant;
    
    /** @type {string}
     * @desc Product name */    
    this.product = productName;
    
    /** @type {Zenterac.Session}
     * @desc The session */    
    this.session = session;
    
    /** @type {boolean}
     * @desc If true, will be in sandbox mode (for test payments), else in production mode */    
    this.sandbox = false;
    
    /** @type {string}
     * @desc Transaction type (purchase, donation) *NOT SUPPORTED YET* */    
    this.type = null;
    
    /** @type {number}
     * @desc Merchant email or ID */    
    this.quantity = 1.0;
    
    /** @type {number}
     * @desc Merchant email or ID */    
    this.amount = 1.0;
    
    /** @type {string}
     * @desc Currency code (USD, CAD, EUR, GBP, ...) */    
    this.currency = 'USD';
    
    /** @type {number}
     * @desc Shipping cost */    
    this.shipping = 0.0;
    
    /** @type {number}
     * @desc Tax amount */    
    this.tax = 0.0;
    
    /** @type {bool}
     * @readonly
     * @desc true if the transaction has been authorized and completed */
    this.completed = false;
    
    /** @type {function}
     * @desc Redirect user to Paypal and proceed to checkout */  
    this.submit = function(){
        
        var proto = window.location.protocol === "https:" ? "https" : "http";
        
        var data = {};
        data.type = this.type;
        data.business = this.merchant;
        data.item_name = this.product;
        data.currency_code = this.currency;
        data.quantity = this.quantity;
        data.amount = this.amount;
        data.shipping = this.shipping;
        data.tax = this.tax;
        data.custom = this.session.token + ":" + this.uid;
        data.returnUrl  = proto + ":" + this.session.getLink() + "/paypal/?a=return&s=" + this.session.token;
        data.cancelUrl  = proto + ":" + this.session.getLink() + "/paypal/?a=cancel&s=" + this.session.token;
        data.sandbox = this.sandbox;
        
        var paypalUrl = "https://www.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=";
        if(this.sandbox){
            paypalUrl = "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=";
        }
        
        if(ZUtils.Browser.IsMobile()){
            //Return to current page
            data.returnUrl += "&r=" + encodeURI(window.location.href);
            data.cancelUrl += "&r=" + encodeURI(window.location.href);
        }else{
            //Close popup
            data.returnUrl += "&r=" + encodeURI(this.session.getLink() + "/paypal/?a=close");
            data.cancelUrl += "&r=" + encodeURI(this.session.getLink() + "/paypal/?a=close");
        }
        
        var paypal = this;
        var dataStr = JSON.stringify(data);
        
        ZUtils.AjaxPost(paypal.session.getLink() + "/paypal/?a=express-checkout&s=" + paypal.session.token, dataStr, function(response, status){
                 
            if(status !== 200){
                throw "Paypal module only available for premium users, please visit http://zenterac.com";
            }
            
            var rData = JSON.parse(response); 
            paypal.token = rData.TOKEN;
            
            if(paypal.token){
                if(ZUtils.Browser.IsMobile()){
                    localStorage['Zenterac_Paypal_' + paypal.product] = JSON.stringify(paypal);
                    localStorage.Zenterac_Action = 'reload';
                    window.location.href = paypalUrl + paypal.token; //Change page
                }else{
                    var aW = window.screen.availWidth;
                    var aH = window.screen.availHeight;
                    var spec = 'left=' + aW/6 + ',top=' + aH/6 + ',height=' + aH*2/3 + ',width=' + aW*2/3;
                    var paypalWindow = window.open(paypalUrl + paypal.token, paypal.product, spec); //Popup
                    paypalWindow.focus();
                    Zenterac.Paypal.WaitForPopup(paypalWindow, paypal);
                }
            }
        });
        
    };
    
    this.validate = function(validateCB){
        
        var self = this;
        
        ZUtils.Ajax(this.session.getLink() + "/paypal/?a=validate&token=" + this.token + "&s=" + this.session.token, function(response){
                  
            var info = JSON.parse(response);
            
            if(info.success){
                self.completed = true;
                validateCB(self, true);
            }else{
                validateCB(self, false);
            }
        });
    };
    
};

Zenterac.Paypal.RetrieveList = [];
Zenterac.Paypal.CompletedList = [];

/** 
 * @function
 * @desc Retrieve transaction done in previous session
 * @param {string} productName - the transaction to retrieve
 * @param {function} retrieveCB - callback when the transaction is retrieve, first param is the paypal object, second is true if the transaction succeed
 * @memberof Zenterac
 */
Zenterac.Paypal.Retrieve = function(productName, retrieveCB){
    
    var paypal = null;
    
    //Create from an stringified object
    var CopyPaypal = function(p){
        
        var session = new Zenterac.Session(p.session.user, p.session.token, p.session.host);
    
        var nPay = new Zenterac.Paypal(p.merchant, p.product, session);
        nPay.type = p.type;
        nPay.token = p.token;
        nPay.sandbox = p.token;
        nPay.quantity = p.token;
        nPay.amount = p.token;
        nPay.currency = p.token;
        nPay.shipping = p.token;
        nPay.tax = p.token;
        return nPay;

    };
    
    //Save all callbacks
    Zenterac.Paypal.RetrieveList.push({name: productName, callback: retrieveCB});
    
    //Get paypal variables from previous page
    try{
        var sObj = JSON.parse(localStorage['Zenterac_Paypal_' + productName]);
        if(sObj.token && sObj.merchant && sObj.session){
            paypal = CopyPaypal(sObj);
        }
    }catch(e){}
    
    //Valid completed transation
    if(paypal){
        paypal.validate(function(pObj, isSuccess){
            localStorage.removeItem('Zenterac_Paypal_' + productName);
            Zenterac.Paypal.CompletedList.push({obj: pObj, success: isSuccess, callback: retrieveCB});
        });
    }
    
};

Zenterac.Paypal.StartRetrieve = function(){
    
    //Call all saved callbacks
    for(var i=0; i<Zenterac.Paypal.CompletedList.length; i++){
        var item = Zenterac.Paypal.CompletedList[i];
        item.callback(item.obj, item.success);
    }
    
    //Clear retrieve list
    Zenterac.Paypal.CompletedList = [];
};

//Valid one paypal object and start callbacks
Zenterac.Paypal.ValidAndStart = function(paypal){
    paypal.validate(function(pObj, isSuccess){
        for(var i=0; i<Zenterac.Paypal.RetrieveList.length; i++){
            var elem = Zenterac.Paypal.RetrieveList[i];
            if(elem.name === pObj.product){
                elem.callback(pObj, isSuccess);
            }
        }
    });
};

Zenterac.Paypal.WaitForPopup = function(popup, paypal){
    var paypalInt = setInterval(function() {
        if (popup.closed) {
            clearInterval(paypalInt);
            Zenterac.Paypal.ValidAndStart(paypal);
        }
    }, 500);
};

Zenterac.ZAPI = {};

Zenterac.ZAPI.publicKey = "-----BEGIN PUBLIC KEY-----" +
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCLAKub6LfN69BcLUyojuf32xAI" +
        "feXmXMMLPVxBQ3JrDI6raEHD31SJWSM6Om8SyIDETi/mIGIt4xJy7URfWT02C1OU" +
        "MChr1gbf9UCZLu9BD8TnMBu83Ogy8O9kEA6vu1NwDWuceCIA+oaIoerWRNaWUYuS" +
        "p/u9Lqwh3jgWLu7QZwIDAQAB" +
        "-----END PUBLIC KEY-----";

//----------------------------------------------------------------------

Zenterac.ZAPI.nonce = function(){
    var text = "";
    var length=16;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

Zenterac.ZAPI.createToken = function(user, nonce, cnonce, password){
    return Zenterac.ZAPI.Sha256(user + nonce + cnonce + password);
};

Zenterac.ZAPI.authRequest = function(url, params, user, password, postData, finishCB){
    
    //Query
    var paramQuery = "";
    for(var k in params){
        paramQuery += "&" + k + "=" + params[k];
    }
    paramQuery = paramQuery.replace("&", "?");
    
    //Callback when no post data
    var fCB = finishCB;
    var pData = postData;
    if(typeof postData === "function"){
        fCB = postData;
        pData = null;
    }
    
    //Add user
    if(!paramQuery.match(/(&|\?)u=[^&]+(&|$)/)){
        paramQuery += (paramQuery.match(/^\?/) ? "&u=" : "?u=") + user;
    }
    
    var nUrl = url + "?a=nonce&u=" + user;
    var urlPath = url.split(/[^:^\/]\//)[1] || "";
   
    Zenterac.ZAPI.ajax(nUrl, function(nResp, nStatus){
        if(nStatus === 200){
            var resData = nResp.split("\n");
            var nonce = resData[0];
            var newHost = resData[1];
            var cNonce = Zenterac.ZAPI.nonce();
            var hashPass = Zenterac.ZAPI.Sha256(password);
            var token = Zenterac.ZAPI.createToken(user, nonce, cNonce, hashPass);
            
            var aUrl = "//" + newHost + "/" + urlPath + paramQuery;
            aUrl += "&c=" + cNonce + "&t=" + token;
            Zenterac.ZAPI.ajax(aUrl, function(response, status){
                if(status === 200){
                    fCB(response, status, newHost);
                }else{
                    fCB(response, status);
                }
            }, pData);
        }else{
            fCB(nResp, nStatus);
        }
    });
};

Zenterac.ZAPI.encrypt = function(msg){
    var encrypt = new Zenterac.ZAPI.JSEncrypt();
    encrypt.setPublicKey(Zenterac.ZAPI.publicKey);
    return encrypt.encrypt(msg);
};

Zenterac.ZAPI.ajax = function(url, resCB, data){
    new ZUtils.microAjax(url, resCB, data);
};

Zenterac.ZAPI.nbScript = 0;

Zenterac.ZAPI.loadScript = function(object, url){
    Zenterac.ZAPI.nbScript++;
    var ajax = new XMLHttpRequest();
    ajax.open( 'GET', url, true ); // <-- the 'false' makes it synchronous
    ajax.onreadystatechange = function () {
        var script = ajax.response || ajax.responseText;
        if (ajax.readyState === 4) {
            switch( ajax.status) {
                case 200:
                    eval.apply( Zenterac.ZAPI, [script.replace('module.exports', object)] );
                    Zenterac.log("Script loaded: ", url);
                    break;
                default:
                    Zenterac.log("ERROR: script not loaded: ", url);
            }
            //Callback
            Zenterac.ZAPI.nbScript--;
            if(Zenterac.ZAPI.nbScript === 0){
                Zenterac.ZAPI.onReady();
            }
        }
    };
    ajax.send();
};

Zenterac.ZAPI.onReady = function(){};

Zenterac.ZAPI.init = function(initCB){
    
    Zenterac.ZAPI.loadScript("Zenterac.ZAPI.Sha256", Zenterac.server + "/lib/sha256.js");
    Zenterac.ZAPI.loadScript("Zenterac.ZAPI.JSEncrypt", Zenterac.server + "/lib/jsencrypt.js");
    
    if(typeof initCB === "function"){
        Zenterac.ZAPI.onReady = initCB;
    }
    
};



