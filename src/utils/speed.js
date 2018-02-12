
ZUtils.MeasureConnectionSpeed = function(imgLink, imgSize, loadCB) {
    
    var startTime, endTime;
    var download = new Image();
    download.onload = function () {
        endTime = (new Date()).getTime();
        
        var duration = (endTime - startTime) / 1000;
        var bitsLoaded = imgSize * 8;
        var speedBps = (bitsLoaded / duration).toFixed(2);
        var speedKbps = (speedBps / 1024).toFixed(2);
        var speedMbps = (speedKbps / 1024).toFixed(2);
        
        loadCB(speedKbps);
    };
    
    download.onerror = function (err, msg) {
        throw "Invalid image, or error downloading";
    };
    
    startTime = (new Date()).getTime();
    var cacheBuster = "&_=" + startTime;
    download.src = imgLink + cacheBuster;
};