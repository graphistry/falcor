var toTree = require('../lib/toTree');
var toPaths = require('../lib/toPaths');
var expect = require('chai').expect;

describe('toTree', function() {
    it('should explode a simplePath.', function() {
        var input = ['one', 'two'];
        var out = {one: {two: undefined}};

        expect(toTree([input])).to.deep.equals(out);
    });

    it('should explode a complex.', function() {
        var input = ['one', ['two', 'three']];
        var out = {one: {three: undefined, two: undefined}};

        expect(toTree([input])).to.deep.equals(out);
    });

    it('should explode a set of complex and simple paths.', function() {
        var input = [
            ['one', ['two', 'three']],
            ['one', {from: 0, to: 3}, 'summary']
        ];
        var out = {
            one: {
                three: undefined,
                two: undefined,
                0: { summary: undefined },
                1: { summary: undefined },
                2: { summary: undefined },
                3: { summary: undefined }
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
                three: { $__null__$: undefined },
                two: { $__null__$: undefined },
                0: { $__null__$: undefined },
                1: { $__null__$: undefined },
                2: { $__null__$: undefined },
                3: { $__null__$: undefined }
            }
        };

        expect(toTree(input)).to.deep.equals(out);
    });
});

