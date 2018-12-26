/**
 * Created by zhoupenghui on 2018/12/25.
 */
const path = require("path");

module.exports = {
  entry: "../index.js",  // 入口文件，注意路径
  output: {
    path: path.resolve(__dirname, "build"),  // 输出文件夹，必须使用绝对地址
    filename: "bundle.js",  // 打包后输出的文件名
  },
};