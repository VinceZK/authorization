/**
 * Created by VinceZK on 1/30/17.
 */
const seloptContains = require('./selectOption').contains;
let authorizationTraceIsOn = false;

/**
 * Constructor
 * @param id: Identification, usually stands for a user ID
 * @param profile: compiled authorization profile
 * @constructor
 */
function Authorization(id, profile){
    if(!id || !profile) throw new Error('id and profile are mandatory!');
    if(typeof id !== 'string') throw new Error('id must be a string!');
    if(!Array.isArray(profile)) throw new Error('profile must be an array!');
    this.id  = id;
    this.profile = profile;
}

/**
 * Do authorization check
 * @param authObject
 * @param requiredPermission: {authField1:value1, authField2:value2, ...}
 * @returns {boolean}
 */
Authorization.prototype.check = function(authObject, requiredPermission){
    if(authorizationTraceIsOn)_outputRequiredPermission(this.id, authObject, requiredPermission);

    if(!authObject || !requiredPermission) return false;

    const grantedPermission = this.profile.find( authorization => authorization.AuthObject === authObject);

    if (!grantedPermission) {
        _outputMissingAuthObject(authObject);
        return false; // AuthObject is not in the profile, no permission.
    }

    if (grantedPermission.AuthFieldValueComposition.findIndex(
        authorization => _checkPermissionGranted(requiredPermission, authorization)) !== -1 ) {
        return true;
    } else {
        _outputAuthorizationCheckError(authObject, requiredPermission, grantedPermission);
        return false;
    }
};

Authorization.switchTraceOn = function(){
    authorizationTraceIsOn = true;
};

Authorization.switchTraceOff = function(){
    authorizationTraceIsOn = false;
};

function _checkPermissionGranted(requiredPermission, fieldValue) {
    for(let [authField, requiredValue] of Object.entries(requiredPermission)) {
        const grantedValue = fieldValue[authField];
        if (!grantedValue) { return false; }

        if (Array.isArray(grantedValue)) {
            if (grantedValue.findIndex( value => value === requiredValue) === -1) {
                if(!_checkSeloptContains(requiredValue, grantedValue)) {
                    return false;
                }
            }
        } else { // String value or *
            if (grantedValue !== '*' && grantedValue !== requiredValue) {
                return false;
            }
        }
    }
    return true;
}
function _checkSeloptContains(requiredValue, grantedValue) {
    for(let selectOption of grantedValue) {
        if (typeof selectOption === 'object' && seloptContains(selectOption, requiredValue)) {
            return true;
        }
    }
    return false;
}

/**
 * Output required permission as information
 * @param id
 * @param authObject
 * @param requiredPermission
 * @private
 */
function _outputRequiredPermission(id, authObject,requiredPermission){
    if(!authorizationTraceIsOn) return;

    console.info(`Identity is "${id}'"`);
    if (authObject){
        console.info(`Authorization object: "${authObject}"`);
    } else {
        console.error(`Authorization object is NULL!`);
    }

    if (requiredPermission){
        console.info(`Required permission: ${JSON.stringify(requiredPermission)}`);
    }else{
        console.error(`Required permission is NULL!`);
    }
}
function _outputMissingAuthObject(authObject) {
    if(!authorizationTraceIsOn) return;
    console.error(`Missing authority object: "${authObject}"`);
}
/**
 * Output authorization check error
 * @param authObject
 * @param requiredPermission
 * @param grantedPermission
 * @private
 */
function _outputAuthorizationCheckError(authObject, requiredPermission, grantedPermission){
    if(!authorizationTraceIsOn) return;
    console.error(`        
 Authorization object: "${authObject}"
  Required permission: ${JSON.stringify(requiredPermission)}
   Granted permission: ${JSON.stringify(grantedPermission)}`);
}

module.exports.Authorization = Authorization;