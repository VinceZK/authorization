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

    describe('Hot Test', function(){
        it('should pass', function(){
            should(authority.check('blog', {Tag:'DB', ID:3000000, Action:'Post'})).eql(false);
        })
    });
});