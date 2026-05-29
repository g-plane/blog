---
title: wat formatter 性能优化
date: 2026-05-29 16:45:25
tags:
  - Rust
---

## 使用 arena

arena 允许我们在一段连续的内存空间中分配对象，并且在 arena 销毁时一次性释放所有对象而不是像传统的那样在离开当前作用域时就释放。这样做有两个好处：

- 该内存空间是连续的，对 CPU 缓存友好，访问速度更快；
- arena 中的对象不需要单独释放，避免了频繁的 `drop_in_place` 调用。

我使用的是 [bumpalo](https://crates.io/crates/bumpalo)，它提供了能在它的 arena 中（即 [`Bump`](https://docs.rs/bumpalo/latest/bumpalo/struct.Bump.html)）分配的 [`Vec`](https://docs.rs/bumpalo/latest/bumpalo/collections/vec/struct.Vec.html) 类型。我就用这个 `Vec` 来替换到 wat formatter 中所有之前使用标准库 `Vec` 的地方。但是 tiny_pretty 只认标准库的 `Vec`，而我为了保持通用性不想让 tiny_pretty 依赖 bumpalo，所以我给 tiny_pretty 增加了 `Doc::slice`（具体见下文）使其能接受 `&[Doc]`，这样当我构建好 `bumpalo::collections::Vec<Doc>` 后调用 `.into_bump_slice()` 就能得到 `&[Doc]`。

由于 tiny_pretty 的 [`Doc::append`](https://docs.rs/tiny_pretty/latest/tiny_pretty/enum.Doc.html#method.append)、[`Doc::concat`](https://docs.rs/tiny_pretty/latest/tiny_pretty/enum.Doc.html#method.concat) 和 [`Doc::list`](https://docs.rs/tiny_pretty/latest/tiny_pretty/enum.Doc.html#method.list) 方法都会在内部创建（标准库的） `Vec`，所以我配置了 Clippy 来禁止调用这些方法。

## 复用同一个 `Vec`

尽管使用 bumpalo 的 `Vec` 可以获得比使用标准库更高的性能，但每次创建新的 `Vec` 还是有一定性能开销的；（因为每次都要重新分配内存空间）如果能复用同一个 `Vec`，在前面的使用中可能经过扩容，后面使用时如果容量足够就不需要再分配了。在优化前，wat formatter 内输出每个 node 或 token 所带的 trivias（即空白、注释等）时都会返回一个新的 `Vec`；优化后，改为同一个父节点内的子 node 和 token 共用同一个专门收集 trivias 的 `Vec`，并让处理 trivias 的函数接收这个 `Vec` 作为参数，而不是返回一个新的 `Vec`。

类似地，在 trivias 处理函数内部也优化逻辑，不再需要使用 `Vec` 来收集需要输出的 trivia tokens，改为一次循环迭代中直接处理并输出。（顺便减少了循环次数，也算是优化性能）

## 减少 `Doc::group` 的使用

[`Doc::group`](https://docs.rs/tiny_pretty/latest/tiny_pretty/enum.Doc.html#method.group) 是 tiny_pretty 中的一个 API：它会尝试将 group 内的内容放在同一行，如果放不下就换行。之前 wat formatter 在很多地方使用了 `Doc::group`，但其实大部分是不需要的。所以我检查了整个 wat formatter 的格式化逻辑，删除了大部分的 `Doc::group` 调用，减少了分析和计算从而提升性能。

## 优先使用 array

由于 tiny_pretty 增加了 `Doc::slice`，所以对于固定、已知的 Doc 可以提前以 array 的形式定义好，使用时再取它们的 slice。这样就能避免这部分的分配。

## tiny_pretty 优化

除了 wat formatter 自身的优化，wat formatter 所使用的 [tiny_pretty](https://github.com/g-plane/tiny_pretty) 也存在优化空间。

### 新增 [`Doc::slice`](https://docs.rs/tiny_pretty/latest/tiny_pretty/enum.Doc.html#method.slice)

tiny_pretty 已经有接收 `Vec<Doc>` 作为参数的 [`Doc::list`](https://docs.rs/tiny_pretty/latest/tiny_pretty/enum.Doc.html#method.list)，但这个是 std 的 `Vec`，而我不想让 tiny_pretty 引入 arena，因为这会导致 API 大改。于是我想到让 tiny_pretty 接受 `&[Doc]`，这样下游开发者可以自己选择用不用 arena 以及用什么样的 arena，达到曲线救国的效果。

同时，`Doc::group` 内部的类型由 `Vec<Doc>` 改为 `Cow<[Doc]>`，使得它能对 `Doc::slice(..).group()` 进行特殊处理而不需要重新创建 `Vec`。相应地，[`Doc::soft_line`](https://docs.rs/tiny_pretty/latest/tiny_pretty/enum.Doc.html#method.soft_line) 内部实现改为创建 slice 而不是调用 `vec![..]`。

### 新增 [`Doc::char`](https://docs.rs/tiny_pretty/latest/tiny_pretty/enum.Doc.html#method.char)

为只输出单个字符提供专门的 API，这样就不需要创建字符串，（即使是 `&str`）而且 `String` 内部的 `.push()` 逻辑也比 `.push_str()` 简单。不过这个带来的性能提升很微。

### 复用同一个 `Vec`

与前面类似，之前的代码中在遇到 `Doc::group` 时每次都会创建一个新的 `Vec` 用于检测和分析（是否能一行放下）。现在改为复用同一个 `Vec`，并在每次使用前先清空它。

### `Doc::nest` 特殊处理

像 `Doc::list(..).nest(..)` 和 `Doc::slice(..).nest(..)` 等在列表后立即调用 `.nest()` 是常见的用法，但之前 `Doc::nest` 的实现没有针对这种用法进行特别优化，只是用 `Rc<Doc>`（后来改为 `Box<Doc>`）来存。现在针对 `Vec<Doc>` 和 `&[Doc]` 这两种类型进行特殊处理，同时依然保留 `Box<Doc>` 作为 fallback，并用一个 enum 来统一这三种情况。这样可以省去额外的 `Rc` 或 `Box` 所带来的堆分配。

### 避免创建临时 `String`

我们知道每创建 `String` 都会发生堆分配，而 `&str` 的 `repeat` 方法就返回 `String`。之前的代码中，在输出缩进所需要的空格字符时，使用的是 `" ".repeat(..)`，导致每次输出缩进都创建临时的 `String`。现在改为在循环里 `.push(' ')`，完全避免了临时的 `String`。

### 其它细微的优化

- 在 `Doc::group` 检测是否能一行放下时，之前的实现是将 group 内的内容通过 `.iter().map()` 附加一些信息后收集到 `Vec` 中再分析。现在改为接受这个 iterator，因为在检测过程中函数有可能提前返回，这样就不需要全部复制。
- `Doc::line_or_nil` 和 `Doc::line_or_space` 都会返回 `Doc::Break` 这个内部 enum variant，里面有一个 usize 记录「如果能一行放下就输出多少个空格」。由于目前只有 `line_or_nil` 和 `line_or_space` 这两种操作，即 usize 只有 0 和 1 两种可能，所以改为直接用 bool。

## 结果

下面是在操作系统为 Linux 7.0、CPU 为 Intel i7-12700K 上的 benchmark 结果：

| 优化前 (µs) | 优化后 (µs) | 绝对差 (µs) | 相对变化 | 性能提升倍数 |
|-------------|-------------|-------------|----------|--------------|
| 23.493 | 7.0656 | -16.4274 | ↓ 69.92% | 3.32× |

下面是在 M4 Mac mini 上的 benchmark 结果，有趣的是 VS Code 内置终端似乎会拖慢在其中运行的程序：

| 终端 | 优化前 (µs) | 优化后 (µs) | 绝对差 (µs) | 相对变化 | 性能提升倍数 |
|----------|-------------|-------------|-------------|----------|--------------|
| VS Code 内置终端 | 34.420 | 6.2121 | -28.2079 | ↓ 81.9% | 5.54× |
| Kitty | 20.729 | 6.0717 | -14.6573 | ↓ 70.7% | 3.41× |

对比 macOS 在 Kitty 的 benchmark 结果和 Linux 上（同样用 Kitty）的 benchmark 结果，可以确定这次优化是稳定的。

不过话说回来，[wasm-language-tools](https://github.com/g-plane/wasm-language-tools) 本来就没什么人用，用 formatter 的人可能更少，所以花这么大精力去优化完全是自嗨罢了。
