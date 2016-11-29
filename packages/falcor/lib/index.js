var Model = require('./Model');
var FalcorJSON = require('./cache/get/json/FalcorJSON');

function falcor(opts) {
    if (!(this instanceof Model)) {
        return new Model(opts);
    }
    Model.call(this, opts);
}

falcor.prototype = Object.create(Model.prototype);

falcor['Model'] = Model;
falcor['FalcorJSON'] = FalcorJSON;
falcor['toProps'] = FalcorJSON.prototype.toProps;

module.exports = falcor;
