---
title: 做了个校园网自动登录程序
id: 49
categories:
  - Python
date: 2016-10-23 14:17:45
tags:
---

校园网在没有人连接后的一段时间后会自动断开，这样我每次回到宿舍都很不方便，所以打算用Python写个脚本。

当然了，有时候这个程序是用不上的，因为我回到宿舍并不一定会开电脑。

GitHub:[https://github.com/g-plane/dgut-internet-auto-login](https://github.com/g-plane/dgut-internet-auto-login)  里面有两个分支，一个是master，一个是selenium，等下会解释。

一开始我是打算用Python自带的urllib库来完成的。看了一下登录页面的HTML，发现表单上填用户名和密码的`input`的`name是DDDDD和upass，于是我很自然的向这个网页post了这两个数据，但是返回了错误。`

后来上网查了下，决定改用requests库，但是结果还是这样。

这时我突然想起之前在研究爬虫的时候听说过selenium这个库，然后看了看它的文档——嗯，好像还可以，于是试了试。代码写好，运行却报错，提示我缺少WebDriver，也就是浏览器驱动。蛤？浏览器也要驱动？

好吧，我按网上的指导弄好了驱动。（考虑到这不是本文的重点，所以不写具体的过程）

一运行，弹出了个IE窗口，自动打开校园网的登录页面，然后自动输进了帐号和密码——原来是模拟浏览器操作啊！

虽然最终的目的是达到了，但它的运行思路我不满意。毕竟我想要的是Python内部自己完成HTTP连接和post。

没办法，又回到requests库的研究上，并且我用Chrome的F12功能查看究竟post了什么，但是登录成功后会3秒自动跳转，因此我弄了好几次才能截图成功。

图片已经删了，我简述一下吧：在Form Data里面，除了DDDDD和upass之外，还有另外一项数据，它是submit按钮，但chrome说它无法解析数据。

于是我换了用IE来抓包，这次有内容了，但样子看上去像是URL编码。我想当然地去解码，但是不行。

后来我在想，会不会就是提交按钮上的文字（内容是“登 录”，注意中间有一个空格），我就在post数据上添加了，然而还是不行。

我就以submit按钮的name为关键字去搜索，一个意外让我发现了不对——它的name叫0MKKey，再看看我的代码，是OMKKey。也就是说，实际上是零，而我写了字母O，所以post的数据不对，被服务器拒绝了。

改了之后，成功了，连User-Agent伪装都不需要。

代码贴出来吧：
<pre class="lang:python decode:true" title="AutoLogin.py">import requests
import json
import os

def main():
    CONFIG = getConfig()
    postData = {'DDDDD': CONFIG['username'], 'upass': CONFIG['password'], '0MKKey': '登 录'}
    requests.post('http://192.168.252.8/0.htm', data=postData)

def getConfig():
    CONFIG_FILE = open(os.getcwd() + '/AutoLogin.json', 'r')
    CONFIG = json.loads(CONFIG_FILE.read())
    CONFIG_FILE.close()
    return CONFIG

if __name__ == '__main__':
    main()</pre>
selenium的代码我就不贴了，可以去github看。