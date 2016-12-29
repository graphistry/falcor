var expect = require('chai').expect;
var toPaths = require('../lib/toPaths');
var template = require('../lib/template');
var pathsParser = require('../lib/paths-parser');
var toFlatBuffer = require('@graphistry/falcor-path-utils/lib/toFlatBuffer');
var flatBufferToPaths = require('@graphistry/falcor-path-utils/lib/flatBufferToPaths');
var computeFlatBufferHash = require('@graphistry/falcor-path-utils/lib/computeFlatBufferHash');

describe('Paths', function() {
    it('should allow null at the end of paths', function() {
        expect(toPaths`{
            value: {
                ${null}
            }
        }`).to.deep.equal([['value', null]]);
    });
    it('should allow string keys in array indexers', function() {
        expect(toPaths`{
            ['background', 'foreground']: {
                color
            }
        }`).to.deep.equal([
            ['background', 'color'],
            ['foreground', 'color'],
        ]);
    });
    it('should tolerate dangling commas', function() {
        expect(toPaths`{
            ['background', 'foreground',]: {
                color,
            },
        }`).to.deep.equal([
            ['background', 'color'],
            ['foreground', 'color'],
        ]);
    });
    it('should allow template literal array indexers', function() {
        var keys = ['background', 'foreground'];

        expect(toPaths`{
            [${keys}]: {
                color
            }
        }`).to.deep.equal([
            ['background', 'color'],
            ['foreground', 'color'],
        ]);
    });
    it('should allow unescaped identifiers in array indexers', function() {
        expect(toPaths`{
            [background, foreground]: {
                color
            }
        }`).to.deep.equal([
            ['background', 'color'],
            ['foreground', 'color'],
        ]);
    });
    it('should allow hyphens in identifier names', function() {
        expect(toPaths`{
            title-0: {
                name,
                rating,
                box-shot
            }
        }`).to.deep.equal([
            ['title-0', ['name', 'rating', 'box-shot']]
        ]);
    });
    it('should accept range to syntax', function() {
        expect(toPaths`{
            titles: {
                length,
                [0..9]: {
                    name,
                    rating,
                    box-shot
                }
            }
        }`).to.deep.equal([
            ['titles', { from:0, length:10 }, ['name', 'rating', 'box-shot']],
            ['titles', 'length']
        ]);
    });
    it('should accept range length syntax', function() {
        expect(toPaths`{
            titles: {
                length,
                [0...9]: {
                    name,
                    rating,
                    box-shot
                }
            }
        }`).to.deep.equal([
            ['titles', { from:0, length:9 }, ['name', 'rating', 'box-shot']],
            ['titles', 'length']
        ]);
    });
    it('should accept range objects and convert to => length', function() {
        var range = { from: 0, to: 9 };

        expect(toPaths`{
            titles: {
                length,
                [${range}]: {
                    name,
                    rating,
                    box-shot
                }
            }
        }`).to.deep.equal([
            ['titles', { from:0, length:10 }, ['name', 'rating', 'box-shot']],
            ['titles', 'length']
        ]);
    });
    it('should invert backwards ranges', function() {
        expect(toPaths`{
            titles: {
                length,
                [9..0]: {
                    name,
                    rating,
                    box-shot
                }
            }
        }`).to.deep.equal([
            ['titles', { from:0, length:10 }, ['name', 'rating', 'box-shot']],
            ['titles', 'length']
        ]);
    });
    it('should coerce undefined to 0-length ranges 1', function() {
        expect(toPaths`{
            titles: {
                length,
                [10...${undefined}]: {
                    name,
                    rating,
                    box-shot
                }
            }
        }`).to.deep.equal([
            ['titles', { from:0, length:0 }, ['name', 'rating', 'box-shot']],
            ['titles', 'length']
        ]);
    });
    it('should coerce undefined to 0-length ranges 2', function() {
        expect(toPaths`{
            titles: {
                length,
                [10..${undefined}]: {
                    name,
                    rating,
                    box-shot
                }
            }
        }`).to.deep.equal([
            ['titles', { from:0, length:0 }, ['name', 'rating', 'box-shot']],
            ['titles', 'length']
        ]);
    });
    it('should merge ... queries', function() {
        var range = { length: 10 };
        expect(toPaths`{
            titles: {
                length,
                [${range}]: {
                    ... {name},
                    ... {rating, box-shot}
                }
            }
        }`).to.deep.equal([
            ['titles', { from:0, length:10 }, ['name', 'rating', 'box-shot']],
            ['titles', 'length']
        ]);
    });
    it('should merge nested ... queries', function() {
        var range = { to: 9 };
        expect(toPaths`{
            titles: {
                ... {length},
                ... {
                    [${range}]: {
                        ... {name},
                        ... {rating, box-shot}
                    }
                }
            }
        }`).to.deep.equal([
            ['titles', { from:0, length:10 }, ['name', 'rating', 'box-shot']],
            ['titles', 'length']
        ]);
    });
    it('should ignore empty ... queries', function() {
        expect(toPaths`{
            titles: {
                ... { },
                ... {
                    [9..0]: {
                        ... { },
                        ... {rating, box-shot}
                    }
                }
            }
        }`).to.deep.equal([
            ['titles', { from:0, length:10 }, ['rating', 'box-shot']]
        ]);
    });
    it('should do all the things at once', function() {
        var range = { from: 9, length: 2 };
        expect(toPaths`{
            genreLists: {
                length,
                [10...1]: {
                    name,
                    rating,
                    color: { ${null} },
                    titles: {
                        length,
                        [${range}]: {
                            ... {name},
                            ... {rating, box-shot}
                        }
                    }
                }
            }
        }`).to.deep.equal([
            ['genreLists', { from: 1, length: 9 }, 'color', null],
            ['genreLists', { from: 1, length: 9 }, 'titles', { from: 9, length: 2 }, ['name', 'rating', 'box-shot']],
            ['genreLists', { from: 1, length: 9 }, 'titles', 'length'],
            ['genreLists', { from: 1, length: 9 }, ['name', 'rating']],
            ['genreLists', 'length']
        ]);
        var stringifiedResults = template`{
            genreLists: {
                length,
                [10...1]: {
                    name,
                    rating,
                    color: { ${null} },
                    titles: {
                        length,
                        [${range}]: {
                            name,
                            rating,
                            box-shot
                        }
                    }
                }
            }
        }`;
        expect(pathsParser.parse(stringifiedResults[0])).to.deep.equal({
            '0': {
                '1': {
                    '2': {
                        '$keys': [null]
                    },
                    '3': {
                        '1': {
                            '$keys': ['name', 'rating', 'box-shot']
                        },
                        '$keys': ['length', { from: 9, length: 2 }]
                    },
                    '$keys': ['name', 'rating', 'color', 'titles']
                },
                '$keys': ['length', { from: 1, length: 9 }]
            },
            '$keys': ['genreLists']
        });
    });
    it('should collapse duplicate keys when exploded and recollapsed', function() {
        var range = { from: 10, to: 9 };
        var flatBuf = toFlatBuffer(toPaths`{
            genreLists: {
                length,
                [0...${undefined}]: {
                    name, rating
                },
                [1..10]: {
                    summary
                }
            },
            ...{
                genreLists: {
                    length,
                    [10..1]: {
                        name, rating,
                        color: { ${null} },
                        titles: {
                            length,
                            [${range}]: {
                                ... {name},
                                ... {rating, box-shot}
                            }
                        }
                    }
                }
            }
        }`);
        expect(flatBuf).to.deep.equal({
            '0': {
                '0': {
                    '1': {
                        '$keys': [null],
                        '$keysMap': { null: 0 }
                    },
                    '2': {
                        '0': {
                            '$keys': ['name', 'rating', 'box-shot'],
                            '$keysMap': { name: 0, rating: 1, 'box-shot': 2 }
                        },
                        '$keys': [{ from: 9, length: 2 }, 'length'],
                        '$keysMap': { '[9..10]': 0, length: 1 }
                    },
                    '$keys': ['summary', 'color', 'titles', 'name', 'rating'],
                    '$keysMap': { summary: 0, color: 1, titles: 2, name: 3, rating: 4 }
                },
                '$keys': [{ from: 1, length: 10 }, 'length'],
                '$keysMap': { '[1..10]': 0, length: 1 }
            },
            '$keys': ['genreLists'],
            '$keysMap': { genreLists: 0 }
        });
        expect(flatBufferToPaths(flatBuf)).to.deep.equal([
            [
                'genreLists',
                {from: 1,length: 10},
                'color', null
            ],
            [
                'genreLists',
                {from: 1,length: 10},
                'titles',
                {from: 9,length: 2},
                ['name', 'rating', 'box-shot']
            ],
            [
                'genreLists',
                {from: 1, length: 10},
                'titles', 'length'
            ],
            [
                'genreLists',
                {from: 1,length: 10},
                ['summary', 'name', 'rating']
            ],
            ['genreLists', 'length']
        ]);
    });
});
