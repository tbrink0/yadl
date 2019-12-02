const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'yadl.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'yadl',
  },
}