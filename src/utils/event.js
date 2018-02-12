
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

