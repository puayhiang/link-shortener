"use strict";

// Currently Unused
// modified FROM https://github.com/base62/base62.js

var CHARSET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// NB: does not validate input
exports.encode = function encode(int: number) {
    if (int === 0) {
        return CHARSET[0];
    }

    var res = "";
    while (int > 0) {
        res = CHARSET[int % 62] + res;
        int = Math.floor(int / 62);
    }
    return res;
};

exports.decode = function decode(str: string) {
    var res = 0,
        length = str.length,
        i, char;
    for (i = 0; i < length; i++) {
        char = str.charCodeAt(i);
        if (char < 58) { // 0-9
            char = char - 48;
        } else if (char < 91) { // A-Z
            char = char - 29;
        } else { // a-z
            char = char - 87;
        }
        res += char * Math.pow(62, length - i - 1);
    }
    return res;
};