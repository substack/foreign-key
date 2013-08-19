# foreign-key

generate keys for [sorted key-value stores](https://npmjs.org/package/level)
to group and reduce rows by a foreign key

[![build status](https://secure.travis-ci.org/substack/foreign-key.png)](http://travis-ci.org/substack/foreign-key)

# example

Given some data about hackerspaces, hackers, and items:

``` json
[
  { "type": "hackerspace", "name": "sudoroom" },
  { "type": "hacker", "name": "substack", "space": "sudoroom"},
  { "type": "hackerspace", "name": "noisebridge" },
  { "type": "hacker", "name": "mitch", "space": "nosiebridge" },
  { "type": "item", "name": "3d printer", "space": "sudoroom" },
  { "type": "item", "name": "piano", "space": "sudoroom" },
  { "type": "hacker", "name": "mk30", "space": "sudoroom" },
  { "type": "hacker", "name": "rwolfe", "space": "i3" },
  { "type": "item", "name": "3d printer", "space": "noisebridge" },
  { "type": "hacker", "name": "ioerror", "space": "noisebridge" },
  { "type": "hacker", "name": "wrought", "space": "sudoroom" },
  { "type": "hacker", "name": "nbritsky", "space": "i3" },
  { "type": "item", "name": "laser cutter", "space": "noisebridge" },
  { "type": "hackerspace", "name": "i3" }
]
```

we can generate key names to efficiently group hackers and items with their
hackerspace using `"space"` as a foreign key refering to the `"name"` of a
hackerspace:

``` js
var through = require('through');
var foreign = require('foreign-key');

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
```

output:

```
{ type: 'hackerspace',
  name: 'i3',
  hackers: 
   [ { type: 'hacker', name: 'nbritsky', space: 'i3' },
     { type: 'hacker', name: 'rwolfe', space: 'i3' } ] }
{ type: 'hackerspace',
  name: 'noisebridge',
  equipment: 
   [ { type: 'item', name: '3d printer', space: 'noisebridge' },
     { type: 'item', name: 'laser cutter', space: 'noisebridge' } ],
  hackers: 
   [ { type: 'hacker', name: 'ioerror', space: 'noisebridge' },
     { type: 'hacker', name: 'mitch', space: 'nosiebridge' } ] }
{ type: 'hackerspace',
  name: 'sudoroom',
  equipment: 
   [ { type: 'item', name: '3d printer', space: 'sudoroom' },
     { type: 'item', name: 'piano', space: 'sudoroom' } ],
  hackers: 
   [ { type: 'hacker', name: 'mk30', space: 'sudoroom' },
     { type: 'hacker', name: 'substack', space: 'sudoroom' },
     { type: 'hacker', name: 'wrought', space: 'sudoroom' } ] }
```

# methods

``` js
var foreign = require('foreign-key')
```

## var g = foreign(primaryFilter)

Create a new foreign key instance `g` that pivots on the rows matching
`primaryFilter`.

## g.add(targetKey, filter, foreignKey)

Insert rows matching `filter` into rows matching `primaryFilter` at the location
into primary rows `targetKey`.

## g.key(key, row)

Return the new key to use for the ordinary unique identifier `key` given the
foreign key rules applicable to `row`.

## g.keyList(key, row)

Return the array of elements that `g.key()` passes to
[`bytewise.encode()`](https://npmjs.org/package/bytewise).

## g.createStream()

Create a through stream that takes row objects as input and combines results
from added secondary rows into primary rows.

# install

With [npm](https://npmjs.org) do:

```
npm install foreign-key
```

# license

MIT
