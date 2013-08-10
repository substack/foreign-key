var encode = require('bytewise').encode;
var through = require('through');
var foreign = require('../');

var db = require('level')('/tmp/foreign-test', { valueEncoding: 'json' });
db.batch(require('./hackers.json').map(function (row) {
    var key;
    if (row.type === 'hackerspace') key = [ row.name ]
    else key = [ row.space, row.name ]
    return { type: 'put', key: encode(key).toString('hex'), value: row };
}));

var g = foreign([ 'type', 'hackerspace' ], { hackers: [ 'type', 'hacker' ] });
db.createReadStream().pipe(g).pipe(through(console.log));
