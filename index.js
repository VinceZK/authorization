/**
 * Created by VinceZK on 2/3/17.
 */
const Authorization = require('./lib/authorization').Authorization;
const profileCompiler = require('./lib/profileCompiler').compileProfile;

module.exports = {
    Authorization: Authorization,
    profileCompiler: profileCompiler
};