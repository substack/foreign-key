var test = require('tape');
var through = require('through');
var foreign = require('../');
var levelTest = require('level-test')();

var expected = require('./hackers_expected.json');

test('hackers', function (t) {
    t.plan(1);
    
    var g = foreign([ 'type', 'hackerspace' ]);
    g.add('hackers', [ 'type', 'hacker' ], 'space');
    g.add('equipment', [ 'type', 'item' ], 'space');

    var db = levelTest('test', { valueEncoding: 'json' });
    db.batch(require('./hackers.json').map(function (row) {
        return { type: 'put', key: g.key(row.name, row), value: row };
    }));
    
    var rows = [];
    db.createReadStream()
        .pipe(g.createStream())
        .pipe(through(write, end))
    ;
    function write (row) { rows.push(row) }
    function end () {
        t.deepEqual(rows, expected)
    }
});
