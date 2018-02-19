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
Zenterac.version = "2.01";

/**
 * Server hosting the videos
 * @type String
 */
//Zenterac.server = "//api.dev.zenterac.com";
Zenterac.server = "//api.zenterac.com";


/** @function create
 * @memberof Zenterac
 * @desc Main function to create a new video player
 * @param {string} divID - The ID of the div where the video will be displayed
 * @return {Zenterac.VideoPlayer} A VideoPlayer
 * @example Zenterac.create('demo', 'vframe');
 */
Zenterac.create = function(divID, user){
    
    //Check input
    if( divID && typeof divID !== "string" && typeof divID !== "object" )
        throw "First parameter of Zenterac.create must be a string or div";
    
    var aDiv = divID || "";
    var aUser = user || null;
    
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