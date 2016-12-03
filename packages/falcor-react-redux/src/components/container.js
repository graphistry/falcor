import invariant from 'invariant';
import React, { PropTypes, Children } from 'react';
import hoistStatics from 'recompose/hoistStatics';
import shallowEqual from 'recompose/shallowEqual';
import mapToFalcorJSON from '../utils/mapToFalcorJSON';
import wrapDisplayName from 'recompose/wrapDisplayName';
import fetchDataUntilSettled from '../utils/fetchDataUntilSettled';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';

const defaultMapFragmentToProps = (data) => data;
const defaultMapDispatchToProps = (dispatch, props, falcor) => ({});
const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
    ...parentProps, ...stateProps, ...dispatchProps
});

export default function container(fragmentDesc, ...rest) {

    invariant(fragmentDesc && (
        typeof fragmentDesc === 'function' || (
        typeof fragmentDesc === 'object' &&
        typeof fragmentDesc.fragment === 'function')),
`Attempted to create a Falcor container component without a fragment.
Falcor containers must be created with either a fragment function or an Object with a fragment function.`);

    let renderErrors = false,
        renderLoading = false,
        fragment, mapFragment,
        mapDispatch, mapFragmentAndProps;

    if (typeof fragmentDesc === 'object') {
        fragment = fragmentDesc.fragment;
        mapFragment = fragmentDesc.mapFragment;
        renderErrors = fragmentDesc.renderErrors;
        renderLoading = fragmentDesc.renderLoading;
        mapFragmentAndProps = fragmentDesc.mapFragmentAndProps;
        mapDispatch = fragmentDesc.mapDispatch || fragmentDesc.dispatchers;
    } else {
        fragment = fragmentDesc;
        mapFragment = rest[0];
        mapDispatch = rest[1];
        mapFragmentAndProps = rest[2];
    }

    mapFragment = mapFragment || defaultMapFragmentToProps;
    mapDispatch = mapDispatch || defaultMapDispatchToProps;
    mapFragmentAndProps = mapFragmentAndProps || defaultMergeProps;

    if (typeof mapDispatch !== 'function') {
        if (mapDispatch && typeof mapDispatch !== 'object') {
            mapDispatch = defaultMapDispatchToProps;
        } else {
            mapDispatch = function(actionCreators) {
                return function(container) {
                    return Object.keys(actionCreators).reduce((dispatchers, key) => {
                        const actionCreator = actionCreators[key];
                        dispatchers[key] = (...args) => {
                            const { falcor, dispatch } = container.state;
                            return dispatch({ falcor, ...actionCreator(...args) });
                        };
                        return dispatchers;
                    }, {});
                }
            }(mapDispatch);
        }
    }

    return hoistStatics((BaseComponent) => class Container extends FalcorContainer {
        static fragment = fragment;
        static fragments = fragments;
        static Component = BaseComponent;
        static mapFragment = mapFragment;
        static mapDispatch = mapDispatch;
        static renderErrors = renderErrors;
        static renderLoading = renderLoading;
        static mapFragmentAndProps = mapFragmentAndProps;
        static displayName = wrapDisplayName(BaseComponent, 'Container');
    });
}

const fragments = function(items = []) {
    if (!items || typeof items !== 'object') {
        return `{ length }`;
    } else if (!items.hasOwnProperty('length')) {
        items = Object.keys(items).map((key) => items[key]);
    }
    return `{ length ${Array
        .from(items, (xs, i) => xs)
        .reduce((xs, x, i) => `${xs}, ${i}: ${this.fragment(x)}`, '')
    }}`;
}

function derefEachPropUpdate(update) {
    let { data, falcor } = update;
    update.data = data = mapToFalcorJSON(data);
    if (!falcor._seed || !falcor._seed.json || falcor._seed.json !== data) {
        update.falcor = falcor.deref(data);
    }
    return update;
}

function fetchEachPropUpdate({ container, data, props, falcor }) {
    const { fragment, renderLoading } = container;
    return fetchDataUntilSettled({
        data, props, falcor, fragment, renderLoading
    }).let((source) => renderLoading === true ?
        source : source.takeLast(1)
    );
}

function mergeEachPropUpdate(
    { falcor, dispatch },
    { data, error, version, loading }
) {
    return {
        data, error, loading,
        falcor, dispatch, version,
        hash: data && data.$__hash
    };
}

