var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var toTree = require('@graphistry/falcor-path-utils').toTree;
var jsonGraph = require('@graphistry/falcor-json-graph');
var ref = jsonGraph.ref;
var error = jsonGraph.error;
var _ = require('lodash');

describe('Errors', function() {
    var expired = error('expired');
    expired.$expires = Date.now() - 1000;

    var errorCache = function() {
        return {
            reference: ref(['to', 'error']),
            to: {
                error: error('Oops!'),
                expired: expired,
                title: 'Hello World'
            },
            list: {
                0: ref(['to']),
                1: ref(['to', 'error'])
            }
        };
    };

    it('should report error with path.', function() {
        getCoreRunner({
            input: [['to', 'error']],
            output: { },
            errors: [{
                path: ['to', 'error'],
                value: 'Oops!'
            }],
            cache: errorCache
        });
    });
    it('should report error path with null from reference.', function() {
        getCoreRunner({
            input: [['reference', 'title']],
            output: { },
            errors: [{
                path: ['reference', null],
                value: 'Oops!'
            }],
            cache: errorCache
        });
    });
    it('should report error with path in treatErrorsAsValues.', function() {
        getCoreRunner({
            stripMetadata: false,
            input: [['to', 'error']],
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]:    undefined,
                        [f_meta_deref_from]:  undefined,
                        [f_meta_deref_to]:    undefined,
                        [f_meta_version]:     0
                    },
                    to: {
                        [f_meta_data]: {
                            [f_meta_abs_path]:    ['to'],
                            [f_meta_deref_from]:  undefined,
                            [f_meta_deref_to]:    undefined,
                            [f_meta_version]:     0
                        },
                        error: 'Oops!'
                    }
                }
            },
            treatErrorsAsValues: true,
            cache: errorCache
        });
    });
    it('should report error with path in treatErrorsAsValues and boxValues.', function() {
        getCoreRunner({
            stripMetadata: false,
            input: [['to', 'error']],
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]:    undefined,
                        [f_meta_deref_from]:  undefined,
                        [f_meta_deref_to]:    undefined,
                        [f_meta_version]:     0
                    },
                    to: {
                        [f_meta_data]: {
                            [f_meta_abs_path]:    ['to'],
                            [f_meta_deref_from]:  undefined,
                            [f_meta_deref_to]:    undefined,
                            [f_meta_version]:     0
                        },
                        error: error('Oops!')
                    }
                }
            },
            treatErrorsAsValues: true,
            boxValues: true,
            cache: errorCache
        });
    });
    it('should not report an expired error.', function() {
        getCoreRunner({
            input: [['to', 'expired']],
            output: { },
            optimizedMissingPaths: [
                ['to', 'expired']
            ],
            cache: errorCache
        });
    });

    it('should report both values and errors when error is less length than value path.', function() {
        getCoreRunner({
            stripMetadata: false,
            input: [
                ['list', {to: 1}, 'title']
            ],
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]:    undefined,
                        [f_meta_deref_from]:  undefined,
                        [f_meta_deref_to]:    undefined,
                        [f_meta_version]:     0
                    },
                    list: {
                        [f_meta_data]: {
                            [f_meta_abs_path]:    ['list'],
                            [f_meta_deref_from]:  undefined,
                            [f_meta_deref_to]:    undefined,
                            [f_meta_version]:     0
                        },
                        0: {
                            [f_meta_data]: {
                                [f_meta_abs_path]:    ['to'],
                                [f_meta_deref_from]:  undefined,
                                [f_meta_deref_to]:    undefined,
                                [f_meta_version]:     0
                            },
                            title: 'Hello World'
                        }
                    }
                }
            },
            errors: [{
                path: ['list', 1, null],
                value: 'Oops!'
            }],
            cache: errorCache
        });
    });
});

