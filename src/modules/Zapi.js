
Zenterac.ZAPI = {};

Zenterac.ZAPI.publicKey = "-----BEGIN PUBLIC KEY-----" +
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCLAKub6LfN69BcLUyojuf32xAI" +
        "feXmXMMLPVxBQ3JrDI6raEHD31SJWSM6Om8SyIDETi/mIGIt4xJy7URfWT02C1OU" +
        "MChr1gbf9UCZLu9BD8TnMBu83Ogy8O9kEA6vu1NwDWuceCIA+oaIoerWRNaWUYuS" +
        "p/u9Lqwh3jgWLu7QZwIDAQAB" +
        "-----END PUBLIC KEY-----";

//----------------------------------------------------------------------

Zenterac.ZAPI.nonce = function(){
    var text = "";
    var length=16;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

Zenterac.ZAPI.createToken = function(user, nonce, cnonce, password){
    return Zenterac.ZAPI.Sha256(user + nonce + cnonce + password);
};

Zenterac.ZAPI.authRequest = function(url, params, user, password, postData, finishCB){
    
    //Query
    var paramQuery = "";
    for(var k in params){
        paramQuery += "&" + k + "=" + params[k];
    }
    paramQuery = paramQuery.replace("&", "?");
    
    //Callback when no post data
    var fCB = finishCB;
    var pData = postData;
    if(typeof postData === "function"){
        fCB = postData;
        pData = null;
    }
    
    //Add user
    if(!paramQuery.match(/(&|\?)u=[^&]+(&|$)/)){
        paramQuery += (paramQuery.match(/^\?/) ? "&u=" : "?u=") + user;
    }
    
    var nUrl = url + "?a=nonce&u=" + user;
    var urlPath = url.split(/[^:^\/]\//)[1] || "";
   
    Zenterac.ZAPI.ajax(nUrl, function(nResp, nStatus){
        if(nStatus === 200){
            var resData = nResp.split("\n");
            var nonce = resData[0];
            var newHost = resData[1];
            var cNonce = Zenterac.ZAPI.nonce();
            var hashPass = Zenterac.ZAPI.Sha256(password);
            var token = Zenterac.ZAPI.createToken(user, nonce, cNonce, hashPass);
            
            var aUrl = "//" + newHost + "/" + urlPath + paramQuery;
            aUrl += "&c=" + cNonce + "&t=" + token;
            Zenterac.ZAPI.ajax(aUrl, function(response, status){
                if(status === 200){
                    fCB(response, status, newHost);
                }else{
                    fCB(response, status);
                }
            }, pData);
        }else{
            fCB(nResp, nStatus);
        }
    });
};

Zenterac.ZAPI.encrypt = function(msg){
    var encrypt = new Zenterac.ZAPI.JSEncrypt();
    encrypt.setPublicKey(Zenterac.ZAPI.publicKey);
    return encrypt.encrypt(msg);
};

Zenterac.ZAPI.ajax = function(url, resCB, data){
    new ZUtils.microAjax(url, resCB, data);
};

Zenterac.ZAPI.nbScript = 0;

Zenterac.ZAPI.loadScript = function(object, url){
    Zenterac.ZAPI.nbScript++;
    var ajax = new XMLHttpRequest();
    ajax.open( 'GET', url, true ); // <-- the 'false' makes it synchronous
    ajax.onreadystatechange = function () {
        var script = ajax.response || ajax.responseText;
        if (ajax.readyState === 4) {
            switch( ajax.status) {
                case 200:
                    eval.apply( Zenterac.ZAPI, [script.replace('module.exports', object)] );
                    Zenterac.log("Script loaded: ", url);
                    break;
                default:
                    Zenterac.log("ERROR: script not loaded: ", url);
            }
            //Callback
            Zenterac.ZAPI.nbScript--;
            if(Zenterac.ZAPI.nbScript === 0){
                Zenterac.ZAPI.onReady();
            }
        }
    };
    ajax.send();
};

Zenterac.ZAPI.onReady = function(){};

Zenterac.ZAPI.init = function(initCB){
    
    Zenterac.ZAPI.loadScript("Zenterac.ZAPI.Sha256", Zenterac.server + "/lib/sha256.js");
    Zenterac.ZAPI.loadScript("Zenterac.ZAPI.JSEncrypt", Zenterac.server + "/lib/jsencrypt.js");
    
    if(typeof initCB === "function"){
        Zenterac.ZAPI.onReady = initCB;
    }
    
};



