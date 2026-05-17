---
title: 理解 rowan，成为 rowan，超越 rowan
date: 2026-05-16 17:27:43
tags:
  - Rust
---

## rowan 简介

rowan 是由 rust-analyzer 团队开发的无损语法树库。所谓「无损」，即语法树是 CST 而不是 AST，源代码中所有的细节如空白、注释等都能被保留在语法树中。rust-analyzer 作为 language server 而不是一般的编译器，它需要忠实地记录源代码的完整信息。比如在 code actions 场景中，language server 需要根据周围的空白、注释等信息来更好地生成代码修改建议。

另外，rowan 的语法树是 untyped 的，也就是所有的节点使用相同的 struct 类型。这样做的原因一方面是上面提到的保留空白和注释：空白和注释 token 可以出现在任何地方，但通常的 typed 语法树很难灵活地记录、存储这些 token；另一方面是为了容错解析：用户在编辑时代码是不完整的、可能包含语法错误，untyped 语法树可允许语法结构缺失或出现 error token，但整体仍然是一棵可被用于后续分析的语法树，从而使得即使代码不完整或有语法错误也能进行语义分析。

## 为什么要自己实现一个 rowan

这些都是我做 [wasm-language-tools](https://github.com/g-plane/wasm-language-tools)（针对 WebAssembly Text Format 的一个 language server）时遇到的真实感受。

### API

API 不算好用是一个次要因素。例如，[`SyntaxNode::first_token`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.first_token) 返回的是当前节点的子树中最深处的第一个 token，而不是当前节点的第一个子 token。有这种行为的 API 本身没问题，但它的名字 `first_token` 会让人误解。如果真的想获取当前节点的第一个子 token，需要用 [`SyntaxNode::first_child_or_token`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.first_child_or_token)，但这个返回的是 [`NodeOrToken`](https://docs.rs/rowan/latest/rowan/enum.NodeOrToken.html)，结果就导致我还要再写一层 match 才能拿到 token，属于脱裤子放屁。实践中我极少存在不知道第一个子是 node 还是 token 的情况，因为 rowan 已经提供了 [`SyntaxNode::first_child`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.first_child) 即获取第一个子节点。（会跳过子节点前的 token）换句话说，使用 `first_child_or_token` 仅仅是为了获取第一个 token。

rowan 的 [`SyntaxNode::siblings`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.siblings) 和 [`SyntaxNode::siblings_with_tokens`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.siblings_with_tokens) 会在遍历时包含当前节点本身，这同样违反直觉。我使用这两个 API 时不得不多写一层 `.skip(1)` 来跳过当前节点，不仅麻烦还引入了额外的代码分支从而影响潜在的性能。

还有一点是虽然我个人觉得麻烦但可以理解的：rowan 为了通用，绿树节点的 syntax kind 是 rowan 提供的 [`SyntaxKind`](https://docs.rs/rowan/latest/rowan/struct.SyntaxKind.html)，但红树用的是用户自定义的枚举类型。每次用绿树都要在这两种类型之间转换，无形中降低了我使用绿树的积极性。（绿树性能比红树高并且能被 Salsa 缓存，所以如果能用绿树是更好的）

### 性能

主要因素是性能。之前在优化 diagnostics 时，profiling 结果显示红树的遍历占了相当可观的比例。尽管当时有使用 `preorder` 的 `skip_subtree` 来减少部分子树的遍历，但收效甚微。一个可能的原因是 rowan 支持对语法树进行可变操作，虽然我不需要修改语法树，但 rowan 内部可能为此而特别设计，进而影响性能。

另一个原因是每次创建红树的 node 或 token 都要进行一次堆分配，当到了遍历整棵树的场景时，大量的节点将被创建和销毁，这将显著损害性能。其创建的次数可能远超你的想像：每一次的节点查询，包括但不限于子节点、兄弟节点都会为查询到的节点创建一个新的对象，并在离开作用域时销毁它。[cstree](https://github.com/domenicquirl/cstree) 宣称能比 rowan 快就是因为它会缓存创建过的 node 和 token，避免反复创建销毁。

## API 优化与整合

我移除了 rowan 中我不需要的那些 API，并对其它一些 API 进行细微调整。下面主要讲明显的改动：

### 灵活匹配 SyntaxKind

rowan 中类似 [`SyntaxNode::first_child_by_kind`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.first_child_by_kind) 要求传的是用户自定义的 SyntaxKind 匹配检查函数。姑且不提这个 API 要求传的是闭包或函数的引用，（每次传函数都要额外写 `&`，很麻烦）在大多数时候我只是需要判断当前节点的 SyntaxKind 是否为某个指定的值如 `kind == SyntaxKind::ROOT`，如果能直接传入一个 SyntaxKind 会相当方便。但我又想保留传函数的能力以允许自定义匹配逻辑。

解决办法是引入一个新的 trait [`SyntaxKindMatch`](https://docs.rs/wat_syntax/latest/wat_syntax/trait.SyntaxKindMatch.html)，然后让 `_by_kind` 方法接收实现了这个 trait 的类型作为参数，这样就不会局限在一种类型。当然了，我默认为 `SyntaxKind`、`Fn(SyntaxKind) -> bool`、`[SyntaxKind; N]` 这三种类型实现了 `SyntaxKindMatch`。

于是下面三种写法都是可以的：

```rust
node.first_child_by_kind(SyntaxKind::PARAM); // 仅匹配单个
node.first_child_by_kind(|kind| matches!(kind, SyntaxKind::PARAM | SyntaxKind::RESULT));
node.first_child_by_kind([SyntaxKind::PARAM, SyntaxKind::RESULT]); // 满足数组中任意一个即可
```

### siblings 跳过自身

rowan 的 [`siblings`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.siblings) 和 [`siblings_with_tokens`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.prev_sibling_or_token) 在遍历时包含当前节点本身，也就是遍历的第一个元素是当前节点自己。我把这个行为改成了：遍历的第一个元素是兄弟节点。在我的应用场景中，这能带来轻微的性能提升。

### 整合 first/last_child

rowan 中有 [`SyntaxNode::first_child_by_kind`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.first_child_by_kind) 却没有 `last_child_by_kind`。如果想获取最后一个满足特定 SyntaxKind 的子节点，必须先调用 [`SyntaxNode::last_child`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.last_child) 再调用 [`SyntaxNode::siblings`](https://docs.rs/rowan/latest/rowan/api/struct.SyntaxNode.html#method.siblings) 并指定 direction 为 `Direction::Prev` 来反向遍历兄弟节点。（这也许是 `siblings` API 需要包含当前节点本身的原因？）操作过程繁杂。

我的做法是将 `first_child_by_kind` 和不实际存在的 `last_child_by_kind` 整合起来，取而代之的是 [`SyntaxNode::children_by_kind`](https://docs.rs/wat_syntax/latest/wat_syntax/struct.SyntaxNode.html#method.children_by_kind)。这个方法返回一个 iterator，这使得在使用上相当灵活：

- 如果想获取第一个满足特定 SyntaxKind 的子节点，可以调用 `.next()`：`node.children_by_kind(SyntaxKind::PARAM).next()`；
- 如果想获取最后一个满足特定 SyntaxKind 的子节点，可以调用 `.next_back()`：`node.children_by_kind(SyntaxKind::PARAM).next_back()`，因为返回的 iterator 实现了 `DoubleEndedIterator`；
- 如果想获取所有满足特定 SyntaxKind 的子节点，可以直接使用这个 iterator 进行遍历。

这里有个例外：为了减少 [`ast`](https://docs.rs/wat_syntax/latest/wat_syntax/ast/index.html) 模块的改动以及避免 iterator 使用 `.flat_map()` 时的 lifetime 问题，[`SyntaxNode::children`](https://docs.rs/wat_syntax/latest/wat_syntax/struct.SyntaxNode.html#method.children) 返回的是我自己定义的 iterator 类型，但它没有实现 `DoubleEndedIterator` 因此无法使用 `.next_back()`。

## 黄树（amber tree）

在 rowan 中存在着红树（red tree）和绿树（green tree）两种语法树：

- 红树：功能和 API 比较丰富，不仅能访问子节点和 token，还能因为每个节点记录着父节点的引用而访问父节点和兄弟节点。但正因为记录了父节点的引用而导致循环引用，必须将节点存储在堆上并使用 `Rc` 来减小 clone 的性能开销；
- 绿树：性能比红树好得多；只能访问子节点和 token，而且从 API 上访问 children 时不直接区分是 node 还是 token，而是返回一个 `NodeOrToken`，麻烦；绿树节点不记录 text range 所以无法知道某个节点在源代码中的位置。

这里值得一提的是，rowan 的红树和绿树并不是完全独立的两棵树，而是共享同一棵绿树的不同视图：红树是对绿树的包装。

在我的大多数应用场景中，我并不需要访问父节点或兄弟节点，使用红树只是因为它 API 比绿树友好并且能获取 text range。那我能不能设计一种语法树，在不考虑父节点和兄弟节点的访问需求的前提下，既能提供相对友好、保证一定功能的 API，同时能获取 text range，并且性能接近绿树呢？

完全可以，而且实现起来可能远比想像中的简单。因为在功能定位上它介于红树和绿树之间，所以我把它叫做「黄树」（amber tree）。以语法树节点的定义为例：

```rust
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub struct AmberNode<'a> {
    green: &'a GreenNode,
    range: TextRange,
}
```

`green` 字段持有绿树节点的引用，既使得 amber node 本身足够轻量，又能让 Rust 保证只要 green node 的 lifetime 有效，amber node 也就有效；`range` 字段记录了当前节点在源代码中的位置，这样就解决绿树无法获取 text range 的问题。两个字段都是 `Copy` 的，（`GreenNode` 不是 `Copy` 但引用是）所以给 [`AmberNode`](https://docs.rs/wat_syntax/latest/wat_syntax/struct.AmberNode.html) 实现 `Copy` 也就很自然。

剩下的就是根据实际使用需要，仿照红树实现一些 API。因为能访问绿树，所以访问子节点甚至是更深层级的节点都可行并且足够轻量。

我给 language service 中的部分功能由原来的使用红树改为了使用黄树，并进行 benchmark。要注意的是在实现 amber tree 前我已经重写了 rowan 的红树实现并应用了其它的一些细微优化，所以这里的性能提升是基于之前已经优化过的红树的：

| 测试场景 | 引入 amber tree 前 | 引入 amber tree 后 | 变化 |
|----------|--------|--------|--------|
| **diagnostics** | 26.186 µs | 26.686 µs | ↑ 1.9% |
| **unchanged text** | 15.469 µs | 7.609 µs | ↓ 50.8% |
| **changed text** | 224.73 µs | 172.39 µs | ↓ 23.3% |

注意这里当时还没给 diagnostics 引入 amber tree，所以 diagnostics 性能没有变化，这里应该是误差。

## 改进 formatter

formatter 中很少有需要使用父节点或兄弟节点的场景，现在我可以改为在 formatter 中使用 amber tree 而不是原来的红树，进而大幅提升性能。

在之前使用红树时，因为 `SyntaxToken` 的 token text 存储在堆上，与 token 自身的 lifetime 没有必然联系，所以不能将返回的 `&str` 传给 [`tiny_pretty`](https://docs.rs/tiny_pretty)。当时为了绕过这个问题只能用 `.text().to_string()`，这就引入了堆分配和字符串复制。amber tree 内部始终持有 green tree 的引用，这里 token text 的 lifetime 与 token 本身的 lifetime 是一致的，因此我可以直接使用 amber tree 返回的 `&str`。

应用上述两项关键优化后，benchmark 结果显示 formatter 耗时由原来的约 85.191 µs 下降至约 34.808 µs，耗时下降了约 59.1%，性能提升了约 2.4 倍。

## 优化绿树构建

在 rowan 里，绿树是以 header 元信息 + 子节点的布局存储。为了能低开销地 clone 绿树，绿树内部使用的是 ThinArc。ThinArc 是为存储 slice 而优化过内存布局的 Arc。

我们知道，在不考虑使用 RwLock 或类似物的前提下，Arc 创建后不能直接修改数据。但在 rowan 的设计里，绿树的 header 元信息需要记录当前整棵绿树的文本长度；创建 ThinArc 的参数又只是一个 iterator，只能在遍历 iterator 时顺便记下并累计文本长度。如何在创建 ThinArc 后更新 header 元信息中的文本长度？

rowan 的做法是利用 ThinArc 刚创建完、返回给外部之前，该 ThinArc 仅被当前线程持有的特点，调用 `ThinArc::get_mut()`。尽管 `get_mut` 返回 `Option<T>`，但这个 ThinArc 没有被共享，所以此时调用 `.unwrap()` 不会导致 panic。虽然逻辑上没有问题，但 `get_mut` 内部会执行一次 atomic load 以检查引用计数。尽管 atomic 的开销比通常的锁要小，但如果能省去的话无疑更好。

rowan 使用的 ThinArc 来自他们 vendor 版本的 [`triomphe`](https://docs.rs/triomphe/)，并且版本比较老。我则是从 crates.io 上使用最新版本的 triomphe。新版本的 triomphe 增加了一个新的 API [`UniqueArc`](https://docs.rs/triomphe/latest/triomphe/struct.UniqueArc.html)，它能保证创建后仅被当前线程持有，因此在创建后可以直接获取可变引用而无需进行 atomic load，同时去掉不必要的 `.unwrap()`，从而提升性能。在修改完 header 数据后调用 [`.shareable()`](https://docs.rs/triomphe/latest/triomphe/struct.UniqueArc.html#method.shareable) 就能将 `UniqueArc` 转换成 `Arc`。

应用上述优化后，benchmark 结果显示 parser 耗时由原来的约 13.723 µs 下降至约 13.421 µs，耗时下降了约 2.2%。

## 完整的 benchmark 数据

| 测试场景 | 重写前 (µs) | 重写后 (µs) | 绝对差 (µs) | 相对变化 | 性能提升倍数 |
|----------|-------------|-------------|-------------|----------|--------------|
| **unchanged text** | 18.307 | 6.933 | -11.374 | ↓ 62.1% | 2.64× |
| **fmt** | 85.191 | 34.808 | -50.383 | ↓ 59.1% | 2.45× |
| **diagnostics** | 36.233 | 21.049 | -15.184 | ↓ 41.9% | 1.72× |
| **changed text** | 250.82 | 151.17 | -99.65 | ↓ 39.7% | 1.66× |
| **parser** | 13.723 | 13.421 | -0.302 | ↓ 2.2% | 1.02× |

相关 Pull Request：[#36 Rewrite rowan with our own implementation](https://github.com/g-plane/wasm-language-tools/pull/36)
