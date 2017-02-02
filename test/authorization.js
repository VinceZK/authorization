/**
 * Created by VinceZK on 1/30/17.
 * Because Mocha doesn't support ES6 import, so we need the help of bable.
 * Refer this page: https://babeljs.io/docs/setup/#installation for details.
 */
import { authorization } from '../lib/authorization';
import { find } from 'underscore';
import should from 'should';
import "babel-polyfill";

describe('Authorization Profile 01', function(){
    var authority = new authorization('vincezk');
    describe('Cold Test', function(){

        it('should compile correctly for the user authorization object', function(){
            var grantedPermission =
                find(authority.profile, function(authorization){
                    return authorization.AuthObject === 'user';
                });
            should(grantedPermission.AuthFieldValue.Group).
                eql([ 'Ordinary', 'Admin']);
            should(grantedPermission.AuthFieldValue.Action).
                eql([ 'Create', 'Edit', 'Display', 'Delete', 'Lock', 'Unlock' ]);
        });

        it('should compile correctly for the blog authorization object', function(){
            var grantedPermission =
                find(authority.profile, function(authorization){
                    return authorization.AuthObject === 'blog';
                });
            should(grantedPermission.AuthFieldValue.Tag).
                eql([ 'DB', 'JS', 'Algorithm' ]);
            should(grantedPermission.AuthFieldValue.ID).
                eql([ { Operator: 'Between', Option: 'Include', Low: 1000000, High: 1999999 },
                    2399999,
                    { Operator: 'Between', Option: 'Include', Low: 4000000, High: 4999999 },
                    7899999 ]);
            should(grantedPermission.AuthFieldValue.Action).eql('*');
        });

        it('should pass authorization check for user', function(){
            should(authority.check('user', {Group:'Admin',Action:'Create'})).eql(true);
        });

        it('should fail the check for user', function(){
            //Auth field "user" doesn't exist
            should(authority.check('user', {Group:'Admin',Action:'Create', user:'vincezk'})).eql(false);
            //Auth field "Action" doesn't contain value 'Approve'
            should(authority.check('user', {Group:'Admin', Action:'Approve'})).eql(false);
            //Auth field "Group" doesn't contain value 'System'
            should(authority.check('user', {Group:'System', Action:'Display'})).eql(false);
        });

        it('should pass authorization check for blog', function(){
            should(authority.check('blog', {Tag:'DB', ID:2399999, Action:'Post'})).eql(true);
            should(authority.check('blog', {Tag:'JS', ID:1000000, Action:'Edit'})).eql(true);
            should(authority.check('blog', {Tag:'JS', ID:1000001, Action:'Publish'})).eql(true);
            should(authority.check('blog', {Tag:'Algorithm', ID:1999999, Action:'Post'})).eql(true);
            should(authority.check('blog', {Tag:'DB', ID:4000000, Action:'Post'})).eql(true);
            should(authority.check('blog', {Tag:'DB', ID:4002330, Action:'Post'})).eql(true);
            should(authority.check('blog', {Tag:'DB', ID:4002330, Action:'anything'})).eql(true);
            should(authority.check('blog', {Tag:'DB', ID:7899999, Action:'anything'})).eql(true);
        });

        it('should fail the check for blog', function(){
            should(authority.check('blog', {Tag:'DBA', ID:1000000, Action:'Post'})).eql(false);
            should(authority.check('blog', {Tag:'DB', ID:3000000, Action:'anything'})).eql(false);
            should(authority.check('blog', {Tag:'DB', ID:8899999, Action:'anything'})).eql(false);
        })
    });

    describe('Select Options', function(){
        it('should pass "Between 4000000 and 4999999" with "Include"', function(){
            should(authority.check('comment1', {blogID:4000000, Content:'Hello there', Action:'Post'})).eql(true);
            should(authority.check('comment1', {blogID:3999999, Content:'Hello there', Action:'Post'})).eql(false);
            should(authority.check('comment1', {blogID:4999999, Content:'Hello there', Action:'Post'})).eql(true);
            should(authority.check('comment1', {blogID:5000000, Content:'Hello there', Action:'Post'})).eql(false);
        });
        it('should pass "Between 4000000 and 4999999" with "Exclude"', function(){
            should(authority.check('comment2', {blogID:4000000, Content:'Hello there', Action:'Post'})).eql(false);
            should(authority.check('comment2', {blogID:3999999, Content:'Hello there', Action:'Post'})).eql(true);
            should(authority.check('comment2', {blogID:4999999, Content:'Hello there', Action:'Post'})).eql(false);
            should(authority.check('comment2', {blogID:5000000, Content:'Hello there', Action:'Post'})).eql(true);
        });
        it('should pass "GreaterThan(>) 4000000" with "Include"', function(){
            should(authority.check('comment3', {blogID:4000000, Content:'.... Best Regards', Action:'Post'})).eql(false);
            should(authority.check('comment3', {blogID:4000001, Content:'.... Best Regards', Action:'Post'})).eql(true);
        });
        it('should pass "GreaterThan(>) 4000000" with "Exclude"', function(){
            should(authority.check('comment4', {blogID:4000000, Content:'.... Best Regards', Action:'Post'})).eql(true);
            should(authority.check('comment4', {blogID:4000001, Content:'.... Best Regards', Action:'Post'})).eql(false);
        });
        it('should pass "LessThan(<) 4000000" with "Include"', function(){
            should(authority.check('comment5', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(false);
            should(authority.check('comment5', {blogID:3999999, Content:'hello good bye', Action:'Post'})).eql(true);
        });
        it('should pass "LessThan(<) 4000000" with "Exclude"', function(){
            should(authority.check('comment6', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(true);
            should(authority.check('comment6', {blogID:3999999, Content:'hello good bye', Action:'Post'})).eql(false);
        });
        it('should pass "GreaterEqual(>=) 4000000" with "Include"', function(){
            should(authority.check('comment7', {blogID:3999999, Content:'hello good bye', Action:'Post'})).eql(false);
            should(authority.check('comment7', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(true);
        });
        it('should pass "GreaterEqual(>=) 4000000" with "Exclude"', function(){
            should(authority.check('comment8', {blogID:3999999, Content:'hello good bye', Action:'Post'})).eql(true);
            should(authority.check('comment8', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(false);
        });
        it('should pass "LessEqual(<=) 4000000" with "Include"', function(){
            should(authority.check('comment9', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(true);
            should(authority.check('comment9', {blogID:4000001, Content:'hello good bye', Action:'Post'})).eql(false);
        });
        it('should pass "LessEqual(<=) 4000000" with "Exclude"', function(){
            should(authority.check('comment10', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(false);
            should(authority.check('comment10', {blogID:4000001, Content:'hello good bye', Action:'Post'})).eql(true);
        });
        it('should pass "Equal(==) 4000000" with "Include"', function(){
            should(authority.check('comment11', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(true);
            should(authority.check('comment11', {blogID:4000001, Content:'hello good bye', Action:'Post'})).eql(false);
        });
        it('should pass "Equal(==) 4000000" with "Exclude"', function(){
            should(authority.check('comment12', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(false);
            should(authority.check('comment12', {blogID:4000001, Content:'hello good bye', Action:'Post'})).eql(true);
        });
        it('should pass "NotEqual(!=) 4000000" with "Include"', function(){
            should(authority.check('comment13', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(false);
            should(authority.check('comment13', {blogID:4000001, Content:'hello good bye', Action:'Post'})).eql(true);
        });
        it('should pass "NotEqual(!=) 4000000" with "Exclude"', function(){
            should(authority.check('comment14', {blogID:4000000, Content:'hello good bye', Action:'Post'})).eql(true);
            should(authority.check('comment14', {blogID:4000001, Content:'hello good bye', Action:'Post'})).eql(false);
        });
        it('should pass "StartsWith" with "Include"', function(){
            should(authority.check('comment1', {blogID:4000000, Content:'Hello there', Action:'Post'})).eql(true);
            should(authority.check('comment1', {blogID:4000000, Content:'hello there', Action:'Post'})).eql(false);
            should(authority.check('comment1', {blogID:4000000, Content:'aaa hello there', Action:'Post'})).eql(false);
        });
        it('should pass "StartsWith" with "Exclude"', function(){
            should(authority.check('comment2', {blogID:3999999, Content:'Shit there', Action:'Post'})).eql(false);
            should(authority.check('comment2', {blogID:3999999, Content:'hello there', Action:'Post'})).eql(true);
            should(authority.check('comment2', {blogID:3999999, Content:'aaa Shit there', Action:'Post'})).eql(true);
        });
        it('should pass "EndsWith" with "Include"', function(){
            should(authority.check('comment3', {blogID:4000001, Content:'.... Best Regards', Action:'Post'})).eql(true);
            should(authority.check('comment3', {blogID:4000001, Content:'.... Best Regards aaa', Action:'Post'})).eql(false);
        });
        it('should pass "EndsWith" with "Exclude"', function(){
            should(authority.check('comment4', {blogID:3999999, Content:'.... Shit', Action:'Post'})).eql(false);
            should(authority.check('comment4', {blogID:3999999, Content:'.... Shit aaa', Action:'Post'})).eql(true);
        });
        it('should pass "Contains" with "Include"', function(){
            should(authority.check('comment5', {blogID:3999999, Content:'hello good bye', Action:'Post'})).eql(true);
            should(authority.check('comment5', {blogID:3999999, Content:'hello goo bye', Action:'Post'})).eql(false);
        });
        it('should pass "Contains" with "Exclude"', function(){
            should(authority.check('comment6', {blogID:4000000, Content:'... fuck ...', Action:'Post'})).eql(false);
            should(authority.check('comment6', {blogID:4000000, Content:'... fuc ...', Action:'Post'})).eql(true);
        });
        it('should pass "Matches(Regexp)" with "Include"', function(){
            should(authority.check('comment7', {blogID:4000000, Content:'hello GoOd bye', Action:'Post'})).eql(true);
            should(authority.check('comment7', {blogID:4000000, Content:'.. hello goodbye ..', Action:'Post'})).eql(true);
            should(authority.check('comment7', {blogID:4000000, Content:'hello God bye', Action:'Post'})).eql(false);
            should(authority.check('comment7', {blogID:4000000, Content:'hello Go0d bye', Action:'Post'})).eql(false);
        });
        it('should pass "Matches(Regexp)" with "Exclude"', function(){
            should(authority.check('comment8', {blogID:3999999, Content:'... Shit ...', Action:'Post'})).eql(false);
            should(authority.check('comment8', {blogID:3999999, Content:'... shit ...', Action:'Post'})).eql(false);
            should(authority.check('comment8', {blogID:3999999, Content:'... ShIt ...', Action:'Post'})).eql(false);
            should(authority.check('comment8', {blogID:3999999, Content:'... shit, Shit, SHIT ...', Action:'Post'})).eql(false);
            should(authority.check('comment8', {blogID:3999999, Content:'... Sh0t ...', Action:'Post'})).eql(true);
        });
    });

    describe('Hot Test', function(){
        it('should pass', function(){
            should(authority.check('blog', {Tag:'DB', ID:3000000, Action:'Post'})).eql(false);
        })
    });
});