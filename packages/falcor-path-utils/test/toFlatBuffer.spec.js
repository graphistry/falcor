var expect = require('chai').expect;
var toPaths = require('../lib/toPaths');
var toFlatBuffer = require('../lib/toFlatBuffer');
var toCollapseMap = require('../lib/toCollapseMap');
var toCollapseTrees = require('../lib/toCollapseTrees');
var computeFlatBufferHash = require('../lib/computeFlatBufferHash');

describe('toFlatBuffer', function() {
    it('should build a flatBuffer from paths', function() {

        var path = ['videos', [0, { from: 1, length: 1 }], 'title'];

        expect(toFlatBuffer([path])).to.deep.equal({
            $keys: ['videos'],
            $keysMap: {
                'videos': 0
            },
            0: {
                $keys: [0, { from: 1, length: 1 }],
                $keysMap: { 0: 0, '[1..1]': 1 },
                0: {
                    $keys: ['title'],
                    $keysMap: { 'title': 0 }
                },
                1: {
                    $keys: ['title'],
                    $keysMap: { 'title': 0 }
                }
            }
        });
    });
    it('should compute correct hashcodes for a flatBuffer', function() {

        var path = ['videos', [0, { from: 1, length: 1 }], 'title'];

        expect(computeFlatBufferHash(toFlatBuffer([path]))).to.deep.equal({
            $code: '15293993',
            $keys: ['videos'],
            $keysMap: { videos: 0 },
            '0': {
                $code: '1236527484',
                $keys: [0, { from: 1, length: 1 }],
                $keysMap: { 0: 0, '[1..1]': 1 },
                0: {
                    $code: '165499941',
                    $keys: ['title'],
                    $keysMap: { title: 0 }
                },
                1: {
                    $code: '165499941',
                    $keys: ['title'],
                    $keysMap: { title: 0 }
                }
            }
        });
    });
    it('should collapse mixed args', function() {

        var path = ['videos', [0, { from: 1, length: 1 }], 'title'];
        var flatBuf = toFlatBuffer([path]);

        expect(toFlatBuffer([path, flatBuf]))
            .to.deep.equal(toFlatBuffer([path]));
    });
    it('should compute identical hashcodes for collapsed mixed args', function() {

        var path = ['videos', [0, { from: 1, length: 1 }], 'title'];
        var flatBuf = toFlatBuffer([path]);
        var actual = computeFlatBufferHash(toFlatBuffer([flatBuf, path]))
        var expected = computeFlatBufferHash(toFlatBuffer([path]));

        expect(actual).to.deep.equal(expected);
    });


    it('should collapse variable length paths with toCollapseMap and toCollapseTrees', function() {

        var input = [
            toFlatBuffer([
                ['one', 'two'],
                ['one', 'three']
            ]),
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
