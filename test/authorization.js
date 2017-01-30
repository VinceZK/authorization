/**
 * Created by VinceZK on 1/30/17.
 */
import authorization from '../lib/authorization.js';

describe('Authorization', function(){
    describe('Hot Test', function(){
        it('should pass', function(){
            authorization.check('user', {group:'Admin',Action:'Create'}).should.be.true;
        })
    });
});