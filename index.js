var bytewise = require('bytewise');
var Transform = require('readable-stream/transform');
var inherits = require('inherits');

module.exports = Foreign;
function Foreign (primary) {
    if (!(this instanceof Foreign)) return new Foreign(primary);
    this.primary = [].concat(primary);
    this.filterMap = {};
    this.keyMap = {};
}

Foreign.prototype.add = function (targetKey, filter, key) {
    this.filterMap[targetKey] = [].concat(filter);
    this.keyMap[targetKey] = [].concat(key);
    return this;
};

Foreign.prototype.key = function (fkey, row) {
    var kl = this.keyList(fkey, row);
    return kl ? encode(kl) : kl;
    
    function encode (key) {
        return bytewise.encode(key).toString('hex');
    }
};

Foreign.prototype.keyList = function (fkey, row) {
    if (match(row, this.primary)) {
        return [].concat(fkey);
    }
    
    for (var key in this.keyMap) {
        if (match(row, this.filterMap[key])
        && match(row, this.keyMap[key])) {
            return [].concat(row[this.keyMap[key][0]], key, fkey);
        }
    }
    return undefined;
};

Foreign.prototype.createStream = function () {
    return new Group(this.primary, this.filterMap);
};

inherits(Group, Transform);
function Group (primary, map) {
    if (!(this instanceof Group)) return new Group(primary, map);
    Transform.call(this, { objectMode: true });
    this.primary = primary;
    this.map = map;
}

Group.prototype._transform = function (row, enc, next) {
    if (match(row.value, this.primary)) {
        if (this.current) this.push(this.current);
        this.current = row.value;
        return next();
    }
    if (!this.current) return next();
    
    for (var key in this.map) {
        if (!match(row.value, this.map[key])) continue;
        if (!this.current[key]) this.current[key] = [];
        this.current[key].push(row.value);
        return next();
    }
    next();
};

Group.prototype._flush = function () {
    if (this.current) this.push(this.current);
    this.push(null);
};

function match (row, keys) {
    for (var i = 0, l = keys.length, node = row; i < l - 1; i++) {
        node = node[keys[i]];
    }
    return typeof node === 'object'
        ? keys[i] in node
        : keys[i] === node
    ;
}
