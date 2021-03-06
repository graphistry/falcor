import { toProps } from '@graphistry/falcor';

import React from 'react';
import invariant from 'invariant';
import PropTypes from 'prop-types';
import hoistStatics from 'recompose/hoistStatics';
import shallowEqual from 'recompose/shallowEqual';
import wrapDisplayName from 'recompose/wrapDisplayName';
import fetchDataUntilSettled from '../utils/fetchDataUntilSettled';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/takeLast';
import 'rxjs/add/operator/switchMap';

const defaultMapFragmentToProps = (data) => data;
const defaultMapDispatchToProps = (dispatch, props, falcor) => ({});
const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
    ...parentProps, ...stateProps, ...dispatchProps
});

export { container };
export default container;

container.globalDisposeDelay = 0;
container.globalDisposeScheduler = null;

function container(fragmentDesc, ...rest) {

    invariant(fragmentDesc && (
              'function' === typeof fragmentDesc || (
              'object'   === typeof fragmentDesc &&
              'function' === typeof fragmentDesc.fragment)),
`Attempted to create a Falcor container component without a fragment.
Falcor containers must be created with a fragment function, or an Object with a "fragment" function.`);

    let renderErrors = false,
        renderLoading = false,
        fragment, mapFragment,
        disposeScheduler, disposeDelay,
        mapDispatch, mapFragmentAndProps;

    if ('object' !== typeof fragmentDesc) {
        fragment = fragmentDesc;
        mapFragment = rest[0];
        mapDispatch = rest[1];
        mapFragmentAndProps = rest[2];
    } else {
        fragment = fragmentDesc.fragment;
        mapFragment = fragmentDesc.mapFragment;
        renderErrors = fragmentDesc.renderErrors;
        renderLoading = fragmentDesc.renderLoading;
        disposeDelay = fragmentDesc.disposeDelay;
        disposeScheduler = fragmentDesc.disposeScheduler;
        mapFragmentAndProps = fragmentDesc.mapFragmentAndProps;
        mapDispatch = fragmentDesc.mapDispatch || fragmentDesc.dispatchers;
    }

    mapFragment = mapFragment || defaultMapFragmentToProps;
    mapDispatch = mapDispatch || defaultMapDispatchToProps;
    mapFragmentAndProps = mapFragmentAndProps || defaultMergeProps;

    disposeDelay = disposeDelay || container.globalDisposeDelay;
    disposeScheduler = disposeScheduler || container.globalDisposeScheduler;

    if ('function' !== typeof mapDispatch) {
        if (mapDispatch && 'object' !== typeof mapDispatch) {
            mapDispatch = defaultMapDispatchToProps;
        } else {
            mapDispatch = bindActionCreators(mapDispatch);
        }
    }

    return hoistStatics((Component) => class Container extends FalcorContainer {
        static fragment = fragment;
        static fragments = fragments;
        static load = fetchEachPropUpdate;
        static contextTypes = contextTypes;
        static childContextTypes = contextTypes;
        static displayName = wrapDisplayName(Component, 'Container');
        constructor(props, context) {
            super(props, context);
            this.fragment = fragment;
            this.Component = Component;
            this.mapFragment = mapFragment;
            this.renderErrors = renderErrors;
            this.renderLoading = renderLoading;
            this.dispatchers = mapDispatch(this);
            this.mapFragmentAndProps = mapFragmentAndProps;
            this.disposeDelay = disposeDelay;
            this.disposeScheduler = disposeScheduler;
        }
    });
}

const fragments = function(items, itemsProps) {
    if (!items || 'object' !== typeof items) {
        return `{ length }`;
    }
    itemsProps = !itemsProps || 'object' !== typeof itemsProps ? [] : itemsProps;
    let index = -1, query = 'length';
    const length = Math.max(0, items.length) || 0;
    while (++index < length) {
        query = `${
        query},
 ${     index}: ${this.fragment(items[index], itemsProps[index])}`;
    }
    return `{ ${query} }`;
}

