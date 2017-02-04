# Authorization
An Object-Oriented Authorization Framework for nodejs. 
Unlike others, it allows end-users rather than developers to define authorizations profiles and objects. 

In real use cases, control which views/APIs can be called or not is far more enough. 
We usually require different users have different permissions on different objects, rather than on different roles or activities.
For example, user A can edit blogs with tag "DB", while user B can add blogs with tag 'JS'.
As the tags are growing, it is impossible for developers to change the codes to adapt new tags. 
Instead, you should let the end-users to do the authorization definitions and assignments. 
In other words, You'd better to 

**Split the authorization logic apart from your application logic.** 

## Example
```javascript
var Authorization = require('node-authorization').Authorization;
var compileProfile = require('node-authorization').profileCompiler;
var fs = require('fs');

// Read the authorization profile from file system and compile it. 
// You can also store profiles in DB(recommended).
var rawProfile = JSON.parse(fs.readFileSync('./example/testProfile01', 'utf8'));
var compiledProfile = compileProfile(rawProfile);

var Authorization = new Authorization('UserID', compiledProfile);
if(!Authorization.check('blog', {Tag:'DB',ID:1000001, Action:'Add'})){
   //Report a message, and break;
}else{
   //Do the add blog;
}
```

The authorization profiles consist of authorization objects and their authorization fields and values. 
They are in JSON format and can be maintained through all possible UI tools. 
They are recommended to be saved in DB so that they can be easily associated with login user IDs. 
You can develop a role maintenance UI, which generates the authorization profiles. 
When the roles are assigned to users, the corresponding authorization profiles are also assigned.

An authorization profile example:

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

You can find more details in the `example` folder, and run the tests by typing following bash:
```bash
$ npm run test
```
 
## To Begin

1. Install it:

    ```bash
    $ npm install node-authorization --save
    ```
    
2. Require it and use:
    
   ```javascript  
   var Authorization = require('node-authorization').Authorization;
   var compileProfile = require('node-authorization').profileCompiler;
   
   var Authorization = new Authorization('UserID', compiledProfile);
   if(!Authorization.check('blog', {Tag:'DB',ID:1000001, Action:'Add'})){
       //Report a message, and break;
    }else{
       //Do the add blog;
    }   
   ```
    
## With ExpressJS and PassportJS

It is easy to confuse authentication with authorization. 
While authentication verifies the user’s identity, 
authorization verifies that the user in question has the correct permissions and rights to access the requested resource.
The two always work together. Authentication occurs first, then authorization. 

[Passport](http://passportjs.org/) is a popular **authentication** middleware which is compatible with [Express](http://expressjs.com/).
And now you can use **Node-Authorization** as an accompaniment with Passport and Express. 
You only need to do following 4 steps:

1. In your Passport login strategy, when the user identification is verified, roll-in its authorization profiles:
    ```javascript
    passport.use(new LocalStrategy(
      function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (!user.verifyPassword(password)) { return done(null, false); }
          
          //Begin profiles roll-in
          //Get user raw profiles, compile them, and save the compiled profile to the user(session) object
          ...
          user.authProfile = compileProfile(rawProfiles);
          //End profiles roll-in
          
          return done(null, user);
        });
      }
    ));
   ```

2. In the passport "serializeUser" function, save the compiled profile to the session storage:
    ```javascript
    passport.serializeUser(function(user, done) {
        //You are recommended to save the compiled authorization profile into session storage.
        //By doing this, it gains performance when you do authorization checks.
        //The "user" object is supposed like this: {id:'001'; authProfile:[...]}.
        done(null, user);
    }),
    ```

3. In the passport "deserializeUser" function, initialize the Authorization object with the session profile:
    ```javascript
    passport.deserializeUser(function(user, done) {
        if(user.id && user.authProfile)
            user.Authorization = new Authorization(user.id, user.authProfile);
    
        done(null,  user);
    });
    ```

4. In your restful APIs, embed the authorization checks:
    ```javascript
    addBlog:function(req,res){
        if(!req.user.Authorization.check('blog', {Tag:'DB', ID:req.body.blog.ID, Action:'Add'})){
            res.end('You do not have the permission to add a new blog!');
        }else
            blog.addBlog(req.body.blog, function(msg,blogId){
                ...
                res.json(msg);
            })
        }    
    },
    ```

When a user is logged on, the authorization profiles are compiled and saved in the login session storage. 
Then each time the user performs an action on an object, 
corresponding authorization checks can be done before it actually happens. 
Developers can decide where to embed the "authorization.check()" statements.

## Maintain Authorization Profile
A user can be assigned with multiple authorization profiles, and each authorization profile includes multiple authorization objects. 
Each authorization object can have more than one authorization fields. 
An authorization field is assigned with authorization values to indicate the granted permissions.

For example, the following profile contains an authorization object named "blog", which has fields "Tag", "ID", and "Action".

```javascript
[
    ...
    {
        "AuthObject": "blog",
        "AuthFieldValue":{
            "Tag": ["DB", "JS", "Algorithm"],
            "ID": [{"Operator":"Between", "Option":"Include", "Low":1000000, "High":1999999}],
            "Action": ["Post", "Edit", "Publish"]
        }
    },
    ...
]
``` 

The permission described by above profile stands for the user who is assigned can do `Post, Edit, and Publish` 
on `blogs` which are tagged with `DB, JS, or Algorithm` and whose ID are `between 1000000 and 1999999`.

The authorization value of a field is usually an array, 
which can contain elementary values(string or integer) or **Select Options**, and they can be mix. 
If you want the full permission, just assign the **"*"** character to the certain fields.

A select option is described by 4 attributes: "Operator", "Option", "Low", and "High", which are detailed bellow: 

### Operator
Now, following operators are supported:

1. **Between**: between the Low value and High value, the Low and High are both included.

2. **GreaterThan**: greater than the Low value, the High value is ignored. 

3. **LessThan**: less than the Low value, the High value is ignored. 

4. **GreaterEqual**: greater than or equal to the Low value.

5. **LessEqual**: less than or equal to the Low value.

6. **Equal**: equal to the Low value.

7. **NotEqual**: not equal to the Low value.

8. **StartsWith**: the check value is string, and starts with the Low value.

9. **EndsWith**: the check value is string, and ends with the Low value.

10. **Contains**: the check value is string, and contains the Low value.

11. **Matches**: the Low value is a regular expression.

### Option
It only contains 2 possible value: "Include" or "Exclude". 
And "Exclude" is just the complement set of "Include".

### Low & High
Stands for the lower value and higher value. 
Higher value is currently only used in the "Between" operator.


## Switch Authorization Trace
It is very useful to know which permissions are missing 
when certain authorization checks fail, or when developers want to know which authorization objects are checked
during a certain operation. 

You can switch the authorization trace on by calling following global function:

```javascript
Authorization.switchTraceOn();
```
or switch off:

```javascript
Authorization.switchTraceOff();
```

The trace result is output to the console:

```bash
The identification is vincezk
Authorization object: blog
Required permission: {"blogID":4000000,"Content":"hello good bye","Action":"Post"}
Authorization field: blogID
Required field permission: 4000000
Granted field permission:[{"Operator":"GreaterThan","Option":"Include","Low":4000000}]
```

The trace switch on/off does not require the restart of the node processes. It is a hot switch. 
If you provide a function to allow end-users to switch on/off, then it will be much more convenient.

## License
[The MIT License](http://opensource.org/licenses/MIT)