/**
 * Created by VinceZK on 2/3/17.
 */
const Authorization = require('./dist/authorization.js').Authorization;
const profileCompiler = require('./dist/profileCompiler.js').compileProfile;

module.exports = {Authorization: Authorization,
                  profileCompiler: profileCompiler};