function bindActionCreators(actionCreators) {
    return function mapDispatch(container) {
        return Object.keys(actionCreators).reduce((dispatchers, key) => {
            const actionCreator = actionCreators[key];
            dispatchers[key] = (...args) => {
                const { falcor, dispatch } = container.state;
                if (falcor) {
                    return dispatch({ falcor, ...actionCreator(...args) });
                }
            };
            return dispatchers;
        }, {});
    }
}

function tryDeref({ data, falcor }) {
    return !data || !falcor ?
        falcor :
        falcor._hasValidParentReference() ?
        falcor.deref(data) : null;
}

function fetchEachPropUpdate(update) {

    invariant(
        update.fragment || (update.fragment = this.fragment),
        `Attempted to fetch without a fragment definition`
    );

    if (!(update.falcor = tryDeref(update))) {
        return Observable.of(update);
    } else if (update.renderLoading === true) {
        return fetchDataUntilSettled(update);
    } else {
        return fetchDataUntilSettled(update).takeLast(1);
    }
}

function mergeEachPropUpdate(
    { props, falcor, dispatch },
    { data, query, error, version, loading }
) {
    const hash = data && data.$__hash;
    const status = data && data.$__status;
    loading = status === 'pending';
    return {
        hash, props, falcor, dispatch,
        data, query, error, loading, version
    };
}

const contextTypes = {
    falcor: PropTypes.object,
    dispatch: PropTypes.func,
};

