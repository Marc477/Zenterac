
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