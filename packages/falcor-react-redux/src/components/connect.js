import compose from 'recompose/compose';
import lifecycle from 'recompose/lifecycle';
import withContext from 'recompose/withContext';
import hoistStatics from 'recompose/hoistStatics';
import mapPropsStream from 'recompose/mapPropsStream';
import setDisplayName from 'recompose/setDisplayName';
import wrapDisplayName from 'recompose/wrapDisplayName';
import setObservableConfig from 'recompose/setObservableConfig';
import rxjsObservableConfig from 'recompose/rxjsObservableConfig';

import invariant from 'invariant';
import React, { PropTypes, Children } from 'react';
import { connect as connectRedux } from 'react-redux';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Model, FalcorJSON } from '@graphistry/falcor';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
// import { asap as asapScheduler } from 'rxjs/scheduler/asap';

import 'rxjs/add/operator/auditTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/distinctUntilKeyChanged';

if (!Model.prototype.changes) {
    Model.prototype.changes = function() {
        const { _root } = this;
        let { changes } = _root;
        if (!changes) {
            changes = _root.changes = new BehaviorSubject(this);
            const { onChange } = _root;
            _root.onChange = () => {
                if (onChange) {
                    onChange.call(this);
                }
                changes.next(this);
            }
        }
        return changes;
    }
}

setObservableConfig(rxjsObservableConfig);

const typeofObject = 'object';
const reduxOptions = { pure: false };
const contextTypes = {
    falcor: PropTypes.object,
    dispatch: PropTypes.func
};

const connect = (BaseComponent, scheduler = animationFrame) => hoistStatics(compose(
    connectRedux(mapReduxStoreToProps, 0, mergeReduxProps, reduxOptions),
    setDisplayName(wrapDisplayName(BaseComponent, 'Falcor')),
    mapPropsStream(mapPropsToDistinctChanges(scheduler)),
    withContext(contextTypes, ({ falcor, dispatch }) => ({
        falcor, dispatch
    })),
    lifecycle({
        componentDidUpdate() {
            this.props.dispatch({
                data: this.props.data,
                type: 'falcor-react-redux/update'
            });
        }
    })
))(BaseComponent);

export { connect };
export default connect;

function mapReduxStoreToProps(data, { falcor }) {

    invariant(falcor, `The top level "connect" container requires a root falcor model.`);

    if (data instanceof FalcorJSON) {
        return { data };
    } else if (falcor._recycleJSON) {
        if (falcor._seed && falcor._seed.json) {
            return { data: falcor._seed.json };
        }
        falcor._seed = {};
        falcor._seed.__proto__ = FalcorJSON.prototype;
        return { data: falcor._seed.json = new FalcorJSON(data) };
    }

    return { data: new FalcorJSON(data) };
}

function mergeReduxProps({ data }, { dispatch }, { falcor }) {
    return { data, falcor, dispatch };
}

function mapPropsToDistinctChanges(scheduler) {
    return function innerMapPropsToDistinctChanges(prop$) {
        return prop$.switchMap(
            mapPropsToChanges, mapChangeToProps
        )
        .distinctUntilKeyChanged('version')
        .auditTime(0, scheduler);
    }
}

function mapPropsToChanges({ falcor }) {
    return falcor.changes();
}

function mapChangeToProps(props, falcor) {
    return { ...props, falcor, version: falcor.getVersion() };
}