class FalcorContainer extends React.Component {
    constructor(componentProps, context) {

        super(componentProps, context);

        const { falcor } = context;
        const { data, ...props } = componentProps;

        this.propsStream = new Subject();
        this.propsAction = this.propsStream.switchMap(
            fetchEachPropUpdate, mergeEachPropUpdate
        );

        this.state = {
            data, props, query: null,
            dispatch: context.dispatch,
            falcor: tryDeref({ data, falcor })
        };
    }
    getChildContext() {
        const { falcor, dispatch } = this.state;
        return { falcor, dispatch };
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {

        const { renderLoading,
                props: currProps = {},
                state: currState = {} } = this;

        if (renderLoading === true && currState.loading !== nextState.loading) {
            this.guardTraceShouldUpdate() && this.traceShouldUpdate(`trigger: loading`,
                { curr: currState.loading, next: nextState.loading }
            );
            return true;
        } else if (currState.version !== nextState.version) {
            this.guardTraceShouldUpdate() && this.traceShouldUpdate(`trigger: version`,
                { curr: currState.version, next: nextState.version }
            );
            return true;
        } else if (currState.error !== nextState.error) {
            this.guardTraceShouldUpdate() && this.traceShouldUpdate(`trigger: error`,
                { curr: currState.error, next: nextState.error }
            );
            return true;
        } else if (currState.hash !== nextState.hash) {
            this.guardTraceShouldUpdate() && this.traceShouldUpdate(`trigger: hash`,
                { curr: currState.hash, next: nextState.hash }
            );
            return true;
        }

        const { data: currData, style: currStyle = {}, ...restCurrProps } = currProps;
        const { data: nextData, style: nextStyle = currStyle, ...restNextProps } = nextProps;

        if (!shallowEqual(currData, nextData)) {
            this.guardTraceShouldUpdate() && this.traceShouldUpdate(`trigger: data`,
                { currData: toProps(currData), nextData: toProps(nextData) }
            );
            return true;
        } else if (!shallowEqual(currStyle, nextStyle)) {
            this.guardTraceShouldUpdate() && this.traceShouldUpdate(`trigger: style`,
                { currStyle, nextStyle }
            );
            return true;
        } else if (!shallowEqual(restCurrProps, restNextProps)) {
            this.guardTraceShouldUpdate() && this.traceShouldUpdate(`trigger: props`,
                { restCurrProps, restNextProps }
            );
            return true;
        }

        // this.guardTraceShouldUpdate() && this.traceShouldUpdate(false,
        //     { currProps: serializeObjectWithFalcorData(currProps), nextProps: serializeObjectWithFalcorData(nextProps) },
        //     { currState: serializeObjectWithFalcorData(currState), nextState: serializeObjectWithFalcorData(nextState) }
        // );

        return false;
    }
    componentWillReceiveProps(nextProps, nextContext) {
        // Receive new props from the owner
        const { data, ...props } = nextProps;
        this.propsStream.next({
            data, props,
            query: this.state.query,
            fragment: this.fragment,
            falcor: nextContext.falcor,
            version: this.state.version,
            dispatch: nextContext.dispatch,
            renderLoading: this.renderLoading,
            disposeDelay: this.disposeDelay,
            disposeScheduler: this.disposeScheduler,
        });
    }
    componentWillMount() {
        const { data, ...props } = this.props;
        // Subscribe to child prop changes so we know when to re-render
        this.propsSubscription = this.propsAction.subscribe(this.setState.bind(this));
        this.propsStream.next({
            data, props,
            query: this.state.query,
            fragment: this.fragment,
            falcor: this.context.falcor,
            version: this.state.version,
            dispatch: this.context.dispatch,
            renderLoading: this.renderLoading,
            disposeDelay: this.disposeDelay,
            disposeScheduler: this.disposeScheduler,
        });
    }
    componentWillUpdate(nextProps, nextState) {
        this.guardTraceWillUpdate() && this.traceWillUpdate(
            'loading: ' + nextState.loading || false,
            { currProps: serializeObjectWithFalcorData(this.props), nextProps: serializeObjectWithFalcorData(nextProps) },
            { currState: serializeObjectWithFalcorData(this.state), nextState: serializeObjectWithFalcorData(nextState) }
        );
    }
    traceShouldUpdate(...message) {
        if (this.guardTraceShouldUpdate()) {
            console.group(`should update: ${this.inspect()}`);
            message.forEach((x) => console.log(x));
            console.groupEnd();
        }
    }
    traceWillUpdate(...message) {
        if (this.guardTraceWillUpdate()) {
            console.group(`  will update: ${this.inspect()}`);
            message.forEach((x) => console.log(x));
            console.groupEnd();
        }
    }
    guardTraceShouldUpdate() {
        return !!global['__trace_container_diffs__'];
    }
    guardTraceWillUpdate() {
        return !!global['__trace_container_updates__'];
    }
    inspect(...message) {
        const { state = {} } = this;
        const { falcor } = state;
        const name = this.constructor && this.constructor.displayName || `Unknown Component`;
        return `${name}: ${falcor && falcor.inspect() || '{ v: -1, p: [] }'}`;
    }
    componentWillUnmount() {
        // Clean-up subscription before un-mounting
        this.propsSubscription.unsubscribe();
        this.propsSubscription = undefined;
        this.propsStream = undefined;
        this.propsAction = undefined;
        this.fragment = null;
        this.Component = null;
        this.dispatchers = null;
        this.mapDispatch = null;
        this.mapFragment = null;
        this.renderLoading = null;
        this.mergeFragmentAndProps = null;
    }
    render() {

        const { renderErrors, renderLoading,
                mapFragment, mapFragmentAndProps,
                Component, dispatchers, state } = this;

        if (!Component) {
            return null;
        }

        const { data, props, error, falcor } = state;
        const mappedFragment = mapFragment(data || [], props, falcor);
        const allMergedProps = mapFragmentAndProps(mappedFragment, dispatchers, props);

        if (error && renderErrors === true) {
            allMergedProps.error = error;
        }

        if (renderLoading === true) {
            allMergedProps.loading = state.loading || false;
        }

        return React.createElement(Component, allMergedProps);
    }
}

function serializeObjectWithFalcorData(obj) {
    if (obj && typeof obj === 'object' && obj.data) {
        return { ...obj, data: toProps(obj.data) };
    }
    return obj;
}