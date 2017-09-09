import invariant from 'invariant';
import PropTypes from 'prop-types';
import React, { Children } from 'react';
import { Model } from '@graphistry/falcor';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/observable/bindCallback';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/repeat';
import 'rxjs/add/operator/multicast';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/exhaustMap';
import 'rxjs/add/operator/distinctUntilChanged';

if (!Model.prototype.changes) {
    Model.prototype.changes = function() {
        const { _root } = this;
        let { changes } = _root;
        if (!changes) {
            changes = _root.changes = new BehaviorSubject(this);
            ['onChange', 'onChangesCompleted'].forEach((name) => {
                const handler = _root[name];
                _root[name] = function() {
                    if (handler) {
                        handler.call(this);
                    }
                    changes.next(this);
                }
            });
        }
        return changes;
    }
}

export default class Provider extends React.Component {
    static displayName = 'FalcorProvider';
    static propTypes = {
        renderFalcorErrors: PropTypes.bool,
        renderFalcorLoading: PropTypes.bool,
        children: PropTypes.element.isRequired,
        falcorModel: PropTypes.object.isRequired,
    };
    static childContextTypes = {
        falcorData: PropTypes.object,
        falcorModel: PropTypes.object,
        renderFalcorErrors: PropTypes.bool,
        renderFalcorLoading: PropTypes.bool
    };
    constructor(props, context) {

        super(props, context);

        this.state = {
            falcorData: undefined,
            falcorModel: props.falcorModel,
            renderFalcorErrors: props.renderFalcorErrors || false,
            renderFalcorLoading: props.renderFalcorLoading || false,
        };
    }
    getChildContext() {
        const  { falcorData, falcorModel, renderFalcorErrors, renderFalcorLoading } = this.state;
        return { falcorData, falcorModel, renderFalcorErrors, renderFalcorLoading };
    }
    componentWillMount() {
        // Subscribe to child prop changes so we know when to re-render
        this.propsSubscription = mapPropsToDistinctChanges(
            this, this.propsStream = new Subject()
        ).subscribe(() => {});
        this.propsStream.next(this.props);
    }
    componentWillReceiveProps(nextProps) {
        this.propsStream.next(nextProps);
    }
    componentWillUnmount() {
        // Clean-up subscription before un-mounting
        this.propsSubscription.unsubscribe();
        this.propsSubscription = undefined;
        this.propsStream = undefined;
    }
    render() {
        return Children.only(this.props.children);
    }
}

function mapPropsToDistinctChanges(provider, props$) {

    const setStateAsync = Observable.bindCallback(
        ({ falcorModel, renderFalcorErrors = false, renderFalcorLoading = false }, callback) => {
            return provider.setState({ falcorModel, renderFalcorErrors, renderFalcorLoading }, callback);
        }
    );

    return props$
        .switchMap(mapPropsToChanges, mapChangeToProps)
        .distinctUntilChanged(null, getModelVersion)
        .map((props) => ({ props, pending: true }))
        .multicast(() => new ReplaySubject(1), (updates) => updates
            .filter(({ pending }) => pending)
            .exhaustMap(
                (update) => setStateAsync(update.props),
                (update) => { update.pending = false; }
            ).take(1).repeat()
        );
}

function mapPropsToChanges(props) {
    const model = props['falcorModel'];
    invariant(model, `The Falcor Provider requires a root falcor Model.`);
    return model.changes();
}

function mapChangeToProps(props, model) {
    return { ...props, 'falcorModel': model };
}

function getModelVersion(props) {
    return props['falcorModel'].getVersion();
}
