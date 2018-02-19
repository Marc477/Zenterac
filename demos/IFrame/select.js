var Playlist = Zenterac.Playlist;
var Video = Zenterac.Video;
var VideoGroup = Zenterac.VideoGroup;

var item = 0;
var color = 0;

var nbKnife=0, nbPencil=0, nbUku=0, nbCamel=0;
var nbOrange=0, nbWhite=0, nbBlue=0, nbGreen=0;

window.onload = function() {

    //Retrieve stats from storage
    nbKnife=parseInt(localStorage['zen_select_nbKnife']) || 0; nbPencil=parseInt(localStorage['zen_select_nbPencil']) || 0; 
    nbUku=parseInt(localStorage['zen_select_nbUku']) || 0; nbCamel=parseInt(localStorage['zen_select_nbCamel']) || 0;
    nbOrange=parseInt(localStorage['zen_select_nbOrange']) || 0; nbWhite=parseInt(localStorage['zen_select_nbWhite']) || 0; 
    nbBlue=parseInt(localStorage['zen_select_nbBlue']) || 0; nbGreen=parseInt(localStorage['zen_select_nbGreen']) || 0;
    
    //Init player
    Zenterac.maxSegments = 4;
    var player = Zenterac.create( 'vframe' );
    player.autoplay = false;
    player.UI.hide('next');
    player.UI.show('loading');
    player.favoriteQuality = 360;
    
    //Media host
    var media_host = "http://zenterac.madesbiens.ca/media/";
    
    //Videos
    var loop = new Video('select_loop2', {playMode:"loop", url: media_host + "select/Intro2.mp4"});
    var loopColor = new Video('select_loop_color2', {playMode:"loop", url: media_host + "select/Color2.mp4"});
    
    var knifeOrange = new Video('select_knife_orange', {url: media_host + "select/KnifeOrange.mp4"});
    var knifeWhite = new Video('select_knife_white', {url: media_host + "select/KnifeWhite.mp4"});
    var knifeBlue = new Video('select_knife_blue', {url: media_host + "select/KnifeBlue.mp4"});
    var knifeGreen = new Video('select_knife_green', {url: media_host + "select/KnifeGreen.mp4"});
    
    var pencilOrange = new Video('select_pen_orange', {url: media_host + "select/PenOrange.mp4"});
    var pencilWhite = new Video('select_pen_white', {url: media_host + "select/PenWhite.mp4"});
    var pencilBlue = new Video('select_pen_blue', {url: media_host + "select/PenBlue.mp4"});
    var pencilGreen = new Video('select_pen_green', {url: media_host + "select/PenGreen.mp4"});
    
    var ukuleleOrange = new Video('select_ukulele_orange', {url: media_host + "select/GuitOrange.mp4"});
    var ukuleleWhite = new Video('select_ukulele_white', {url: media_host + "select/GuitWhite.mp4"});
    var ukuleleBlue = new Video('select_ukulele_blue', {url: media_host + "select/GuitBlue.mp4"});
    var ukuleleGreen = new Video('select_ukulele_green', {url: media_host + "select/GuitGreen.mp4"});
    
    var camelOrange = new Video('select_camel_orange', {url: media_host + "select/CamelOrange.mp4"});
    var camelWhite = new Video('select_camel_white', {url: media_host + "select/CamelWhite.mp4"});
    var camelBlue = new Video('select_camel_blue', {url: media_host + "select/CamelBlue.mp4"});
    var camelGreen = new Video('select_camel_green', {url: media_host + "select/CamelGreen.mp4"});
    
    //Groups
    var knifeGroup = new VideoGroup(knifeOrange, knifeWhite, knifeBlue, knifeGreen);
    var pencilGroup = new VideoGroup(pencilOrange, pencilWhite, pencilBlue, pencilGreen);
    var ukuleleGroup = new VideoGroup(ukuleleOrange, ukuleleWhite, ukuleleBlue, ukuleleGreen);
    var camelGroup = new VideoGroup(camelOrange, camelWhite, camelBlue, camelGreen);
    var itemGroup = new VideoGroup(knifeGroup, pencilGroup, ukuleleGroup, camelGroup);
    
    var buttonZone1 = document.getElementById('buttons');
    var buttonZone2 = document.getElementById('buttons2');
    buttonZone1.style.display = "none";
    buttonZone2.style.display = "none";
    
    //Fired when a new session is created or when the player restart
    player.on('start', function(){
        player.play(loop);
    });
    
    //Hide and show beer links
    player.on('next', function(nVid){
        buttonZone1.style.display = (nVid === loop.id) ? "block" : "none";
        buttonZone2.style.display = (nVid === loopColor.id) ? "block" : "none";
        
        //Update people clicks counter
        var vIDList = ['vKnife', 'vPencil', 'vUkulele', 'vCamel', 'vOrange', 'vWhite', 'vBlue', 'vGreen'];
        var cIDList = ['cKnife', 'cPencil', 'cUkulele', 'cCamel', 'cOrange', 'cWhite', 'cBlue', 'cGreen'];
        var nbList = [nbKnife, nbPencil, nbUku, nbCamel, nbOrange, nbWhite, nbBlue, nbGreen];
        
        for(var i=0; i<nbList.length; i++){
            document.getElementById(vIDList[i]).innerHTML = nbList[i];
            document.getElementById(cIDList[i]).style.display = (nbList[i]) ? "block" : "none";
        }
    });
    
    player.onTime('', 1, function(vidID){
        if(vidID === loop.id)
            player.preload(loopColor);
        if(vidID !== loop.id && vidID !== loopColor.id)
            player.append(loop);
    });
    
    player.on('end', function(nVid){
        player.restart();
    });
    
    function SetNextVideo(){
        var currentVid = player.getCurrentVideo().id;
        var nextVid = "";
        
        if(currentVid === loop.id){
            nextVid = loopColor;
        }
        else{
            var colorGroup = itemGroup.at(item);
            nextVid = colorGroup.at(color);
        }
        
        if(nextVid){
            player.replace(nextVid);
            player.next();
        }
    }
    
    //Buttons
    document.getElementById("knife").onclick = function(){ item = 0; nbKnife++; SetNextVideo(); };
    document.getElementById("pencil").onclick = function(){ item = 1; nbPencil++; SetNextVideo(); };
    document.getElementById("ukulele").onclick = function(){ item = 2; nbUku++; SetNextVideo(); };
    document.getElementById("camel").onclick = function(){ item = 3; nbCamel++; SetNextVideo(); };
    document.getElementById("orange").onclick = function(){ color = 0; nbOrange++; SetNextVideo(); };
    document.getElementById("white").onclick = function(){ color = 1; nbWhite++; SetNextVideo(); };
    document.getElementById("blue").onclick = function(){ color = 2; nbBlue++; SetNextVideo(); };
    document.getElementById("green").onclick = function(){ color = 3; nbGreen++; SetNextVideo(); };
    
    // Update Log
    player.on('timeupdate', function(){
        //document.getElementById("log").innerHTML = "Log: " + player.getCurrentVideo().id + " " + player.currentTime.toFixed(2) + "/" + player.duration.toFixed(0);
    });
    
    setInterval(function(){
       // document.getElementById("log2").innerHTML = Zenterac.GetLastLog();
    }, 400);
};

window.onunload = function() {
    //Save stats to storage
    localStorage['zen_select_nbKnife']=nbKnife; localStorage['zen_select_nbPencil']=nbPencil; 
    localStorage['zen_select_nbUku']=nbUku; localStorage['zen_select_nbCamel']=nbCamel;
    localStorage['zen_select_nbOrange']=nbOrange; localStorage['zen_select_nbWhite']=nbWhite; 
    localStorage['zen_select_nbBlue']=nbBlue; localStorage['zen_select_nbGreen']=nbGreen;
}