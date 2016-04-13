# mongoose-sluggable
Sluggable extension for Mongoose

### 0.7.0
unchecked, 0.7 throw out asci folding and replacement method for characters and use "slug" module from NPM.
It's awesome module that do both ascii folding and utf-8 symbols translation, one hell of a module for slug.

### How to use?

After you create mongoose schema, you need to add field that will contain slug. Example:

````
var schema = new Schema({
    title: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        index: true,
        unique: true,
        trim: true
    }
});
````

**Remember!**
Plugin will *NOT* create field for you. I hate when plugins do magic behind scenes and I write my things in mind that
nothing should happen without programmer knowledge. Plugin will not work if no slug field is created.
Also, do **NOT** make slug field required since it's generated right before save so validation will catch it and return error on save on first try.

Then add plugin:

````
var sluggable = require('mongoose-sluggable');
schema.plugin(sluggable);
````

You can add some options if you like:

| Option  | Description |
| ------------- | ------------- |
| **field**  | Name of field that will be used to store slug. *Default "slug"* |
| **unique**  | Should slug be unique for this collection? *Default "false"*. |
| **source**  | Name of fields that will be used to create slug. You can pass string, an array of strings or a function? *Default "title"*. |
| **separator**  | Separator used to replace all non a-z and 0-9 characters. *Default "-"*. |
| **updatable**  | If set to *"false"*, not empty slug will not be changed by the plugin. *Default "true"*. |
| **charmap**  | Set a char map to replace unhandled characters. *Default "true"*. |
| **multicharmap**  | Set a multi char map to replace unhandled characters. *Default "true"*. |

More about charmap and multicharmap in slug module:
https://www.npmjs.com/package/slug

**About unique!**
When using "unique: true", sluggable extension will not throw error or anything when slug exists. It will append separator and number at the end. So "John Rambo" will get you:
 - john-rambo
 - john-rambo-2
 - john-rambo-3
 - ...etc...

 To check if slug is unique, plugin will make a query to database like this:
 ````
model.findOne({
    field: 'current-slug'
}, function (err, data) {
    // logic
});
 ````

 Where "field" is name of the field that is used to store slug (parameter from table above).

Final example for fields "name" and "surname" translated to slug called "username":

```
schema.plugin(sluggable, {
    "field": "username",
    "source": ["name", "surname"],
    "unique": true,
    "updatable": false
});
```

Example for source as function:  

```
var slugSource = function(doc, seperator){
    if(doc.role = 'COMPANY') {
        return String(doc.title || '').trim();
    }
    else {
        return String(doc.firstName + seperator + doc.lastName || '').trim();
    }
};
schema.plugin(sluggable, {
    "field": "username",
    "source": slugSource,
    "unique": true,
    "updatable": false
});
```

Now document with name "Dariusz" and surname "Półtorak" will be translated to "dariusz-poltorak". And another document like that will receive "dariusz-poltorak-2".
