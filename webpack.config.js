const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    app: './src/client.ts'
  },
  output: {
    path: path.resolve(__dirname, './static'),
    filename: '[name].js',
    publicPath: '/static'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            target: 'es5',
            module: 'esnext'
          }
        }
      }
    ]
  },
  resolve: {
    modules: [
      'node_modules'
    ],
    extensions: [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json'
    ]
  },
  target: 'web',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NOD_ENV': JSON.stringify(process.env.NODE_ENV || 'devleopment')
    })
  ]
};
