## 从零开始用webpack配置一个react真实项目
以往我们都是直接使用 `create-react-app` 这类脚手架工具来新建一个项目，但是里面的所有配置都是一个黑盒子。
这是一个从空文件夹开始的全新项目，用来学习webpack用。

环境：
 - node v10.7.0
 - npm v6.2.0


## 项目初始化&基础依赖安装
在命令行中创建新的项目：
```
// 创建 package.json 文件
npm init
// 安装 webpack 依赖
npm install --save-dev webpack
// 安装react, react-dom
npm install react react-dom
```