/**
 * Created by VinceZK on 1/30/17.
 * Because Mocha doesn't support ES6 import, so we need the help of bable.
 * Refer this page: https://babeljs.io/docs/setup/#installation for details.
 */
const Authorization = require('../index.js').Authorization;
const compileProfile = require('../index.js').profileCompiler;
const fs = require('fs');

describe('Authorization Profile 01', function(){
    const _rawProfile01 = JSON.parse(fs.readFileSync('./example/testProfile01', 'utf8'));
    const _rawProfile02 = JSON.parse(fs.readFileSync('./example/testProfile02', 'utf8'));
    const _compiledProfile = compileProfile([_rawProfile01,_rawProfile02]);
    const authority = new Authorization('Vincezk', _compiledProfile);
    Authorization.switchTraceOn();

    describe('Core Authorization Test', function(){

        it('should compile correctly for the user authorization object', function(){
            const grantedPermission =
                authority.profile.find( permission => permission.AuthObject === 'user');
            grantedPermission.AuthFieldValueComposition.should.containDeep(
                [ { Group: [ 'Ordinary' ],
                    Action: [ 'Create', 'Edit', 'Display', 'Delete', 'Lock', 'Unlock' ] },

                    { Group: [ 'Admin' ],
                        Action: [ 'Edit', 'Display', 'Lock', 'Unlock' ] } ]
            )
        });

        it('should compile correctly for the blog authorization object', function(){
            const grantedPermission =
                authority.profile.find( permission => permission.AuthObject === 'blog');
            grantedPermission.AuthFieldValueComposition.should.containDeep(
                [ { Tag: [ 'DB', 'JS', 'Algorithm' ],
                    ID: [ { Operator: 'Between', Option: 'Include', Low: 0, High: 1999999 }, 2399999 ],
                    Action: [ 'Post', 'Edit', 'Publish' ] },

                    { ID: [ { Operator: 'Between', Option: 'Include', Low: 4000000, High: 4999999 },7899999 ],
                        Action: '*' }]
            )
        });

        it('should pass the check for user', function(){
            authority.check('user', {Group:'Admin',Action:'Edit'}).should.eql(true);
            authority.check('user', {Group:'Ordinary',Action:'Delete'}).should.eql(true);
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
            //There is no such auth field combination in granted permission
            authority.check('user', {Group:'Admin',Action:'Create'}).should.eql(false);
        });

        it('should pass the check for blog', function(){
            authority.check('blog', {Tag:'DB', ID:2399999, Action:'Post'}).should.eql(true);
            authority.check('blog', {Tag:'JS', ID:0, Action:'Edit'}).should.eql(true);
            authority.check('blog', {Tag:'JS', ID:1000001, Action:'Publish'}).should.eql(true);
            authority.check('blog', {Tag:'Algorithm', ID:1999999, Action:'Post'}).should.eql(true);
            // Test string value on Tag and wildcard "*" on Action,
            authority.check('blog', {Tag: 'Angular', ID:4002330, Action:'Post'}).should.eql(true);
            authority.check('blog', {ID:4002330, Action:'anything'}).should.eql(true);
            authority.check('blog', {ID:7899999, Action:'anything'}).should.eql(true);
        });

        it('should fail the check for blog', function(){
            // 4000000 is not combined with tag DB
            authority.check('blog', {Tag:'DB', ID:4000000, Action:'Post'}).should.eql(false);
            // Angular and 1000000 is not combined
            authority.check('blog', {Tag:'Angular', ID:1000000, Action:'Post'}).should.eql(false);
            // No tag DBA is granted
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
});