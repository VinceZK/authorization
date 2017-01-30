/**
 * Created by VinceZK on 1/30/17.
 */
"use strict";
import { find, each, every, union, findIndex, contains, isArray, isObject } from 'underscore';
import fs from 'fs';
import {contains as seloptContains} from '../lib/selectOption';
export { authorization };

function authorization(identification){
//TODO: roll-in profiles associated to the identification
    if(identification){
        var _rawProfile = JSON.parse(fs.readFileSync('./example/testProfile01', 'utf8'));
        this.profile = _compileProfile(_rawProfile);
    }
}

/**
 * Do authorization check
 * @param authObject
 * @param requiredPermission
 * @returns {boolean}
 */
authorization.prototype.check = function(authObject, requiredPermission){
    if(!authObject || !requiredPermission)return false;

    var grantedPermission =
        find(this.profile, function(authorization){
            return authorization.AuthObject === authObject;
        });

    return every(requiredPermission,function(value, field){
        let _grantedValue = grantedPermission.AuthFieldValue[field];
        if(_grantedValue){
            if(isArray(_grantedValue)){
                if(contains(_grantedValue, value))return true;
                else{
                    for(let selectOption of _grantedValue)
                        if(isObject(selectOption) && seloptContains(selectOption, value))return true;

                    return false; //After iterating all the select options, the value is not in.
                }
            } else if(_grantedValue === '*')return true;
        }else return false;
    });
};

/**
 * Compile the raw profile into check-able format
 * @param rawProfile
 * @private
 */
function _compileProfile(rawProfile){
    let _existPermissionIdx= null;
    let _compiledProfile = [];

    each(rawProfile, function(permission){
        _existPermissionIdx =
            findIndex(_compiledProfile, function(existPermission){
                return existPermission.AuthObject === permission.AuthObject;
            });

        if(_existPermissionIdx > -1){
            _merge(_compiledProfile[_existPermissionIdx], permission);
        }else _compiledProfile.push(permission);
    });

    return _compiledProfile;
}

/**
 * Merge permission2 into permission1
 * @param permission1
 * @param permission2
 * @private
 */
function _merge(permission1, permission2){
    let _fieldValue;
    if(permission1.AuthObject !== permission2.AuthObject)return false;

    each(permission2.AuthFieldValue, function(value, field){
        if (value === '*'){
            permission1.AuthFieldValue[field] = value;
            return true;
        }
        _fieldValue = permission1.AuthFieldValue[field];
        if(!_fieldValue)
            permission1.AuthFieldValue[field] = value;
        else if(isArray(_fieldValue))
            permission1.AuthFieldValue[field] = union(_fieldValue, value);
    });
    return true;
};
