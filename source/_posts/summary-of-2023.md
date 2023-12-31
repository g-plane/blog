---
title: 总结 2023
description: 对 2023 年的总结。
date: 2023-12-31 18:41:03
tags:
  - 年终总结
---

## GitHub 活动 & Coding

GitHub 时间线可前往 [我的 GitHub 个人资料页](https://github.com/g-plane?tab=overview&from=2023-12-01&to=2023-12-31) 查看。

- 9 月 [Raffia](https://github.com/g-plane/raffia) 开发完成（包含测试），过程历时一年多。也就是说，Raffia 现在已经支持 CSS、SCSS、Sass、Less 的解析。
- 在完成开发 Raffia 后，我开始着手基于 Raffia 的 CSS/SCSS/Sass/Less code formatter，也就是 [Malva](https://github.com/g-plane/malva)。Malva 与 Prettier 相比，可配置选项更多、有更良好的注释支持、支持一些新的 CSS 语法，另外还支持 Prettier 没有支持的 Sass（是基于缩进的 Sass 而不是 SCSS）。此外，它是用 Rust 写的，因此性能上优于 Prettier；也正因为这个，它提供了 dprint 插件。
- 为了帮助推广 Malva，我还做了 HTML/Vue/Svelte 的 code formatter——[markup_fmt](https://github.com/g-plane/markup_fmt)。它跟 Prettier 相比，拥有更多的可配置选项、更优的性能。它是用 Rust 写的，同时提供 dprint 插件。在 dprint 中使用时，可以配合 [dprint-plugin-typescript](https://github.com/dprint/dprint-plugin-typescript) 和 Malva，实现对 Vue 组件和 Svelte 组件的模板、script 代码块、style 代码块分别进行格式化。
- Malva 和 markup_fmt 底层所使用的 formatting/pretty printing 库 [tiny_pretty](https://github.com/g-plane/tiny_pretty) 也相应开源。
- 为了方便在终端中补全 pnpm 命令的参数，我做了个 [pnpm-shell-completion](https://github.com/g-plane/pnpm-shell-completion)，支持多个不同的 Shell。
- 还做了个可以根据 .cue 文件从 flac 文件中提取一条或多条音轨的在线工具：[Cue Splitter](https://github.com/g-plane/cue-splitter)。这个工具用到了 WebAssembly。

在做代码格式化工具时，我研读了[《A prettier printer》](https://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)论文，了解到了实现代码格式化所用的算法。

## ACG

新增完成了 [bangumi](https://bgm.tv/anime/list/468610/collect) 上 85 条动画条目。

买了这些 CD：

- 《光の中へ》
- 《迷跡波》
- 《KOKIA 25th Anniversary Best -The Lighthouse-》

游戏方面，我重拾并入正《欧洲卡车模拟2》，并为此买了一张 RTX 4060 Ti 显卡和一个 Xbox 手柄。

---

最后也请各位在新的一年里多多关照。
