
/** @class
 * @desc For easy Paypal payments
 * @memberof Zenterac
 * @param {string} merchant - Merchant email or ID
 * @param {string} productName - Product name
 * @param {Zenterac.Session} session - A session is required (May use player.session)
 */
Zenterac.Paypal = function(merchant, productName, session){
    
    if(!merchant || typeof merchant !== "string")
        throw "Must provide merchant email or ID";
    
    if(!productName || typeof merchant !== "string")
        throw "Must provide product name";

    if(!session || !(session instanceof Zenterac.Session))
        throw "Must provide a session: Zenterac.Session";

    /** @type {string}
     * @desc Unique id of transaction */    
    this.token = null;
    
    /** @type {string}
     * @desc Merchant email or ID */    
    this.merchant = merchant;
    
    /** @type {string}
     * @desc Product name */    
    this.product = productName;
    
    /** @type {Zenterac.Session}
     * @desc The session */    
    this.session = session;
    
    /** @type {boolean}
     * @desc If true, will be in sandbox mode (for test payments), else in production mode */    
    this.sandbox = false;
    
    /** @type {string}
     * @desc Transaction type (purchase, donation) *NOT SUPPORTED YET* */    
    this.type = null;
    
    /** @type {number}
     * @desc Merchant email or ID */    
    this.quantity = 1.0;
    
    /** @type {number}
     * @desc Merchant email or ID */    
    this.amount = 1.0;
    
    /** @type {string}
     * @desc Currency code (USD, CAD, EUR, GBP, ...) */    
    this.currency = 'USD';
    
    /** @type {number}
     * @desc Shipping cost */    
    this.shipping = 0.0;
    
    /** @type {number}
     * @desc Tax amount */    
    this.tax = 0.0;
    
    /** @type {bool}
     * @readonly
     * @desc true if the transaction has been authorized and completed */
    this.completed = false;
    
    /** @type {function}
     * @desc Redirect user to Paypal and proceed to checkout */  
    this.submit = function(){
        
        var proto = window.location.protocol === "https:" ? "https" : "http";
        
        var data = {};
        data.type = this.type;
        data.business = this.merchant;
        data.item_name = this.product;
        data.currency_code = this.currency;
        data.quantity = this.quantity;
        data.amount = this.amount;
        data.shipping = this.shipping;
        data.tax = this.tax;
        data.custom = this.session.token + ":" + this.uid;
        data.returnUrl  = proto + ":" + this.session.getLink() + "/paypal/?a=return&s=" + this.session.token;
        data.cancelUrl  = proto + ":" + this.session.getLink() + "/paypal/?a=cancel&s=" + this.session.token;
        data.sandbox = this.sandbox;
        
        var paypalUrl = "https://www.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=";
        if(this.sandbox){
            paypalUrl = "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=";
        }
        
        if(ZUtils.Browser.IsMobile()){
            //Return to current page
            data.returnUrl += "&r=" + encodeURI(window.location.href);
            data.cancelUrl += "&r=" + encodeURI(window.location.href);
        }else{
            //Close popup
            data.returnUrl += "&r=" + encodeURI(this.session.getLink() + "/paypal/?a=close");
            data.cancelUrl += "&r=" + encodeURI(this.session.getLink() + "/paypal/?a=close");
        }
        
        var paypal = this;
        var dataStr = JSON.stringify(data);
        
        ZUtils.AjaxPost(paypal.session.getLink() + "/paypal/?a=express-checkout&s=" + paypal.session.token, dataStr, function(response, status){
                 
            if(status !== 200){
                throw "Paypal module only available for premium users, please visit http://zenterac.com";
            }
            
            var rData = JSON.parse(response); 
            paypal.token = rData.TOKEN;
            
            if(paypal.token){
                if(ZUtils.Browser.IsMobile()){
                    localStorage['Zenterac_Paypal_' + paypal.product] = JSON.stringify(paypal);
                    localStorage.Zenterac_Action = 'reload';
                    window.location.href = paypalUrl + paypal.token; //Change page
                }else{
                    var aW = window.screen.availWidth;
                    var aH = window.screen.availHeight;
                    var spec = 'left=' + aW/6 + ',top=' + aH/6 + ',height=' + aH*2/3 + ',width=' + aW*2/3;
                    var paypalWindow = window.open(paypalUrl + paypal.token, paypal.product, spec); //Popup
                    paypalWindow.focus();
                    Zenterac.Paypal.WaitForPopup(paypalWindow, paypal);
                }
            }
        });
        
    };
    
    this.validate = function(validateCB){
        
        var self = this;
        
        ZUtils.Ajax(this.session.getLink() + "/paypal/?a=validate&token=" + this.token + "&s=" + this.session.token, function(response){
                  
            var info = JSON.parse(response);
            
            if(info.success){
                self.completed = true;
                validateCB(self, true);
            }else{
                validateCB(self, false);
            }
        });
    };
    
};

Zenterac.Paypal.RetrieveList = [];
Zenterac.Paypal.CompletedList = [];

/** 
 * @function
 * @desc Retrieve transaction done in previous session
 * @param {string} productName - the transaction to retrieve
 * @param {function} retrieveCB - callback when the transaction is retrieve, first param is the paypal object, second is true if the transaction succeed
 * @memberof Zenterac
 */
Zenterac.Paypal.Retrieve = function(productName, retrieveCB){
    
    var paypal = null;
    
    //Create from an stringified object
    var CopyPaypal = function(p){
        
        var session = new Zenterac.Session(p.session.user, p.session.token, p.session.host);
    
        var nPay = new Zenterac.Paypal(p.merchant, p.product, session);
        nPay.type = p.type;
        nPay.token = p.token;
        nPay.sandbox = p.token;
        nPay.quantity = p.token;
        nPay.amount = p.token;
        nPay.currency = p.token;
        nPay.shipping = p.token;
        nPay.tax = p.token;
        return nPay;

    };
    
    //Save all callbacks
    Zenterac.Paypal.RetrieveList.push({name: productName, callback: retrieveCB});
    
    //Get paypal variables from previous page
    try{
        var sObj = JSON.parse(localStorage['Zenterac_Paypal_' + productName]);
        if(sObj.token && sObj.merchant && sObj.session){
            paypal = CopyPaypal(sObj);
        }
    }catch(e){}
    
    //Valid completed transation
    if(paypal){
        paypal.validate(function(pObj, isSuccess){
            localStorage.removeItem('Zenterac_Paypal_' + productName);
            Zenterac.Paypal.CompletedList.push({obj: pObj, success: isSuccess, callback: retrieveCB});
        });
    }
    
};

Zenterac.Paypal.StartRetrieve = function(){
    
    //Call all saved callbacks
    for(var i=0; i<Zenterac.Paypal.CompletedList.length; i++){
        var item = Zenterac.Paypal.CompletedList[i];
        item.callback(item.obj, item.success);
    }
    
    //Clear retrieve list
    Zenterac.Paypal.CompletedList = [];
};

//Valid one paypal object and start callbacks
Zenterac.Paypal.ValidAndStart = function(paypal){
    paypal.validate(function(pObj, isSuccess){
        for(var i=0; i<Zenterac.Paypal.RetrieveList.length; i++){
            var elem = Zenterac.Paypal.RetrieveList[i];
            if(elem.name === pObj.product){
                elem.callback(pObj, isSuccess);
            }
        }
    });
};

Zenterac.Paypal.WaitForPopup = function(popup, paypal){
    var paypalInt = setInterval(function() {
        if (popup.closed) {
            clearInterval(paypalInt);
            Zenterac.Paypal.ValidAndStart(paypal);
        }
    }, 500);
};