# Zenterac
HTML5 Interactive Video Player

Zenterac is an open-source interactive video player that allows you to create customized interactive projects. It can be easily integrated on your websites. Projects are built using html, javascript and the zenterac api.

## Project built with Zenterac
Here is a interactive story made with Zenterac
http://suitcasestory.ca/

## Learn how to create your project

Download the repo (or just the dist and demos folders if you dont need to change the core).
Then, visit: http://zenterac.madesbiens.ca/ to learn how to create your first Zenterac project.

## Useful variables and methods

### Video Player
```
var player = Zenterac.create( 'vframe' ); 
```

**Play/Pause player**
```
player.play();
player.pause();
player.play(video);
```

**How to start the player**
```
var player = Zenterac.create( 'vframe' );
var bunny = new Zenterac.Video('bunny', {url: "/bunny.mp4"});
player.on('start', function(){
    player.play(bunny);
});
```

**Autoplay when page load**
```
player.autoplay = true;
```

**Set volume between 0 and 1**
```
player.volume = 1.0;
```

**Use multiSegments.** Player will use multiple buffers to store loaded videos. Uses more memory and CPU but makes transitions shorter.  Default: true except safari and IOS
```
player.useMultiSegment = true;
```

**Make transitions even faster.** Player will load multiple video at the same time, but uses more CPU and bandwitdh. multiSegments required. Default: true except on mobile devices.
```
player.usePreloading = true;
```

**List of readonly members:**
```
player.currentTime
player.duration
player.paused
player.height
player.width
```

**List of events:**  
init  
ready  
start  
restart  
switch  
timeupdate  
end  

```
player.on('start', function(){
    player.play(playlist);
});
```

### Show/hide UI
List of UI to show/hide  
"play", "restart", "next", "seek", "fullscreen", "controls", "loading", "logo"
```
player.UI.show('next');
```

### Video
```
var bunny = new Zenterac.Video('bunny', {...options...});
var bunny = new Zenterac.Video('bunny', {start: 5, duration: 12, url: video_host + "bunny.mp4"});
```

**List of video options**  
url: url of the video (required)  
start: start time in seconds  
duration: video duration  
playMode: ("all", "seen", "unseen" or "loop"), "loop" is great for looping on a video while waiting for user input  

### Playlist
```
var playlist = new Zenterac.Playlist(video1, video2, video3);
player.play(playlist);
```

## Demos
Check our demos to get started faster on your project!
http://zenterac.madesbiens.ca/

## More to come
More information on how to use it will be added here soon.
