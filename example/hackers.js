var through = require('through');
var foreign = require('../');

var g = foreign([ 'type', 'hackerspace' ]);
g.add('hackers', [ 'type', 'hacker' ], 'space');
g.add('equipment', [ 'type', 'item' ], 'space');

var db = require('level')('/tmp/foreign-test', { valueEncoding: 'json' });
db.batch(require('./hackers.json').map(function (row) {
    return { type: 'put', key: g.key(row.name, row), value: row };
}));

db.createReadStream()
    .pipe(g.createStream())
    .pipe(through(console.log))
;
