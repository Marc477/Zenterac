
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

