---
title: 让JDialog返回数据
id: 35
categories:
  - Java
date: 2016-08-09 09:29:24
tags:
---

补充：上次swing的怪异问题，我放弃了。后来在Eclipse里安装了一个WindowBuilder的WYSIWYG插件，做界面的效率高得多了（话说最新的WindowBuilder只支持Eclipse的4.5版本，我在4.6中安装也能正常运行~）

* * *

我的打算是新增或修改加载列表时用个额外的JDialog窗口来显示选项，然后可以返回相关的数据。但是问题来了，怎么让它返回呢？

查了一下：[http://stackoverflow.com/questions/4089311/how-can-i-return-a-value-from-a-jdialog-box-to-the-parent-jframe](http://stackoverflow.com/questions/4089311/how-can-i-return-a-value-from-a-jdialog-box-to-the-parent-jframe)
> I generally do it like this:> 
> 
>     <span class="typ">Dialog</span><span class="pln"> dlg </span><span class="pun">=</span> <span class="kwd">new</span> <span class="typ">Dialog</span><span class="pun">(</span><span class="kwd">this</span><span class="pun">,</span> <span class="pun">...);</span>> 
>     <span class="typ">Value</span><span class="pln"> result </span><span class="pun">=</span><span class="pln"> dlg</span><span class="pun">.</span><span class="pln">showDialog</span><span class="pun">();</span>`</pre>> 
>     The `Dialog.showDialog()` function looks like this:> 
>     <pre class="lang-java prettyprint prettyprinted">`<span class="typ">ReturnValue</span><span class="pln"> showDialog</span><span class="pun">()</span> <span class="pun">{</span><span class="pln">> 
>         setVisible</span><span class="pun">(</span><span class="kwd">true</span><span class="pun">);</span>> 
>         <span class="kwd">return</span><span class="pln"> result</span><span class="pun">;</span>> 
>     <span class="pun">}</span>`</pre>> 
>     Since setting visibility to true on a JDialog is a modal operation, the OK button can set an instance variable (`result`) to the chosen result of the dialog (or `null` if canceled). After processing in the OK/Cancel button method, do this:> 
>     <pre class="lang-java prettyprint prettyprinted">`<span class="pln">setVisible</span><span class="pun">(</span><span class="kwd">false</span><span class="pun">);</span><span class="pln">> 
>     dispose</span><span class="pun">();</span>
> 
> to return control to the `showDialog()` function.
结合我自己用WindowBuilder生成的代码，就是把原来的主方法，改成“数据类型 方法名”，移除原来主方法中的实例化语句，将与设置窗口属性有关的语句移到构造方法那里。而此时原来的主方法只剩下setVisible(true)语句，并在此方法最后return。

调用的时候，先实例化这个包含这个JDialog的类，此时经过构造方法，已经加载好窗口，接着调用改过的“主方法”（其实已经不是主方法了），窗口显示。最后按下OK后，就可以得到需要的数据。

顺便一提，最好将此JDialog的setModal设为true。

&nbsp;