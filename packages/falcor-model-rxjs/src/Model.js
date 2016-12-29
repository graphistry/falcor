import { Observable } from 'rxjs/Observable';
import { Model as FalcorModel } from '@graphistry/falcor';
import { fromPath, fromPathsOrPathValues } from '@graphistry/falcor-path-syntax';

export class Model extends FalcorModel {
    /* implement inspect method for node's inspect utility */
    inspect() {
        return `{ v:${this.getVersion()} p:[${this._path.join(', ')}] }`;
    }
    get(...getArgs) {
        return new ObservableModelResponse(super.get.apply(
            this, fromPathsOrPathValues(getArgs)));
    }
    set(...setArgs) {
        return new ObservableModelResponse(super.set.apply(
            this, fromPathsOrPathValues(setArgs)));
    }
    call(fnPath, fnArgs, refPaths, thisPaths) {
        fnPath = fromPath(fnPath);
        refPaths = refPaths && fromPathsOrPathValues(refPaths) || [];
        thisPaths = thisPaths && fromPathsOrPathValues(thisPaths) || [];
        return new ObservableModelResponse(super.call.call(this,
            fnPath, fnArgs, refPaths, thisPaths
        ));
    }
    invalidate(...invalidateArgs) {
        return super.invalidate.apply(this, fromPathsOrPathValues(invalidateArgs));
    }
    getItems(thisPathsSelector = () => [['length']],
             restPathsSelector = ({ json: { length }}) => []) {

        const thisPaths = fromPathsOrPathValues(
            [].concat(thisPathsSelector(this))
        );

        return (thisPaths.length === 0) ?
            Observable.empty() :
            this.get(...thisPaths).mergeMap((result) => {

                const restPaths = fromPathsOrPathValues(
                    [].concat(restPathsSelector(result))
                );

                return (restPaths.length === 0) ?
                    Observable.of(result) :
                    this.get(...thisPaths.concat(restPaths));
            });
    }
    preload(...preloadArgs) {
        return new ObservableModelResponse(super.preload.apply(
            this, fromPathsOrPathValues(preloadArgs)));
    }
    getValue(...getValueArgs) {
        return new ObservableModelResponse(super.getValue.apply(
            this, fromPathsOrPathValues(getValueArgs)));
    }
    setValue(...setValueArgs) {
        return new ObservableModelResponse(super.setValue.apply(
            this, fromPathsOrPathValues(setValueArgs)));
    }
    _clone(opts) {
        return new Model(super._clone(opts));
    }
}

class ObservableModelResponse extends Observable {
    constructor(source, operator) {
        if (typeof source !== 'function') {
            super();
            source && (this.source = source);
            operator && (this.operator = operator);
        } else {
            super(source);
        }
    }
    lift(operator) {
        return new ObservableModelResponse(this, operator);
    }
    _toJSONG() {
        return new ObservableModelResponse(this.source._toJSONG());
    }
    progressively() {
        return new ObservableModelResponse(this.source.progressively());
    }
}
