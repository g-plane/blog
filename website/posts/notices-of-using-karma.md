---
title: 使用 Karma 的一些小坑
categories:
  - development
tags:
  - JavaScript
  - 前端
created_at: 2017-05-06 22:49:19
view: post
layout: post
author: gplane
lang: en
---

周末打算用 Karma 来给 [blessing-trans](https://github.com/g-plane/blessing-trans)（一个我用来练习 TypeScript 的项目，欢迎 star）进行测试。之前用的是 QUnit 和 node-qunit-phantomjs 来测试。但我的代码中使用了 HTML5 API 中的 `localStorage` 时，似乎 phantomjs 不支持，然后想试试用 Karma，因此遇到了几个坑，特此记录。

## 配置文件

我是通过 CLI 执行 `karma init` 来生成配置文件的，虽然在向导提示中 Karma 有询问我使用的是什么测试框架和什么浏览器，但是在生成出来的文件中仅仅是指定了测试框架和浏览器：

[![sp20170506_214636.png](https://i.loli.net/2018/05/08/5af1c34dd2026.png)](https://i.loli.net/2018/05/08/5af1c34dd2026.png)

[![sp20170506_214642.png](https://i.loli.net/2018/05/08/5af1c34dda953.png)](https://i.loli.net/2018/05/08/5af1c34dda953.png)

这样是不够的，还需要我们安装相应的插件。以 QUnit 和 Chrome 为例，我们要安装 `karma-qunit` 和 `karma-chrome-launcher`，并在配置文件中的 `plugins` 中添加这些插件：

[![sp20170506_215056.png](https://i.loli.net/2018/05/08/5af1c34defd44.png)](https://i.loli.net/2018/05/08/5af1c34defd44.png)

## 加载 QUnit

如果要在工程目录中通过执行 `karma start` 来开始测试，那么应该在全局环境中安装 Karma，并且在全局环境中安装 QUnit，否则它将提示 `Cannot find module 'qunitjs'` 的错误，如图：

[![sp20170506_201307.png](https://i.loli.net/2018/05/08/5af1c34e04f91.png)](https://i.loli.net/2018/05/08/5af1c34e04f91.png)

* * *

总的来说，Karma 还是不错的，要不试试抛弃之前的 node-qunit-phantomjs？
