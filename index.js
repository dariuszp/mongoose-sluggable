var generateSlug = require('slug');

function sanitizeFieldName(val) {
    val = String(val).trim();
    if (val.length === 0) {
        throw new Error('Invalid source');
    }
    return val;
}

module.exports = exports = function sluggablePlugin(schema, options) {
    options = options || {};
    var slug = options.field ? String(options.field) : 'slug',
        unique = options.unique ? true : false,
        source = options.source ? options.source : 'title',
        separator = options.separator ? String(options.separator) : '-',
        updatable = ((options.updatable) || (options.updatable === undefined)) ? true : false,
        charmap = (options.charmap) ? options.charmap : generateSlug.charmap,
        multicharmap = (options.multicharmap) ? options.multicharmap : generateSlug.multicharmap,
        symbols = (options.symbols || options.symbols === undefined) ? true : false;

    schema.pre('save', unique, function (next, done) {
        if (updatable === false && this[slug]) {
            next();
            done();
            return;
        }

        var value = '',
        field = '',
        errorFields = [];
        if (typeof source === 'string') {
            field = sanitizeFieldName(source);
            errorFields.push(field);
            value = String(this[field] || '').trim();
        } else if (source instanceof Array) {
            var array = [],
                i;
            for (i = 0; i < source.length; i++) {
                field = sanitizeFieldName(source[i]);
                errorFields.push(field);
                array.push(String(this[field] || '').trim());
            }
            value = array.join(separator);
        } else if(Object.prototype.toString.call(source) == '[object Function]') {
            value = source(this, separator);
        } else {
            throw new Error('Source can be an array or a string');
        }

        value = generateSlug(value, {
            replacement: separator,
            lower: true,
            charmap: charmap,
            multicharmap: multicharmap,
            symbols: symbols
        });

        if (value.length === 0) {
            throw new Error('One of the fields is requried: ' + String(errorFields.join(', ')));
        }

        if (!unique) {
            this[slug] = value;
            next();
            return;
        }

        var where = {},
            suffix = 1,
            self = this;

        function findNewSlug(search) {
            where[slug] = search;
            where['_id'] = { '$ne': self._id };
            self.constructor.findOne(where, function (err, data) {
                if (err) {
                    throw err;
                }
                if (!data) {
                    self[slug] = search;
                    next();
                    done();
                    return;
                }
                findNewSlug(String(value) + String(separator) + String(++suffix));
            });
        }

        findNewSlug(value);
    });
};
