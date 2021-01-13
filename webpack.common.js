const path = require('path');

module.exports = {
  entry: {
    background: path.join(__dirname, 'src/app/background.ts'),
    content: path.join(__dirname, 'src/app/content.tsx'),
    popup: path.join(__dirname, 'src/app/popup.tsx'),
  },
  output: {
    path: path.join(__dirname, 'dist/js'),
    filename: '[name].js'
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        oneOf: [
          {
            resourceQuery: /inject/,
            use: [
              'to-string-loader', // Back to string
              'css-loader',       // Translates CSS into CommonJS
              'sass-loader'       // Compiles Sass to CSS
            ]
          }, 
          {
            use: [
              'style-loader', // Common JS to DOM node
              'css-loader',   // Translates CSS into CommonJS
              'sass-loader'   // Compiles Sass to CSS
            ]    
          }
        ]
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            resourceQuery: /inject/,
            use: [
              'to-string-loader', // Back to string
              'css-loader',       // Translates CSS into CommonJS
            ]
          }, 
          {
            use: [
              'style-loader', // Common JS to DOM node
              'css-loader',   // Translates CSS into CommonJS
            ]    
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5000, // in bytes
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|jp2|webp)$/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]'
        }
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  }
};
