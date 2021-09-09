---
title: 使用 GDB 调试 Rust 程序
date: 2017-10-12 19:23:55
tags:
  - Rust
---

## 安装调试工具

在我上一篇讲配置 Rust 开发环境的时候，我当时用的是 MinGW 来作 Rust 的 linker，而那个 MinGW 是随 MSYS2 一起安装的，所以下面要安装的 GDB 等也要在 MSYS2 环境下进行。MSYS2 中包管理命令是 `pacman`。

> 由于国内连接国外服务器普遍很慢，此时可以把 pacman 的源修改为国内的镜像服务器。这里不作介绍。

### 安装 GCC 及工具链

x86 架构用 `i686` 表示，x64 架构用 `x86_64` 表示。我这里都是使用 x64 架构，实际根据你的需要去选择对应的工具就行。

依次执行：

```bash
pacman -S mingw-w64-x86_64-gcc  # 安装 GCC
pacman -S mingw-w64-x86_64-toolchain # 安装相关工具，这包含 GDB 等工具
```

### 配置环境变量

这里配置 `PATH` 环境变量是为了方便让其它程序调用 GDB。注意包含 GDB 的目录同时包含 Python 2.7，如果你原来配置有 Python 3 的环境变量，那么在此次设置之后，`PATH` 中默认的 Python 会指向 GDB 所在目录的 Python 2，而不能保持原来的 Python。

把 GDB 所在目录加入 `PATH` 环境变量即可，例如我这里是：`E:\Apps\msys64\mingw64\bin`。

## 安装 VS Code 的扩展

搜索并安装「Native Debug」扩展即可。

## 添加调试配置

在 VS Code 的调试页面中添加一份调试配置，选择「GDB」或「GDB: Launch Program」。

将配置中的 `target` 项改为 Rust 生成的 Debug 版的可执行文件路径。文件名通常是你当前的 Rust 的项目名。如图：

[![sp20171012_200135.png](https://i.loli.net/2018/05/08/5af1c034b84ea.png)](https://i.loli.net/2018/05/08/5af1c034b84ea.png)

为了不用我们每次调试前手动运行 `cargo build`，我们可以把这条命令作为 VS Code 的一项任务，并加入到 `.vscode/tasks.json` 中。例如我这里我为这个任务命名为「build」。

然后打开 `.vscode/launch.json`，在刚刚创建的调试配置中加入一项：`"preLaunchTask": "build"`。（就像上图那样）

这样我们每次调试前 VS Code 都会帮我们执行 `cargo build`。

## 调试

打断点是没有问题的，不过似乎不是所有的变量类型都能直接显示出来。

[![sp20171012_200216.png](https://i.loli.net/2018/05/08/5af1c034c511f.png)](https://i.loli.net/2018/05/08/5af1c034c511f.png)

The End.
