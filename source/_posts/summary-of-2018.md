---
title: 总结 2018
tags:
  - 年终总结
date: 2018-12-30 10:49:55
---

不知不觉，又一年过去了。一年里发生的事，就像在昨天一样。总的来说，今年的收获还是有不少的。

> 2017 的总结在 [这里](https://blog.gplane.win/posts/summary-of-2017.html)

## GitHub 活动 & Coding

### GitHub

这是我今年的 GitHub 时间线，截止至 2018 年 12 月 30 日：

![Snipaste_2018-12-30_11-02-31.png](https://i.loli.net/2018/12/30/5c283560a9ef1.png)

今年有给不少开源仓库提 PR，包括第一次给 [Babel](https://github.com/babel/babel) 提 PR（[这里](https://github.com/babel/babel/pull/8755)），另外还有给 Sarah Drasner 的 [array-explorer](https://github.com/sdras/array-explorer) 和 [object-explorer](https://github.com/sdras/object-explorer) 帮忙做中文翻译。

整个 2018 里，给 [ESLint](https://github.com/eslint/eslint) 提的 PR 是最多的，达到了 18 个，而且全部被合并。（详情可看 [这里](https://github.com/eslint/eslint/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aclosed+author%3Ag-plane+)）

我的 GitHub followers 也增加了不少，目前有 44 个。虽然跟不少 dalao 相比，这数字差得远，但我记得在 2018 年 1 月 1 日的时候，数量只有 5、6 个左右，增幅已经是很大了。

另外我加入了 3 个 GitHub organization。其中有一个 [bs-community](https://github.com/bs-community)，这个是我自己创建的，其目的是将一些与 Blessing Skin 有关的开源仓库集中起来。我加入的另一个组织是 [Cherow](https://github.com/cherow)。Cherow 是一款高性能的、快速的 ECMAScript 解析器，同时严格遵循 ECMAScript spec 和 ESTree。当然了，我在里面并不是做主力开发，而是维护由我创建的 [cherow-eslint](https://www.npmjs.com/package/cherow-eslint)（可以让 ESLint 使用 Cherow 作为 parser 的 npm 包），以及处理一些杂事。我还加入的一个组织是 [Enquirer](https://github.com/enquirer)。Enquirer 是 Inquirer 的替代品，它比 Inquirer 更小、有更少的外部依赖，同时有更好的性能。我在里面主要是维护 Enquirer 的 TypeScript 类型定义文件，同时维护由我创建的 [enquirer-compat](https://github.com/enquirer/enquirer-compat)（为照顾 Inquirer 用户的兼容层，这样可以将 Inquirer 切换到 Enquirer 而无需更改大部分代码）。

2017 年年底的时候，我曾希望在下一年（即今年，2018 年）能有一个仓库的 stars 数超过 100。我的愿望实现了，这个仓库是 [zsh-yarn-autocompletions](https://github.com/g-plane/zsh-yarn-autocompletions)。截止至 2018 年 12 月 31 日，这个仓库的 stars 数达到了 328，而且还曾经短暂地出现在 GitHub Trending 里：

![trending.jpg](https://i.loli.net/2018/12/30/5c283ed53ca7f.jpg)

[zsh-yarn-autocompletions](https://github.com/g-plane/zsh-yarn-autocompletions) 是一个 Zsh 下的插件，可以帮助对 [Yarn](https://yarnpkg.com) 中一些命令的补全。PoC 阶段使用 JavaScript 完成（不过那时候并没有放到 GitHub 上），后来为了减少 bootstrapping 耗时，改用 Rust 重写。

### npm

下面列出了我在 2018 年里创建的 npm 包：

- [rize](https://www.npmjs.com/package/rize) - *稍后会有介绍。*
- [eslint-formatter-beauty](https://www.npmjs.com/package/eslint-formatter-beauty) - 一个好看的 ESLint 输出 formatter，类似于 ESLint 自带的 codeframe formatter，但更美观。
- [tslint-formatter-beauty](https://www.npmjs.com/package/tslint-formatter-beauty) - 与 `eslint-formatter-beauty` 相同，但适用于 TSLint。
- [generator-tsm](https://www.npmjs.com/package/generator-tsm) - 可快速生成基于 TypeScript 的 npm 包的 Yeoman generator，不过最近很少使用。
- [optionify](https://www.npmjs.com/package/optionify) - 把 Rust 下的 `Option` 结构体移植到 JavaScript 里。
- [toggle-state](https://www.npmjs.com/package/toggle-state) - 省得写类似于 `a === 1 ? 0 : 1` 这样代码的懒人库。
- [beauty-json-cli](https://www.npmjs.com/package/beauty-json-cli) - 在 Shell 里输出格式化过的、带语法高亮的 JSON。
- [node-green](https://www.npmjs.com/package/node-green) - 以编程化的方式来查询 Node.js 中 ECMAScript 的兼容性。
- [node-green-cli](https://www.npmjs.com/package/node-green-cli) - `node-green` 的 CLI 形式，即可以直接在命令行或终端中使用。
- [cherow-eslint](https://www.npmjs.com/package/cherow-eslint) - 让 ESLint 使用 [Cherow](https://github.com/cherow/cherow) 作为 parser，现已 transfer 给 Cherow 组织。
- [generator-bs-plugin](https://www.npmjs.com/package/generator-bs-plugin) - 快速生成 Blessing Skin 插件的 Yeoman generator。
- [convert-registry](https://www.npmjs.com/package/convert-registry) - 将 `yarn.lock` 中的 npm registry 切换成其它的 registry。
- [typeface-minecraft](https://www.npmjs.com/package/typeface-minecraft) - Minecraft 字体，可以直接在 JavaScript 中以 `import` 的方式导入，但需要 webpack 或 Parcel 等工具。
- [tiny-package-manager](https://www.npmjs.com/package/tiny-package-manager) - 演示了一个 Node.js 下的包管理器如 npm 和 Yarn 是如何工作的，具体可见 [GitHub 仓库](https://github.com/g-plane/tiny-pm)。
- [linter-init](https://www.npmjs.com/package/linter-init) - 方便在新项目中引入 ESLint 或 TSLint。
- [pluggable-babel-eslint](https://www.npmjs.com/package/pluggable-babel-eslint) - 可配置 `@babel/parser` 中开启或关闭部分插件的 `babel-eslint`。这并不是 `babel-eslint` 的一份 fork。
- [enquirer-compat](https://www.npmjs.com/package/enquirer-compat) - 为 Inquirer 用户的兼容层，可以将 Inquirer 切换到 Enquirer 而无需更改大部分代码。现已 transfer 给 [Enquirer](https://github.com/enquirer) 组织。

数了一下，居然有 17 个。

这里补充介绍一下 [rize](https://www.npmjs.com/package/rize) 这个 npm 包。它是我于今年 2 月的时候创建的，当时做这个主要是想给 *曾经* 的 Blessing Skin v4 进行集成测试。虽然 `puppeteer` 的出现极大地简化了 Headless Chrome 的使用，但是它的 API 使用起来还是有点啰嗦和麻烦，同时看到 Laravel Dusk 那优雅的 API 设计，于是我借鉴了 Laravel Dusk 的 API 设计同时加入我自己的想法，随后创建了这个工具。截至 2018 年 12 月 31 日，[rize](https://github.com/g-plane/rize) 已获得 79 个 stars。虽然到了后面，曾经的 Blessing Skin v4 因为在改动上过于激进导致向前兼容太难做，还没完成就已经被我废弃了（实际上源码已经被我删除），以至于后来以相对更渐进的方式来更新 Blessing Skin 的技术栈，[rize](https://github.com/g-plane/rize) 也因此没有被用于 Blessing Skin v4 的测试中。因为当初创建 [rize](https://github.com/g-plane/rize) 是为了给 Blessing Skin v4 添加集成测试，因此它的定位是测试。

[这里](https://blog.gplane.win/posts/introducing-rize.html) 有一篇关于 [rize](https://github.com/g-plane/rize) 博客文章。

### 其它

在今年我创建了我的第一个 VS Code 扩展，也算是我在 VS Code 扩展开发上的练手吧。这个扩展其实没什么高端的功能，主要是方便在 VS Code 内控制 foobar2000 播放器或 deadbeef 播放器（前提是需要在这些播放器中安装好 beefweb 插件）。

GitHub 仓库在 [这里](https://github.com/g-plane/vscode-beefweb)，里面有详细介绍以及 UI 展示。如果要安装的话，直接在 VS Code 的 marketplace 内搜索「beefweb」即可。

今年 9 月的时候，~~我开始学习 Ruby~~，并发布了我的第一个 Ruby Gem：[vue_component_compiler](https://rubygems.org/gems/vue_component_compiler)。

> 2019 年 1 月下旬更新：已放弃学习 Ruby，但我仍然欣赏 Ruby 这门语言。

## 博客

### CMS 切换

我的博客两度进行了 CMS 更换。第一次是由 Hexo 切换到基于 [Nuxt.js](https://nuxtjs.org/) 并加上我自己弄的前端页面的模式。我专门写过一篇博文来介绍这一次切换过程（在 [这里](https://blog.gplane.win/posts/migrate-to-nuxt.html) ）。第二次是从 Nuxt.js 切换到 [VuePress](https://vuepress.vuejs.org/)。其实在我开始使用 Nuxt.js 作为我的博客的基础架构的时候，VuePress 刚开始出现。那时候我也曾想过要不要用 VuePress，不过那时候 VuePress 还不成熟，网上也似乎没有用 VuePress 做博客的案例（VuePress 最初是为简化编写软件文档而生的，并不是用于博客），所以决定先暂时使用 Nuxt.js（Hexo 的使用体验相对没那么好，当然不可否认主题生态比较丰富），等过一段时间再切换到 VuePress。

在我从 Nuxt.js 切换到 VuePress 的时候，VuePress 官方正在进行 1.0 版本的开发，使用了插件化的架构，并增加官方的用于博客用途的插件。可惜那时候还是在 alpha 阶段，不想去踩坑所以没有去试。

### 统计

我没有引入用于统计页面点击数的工具，再说 CMS 切换导致 URL 跟着改变，因此这里的统计只是我自身的文章统计。10 月开始给新文章使用由 Disqus 提供的添加 reaction 功能，但由于我的博客的访问量本身就不多，因此统计这个也没什么意义。

不包含当前的这一篇 2018 总结，2018 年里我总共发表了 13 篇博文：

- [使用 Laradock 进行 Laravel 应用开发](https://blog.gplane.win/posts/using-laradock.html)
- [从 Apollo Client 中获取 HTTP 头部信息](https://blog.gplane.win/posts/getting-headers-from-apollo.html)
- [使用 macOS 一个月以来的一些感受](https://blog.gplane.win/posts/using-macos.html)
- [在 Karma + webpack 中生成 source map](https://blog.gplane.win/posts/generate-sourcemap-with-webpack-in-karma.html)
- [Introducing Rize](https://blog.gplane.win/posts/introducing-rize.html)
- [V8 的 Error 对象与栈追踪的妙用](https://blog.gplane.win/posts/trick-of-using-v8-errors-and-stack-trace.html)
- [再见 Hexo，你好 Nuxt.js](https://blog.gplane.win/posts/migrate-to-nuxt.html)
- [关于 yarn.lock 和 package-lock.json](https://blog.gplane.win/posts/about-yarn-lock-and-package-lock-json.html)
- [转向 MIT](https://blog.gplane.win/posts/switch-to-mit.html)
- [解决安装 Manjaro 提示设备问题](https://blog.gplane.win/posts/solve-the-problem-of-installing-manjaro.html)
- [谈谈《来自风平浪静的明天》](https://blog.gplane.win/posts/nagi-no-asukara.html)
- [在 Minecraft 中实现高度自动化的铁路系统](https://blog.gplane.win/posts/subway-in-minecraft.html)
- [巧用 TypeScript 的「条件类型」](https://blog.gplane.win/posts/conditional-type-in-ts.html)

最后一篇是在 2 个月前发表的，也就是说我已经 2 个月没发表过新文章了。

## 动漫

虽然可能没什么意义，不过把我今年看过的动漫列出来还是挺好玩的。我基本是以补旧番为主，各位 ACG dalao 见笑了。

- 《HELLO!! 黄金拼图》
- 《紫罗兰永恒花园》
- 《POP TEAM EPIC》
- 《此花亭奇谭》*（值得一看）*
- 《食戟之灵》
- 《樱花庄的宠物女孩》
- 《冰菓》*（强烈推荐，而且其 ED《まどろみの約束》是我目前最喜欢的动漫歌曲，没有「之一」）*
- 《结城友奈是勇者》*（我只看了「友奈之章」和「勇者之章」）*
- 《来自风平浪静的明天》*（强烈推荐）*
- 《龙王的工作》
- 《我女友与青梅竹马的惨烈修罗场》
- 《悠哉日常大王》和《悠哉日常大王 Repeat》*（值得一看）*
- 《齐木楠雄的灾难》*（第二季我还没看）*
- 《我家女仆有够烦》

这些都是 TV 动画。在暑假的时候我下载并观看了一部剧场动画，是《玻璃之花与崩坏的世界》（没错，又是横山克，又是种田梨沙 + 佐仓绫音，又是 A-1 Pictures）。

12 月我更是去电影院观看了《龙猫》。《龙猫》的知名度是很明显的，但此前我并没有看过，现在也是补上了。

## 其它一些生活中的

在 PC 端，我现在是一位 Firefox 用户啦。没错，我的主力浏览器从 Chrome 切换为 Firefox。Chrome 除了内存占用，没什么不好，但让我投向 Firefox 的原因并不是 Chrome 的内存问题——虽然 Chrome 的确占用不少内存，但我用着还行。

让我转为使用 Firefox 是同学的一次安利，从那时我开始使用 Firefox。Firefox 其实有不少优点：轻松地同步账号（Chrome 因为 Google 的原因，所以有点麻烦）、更好地开发者工具，而且页面字体渲染看起来比 Chrome 好些。当然 bug 也是有的，比如，网页版微信里无法粘贴图片，开发者工具中对 WebSocket 的识别有点问题。

今年双十一的时候入手了一条 ATH-C770，感觉还不错。虽然不能指望太好，但对得起这个价位。

## 展望与计划

希望在 2019 年能更多地学习和深入 Rust。

希望能作为 committer 加入 ESLint 团队。

多学点编译原理。

希望我的 GitHub 账号能继续涨 followers。

明年应该多了解跟工作、就业有关的东西了，尽管现在还是大三。

*可能还有别的，但暂时想不出。*

---

最后祝各位 2019 新年快乐，也请各位在新的一年里多多关照。
