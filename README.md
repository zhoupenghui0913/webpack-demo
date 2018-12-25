## 从零开始用webpack配置一个react真实项目
以往我们都是直接使用 `create-react-app` 这类脚手架工具来新建一个项目，但是里面的所有配置都是一个黑盒子。
这是一个从空文件夹开始的全新项目，用来学习webpack用，实现一个正常项目该有的功能：
 - 抽取公共代码
 - 自动打开浏览器
 - 按需加载代码
 - 自动刷新
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
├── config                      /** webpack相关配置*/
├── index.js                    /** 入口文件*/
├── index.html                  /** TypeScript编译输出目录*/
├── package.json                /** npm 依赖配置文件*/
├── package-lock.json           /** npm 依赖配置版本lock文件*/
├── README.md                   /** 说明文档*/
└── src                         /** 项目源码目录*/
    ├── source                  /** 图片资源*/
    ├── utils                   /** 工具方法库*/
    ├── data                    /** 数据请求文件*/
    └── <submoduleFolder>       /** 子模块项目目录*/
        └──App.js               /** 子模块启动入口*/
```





## 学习资料
https://github.com/KieSun/webpack-demo
http://webpack.wuhaolin.cn/2%E9%85%8D%E7%BD%AE/2-2Output.html