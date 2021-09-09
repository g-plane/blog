---
title: 2017这一年来
description: 对 2017 年的总结。
date: 2017-12-31 0:22:20
tags:
  - 年终总结
---

不知不觉已经到了2017的尽头，明天就是新的一年。我这个人从来都是没什么计划的，所以你问我2018有什么打算、计划，我只能说“无可奉告”。

这是我第一次写年底的个人总结，虽然2016我已经有了博客，不过也没写这样的总结。

## Prelude

到目前以来，能给我最深最深印象的有两年——分别是2012和2017，因为这两年，都发生了很多令我难以忘记的事。我很有必要对今年做个总结和记录。

## Programming

### JavaScript

凭着对 JavaScript 的兴趣和热爱，我学习并掌握了 JavaScript 中的不少东西，当然这也只是冰山一角。寒假的时候，我从学校图书馆借来了 ruanyf 的 《ECMAScript 6入门》，这是我最早接触 ES6。不过那时候我对 JavaScript 的了解并不多，看那本书也只是似懂非懂，不过其中留给我最深印象的是 `Promise`（当然现在我都是尽量用今年发布的 `async/await` 特性了，因为好用）。

后来我慢慢接触了 JavaScript 中的原型链、this 等的知识，现在处理 this 问题应该基本没什么问题，而原型链这种旧东西知道就好，现在有 ES6 的 `class` 可以不用直接与原型链打交道（其实 `class` 只是原型链等的语法糖）。

后来还简单的学习 webpack、TypeScript、Flow 等的内容。现在让我来写个能跑得通的 webpack 应该是没问题的，但是一些高级的我就不会了。所以现在开个工程基本是依赖 `vue-cli` 或 `create-react-app`，因为 webpack 实在是太复杂了（难怪 parcel 能在几天之内达到一万个 stars）。

TypeScript 和 Flow 可以说是大同小异。TypeScript 带来的好处是显而易见的，目前我有几个项目已经用上了 TypeScript 了，如 [`customskinloader-gui-react`](https://github.com/g-plane/customskinloader-gui-react) 和 [`simple-base`](https://github.com/g-plane/simple-base)。我更喜欢 TypeScript 的原因是我是一个 VS Code 粉。

我还发布了我的第一个 npm 包，就是 [`simple-base`](https://github.com/g-plane/simple-base)。2017我总共发布了3个 npm 包，分别是

- [`simple-base`](https://github.com/g-plane/simple-base)
- [`eslint-config-gplane`](https://github.com/g-plane/eslint-config-gplane)
- [`tslint-config-gplane`](https://github.com/g-plane/tslint-config-gplane)

### 贡献

这一年里，我给 GitHub 上一些开源项目做了贡献，包括好几个 VS Code 扩展、Laravel 中文文档的 typo 修正。在我今年里贡献过的项目里，项目本身最出名的就是 JavaScript 的包管理器 Yarn 了，并且曾经贡献过两次。

除此之外还多次向 Blessing Skin Server 贡献过代码。2017年1月1日就在给这个项目发 [PR](https://github.com/printempw/blessing-skin-server/pull/42) 了，这是关于文本国际化的。后来还有几次的 PR，是跟修复 bug 和优化有关。到了暑假就是给这个项目写 JavaScript 代码的测试了，随后有幸成为了 Blessing Skin Server 的 collaborator，再到后面就是写 PHP 的测试。（关于测试这一部分我的上一篇文章有详细介绍）

### 其它的

除了努力学习 JavaScript，我还开始学习 Rust 和 Kotlin。不过这两门语言都是在下半年开始学的，再加个目前没有什么实际项目推动我去学习，所以目前学得并不多，仅仅停留在入门部分。

其实我学习 Rust 是为了以后能够写 Node 的模块，但没想到 Rust 在 WebAssembly 里越来越受欢迎，看来好好学习 Rust 是没错的。

## 生活上

### 学校里

可以说是几乎天天摸鱼了。凭借着不怎么样的底子去裸考 CET4，不过还好最后能考通过，算是有些幸运。

另外“数字逻辑”这门课程我上课是不怎么听的，还好最后复习一波，六十多分，没挂。

高数那边就没那么好了，哪怕是上课也是听课的，考试的卷面分数也只有五十多分，还好最后依靠老师给的平时成绩才没挂。

### 其它杂七杂八

#### 终于拿到驾照

（我应该用哪个感叹词？还是说不用？）终于拿到驾照了。我是从去年刚刚高考完就去学习开车的。说实话，我本人并不是很想去学的，不过家里人要求也没办法——所以，前面那个「最终」并不是因为拿到驾照而高兴，而是再也不用去折腾那麻烦的事。嗯，我只是有个证而已，拿了证之后我是没碰过一次车。（这就是又一个没开过车的却能过了一年实习期的马路杀手）

#### 梦寐以求的

我最想要的两件东西就是 Minecraft 正版账号和 Kindle。2017年里最终把这两件东西搞到手啦！

2013年入坑 Minecraft 这个游戏，却在2017才入正，实在有些遗憾。

想要 Kindle 是为了我有很大看文档需求，但又不想一直对着手机，所以很想得到一部 Kindle。

#### 其它里的其它

发现今年补了不少旧番，其中有不少是经典的，例如 AB、四谎、点兔等。

## 最后

emmm……再见，2017。你好，2018。

写到这里，发现今天在整一年的 GitHub 时间线上是最“忙碌”的，达到了 43 次 contributions，而且还不算这篇文章的发布。
