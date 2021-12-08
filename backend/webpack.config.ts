// const path = require('path');

// module.exports = {
//   mode: 'development',
//   devtool: 'source-map',
//   entry: "./src/main.ts",
//   module: {
//     rules: [
//       {
//         test: /\.ts$/,
//         use: 'ts-loader',
//         include: [path.resolve(__dirname, 'src')],
//         options: {
//           getCustomTransformers: (program: any) => ({
//             before: [require('@nestjs/swagger/plugin').before({}, program)]
//           })
//         }
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.ts', '.js'],
//   },
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'public'),
//     publicPath: '/public/'
//   }
// }

// module.exports = {
//   devtool: 'source-map',
//   entry: [
//     './index'
//   ],
//   output: {
//     path: path.join(__dirname, 'dist'),
//     filename: 'bundle.js',
//     publicPath: '/static/'
//   },
//   module: {
//     rules: [
//       {
//         test: /my_client\/.*\.js$/,
//         use: 'imports-loader?define=>false',
//         loader: 'ts-loader',
//         options: {
//           getCustomTransformers: (program: any) => ({
//             before: [require('@nestjs/swagger/plugin').before({}, program)]
//           })
//         }
//       }
//     ]
//   },
//   node: {
//     fs: 'empty'
//   }
// }
