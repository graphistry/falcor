var path = require('path');
var webpack = require('webpack');
var internalKeys = require('../lib/internal');
var OptimizeJsPlugin = require('optimize-js-plugin');
var WebpackVisualizer = require('webpack-visualizer-plugin');
var ClosureCompilerPlugin = require('webpack-closure-compiler');

module.exports = [
    nodeConfig(process.env.NODE_ENV === 'development'),
    browserConfig(process.env.NODE_ENV === 'development')
];

function browserConfig(isDev) {
    var config = baseConfig(isDev);
    config.output = {
        path: path.resolve('./dist'),
        filename: `falcor.all${isDev ? '' : '.min'}.js`,
        library: 'falcor',
        libraryTarget: 'umd',
        umdNamedDefine: true
    };
    config.plugins = plugins(config, isDev);
    return config;
}

function nodeConfig(isDev) {
    var config = baseConfig(isDev);
    config.externals = [/\@graphistry\/falcor-path-utils/];
    config.output = {
        path: path.resolve('./dist'),
        filename: `falcor.node${isDev ? '' : '.min'}.js`,
        library: 'falcor',
        libraryTarget: 'commonjs2'
    };
    config.plugins = plugins(config, isDev);
    return config;
}

function baseConfig(isDev) {
    return {
        amd: false,
        // Create Sourcemaps for the bundle
        devtool: 'source-map',
        resolve: {
            unsafeCache: true,
            alias: {
                'falcor': path.resolve('./lib')
            }
        },
        entry: { falcor: ['./lib/index.js'] },
        module: {
            loaders: loaders(isDev),
            noParse: [
                /\@graphistry\/falcor-query-syntax\/lib\/paths\-parser\.js$/,
                /\@graphistry\/falcor-query-syntax\/lib\/route\-parser\.js$/
            ]
        },
        stats: {
            'errors-only': true,
            colors: true /* Nice colored output */
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
                babelrc: false,
                plugins: [
                   [require.resolve('babel-plugin-transform-es2015-template-literals'), { loose: true }],
                    require.resolve('babel-plugin-transform-es2015-literals'),
                    require.resolve('babel-plugin-transform-es2015-shorthand-properties'),
                    require.resolve('babel-plugin-transform-es2015-unicode-regex'),
                    require.resolve('babel-plugin-check-es2015-constants'),
                   [require.resolve('babel-plugin-transform-es2015-spread'), { loose: true }],
                    require.resolve('babel-plugin-transform-es2015-parameters'),
                    require.resolve('babel-plugin-transform-es2015-block-scoping')
                ]
            }
        };
    }
}

function plugins(config, isDev) {

    var internalKeyDefinitions = Object
        .keys(internalKeys)
        .reduce((keys, key) => {
            keys[key] = `"${internalKeys[key]}"`;
            return keys;
        }, {});

    var plugins = [
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({ DEBUG: isDev }),
        new webpack.DefinePlugin(internalKeyDefinitions),
        new webpack.ProvidePlugin({ 'Promise': 'es6-promise' }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new webpack.LoaderOptionsPlugin({
            debug: isDev,
            queit: true,
            silent: true,
            minimize: false,
            progress: false,
        }),
    ];
    if (isDev) {
        plugins.push(new WebpackVisualizer());
    } else {
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
                create_source_map: `${config.output.path}/${config.output.filename}.map`,
                output_wrapper: `%output%\n//# sourceMappingURL=${config.output.filename}.map`
            },
            concurrency: 3,
        }));
    }
    // plugins.push(new OptimizeJsPlugin({
    //     sourceMap: true
    // }));
    plugins.push(license());
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
