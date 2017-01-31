var falcor = require('./../../../falcor.js');
var Model = falcor.Model;
var expect = require('chai').expect;
var sinon = require('sinon');
var noOp = function() {};

describe('Caching Issues', function() {
    it('should be able to use a model as a source.', function() {
        var source = new Model({
            cache: {
                lolomo: {
                    summary: {}
                }
            }
        }).asDataSource();

        var model = new Model({source: source});

        expect(model.batch().setCache);
    });

    it('should ensure that cache remains consistent among its clones.', function() {
        var source = new Model({
            cache: {
                lolomo: {
                    summary: 'this is a lolomo'
                }
            }
        });
        var clone = source._clone({});
        var resSource = source._getPathValuesAsPathMap(source, [['lolomo', 'summary']], {}, false, true);
        var resClone = clone._getPathValuesAsPathMap(clone, [['lolomo', 'summary']], {}, false, true);
        expect(resClone).to.deep.equals(resSource);

        source.setCache({
            lolomo: {
                name: 'Terminator 2'
            }
        });
        resSource = source._getPathValuesAsPathMap(source, [['lolomo', 'name']], {}, false, true);
        resClone = clone._getPathValuesAsPathMap(clone, [['lolomo', 'name']], {}, false, true);
        expect(resClone).to.deep.equals(resSource);
    });
});
