---
title: 解决安装 Manjaro 提示设备问题
created_at: 2018-07-10 14:36:53
categories:
  - development
tags:
  - Linux
view: post
layout: post
author: gplane
lang: en
---

由于家里的电脑没有 macOS，也懒得去折腾，但我又想在类 Unix 环境下进行开发，因此我选择安装 Linux。然后看了一下 distrowatch.com 上排行第一的发行版是 Manjaro，而且网上的评价似乎也不错，于是决定试一试。

安装方法自然是将 ISO 烧写到 U 盘上。我使用的工具是 Rufus。

准备好之后就让电脑从 U 盘启动。但我在 GRUB 中选择了开始进行安装向导之后，屏幕大概提示：`device did not show up after 30 seconds`。

ISO 是不可能有问题的，因为我校对过 SHA1。U 盘按理也是没问题的。

后来去搜索，发现这的确跟启动盘有关，但不一定是介质问题。我在[这里](https://forum.manjaro.org/t/cannot-boot-into-live-usb/19193)看到了一些可能的解决方法。

其中有一个是 `cd` 进 U 盘设备，大概是 `cd dev/disk/by-label` 然后 `ls` 找出设备。这是按卷标来查找设备。

不过当我执行 `ls` 之后却怎样都找不到我的 U 盘，此时我突然想起来，我在用 Rufus 烧写 ISO 的时候，是将卷标设为空的，这就导致 Manjaro 引导程序找不到我的 U 盘。然后我就回到 Windows，加上 ISO 指定的卷标后就可以了。

而且，我觉得，这个通过卷标来识别很有可能是硬编码的，也就是说，即使卷标存在，如果不正确（就是跟 ISO 所指定的不同）也有可能会导致启动失败。
