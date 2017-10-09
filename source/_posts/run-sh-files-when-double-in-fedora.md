---
title: 在Fedora的文件浏览器中双击执行sh文件
id: 91
categories:
  - Linux
date: 2016-12-11 00:14:19
tags:
---

最近想玩Linux，于是安装了Fedora 25。它的默认文件浏览器是nautilus，桌面环境是gnome。

因为我要调用jar文件，而Fedora里又不像Linux Mint那样可以在安装Oracle JDK后能双击jar文件运行，所以要通过写sh文件来调用。

sh文件写好后，双击没有任何反应。一开始把sh文件关联为“运行软件”，但不行。然后打算关联“终端”，但文件关联程序列表里没有终端，只好安装dolphin来关联，但也不行。

后来在[https://q.cnblogs.com/q/60713/](https://q.cnblogs.com/q/60713/)中发现答案：
> 文件浏览器的偏好设置中 行为tab页 设置一下就行
结合自己的实际体验，写下过程：

[![](http://www.sealfu.cf/wp-content/uploads/2016/12/2016-12-10-23-49-04屏幕截图-150x94.png)](http://www.sealfu.cf/wp-content/uploads/2016/12/2016-12-10-23-49-04屏幕截图.png)

点击“首选项”，然后打开“行为”选项卡

[![](http://www.sealfu.cf/wp-content/uploads/2016/12/2016-12-11-00-12-33屏幕截图-76x150.png)](http://www.sealfu.cf/wp-content/uploads/2016/12/2016-12-11-00-12-33屏幕截图.png)

在“可执行文本文件”中，改为“运行”，OK。

&nbsp;