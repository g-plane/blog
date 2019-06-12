---
title: 关于 yarn.lock 和 package-lock.json
date: 2018-06-22 22:46:16
tags:
  - JavaScript
---

## 什么是锁？

如果你在用 Yarn 或 npm 5 及以上，你会发现你的工程目录除了有 `package.json` 文件，还有另外一个非常大的（有几百 KB）文件。Yarn 生成的是 `yarn.lock`，npm 生成的是 `package-lock.json`。

这两个文件的作用类似，就是将你当前工程中的依赖关系作一个详细的记录。当然了，既然叫“锁”，就不仅仅是记录依赖关系那么简单——它还记录了依赖的 *确切* 版本，而不是像 `package.json` 那样以语义化版本的格式来记录。

为什么要记录依赖的确切版本？这是为了保证能得到相同依赖安装过程。npm 以前有个问题叫「版本漂移」，指的就是因为语义化版本导致不同的人或不同的计算机上安装的依赖的版本有差异，导致项目无法运行。（虽然版本漂移是个不好的事情，但我不反对没有锁，理由后面讲）

## 记录了哪些信息？

### 依赖的包的 URL

lock 文件会记录每个依赖的包是从哪个 URL 下载的，这样包管理器就能在下次安装依赖时直接按照记录来下载。不过，在 Yarn 2.0 中，registry 信息将会从 lock 文件移除，也就是说，相同的 lock 文件，如果使用了不同的 registry，将会从不同的来源下载依赖。

### hash 校验值

这个校验值并不是由包管理器计算得出的，而是由 registry 提供。但包管理器会根据 registry 提供的 hash 与下载回来得到的包的 hash 进行对比，以确认下载是否正确。

### 依赖的确切版本

必须是确切版本，如果是用语义化版本就没有意义了。

### 依赖的依赖及其版本

这里的依赖仅仅是 `dependencies`（也就是没有依赖的 `devDependencies` 和 `peerDenpendencies` 这些）。当然了，还要记录这些依赖的版本，不过这里会记录语义化版本。

你也许问，既然记录了依赖的依赖，那么还要记录依赖的依赖的如 URL 等详细信息吗？当然要，不过 Yarn 和 npm 的做法有点不同。

## 解读 `yarn.lock`

Yarn 用的是自己设计的格式，语法上有点像 YAML（Yarn 2.0 中将会采用标准的 YAML）。`#` 开头的行是注释。

### lockfile 版本

每个 `yarn.lock` 的第二行都是 `# yarn lockfile v1`。这表明是第一版的 lockfile。记录版本是为了便于以后更新 lockfile 的语法或语义。以后一旦更新了 lockfile，就增加版本号，而 Yarn 就可以根据不同的版本做出不同的动作，从而保证向后的兼容性。

### 字段解读

`yarn.lock` 文件下列出了所有的包信息，并按字母排序。我随便找一个包作解释。例如：

```yaml
boom@5.x.x:
  version "5.2.0"
  resolved "https://registry.yarnpkg.com/boom/-/boom-5.2.0.tgz#5dd9da6ee3a5f302077436290cb717d3f4a54e02"
  dependencies:
    hoek "4.x.x"
```

第一行记录了包的名称及其语义化版本（由 `package.json` 定义）。

接下来的都做了缩进，表示这些是该包的信息。

`version` 字段记录了包的确切版本。

`resolved` 字段记录了包的 URL。此外，hash 中的值是 `shasum`。Yarn 记录的这个 `shasum` 来自于包的 `versions[:version].dist.shasum`（手动访问 `https://registry.npmjs.org/:package` 会得到一个 JSON，解析此 JSON 可得）

`dependencies` 记录了包的依赖。也许包的依赖还有依赖，但不会在这里记录。

### 提升

你会发现，有很多包你是没有直接依赖它们的，但它们都出现在了 `yarn.lock` 中的顶层。这就是提升，它有两个意义：

#### 记录依赖的依赖

正如上面所述，依赖的依赖不会被直接记录在依赖的信息下——它们会被提升，这样可以简化整个 `yarn.lock`，到时安装依赖的时候处理也变得简单，因为你不必一层一层的嵌套下去来查找依赖的依赖的信息。

#### 便于解决依赖版本冲突

依赖版本冲突是难免的，当然有时候并不是版本冲突，而只是语义化版本格式的版本记录不同。举个例子，`^5.0.0` 与 `5.x.x` 在很多时候并不矛盾，因此信息可以被合并。如：

```yaml
chalk@^2.0.0, chalk@^2.0.1:
  version "2.3.2"
  resolved "https://registry.yarnpkg.com/chalk/-/chalk-2.3.2.tgz#250dc96b07491bfd601e648d66ddf5f60c7a5c65"
  dependencies:
    ansi-styles "^3.2.1"
    escape-string-regexp "^1.0.5"
    supports-color "^5.3.0"
```

