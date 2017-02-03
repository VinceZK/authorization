'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.compileProfile = undefined;

var _underscore = require('underscore');

exports.compileProfile = compileProfile;
/**
 * Compile the raw profile into check-able format
 * @param rawProfiles [[profile1],[profile2],...]
 * @public
 */
/**
 * Created by VinceZK on 2/3/17.
 */

function compileProfile(rawProfiles) {
    var _rawProfile = (0, _underscore.flatten)(rawProfiles, true);
    var _existPermissionIdx = null;
    var _compiledProfile = [];

    (0, _underscore.each)(_rawProfile, function (permission) {
        _existPermissionIdx = (0, _underscore.findIndex)(_compiledProfile, function (existPermission) {
            return existPermission.AuthObject === permission.AuthObject;
        });

        if (_existPermissionIdx > -1) {
            _merge(_compiledProfile[_existPermissionIdx], permission);
        } else _compiledProfile.push(permission);
    });

    return _compiledProfile;
}

/**
 * Merge permission2 into permission1
 * @param permission1
 * @param permission2
 * @private
 */
function _merge(permission1, permission2) {
    var _fieldValue = void 0;
    if (permission1.AuthObject !== permission2.AuthObject) return false;

    (0, _underscore.each)(permission2.AuthFieldValue, function (value, field) {
        if (value === '*') {
            permission1.AuthFieldValue[field] = value;
            return true;
        }
        _fieldValue = permission1.AuthFieldValue[field];
        if (!_fieldValue) permission1.AuthFieldValue[field] = value;else if ((0, _underscore.isArray)(_fieldValue)) permission1.AuthFieldValue[field] = (0, _underscore.union)(_fieldValue, value);
    });
    return true;
};