
/** @function 
 * @memberof ZUtils
 * @desc Send ajax get request
 * @param {type} aUrl - the url
 * @param {type} succesCB - success callback
 */
ZUtils.Ajax = function(aUrl, succesCB)
{
    if(!aUrl)
        return;
    
    //Add cache buster
    var startTime = (new Date()).getTime();
    var cacheBuster = "&_=" + startTime;
    aUrl += cacheBuster;
    
    //Call ajax
    new ZUtils.microAjax(aUrl, function(msg, status){
        if (typeof succesCB === "function") {
            succesCB(msg, status);
        }
    });
};

/** @function 
 * @memberof ZUtils
 * @desc Send ajax post request
 * @param {type} aUrl - the url
 * @param {type} aData - post data
 * @param {type} succesCB - success callback
 */
ZUtils.AjaxPost = function(aUrl, aData, succesCB)
{
    if(!aUrl)
        return;
    
    //Add cache buster
    var startTime = (new Date()).getTime();
    var cacheBuster = "&_=" + startTime;
    aUrl += cacheBuster;
    
    //Call ajax
    new ZUtils.microAjax(aUrl, function(msg, status){
        if (typeof succesCB === "function") {
            succesCB(msg, status);
        }
    }, aData);
};


//Post in new tab
ZUtils.Post = function(aUrl, aData, target)
{
    var form = document.createElement("form");
    form.method = "POST";
    form.action = aUrl;   
    form.target = target || "_top";

    for(var key in aData){
        var elem = document.createElement("input");
        elem.name = key;
        elem.value = aData[key];
        form.appendChild(elem);  
    }
    
    form.submit();
};

ZUtils.SerializePost = function(data){
    var str = [];
    for(var p in data)
      if (data.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
      }
    return str.join("&"); 
};