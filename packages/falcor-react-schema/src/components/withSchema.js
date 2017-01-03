import React from 'react';
import invariant from 'invariant';
import * as FalcorRouteHandlers from '../falcor';
import hoistStatics from 'recompose/hoistStatics';
import wrapDisplayName from 'recompose/wrapDisplayName';
import wrapSchemaDescriptor from '../wrapSchemaDescriptor';

export default function withSchema(schemaDesc) {

    invariant(schemaDesc && (
              'function' === typeof schemaDesc || (
              'object'   === typeof schemaDesc &&
              'function' === typeof schemaDesc.schema)),
`Attempted to create a Schema container component without a schema definition.
Schema containers must be created with a schema function, or an Object with a "schema" function.`);

    if (typeof schemaDesc === 'function') {
        schemaDesc = { schema: schemaDesc };
    }

    schemaDesc.get = schemaDesc.get || FalcorRouteHandlers.get;
    schemaDesc.set = schemaDesc.set || FalcorRouteHandlers.set;

    return hoistStatics((Component) => {
        const displayName = wrapDisplayName(Component, 'Schema');
        return class Container extends SchemaContainer {
            static displayName = displayName;
            static schema = wrapSchemaDescriptor(schemaDesc, displayName);
            constructor(props, context) {
                super(props, context);
                this.Component = Component;
            }
        };
    });
}

class SchemaContainer extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.Component = this.constructor.Component;
    }
    componentWillUnmount() {
        this.Component = null;
    }
    render() {
        const { Component } = this;
        return !Component ? null : <Component {...this.props}/>;
    }
}
