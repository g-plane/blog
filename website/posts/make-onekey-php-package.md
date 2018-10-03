---
title: 自己做个一键PHP环境包
categories:
  - development
tags:
  - PHP
created_at: 2016-11-19 00:08:08
view: post
layout: post
author: gplane
lang: en
---

之前本地 PHP 调试环境是 phpStudy ，后来改成 XAMPP。用起来是没什么问题，但是它里面的 PHP 版本不是最新的，而且没有 NGINX，所以决定自己做个一键 PHP 环境包。

原本只打算里面包含 Apache、Nginx、PHP、MySQL。但我最近在学 MongoDB，所以决定加个 MongoDB，再者我看见 UPUPW 使用 MariaDB，于是把 MySQL 换成 MariaDB，而且 UPUPW 里面有 Redis，那我也加个 Redis。

因此目前的一键 PHP 环境包内含有：

*   Apache x86
*   Apache x64
*   Nginx
*   MariaDB x86
*   MariaDB x64
*   PHP 5 Non Thread Safe
*   PHP 5 Thread Safe
*   PHP 7 Non Thread Safe x86
*   PHP 7 Thread Safe x86
*   PHP 7 Non Thread Safe x64
*   PHP 7 Thread Safe x64
*   MongoDB with SSL
*   MongoDB without SSL
*   Redis

* * *

昨天就配置好了 Nginx 和 PHP 的关联，不过没写文章，现在补充。

首先像这样把 Nginx 和 PHP 解压好。

