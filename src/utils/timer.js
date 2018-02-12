
ZUtils.Timer = {
    
    //Start timer
    Start: function(){
        return (new Date()).getTime();
    },
    
    Get: function(timestamp, precision){
        var preci = !isNaN(precision) ? precision : 3; // 3 decimal places
        var elapsed = ((new Date()).getTime() - timestamp).toFixed(preci); 
        return elapsed;
    }
 
};