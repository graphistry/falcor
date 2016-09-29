import { Subject } from 'rxjs';
import React, { PropTypes, Children } from 'react';
import hoistStatics from 'recompose/hoistStatics';
import shallowEqual from 'recompose/shallowEqual';
import mapToFalcorJSON from '../utils/mapToFalcorJSON';
import wrapDisplayName from 'recompose/wrapDisplayName';
import bindActionCreators from '../utils/bindActionCreators';
import fetchDataUntilSettled from '../utils/fetchDataUntilSettled';

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
        const { fragment, Component,
                mergeFragmentAndProps,
                mapFragment, mapDispatch } = this.constructor;

        this.fragment = fragment;
        this.Component = Component;
        this.mapDispatch = mapDispatch;
        this.mapFragment = mapFragment;
        this.mergeFragmentAndProps = mergeFragmentAndProps;

        data = mapToFalcorJSON(data);
        falcor = falcor.deref(data);
        this.state = {
            ...props,
            hash: data.$__hash,
            data, falcor, dispatch,
            version: falcor.getVersion()
        };
        this.propsStream = new Subject();
        this.propsAction = this.propsStream
            .map((({ data, falcor, ...rest }) => {
                data = mapToFalcorJSON(data);
                falcor = falcor.deref(data);
                return { ...rest, data, falcor, fragment };
            }))
            .switchMap(fetchDataUntilSettled, (
                { fragment, ...props },
                { data, error, version }) => ({
                    ...props,
                    hash: data.$__hash,
                    version, data, error,
                })
            );
    }
    getChildContext() {
        const { falcor, dispatch } = this.state;
        return { falcor, dispatch };
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const { data: nextJSON, ...restNextProps } = nextProps;
        const { data: thisJSON, hash: thisHash,
                version: thisVersion, ...restState } = this.state;
        return !(
            thisJSON && nextJSON && (
            thisHash === nextJSON.$__hash) && (
            thisVersion === nextJSON.$__version) &&
            shallowEqual(restState, restNextProps)
        );
    }
    componentWillReceiveProps(nextProps, nextContext) {
        // Receive new props from the owner
        this.propsStream.next({ ...nextContext, ...nextProps });
    }
    componentWillMount() {
        // Subscribe to child prop changes so we know when to re-render
        this.propsSubscription = this.propsAction.subscribe((nextProps) => {
            this.setState(nextProps);
        });
        this.propsStream.next({ ...this.context, ...this.props });
    }
    componentWillUnmount() {
        // Clean-up subscription before un-mounting
        this.propsSubscription.unsubscribe();
        this.fragment = null;
        this.Component = null;
        this.mapDispatch = null;
        this.mapFragment = null;
        this.mergeFragmentAndProps = null;
    }
    render() {

        const { Component,
                mergeFragmentAndProps,
                mapFragment, mapDispatch } = this;

        const { data, hash, error, falcor, version,
                loading, dispatch, fragment, ...rest } = this.state;

        const mappedFragment = mapFragment(data, { error, ...rest });
        const mappedDispatch = mapDispatch(dispatch, mappedFragment, falcor);
        const allMergedProps = mergeFragmentAndProps(mappedFragment, mappedDispatch, rest);

        return (
            <Component { ...allMergedProps }/>
        );
    }
}

const defaultMapFragmentToProps = (data) => data;
const defaultMapDispatchToProps = (dispatch, props, falcor) => ({});
const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
    ...parentProps, ...stateProps, ...dispatchProps
});

export default function container(
    getFragment,
    mapFragment = defaultMapFragmentToProps,
    mapDispatch = defaultMapDispatchToProps,
    mergeFragmentAndProps = defaultMergeProps) {

    if (typeof mapDispatch !== 'function') {
        if (mapDispatch && typeof mapDispatch !== 'object') {
            mapDispatch = defaultMapDispatchToProps;
        } else {
            mapDispatch = function(actionCreators) {
                return function(dispatch, mappedFragment, falcor) {
                    return bindActionCreators(actionCreators, dispatch, falcor);
                };
            }(mapDispatch)
        }
    }

    return hoistStatics((BaseComponent) => class Container extends FalcorContainer {
        static fragment = getFragment;
        static Component = BaseComponent;
        static mapFragment = mapFragment;
        static mapDispatch = mapDispatch;
        static mergeFragmentAndProps = mergeFragmentAndProps;
        static displayName = wrapDisplayName(BaseComponent, 'Container');
    });
}
