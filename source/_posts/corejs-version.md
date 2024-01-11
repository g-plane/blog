---
title: core-js 版本问题
date: 2023-12-14 18:17:05
tags:
  - JavaScript
---

Babel 和 SWC 都有 core-js 相关的选项，用于精确控制要注入的 polyfill。对于 Babel，它在 `@babel/preset-env` 的选项下[^1]；对于 SWC，它在配置文件的 `env.coreJs` 下[^2]。

不管是 Babel 还是 SWC，这个字段允许一个类型为数字和字符串的值，用于表示版本。如果是字符串，可以指定具体的版本，比如 `"3.34"`，这没什么问题。

但如果指定的是数字，比如 `2` 或 `3`，以及没有具体版本的字符串，比如 `"2"` 或 `"3"`，这时 core-js 的版本解析将是反直觉的：它指定的不是最新版本（比如本文撰写时最新是 3.34.0），而是 3.0.0。

这会导致一些新的 polyfill 不被会注入到代码中。以 `Object.hasOwn` 为例，它的 polyfill 是在 core-js [3.17.0 版本](https://github.com/zloirock/core-js/releases/tag/v3.17.0) 中稳定的。如果我们在项目中给这个 core-js 选项指定了 `3` 或 `"3"`，那么将不包含这个 polyfill，从而导致出现意外。

由于 Babel 的 REPL 不允许以 JSON 方式任意修改 Babel 的配置，所以下面将以 SWC 为例。但这个行为对于 Babel 和 SWC 都是一样，也就是两边都存在这个问题：
- 指定为 `3` 时，输出代码不包含 polyfill 的 import 语句：[playground](https://play.swc.rs/?version=1.3.100&code=H4sIAAAAAAAAA%2FNPykpNLtHLSCz2L8%2FTSNRRSNIEAOaMeYsTAAAA&config=H4sIAAAAAAAAA1WOzQqDMBCE7z5F2HMvUuihj1DoQ4S4hoj5YTeWivjuTaKxest%2BM5mZpRECBlbwFEt6piNIYqTjToRnF%2BU3EUBlJSsyIcKtqgNnqZcjY0HrpsDoPWNVdmaNM%2F18zlbeBkLmqzFbpdMjXpObPR2s76Yi7pvjHLDs4wf8TbXsCAbD7%2Foz0rQxdJ9TkCSNMa8Bg6JtoQ73XSmYWGqsUHnCV%2Fbec2ez%2FgAq0882TAEAAA%3D%3D)；
- 指定为 `"3.16"` 时，这个版本的 core-js 未稳定 `Object.hasOwn` 的 polyfill，所以还是没有它的 polyfill：[playground](https://play.swc.rs/?version=1.3.100&code=H4sIAAAAAAAAA%2FNPykpNLtHLSCz2L8%2FTSNRRSNIEAOaMeYsTAAAA&config=H4sIAAAAAAAAA1WOzQqDMBCE7z5F2HMpSKGHPkKhD7Gkq0TMD7uxVMR3b4zG6i37zWRmpkop6ETDQ03pmY6ALMT7nYiMLuI3ESBtUTSbEOFS1E4WqcFeKKN5VaD3XqgoG7PGmWY8ZmtvA5PI2bhY0bU9nZOrLR2sfw9Z3DbHMVDeJ3f4m0rZHgxGXuVn5GFl5D6HIOSW4rIGDKm6hjLcv3PBINhSgdozPbP3dq3X4mr%2BAUcutnxRAQAA)；
- 指定为 `"3.17"` 时就有它的 polyfill 了：[playground](https://play.swc.rs/?version=1.3.100&code=H4sIAAAAAAAAA%2FNPykpNLtHLSCz2L8%2FTSNRRSNIEAOaMeYsTAAAA&config=H4sIAAAAAAAAA1WOXQqDMBCE3z1F2OdSkEILPUKhh1jiKhHzQzaWBvHujdFYfct%2BM5mZqRICepbwFFN6psOhZ%2FL7nQhHE%2FCbCJDUyNIrF%2BBS1J4XqcWBKaN5VWCwlqkoG9PKqDYes6XVzhPz2bhY0XQDnZOrLR20bcYsbptDdJT38R3%2BplK2B4Pid%2FkZ%2FLgyMp9DEPqOwrIGFIm6hjLcNrlgZOyoQGk9vbL3dq0fubiaf9kuHLBRAQAA)。

实际上，Babel 和 SWC 的文档都明确建议这个选项指定 semver-minor 以避免这个问题。

[^1]: [Babel 文档](https://babel.dev/docs/babel-preset-env#corejs)
[^2]: [SWC 文档](https://swc.rs/docs/configuration/supported-browsers#corejs)
