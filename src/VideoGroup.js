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
