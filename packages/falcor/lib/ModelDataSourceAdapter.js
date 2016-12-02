function ModelDataSourceAdapter(model) {
    this._model = model
        // .boxValues()
        ._materialize().treatErrorsAsValues();
}

ModelDataSourceAdapter.prototype.get = function get(pathSets) {
    return this._model.get.apply(this._model, pathSets)._toJSONG();
};

ModelDataSourceAdapter.prototype.set = function set(jsongResponse) {
    return this._model.set(jsongResponse)._toJSONG();
};

ModelDataSourceAdapter.prototype.call = function call(path, args, suffixes, paths) {
    return this._model.call.apply(this._model, [
        path, args, suffixes
    ].concat(paths))._toJSONG();
};

module.exports = ModelDataSourceAdapter;
