
/** @class
 * @desc Video controls UI, access with player.UI
 * @memberof Zenterac
 * @example var player = Zenterac.create('demo','vframe'); <br/> var UI = player.UI;
 */
Zenterac.Controls = function(player){
    
    var control = document.createElement('div');
    control.className = "zen_ctrl_control";
    control.style.display = "block";
    control.style.height = "0";
    control.innerHTML = '<div class="zen_ctrl_topControl">' +
                    '<div class="zen_ctrl_progress"><span class="zen_ctrl_bufferBar"></span><span class="zen_ctrl_timeBar"></span></div>' +
                    '<div class="zen_ctrl_time"><span class="zen_ctrl_current"></span> / <span class="zen_ctrl_duration"></span></div>' +
                    '</div>';
     
    var btmControl =  document.createElement('div');
    btmControl.className = "zen_ctrl_btmControl";
    btmControl.style.display = "none";
    control.appendChild(btmControl);
    
    var btnPlay =  document.createElement('div');
    btnPlay.className = "zen_ctrl_btnPlay zen_ctrl_btn";
    btnPlay.title = "Play/Pause video";
    btmControl.appendChild(btnPlay);
    
    var btnRestart =  document.createElement('div');
    btnRestart.className = "zen_ctrl_btnRestart zen_ctrl_btn";
    btnRestart.title = "Restart playlist";
    btnRestart.style.display = "block";
    btmControl.appendChild(btnRestart);
    
    var btnNext =  document.createElement('div');
    btnNext.className = "zen_ctrl_btnNext zen_ctrl_btn";
    btnNext.title = "Next video";
    btnNext.style.display = "none";
    btmControl.appendChild(btnNext);
    
    var seekCtrl =  document.createElement('div');
    seekCtrl.className = "zen_ctrl_seek";
    seekCtrl.title = "Set time";
    seekCtrl.style.display = "none";
    btmControl.appendChild(seekCtrl);
    
    var seekBar =  document.createElement('span');
    seekBar.className = "zen_ctrl_seekBar";
    seekCtrl.appendChild(seekBar);
    
    var btnFullScreen =  document.createElement('div');
    btnFullScreen.className = "zen_ctrl_btnFS zen_ctrl_btn";
    btnFullScreen.title = "Toggle Fullscreen";
    btnFullScreen.style.display = "block";
    btmControl.appendChild(btnFullScreen);
    
    var qualityCombo =  document.createElement('select');
    qualityCombo.className = "zen_ctrl_quality";
    qualityCombo.title = "Select video quality";
    qualityCombo.innerHTML = "";
    btmControl.appendChild(qualityCombo);
    
    var volumeCtrl =  document.createElement('div');
    volumeCtrl.className = "zen_ctrl_volume";
    volumeCtrl.title = "Set volume";
    btmControl.appendChild(volumeCtrl);
    
    var volumeBar =  document.createElement('span');
    volumeBar.className = "zen_ctrl_volumeBar";
    volumeCtrl.appendChild(volumeBar);
    
    var btnMute =  document.createElement('div');
    btnMute.className = "zen_ctrl_sound zen_ctrl_sound2 zen_ctrl_btn";
    btnMute.title = "Mute/Unmute sound";
    btmControl.appendChild(btnMute);
      
    //-----Player callbacks -----
    player.on('ready', function(){
        control.style.height = "30px";
        btmControl.style.display = "block";
    });
    
    // ----- Controls ---------
    //CONTROLS Buttons
    var TogglePlayPause = function(){
        if(player.paused) {
            player.play();
        }
        else {
            player.pause();
        }
        updatePlayPause();
    };
    
    btnPlay.onclick = function(){
        TogglePlayPause();
    };
    
    /** @function
     * @desc The event used to play/pause on space bar keypress
     * @example You can remove this event with: document.removeEventListener("keypress", player.UI.spaceEvent);
     */
    this.spaceEvent = function(e){
        if(e.keyCode === 32 && control.style.display === "block"){
            TogglePlayPause();
            e.preventDefault();
            return false;
        }
    };
    
    document.addEventListener("keypress", this.spaceEvent);
    
    btnRestart.onclick = function(){
        player.restart();
    };
    
    btnNext.onclick = function(){
        player.next();
    };
    
    btnFullScreen.onclick = function(){
        player.toggleFullScreen();
    };
    
    //VOLUME BAR
    var volumeDrag = false;
    volumeCtrl.onmousedown = function(e) {
        volumeDrag = true;
        btnMute.className = btnMute.className.replace( /(?:^|\s)zen_ctrl_muted(?!\S)/g , '');
        setVolume(e.pageX);
    };
    volumeCtrl.onmouseup = function(e) {
        if(volumeDrag) {
            volumeDrag = false;
            setVolume(e.pageX);
        }
    };
    volumeCtrl.onmousemove = function(e) {
        if(volumeDrag) {
            setVolume(e.pageX);
        }
    };
    volumeCtrl.onmouseleave = function(e){
        volumeDrag = false;
    };
    
    var previousSound = 0;
    btnMute.onclick = function() {
        if(!btnMute.className.match(/(?:^|\s)zen_ctrl_muted(?!\S)/)){
            previousSound = player.volume;
            setVolume(0, 0);
        }
        else{
            setVolume(0, previousSound);
        }
    };
    
    //Seeking BAR
    var seekDrag = false;
    seekCtrl.onmousedown = function(e) {
        seekDrag = true;
    };
    seekCtrl.onmouseup = function(e) {
        if(seekDrag) {
            seekDrag = false;
            setSeek(e.pageX);
        }
    };
    seekCtrl.onmouseleave = function(e){
        seekDrag = false;
    };
    
    //Quality control
    for(var q in Zenterac.VideoQuality){
        var option = document.createElement('option');
        option.value = Zenterac.VideoQuality[q];
        option.text = (Zenterac.VideoQuality[q] > 0) ? Zenterac.VideoQuality[q] + "p" : "Auto";
        qualityCombo.add(option);
    }
    
    var qualityNoEvent = false;
    qualityCombo.onchange = function(){
        if(!qualityNoEvent){
            player.favoriteQuality = qualityCombo.value;
            player.refresh();
        }
    };
    
    //---- Setters ---------------
    var getAbsPosition = function(el){
        var el2 = el;
        var curtop = 0;
        var curleft = 0;
        if (document.getElementById || document.all) {
            do  {
                curleft += el.offsetLeft-el.scrollLeft;
                curtop += el.offsetTop-el.scrollTop;
                el = el.offsetParent;
                el2 = el2.parentNode;
                while (el2 !== el) {
                    curleft -= el2.scrollLeft;
                    curtop -= el2.scrollTop;
                    el2 = el2.parentNode;
                }
            } while (el.offsetParent);

        } else if (document.layers) {
            curtop += el.y;
            curleft += el.x;
        }
        return {top:curtop, left:curleft};
    };
    
    var volume;
    var setVolume = function(x, vol) {

        var percentage;
        if(vol || vol === 0) {
            percentage = vol * 100;
        }
        else {
            var position = x - getAbsPosition(volumeCtrl).left;
            percentage = 100 * position / volumeCtrl.clientWidth;
        }

        percentage = Math.min(percentage, 100);
        percentage = Math.max(percentage, 0);

        volume = percentage / 100;
        player.volume = percentage / 100;

        updateVolume();
    };
    
    var setSeek = function(x){
        var position = x - getAbsPosition(seekCtrl).left;
        var percentage = 100 * position / seekCtrl.clientWidth;
        percentage = Math.min(percentage, 100);
        percentage = Math.max(percentage, 0);
        
        player.seek(player.duration * percentage / 100);
        updateSeek();
    };
    
    //--------- Update UI function ---------
    var updatePlayPause = function(){
        if(player.paused) {
            btnPlay.className = btnPlay.className.replace( /(?:^|\s)zen_ctrl_paused(?!\S)/g , '');
        }
        else if(btnPlay.className.indexOf('zen_ctrl_paused') === -1){
            btnPlay.className += ' zen_ctrl_paused';
        }
    };
    
    var updateVolume = function() {
        
        var percentage = volume * 100;
        volumeBar.style.width = percentage + '%';
        
        //change sound icon based on volume
        var muteClass = btnMute.className;
        if(volume === 0){
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_muted(?!\S)/g , '');
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_sound2(?!\S)/g , '');
            muteClass += " zen_ctrl_muted";
        }
        else if(volume > 0.5){
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_muted(?!\S)/g , '');
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_sound2(?!\S)/g , '');
            muteClass += " zen_ctrl_sound2";
        }
        else{
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_muted(?!\S)/g , '');
            muteClass = muteClass.replace( /(?:^|\s)zen_ctrl_sound2(?!\S)/g , '');
        }
        
        //Change it
        if(muteClass !== btnMute.className){
            btnMute.className = muteClass;
        }
        
        //Responsive size
        if(player.width > 480){
            volumeCtrl.style.display = "block";
        }else{
            volumeCtrl.style.display = "none";
        }
    };
    
    var updateSeek = function(){
        if(player.duration > 0){
            var percentage = player.currentTime * 100 / player.duration;
            seekBar.style.width = percentage + '%';
        }else{
            seekBar.style.width = '0%';
        }
        
        //Responsive size
        if(player.width > 850){
            seekCtrl.style.width = "60%";
        }
        else if(player.width > 700){
            seekCtrl.style.width = "50%";
        }
        else if(player.width > 600){
            seekCtrl.style.width = "40%";
        }
        else if(player.width > 500){
            seekCtrl.style.width = "30%";
        }
        else if(player.width > 400){
            seekCtrl.style.width = "20%";
        }
    };
    
    var updateUI = function(){
        
        //Quality combo box
        if(qualityCombo.value !== player.favoriteQuality){
           qualityNoEvent = true;
           qualityCombo.value = player.favoriteQuality;
           qualityNoEvent = false;
        }
        
        //Full screen button
        if(ZUtils.Browser.IsFullScreenSupported()){
            var fsClass = btnFullScreen.className;
            if(player.isFullScreen){
                fsClass = fsClass.replace('zen_ctrl_btnFS', 'zen_ctrl_btnRS');
            }else{
                fsClass = fsClass.replace('zen_ctrl_btnRS', 'zen_ctrl_btnFS');
            }

            if(fsClass !== btnFullScreen.className){
                btnFullScreen.className = fsClass;
            }
        }else{
            //FullScreen is not supported, hide button
            if(btnFullScreen.style.display === "block"){
                btnFullScreen.style.display = "none";
            }
        }
    };
    
    this.hideSwitchLoading = false;
    this.hideWarning = true;
    this.hideLogo = false;
    
    /** @type {bool}
     * @name overlay
     * @desc If set to true, control bar will overlay video
     * @memberOf Zenterac.Controls
     * @instance
     * @example player.UI.overlay = true;
     */
    this.__defineSetter__("overlay", function(val){
        control.style.bottom = (val) ? "0px" : "";
    });
    
    this.__defineGetter__("overlay", function(){
        return (control.style.bottom === "0px");
    });
    
    this.update = function(){
        updatePlayPause();
        updateVolume();
        updateSeek();
        updateUI();
    };
    
    //------ Show / Hide -------
    
    /** @function
     * @desc Show a UI item: 'play', 'restart', 'next', 'quality', 'fullscreen', 'controls', 'loading', 'logo'
     * @param {String} id - the name of the item
     * @example player.UI.show('next');
     */
    this.show = function(id){
        switch(id){
            case 'play': btnPlay.style.display = "block"; break;
            case 'restart': btnRestart.style.display = "block"; break;
            case 'next': btnNext.style.display = "block"; break;
            case 'seek': seekCtrl.style.display = "block"; break;
            case 'quality': qualityCombo.style.display = "block"; break;
            case 'fullscreen': btnFullScreen.style.display = "block"; break;
            case 'controls' : control.style.display = "block"; break;
            case 'loading': this.hideSwitchLoading = false; break;
            case 'warning': this.hideWarning = false; break;
            case 'logo': this.hideLogo = false; break;
            default: break;
        }
    };
    
    /** @function
     * @desc Hide a UI item: 'play', 'restart', 'next', 'quality', 'fullscreen', 'controls', 'loading', 'logo'
     * @param {String} id - the name of the item
     * @example player.UI.hide('logo');
     */
    this.hide = function(id){
        switch(id){
            case 'play': btnPlay.style.display = "none"; break;
            case 'restart': btnRestart.style.display = "none"; break;
            case 'next': btnNext.style.display = "none"; break;
            case 'seek': seekCtrl.style.display = "none"; break;
            case 'quality': qualityCombo.style.display = "none"; break;
            case 'fullscreen': btnFullScreen.style.display = "none"; break;
            case 'controls' : control.style.display = "none"; break;
            case 'loading': this.hideSwitchLoading = true; break;
            case 'warning': this.hideWarning = true; break;
            case 'logo': this.hideLogo = true; break;
            default: break;
        }
    };
    
    /** @function
     * @desc Show or hide a UI item
     * @param {String} id - the name of the item
     * @param {Bool} show - show/hide
     *  @example player.UI.showHide('controls', false);
     */
    this.showHide = function(id, show){
        if(show)
            this.show(id);
        else
            this.hide(id);
    };
    
    /** @function
     * @desc True if controls are hidden
     * @return {Bool} 
     */
    this.isHidden = function(){
        return (control.style.display !== "block");
    };
    
    this.controls = control;

    //---- Initialisation ----
    setVolume(0, player.volume);
};