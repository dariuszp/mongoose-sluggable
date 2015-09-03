# mongoose-sluggable
Sluggable extension for Mongoose

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
| **source**  | Name of fields that will be used to create slug. You can pass string or array of strings? *Default "title"*. |
| **separator**  | Separator used to replace all non a-z and 0-9 characters. *Default "-"*. |
| **updatable**  | If set to *"false"*, not empty slug will not be changed by the plugin. *Default "true"*. |
| **asciiFolding**  | I use module diacritics to do ascii folding. Turning "ó" to "o" or "ą" to "a" etc. You can pass your own, one-parameter *function* as this parameter. |

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

**Important about separator!**
When using separator that has multiple chracters and letters since I use regexp to trim slug and remove multiple separators that appear side by side.
For example "_ Wi - Fi _" with separator "-" should be translated to "--wi---fi--" but when I replace multiple "-" as one I get "-wi-fi-" and when I trim,
I get what I wanted: "wi-fi". To do that I use regexp /[\-]+/g. "-" is replaced by any separator you choose. So be careful if you use some strange or multiple
characters.

Final example for fields "name" and "surname" translated to slug called "username":

```
schema.plugin(sluggable, {
    "field": "username",
    "source": ["name", "surname"],
    "unique": true,
    "updatable": false
});
```

Now document with name "Dariusz" and surname "Półtorak" will be translated to "dariusz-poltorak". And another document like that will receive "dariusz-poltorak-2".