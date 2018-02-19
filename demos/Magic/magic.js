var Playlist = Zenterac.Playlist;
var Video = Zenterac.Video;
var PlayMode = Zenterac.PlayMode;

window.onload = function() {

    Zenterac.maxSegments = 4;
    var player = Zenterac.create( 'vframe' );
    player.UI.show('next');
    player.UI.hide('loading');
    
    //Interactive video
    var video_host = "http://zenterac.madesbiens.ca/media/";
    var intro = new Video("mIntro", {url: video_host + "magic/mIntro.mp4"});
    var loop = new Video('mLoop', {duration: 12, url: video_host + "magic/mLoop.mp4"});
    var choix1 = new Video("mChoix1", {url: video_host + "magic/mChoix1.mp4"});
    var choix2 = new Video("mChoix2", {url: video_host + "magic/mChoix2.mp4"});
    var choix3 = new Video("mChoix3", {url: video_host + "magic/mChoix3.mp4"});
    
    //Fired when a new session is created or when the player restart
    player.on('start', function(){
        var playlist = new Playlist();
        playlist.add(intro);
        player.play(playlist);
        
        var playlistLoop = new Playlist({playMode: "loop"});
        playlistLoop.add(loop);
        player.append(playlistLoop);
    });
    
    //Fired when player is ready, no matter if it is a new session or session reload
    player.on('ready', function(){
        ZUtils.hide( document.getElementById("buttons") );
    });
    
    player.onTime("mLoop", 1, function(){
        ZUtils.show( document.getElementById("buttons") );
        player.preload(choix1);
        player.preload(choix2);
        player.preload(choix3);
    });
    
    player.onTime("mLoop", 5, function(){
        //player.append(loop);
    });
    
    document.getElementById("c1").onclick = function(){
        ZUtils.hide( document.getElementById("buttons") );
        player.replaceNow(choix1);
    };
    
    document.getElementById("c2").onclick = function(){
        ZUtils.hide( document.getElementById("buttons") );
        player.replaceNow(choix2);
    };
    
    document.getElementById("c3").onclick = function(){
        ZUtils.hide( document.getElementById("buttons") );
        player.replaceNow(choix3);
    };
    
    // Update Log
    player.on('timeupdate', function(){
        //document.getElementById("log").innerHTML = "Log: " + player.getCurrentVideo().id + " " + player.currentTime.toFixed(2) + "/" + player.duration.toFixed(0);
    });
    
    player.on('end', function(){
       //On end action
    });
};