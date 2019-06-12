---
title: 解决 Travis CI 中 Chrome 找不到的办法
tags:
  - JavaScript
  - 前端
date: 2017-05-07 11:25:01
---

## 前言

我决定在我的 `blessing-trans` 项目中使用 Karma（是的，我要抛弃 `node-qunit-phantomjs` 了），当我在我本地执行 `karma start` 的时候，是完全没有问题的，能够自动启动 Chrome。但是当我推送到 Github 并让 CI 进行构建的时候，测试失败，提示是找不到 Chrome。

我很想当然地往 `.travis.yml` 中添加 `addons`，在里面加入 `chrome: latest`，但是依然失败。随后我在别人的一个仓库中，发现他的 `.travis.yml` 是 `google-chrome: latest` ……我无语。

但还是不行啊，我搜索了一下，发现这不能这么简单。

在 Travis CI 中使用 Chrome 要关闭沙箱（至于原因，我也不清楚）。因此，除了要对 `.travis.yml` 作改动，还要对 `karma.conf.js` 作改动。

## .travis.yml

首先要把 `.travis.yml` 弄成这样的。

```yaml
before_install:
  - export CHROME_BIN=chromium-browser
  - export DISPLAY=:99.0
  - sh -e /etc/init.d/xvfb start
```

其中 `CHROME_BIN` 就是指定 Chrome 位置的环境变量。

## karma.conf.js

而 `karma.conf.js` 这里因为不仅要在 Travis CI 中使用，我们本地做测试也是需要的，因此里面的配置不能写死，要根据当前的环境作一些判断。

首先在文件最顶部加入：

```javascript
let browsers = ['Chrome'];

if (process.env.TRAVIS) {
  browsers = ['Chrome_travis_ci'];
}
```

事实并不存在 `Chrome_travis_ci` 这样的浏览器，这只是我们自定义的，所以要在 `config.set()` 中添加：

```javascript
browsers: browsers,

customLaunchers: {
  Chrome_travis_ci: {
    base: 'Chrome',
    flags: ['--no-sandbox']
  }
},
```

可以看到，我们添加“禁用沙箱”的标记，不添加是不能运行的。

参考来源：

[解决 travis ci 中 chrome 找不到的办法](https://juejin.im/entry/58d4abf0b123db3f6b632f3a)
