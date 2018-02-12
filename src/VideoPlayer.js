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