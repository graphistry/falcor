var path = require('path');
var webpack = require('webpack');
var WebpackVisualizer = require('webpack-visualizer-plugin');
var ClosureCompilerPlugin = require('webpack-closure-compiler');

module.exports = webpackConfig();

function webpackConfig(isDev = process.env.NODE_ENV === 'development') {
    return {
        amd: false,
        queit: true,
        progress: false,
        devtool: isDev && /*'cheap-module-eval-*/'source-map' || 'source-map',
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
                presets: [isDev ? 'es2015' : 'es2016']
            }
        };
    }
}

function plugins(isDev) {
    var plugins = [
        license(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({ DEBUG: isDev }),
        new webpack.ProvidePlugin({ 'Promise': 'es6-promise' }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new webpack.LoaderOptionsPlugin({ debug: isDev, minimize: !isDev }),
    ];
    if (isDev) {
        plugins.push(new WebpackVisualizer());
    }
    else {
        plugins.push(new ClosureCompilerPlugin({
            compiler: {
                language_in: 'ECMASCRIPT6_STRICT',
                language_out: 'ECMASCRIPT5_STRICT',
                compilation_level: 'SIMPLE',
                create_source_map: path.resolve('./dist') + '/falcor.min.js.map'
                // output_wrapper: '(function(){\n%output%\n}).call(this)\n//# sourceMappingURL=falcor.min.js.map'
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
