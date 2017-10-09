---
title: 自己做个一键PHP环境包
id: 57
categories:
  - PHP
date: 2016-11-19 00:08:08
tags:
---

[ 注意：此文写于18日，但发布于19日 ]

之前本地PHP调试环境是phpStudy，后来改成XAMPP。用起来是没什么问题，但是它里面的PHP版本不是最新的，而且没有NGINX，所以决定自己做个一键PHP环境包。

原本只打算里面包含Apache、Nginx、PHP、MySQL。但我最近在学MongoDB，所以决定加个MongoDB，再者我看见UPUPW使用MariaDB，于是把MySQL换成MariaDB，而且UPUPW里面有Redis，那我也加个Redis。

因此目前的一键PHP环境包内含有：

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

昨天就配置好了Nginx和PHP的关联，不过没写文章，现在补充。

首先像这样把Nginx和PHP解压好。

[![sp20161118_152941](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_152941-150x94.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_152941.png)

然后打开nginx\conf\nginx.conf，把PHP的那段取消注释：

[![sp20161118_153757](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_153757-150x107.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_153757.png)

这里是我已经配置好的，那么实际上要把第69行的`/scripts$fastcgi_script_name` 改为`$document_root$fastcgi_script_name` 。

同时我不想要Nginx的默认网站根目录html，我想要位于Nginx的上层目录www作为网站根目录。

但是问题来了，我总不能写绝对路径吧，这样的移植性是很差的。

所以我很自然地把root的值写成../www（如图）

[![sp20161118_154855](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_154855-150x107.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_154855.png)

然后下面PHP那段也是如此。

运行（怎么让两个程序运行后面讲），却无法解析PHP文件，提示 No input file specified 之类的。

后来上网查了下，原来是两处的相对路径表达方式是不一样的，PHP那里的root要写成./www（这是上层目录？）

[![sp20161118_155340](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_155340-150x107.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_155340.png)

location那里最好加个index.php吧。这么一改，OK了。

接下来讲PHP的部分。PHP部分虽然我弄了6个版本，但只要弄好一个php.ini，就可以复制到各个版本中去，不过要注意PHP5要启用mysql扩展，而PHP7是没有的。

首先要把第760行的`cgi.fix_pathinfo=1` 取消注释。

[![sp20161118_155829](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_155829-150x107.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_155829.png)

然后把指向扩展目录的那行（第723行）取消注释。

[![sp20161118_160139](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_160139-150x107.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_160139.png)

接着从877行开始，通过取消注释相应的行来启用相关扩展，注意扩展的依赖性，例如php_exif.dll依赖php_mbstring.dll。

至此，php.ini编辑完成，把它保存并复制到不同PHP版本的目录。

* * *

现在来配置Apache和PHP的关联，为此我上了Apache官网，可是我再怎么找也找不到Apache在Windows下的二进制文件，搜索一下原来是Apache官方不提供Windows下的二进制文件，需要自己编译或去第三方网站，幸好Apache提供了几个网站的链接。

我选择了第一个：[ApacheHaus](http://www.apachehaus.com/cgi-bin/download.plx) 。

在CMD里运行httpd，报错：

[![sp20161118_162951](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_162951-150x78.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_162951.png)

还是要上网搜索——大概是要指定Apache所在目录的路径，可我不想写绝对路径啊！

后来在[StackOverflow](http://stackoverflow.com/questions/14548768/apache-could-not-be-started-serverroot-must-be-a-valid-directory-and-unable-to)中看到有类似的解决方法，不过这只能解决ServerRoot的问题，Apache还是不能找到相应其它的目录。

StackOverflow中说把ServerRoot改成`../`，取代原来的指向`SRVROOT常量，` 这样Apache是可以找到ServerRoot了，但其它地方还要引用SRVROOT的，我总不能逐个改吧？

于是我摸索了一番，发现如果我把SRVROOT的值改成以“/”开头，那么它会以当前所的在盘符为开头计算路径。

[![sp20161118_181205](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_181205-150x84.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_181205.png)

如果我以一个小数点开头，它会以Apache所在目录（不是httpd.exe所在的bin目录）为开始计算路径。

[![sp20161118_181443](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_181443-150x78.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_181443.png)

如果以两个小数点开头，就没问题了。

[![sp20161118_181753](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_181753-150x78.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_181753.png)

那么现在算是完成了Apache的配置，但还要让它与PHP关联起来。

一开始测试老是提示我没有权限访问这个服务器，网上的说法是`deny from all`的问题，但其实并不是，后来研究一下是路径的问题。如果我有绝对路径的话，是能访问的。这次不是ServerRoot的问题了，而是DocumentRoot的问题。

然而我用SRVROOT常量能使Apache运行，但不能访问。也就是说只能单纯地用两个小数点来向上定位。

也是采用类似的方法测试：

[![sp20161118_232412](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_232412-150x75.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_232412.png)

多向上了一层，然而修改后还是不行！

参考了XAMPP的，发现是用绝对路径的——不行。那看看UPUPW吧（还是靠这个……）

可是结果令我失望——它采用的方法是每次启动是修改httpd.conf！

后来无意中在[serverfault](http://serverfault.com/questions/532630/is-the-apache-directory-directive-supposed-to-be-relative-to-the-documentroot-or)中找到有那么一点点关联的信息（话说还是国外资料丰富），当时只是看看，没想那么多：

    &lt;Directory /&gt;

像这样的一行在httpd.conf的第247行，默认是跟上一行的DocumentRoot一样。

那到底是不是DocumentRoot不支持相对路径？不是的。[这里](http://blog.csdn.net/koupoo/article/details/7713169)有解释。

然后无无意中想到，可以试试DocumentRoot使用相对路径，然后第247行那里像serverfault那样。

一试，成功了！

下面讲讲Apache加PHP模块。Apache要LoadModule，而模块文件只在线程安全的版本下才有，意味着Apache是不能用非线程安全版本PHP的。

把httpd.conf修改如下 ：

[![sp20161119_000023](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161119_000023-150x107.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161119_000023.png)

这里使用SRVROOT常量是没有问题的。不过这要在修改PHP版本时，对应地修改httpd.conf，要注意Apache和PHP要么同时用32位，要么同时用64位。

* * *

现在就要弄MariaDB了，可是把它解压好发现有1GB多！可我看别人的整合包才几十MB，所以肯定能精简。

还是上网搜索，说留下bin、data、share目录就行（但文件不要删）。（还是很大啊）

于是我在想能不能x86和x64共用同一个数据库目录呢？

查了一下是可以，方法是在my.ini（这个文件需要自己创建或从它给的模板中修改并另存）中的`mysqld`段增加`datadir`项并把值设为对应的路径。那么能不能使用相对路径呢？

还是用刚刚探索Apache的那种方法，结果如下 ：

[![sp20161118_201008](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_201008-150x77.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_201008.png)

接下来就很简单了：

[![sp20161118_201138](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_201138-150x76.png)](http://www.sealfu.cf/wp-content/uploads/2016/11/sp20161118_201138.png)

不过这样的MariaDB还是很大。跟UPUPW对比一下，原来是它把bin目录下除exe文件以外的文件删去。

* * *

MongoDB没什么好配置的，只需要在启动的时候指定好数据库目录就行（非常适合数据库文件共用）。

而MongoDB的bin目录下也有跟MariaDB类似的多余的pdb文件，而且占用空间还不小，删了之后，没什么影响。

记得要给PHP加上MongoDB扩展！

2016年11月22日附加：社区版的MongoDB不支持SSL，所以只能用不带SSL的。

* * *

至于Redis我没玩过，所以以UPUPW为参照。同样删除多余的pdb文件。

同样记得要给PHP加上Redis扩展！

（话说这东西的数据库放哪里？）

* * *

好吧，这个一键PHP环境包弄好了，给它取个名字叫gplane-webp。后面的p表示package。

我还要用Qt写个GUI的控制台，不过不在这篇文章讲，毕竟与这篇文章关系不大。