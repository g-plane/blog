---
title: 关于Swing的令人费解的问题
id: 17
categories:
  - Java
date: 2016-08-05 10:42:53
tags:
---

昨天在做[CSL](http://www.mcbbs.net/thread-269807-1-1.html)的GUI时，一开始为了代码美观，把控件的实例化写在一起，接着把控件的大小调整写在一起，然后把容器的add方法写在一起（如图）

[![sp160805_103108](http://www.sealfu.cf/wp-content/uploads/2016/08/sp160805_103108-150x97.png)](http://www.sealfu.cf/wp-content/uploads/2016/08/sp160805_103108.png)

&nbsp;

接着就是运行了，没有错误和警告。不过有奇怪的问题，就是运行后窗体一片空白——控件呢？

无意中用鼠标划过窗体本该有控件的地方，控件居然出现了。也就是说，原来控件隐藏了，鼠标划过后就出现了。

当时就觉得费解，代码并没有错啊~~

* * *

今天继续工作，脑中闪过一个想法：会不会是连续的container.add()会产生问题？

于是调整了代码顺序（如图）

[![sp160805_103949](http://www.sealfu.cf/wp-content/uploads/2016/08/sp160805_103949-150x97.png)](http://www.sealfu.cf/wp-content/uploads/2016/08/sp160805_103949.png)

运行！结果再次令我惊讶了：控件全部显示，并没有昨天那样的鼠标划过才出现控件。

至于为什么会出现这种现象，现在还没清楚。