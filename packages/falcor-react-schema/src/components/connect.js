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

import hoistStatics from 'recompose/hoistStatics';
import mapPropsStream from 'recompose/mapPropsStream';
import setDisplayName from 'recompose/setDisplayName';
import wrapDisplayName from 'recompose/wrapDisplayName';

export default function connect(BaseComponent, scheduler = animationFrame) {
    return hoistStatics(compose(
        setDisplayName(wrapDisplayName(BaseComponent, 'Connect')),
        mapPropsStream(mapPropsToDistinctChanges(scheduler))
    ))(BaseComponent);
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
