/**
 * Created by VinceZK on 1/30/17.
 */
import { find } from 'underscore';
import { profile } from '../example/testProfile01.js';
export {authorization};

function authorization(identification){
//TODO: roll-in profiles associated to the identification
    if(identification){

    }
}

authorization.prototype.check = function(authObject, requiredPermission){
    if(!authObject || !requiredPermission)return false;

    var grantedPermission =
    find(profile, function(authorization){
        return authorization.AuthObject === authObject;
    });

    console.log(grantedPermission);
    return true;
};