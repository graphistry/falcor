var MAX_PATHS = 9000;
var MAX_REF_FOLLOW = 50;
var Keys = require('./Keys');
var parseTree = require('./parse-tree');
var matcher = require('./operations/matcher');
var JSONGraphError = require('./errors/JSONGraphError');
var flatBufferToRoutes = require('@graphistry/falcor-path-utils/lib/flatBufferToRoutes');

var Router = function(routes, options) {

    var opts = options || {};

    this._debug = opts.hasOwnProperty('debug') ? !!opts.debug : this._debug;
    this.maxPaths = opts.hasOwnProperty('maxPaths') ? opts.maxPaths : MAX_PATHS;
    this._streaming = opts.hasOwnProperty('streaming') ? !!opts.streaming : this._streaming;
    this.maxRefFollow = opts.hasOwnProperty('maxRefFollow') ? opts.maxRefFollow : MAX_REF_FOLLOW;
    this._bufferTime = opts.hasOwnProperty('bufferTime') ? Math.abs(opts.bufferTime || 0) : this._bufferTime;

    if (!this._rst || this._routes !== routes) {
        if (!Array.isArray(routes)) {
            routes = flatBufferToRoutes(routes);
        }
        this._routes = routes;
        this._rst = parseTree(routes);
        this._matcher = matcher(this._rst);
    }
};

Router.createClass = function(routes, options) {

    C.prototype = new Router(routes, options);
    C.prototype.constructor = C;

    return C;

    function C(options) {
        Router.call(this, this._routes, options);
    }
};

Router.prototype = {
    _debug: false,
    _bufferTime: 0,
    _streaming: false,
    /**
     * Performs the get algorithm on the router.
     * @param {PathSet[]} paths -
     * @returns {Observable.<JSONGraphEnvelope>}
     */
    get: require('./router/get'),

    /**
     * Takes in a jsonGraph and outputs a Observable.<jsonGraph>.  The set
     * method will use get until it evaluates the last key of the path inside
     * of paths.  At that point it will produce an intermediate structure that
     * matches the path and has the value that is found in the jsonGraph env.
     *
     * One of the requirements for interaction with a dataSource is that the
     * set message must be optimized to the best of the incoming sources
     * knowledge.
     *
     * @param {JSONGraphEnvelope} jsonGraph -
     * @returns {Observable.<JSONGraphEnvelope>}
     */
    set: require('./router/set'),

    /**
     * Invokes a function in the DataSource's JSONGraph object at the path
     * provided in the callPath argument.  If there are references that are
     * followed, a get will be performed to get to the call function.
     *
     * @param {Path} callPath -
     * @param {Array.<*>} args -
     * @param {Array.<PathSet>} refPaths -
     * @param {Array.<PathSet>} thisPaths -
     */
    call: require('./router/call'),

    /**
     * When a route misses on a call, get, or set the unhandledDataSource will
     * have a chance to fulfill that request.
     * @param {DataSource} dataSource -
     */
    routeUnhandledPathsTo: function routeUnhandledPathsTo(dataSource) {
        this._unhandled = dataSource;
        return this;
    }
};

Router.ranges = Keys.ranges;
Router.integers = Keys.integers;
Router.keys = Keys.keys;
Router.JSONGraphError = JSONGraphError;
module.exports = Router;


