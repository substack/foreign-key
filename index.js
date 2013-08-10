var bytewise = require('bytewise');
var Transform = require('readable-stream/transform');
var inherits = require('inherits');

module.exports = Group;
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