[![sp20161118_152941.png](https://i.loli.net/2018/05/08/5af1c2334ee2b.png)](https://i.loli.net/2018/05/08/5af1c2334ee2b.png)

然后打开 nginx\conf\nginx.conf，把 PHP 的那段取消注释：

[![sp20161118_153757.png](https://i.loli.net/2018/05/08/5af1c233bcbb3.png)](https://i.loli.net/2018/05/08/5af1c233bcbb3.png)

这里是我已经配置好的，那么实际上要把第69行的 `/scripts$fastcgi_script_name` 改为`$document_root$fastcgi_script_name`。

同时我不想要 Nginx 的默认网站根目录 html，我想要位于 Nginx 的上层目录 `www` 作为网站根目录。

但是问题来了，我总不能写绝对路径吧，这样的移植性是很差的。

所以我很自然地把 root 的值写成 `../www`（如图）

[![sp20161118_154855.png](https://i.loli.net/2018/05/08/5af1c23407fd4.png)](https://i.loli.net/2018/05/08/5af1c23407fd4.png)

然后下面 PHP 那段也是如此。

运行（怎么让两个程序运行后面讲），却无法解析 PHP 文件，提示 No input file specified 之类的。

后来上网查了下，原来是两处的相对路径表达方式是不一样的，PHP 那里的 root 要写成 `./www`（这是上层目录？）

[![sp20161118_155340.png](https://i.loli.net/2018/05/08/5af1c234153f0.png)](https://i.loli.net/2018/05/08/5af1c234153f0.png)

`location` 那里最好加个 `index.php` 吧。这么一改，OK 了。

接下来讲 PHP 的部分。PHP 部分虽然我弄了6个版本，但只要弄好一个 php.ini，就可以复制到各个版本中去，不过要注意 PHP5 要启用 mysql 扩展，而 PHP7 是没有的。

首先要把第760行的 `cgi.fix_pathinfo=1` 取消注释。

[![sp20161118_155829.png](https://i.loli.net/2018/05/08/5af1c2344f564.png)](https://i.loli.net/2018/05/08/5af1c2344f564.png)

然后把指向扩展目录的那行（第723行）取消注释。

[![sp20161118_160139.png](https://i.loli.net/2018/05/08/5af1c28bba771.png)](https://i.loli.net/2018/05/08/5af1c28bba771.png)

接着从877行开始，通过取消注释相应的行来启用相关扩展，注意扩展的依赖性，例如 `php_exif.dll` 依赖 `php_mbstring.dll`。

至此，php.ini 编辑完成，把它保存并复制到不同 PHP 版本的目录。

* * *

现在来配置 Apache 和 PHP 的关联，为此我上了 Apache 官网，可是我再怎么找也找不到 Apache 在 Windows 下的二进制文件，搜索一下原来是 Apache 官方不提供 Windows 下的二进制文件，需要自己编译或去第三方网站，幸好 Apache 提供了几个网站的链接。

我选择了第一个：[ApacheHaus](http://www.apachehaus.com/cgi-bin/download.plx)。

在 CMD 里运行 httpd，报错：

[![sp20161118_162951.png](https://i.loli.net/2018/05/08/5af1c28a9995d.png)](https://i.loli.net/2018/05/08/5af1c28a9995d.png)

还是要上网搜索——大概是要指定 Apache 所在目录的路径，可我不想写绝对路径啊！

后来在[StackOverflow](http://stackoverflow.com/questions/14548768/apache-could-not-be-started-serverroot-must-be-a-valid-directory-and-unable-to)中看到有类似的解决方法，不过这只能解决 `ServerRoot` 的问题，Apache 还是不能找到相应其它的目录。

StackOverflow 中说把 `ServerRoot` 改成 `../`，取代原来的指向 `SRVROOT` 常量，这样 Apache 是可以找到 `ServerRoot` 了，但其它地方还要引用 `SRVROOT` 的，我总不能逐个改吧？

于是我摸索了一番，发现如果我把 `SRVROOT` 的值改成以“/”开头，那么它会以当前所的在盘符为开头计算路径。

[![sp20161118_181205.png](https://i.loli.net/2018/05/08/5af1c28dcc167.png)](https://i.loli.net/2018/05/08/5af1c28dcc167.png)

如果我以一个小数点开头，它会以 Apache 所在目录（不是 httpd.exe 所在的 bin 目录）为开始计算路径。

[![sp20161118_181443.png](https://i.loli.net/2018/05/08/5af1c28d75aa6.png)](https://i.loli.net/2018/05/08/5af1c28d75aa6.png)

如果以两个小数点开头，就没问题了。

[![sp20161118_181753.png](https://i.loli.net/2018/05/08/5af1c28db215d.png)](https://i.loli.net/2018/05/08/5af1c28db215d.png)

那么现在算是完成了 Apache 的配置，但还要让它与 PHP 关联起来。

一开始测试老是提示我没有权限访问这个服务器，网上的说法是 `deny from all` 的问题，但其实并不是，后来研究一下是路径的问题。如果我有绝对路径的话，是能访问的。这次不是 `ServerRoot` 的问题了，而是 `DocumentRoot` 的问题。

然而我用 `SRVROOT` 常量能使 Apache 运行，但不能访问。也就是说只能单纯地用两个小数点来向上定位。

也是采用类似的方法测试：

[![sp20161118_232412.png](https://i.loli.net/2018/05/08/5af1c2e72d925.png)](https://i.loli.net/2018/05/08/5af1c2e72d925.png)

多向上了一层，然而修改后还是不行！

参考了 XAMPP 的，发现是用绝对路径的——不行。那看看 UPUPW 吧（还是靠这个……）

可是结果令我失望——它采用的方法是每次启动是修改 httpd.conf！

后来无意中在[serverfault](http://serverfault.com/questions/532630/is-the-apache-directory-directive-supposed-to-be-relative-to-the-documentroot-or)中找到有那么一点点关联的信息（话说还是国外资料丰富），当时只是看看，没想那么多：

```xml
<Directory />
```

像这样的一行在 httpd.conf 的第247行，默认是跟上一行的 `DocumentRoot` 一样。

那到底是不是 `DocumentRoot` 不支持相对路径？不是的。[这里](http://blog.csdn.net/koupoo/article/details/7713169)有解释。

然后无无意中想到，可以试试 `DocumentRoot` 使用相对路径，然后第247行那里像 `serverfault` 那样。

一试，成功了！

下面讲讲 Apache 加 PHP 模块。Apache 要 LoadModule，而模块文件只在线程安全的版本下才有，意味着 Apache 是不能用非线程安全版本 PHP 的。

把 httpd.conf 修改如下 ：

[![sp20161119_000023.png](https://i.loli.net/2018/05/08/5af1c2e639e64.png)](https://i.loli.net/2018/05/08/5af1c2e639e64.png)

这里使用 `SRVROOT` 常量是没有问题的。不过这要在修改 PHP 版本时，对应地修改 httpd.conf，要注意 Apache 和 PHP 要么同时用32位，要么同时用64位。

* * *

现在就要弄 MariaDB 了，可是把它解压好发现有1GB多！可我看别人的整合包才几十MB，所以肯定能精简。

还是上网搜索，说留下 bin、data、share 目录就行（但文件不要删）。（还是很大啊）

于是我在想能不能 x86 和 x64 共用同一个数据库目录呢？

查了一下是可以，方法是在 my.ini（这个文件需要自己创建或从它给的模板中修改并另存）中的 `mysqld` 段增加 `datadir` 项并把值设为对应的路径。那么能不能使用相对路径呢？

还是用刚刚探索 Apache 的那种方法，结果如下 ：

[![sp20161118_201008.png](https://i.loli.net/2018/05/08/5af1c2e6d5eca.png)](https://i.loli.net/2018/05/08/5af1c2e6d5eca.png)

接下来就很简单了：

[![sp20161118_201138.png](https://i.loli.net/2018/05/08/5af1c2e6df9b8.png)](https://i.loli.net/2018/05/08/5af1c2e6df9b8.png)

不过这样的 MariaDB 还是很大。跟 UPUPW 对比一下，原来是它把 bin 目录下除 exe 文件以外的文件删去。

* * *

MongoDB 没什么好配置的，只需要在启动的时候指定好数据库目录就行（非常适合数据库文件共用）。

而 MongoDB 的 bin 目录下也有跟 MariaDB 类似的多余的 pdb 文件，而且占用空间还不小，删了之后，没什么影响。

记得要给 PHP 加上 MongoDB 扩展！

2016年11月22日附加：社区版的 MongoDB 不支持 SSL，所以只能用不带 SSL 的。

* * *

至于 Redis 我没玩过，所以以 UPUPW 为参照。同样删除多余的 pdb 文件。

同样记得要给 PHP 加上 Redis 扩展！

* * *

好吧，这个一键 PHP 环境包弄好了，给它取个名字叫 gplane-webp。后面的 p 表示 package。

我还要用 Qt 写个 GUI 的控制台，不过不在这篇文章讲，毕竟与这篇文章关系不大。
