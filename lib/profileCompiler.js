/**
 * Created by VinceZK on 2/3/17.
 */
import { each, union, findIndex, isArray, flatten } from 'underscore';

export { compileProfile };
/**
 * Compile the raw profile into check-able format
 * @param rawProfiles [[profile1],[profile2],...]
 * @public
 */
function compileProfile(rawProfiles){
    let _rawProfile = flatten(rawProfiles, true);
    let _existPermissionIdx= null;
    let _compiledProfile = [];

    each(_rawProfile, function(permission){
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
}