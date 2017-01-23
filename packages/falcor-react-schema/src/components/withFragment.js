import invariant from 'invariant';
import React, { PropTypes, Children } from 'react';
import hoistStatics from 'recompose/hoistStatics';
import shallowEqual from 'recompose/shallowEqual';
import wrapDisplayName from 'recompose/wrapDisplayName';
import fetchDataUntilSettled from '../fetchDataUntilSettled';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

const contextTypes = {
    'falcor-data': PropTypes.object,
    'falcor-model': PropTypes.object,
    'falcor-render-loading': PropTypes.bool
};

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

class FragmentContainer extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = { hash: '', version: 0 };
        this.propsStream = new Subject();
        this.propsAction = this.propsStream.switchMap(
            fetchEachPropUpdate, mergeEachPropUpdate
        );
    }
    getChildContext() {
        const { data, model } = this.state;
        return {
            'falcor-data': data, 'falcor-model': model,
            'falcor-render-loading': this.shouldRenderLoading()
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
        // Clean-up subscription before un-mounting
        this.propsSubscription.unsubscribe();
        this.propsSubscription = undefined;
        this.config = null;
        this.fragment = null;
        this.Component = null;
    }
    shouldRenderLoading(props = this.props, context = this.context) {
        if (props.hasOwnProperty('renderLoading')) {
            return props.renderLoading;
        } else if (this.config.hasOwnProperty('renderLoading')) {
            return this.config.renderLoading;
        }
        return context['falcor-render-loading'] || false;
    }
    checkCacheAndUpdate(props, context) {

        const { fragment } = this;

        // if (props.hasOwnProperty('falcor-data') || props.hasOwnProperty('falcor-model')) {
        this.propsStream.next({
            props, fragment, loading: false,
            data: props['falcor-data'] || context['falcor-data'],
            model: props['falcor-model'] || context['falcor-model'],
            renderLoading: this.shouldRenderLoading(props, context),
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

        const currData = currProps['falcor-data'];
        const nextData = nextProps['falcor-data'];
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
        const mappedFragment = data ? mapFragment(data, props) : {};
        const mergedProps = mergeProps(mappedFragment, props);

        if (error) {
            mergedProps.error = error;
        }

        if (loading && this.shouldRenderLoading(props) === true) {
            mergedProps.loading = loading;
        }

        return <Component { ...mergedProps }/>;
    }
}

function fragments(items = []) {
    if (!items ||
        'object' !== typeof items ||
        !items.hasOwnProperty('length')) {
        return `{ length }`;
    }
    return `{ length ${Array
        .from(items, (x, i) => x)
        .reduce((xs, x, i) =>`${xs}, ${
            i}: ${this.fragment(x)}`, '')
    }}`;
}

function tryDeref({ data, model }) {
    return !data || !model ?
        model : model.deref(data);
}

function fetchEachPropUpdate(update) {
    if (!(update.model = tryDeref(update))) {
        return Observable.of(update);
    } else if (update.renderLoading === true) {
        return fetchDataUntilSettled(update);
    }
    return fetchDataUntilSettled(update).takeLast(1);
}

function mergeEachPropUpdate(
    { props, model },
    { data, error, version, loading }
) {
    const hash = data && data.$__hash;
    const status = data && data.$__status;
    loading = loading || status === 'pending';
    return { hash, data, props, model, error, loading, version };
}

function defaultMapFragment(fragmentProps) {
    return fragmentProps;
}

function defaultMergeProps(fragmentProps, componentProps) {
    return { ...componentProps, ...fragmentProps };
}
