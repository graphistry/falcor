import { Subject } from 'rxjs';
import React, { PropTypes, Children } from 'react';
import hoistStatics from 'recompose/hoistStatics';
import shallowEqual from 'recompose/shallowEqual';
import mapToFalcorJSON from '../utils/mapToFalcorJSON';
import wrapDisplayName from 'recompose/wrapDisplayName';
import bindActionCreators from '../utils/bindActionCreators';
import mergeIntoFalcorJSON from '../utils/mergeIntoFalcorJSON';
import invalidateFalcorJSON from '../utils/invalidateFalcorJSON';
import fetchDataUntilSettled from '../utils/fetchDataUntilSettled';

const contextTypes = {
    falcor: PropTypes.object,
    version: PropTypes.number,
    dispatch: PropTypes.func
};

class FalcorContainer extends React.Component {

    static contextTypes = contextTypes;
    static childContextTypes = contextTypes;

    constructor(props, context) {
        super(props, context);

        const { data } = props;
        const { fragment, Component,
                mergeFragmentAndProps,
                mapFragment, mapDispatch } = this.constructor;
        const { falcor, version, dispatch } = context;

        this.fragment = fragment;
        this.Component = Component;
        this.mapDispatch = mapDispatch;
        this.mapFragment = mapFragment;
        this.mergeFragmentAndProps = mergeFragmentAndProps;

        this.state = { falcor, version, dispatch, ...props };
        this.propsStream = new Subject();
        this.propsAction = this.propsStream
            .map((({ data, falcor, ...rest }) => {
                data = invalidateFalcorJSON(mapToFalcorJSON(data, falcor));
                return { ...rest, fragment, data, falcor: data &&
                    data.$__path &&
                    data.$__path.length &&
                    falcor.deref(data) || falcor
                };
            }))
            .switchMap(
                fetchDataUntilSettled,
                ({ data, falcor, version, fragment, ...rest }, { data: d2, error }) => ({
                    falcor, ...rest, data: d2, error
                })
            );
    }
    getChildContext() {
        const { falcor, dispatch } = this.state;
        return { falcor, dispatch, version: falcor.getVersion() };
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const { version: thisVersion, data: thisJSON, ...restProps } = this.state;
        const { version: nextVersion, data: nextJSON, ...restNextProps } = nextProps;
        if (thisVersion !== nextVersion) {
            return true;
        } else if (!thisJSON || !nextJSON || thisJSON.$__hash !== nextJSON.$__hash) {
            return true;
        }
        return !shallowEqual(restProps, restNextProps);
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

        const { data, error, falcor, version,
                loading, dispatch, fragment, ...rest } = this.state;

        const mappedFragment = mapFragment(data, { error, ...rest });
        const mappedDispatch = mapDispatch(dispatch, mappedFragment, falcor);
        const {
            $__key, $__path, $__refPath, $__version,
            $__hash__$, $__keysPath, $__keyDepth, $__toReference,
            ...allMergedProps
        } = mergeFragmentAndProps(mappedFragment, mappedDispatch, rest);

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
