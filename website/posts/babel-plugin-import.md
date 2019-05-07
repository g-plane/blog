---
title: babel-plugin-import 踩坑记录
created_at: 2019-05-07 19:19:34
categories:
  - development
tags:
  - JavaScript
  - 前端
view: post
layout: post
author: gplane
lang: en
---

严格来说这并不是一篇博文——只是踩坑记录。

## 问题

首先要说明 [`babel-plugin-import`](https://github.com/ant-design/babel-plugin-import) 上记录的插件用法是没有问题的。

在 [Blessing Skin](https://github.com/bs-community/blessing-skin-server) 的前端里使用了 Element UI，但我并不想把整个 Element UI 全部引入。因为我并只需要里面的几个组件，如果全部引入会造成打包体积过大。

在这之前一直都是手动地按需加载，就像这样：

```js
import Button from 'element-ui/lib/button'
```

这样能做到按需加载，但这样写非常麻烦，而且对 TypeScript 不友好，因为在 `element-ui/lib` 目录下并没有类型定义文件。

## 解决

其实之前 `babel-plugin-import` 和 `babel-plugin-component` 我都试过了，但最终还是整体打包了。一开始我觉得是插件的问题，不过想想这两个插件已经被发布那么久，应该不会有明显的 bug。打开 Babel 的 REPL 进行测试，发现这两个插件确实能够修改 `import` 语句。

就在刚刚我决定再试一次（不能说「再」了，已经是第三、四次了），然后翻了翻 `babel-plugin-import` 的 issues 列表，发现有人遇到了类似的问题，他们最后的解决方法是直接在 webpack 配置中 `babel-loader` 的选项里引入了这个插件，而不是在 `.babelrc` 或 `babel.config.js` 里。

最后就这样解决了。附上原文：[https://github.com/ant-design/babel-plugin-import/issues/298#issuecomment-453973514](https://github.com/ant-design/babel-plugin-import/issues/298#issuecomment-453973514)
