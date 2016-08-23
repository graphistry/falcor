var expect = require('chai').expect;
var toPaths = require('../lib/toPaths');
var toTree = require('../lib/toTree');

describe('toPaths', function() {
    it('toPaths a pathmap that has overlapping branch and leaf nodes', function() {

        var pathMaps = [null, {
            lolomo: 1
        }, {
            lolomo: {
                summary: 1,
                13: 1,
                14: 1
            }
        }, {
            lolomo: {
                15: {
                    rating: 1,
                    summary: 1
                },
                13: {
                    summary: 1
                },
                16: {
                    rating: 1,
                    summary: 1
                },
                14: {
                    summary: 1
                },
                17: {
                    rating: 1,
                    summary: 1
                }
            }
        }];

        var paths = toPaths(pathMaps).sort(function(a, b) {
            return a.length - b.length;
        });

        var first = paths[0];
        var second = paths[1];
        var third = paths[2];
        var fourth = paths[3];

        expect(first[0] === 'lolomo').to.equal(true);

        expect((
            second[0] === 'lolomo')   && (
            second[1][0] === 13) && (
            second[1][1] === 14) && (
            second[1][2] === 'summary')
        ).to.equal(true);

        expect((third[0] === 'lolomo') && (
            third[1].from === 13)   && (
            third[1].to === 14)     && (
            third[2] === 'summary')
        ).to.equal(true);

        expect((fourth[0] === 'lolomo') && (
            fourth[1].from === 15)   && (
            fourth[1].to === 17)     && (
            fourth[2][0] === 'rating')  && (
            fourth[2][1] === 'summary')
        ).to.equal(true);
    });


    it('should explode a simplePath.', function() {
        var out = ['one', 'two'];
        var input = {2: {one: {two: undefined}}};

        expect(toPaths(input)).to.deep.equals([out]);
    });

    it('should explode a complex.', function() {
        var input = {2: {one: {two: undefined, three: undefined}}};
        var out = ['one', ['three', 'two']];
        var output = toPaths(input);
        output[0][1].sort();

        expect(output).to.deep.equals([out]);
    });

    it('should explode a set of complex and simple paths.', function() {
        var out = [
            ['one', ['three', 'two']],
            ['one', {from: 0, to: 3}, 'summary']
        ];
        var input = {
            2: {
                one: {
                    three: undefined,
                    two: undefined
                }
            },
            3: {
                one: {
                    0: { summary: undefined },
                    1: { summary: undefined },
                    2: { summary: undefined },
                    3: { summary: undefined }
                }
            }
        };

        var output = toPaths(input);
        if (!Array.isArray(output[0][1])) {
            var tmp = output[0];
            output[0] = output[1];
            output[1] = tmp;
        }

        output[0][1].sort();

        expect(output).to.deep.equals(out);
    });

    it('should translate between toPaths and toTrees', function() {
        var expectedTree = {
            one: {
                0: { summary: undefined },
                1: { summary: undefined },
                2: { summary: undefined },
                3: { summary: undefined },
                three: undefined,
                two: undefined
            }
        };
        var treeMap = {
            2: {
                one: {
                    three: undefined,
                    two: undefined
                }
            },
            3: {
                one: {
                    0: { summary: undefined },
                    1: { summary: undefined },
                    2: { summary: undefined },
                    3: { summary: undefined }
                }
            }
        };

        expect(toTree(toPaths(treeMap))).to.deep.equals(expectedTree);
    });

    it('should insert nulls at the end of paths', function() {
        var out = [
            ['one', [0, 1, 2, 3, 'three', 'two', ], null]
        ];
        var input = {
            3: {
                one: {
                    three: { $__null__$: undefined },
                    two: { $__null__$: undefined },
                    0: { $__null__$: undefined },
                    1: { $__null__$: undefined },
                    2: { $__null__$: undefined },
                    3: { $__null__$: undefined }
                }
            }
        };

        var output = toPaths(input);
        if (!Array.isArray(output[0][1])) {
            var tmp = output[0];
            output[0] = output[1];
            output[1] = tmp;
        }

        output[0][1].sort();

        expect(output).to.deep.equals(out);
    });
});

