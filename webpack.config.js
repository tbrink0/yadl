const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'yadl.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'yadl',
  },
  devServer: {
    contentBase: './dist',
  },
}