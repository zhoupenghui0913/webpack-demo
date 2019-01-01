# 从零开始用webpack配置一个react真实项目
以往我们都是直接使用 `create-react-app` 这类脚手架工具来新建一个项目，但是里面的所有配置都是一个黑盒子。
这是一个从空文件夹开始的全新项目，用来学习webpack，先学会怎么用，再去深究里面的原理。
实现一个正常项目该有的功能如下：

 - 开发模式&webpack-dev-server
 - 多页面解决方案：提取公共带代码
 - 单页面解决方案：代码分割和按需加载
 - 自动生成html文件
 - 开发环境&生产环境
 - Clean Plugin and Watch Mode
 - Dll动态链接库

环境：
 - node v10.7.0
 - npm v6.2.0


## 一：项目初始化&基础依赖安装
#### 1、在命令行中创建新的项目：
```
// 创建 package.json 文件
npm init
// 安装 webpack 依赖
npm install --save-dev webpack
// 安装react, react-dom
npm install react react-dom
```

#### 2、项目结构确定
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

#### 3、编写代码
现在我们在index.js中引入src里面项目下的App.js，在index.html中添加根挂载点，引入js：

```
<div id="root"></div><script src="./index.js"></script>
```

好了，现在在浏览器打开index.html：

![image](https://user-images.githubusercontent.com/17584535/50421650-c4aab700-087c-11e9-8c9d-f72ac7f5e1b4.png)

发现浏览器原生根本就不认识我们写的ES6模块化代码，所以，接下来预编译模块化解决方案webpack正式登场。

#### 4、webpack登场
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
  "build": "webpack"
},
```                                          

然后再次执行 `npm run build`，可以发现和之前的效果是相同的。简单的使用到此为止，接下来我们来探索 webpack 更多的功能。

## 二：多页面解决方案：提取公共代码
相比于webpack3.0，4.0版本用 optimization.splitChunks 配置替换了3.0版本内置的 CommonsChunkPlugin 插件，在使用和配置上，更加方便和清晰。

#### 为什么需要提取公共代码
大型网站通常会由多个页面组成，每个页面都是一个独立的单页应用，所以很有必要把多个页面公共的代码抽离成单独的文件。在用户第一次访问后，这些页面公共的代码文件就被浏览器缓存起来了，这样做的优点是：
 - 减少网络传输，降低服务器成本；
 - 虽然用户第一次打开网站的速度得不到优化，但之后访问其他页面的速度将大大提升；
 
上面的说法很不理解，每个独立的项目怎么去做呢？两个独立的项目怎么从它们里面去抽取公共的代码？在技术栈一样的情况下顶多有一个公共的框架依赖。不理解
现在我的理解是：只有当我在开发一个多页面应用（意味着要配置多入口）的时候才会用到提取公共代码，不知道还有没其他的场景。

 
#### 思路
 - 根据技术栈，把所有页面都需要的基础库提取出来，形成一个`base.js`，这个文件包含技术栈运行所需要的所有基础环境依赖（只要技术栈不变，基本可以持久缓存）；
 - 剔除被`base.js`包含的代码后，再找出所有页面都依赖的公共部分提取出来，形成一个`common.js`；
 - 再为每个页面生成一个独立的文件，这些文件就不再包含`base.js`、`common.js`的代码，只包含各个页面独立的业务代码； 


![image](https://user-images.githubusercontent.com/17584535/50557873-29a25900-0d24-11e9-979b-4b8ac92d3e68.png)


一直不明白这个的使用场景，是不是只对多页应用才有效果啊，提取公共代码，还有多入口是什么鬼，像RN里面分ios和android？
webpack只是一个打包工具，多入口这种形式会打出不同的文件，比如RN项目区分ios和android，ios用打出来的ios包

平安的分成一个pc一个h5，也是多入口，形成不同的依赖树，但是这个可以用来作为提取公共代码的理由吗？



更新：webpack可以提取多个现成chunk中的公共部分，也就是说我们可以针对一开始不同的项目打包出来的文件集合进行公共代码抽取。
比如新开的用户反馈和球员打分项目，都是嵌入在app里面，公共的部分是可以通过这种方式提取的。
也就是我一开始的疑问得到了解决，但是这种提取对实际开发来说并不现实，我不可能等所有项目开发完打好包再去提取。

归根结底：除非是在开发多页面应用，否则不会用到提取公共代码。



## 三：单页面解决方案：代码分割和按需加载

#### 什么是代码分割
最开始使用webpack的时候，都是将所有的js打包成一个bundle.js，但是在大型项目中，bundle.js可能过大，导致页面加载时间过长，这个时候就需要代码分割。
代码分割就是将文件分割成块（chunk），我们可以定义一些分割点，根据这些分割点对文件进行分块，并实现按需加载。

#### 代码分割的作用
 - 第三方类库单独打包：将其与业务代码分离出来，这样就可以最大化的利用浏览器的缓存机制，减少请求（有点抽取公共代码的味道）；
 - 按需加载：只有实现了代码分割才能做到按需加载；
 
#### 代码分割的方法
 - 入口起点：使用entry配置手动地分离代码；
 - 防止重复：使用splitChunks去重和分离chunk；
 - 动态导入：通过模块的内联函数调用来分离代码；
 
 
前面两种意义不大，我们主要看动态导入这种方式：
对于动态导入，第一种使用符合 ECMAScript 提案 的 import() 语法。第二种，则是使用 webpack 特定的 require.ensure。


#### 为什么需要按需加载
加载项目时，不管那些代码有没有执行到，都会下载下来。如果说，我们只下载我们需要执行的代码话，那么可以节省相当大的流量。也就是我们所说的按需加载,这对于大型项目是相当有用的。


上面是实现了代码分割，但是加载这个chunk包并不需要用户交互，意味着每次加载页面的时候都会请求它。这样就毫无意义。
按需加载的意思就是我有交互需求了再去加载需要的代码。


把路由的例子放进来++++++，两种方式的区别


???? app里面的留底包，它是把js文件都解析出来，可平说名字不一样加载不到，难道不是依据我自动生成的index.html来的吗？确认一下？？？？









## 开发模式&webpack-dev-server
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


我们还可以配置一下DevServer，做一些定制化的东西：
```
devServer: {
  // 告诉服务器从哪个目录中提供内容，没明白用处
  contentBase: path.resolve(__dirname),
  // 用于确定应该从哪里提供 bundle，并且此选项优先。
  publicPath: "/build/",  // index.html里面的路径可以改成 src="./build/bundle.js"
  // 服务器的IP地址，可以使用IP也可以使用localhost
  host: 'localhost',
  // 服务端gzip压缩是否开启
  compress: true,
  // 配置服务端口号
  port: 1717
}
```

验证是热替换还是刷新整个页面，会报错


设置了mode解决警告


设置source map 但是不会自己进入，截图可以看到生成的source多了源代码的区别









## 学习资料
 - https://github.com/KieSun/webpack-demo
 - http://webpack.wuhaolin.cn/2%E9%85%8D%E7%BD%AE/2-2Output.html