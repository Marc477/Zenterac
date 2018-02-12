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


