# 从零开始用webpack配置一个react真实项目
以往我们都是直接使用 `create-react-app` 这类脚手架工具来新建一个项目，但是里面的所有配置都是一个黑盒子。
这是一个从空文件夹开始的全新项目，用来学习webpack，先学会怎么用，再去深究里面的原理。
实现一个正常项目该有的功能如下：
 - 自动打开浏览器&自动刷新
 - 按需加载代码
 - 抽取公共代码
 - 生成生产环境代码
 - 新的语法支持
 - autoprefix、alias使用
 - 加载sourcemap
 - 区分环境
 - px2rem

环境：
 - node v10.7.0
 - npm v6.2.0


## 项目初始化&基础依赖安装
1、在命令行中创建新的项目：
```
// 创建 package.json 文件
npm init
// 安装 webpack 依赖
npm install --save-dev webpack
// 安装react, react-dom
npm install react react-dom
```

2、项目结构确定
在项目根目录下面添加index.js作为项目入口，src文件夹用来放项目源码，config文件夹用来放webpack配置，项目结构如下：

```
├── .gitignore
├── node_modules                /** npm依赖包子项目*/
├── index.js                    /** 入口文件*/
├── index.html                  /** TypeScript编译输出目录*/
├── package.json                /** npm 依赖配置文件*/
├── package-lock.json           /** npm 依赖配置版本lock文件*/
├── README.md                   /** 说明文档*/
├── config                      /** webpack相关配置*/
│   └── webpack.config.js       /** webpack配置文件*/
└── src                         /** 项目源码目录*/
    ├── source                  /** 图片资源*/
    ├── utils                   /** 工具方法库*/
    ├── data                    /** 数据请求文件*/
    └── <submoduleFolder>       /** 子模块项目目录*/
        └──App.js               /** 子模块启动入口*/
```

3、编写代码
现在我们在index.js中引入src里面项目下的App.js，在index.html中添加根挂载点，引入js：

```
<div id="root"></div><script src="./index.js"></script>
```

好了，现在在浏览器打开index.html：

![image](https://user-images.githubusercontent.com/17584535/50421650-c4aab700-087c-11e9-8c9d-f72ac7f5e1b4.png)

发现浏览器原生根本就不认识我们写的ES6模块化代码，所以，接下来预编译模块化解决方案webpack正式登场。

4、webpack登场
在webpack.config.js文件中写入以下代码

```js
const path = require("path");
module.exports = {
  entry: "../index.js",  // 入口文件，注意路径
  output: {
    path: path.resolve(__dirname, "build"),  // 输出文件夹，必须使用绝对地址
    filename: "bundle.js",  // 打包后输出文件的文件名
  },
};
```


修改index.html引入打包后的脚本文件：
```
<script src="./build/bundle.js"></script>
```

试试我们使用webpack，在命令行中输入：
```
node_modules/.bin/webpack
```
提示你"npm install -D"，yes就可以，安装一下webpack-cli。

会出一个问题，入口找不到`./src`：
```
ERROR in Entry module not found: Error: Can't resolve './src' in '/Users/zhoupenghui/workSpace/webpack-demo'
```

我们先把webpack配置文件从config文件夹中移到根目录下面，后面再来解决这个问题，还是运行上面的命令，发现有报错：
![image](https://user-images.githubusercontent.com/17584535/50429279-60c5d400-08f8-11e9-93b8-7abd25f3ab18.png)

根据提示，我们知道要安装一下loader，看报错应该是要能够支持react语法的loader，
首先使用一个工具把JSX和ES2015翻译成浏览器都支持的语法，@babel/core就是干这个用的，babel-loader 用于让 webpack 知道如何运行 babel。

安装如下：
```
// @babel/core 可以看做编译器，这个库知道如何解析代码，用于将字符串解析成AST
// babel-loader 用于让 webpack 知道如何运行 babel
// @babel/preset-env 预设配置 根据环境的不同转换代码
// @babel/preset-react 支持react的预设配置
npm install --save-dev @babel/core babel-loader @babel/preset-env @babel/preset-react
```


增加webpack相关的loader：
```
module.exports = {
  // ......
  module: {
    rules: [
      {
         test: /\.jsx?$/,  // js文件才使用babel
         exclude: /node_modules/,  // 不包括路径
         // 使用哪个loader
         use: {
           loader: 'babel-loader',
           options: {
             babelrc: false,
             presets: ["@babel/react", "@babel/env"],
             plugins: ["@babel/plugin-proposal-class-properties"]
           }
         }
       },
    ]
  }
}
```

在命令行中输入：
```
node_modules/.bin/webpack
```

一切顺利的话可以在控制台看到：
![image](https://user-images.githubusercontent.com/17584535/50437686-caa8a280-0925-11e9-8fd6-ff170be0c1bd.png)

现在打开index.html也能看到内容：
![image](https://user-images.githubusercontent.com/17584535/50437770-26732b80-0926-11e9-9318-d070de92530f.png)


我们每次要输入`node_modules/.bin/webpack`过于繁琐，可以在 package.json 如下修改
```
"scripts": {
  "start": "webpack"
},
```                                          

然后再次执行 `npm run start`，可以发现和之前的效果是相同的。简单的使用到此为止，接下来我们来探索 webpack 更多的功能。


## 自动打开浏览器&自动刷新
前面已经可以让webpack正常运行起来了，但是在实际开发中还需要：
 1. 提供HTTP服务，而不是本地预览；
 2. 监听文件的变化并自动刷新网页，做到实时预览；
 
Webpack 原生支持第2点，再结合官方提供的开发工具 DevServer 也可以很方便地做到第1点。
DevServer 会启动一个 HTTP 服务器用于服务网页请求，同时会帮助启动 Webpack ，并接收 Webpack 发出的文件更变信号，通过 WebSocket 协议自动刷新网页做到实时预览。

安装 DevServer：
```
npm i --save-dev webpack-dev-server
```

然后修改 package.json 文件：
```
"scripts": {
  "build": "webpack",
  "dev": "webpack-dev-server --open"
},
```

现在直接在终端执行 `npm run dev`，可以发现浏览器自动打开了一个空的页面，并且在命令行中也多了新的输出：
![image](https://user-images.githubusercontent.com/17584535/50440714-617b5c00-0932-11e9-984b-7b0b06aaae6e.png)

这意味着 DevServer 启动的 HTTP 服务器监听在 http://localhost:8080/ ，DevServer 启动后会一直驻留在后台保持运行，访问这个网址你就能获取项目根目录下的 index.html。
浏览器打开这个地址页面空白错误原因是 ./build/bundle.js 加载404了。 发现并没有文件输出到 build 目录，原因是 DevServer 会把 Webpack 构建出的文件保存在内存中，在要访问输出的文件时，必须通过 HTTP 服务访问。 由于 DevServer 不会理会 webpack.config.js 里配置的 output.path 属性，所以要获取 bundle.js 的正确 URL 是 http://localhost:8080/bundle.js，对应的 index.html 应该修改为：

```
<script src="./bundle.js"></script>
```

修改一下js文件（修改html文件没用）然后保存，发现浏览器会自动刷新，good job！





## 学习资料
 - https://github.com/KieSun/webpack-demo
 - http://webpack.wuhaolin.cn/2%E9%85%8D%E7%BD%AE/2-2Output.html