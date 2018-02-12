
ZUtils.IsEnum = function(aVal, aEnum){
    
    for (var key in aEnum) {
        if(aEnum[key] === aVal){
            return true;
        }
    }
    return false;
};


