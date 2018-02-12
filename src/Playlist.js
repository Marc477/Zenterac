
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