var generateSlug = require('slug');
var _ = require('lodash');
var moment = require('moment');

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
        symbols = (options.symbols || options.symbols === undefined) ? true : false,
        dateFormat = options.dateFormat ? options.dateFormat : 'DD MM YYYY';

    schema.pre('save', unique, function (next, done) {
        if (updatable === false && this[slug]) {
            next();
            done();
            return;
        }

        var value = '';
        var field = '';
        var errorFields = [];
        var format = null;

        if (!Array.isArray(source)) {
          source = [source];
        }

        var array = [];
        var temp;
        for (var i = 0; i < source.length; i++) {
            field = sanitizeFieldName(_.isObject(source[i]) ? source[i].field : source[i]);
            format = _.isObject(source[i]) ? source[i].format : null;
            errorFields.push(field);
            temp = String(_.get(this, field) || '').trim();
            array.push(format ? moment(new Date(temp)).format(format) : temp);
        }
        value = array.join(separator);

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
