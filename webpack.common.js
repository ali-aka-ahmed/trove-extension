const path = require('path');

module.exports = {
  entry: {
    background: path.join(__dirname, 'src/app/background.ts'),
    content: path.join(__dirname, 'src/app/content.tsx'),
    popup: path.join(__dirname, 'src/app/popup.tsx')
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
        exclude: path.resolve(__dirname, 'node_modules'),
        test: /\.inject\.scss$/,
        use: [
          'to-string-loader', // Back to string
          'css-loader',       // Translates CSS into CommonJS
          'sass-loader'       // Compiles Sass to CSS
        ]
      },
      {
        exclude: path.resolve(__dirname, 'node_modules'),
        test: /\.scss$/,
        use: [
          'style-loader', // Common JS to DOM node
          'css-loader',   // Translates CSS into CommonJS
          'sass-loader'   // Compiles Sass to CSS
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader', // Common JS to DOM node
          'css-loader',   // Translates CSS into CommonJS
        ]
      },
      {
        exclude: /node_modules/,
        test: /\.(png|svg|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000, // in bytes
              name: '[name].[ext]'
            }
          }
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  }
};
