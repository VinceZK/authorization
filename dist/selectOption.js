/**
 * Created by VinceZK on 1/30/17.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.contains = contains;


function contains(selectOption, value) {
    if (!selectOption) return false;

    switch (selectOption.Operator) {
        case 'Between':
            if (selectOption.Option === 'Include') return value >= selectOption.Low && value <= selectOption.High;else if (selectOption.Option === 'Exclude') return value < selectOption.Low || value > selectOption.High;
            break;
        case 'GreaterThan':
            if (selectOption.Option === 'Include') return value > selectOption.Low;else if (selectOption.Option === 'Exclude') return value <= selectOption.Low;
            break;
        case 'LessThan':
            if (selectOption.Option === 'Include') return value < selectOption.Low;else if (selectOption.Option === 'Exclude') return value >= selectOption.Low;
            break;
        case 'GreaterEqual':
            if (selectOption.Option === 'Include') return value >= selectOption.Low;else if (selectOption.Option === 'Exclude') return value < selectOption.Low;
            break;
        case 'LessEqual':
            if (selectOption.Option === 'Include') return value <= selectOption.Low;else if (selectOption.Option === 'Exclude') return value > selectOption.Low;
            break;
        case 'Equal':
            if (selectOption.Option === 'Include') return value == selectOption.Low;else if (selectOption.Option === 'Exclude') return value != selectOption.Low;
            break;
        case 'NotEqual':
            if (selectOption.Option === 'Include') return value != selectOption.Low;else if (selectOption.Option === 'Exclude') return value == selectOption.Low;
            break;
        case 'StartsWith':
            if (selectOption.Option === 'Include') return value.startsWith(selectOption.Low);else if (selectOption.Option === 'Exclude') return !value.startsWith(selectOption.Low);
            break;
        case 'EndsWith':
            if (selectOption.Option === 'Include') return value.endsWith(selectOption.Low);else if (selectOption.Option === 'Exclude') return !value.endsWith(selectOption.Low);
            break;
        case 'Contains':
            if (selectOption.Option === 'Include') return value.includes(selectOption.Low);else if (selectOption.Option === 'Exclude') return !value.includes(selectOption.Low);
            break;
        case 'Matches':
            //Regular Expression
            var re = _regExpFromString(selectOption.Low);
            if (selectOption.Option === 'Include') return re.test(value);else if (selectOption.Option === 'Exclude') return !re.test(value);
            break;
        default:
            return true;
    }
}

function _regExpFromString(q) {
    var flags = q.replace(/.*\/([gimuy]*)$/, '$1');
    if (flags === q) flags = '';
    var pattern = flags ? q.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1') : q;
    try {
        return new RegExp(pattern, flags);
    } catch (e) {
        return null;
    }
}