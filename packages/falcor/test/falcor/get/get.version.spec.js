var falcor = require("./../../../lib/");
var Model = falcor.Model;
var expect = require('chai').expect;

describe('getVersion', function() {
    it('should get a version from the root model', function() {
        var model = new Model({ cache: { hello: 'world'} });
        var version = model.getVersion();
        expect(version).to.equal(0);
    });
    it('should get a version from a leaf path', function() {
        var model = new Model({ cache: { hello: 'world'}});
        var version = model.getVersion(['hello']);
        expect(version).to.equal(0);
    });
    it('should get -1 from a leaf path if no value exists.', function() {
        var model = new Model({ cache: { hello: 'world'}});
        var version = model.getVersion(['world']);
        expect(version).to.equal(-1);
    });
    it('should get an incremented version from the root model after a write', function() {
        var model = new Model({ cache: { hello: 'world'} });
        var version = model.getVersion();
        expect(version).to.equal(0);
        model.setValue(['hello'], 'internet').subscribe();
        expect(model.getVersion()).to.equal(1);
    });
    it('should get an incremented version from a leaf path after a write', function() {
        var model = new Model({ cache: { hello: 'world'}});
        var version = model.getVersion(['hello']);
        expect(version).to.equal(0);
        model.setValue(['hello'], 'internet').subscribe();
        expect(model.getVersion(['hello'])).to.equal(1);
    });
    it('should only increment the version by one per cache write', function() {
        var model = new Model({ cache: { hello: 'world'} });
        var version = model.getVersion();
        expect(version).to.equal(0);
        model.set(
            { path: ['hello'], value: 'internet' },
            { path: ['I', 'am'], value: 'setting' },
            { path: ['lots', 'of'], value: 'values at once' }
        ).subscribe();
        expect(model.getVersion()).to.equal(1);
    });
});
