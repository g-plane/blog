---
title: 使用 Laradock 进行 Laravel 应用开发
date: 2018-01-08 10:59:20
tags:
  - PHP
---

# Laradock?

前几天 [@printempw](https://blessing.studio) 说要开发 Blessing Skin Server v4，使用 Laravel 5.5。我肯定是滋磁的。且不说 v3 不兼容 PHP 7.2 （反正我不开设皮肤站，~~因此我是无所谓的~~），Laravel 5.4 开始为测试提供了很多便利的方法，而 Laravel 5.2 是没有的，所以为 v3 写测试的时候对于某些代码写得是比较痛苦的。

啊呀扯远了。今天是来讲怎样用 Laradock 进行 Laravel 应用开发的。Laradock 正如其名，它适合用于进行 Laravel 应用的开发。当然 Laradock 本质上是帮你配置好 Docker 而已，也就是说它使用的还是 Docker，因此你把它用于开发其它应用也不是不行，只是要额外配置不少东西。

那为什么要用 Docker 呢？Blessing Skin Server v4 是一次大升级，有很多东西与 v3 是不兼容的，所以计划是开发 v4 的同时，保持 v3 的维护。v3 的开发环境目前是在我的 Ubuntu 系统下安装了 Nginx 和 PHP 7.0，它们都是通过 Ubuntu 的包管理器安装的，然而我不想把 v4 的代码直接删掉，但一台电脑上安装另一个 Web 服务软件又是一个奇怪的做法，所以我想到了 Docker。

但我并不懂得用 Docker，虽说大一上学期曾经自己瞎折腾过，但早就忘光了，现在又懒得去学。所以 Laradock 方便了我这样的懒人。

# 安装

## 安装 Docker

Laradock 还使用了 docker-compose，为了方便我直接 `sudo apt install docker-compose` 了，反正 docker-compose 会依赖于 docker，也就是安装  docker-compose 的同时会安装 docker。

下一步是配置 Docker 的镜像源。Docker 默认的源是 Docker 官方的 Docker Hub。然而由于众所周知的原因，国内连接的速度很慢，所以我们要换成 daocloud.io 的源。

具体的切换方法会因环境不同而可能有差别，所以你最好去 daocloud.io 官方查看指导，在[这里](https://www.daocloud.io/mirror#accelerator-doc) 。

切换好后记得重启 Docker 的服务。

## 安装 Laradock

Laradock 的官方文档在[这里](http://laradock.io/) ，你可以自己按照文档的指导一步步来。简言之就是先 clone Laradock 的源码，然后配置 .env 文件，最后启动即可。

# 配置 Laradock

这里谈谈关于配置 Laradock 要注意的一些事情。首先当然是打开 .env 文件。

可以看到第一个配置项是：

```
APPLICATION=../
```

这个是用于指定你的应用程序的目录，默认是在 Laradock 的上一层。你可以根据需要修改为其它的位置，例如我的是：

```
APPLICATION=../app/
```

**记得最后要以 `/` 结尾。**

要注意的是，这里指向的是你的 Laravel 应用的目录，而不是 Web 服务软件的目录。一开始我就被坑了（事后一想其实是合理的）。因为 Laravel 要求 Web 服务软件的网站根目录要指向 Laravel 应用中的 `public` 目录，而不是 Laravel 应用的根目录。以我的配置为例，假如你在 `../app/` 位置放一个 `index.php` 是不起作用的，你需要将 `index.php` 放在 `../app/public/` 才能被访问到。

.env 文件中还有一项就是 `CHANGE_SOURCE`，这个要设为 `true`。（你看注释就知道了）

其它的配置项不难理解，自己按需设置就行。

# 启用 MySQL

在我这里直接执行 `sudo docker-compose up -d mysql` 是会报错的：

```
Building mysql
Step 1/10 : ARG MYSQL_VERSION=8.0
ERROR: Service 'mysql' failed to build: Please provide a source image with `from` prior to commit
```

网上的说法是 Docker 的版本太低。这很正常，因为我是从 Ubuntu 的官方软件仓库中下载的，而那里的软件通常不是最新的。

首先 `sudo apt-get remove docker.io` 来移除旧的 Docker，然后按照 Docker 官方的指导去安装最新的 Docker 即可。

问题解决。

以上。
