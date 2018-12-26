/**
 * Created by zhoupenghui on 2018/12/25.
 */
const path = require("path");

module.exports = {
  entry: "./index.js",  // 入口文件，注意路径
  output: {
    path: path.resolve(__dirname, "build"),  // 输出文件夹，必须使用绝对地址
    filename: "bundle.js",  // 打包后输出的文件名
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,  // js文件才使用babel
        exclude: /node_modules/,  // 不包括路径
        // 使用哪个loader
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            presets: ["@babel/react", "@babel/env"],  // 配置babel的方式，还可以使用 .babelrc 文件管理
          }
        }
      },
    ]
  },
};