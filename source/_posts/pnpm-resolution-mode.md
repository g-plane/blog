---
title: pnpm 的 resolution-mode 配置
date: 2023-12-15 16:14:58
tags:
  - 前端
---

pnpm 有一个名为 resolution-mode 的配置项[^1]（在 `.npmrc` 文件中配置），但无论是 resolution-mode 这个名字还是配置项的值的名字，都相当的不直观，更不方便记忆。

## 背景

resolution-mode 影响的是 pnpm 的版本解析。适当的配置可以减少子依赖所带来的供应链攻击，并且在缓存的作用下可以加快安装速度。但请不要看到「安全」「快速」就盲目配置这个选项——阅读完下面的内容，并明确自己的意图再去动这个配置。

## 解释

在解释之前，先做一些约定：

1. 不管在不同模式下，版本解析会有怎样的不同，它们都遵循语义化版本。这是大前提。
2. 下文的「子依赖」表示的是依赖的依赖，也可以被称为「间接依赖」。

目前 resolution-mode 允许设为下面三个值之一：

- highest（当前的默认值）这个模式下所有依赖（包括项目的直接依赖以及子依赖）都会被解析到最新版本；
- time-based 这个模式下项目的直接依赖会被解析到最老版本，而子依赖则会被解析到该直接依赖发布时间之前的最新版本；
- lowest-direct 这个模式下仅仅是项目的直接依赖会被解析到最老版本，子依赖会被解析到最新版本。

## 举例

下面以这样的一个项目为例子：（测试时所使用的 pnpm 版本为 8.11.0）

```json
{
  "dependencies": {
    "ora": "^6.2.0"
  }
}
```

ora 库[^2]有多个依赖，但我们在这里只需要关注 ora 本身以及它的其中一个依赖 chalk[^3] 的版本，并通过 pnpm 生成的 lock file 来得知它们被解析到哪个版本。

- 当 resolution-mode 设为 highest 时：ora 的版本被解析为 6.3.1，chalk 的版本被解析为 5.3.0。两个库都被解析到最新版本。
- 当 resolution-mode 设为 time-based 时：ora 的版本被解析为 6.2.0，chalk 的版本被解析为 5.2.0。ora 能满足语义化版本的最老版本是 6.2.0，而 ora 6.2.0 的发布时间为 2023/3/19 18:13:22，在此时间之前 chalk 最新版本是 5.2.0。（尽管 ora 的 package.json 文件里声明的是 "chalk": "^5.0.0"）
- 当 resolution-mode 设为 lowest-direct 时：ora 的版本被解析为 6.2.0，chalk 的版本被解析为 5.3.0。可以看到即使 ora 作为项目的直接依赖被解析为 6.2.0，但它的依赖 chalk 被解析到最新版本即 5.3.0。

[^1]: [pnpm 关于 resolution-mode 的文档](https://pnpm.io/npmrc#resolution-mode)

[^2]: [ora 的所有版本](https://www.npmjs.com/package/ora?activeTab=versions)

[^3]: [chalk 的所有版本](https://www.npmjs.com/package/chalk?activeTab=versions)
