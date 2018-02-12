
ZUtils.IDList = [];

//length: size of uid, Max: 100
ZUtils.GenUID = function(length)
{
    if(isNaN(length) || length < 0)
        throw "Length must be a number";
    
    var aLenght = Math.min(length, 100);
    
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    
    var uid = null;
    while(!uid || ZUtils.IDList.indexOf(uid) !== -1){
        uid = (s4() + s4() + s4() + s4() + s4() + s4() + s4()).substring(0, aLenght);
    }
      
    ZUtils.IDList.push(uid);
    return uid;
};