注意第一行，`yarn.lock` 记录了 `^2.0.0` 和 `^2.0.1`，而在添加 `chalk` 这个依赖的时候，符合语义化版本的最新版本是 `2.3.2`（`version` 字段），这个版本对于 `^2.0.0` 和 `^2.0.1` 这两个要求来说，都满足了，因此信息可以合并。

## 解读 `package-lock.json`

npm 5 的初期，曾因为 `package-lock.json` 和 `package.json` 一些矛盾行为而引起一些热议，不过现在被解决了。

与 `yarn.lock` 不一样，`package-lock.json` 采用的格式是 JSON。

### 字段解读

`package-lock.json` 与 `yarn.lock` 相比，`package-lock.json` 多了一些字段，不过我个人认为有些是多余的。

> 我一般是用 Yarn 的，因此对 npm 了解不多，有些还参考了官方文档。如果我哪里表述有误，欢迎指出。

`name` 和 `version` 字段记录的是你的工程名和版本，跟 `package.json` 一样，所以我觉得这是多余的。

`lockfileVersion` 是 lockfile 版本，作用跟 `yarn.lock` 那里一样。

`requires` 字段在文档中并没有提到，我也不清楚它的含义。

`dependencies` 记录了所有的依赖。不过，对于依赖下的字段，与 Yarn 有不同。例如：

```json
{
  "version": "2.0.0",
  "resolved": "http://registry.npmjs.org/@sinonjs/formatio/-/formatio-2.0.0.tgz",
  "integrity": "sha512-ls6CAMA6/5gG+O/IdsBcblvnd8qcO/l1TYoNeAzp3wcISOxlPXQEus0mLcdwazEkWjaBdaJ3TaxmNgCLWwvWzg==",
  "dev": true,
  "requires": {
    "samsam": "1.3.0"
  }
}
```

1. 它不像 Yarn 记录了语义化版本，而是直接记录了确切版本。

2. `resolved` 字段仅仅记录了 URL，而 hash 值用另一个字段 `integrity` 来记录（Yarn 记录在 URL 中的 hash 部分）

3. npm 用的是包中的 `integrity` 字段。（详见 [npm 文档](https://docs.npmjs.com/files/package-lock.json#integrity)）

4. `dev` 字段记录此依赖是否为开发依赖（即 `devDependencies`）

### 提升

`package-lock.json` 同样有提升。

### 处理依赖的依赖

`package-lock.json` 中有些依赖的依赖并不会被提升，不过我并不是很了解 npm，更没阅读过源码。知道的朋友欢迎指出。

## 我对锁的一些看法

### 为什么会有锁？

其实在 npm 5 以前，npm 是没有锁这个功能的，也就是不会产生 `package-lock.json`。不过，npm 有类似的功能，这个命令是 `npm shrinkwrap`，执行这个命令会产生 `npm-shrinkwrap.json`。

为什么 npm 不像现在这样直接整合进 `npm install` 里呢？我觉得，这是 npm 的有意行为。我们知道，`package.json` 中记录的是依赖的语义化版本。基于此，npm 的想法是让我们在语义化版本限制下，可以放心地安装最新版本的依赖，以便获得依赖的 bug 修复等。而确切记录版本是个不太需要的功能，因此单独放在一个命令里。

但是，「版本漂移」问题的出现，以及 npm 生态繁荣导致出现了不少低质量的 npm 包，使得这个行为在一定程度上成为缺点。

不过，我个人不反对 npm 当初的这种做法。因为语义化版本本身就是一种约束。而问题就出在了有部分包的作者没有遵守这个约束，这自然会出问题。

2016 年下半年，Facebook 发布了 Yarn。当时的 Yarn 与 npm 相比有很多突出的不同，其中一点就是加入锁，其目的就是为了避免版本漂移这个问题。随着 Yarn 的日益流行以及社区的一些呼声，npm 5 也加入锁。

### 我是否应该用锁？

这完全取决于你的意愿或团队要求。

#### 不使用锁

现在有不少项目依然不使用锁的，如 ESLint。但是，如果你不打算使用锁，首先要确保你有覆盖率足够的测试（事实上即使使用锁也应该这样），这样一旦升级依赖后，如果有问题就可以通过测试中反映出来。

另外，我建议是直接关闭 npm 的锁功能，而不是将 `package-lock.json` 或 `yarn.lock` 加到  `.gitignore` 中。例如，对于 npm，可以在项目的根目录中添加一个 `.npmrc` 文件：

```ini
package-lock=false
```

#### 使用锁

使用锁的优点就是你的依赖版本是确定的，这就能保证你的代码能在基于该版本的依赖下工作。不过，我建议应该定期或不定期地更新依赖，因此当前版本依赖很有可能存在 bug，当然了，别忘了像我前面所说的，保证足够的测试。

## 一点点广告

根据 Yarn 一个 issue：[Deprecating registry.yarnpkg.com](https://github.com/yarnpkg/yarn/issues/5891)，我建议将 Yarn 中的默认 registry 换成 npm 官方的。对于现有项目，可以使用我写的模块 [convert-registry](https://github.com/g-plane/convert-registry) 做转换。

全文完。