const contextTypes = {
    falcor: PropTypes.object,
    dispatch: PropTypes.func
};

class FalcorContainer extends React.Component {

    static contextTypes = contextTypes;
    static childContextTypes = contextTypes;

    constructor(props, context) {
        super(props, context);

        let { data } = props;
        let { falcor, dispatch } = context;
        const { fragment,
                Component,
                mapFragment,
                mapDispatch,
                renderErrors,
                renderLoading,
                mapFragmentAndProps
        } = this.constructor;

        this.fragment = fragment;
        this.Component = Component;
        this.mapFragment = mapFragment;
        this.renderErrors = renderErrors;
        this.renderLoading = renderLoading;
        this.dispatchers = mapDispatch(this);
        this.mapFragmentAndProps = mapFragmentAndProps;

        falcor = falcor.deref(data = mapToFalcorJSON(data));

        this.state = {
            hash: data.$__hash,
            data, falcor, dispatch,
            version: falcor.getVersion()
        };

        this.propsStream = new Subject();
        this.propsAction = this.propsStream
            .map(derefEachPropUpdate)
            .switchMap(fetchEachPropUpdate, mergeEachPropUpdate);
    }
    getChildContext() {
        const { falcor, dispatch } = this.state;
        return { falcor, dispatch };
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {

        const { props: currProps = {},
                state: currState = {} } = this;

        if (this.renderLoading === true && currState.loading !== nextState.loading) {
            return true;
        } else if (currState.version !== nextState.version) {
            return true;
        } else if (currState.error !== nextState.error) {
            return true;
        } else if (currState.hash !== nextState.hash) {
            return true;
        }

        const { data: currData,
                style: currStyle = {},
                ...restCurrProps } = currProps;

        const { data: nextData,
                style: nextStyle = currStyle,
                ...restNextProps } = nextProps;

        if (!shallowEqual(currData, nextData)) {
            return true;
        } else if (!shallowEqual(currStyle, nextStyle)) {
            return true;
        } else if (!shallowEqual(restCurrProps, restNextProps)) {
            return true;
        }

        return false;
    }
    componentWillReceiveProps(nextProps, nextContext) {
        // Receive new props from the owner
        this.propsStream.next({
            container: this,
            props: nextProps,
            data: nextProps.data,
            falcor: nextContext.falcor,
            dispatch: nextContext.dispatch
        });
    }
    componentWillMount() {
        // Subscribe to child prop changes so we know when to re-render
        this.propsSubscription = this.propsAction.subscribe((nextState) => {
            this.setState(nextState);
        });
        this.propsStream.next({
            container: this,
            props: this.props,
            data: this.props.data,
            falcor: this.context.falcor,
            dispatch: this.context.dispatch
        });
    }
    // componentWillUpdate() {
    //     if (!global['__trace_container_updates__']) {
    //         return;
    //     }
    //     const { state = {} } = this;
    //     const { falcor } = state;
    //     if (falcor) {
    //         console.log(`cwu:`, this.getFalcorPathString());
    //     }
    // }
    // getFalcorPathString() {
    //     return this.state && this.state.falcor && this.state.falcor.getPath().reduce((xs, key, idx) => {
    //         if (idx === 0) {
    //             return key;
    //         } else if (typeof key === 'number') {
    //             return `${xs}[${key}]`;
    //         }
    //         return `${xs}['${key}']`;
    //     }, '') || '';
    // }
    componentWillUnmount() {
        // Clean-up subscription before un-mounting
        this.propsSubscription.unsubscribe();
        this.propsSubscription = undefined;
        this.fragment = null;
        this.Component = null;
        this.dispatchers = null;
        this.mapDispatch = null;
        this.mapFragment = null;
        this.renderLoading = null;
        this.mergeFragmentAndProps = null;
    }
    render() {

        const { Component,
                dispatchers,
                mapFragment,
                renderErrors,
                renderLoading,
                mapFragmentAndProps } = this;

        if (!Component) {
            return null;
        }

        const { data: outerData, ...props } = this.props;
        const { data, error, loading, falcor, dispatch } = this.state;

        const mappedFragment = mapFragment(data, props);

        const allMergedProps = mapFragmentAndProps(mappedFragment, dispatchers, props);

        if (error && renderErrors === true) {
            allMergedProps.error = error;
        }

        if (loading && renderLoading === true) {
            allMergedProps.loading = loading;
        }

        return <Component { ...allMergedProps }/>;
    }
}
