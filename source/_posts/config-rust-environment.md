---
title: 配置 Rust 开发环境
date: 2017-10-09 21:18:18
tags:
categories:
  - Rust
thumbnail: /images/config-rust-environment/sp20171009_234019.png
---

# 前言

配置 Rust 开发环境中所下载的工具都是从国外服务器下载的，而且我好像没找到有国内镜像（也许？如果有欢迎指出）。所以如果网络不好，请自己想办法。

涉及到 Rust Language Server （以下简称 RLS）部分的工具都需要 nightly 版本，我也不知道为什么。

# 安装 Rust

## 配置环境变量

安装 Rust 使用 Rust 官方推荐的 rustup，可以自动处理 rustc 和 cargo 等工具，还能通过添加 target 来实现交叉编译。不过 rustup 默认会把 Rust 安装在用户目录下，而 Windows 下就是C盘了。我可不想我的C盘被挤爆。但是 rustup 在安装过程中是不能修改安装路径的（只能修改工具链这些）。

好在 rustup 在[官方文档](https://github.com/rust-lang-nursery/rustup.rs#choosing-where-to-install)中指出可以通过指定环境变量来设定目录。这里要设置两个环境变量：分别是 `RUSTUP_HOME` 和 `CARGO_HOME`。

- `RUSTUP_HOME` 所指向的目录会存放 toolchain 等各种工具。
- `CARGO_HOME` 所指向的目录只放少量的文件，例如 rustc 等 bin 文件。

环境变量要在启动 rustup-init.exe 之前设置好。

## 执行 rustup-init

rustup 在 Windows 环境下会优先使用 MSVC 作 linker，也就是 target 为 `(arch)-pc-windows-msvc`，然而我没有 Visual C++ Build Tools（因为它太大了，而且装在C盘）。因此执行 rustup-init.exe 会看到这样的提示：（已经有 MSVC 编译器的不会有这样的提示）

![](/images/config-rust-environment/sp20171009_213420.png)

没关系的，按 Y 即可。

但是即使 rustup-init 已经知道你没有 MSVC 编译器，在接下来的下面它仍然默认使用 MSVC：

![](/images/config-rust-environment/sp20171009_213845.png)

所以这里要选择2，在自定义安装选项中，把 host 改为 `(arch)-pc-windows-gnu`。注意电脑上要先安装 MinGW，推荐安装 MSYS2。

后面的依然是 stable 和「确认修改环境变量」就行。

接下来的就是等待。安装完成后，可以分别执行以下命令检查是否成功安装。

```bash
rustc --version
cargo --version
```

# 安装 Rust Language Server 所需的工具

到了上面那一步，只是做到了能创建和编译 Rust 工程。想要有舒适的开发体验，还需要安装语言服务器。这里我推荐使用 VS Code 作为编辑器，配合 RLS 可以拥有 IDE 般的开发体验。（包括但不限于重构、代码补全、代码格式化）

## 安装 Rustfmt

Rustfmt 是 Rust 下的代码格式化工具，类似于 gofmt。安装之后（并配置 VS Code 下的扩展）可以像在其它语言下的那样进行格式化：

![](/images/config-rust-environment/sp20171009_215438.png)

首次执行 `cargo install` 会消耗较长时间（特别是网络不好），因为它要连接 GitHub 进行 crates 的索引。此外，下载和编译要一定的时间。是的，它需要下载回来后进行编译。

## 安装 Racer

RLS 需要 Racer，而安装 Racer 稍微复杂，并且又是个考验网络的时候。

首先安装 nightly 的工具链，由于我这里使用的 `x86_64-pc-windows-gnu`，所以要执行：

```bash
rustup toolchain install nightly-x86_64-pc-windows-gnu
```

然后安装 Rust 源码：

```bash
rustup component add rust-src --toolchain nightly
```

安装完成之后要添加一个环境变量（略烦）：`RUST_SRC_PATH`。把它的值设置为 `RUSTUP_HOME` 下 `toolchains/(你的 toolchain)/src`。

例如我这里 `RUSTUP_HOME` 的值是 `E:\Apps\Rust\rustup`，而我使用的 toolchain 是 `nightly-x86_64-pc-windows-gnu`，因此这个环境变量设置为 `E:\Apps\Rust\rustup\toolchains\nightly-x86_64-pc-windows-gnu\src`。

设置完之后就可以执行：

```bash
cargo +nightly install racer
```

接着安装：

```bash
rustup component add rls-preview --toolchain nightly
rustup component add rust-analysis --toolchain nightly
```

这里有一点我不是很清楚：如果我执行 `rustup component add rls --toolchain nightly`，会出现类似「toolchain 'nightly-x86_64-pc-windows-gnu' does not contain component 'rls' for target 'x86_64-pc-windows-gnu」这样的错误，而这种方法却是 VS Code 中的 Rust 扩展所执行的。但是按照 RLS 的[官方安装教程](https://github.com/rust-lang-nursery/rls#step-3-install-the-rls)，则是安装 `rls-preview`，这个没有问题。

# 安装 VS Code 中的相关扩展

这里推荐安装两个扩展，分别是 `Rust` 和 `Rust(rls)`，直接在 VS Code 中搜索「Rust」就能找到这两个扩展。

# 效果

## Snippets

![](/images/config-rust-environment/sp20171009_234019.png)

## 代码格式化

这个前面已经展示过了

## 重构

![](/images/config-rust-environment/sp20171009_234240.png)

![](/images/config-rust-environment/sp20171009_234325.png)

## 鼠标悬浮提示

![](/images/config-rust-environment/sp20171009_234422.png)

## 代码自动补全

![](/images/config-rust-environment/code-completion.gif)

## 错误或警告提示（On-the-fly）

![](/images/config-rust-environment/sp20171009_234956.png)

生命周期不正确也能检测（注意此时文件没有保存）：

![](/images/config-rust-environment/sp20171009_235453.png)

对于有些问题，能够通过编辑器修复：

![](/images/config-rust-environment/auto-fix.gif)

# 总结

整个过程主要是安装 RLS 那一部分比较复杂，特别是下载和编译消耗了不少时间。不过成功之后，带来的方便是显而易见的。

以上。
