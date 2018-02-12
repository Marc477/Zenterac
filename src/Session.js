
/* @class
 * @memberof Zenterac
 * @param {String} sToken - Session token
 * @param {Number} sIP - IP address of session's server
 * @param {Number} sPort - Port of session's server
 */
Zenterac.Session = function(sUser, sToken, sHost){

    /* @type {string}
     * @desc Session token */
    this.token = sToken;
    
    /* @type {string}
     * @desc Session's server address or ip */
    this.host = sHost;
    
    /* @type {string}
     * @desc Session user */
    this.user = sUser;
    
    /* @function
     * @desc Returns session link
     * @returns {string} */
    this.getLink = function(){
        return Zenterac.protocol + "//" + this.host;
    };
    
};