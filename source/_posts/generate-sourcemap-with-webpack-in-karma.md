---
title: 在 Karma + webpack 中生成 source map
description: 为了更好地输出错误信息而折腾了好久。
date: 2018-02-14 16:42:29
tags:
  - JavaScript
  - 前端
---

## 没有 source map 的麻烦

最近在写 Blessing Skin Server v4，在编写给前端的测试的时候，我用的工具链是 Karma，然后结合 `karma-webpack` 可以在 Karma 执行测试前对文件进行 preprocess。虽然测试是没有问题，但如果测试哪里失败了，因为没有 source map，所以是难以定位问题出现的地方。

然而网上大多数教程和文章都是说安装 `karma-sourcemap-loader`，然后在 `karma.conf.js` 中 `preprocessors` 这项中添加 `sourcemap`，并在 webpack 的配置中使用 `devtool: 'inline-source-map'`。我按这种方法试了好几次，后来还按照其它的一些指导在 webpack 的配置中添加一个插件 `webpack.SourceMapDevToolPlugin`，都没有好结果。

![屏幕快照 2018-02-14 下午5.30.26.png](https://i.loli.net/2018/02/14/5a8401bb85115.png)

你让我怎么在 bundle 后的文件中的第六万行里去找错误？

## 解决

后来我在 Google 中搜索有没有解决办法。我在 `karma-webpack` 的一个 issue 中看到了一个人的回复，说建议用 `karma-source-map-support` 这个包。

那首先当然是安装它了：

```shell
yarn add --dev karma-source-map-support
```

而原来的 `karma-sourcemap-loader` 可以扔掉了：

```shell
yarn remove karma-sourcemap-loader
```

现在来配置 `karma.conf.js`。在这里，`preprocessors` 一栏保持 `['webpack']` 即可，然后在 `framework` 一项添加：`'source-map-support'`。

完整的 Karma 配置如下：

```javascript
const webpackConfig = require('../build/webpack.test.conf')

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai', 'source-map-support'],
    files: ['./index.js'],
    exclude: [],
    preprocessors: {'./index.js': ['webpack']},
    mime: {'text/x-typescript': ['ts']},
    webpack: webpackConfig,
    webpackMiddleware: {noInfo: true},
    reporters: [process.env.CI ? 'spec' : 'nyan'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    browsers: ['ChromeHeadless'],
    concurrency: Infinity
  })
}
```

另外在 webpack 的配置中要配置 `devtool` 为 `inline-source-map`，使用其它的 source map 格式可能会有问题。

## 结果

配置正确后就能成功得到 source map，顺而也就方便定位测试出错的地方。

![屏幕快照 2018-02-14 下午5.53.57.png](https://i.loli.net/2018/02/14/5a84073e30649.png)

以上。
