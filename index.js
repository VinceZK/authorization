/**
 * Created by VinceZK on 2/3/17.
 */
var Authorization = require('./dist/authorization.js').Authorization;
var profileCompiler = require('./dist/profileCompiler.js').compileProfile;

module.exports = {Authorization: Authorization,
                  profileCompiler: profileCompiler};