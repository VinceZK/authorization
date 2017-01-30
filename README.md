# authorization
An Object-Oriented Authorization Framework for nodejs. 
Unlike others, it allows end-user rather than developers to define authorizations. 
And it also provides the flexiblity to allow end-user to define authorization objects. 

In real use cases, authorization doesn't mean to control actions on certain web pages/views, but mean to control on the same web page/view, 
different users can have different permessions on different business objects. Like user A can edit blogs with tag 'DB'; user B can allow to publish blogs with tag 'JS'

When a user is logged on, the profiles are compiled and roll-in into the login session memory. 
Then each time the user performs an action on an object, corresponding authorization checks can be done before it actually happens. 
Developers can decide where to embed the "authorization.check()" statements

```javascript
import { authorization } from 'authorization';

var authorization = new authorization('userid');

if(!authorization.check('user', {Group:'Admin',Action:'Create'})){
   //Report a message, and break
}
```
The authorization profile consists of authorization objects and their authorization fields and values. 
It is in JSON format and can be maintained through all possible UI tools. It is recommanded to be saved in DB,
and associated with login users. You can, for example, develope a role maintainence UI, 
which will also generate the authrization profiles. When you assign roles to users, the corresponding authorizations are also assigned.

```javascript
[
    {   "AuthObject": "user",
        "AuthFieldValue":{
            "Group": ["Ordinary"],
            "Action": ["Create","Edit","Display","Delete","Lock","Unlock"]
        }
    },
    {
        "AuthObject": "blog",
        "AuthFieldValue":{
            "Tag": ["DB", "JS", "Algorithm"],
            "ID": [{"Operator":"Between", "Option":"Include", "Low":1000000, "High":1999999}, 2399999],
            "Action": ["Post", "Edit", "Publish"]
        }
    }
]
```

## Example
You can find more details on the *example* folder, and run the tests by typing following bash:
 ```bash
    $ npm run test
 ```
