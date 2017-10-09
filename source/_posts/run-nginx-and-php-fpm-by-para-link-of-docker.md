---
title: 使用Docker的link参数来运行nginx+php-fpm
id: 101
categories:
  - 运维
date: 2016-12-14 13:10:38
tags:
---

单纯地在Docker中运行nginx可以不用挂载外部nginx.conf，但如果要用php，必须要挂载，因为想nginx支持php-fpm， 一定要修改nginx.conf。

### php-fpm部分

首先运行php-fpm。这里要注意一个问题，如果直接运行php:latest镜像是不行的，我估计这个latest不是fpm，可能是cli。所以必须加上fpm标签，我这里用的是7.1-fpm标签，当然如果想用最新版本，可以直接使用fpm标签。

`运行命令：sudo docker run --name php -v $(pwd)/web/nginx/www:/var/www/html -d php:7.1-fpm`

这里解释一下数据卷的设置，php跟nginx的www路径是不一样的，php是/var/www/html，而nginx是/usr/share/nginx/html。

### nginx部分

运行命令： `sudo docker run --name nginx -d -p 80:80 --link php:php --volumes-from php -v $(pwd)/web/nginx.conf:/etc/nginx/nginx.conf nginx`

命令解释：

--link参数用于连接其它容器，它的格式是--link container-name:alias，container-name就是要连接的容器的名字（容器ID应该也行），alias是别名，后面要用到。

--volumes-from参数表示使用其它容器的数据卷，格式是--volumes-from container-name，这里的container-name就是要连接的容器名。可以看到，使用了--volumes-from参数之后，就没用使用-v参数来指定网页存放目录。

“-v $(pwd)/web/nginx.conf:/etc/nginx/nginx.conf”就是挂载外部的nginx.conf，因为要修改nginx.conf，所以要使用外部的nginx.conf。

### nginx.conf

其实这一步跟在实机上配置nginx差不多，当然还是有一点不同。

1.  对PHP FastCGI部分取消注释
2.  将PHP FastCGI部分的root参数修改为`/var/www/html`，而位于location段的root也要改为`/var/www/html`
3.  将fastcgi_pass参数改为`alias:9000`，这里的alias是nginx前面指定的php容器别名，在本例中alias就是php
4.  将原来的`fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name`修改为`fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name`
5.  保存，然后重启nginx容器
补上一句，要添加index.php作为首页文件。