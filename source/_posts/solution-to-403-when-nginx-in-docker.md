---
title: 解决Docker下使用nginx的HTTP 403问题
id: 99
categories:
  - Linux
  - 运维
date: 2016-12-13 23:37:53
tags:
---

> 我用的系统是Fedora 25
这段时间在研究Docker，当然不例外地测试在Docker中使用nginx，这里我用的是Docker官方的镜像，pull好并在run参数设置好端口和数据卷挂载之后，打开网页却是403的提示。index.html明明已经有了，所以一开始总是在数据卷设置上弄。

在这个过程中，我发现如果在设置run的-v参数时，如果填写的主机路径有误或不存在时，nginx容器会调用镜像内置的示例页面，因此不会有403出现。但如果路径正确，就会有403。

后来查了资料，是因为权限不够，于是把目录设置成777，但问题依旧。在这多次的测试过程中，偶然Gnome的通知栏弹出提示说SELinux警报什么什么的，一开始没注意，后来再次提示，于是点进去看了看，确实是SELinux阻止了nginx对存放网页目录的读取。

SELinux是什么我就不多解释，可以自行百度，反正是跟Linux的安全有关。网上有些解决方法是关闭SELinux，但我认为这是治标不治本的方法。结合StackOverflow上的提出的方法，我讲讲解决方法。

其实只需一条命令：`sudo chcon -Rt httpd_sys_content_t [目录路径]`

例如，你的网页存放目录是/home/someone/www，那就是 “ sudo chcon -Rt httpd_sys_content_t /home/someone/www ”这样的，当然也可以用$(pwd)。不需要重启，能立即生效。