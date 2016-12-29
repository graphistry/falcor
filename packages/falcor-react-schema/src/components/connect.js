import invariant from 'invariant';
import React, { PropTypes, Children } from 'react';

import { Model } from '@graphistry/falcor';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
// import { asap as asapScheduler } from 'rxjs/scheduler/asap';

import 'rxjs/add/operator/auditTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/distinctUntilKeyChanged';

import setDisplayName from 'recompose/setDisplayName';
import wrapDisplayName from 'recompose/wrapDisplayName';
import rxjsObservableConfig from 'recompose/rxjsObservableConfig';
import { mapPropsStreamWithConfig } from 'recompose/mapPropsStream';

export default function connect(Component, scheduler = animationFrame) {
    return compose(
        setDisplayName(wrapDisplayName(Component, 'Connect')),
        mapPropsStreamWithConfig(rxjsObservableConfig)(
            mapPropsToDistinctChanges(scheduler))
    );
}

function mapPropsToDistinctChanges(scheduler) {
    return function innerMapPropsToDistinctChanges(prop$) {
        return prop$.switchMap(
            mapPropsToChanges, mapChangeToProps
        )
        .distinctUntilChanged(null, getModelVersion)
        .auditTime(0, scheduler);
    }
}

function mapPropsToChanges(props) {
    const model = props['falcor-model'];
    invariant(model, `The top level "connect" container requires a root falcor model.`);
    return model.changes();
}

function mapChangeToProps(props, model) {
    return { ...props, 'falcor-model': model };
}

function getModelVersion(props) {
    return props['falcor-model'].getVersion();
}

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
