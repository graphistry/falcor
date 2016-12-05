import invariant from 'invariant';
import React, { PropTypes, Children } from 'react';
import hoistStatics from 'recompose/hoistStatics';
import shallowEqual from 'recompose/shallowEqual';
import wrapDisplayName from 'recompose/wrapDisplayName';
import fetchDataUntilSettled from '../utils/fetchDataUntilSettled';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { FalcorJSON } from '@graphistry/falcor';

const typeofNumber = 'number';
const typeofObject = 'object';
const typeofFunction = 'function';
const defaultMapFragmentToProps = (data) => data;
const defaultMapDispatchToProps = (dispatch, props, falcor) => ({});
const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
    ...parentProps, ...stateProps, ...dispatchProps
});

export { container };
export default container;

function container(fragmentDesc, ...rest) {

    invariant(fragmentDesc && (
              typeofFunction === typeof fragmentDesc || (
              typeofObject   === typeof fragmentDesc &&
              typeofFunction === typeof fragmentDesc.fragment)),
`Attempted to create a Falcor container component without a fragment.
Falcor containers must be created with a fragment function, or an Object with a "fragment" function.`);

    let renderErrors = false,
        renderLoading = false,
        fragment, mapFragment,
        mapDispatch, mapFragmentAndProps;

    if (typeofObject !== typeof fragmentDesc) {
        fragment = fragmentDesc;
        mapFragment = rest[0];
        mapDispatch = rest[1];
        mapFragmentAndProps = rest[2];
    } else {
        fragment = fragmentDesc.fragment;
        mapFragment = fragmentDesc.mapFragment;
        renderErrors = fragmentDesc.renderErrors;
        renderLoading = fragmentDesc.renderLoading;
        mapFragmentAndProps = fragmentDesc.mapFragmentAndProps;
        mapDispatch = fragmentDesc.mapDispatch || fragmentDesc.dispatchers;
    }

    mapFragment = mapFragment || defaultMapFragmentToProps;
    mapDispatch = mapDispatch || defaultMapDispatchToProps;
    mapFragmentAndProps = mapFragmentAndProps || defaultMergeProps;

    if (typeofFunction !== typeof mapDispatch) {
        if (mapDispatch && typeofObject !== typeof mapDispatch) {
            mapDispatch = defaultMapDispatchToProps;
        } else {
            mapDispatch = bindActionCreators(mapDispatch);
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
    if (!items || typeofObject !== typeof items) {
        return `{ length }`;
    } else if (!items.hasOwnProperty('length')) {
        items = Object.keys(items).map((key) => items[key]);
    }
    return `{ length ${Array
        .from(items, (xs, i) => xs)
        .reduce((xs, x, i) => `${xs}, ${i}: ${this.fragment(x)}`, '')
    }}`;
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
        falcor : falcor.deref(data);
}

function fetchEachPropUpdate(update) {
    if (!(update.falcor = tryDeref(update))) {
        return Observable.of(update);
    } else if (update.renderLoading === true) {
        return fetchDataUntilSettled(update);
    }
    return fetchDataUntilSettled(update).takeLast(1);
}

function mergeEachPropUpdate(
    { props, falcor, dispatch },
    { data, error, version, loading }
) {
    return {
        props, falcor, dispatch,
        hash: data && data.$__hash,
        data, error, loading, version
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
        this.propsStream = new Subject();
        this.renderErrors = renderErrors;
        this.renderLoading = renderLoading;
        this.dispatchers = mapDispatch(this);
        this.state = { hash: '', version: 0 };
        this.mapFragmentAndProps = mapFragmentAndProps;
        this.propsAction = this.propsStream.switchMap(
            fetchEachPropUpdate, mergeEachPropUpdate
        );
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
            loading: false,
            data: nextProps.data,
            fragment: this.fragment,
            falcor: nextContext.falcor,
            dispatch: nextContext.dispatch,
            renderLoading: this.renderLoading,
            props: { ...nextProps, data: undefined },
        });
    }
    componentWillMount() {
        // Subscribe to child prop changes so we know when to re-render
        this.propsSubscription = this.propsAction.subscribe((nextState) => {
            this.setState(nextState);
        });
        this.propsStream.next({
            loading: false,
            data: this.props.data,
            fragment: this.fragment,
            falcor: this.context.falcor,
            dispatch: this.context.dispatch,
            renderLoading: this.renderLoading,
            props: { ...this.props, data: undefined },
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
    //         } else if (typeofNumber === typeof key) {
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

        const { Component, dispatchers,
                mapFragment, renderErrors,
                renderLoading, mapFragmentAndProps } = this;

        if (!Component) {
            return null;
        }

        const { data, props, falcor, error, loading } = this.state;
        const mappedFragment = data ? mapFragment(data, props) : new FalcorJSON();
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
