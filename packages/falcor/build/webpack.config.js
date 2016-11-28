var path = require('path');
var webpack = require('webpack');
var WebpackVisualizer = require('webpack-visualizer-plugin');
var internalKeyDefinitions = require('../internalKeyDefinitions');
var ClosureCompilerPlugin = require('webpack-closure-compiler');

module.exports = webpackConfig();

function webpackConfig(isDev = process.env.NODE_ENV === 'development') {
    return {
        amd: false,
        // Create Sourcemaps for the bundle
        devtool: isDev ? 'source-map' : 'hidden-source-map',
        resolve: {
            unsafeCache: true
        },
        entry: {
            falcor: ['./lib/index.js']
        },
        output: {
            path: path.resolve('./dist'),
            filename: `falcor${isDev ? '' : '.min'}.js`,
            library: 'falcor',
            libraryTarget: 'umd',
            umdNamedDefine: true
        },
        module: {
            loaders: loaders(isDev),
            noParse: [
                /\@graphistry\/falcor-query-syntax\/lib\/paths\-parser\.js$/,
                /\@graphistry\/falcor-query-syntax\/lib\/route\-parser\.js$/
            ]
        },
        plugins: plugins(isDev),
        stats: {
            // Nice colored output
            colors: true
        }
    };
}

function loaders(isDev) {
    return [
        babel()
    ];
    function babel() {
        return {
            test: /\.(js|es6|mjs|jsx)$/,
            exclude: /(node_modules(?!\/rxjs))/,
            loader: 'babel-loader',
            query: {
                presets: [require.resolve('babel-preset-es2016')]
            }
        };
    }
}

function plugins(isDev) {
    var internalKeys = internalKeyDefinitions();
    var internalKeysAsStrings = Object
        .keys(internalKeys)
        .reduce(function(xs, key) {
            xs[key] = JSON.stringify(internalKeys[key]);
            return xs;
        }, {});

    var plugins = [
        license(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin(Object.assign(
            { DEBUG: isDev },
            internalKeysAsStrings
        )),
        new webpack.ProvidePlugin({ 'Promise': 'es6-promise' }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new webpack.LoaderOptionsPlugin({
            debug: isDev,
            queit: true,
            minimize: !isDev,
            progress: false,
        }),
    ];
    if (isDev) {
        plugins.push(new WebpackVisualizer());
    }
    else {
        plugins.push(new ClosureCompilerPlugin({
            compiler: {
                language_in: 'ECMASCRIPT6',
                language_out: 'ECMASCRIPT5',
                compilation_level: 'SIMPLE',
                // compilation_level: 'ADVANCED', // not yet
                rewrite_polyfills: false,
                use_types_for_optimization: false,
                // warning_level: 'QUIET',
                jscomp_off: '*',
                jscomp_warning: '*',
                source_map_format: 'V3',
                create_source_map: `${path.resolve('./dist')}/falcor.min.js.map`,
                output_wrapper: `%output%\n//# sourceMappingURL=falcor.min.js.map`
            },
            concurrency: 3,
        }));
    }
    return plugins;
}

function license() {
    return new webpack.BannerPlugin({
        entryOnly: true,
        banner: `
Copyright 2015 Netflix, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied. See the License for the specific language governing
permissions and limitations under the License.`
    });
}

function internalKeyDefinitions() {

    const ƒ_ = String.fromCharCode(30);

    return {
        'ƒ_':              `'${ƒ_}'`,
        'ƒ_meta':          `'${ƒ_}m'`,

        'ƒm_path':         `'path'`,
        'ƒm_version':      `'version'`,
        'ƒm_abs_path':     `'abs_path'`,
        'ƒm_deref_to':     `'deref_to'`,
        'ƒm_deref_from':   `'deref_from'`,

        'ƒ_key':           `'${ƒ_}key'`,
        'ƒ_ref':           `'${ƒ_}ref'`,
        'ƒ_head':          `'${ƒ_}head'`,
        'ƒ_next':          `'${ƒ_}next'`,
        'ƒ_path':          `'${ƒ_}path'`,
        'ƒ_prev':          `'${ƒ_}prev'`,
        'ƒ_tail':          `'${ƒ_}tail'`,
        'ƒ_parent':        `'${ƒ_}parent'`,
        'ƒ_context':       `'${ƒ_}context'`,
        'ƒ_version':       `'${ƒ_}version'`,
        'ƒ_abs_path':      `'${ƒ_}abs_path'`,
        'ƒ_ref_index':     `'${ƒ_}ref_index'`,
        'ƒ_refs_length':   `'${ƒ_}refs_length'`,
        'ƒ_invalidated':   `'${ƒ_}invalidated'`,
        'ƒ_wrapped_value': `'${ƒ_}wrapped_value'`,
    };
}
