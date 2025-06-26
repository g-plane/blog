---
title: Rust 增量计算方案选型
description: 写 wasm-language-tools 这个 language server 前所做的技术选型。
date: 2025-06-26 12:19:16
tags:
  - Rust
---

## Salsa

这里针对的是 v0.16 及以前版本的 [Salsa](https://crates.io/crates/salsa/0.16.1)。

Salsa 是比较出名的增量计算库，而且 rust-analyzer 也在用，所以首先考虑到了它。

与其它的增量计算库相比，它使用了过程宏而不是声明宏，这就避开了 rustfmt 支持不良这一问题。它还有一个优点是：如果不需要并行或并发计算，输入输出的类型不要求实现 `Send` 和 `Sync`。对于早期还不支持多线程的 [wasm-language-tools](https://github.com/g-plane/wasm-language-tools)，我可以简单地将 parser 返回的 `rowan::SyntaxNode` 类型（不实现 `Send` 和 `Sync`）作为输出。

它的缺点是输出类型不能是引用，（新版里似乎支持引用了，但我还没测试）解决办法是用 `Rc` 或 `Arc`。

## Adapton

我没有深入了解 [Adapton](https://crates.io/crates/adapton)，因为我在大致浏览它的使用方法和 API 的时候，发现它大量使用声明宏。由于在开发时 rust-analyzer 需要展开宏才能提供编辑体验，过多地使用宏可能导致编辑卡顿，同时 rustfmt 也不能很好地支持第三方库的声明宏。

后来稍微看了它的文档，我感觉它在概念上没有很复杂。上面的宏也不算复杂，自己在代码里手动展开也不是不行。但是核心的类型没有实现 `Send` 和 `Sync`，不能满足并行或并发计算的需求。

## Verde

[Verde](https://crates.io/crates/verde) 大体上就是一个精简版的 Salsa，而且某些地方使用起来比较麻烦。例如，强制要求输入输出类型实现 `Send` 和 `Sync`。

## granularity

[granularity](https://github.com/pragmatrix/granularity) 没有被发布到 crates.io，但它的用法很简单，所以如果确实有需要可以自行 fork 并发布。

它的 `map!` 与 `memo!` 的不同之处在于，前者每次读取都会重新执行计算；而后者正如其名，会「记住」计算结果，对于相同的参数，多次读取不会再次执行计算函数。

## leptos_reactive

[leptos_reactive](https://crates.io/crates/leptos_reactive) 不是一个专门用于增量计算的库，而是为 [leptos](https://crates.io/crates/leptos) 这个 Web 框架服务的响应式计算库。也正因为如此，如果要在 leptos 框架外使用这个库会很麻烦，直接使用的话它会在运行时向 stderr 输出一些警告。

leptos_reactive 提供的 API 与 [Solid.js](https://www.solidjs.com/) 的 [Signal](https://docs.solidjs.com/concepts/intro-to-reactivity#signals) 非常像，而 Signal 的侧重点就在于「响应式」，所以它主要的 API 都不能像增量计算那样复用计算结果。不过，它还是提供了 [`create_memo`](https://docs.rs/leptos_reactive/0.6.15/leptos_reactive/fn.create_memo.html) 这样的 API 来实现复用计算结果的效果。
