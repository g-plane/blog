---
title: 在浏览器里跑 C 语言写的程序？可行是可行……
date: 2022-01-19 22:55:20
tags:
  - WebAssembly
---

看到标题，想必很多读者都想到 WebAssembly 吧？没错，这篇文章确实讲 WebAssembly，但我不是来介绍 WebAssembly 的——很多人能比我讲得更好。

这篇文章讲的是如何把一个现有的基于 C 语言的命令行程序搬到浏览器中运行。剧透：会有很多坑。

## 为什么要搞这个？

 FLAC（Free Lossless Audio Codec，就是那个无损格式）官方提供一个命令行工具：`flac`，它可以对本地的 .flac 文件进行编码、解码以及其它一些操作。而我想做一个能在浏览器里运行的 .flac 文件分割工具。（`flac` 工具提供有相关参数，具体不展开介绍）

我没找到合适的用 JavaScript/TypeScript 写的 FLAC 处理工具；而我发现官方有这么一个工具，所以想用它来搞，毕竟官方的也相对有保障。

## 前期准备

在这之前我已经知道有人把 [FFmpeg 编译成 WebAssembly](https://github.com/ffmpegwasm/ffmpeg.wasm) 以便支持在浏览器里运行，而那个 `flac` 是一个在功能上类似于 FFmpeg 的工具，那么我想它应该也能在浏览器里运行。

初步了解到，将 FFmpeg 编译成 WebAssembly 需要一个工具：[Emscripten](https://emscripten.org/)。以前折腾 Rust 编译为 WebAssembly 的时候听说这个工具，不过我对它并不了解。

在它的教程一开始，就有这么一个把如下的 C 语言程序编译为 Node.js 能运行的例子：

```c
#include <stdio.h>

int main() {
  printf("hello, world!\n");
  return 0;
}
```

这不是一个命令行程序吗？居然也能编译为 WebAssembly 然后让 Node.js 去执行？要知道，在 Rust 那边，使用 WebAssembly 有很多限制，更别说这种会有 I/O 操作的了。

于是我用 Emscripten 提供的 `emcc` 命令编译。结果惊吓到我了：确实可以。而且我们还可以修改那个 `main` 函数以便接收命令行参数，而结果是我们以命令行的方式通过 Node.js 传参数，它也能拿到。

而事实上，WebAssembly 版 FFmpeg（FFmpeg.wasm）需要我们像在本地执行 `ffmpeg` 命令然后传递各种参数那样，以数组的形式传递参数。此外，通过 FFmpeg.wasm 的例子，我们还能发现我们需要指定输入文件的文件名和输出文件的文件名，这意味着它能模拟文件系统——因为 WebAssembly 没法涉及 I/O。

## 开始动手

那我们可以开始用 Emscripten 给 `flac` 编译为 WebAssembly 了。

### CMake 用不了

FLAC 的那些工具支持传统的 `./configure` 然后 `make` 的方式，也可以使用 CMake。用 CMake 看起来步骤简单，而且 Emscripten 也提供 CMake 的 wrapper：`emcmake`。

但我用 `emcmake` 编译失败。一开始我还以为是我哪里的参数不对，然后试着用正常的 `cmake` 命令编译，是成功的。再看看 Emscripten 文档关于 CMake 部分，好像也没什么不对。不过既然还有另外一种构建方式，那就不在这浪费时间了，而且 FFmpeg.wasm 也是用 `make`。

### 怎么没有入口文件？

Emscripten 已经帮我们封装好构建工具的命令了，只需要在相应的命令前加 `em` 前缀即可。对于 `./configure`，则是 `emconfigure ./configure`。那我们要运行 `emconfigure ./configure` 然后执行 `emmake make`。

> 把 FLAC 的仓库 clone 下来之后，里面是没有 `configure` 文件的，需要先执行一次 `autogen.sh` 脚本才有。

编译成功了。不过我没找到编译生成的 .wasm 文件在哪里，毕竟我不了解 C/C++ 的构建流程。通过搜索相关资料，我得知构建产物一般会在 `.libs` 目录下。

一打开，看到里面有两个文件：一个是没有扩展名的 `flac` 文件；另外一个是 `flac.wasm` 文件。

怎么没有 JavaScript 文件？总不能让我自己调用这个 .wasm 吧？在前面的 Hello World 体验中，编译之后会生成一个 .wasm 文件和一个 .js 文件，而我们要调用的是那个 .js 文件。可是这里没有啊？而且那个 `flac` 感觉是一个可执行文件。我不是要编译成 WebAssembly 吗？怎么还会有可执行文件出来的？

根据我那少得可怜的对 C/C++ 编译的认知，执行 `make` 命令其实是执行 `Makefile` 里的任务。看看 `Makefile` 说不定能发现什么。

我注意到 `Makefile` 中定义了一个变量 `EXEEXT` ，这个变量在编译时用到了。另外从名字上可以猜出，它应该跟编译出的可执行文件的扩展名有关。（因为 Windows 下可执行文件必须包含 `exe` 扩展名，而 Unix 不需要）

那如果我修改 `Makefile` 给它指定为 `.js`，它是不是就不会生成那个可执行文件，而是生成一个 JavaScript 文件呢？一试，确实出来了一个 .js 文件，里面也是 JavaScript 代码。

但是这样手工修改 `Makefile` 不太合适。后来想了想，那个 `EXEEXT` 也许只是个名字，实际上并没有什么意义。我把它改回原来的空值，再次编译，并打开编译后的 `flac` 文件：发现它就是一个 JavaScript 文件！只是因为没有扩展名，让我「先入为主」地以为它是可执行文件。

> 其实当时我在这里弄了很久。我甚至根据文档的某些内容，尝试将几个 `.o` 文件或 `flac` 文件用 `emcc` 去编译。

## 疯狂调编译参数

现在编译出来的文件应该是没有问题的，但它并不符合我的需要：回想一开始的那个 Hello World 例子，我们一加载那个 JavaScript 文件，`main` 函数就会被执行；而我们想要的效果是像 FFmpeg.wasm 那样，我们自己传参数进去，并且我们自己决定调用 `main` 函数的时机，而不是一开始就调用。

通过查找一些资料，以及研究 FFmpeg.wasm 的构建，我得知如果想要手动执行 `main` 函数，就需要加入下面的编译参数：

```
-pthread -s INVOKE_RUN=0 -s EXIT_RUNTIME=0 -s USE_PTHREADS=1 -s PROXY_TO_PTHREAD=1 -s EXPORTED_RUNTIME_METHODS="[FS, cwrap, ccall, setValue, writeAsciiToMemory]" -s EXPORTED_FUNCTIONS="[_main]"
```

关键的参数是 `INVOKE_RUN` 参数和 `EXIT_RUNTIME` 参数。其中 `INVOKE_RUN` 参数用于设置要不要立即执行 `main` 函数；而 `EXIT_RUNTIME` 参数则用于控制程序执行完之后要不要退出。设为 `0` 就是关闭这些行为。

另外的那些 `pthreads` 相关的则是让 WebAssembly 的运行过程不阻塞浏览器主线程 UI。不过我一开始并没有把这些参数用于编译 `flac`，为了简化，我把 pthreads 相关的参数删掉。

另外我们还要考虑怎样把「命令行参数」传给 `main` 参数：[这篇文章](https://mp.weixin.qq.com/s/ccEjtjEyH3fRMNZQwF687w) 有提到用 `cwrap` 来「包装」`main` 参数以便让外部调用。

但在运行的时候总是报类似于 `"cwrap" is not exported` 之类的错误。而我借助 Node.js REPL 检查 Emscripten 生成的模块都提供了哪些成员的时候，我又确实看到有 `cwrap` 属性。

后来再搜索了一番资料才知道，原来是要给编译加 `-s EXTRA_EXPORTED_RUNTIME_METHODS="[cwrap, setValue, writeAsciiToMemory]"` 这样的参数。这样做是为了能把 Emscripten 提供的 `cwrap` 等 runtime 函数导出并供我们使用。

类似地，使用 `_malloc` 函数也遇到问题。我尝试给 `EXTRA_EXPORTED_RUNTIME_METHODS` 加上 `_malloc`，但失败了。再次搜索资料，在 GitHub 看到了 [Module._malloc is not a function · Issue #6882 · emscripten-core/emscripten · GitHub](https://github.com/emscripten-core/emscripten/issues/6882#issuecomment-406745898)，才知道原来要加在 `EXPORTED_FUNCTIONS` 里，而不是 `EXTRA_EXPORTED_RUNTIME_METHODS`。

后面我注意到了 Emscripten 提供了一个 `callMain` 的函数。这个函数就是负责帮我们调用 `main` 函数，并且不需要像使用 `cwrap` 或 `ccall` 那样，由我们自己构造一块内存空间然后计算指针等复杂操作；我们只需要传入一个字符串数组，它就会返回程序的退出代码（exit code）。这样的话，编译参数的 `EXPORTED_RUNTIME_METHODS` 也就可以简化为 `EXPORTED_RUNTIME_METHODS="[callMain]"`，也不需要在 `EXPORTED_FUNCTIONS` 里导出 `_malloc`。

因为 `flac` 会涉及到 fs 操作，所以我们要用到 Emscripten 提供文件操作相关的函数，这些函数都在 Emscripten 生成的模块的 `FS` 属性下。我们同样要通过调整编译参数将它导出来：`EXPORTED_RUNTIME_METHODS="[FS, callMain]"`。

## 解决阻塞问题

实际运行中我发现，在执行 `flac` 的时候，整个页面都会卡住，而且没法进行任何操作。其原因大概就是加载 WebAssembly 以及执行其中的代码是一个阻塞的过程，并且因为它的执行时间比较长（至少有几秒）。也就是说，运行过程中，页面会有至少几秒的时间失去响应。这个体验显然不好。

在 Emscripten 的文档以及[《高级前端进阶：我是如何把 C/C++ 代码跑在浏览器上的？》](https://mp.weixin.qq.com/s/ccEjtjEyH3fRMNZQwF687w)这篇文章的关于编译 FFmpeg 一节中，就有提到通过添加一些编译参数开启 pthreads 支持来避免阻塞浏览器主线程。

需要添加这些 CFLAGS 参数：

```
-pthreads -s USE_PTHREADS=1 -s PROXY_TO_PTHREAD=1
```

其中 `PROXY_TO_PTHREAD` 参数会对 `main` 函数进行包装，使其不阻塞浏览器主线程。

但当我加上去之后，浏览器就提示 `SharedArrayBuffer` 的问题。看到这里就不用继续考虑这个方案了。

> `SharedArrayBuffer` 因为 CPU 漏洞而被关闭。

但阻塞的问题还是要解决的。这里我想到的方案是使用 Web Worker。

由于我加了 `-s MODULARIZE=1 -s EXPORT_ES6=1` 编译参数，所以 Emscripten 生成出来的 JavaScript 是一个 ES Module。这样直接运行是没有问题的，但要在 Web Worker 里运行则会遇到浏览器兼容性问题——Firefox 不支持 Module Worker；并且 Web Worker 的创建要求 `new Worker()` 的第一个参数是一个指向 script 的路径，这意味着我们不能硬编码这个路径——因为 `flac` 会被作为一个库发布出去，而用户会怎样使用这个库，我们是没法确定的。（如果使用了 bundler，那 bundler 构建产物的文件名可能发生变化）

首先要解决「去掉」ES Module 语法的问题。你也许会问，为什么不直接去掉那两个编译参数呢？因为我希望仍然提供 ES Module 输出，让需要的用户能直接使用。

为了方便用户使用，我还做了一个 wrapper 来封装 Web Worker 的创建、通信等工作。我一开始想到的是用 webpack 分别对真正执行 `flac` 的 .js 文件和那个 wrapper 进行打包。因为 webpack 5 支持 `new Worker(new URL('./index.js', import.meta.url))` 这种写法，而且也许 webpack 的 runtime 能解决路径的问题（虽然事后发现这个想法是不对的）。我考虑到用户能以 ES Module 的形式来使用这个库，所以对于那个 wrapper 我配置 webpack 让它输出 ES Module；真正执行 `flac` 的 .js 文件则要设置 `target` 为 `webworker`。

打包出来的虽然能用，但我觉得 webpack 打包出来的产物不干净——里面带有了 webpack 的 runtime，作为一个库不应该这样。（是的，前后矛盾了）

然后我就考虑用 Rollup。为了让 Rollup 也能像 webpack 那样识别 `new Worker(new URL('./index.js', import.meta.url))` 这种写法，我找了一些插件。我找到了 [rollup-plugin-off-main-thread](https://github.com/surma/rollup-plugin-off-main-thread)，但它有个要求：对于 Rollup 打包出来的模块化格式，只能是 `esm` 或 `amd`。如果是 `esm`，那最终还是变成了使用 Module Worker；如果是 `amd`，又不满足我对用户提供 ES Module 的要求。

经过后来的分析与思考，我发现我只需要对真正执行 `flac` 的 .js 文件打包，反而 wrapper 不用打包。wrapper 里用到了 `new URL('./index.js', import.meta.url)`，但这个让用户的构建工具处理就行。（Vite 和 webpack 5 都支持，甚至不用构建工具也能用，因为它是浏览器本身就支持的特性）

但即使只对执行 `flac` 的 .js 文件打包，它还是会在运行的时候出错。（webpack 就没有这个问题）一开始还以为是 webpack 有什么魔法能对付这种扭曲的需求，后来发现错误是 Web Worker 里运行的代码报告 "document is undefined"，这我才发现是 Rollup 没有合理处理 `import.meta.url`。（Web Worker 没有 DOM，自然不能用 `document`）

但我查阅了 Rollup 文档，没发现 Rollup 有像 webpack 那样的 `target` 选项。后来发现有个 Rollup 插件能处理 `import.meta.url`，便好奇它是怎样实现的：它只是利用了 Rollup 提供的 [`resolveImportMeta`](https://rollupjs.org/guide/en/#resolveimportmeta) 钩子——Rollup 的文档里甚至已经给出了处理 `import.meta.url` 的例子，我们只需要把例子中的 `document.baseURI` 换成 Web Worker 支持的 `self.location` 就行。

## 在本地能构建不代表在 CI 就一定行

为了方便 CI，我把整个构建过程写进了 .sh 脚本里。但当我配置好了 GitHub Actions，却遇到了编译失败。一开始以为是 GitHub Actions 里的 Emscripten 版本太低，但指定了最新版本还是不行（实际上默认就是最新版，撰写本文时是 3.1.1）；还以为是缺了什么软件包，然后参考了 FFmpeg.wasm 的构建配置和 FLAC 官方的构建配置，不过用普通的 `./configure` 和 `make` 命令能构建成功，就说明软件包没有缺失。

我猜测会不会是版本太新反而不行？我本地的 Emscripten 版本是 3.0.0，然后我开个 Docker，测试发现：3.1.1 确实会失败，而 3.0.0 可以。最后的解决办法是给 GitHub Actions 指定 Emscripten 版本为 3.0.0。

1 月 20 日 Arch Linux 软件仓库里的 Emscripten 已经是 3.1.1 了，我的系统也随之更新。结果不出我所料：编译失败。既然系统的 Emscripten 也更新了，那就看看能不能修复这个问题吧。（实在不行的话，就自己使用 `emsdk` 来安装指定版本的 Emscripten）

通过分析构建日志，我看到它似乎是在编译 examples 的时候出错的，而 FLAC 提供的 `configure` 允许我们通过指定 `--disable-examples` 来跳过对 examples 的编译。（顺便发现了有 `--disable-cpplibs` 参数，所以我也同时开启了这个参数）最后在 Emscripten 3.1.1 下，编译成功。

## 总结

不得不赞叹 Emscripten 确实强大，比隔壁 Rust 的 wasm-bindgen 和 wasm-pack 好用多了。即使 WebAssembly 不能搞 fs，但起码通过 JavaScript 模拟也构造出了基于内存的 fs。结合其它功能，我不需要对 FLAC 的源码作出一行修改就能让它在浏览器里运行。相比之下，Rust 也能编译到 WebAssembly，但限制太多。（但我仍然支持它，因为 Rust 的优势摆在面前）

这篇文章是在我基本完成 [g-plane/flac.wasm](https://github.com/g-plane/flac.wasm) 后几天才写的。因为隔了几天，我已经记不太清楚中间有部分细节和坑，所以在这篇文章里，整个过程看似很简单、轻松，实际上是非常麻烦、复杂的，遇到了很多失败的情况，然后经过无数次调试、调整才弄好。如果你在尝试的过程中遇到了一些文章中没有提到的问题，欢迎讨论。

## 相关参考

- [Emscripten 文档](https://emscripten.org/index.html)

- [高级前端进阶：我是如何把 C/C++ 代码跑在浏览器上的？](https://mp.weixin.qq.com/s/ccEjtjEyH3fRMNZQwF687w)
