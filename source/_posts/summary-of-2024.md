---
title: 总结 2024
description: 对收获颇多的 2024 年的总结。
date: 2024-12-31 18:29:53
tags:
  - 年终总结
---

## GitHub 活动 & Coding

本年在 GitHub 上有超过 1700 次 contributions，完整时间线可前往 [我的 GitHub 个人资料页](https://github.com/g-plane?tab=overview&from=2024-12-01&to=2024-12-31) 查看。

- 开发了两个新的 formatter——[Pretty YAML](https://github.com/g-plane/pretty_yaml) 和 [Pretty GraphQL](https://github.com/g-plane/pretty_graphql)。正如其名，它们分别为 YAML 和 GraphQL 提供格式化功能。两个 formatter 都能在 dprint 中使用。两个插件都比 Prettier 配置更灵活自由、性能更优。
  一直以来，dprint 没有官方的 YAML 插件但社区呼声很高。它的出现填补了 dprint 格式化 YAML 方面的空白。另外，它还被使用在 [TypeScript 仓库](https://github.com/microsoft/TypeScript/blob/56a08250f3516b3f5bc120d6c7ab4450a9a69352/.dprint.jsonc#L58) 中。
  值得一提的是，Pretty YAML 所使用的 parser 是我用 [winnow](https://github.com/winnow-rs/winnow) 从零实现的。

- 我所开发的 formatter（包括去年开发的 [Malva](https://github.com/g-plane/malva) 和 [markup_fmt](https://github.com/g-plane/markup_fmt)）于今年被收录于 dprint 官网插件列表中。
  Malva、markup_fmt 和 Pretty YAML 在今年被集成到了 [`deno fmt`](https://docs.deno.com/runtime/reference/cli/fmt/) 中。

- 8 月底开始开发 WebAssembly Language Tools，直到年底仍在持续开发中。（没想到这一做，全年 1/3 的时间就这么过去了）这个项目主要包含了为 WebAssembly Text Format 提供并改善开发体验的 language server，同时配套有 VS Code 扩展等编辑器集成。WebAssembly Language Tools 从 parser 到语义分析和 formatter 等功能都是完全由我自己实现的。
  其实我自己并没有写 WebAssembly Text Format 的需要，之所以做这个是因为群友在学习 WebAssembly 时想要但社区内没有可用的实现。（wasm-lsp 没有实际可用的功能并且仓库已 archived）
  尽管我自己不需要，但这次机会不仅实现了我大约 6、7 年前认识 Language Server Protocol 时「自己动手做一个 language server」的幻想，还让我学习到了构建并运用符号表等知识。
  感谢给予这个机会并且在我遇到 WebAssembly 方面不懂的问题时提供帮助的群友 [@yfzhe](https://yfzhe.github.io/)。

- [typed-query-selector](https://github.com/g-plane/typed-query-selector) 被 Puppeteer 使用，这带来了超百万的 npm 周下载量。

- 64 个 Pull Request 被合并。

## ACGN

- [bangumi](https://bgm.tv/anime/list/gplane/collect) 上完成了 90 条动画条目。
- 漫画：看了一部分的[《女忍者椿的心事》](https://bgm.tv/subject/231908)，之后没有继续。
- 轻小说：下半年开始看[《Silent Witch 沉默魔女的秘密》](https://bgm.tv/subject/341376)。之所以看这部轻小说是因为主角在动画里是由我喜欢的声优之一 [会沢紗弥](https://zh.moegirl.org.cn/%E4%BC%9A%E6%B3%BD%E7%BA%B1%E5%BC%A5) 配的。
- 游戏：玩过了 [Move or Die](https://store.steampowered.com/app/323850/Move_or_Die/)、[Boomerang Fu](https://store.steampowered.com/app/965680) 和[《芙哇芙哇女仆咖啡厅》](https://store.steampowered.com/app/1789030/_/)；[《始于谎言的夏日恋情》](https://store.steampowered.com/app/1575980/_/)玩到中途搁置了，看看明年会不会重拾并继续吧。
- 买了米浴、美浦波旁的粘土人和葛城王牌的毛绒玩偶。

## 生活

去了一次香港：

- 总算体验到了港铁。新的现代化列车真不错。
- 开了银行卡并终于开通了期盼已久的 [GitHub Sponsor](https://github.com/sponsors/g-plane)。开通后收到了 Deno 和几位群友的赞助，谢谢他们的支持。

---

最后也请各位在新的一年里多多关照。
