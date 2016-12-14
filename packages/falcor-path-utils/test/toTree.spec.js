var expect = require('chai').expect;
var toTree = require('../lib/toTree');
var toPaths = require('../lib/toPaths');
var toCollapseMap = require('../lib/toCollapseMap');
var toCollapseTrees = require('../lib/toCollapseTrees');
var materializedAtom = require('../lib/support/materializedAtom');

describe('toTree', function() {
    it('should explode a simplePath.', function() {
        var input = ['one', 'two'];
        var out = {one: {two: null}};

        expect(toTree([input])).to.deep.equals(out);
    });

    it('should explode a complex.', function() {
        var input = ['one', ['two', 'three']];
        var out = {one: {three: null, two: null}};

        expect(toTree([input])).to.deep.equals(out);
    });

    it('should explode a set of complex and simple paths.', function() {
        var input = [
            ['one', ['two', 'three']],
            ['one', {from: 0, to: 3}, 'summary']
        ];
        var out = {
            one: {
                three: null,
                two: null,
                0: { summary: null },
                1: { summary: null },
                2: { summary: null },
                3: { summary: null }
            }
        };

        expect(toTree(input)).to.deep.equals(out);
    });

    it('should translate between toPaths and toTrees', function() {
        var input = [
            ['one', ['two', 'three']],
            ['one', {from: 0, to: 3}, 'summary']
        ];
        var treeMap = {
            2: toTree([input[0]]),
            3: toTree([input[1]])
        };
        var output = toPaths(treeMap);
        output[0][1] = output[0][1].sort().reverse();

        expect(output).to.deep.equals(input);
    });

    it('should insert nulls with special key name', function() {
        var input = [
            ['one', ['two', 'three'], null],
            ['one', {from: 0, to: 3}, null]
        ];
        var out = {
            one: {
                three: materializedAtom,
                two: materializedAtom,
                0: materializedAtom,
                1: materializedAtom,
                2: materializedAtom,
                3: materializedAtom
            }
        };

        expect(toTree(input)).to.deep.equals(out);
    });

    it('should collapse variable length paths with toCollapseMap and toCollapseTrees', function() {

        var input = [
            [
                ['one', 'two'],
                ['one', 'three']
            ],
            [
                ['one', ['two', 'three'], null],
                ['one', {from: 0, to: 3}, ['summary']]
            ]
        ];

        var expected = [
            ['one', ['three', 'two']],
            ['one', {from: 0, to: 3}, 'summary'],
            ['one', ['three', 'two'], null]
        ];

        var output = toPaths(toCollapseTrees(
            input.reduce(function(collapseMap, paths) {
                return toCollapseMap(paths, collapseMap);
            }, {})
        ));

        expect(output).to.deep.equals(expected);
    });
});

