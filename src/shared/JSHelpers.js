/*
Set of very useful helper functions to be used all over the place
 */


/***
 * Checks if a property is defined in an object
 * @param propertyName - the name of the property
 * @param obj - the object
 * @returns {boolean} - true if the property is defined in the object
 */
function checkIfPropertyDefinedInObject(propertyName, obj) {
    if (propertyName in obj &&
        obj.hasOwnProperty(propertyName) &&
        obj[propertyName] !== undefined) {
        return true;

    }
    else {
        console.log('Property 1 is not defined');
    }

    if (obj.hasOwnProperty('property2')) {
        console.log('Property 2 is defined:', obj.property2);
    }
    else {
        console.log('Property 2 is not defined');
    }
}

function isString(x) {
    return Object.prototype.toString.call(x) === "[object String]"
}



function now() {

    const dateNow = new Date();

    return `${(dateNow).getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`;
}




function deepCloneObject(obj) {
     return structuredClone(obj);
}


module.exports =  {checkIfPropertyDefinedInObject, isString,now};