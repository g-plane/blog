---
title: 总结 2025
date: 2025-12-30 16:06:30
tags:
  - 年终总结
---

## Coding

本年在 GitHub 上有超过 1300 次 contributions，完整时间线可前往 [我的 GitHub 个人资料页](https://github.com/g-plane?tab=overview&from=2025-12-01&to=2025-12-31) 查看。

本年的绝大部分时间都被投入在了 [WebAssembly Language Tools](https://github.com/g-plane/wasm-language-tools) 中：

- 完成了包括 GC、Exceptions 等所有 [Wasm 3.0](https://webassembly.org/news/2025-09-17-wasm-3.0/) 特性（也就是 2025 年内已处于 Phase 5 的提案）的支持，Phase 4 和 Phase 3 的提案也部分支持；（支持进度可参见 [WebAssembly 官方的 Features Status 页](https://webassembly.org/features/)）
- 重写了 parser，由原来基于 winnow 的 parser combinators 构成改成完全手写，并实施了一些性能优化，最终为 parser 带来约 350% 的性能提升；（具体可读 [这篇](./improve-wat-parser-perf.html) 博客文章）
- 借助 Rust 本身对 WebAssembly 的支持，language service 现在已经能通过 Web Worker 在 [VS Code for Web](https://vscode.dev/) 上运行了；
- 于 12 月在 language service 内部增加了控制流分析，解决了在今年早些时候实现的「未初始化的函数 locals」检查因为基于 syntax tree 实现而导致的不少误报和漏报；（当然 CFA 还被应用在「检查不可达代码」等场景中）
- 尽管不是我做的，但现在可以通过 Nix 和 AUR 来安装 WebAssembly Language Tools。

从去年开始开发到今年年底，总 commit 数已经达到 1000。

另外，在开发 WebAssembly Language Tools 过程中，我还给 WebAssembly 官方组织和 Neovim 提了几次 PR。

## ACGN

- [bangumi](https://bgm.tv/anime/list/gplane/collect) 上完成了 86 条动画条目；个人认为本年内最好看的动画是[《时光流逝，饭菜依旧美味》](https://bgm.tv/subject/531159)。
- [《Silent Witch 沉默魔女的秘密》](https://bgm.tv/subject/341376)原作小说已经阅读到第 9 卷；于今年开播的动画当然也看了：sayan 配得很好，莫妮卡很可爱，可惜动画删减了过多原作中的情节；我还购买了动画 OST 的 CD。
- 总算把[《始于谎言的夏日恋情》](https://store.steampowered.com/app/1575980/_/)玩通了。

## 生活

这一年遇到了几个「第一次」，有好的、也有不好的。不好的那些一方面不值得再提起，另一方面涉及个人私事不方便公开，所以我就说说那些好的部分就好了：

- 年初因为公司裁员而失业，进而有较多的可自由分配时间，于是我决定出省旅游。这是我第一次出省，我选择的地方是重庆。为的是体验那里的轨道交通，去那里看看传闻中优秀的地铁导视设计，当然还少不了网红的李子坝单轨穿楼。
- 第一次去看 Live，看的是亚咲花的 Live。现场亲眼看到她本人的感觉还是很不一样的。

---

最后也请各位在新的一年里多多关照。
