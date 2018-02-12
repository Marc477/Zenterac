
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