/**
 * Created by zhoupenghui on 2018/12/25.
 */
const path = require("path");


console.log("看看__dirname是什么", __dirname);  // 打印出来的就是根目录的绝对路径

module.exports = {
  entry: "./index.js",  // 入口文件，注意路径
  output: {
    path: path.resolve(__dirname, "build"),  // 输出文件夹，必须使用绝对地址
    filename: "bundle.js",  // 打包后输出的文件名
  },
	devServer: {  //服务于webpack-dev-server  内部封装了一个express
		// 告诉服务器从哪个目录中提供内容，没明白用处
		contentBase: path.resolve(__dirname),
		// 此路径下的打包文件可在浏览器中访问，用于确定应该从哪里提供 bundle，并且此选项优先。
		publicPath: "/build/",
		// 服务器的IP地址，可以使用IP也可以使用localhost
		host: 'localhost',
		// 服务端gzip压缩是否开启
		compress: true,
		// 配置服务端口号
		port: 1717
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