import compose from 'recompose/compose';
import toClass from 'recompose/toClass';
import mapProps from 'recompose/mapProps';
import lifecycle from 'recompose/lifecycle';
import setStatic from 'recompose/setStatic';
import withProps from 'recompose/withProps';
import getContext from 'recompose/getContext';
import withContext from 'recompose/withContext';
import shallowEqual from 'recompose/shallowEqual';
import shouldUpdate from 'recompose/shouldUpdate';
import mapPropsStream from 'recompose/mapPropsStream';
import setDisplayName from 'recompose/setDisplayName';
import wrapDisplayName from 'recompose/wrapDisplayName';
import mapToFalcorJSON from '../utils/mapToFalcorJSON';
import bindActionCreators from '../utils/bindActionCreators';
import mergeIntoFalcorJSON from '../utils/mergeIntoFalcorJSON';
import setObservableConfig from 'recompose/setObservableConfig';
import invalidateFalcorJSON from '../utils/invalidateFalcorJSON';
import rxjsObservableConfig from 'recompose/rxjsObservableConfig';
import FalcorQuerySyntax from '@graphistry/falcor-query-syntax';
import { Observable } from 'rxjs';
import React, { PropTypes, Children } from 'react';

const contextTypes = {
    falcor: PropTypes.object,
    version: PropTypes.number,
    dispatch: PropTypes.func
};

const containerBase = compose(
    getContext(contextTypes),
    shouldUpdate((props, nextProps) => {
        const { version: thisVersion, data: thisJSON, ...restProps } = props;
        const { version: nextVersion, data: nextJSON, ...restNextProps } = nextProps;
        if (thisVersion !== nextVersion) {
            return true;
        } else if (!thisJSON || !nextJSON || thisJSON.$__hash !== nextJSON.$__hash) {
            return true;
        }
        return !shallowEqual(restProps, restNextProps);
    }),
    mapPropsStream((props) => props
        .map((({ data, falcor, ...rest }) => {
            data = invalidateFalcorJSON(mapToFalcorJSON(data, falcor));
            return {
                ...rest,data,
                falcor: data &&
                        data.$__path &&
                        data.$__path.length &&
                        falcor.deref(data) || falcor
            };
        }))
        .switchMap(
            ({ data, falcor, version, getFragment, ...rest }) => Observable
                .of({
                    prev: null, settled: false,
                    data, falcor, getFragment, rest
                })
                .expand(loadContainerDataUntilSettled)
                .takeLast(1),
            ({ data, falcor, version, getFragment, ...rest }, { data: d2, error }) => ({
                falcor, ...rest, data: d2, error
            })
        )
    ),
    withContext(contextTypes, ({ data, falcor }) => ({
        falcor, version: data && data.$__version || falcor.getVersion()
    }))
);

function loadContainerDataUntilSettled(state) {
    if (state.settled === true) {
        return Observable.empty();
    }
    const { data, rest, prev,
            falcor, getFragment } = state;
    const query = getFragment(data, rest);
    if (query !== prev) {
        return Observable
            .from(falcor.get(...FalcorQuerySyntax.call(null, query)))
            .map(({ json }) => Object.assign(state, {
                prev: query, data: mergeIntoFalcorJSON(data, json)
            }))
            .catch((error) => Observable.of(Object.assign(state, {
                error, settled: true
            })));
    }
    return Observable.empty();
}

const defaultMapFragmentToProps = (data) => data;
const defaultMapDispatchToProps = (dispatch, props, falcor) => ({});
const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
    ...parentProps, ...stateProps, ...dispatchProps
});

const container = (
    getFragment,
    mapFragment = defaultMapFragmentToProps,
    mapDispatch = defaultMapDispatchToProps,
    mergeFragmentAndProps = defaultMergeProps
) => {
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
    return (BaseComponent) => compose(
        setStatic('fragment', getFragment),
        setDisplayName(wrapDisplayName(
            BaseComponent, 'Container'
        )),
        toClass, withProps({ getFragment }),
        containerBase,
        mapProps(({ data, error, falcor, version, loading, dispatch, getFragment, ...rest }) => {
            const mappedFragment = mapFragment(data, { error, ...rest });
            const mappedDispatch = mapDispatch(dispatch, mappedFragment, falcor);
            const {
                $__key, $__path, $__refPath, $__version,
                $__hash__$, $__keysPath, $__keyDepth, $__toReference,
                ...allMergedProps
            } = mergeFragmentAndProps(mappedFragment, mappedDispatch, rest);
            return allMergedProps;
        })
    )(BaseComponent);
};

export default container;
