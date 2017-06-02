import invariant from 'invariant';
import React, { PropTypes, Children } from 'react';
import hoistStatics from 'recompose/hoistStatics';
import shallowEqual from 'recompose/shallowEqual';
import wrapDisplayName from 'recompose/wrapDisplayName';
import fetchDataUntilSettled from '../fetchDataUntilSettled';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/takeLast';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

const contextTypes = {
    'falcorData': PropTypes.object,
    'falcorModel': PropTypes.object,
    'renderFalcorLoading': PropTypes.bool
};

function defaultMapFragment(remoteProps) { return remoteProps; }
function defaultMergeProps(remoteProps, localProps) {
    return { ...localProps, ...remoteProps };
}

export default function withFragment(fragmentDesc, ...rest) {

    invariant(fragmentDesc && (
              'function' === typeof fragmentDesc || (
              'object'   === typeof fragmentDesc &&
              'function' === typeof fragmentDesc.fragment)),
`Attempted to create a Fragment container component without a fragment definition.
Fragment containers must be created with a fragment function, or an Object with a "fragment" function.`);

    if ('object' !== typeof fragmentDesc) {
        fragmentDesc = {
            fragment: fragmentDesc,
            mergeProps: rest[1] || defaultMergeProps,
            mapFragment: rest[0] || defaultMapFragment
        };
    } else {
        if (!fragmentDesc.mergeProps) {
            fragmentDesc.mergeProps = defaultMergeProps;
        }
        if (!fragmentDesc.mapFragment) {
            fragmentDesc.mapFragment = defaultMapFragment;
        }
    }

    return hoistStatics((Component) => {
        return class Container extends FragmentContainer {
            static fragments = fragments;
            static load = fetchEachPropUpdate;
            static contextTypes = contextTypes;
            static childContextTypes = contextTypes;
            static fragment = fragmentDesc.fragment;
            static displayName = wrapDisplayName(Component, 'Container');
            constructor(props, context) {
                super(props, context);
                this.config = fragmentDesc;
                this.Component = Component;
                this.fragment = fragmentDesc.fragment;
            }
        };
    });
}

function fragments(items = [], start = 0, end = items && items.length) {
    let index = -1, query = 'length';
    if (items && 'object' === typeof items) {
        let length = items.length;
        if (length && typeof length === 'object' && typeof length.value === 'number') {
            length = length.value;
        }
        length = Math.min(Math.max(0, end - start), length) | 0;
        while (++index < length) {
            query = `${
            query},
     ${     index}: ${this.fragment(items[index])}`;
        }
    }
    return `{ ${query} }`;
}

function tryDeref({ data, model }) {
    return !data || !model ?
        model :
        model._hasValidParentReference() ?
        model.deref(data) : null;
}

function fetchEachPropUpdate(update) {

    invariant(
        update.fragment || (update.fragment = this.fragment),
        `Attempted to fetch without a fragment definition`
    );

    if (!(update.model = tryDeref(update))) {
        return Observable.of(update);
    } else if (update.renderLoading === true) {
        return fetchDataUntilSettled(update);
    }
    return fetchDataUntilSettled(update).takeLast(1);
}

function mergeEachPropUpdate(
    { props, model },
    { data, query, error, version }
) {
    const hash = data && data.$__hash;
    const status = data && data.$__status;
    const loading = status === 'pending';
    return {
        hash, data, query, props,
        model, error, loading, version
    };
}

class FragmentContainer extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
        this.propsStream = new Subject();
        this.propsAction = this.propsStream.switchMap(
            fetchEachPropUpdate, mergeEachPropUpdate
        );
    }
    getChildContext() {
        const { data, model } = this.state;
        return {
            'falcorData': data, 'falcorModel': model,
            'renderFalcorLoading': this.shouldRenderLoading()
        };
    }
    componentWillMount() {
        // Subscribe to child prop changes so we know when to re-render
        this.propsSubscription = this.propsAction.subscribe((nextState) => {
            this.setState(nextState);
        });
        this.checkCacheAndUpdate(this.props, this.context);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        this.checkCacheAndUpdate(nextProps, nextContext);
    }
    componentWillUnmount() {
        this.config = undefined;
        this.fragment = undefined;
        this.Component = undefined;
        this.propsAction = undefined;
        this.propsStream = undefined;
        // Clean-up subscription before un-mounting
        this.propsSubscription.unsubscribe();
        this.propsSubscription = undefined;
    }
    shouldRenderLoading(props = this.props, context = this.context) {
        if (props.hasOwnProperty('renderLoading')) {
            return props.renderLoading;
        } else if (this.config.hasOwnProperty('renderLoading')) {
            return this.config.renderLoading;
        }
        return context['renderFalcorLoading'] || false;
    }
    checkCacheAndUpdate(props, context) {

        const { state, fragment } = this;
        const { query } = state;

        // if (props.hasOwnProperty('falcorData') || props.hasOwnProperty('falcorModel')) {
        this.propsStream.next({
            query, props, fragment, loading: true,
            renderLoading: this.shouldRenderLoading(props, context),
            data: props['falcorData'] || context['falcorData'] || state.data,
            model: props['falcorModel'] || context['falcorModel'] || state.model,
        });
        // }
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {

        const { props: currProps = {}, state: currState = {} } = this;

        if (currState.loading !== nextState.loading && (
            this.shouldRenderLoading(this.props, this.context) ||
            this.shouldRenderLoading(nextProps, nextContext))) {
            return true;
        } else if (currState.version !== nextState.version) {
            return true;
        } else if (currState.error !== nextState.error) {
            return true;
        } else if (currState.hash !== nextState.hash) {
            return true;
        }

        const currData = currProps['falcorData'];
        const nextData = nextProps['falcorData'];
        const { style: currStyle = {}, ...restCurrProps } = currProps;
        const { style: nextStyle = currStyle, ...restNextProps } = nextProps;

        if (!shallowEqual(currData, nextData)) {
            return true;
        } else if (!shallowEqual(currStyle, nextStyle)) {
            return true;
        } else if (!shallowEqual(restCurrProps, restNextProps)) {
            return true;
        }

        return false;
    }
    render() {

        const { props, state, config, Component } = this;

        if (!Component) {
            return null;
        }

        const { data, error, loading } = state;
        const { mergeProps, mapFragment } = config;
        const mappedFragment = data && mapFragment(data, props);
        const mergedProps = mergeProps(mappedFragment || {}, props);

        if (error) {
            mergedProps.error = error;
        }

        if (loading && this.shouldRenderLoading(props) === true) {
            mergedProps.loading = loading;
        }

        return <Component { ...mergedProps }/>;
    }
}
