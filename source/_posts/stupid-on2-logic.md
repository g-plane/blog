---
title: 记一次 Rust 代码性能陷阱的修复
date: 2026-07-24 16:23:08
tags:
  - Rust
---

## 起因

最近试着在编辑器里打开一些比较大的 WebAssembly Text Format 文件，看看 [WebAssembly Language Tools](https://github.com/g-plane/wasm-language-tools) 能不能处理。我拿的测试文件是 [Malva](https://github.com/g-plane/malva) 的 dprint 插件，用 wat2wasm 反编译后有 464528 行代码，文件大小为 17.86 MiB（18735048 byte）。

平时我的 VS Code 里用的是 debug 模式构建的 [WebAssembly Language Tools](https://github.com/g-plane/wasm-language-tools)，这次测试也就自然地使用 debug build。编辑器打开后完全没有高亮，跳转定义和 hover 功能也没有反应。一开始我还以为是 language server 处理不过来而卡死了。直到放置几分钟后，语法高亮出现了，跳转定义和 hover 也正常并且都能马上完成，说明 Salsa 工作正常。

## 分析

初步猜测是 parser 太慢了，于是我单独写了个 criterion benchmark。但结果出乎意料——benchmark 显示解析耗时仅为约 190 ms。这下排除了 parser。

谈到语义分析，我首先想到的就是构建符号表。我在开始构建和完成构建处都打了 log，看看前后时间相差多少。日志显示，debug 模式下耗时 4 分钟多才能构建完符号表，而 release 模式下也要约 40 秒才能完成。为了验证，我还给 semantic tokens 请求也打了 log：在「获取到符号表」和「完成获取所有 semantic tokens」这两个地方都打 log。日志显示，「开始构建符号表」与「获取到符号表」的时间差与前面一样，但一旦获取到符号表，semantic tokens 在不到一秒的时间就完成了。要知道，这可是遍历整棵语法树上所有的 token——遍历语法树足够快。

## 尝试

在约半年前，我引入了 amber tree 的概念，（见[《理解 rowan，成为 rowan，超越 rowan》](./diy-rowan.html)一文）并给 semantic tokens 进行改造，让它使用 amber tree 而不是 red tree。由于目前构建符号表用的还是稍慢的 red tree，所以我首先想到的是也对符号表构建过程进行改造，让它也使用 amber tree。

由于 amber tree 不能访问父节点，但符号表构建过程确实存在访问父节点甚至祖先节点的需要，我的办法是用一个 Vec 作为 stack 来维护这个状态，amber tree 的遍历过程也依赖这个 stack 跟踪遍历。

改造完成了，但结果有些令我失望：问题没有得到解决。不过考虑到 criterion 的 benchmark 结果显示这个改造还是带来了轻微的约 4% 的性能改善，我就保留了这次改造。benchmark 在我的 i7-12700K（OS 是 Linux 7.1）上运行的结果如下：

改造前：

```
changed text            time:   [191.27 µs 191.58 µs 191.92 µs]
                        change: [+0.0021% +0.2333% +0.4671%] (p = 0.05 > 0.05)
                        No change in performance detected.

diagnostics             time:   [21.376 µs 21.412 µs 21.446 µs]
                        change: [-1.0917% -0.8217% -0.5511%] (p = 0.00 < 0.10)
                        Change within noise threshold.

unchanged text          time:   [6.6084 µs 6.6225 µs 6.6371 µs]
                        change: [-1.2073% -0.9146% -0.6459%] (p = 0.00 < 0.05)
                        Change within noise threshold.
```

改造后：

```
changed text            time:   [182.16 µs 182.44 µs 182.73 µs]
                        change: [-5.0122% -4.7599% -4.4873%] (p = 0.00 < 0.05)
                        Performance has improved.

diagnostics             time:   [21.112 µs 21.140 µs 21.172 µs]
                        change: [-0.8112% -0.4875% -0.1246%] (p = 0.00 < 0.10)
                        Change within noise threshold.

unchanged text          time:   [6.6688 µs 6.6893 µs 6.7085 µs]
                        change: [+0.4475% +0.7050% +0.9622%] (p = 0.00 < 0.05)
                        Change within noise threshold.
```

## 解决

此时我掏出另一个 profiling 工具：[samply](https://github.com/mstange/samply)，它可以生成火焰图。

我写了一段简单的「给 language service 输入上面那份大代码，并执行一次跳转定义」程序，（language service 本身不涉及 IO，所以不用担心外部影响）然后执行以下命令来分析：

```bash
samply record cargo run ... # 「...」换成实际的参数
```

结果可以看到有 99% 的时间花费在构建符号表内部的 `resolve_block_def` 函数：

![wat_service::binder::create_symbol_table::resolve_block_def 以 285978 的样本数占据了总的 99%](https://p.sda1.dev/34/8d1a4c4b1344e395563df7425bffdcc9/image.png)

再来看看 `resolve_block_def` 函数的实现：

```rust
fn resolve_block_def(symbol: &Symbol, symbols: &Symbols) -> Option<SymbolKey> {
    let mut current = symbol;
    while let Some(parent) = symbols
        .values()
        .find(|sym| sym.kind == SymbolKind::BlockDef && sym.key == current.region)
    {
        // ...
        current = parent;
    }
    // ...
}
```

这里是一处不细心的话就不会注意到的性能陷阱：它的时间复杂度是 O(n^2)，即 while 的每次执行都会完整地遍历一次整个符号表，而遍历符号表是一个 O(n) 的过程。这个问题在小文件中不会体现出来，因为符号数量不多，n 不会很大；而对于我上面输入的大文件，其符号数量往往是成千上万的，此时性能问题就会暴露。

考虑到 WebAssembly 的跳转是一层一层地由内往外查找的，结合我们之前改造过程中设置的语法树 stack，我们可以借助这个 stack 来查找跳转目标，不再需要这个 while 循环也不再需要遍历整个符号表。全过程是 O(n)，并且因为语法树深度较深的也就 20 多层，所以 n 值很小。

修复此处的性能问题后，再运行 samply，可以看到耗时以 parser 为主，而构建符号表相关的函数占比不足 1%：

![构建符号表相关的函数占比不足 1%，此时耗时以 parser 为主](https://p.sda1.dev/34/dd6b65192ad1104a016774df960371c2/image.png)

另一方面，log 也体现了这次修复：debug 模式下耗时约 1 秒，而 release 模式下不足 1 秒。

## 总结

平时看起来不起眼的代码很有可能隐藏着性能陷阱，而这些陷阱只有通过较极端的测试才能体现。另外，profiling 也是极为重要的一环，没有它就无法定位性能问题所在。

后续可能还要看看其它地方有没有类似的完整符号表遍历操作，并思考有没有解决办法。
