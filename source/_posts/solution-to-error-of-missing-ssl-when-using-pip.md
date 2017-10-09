---
title: >-
  使用 pip 命令安装 Python 库时提示“Can't connect to HTTPS URL because the SSL module is
  not available”的解决办法
id: 168
categories:
  - Python
date: 2017-05-31 12:29:03
tags:
---

昨天安装了 Linux Deepin 15.4，然后从 Python 官网下载了 Python 3.6.1 的源码，编译和安装没什么问题。但是在我安装好之后，执行 `pip3 install` 的时候，pip 提示我：
> Can't connect to HTTPS URL because the SSL module is not available
由于 Python 官方的 PyPi 源采用的 HTTPS，并从它的提示也暗示了我的 Python 缺少了 SSL 模块。显然，切换成 HTTP 的第三方源是治标不治本的办法，而且国内的豆瓣的 PyPi 源也是用 HTTPS，所以还是要想办法给它安装上 SSL 模块。

搜索了一下，在 Stack Overflow 找到了解决办法。

原答案给的解决方法是依次执行以下命令：
<pre class="lang:sh decode:true ">sudo apt-get install python3-dev libffi-dev libssl-dev
wget https://www.python.org/ftp/python/3.6.0/Python-3.6.0.tgz  
tar xvf Python-3.6.0.tgz
cd Python-3.6.0
./configure --enable-optimizations  
make -j8  
sudo make altinstall</pre>
由于我已经下载好了 Python 的源码，所以我不需要执行 `apt-get install python3-dev` ，也不需要进行 `wget` 和解压。也就是说，我只是安装了 `libffi-dev` 和 `libssl-dev` ，接着进行编译和安装即可。

整个编译和安装的时候会比较长，需要耐心等待。

最后当然是给出原帖地址：[https://stackoverflow.com/questions/41489439/pip3-installs-inside-virtual-environment-with-python3-6-failing-due-to-ssl-modul](https://stackoverflow.com/questions/41489439/pip3-installs-inside-virtual-environment-with-python3-6-failing-due-to-ssl-modul)