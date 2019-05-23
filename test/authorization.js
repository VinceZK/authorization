/**
 * Created by VinceZK on 1/30/17.
 * Because Mocha doesn't support ES6 import, so we need the help of bable.
 * Refer this page: https://babeljs.io/docs/setup/#installation for details.
 */
var Authorization = require('../index.js').Authorization;
var compileProfile = require('../index.js').profileCompiler;
var fs = require('fs');
var _ = require('underscore');

describe('Authorization Profile 01', function(){
    var _rawProfile01 = JSON.parse(fs.readFileSync('./example/testProfile01', 'utf8'));
    var _rawProfile02 = JSON.parse(fs.readFileSync('./example/testProfile02', 'utf8'));
    var _compiledProfile = compileProfile([_rawProfile01,_rawProfile02]);
    var authority = new Authorization('vincezk', _compiledProfile);
    Authorization.switchTraceOn();

    describe('Cold Test', function(){

        it('should compile correctly for the user authorization object', function(){
            var grantedPermission =
                _.find(authority.profile, function(authorization){
                    return authorization.AuthObject === 'user';
                });
            grantedPermission.AuthFieldValue.Group.should.eql([ 'Ordinary', 'Admin']);
            grantedPermission.AuthFieldValue.Action.should.
                eql([ 'Create', 'Edit', 'Display', 'Delete', 'Lock', 'Unlock' ]);
        });

        it('should compile correctly for the blog authorization object', function(){
            var grantedPermission =
                _.find(authority.profile, function(authorization){
                    return authorization.AuthObject === 'blog';
                });
            grantedPermission.AuthFieldValue.Tag.should.
                eql([ 'DB', 'JS', 'Algorithm' ]);
            grantedPermission.AuthFieldValue.ID.should.
                eql([ { Operator: 'Between', Option: 'Include', Low: 0, High: 1999999 },
                    2399999,
                    { Operator: 'Between', Option: 'Include', Low: 4000000, High: 4999999 },
                    7899999 ]);
            grantedPermission.AuthFieldValue.Action.should.eql('*');
        });

        it('should pass authorization check for user', function(){
            authority.check('user', {Group:'Admin',Action:'Create'}).should.eql(true);
        });

        it('should fail the check for user', function(){
            //Auth object "xxx" doesn't exit
            authority.check('xxxx', {Group:'Admin', Action:'Display'}).should.eql(false);
            //Auth field "user" doesn't exist
            authority.check('user', {Group:'Admin',Action:'Create', user:'vincezk'}).should.eql(false);
            //Auth field "Action" doesn't contain value 'Approve'
            authority.check('user', {Group:'Admin', Action:'Approve'}).should.eql(false);
            //Auth field "Group" doesn't contain value 'System'
            authority.check('user', {Group:'System', Action:'Display'}).should.eql(false);
        });

        it('should pass authorization check for blog', function(){
            authority.check('blog', {Tag:'DB', ID:2399999, Action:'Post'}).should.eql(true);
            authority.check('blog', {Tag:'JS', ID:0, Action:'Edit'}).should.eql(true);
            authority.check('blog', {Tag:'JS', ID:1000001, Action:'Publish'}).should.eql(true);
            authority.check('blog', {Tag:'Algorithm', ID:1999999, Action:'Post'}).should.eql(true);
            authority.check('blog', {Tag:'DB', ID:4000000, Action:'Post'}).should.eql(true);
            authority.check('blog', {Tag:'DB', ID:4002330, Action:'Post'}).should.eql(true);
            authority.check('blog', {Tag:'DB', ID:4002330, Action:'anything'}).should.eql(true);
            authority.check('blog', {Tag:'DB', ID:7899999, Action:'anything'}).should.eql(true);
        });

        it('should fail the check for blog', function(){
            authority.check('blog', {Tag:'DBA', ID:1000000, Action:'Post'}).should.eql(false);
            authority.check('blog', {Tag:'DB', ID:3000000, Action:'anything'}).should.eql(false);
            authority.check('blog', {Tag:'DB', ID:8899999, Action:'anything'}).should.eql(false);
        })
    });

    describe('Select Options', function(){
        it('should pass "Between 4000000 and 4999999" with "Include"', function(){
            authority.check('comment1', {blogID:4000000, Content:'Hello there', Action:'Post'}).should.eql(true);
            authority.check('comment1', {blogID:3999999, Content:'Hello there', Action:'Post'}).should.eql(false);
            authority.check('comment1', {blogID:4999999, Content:'Hello there', Action:'Post'}).should.eql(true);
            authority.check('comment1', {blogID:5000000, Content:'Hello there', Action:'Post'}).should.eql(false);
        });
        it('should pass "Between 4000000 and 4999999" with "Exclude"', function(){
            authority.check('comment2', {blogID:4000000, Content:'Hello there', Action:'Post'}).should.eql(false);
            authority.check('comment2', {blogID:3999999, Content:'Hello there', Action:'Post'}).should.eql(true);
            authority.check('comment2', {blogID:4999999, Content:'Hello there', Action:'Post'}).should.eql(false);
            authority.check('comment2', {blogID:5000000, Content:'Hello there', Action:'Post'}).should.eql(true);
        });
        it('should pass "GreaterThan(>) 4000000" with "Include"', function(){
            authority.check('comment3', {blogID:4000000, Content:'.... Best Regards', Action:'Post'}).should.eql(false);
            authority.check('comment3', {blogID:4000001, Content:'.... Best Regards', Action:'Post'}).should.eql(true);
        });
        it('should pass "GreaterThan(>) 4000000" with "Exclude"', function(){
            authority.check('comment4', {blogID:4000000, Content:'.... Best Regards', Action:'Post'}).should.eql(true);
            authority.check('comment4', {blogID:4000001, Content:'.... Best Regards', Action:'Post'}).should.eql(false);
        });
        it('should pass "LessThan(<) 4000000" with "Include"', function(){
            authority.check('comment5', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(false);
            authority.check('comment5', {blogID:3999999, Content:'hello good bye', Action:'Post'}).should.eql(true);
        });
        it('should pass "LessThan(<) 4000000" with "Exclude"', function(){
            authority.check('comment6', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(true);
            authority.check('comment6', {blogID:3999999, Content:'hello good bye', Action:'Post'}).should.eql(false);
        });
        it('should pass "GreaterEqual(>=) 4000000" with "Include"', function(){
            authority.check('comment7', {blogID:3999999, Content:'hello good bye', Action:'Post'}).should.eql(false);
            authority.check('comment7', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(true);
        });
        it('should pass "GreaterEqual(>=) 4000000" with "Exclude"', function(){
            authority.check('comment8', {blogID:3999999, Content:'hello good bye', Action:'Post'}).should.eql(true);
            authority.check('comment8', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(false);
        });
        it('should pass "LessEqual(<=) 4000000" with "Include"', function(){
            authority.check('comment9', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(true);
            authority.check('comment9', {blogID:4000001, Content:'hello good bye', Action:'Post'}).should.eql(false);
        });
        it('should pass "LessEqual(<=) 4000000" with "Exclude"', function(){
            authority.check('comment10', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(false);
            authority.check('comment10', {blogID:4000001, Content:'hello good bye', Action:'Post'}).should.eql(true);
        });
        it('should pass "Equal(==) 4000000" with "Include"', function(){
            authority.check('comment11', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(true);
            authority.check('comment11', {blogID:4000001, Content:'hello good bye', Action:'Post'}).should.eql(false);
        });
        it('should pass "Equal(==) 4000000" with "Exclude"', function(){
            authority.check('comment12', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(false);
            authority.check('comment12', {blogID:4000001, Content:'hello good bye', Action:'Post'}).should.eql(true);
        });
        it('should pass "NotEqual(!=) 4000000" with "Include"', function(){
            authority.check('comment13', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(false);
            authority.check('comment13', {blogID:4000001, Content:'hello good bye', Action:'Post'}).should.eql(true);
        });
        it('should pass "NotEqual(!=) 4000000" with "Exclude"', function(){
            authority.check('comment14', {blogID:4000000, Content:'hello good bye', Action:'Post'}).should.eql(true);
            authority.check('comment14', {blogID:4000001, Content:'hello good bye', Action:'Post'}).should.eql(false);
        });
        it('should pass "StartsWith" with "Include"', function(){
            authority.check('comment1', {blogID:4000000, Content:'Hello there', Action:'Post'}).should.eql(true);
            authority.check('comment1', {blogID:4000000, Content:'hello there', Action:'Post'}).should.eql(false);
            authority.check('comment1', {blogID:4000000, Content:'aaa hello there', Action:'Post'}).should.eql(false);
        });
        it('should pass "StartsWith" with "Exclude"', function(){
            authority.check('comment2', {blogID:3999999, Content:'Shit there', Action:'Post'}).should.eql(false);
            authority.check('comment2', {blogID:3999999, Content:'hello there', Action:'Post'}).should.eql(true);
            authority.check('comment2', {blogID:3999999, Content:'aaa Shit there', Action:'Post'}).should.eql(true);
        });
        it('should pass "EndsWith" with "Include"', function(){
            authority.check('comment3', {blogID:4000001, Content:'.... Best Regards', Action:'Post'}).should.eql(true);
            authority.check('comment3', {blogID:4000001, Content:'.... Best Regards aaa', Action:'Post'}).should.eql(false);
        });
        it('should pass "EndsWith" with "Exclude"', function(){
            authority.check('comment4', {blogID:3999999, Content:'.... Shit', Action:'Post'}).should.eql(false);
            authority.check('comment4', {blogID:3999999, Content:'.... Shit aaa', Action:'Post'}).should.eql(true);
        });
        it('should pass "Contains" with "Include"', function(){
            authority.check('comment5', {blogID:3999999, Content:'hello good bye', Action:'Post'}).should.eql(true);
            authority.check('comment5', {blogID:3999999, Content:'hello goo bye', Action:'Post'}).should.eql(false);
        });
        it('should pass "Contains" with "Exclude"', function(){
            authority.check('comment6', {blogID:4000000, Content:'... fuck ...', Action:'Post'}).should.eql(false);
            authority.check('comment6', {blogID:4000000, Content:'... fuc ...', Action:'Post'}).should.eql(true);
        });
        it('should pass "Matches(Regexp)" with "Include"', function(){
            authority.check('comment7', {blogID:4000000, Content:'hello GoOd bye', Action:'Post'}).should.eql(true);
            authority.check('comment7', {blogID:4000000, Content:'.. hello goodbye ..', Action:'Post'}).should.eql(true);
            authority.check('comment7', {blogID:4000000, Content:'hello God bye', Action:'Post'}).should.eql(false);
            authority.check('comment7', {blogID:4000000, Content:'hello Go0d bye', Action:'Post'}).should.eql(false);
        });
        it('should pass "Matches(Regexp)" with "Exclude"', function(){
            authority.check('comment8', {blogID:3999999, Content:'... Shit ...', Action:'Post'}).should.eql(false);
            authority.check('comment8', {blogID:3999999, Content:'... shit ...', Action:'Post'}).should.eql(false);
            authority.check('comment8', {blogID:3999999, Content:'... ShIt ...', Action:'Post'}).should.eql(false);
            authority.check('comment8', {blogID:3999999, Content:'... shit, Shit, SHIT ...', Action:'Post'}).should.eql(false);
            authority.check('comment8', {blogID:3999999, Content:'... Sh0t ...', Action:'Post'}).should.eql(true);
        });
    });

    describe('Hot Test', function(){
        it('should pass', function(){
            authority.check('blog', {Tag:'JS', ID:0, Action:'Edit'}).should.eql(true);
        })
    });
});