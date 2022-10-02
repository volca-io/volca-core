const path = require('path');
const slsw = require('serverless-webpack');
const { IgnorePlugin } = require('webpack');
const { isLocal } = slsw.lib.webpack;

module.exports = {
  // bundling mode
  mode: isLocal ? 'development' : 'production',
  devtool: isLocal ? 'eval' : 'source-map',

  // entry files
  entry: slsw.lib.entries,

  // in order to ignore built-in modules like path, fs, etc.
  target: 'node',

  externals: [
    'aws-sdk',
    'oracledb',
    'better-sqlite3',
    'tedious',
    'mysql',
    'mysql2',
    'oracledb',
    'pg-query-stream',
    'sqlite3',
    'pg-native',
    'better-sqlite3',
  ],

  // output bundles (location)
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '.webpack'),
    filename: '[name].js',
  },

  // file resolutions
  resolve: {
    extensions: ['.ts', '.js'],
  },

  // loaders
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
