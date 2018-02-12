
/** @function 
* @memberof ZUtils
* @desc Show an html DOM element
* @param {Object} htmlElem - the html element
*/
ZUtils.show = function(htmlElem){
  
  if(htmlElem){
    htmlElem.style.display = 'block';
  }
};

/** @function 
* @memberof ZUtils
* @desc Hide an html DOM element
* @param {Object} htmlElem - the html element
*/
ZUtils.hide = function(htmlElem){
  
  if(htmlElem){
    htmlElem.style.display = 'none';
  }
};

ZUtils.isNumber = function(value){
    if(typeof value === "number"){
        if(!isNaN(value)){
            return true;
        }
    }
    if(typeof value === "string"){
        if(value && !isNaN(value)){
            return true;
        }
    }
    return false;
};

ZUtils.Shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

/** @function 
* @memberof ZUtils
* @desc Get the anchor tag in the url ( #anchor )
* @returns {String}
*/
ZUtils.GetAnchor = function(){
    var hash = window.location.hash.substring(1);
    return hash;
};