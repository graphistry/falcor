var Rx = require('rxjs');
var falcor = require('@graphistry/falcor');
var jsonGraph = require('@graphistry/falcor-json-graph');

falcor.Model.ref = jsonGraph.ref;
falcor.Model.atom = jsonGraph.atom;
falcor.Model.error = jsonGraph.error;
falcor.Model.undefined = jsonGraph.undefined;
falcor.Model.pathValue = jsonGraph.pathValue;
falcor.Model.pathInvalidation = jsonGraph.pathInvalidation;

Rx.Observable.return = Rx.Observable.of;

require('../src/Router');
require('./Router.spec');
