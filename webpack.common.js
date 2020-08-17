const path = require('path');

module.exports = {
  entry: {
    background: path.join(__dirname, 'src/app/background.ts'),
    content: path.join(__dirname, 'src/app/content.tsx'),
    popup: path.join(__dirname, 'src/popup/index.tsx')
  },
  output: {
    path: path.join(__dirname, 'dist/js'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        exclude: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, 'src/app/index.scss')
        ],
        test: /\.scss$/,
        use: [
          {
            loader: 'to-string-loader' // Back to string
          },
          {
            loader: 'css-loader' // Translates CSS into CommonJS
          },
          {
            loader: 'sass-loader' // Compiles Sass to CSS
          }
        ]
      },
      {
        include: [path.resolve(__dirname, 'src/app/index.scss')],
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader' // Common JS to DOM node
          },
          {
            loader: 'css-loader' // Translates CSS into CommonJS
          },
          {
            loader: 'sass-loader' // Compiles Sass to CSS
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  }
};
