---
title: Raffia 与 Malva 的故事
description: Raffia 为何而生？Malva 开发过程遇到了怎样的麻烦？
date: 2024-07-24 08:22:49
tags:
  - CSS
---

## 前言

Malva 是一款支持 CSS、SCSS、Sass、Less 的代码格式化工具，可作为 dprint 插件运行。Raffia 是 Malva 底层所使用的 parser。但 Malva 与 Raffia 之间的故事也许不是你所想像的那样。

## CSS linter 计划

等等，我们不是在讨论 Malva 这个代码格式化工具吗？怎么变成讨论 linter 了？这里先从 Raffia 前的故事说起。

2022 年 5 月左右，我正着手于实现一个 Rust 版的 Stylelint，并且使用 SWC CSS parser 来解析 CSS 代码。可是，Stylelint 不仅支持 CSS，还支持 SCSS、Sass、Less；而 SWC CSS parser 只支持 CSS，这意味着对于使用了各种预处理器的开发者将无法使用这个 CSS linter。

经过一番思考，我决定自己编写一个支持 CSS、SCSS、Sass、Less 的 parser。

## Raffia 的诞生与设计

前面提到，这个 parser 是为了制作 CSS linter 而生的。因此在设计上，特别是 AST 的设计，都考虑到为方便 linter 使用而优化：

- 所有的 AST struct 都会带有 span 字段，用于记录当前 AST 节点所对应的源代码范围；对于 enum，则通过一个由我们自己写的 proc macro，生成一段枚举所有 variant 来获取 span 的代码。这么做是为了让 linter 在报告问题时，可以从 AST 节点取得 span 用于指出代码问题所在之处。
- 注释信息被放在整棵 AST 之外的一个 `Vec` 中保存，并且所有注释也带有 span 信息。这是为了处理常见 linter 都有的「通过注释里写 ignore 来忽略特定范围代码」功能。
- span 只记录从 0 开始的偏移值，行号和列号的计算交给 linter。如果给所有的 AST 节点都计算行号和列号，这会带来非常大的计算成本。

另外，既然是 AST，这就意味着解析出来的结果不会带有 token 信息，比如逗号等符号，更不会有 whitespace 相关的信息。

## CSS linter 开发暂停

刚开始做 linter 的时候还没打算做 Raffia，linter 也就基于 SWC CSS parser 来开发。Raffia 是到了 linter 开发中途才决定要做的，此时 linter 已经实现了好几十条规则。为了以后新的规则能直接用上 Raffia，我暂时放下 linter 转而投入到 Raffia 中。

2023 年 9 月，Raffia 开发、测试完成。可这时候我对 CSS linter 的开发没了兴趣，却注意到 [dprint](https://dprint.dev/) 还没有可以格式化 CSS 的插件。

## Raffia 的改进

正好我已经写出了一个 CSS parser，那我用它来做 CSS formatter 不挺好吗？

可是我不得不面临设计上的问题：Raffia 当初是针对 linter 而设计的，AST 缺少很多 token 上的信息；注释用单独的 Vec 来保存也为格式化时处理注释带来不少麻烦。

举个例子，有这样一段输入代码：

```css
#container {
  display: flex; /* comment */

  width: 100vw;
  height: 100vh;
}
```

格式化时，我们需要保证：

- 上面的那条注释必须能维持在 `display` 这条属性后面，不能跑到别的地方
- `display` 与 `width` 属性之间的空行要保留（这种空行往往是为了利于阅读代码而加的）；而 `width` 与 `height` 属性之间不能出现原本没有的空行

受限于 Raffia 的设计，我们没法直接基于 AST 来解决这些问题。

如果我们一开始就打算做 formatter，那么我们的 parser 就不应该输出 AST，而应该输出 CST，即 concrete syntax tree。CST 与 AST 相比，它将完整包含源代码中所有的 token 与 trivia 信息。以上面的代码为例，CST 会包含 `{` `}` 等 token 信息，甚至是注释、空白都会有。这对于实现 formatter 来说无疑是极为方便的。

但事已至此，重新实现一个 parser 是不可能的，我不可能抛弃过去一年里所做的成果，还要把同样的事情再做一次。

我想起 [syn](https://docs.rs/syn) 生成的 AST 除了包含各自的语法结构，还会包含除了空白和注释以外的 token 信息。这保证了 AST 的易用性，更重要的是，这个方案对于目前的 Raffia 来说实现成本较低——只需要在现有的 AST struct 上补充缺失的 token 信息即可。

## Malva 的诞生

对于空白和注释问题，我想到的解决办法是：因为所有的 AST 节点和注释都包含 span，所以可以通过计算两个注释或 AST 节点相隔了多少行（0 表示它们在同一行，1 表示在相邻的两行，超过 1 表示它们之间存在空行）来决定要不要插入空行，以及注释的插入位置。这个将由 formatter 实现，不需要改动 Raffia；Raffia 已经提供了精确到 token 的位置信息，formatter 根据这些信息精准插入空白和注释即可。

剩下的就是 codegen 这种苦力活了。结合上面这些便构成了 Malva。

## 后话

有一点前面没提到的是，最初我没打算做独立的 CSS linter，而是做进 SWC 仓库里。（实际上我已经给 SWC 提了几次 PR）后来嫌每次都要提 PR、还得等 review 很麻烦，才决定自己做 linter。由此看来，整个发展路线很有意思：给 SWC 加 CSS linter → 自己做 CSS linter → linter 用到的 SWC CSS parser 只支持 CSS → 自己做 parser (Raffia) → 做 formatter (Malva) 。

另外有一点算是教训：规划很重要。之所以写 Malva 时遇到了前面提到的那些麻烦，无非是因为当初写 Raffia 时没打算做 formatter 导致的。如果当初有相关的计划，并让 Raffia 输出 CST 也许就不会有那些麻烦了。
