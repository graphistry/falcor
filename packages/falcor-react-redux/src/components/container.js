import invariant from 'invariant';
import React, { PropTypes, Children } from 'react';
import hoistStatics from 'recompose/hoistStatics';
import shallowEqual from 'recompose/shallowEqual';
import wrapDisplayName from 'recompose/wrapDisplayName';
import fetchDataUntilSettled from '../utils/fetchDataUntilSettled';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

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

    return hoistStatics((Component) => class Container extends FalcorContainer {
        static fragment = fragment;
        static fragments = fragments;
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
        }
    });
}

const fragments = function(items = []) {
    if (!items ||
        typeofObject !== typeof items ||
        !items.hasOwnProperty('length')) {
        return `{ length }`;
    }
    return `{ length ${Array
        .from(items, (x, i) => x)
        .reduce((xs, x, i) =>`${xs}, ${
            i}: ${this.fragment(x)}`, '')
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
            data, props,
            hash: '', version: -1,
            dispatch: context.dispatch,
            loading: false, error: undefined,
            falcor: tryDeref({ data, falcor })
        };
    }
    getChildContext() {
        const { falcor, dispatch } = this.state;
        return { falcor, dispatch };
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {

        const { props: currProps = {},
                state: currState = {},
                context: currContext = {} } = this;

        if (this.renderLoading === true && currState.loading !== nextState.loading) {
            // this.trace('scu loading', currState.loading, '->', nextState.loading);
            return true;
        } else if (currState.version !== nextState.version) {
            // this.trace('scu version', currState.version, '->', nextState.version);
            return true;
        } else if (currState.error !== nextState.error) {
            // this.trace('scu error', currState.error, '->', nextState.error);
            return true;
        } else if (currState.hash !== nextState.hash) {
            // this.trace('scu hash', currState.hash, '->', nextState.hash);
            return true;
        }

        const { data: currData, style: currStyle = {}, ...restCurrProps } = currProps;
        const { data: nextData, style: nextStyle = currStyle, ...restNextProps } = nextProps;

        if (!shallowEqual(currData, nextData)) {
            // this.trace('scu data', currData, '->', nextData);
            return true;
        } else if (!shallowEqual(currStyle, nextStyle)) {
            // this.trace('scu style', currStyle, '->', nextStyle);
            return true;
        } else if (!shallowEqual(restCurrProps, restNextProps)) {
            // this.trace('scu props', restCurrProps, '->', restNextProps);
            return true;
        }

        // this.trace('scu', false);
        return false;
    }
    componentWillReceiveProps(nextProps, nextContext) {
        // Receive new props from the owner
        const { data, ...props } = nextProps;
        this.propsStream.next({
            data, props,
            fragment: this.fragment,
            falcor: nextContext.falcor,
            version: this.state.version,
            dispatch: nextContext.dispatch,
            renderLoading: this.renderLoading
        });
    }
    componentWillMount() {
        const { data, ...props } = this.props;
        // Subscribe to child prop changes so we know when to re-render
        this.propsSubscription = this.propsAction.subscribe((nextState) => {
            this.setState(nextState);
        });
        this.propsStream.next({
            data, props,
            fragment: this.fragment,
            falcor: this.context.falcor,
            version: this.state.version,
            dispatch: this.context.dispatch,
            renderLoading: this.renderLoading
        });
    }
    componentWillUpdate() {
        this.trace('cwu', this.state.loading || false);
    }
    trace(...message) {
        if (!global['__trace_container_updates__']) {
            return;
        }
        console.log(this.inspect(), ...message);
    }
    inspect(...message) {
        const { state = {} } = this;
        const { falcor } = state;
        return falcor && falcor.inspect() || `{ v: -1, p: [] }`;
    }
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

        const { renderErrors, renderLoading,
                mapFragment, mapFragmentAndProps,
                Component, dispatchers, state, context } = this;

        if (!Component) {
            return null;
        }

        const { data, props, error } = state;
        const mappedFragment = mapFragment(data || [], props);
        const allMergedProps = mapFragmentAndProps(mappedFragment, dispatchers, props);

        if (error && renderErrors === true) {
            allMergedProps.error = error;
        }

        if (renderLoading === true) {
            allMergedProps.loading = state.loading;
        }

        return <Component { ...allMergedProps }/>;
    }
}
