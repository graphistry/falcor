import compose from 'recompose/compose';
import toClass from 'recompose/toClass';
import mapProps from 'recompose/mapProps';
import lifecycle from 'recompose/lifecycle';
import setStatic from 'recompose/setStatic';
import withProps from 'recompose/withProps';
import getContext from 'recompose/getContext';
import withContext from 'recompose/withContext';
import shouldUpdate from 'recompose/shouldUpdate';
import mapPropsStream from 'recompose/mapPropsStream';
import setDisplayName from 'recompose/setDisplayName';
import wrapDisplayName from 'recompose/wrapDisplayName';
import mapToFalcorJSON from '../utils/mapToFalcorJSON';
import bindActionCreators from '../utils/bindActionCreators';
import setObservableConfig from 'recompose/setObservableConfig';
import rxjsObservableConfig from 'recompose/rxjsObservableConfig';

import { Observable, BehaviorSubject, Scheduler } from 'rxjs';
import React, { PropTypes, Children } from 'react';
import { connect as connectRedux } from 'react-redux';

import { Model } from '@graphistry/falcor';
Model.prototype.changes = function() {
    const { _root } = this;
    let { changes } = _root;
    if (!changes) {
        changes = _root.changes = new BehaviorSubject(this);
        const { onChangesCompleted } = _root;
        _root.onChangesCompleted = function() {
            if (onChangesCompleted) {
                onChangesCompleted.call(this);
            }
            changes.next(this);
        }
    }
    return changes;
}

setObservableConfig(rxjsObservableConfig);

const contextTypes = {
    falcor: PropTypes.object,
    version: PropTypes.number,
    dispatch: PropTypes.func
};

const connect = (BaseComponent) => compose(
    connectRedux((data, { falcor }) => ({
        data: mapToFalcorJSON(data, falcor)
    })),
    setDisplayName(wrapDisplayName(
        BaseComponent, 'Falcor'
    )),
    mapPropsStream((props) => props
        .switchMap(
            ({ falcor }) => falcor.changes(),
            ({ ...props }, falcor) => ({
                ...props, falcor, version: falcor.getVersion()
            })
        )
        .distinctUntilKeyChanged('version')
        .auditTime(0, Scheduler.asap)
    ),
    withContext(contextTypes, ({ falcor, version, dispatch }) => ({
        falcor, dispatch, version
    })),
    lifecycle({
        componentDidUpdate() {
            this.props.dispatch({
                data: { ...this.props.data },
                type: 'falcor-react-redux/update'
            });
        }
    })
)(BaseComponent);

export default connect;