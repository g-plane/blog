---
title: 转向 MIT
created_at: 2018-06-27 23:06:50
categories:
  - essay
tags:
  - 开源
view: post
layout: post
author: gplane
lang: en
---

就在刚刚，我将我 GitHub 上所有的项目都转到了 MIT 许可证。

目前在 GitHub 上有三个开源许可证是比较流行的，分别是 MIT、Apache License 2.0 和 GPL v3。

我是不喜欢 GPL 的。

不过当初不用 GPL 并不是因为不喜欢，而是觉得，我的代码还不足以牛逼到作一些限制，以至于不允许闭源。不过现在，我是真的讨厌 GPL。理由也很简单，GPL 这种病毒式的感染，让我很不舒服；GPL 软件的分发版本必须开源，甚至使用过 GPL 的软件都需要开源，极不友好。一句话就是，GPL 不够 **开放**。

我的之前选择大多是 Apache License 2.0。我选择它的原因是它足够开放。源码拿到手，你可以随意折腾。但是 Apache License 2.0 有个要求就是分发版本要声明变更（state changes）。我这么做主要是考虑到某些 fork 一旦有什么威胁到我本身，我可以看到哪里发生了改变。

不过，现在看来，这种顾虑是多余的。现在根本就没有人来 fork 我的项目，所谓的威胁根本不存在（我还希望有更多人来 fork）。另外，MIT 比 Apache License 2.0 更简单，条框更少，更加 permissive。我就喜欢这种简简单单的，琐事越少越好。

我希望能有更多的人加入我们的 MIT 行列，引用 Python 著名的 HTTP 请求库 `requests` 的官方网站中的一句话：

> 在开始你的下一个开源项目时，GPL 应该不再是你的默认选择。[^1]

全文完。

[^1]: http://docs.python-requests.org/zh_CN/latest/user/intro.html#apache2
