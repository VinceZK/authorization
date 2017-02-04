'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Authorization = undefined;

var _underscore = require('underscore');

var _selectOption = require('./selectOption.js');

/**
 * Created by VinceZK on 1/30/17.
 */
exports.Authorization = Authorization;


var authorizationTraceIsOn = false;

/**
 * Constructor
 * @param id
 * @param profile
 * @constructor
 */
function Authorization(id, profile) {
    if (!id || !profile) throw new Error('id and profile are mandatory!');
    if (typeof id !== 'string') throw new Error('id must be a string!');
    if (!(0, _underscore.isArray)(profile)) throw new Error('profile must be an array!');
    this.id = id;
    this.profile = profile;
}

/**
 * Do authorization check
 * @param authObject
 * @param requiredPermission
 * @returns {boolean}
 */
Authorization.prototype.check = function (authObject, requiredPermission) {
    if (authorizationTraceIsOn) _outputTraceObject(this.id, authObject, requiredPermission);

    if (!authObject || !requiredPermission) return false;

    var grantedPermission = (0, _underscore.find)(this.profile, function (authorization) {
        return authorization.AuthObject === authObject;
    });

    return (0, _underscore.every)(requiredPermission, function (value, field) {
        var _grantedValue = grantedPermission.AuthFieldValue[field];
        if (_grantedValue) {
            if ((0, _underscore.isArray)(_grantedValue)) {
                if ((0, _underscore.contains)(_grantedValue, value)) return true;else {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _grantedValue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var selectOption = _step.value;

                            if ((0, _underscore.isObject)(selectOption) && (0, _selectOption.contains)(selectOption, value)) return true;
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    if (authorizationTraceIsOn) _outputTraceField(field, value, _grantedValue);
                    return false; //After iterating all the select options, the value is not in.
                }
            } else if (_grantedValue === '*') return true;
        } else {
            if (authorizationTraceIsOn) _outputTraceField(field, value, _grantedValue);
            return false;
        }
    });
};

Authorization.switchTraceOn = function () {
    "use strict";

    authorizationTraceIsOn = true;
};

Authorization.switchTraceOff = function () {
    "use strict";

    authorizationTraceIsOn = false;
};

/**
 * Output the tracing header information
 * @param authObject
 * @param requiredPermission
 * @private
 */
function _outputTraceObject(id, authObject, requiredPermission) {
    "use strict";

    console.info('The identification is ' + id);
    if (authObject) {
        console.info('Authorization object: ' + authObject);
    } else {
        console.error('Authorization object is NULL!');
    }

    if (requiredPermission) {
        console.info('Required permission: ' + JSON.stringify(requiredPermission));
    } else {
        console.error('Required permission is NULL!');
    }
};

/**
 * Output authorization check error field and value
 * @param field
 * @param requiredValue
 * @param grantedValue
 * @private
 */
function _outputTraceField(field, requiredValue, grantedValue) {
    "use strict";

    console.error('Authorization field: ' + field);
    console.error('Required field permission: ' + JSON.stringify(requiredValue));
    console.error('Granted field permission:' + JSON.stringify(grantedValue));
};