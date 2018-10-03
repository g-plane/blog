---
title: 为 Blessing Skin 写测试
created_at: 2017-11-25 19:21:52
categories:
  - development
tags:
  - JavaScript
  - PHP
view: post
layout: post
author: gplane
lang: en
---

## 前言

### 一点点关于 Blessing Skin Server 的感慨

#### 起源

2015 年 SkinMe 对皮肤服务进行商业化的时候，我和不少玩家一样也在苦于如何在 Minecraft 中使用皮肤而愁（那时我还是盗版用户）。在2016年寒假（也就是大概在1月）的时候，我用 Dreamweaver 基于表格的布局（是的，你没看错，连什么 Bootstrap 都不是，因为当时的我还不懂前端，甚至连“前端”这个概念都没听说过）做个页面，简单地接收并上传材质文件到后台（用 PHP 实现，代码还是结合搜索引擎写出来的）。就这样一个简单的“皮肤站”便完成了。它虽然简陋，但足够我和跟我联机的同学使用。（我把它部署在 OpenShift 上）

后来到了大概2、3月的时候，我在 mcbbs 上发现了 Blessing Skin Server。因为 SkinMe 的那个策略，mcbbs 上出现了不少皮肤站源码。当时 mcbbs 上还有人说过「一夜间，皮肤站源码成了灾」。我印象中 Blessing Skin Server 和 OneSkin 都是在那时候出现的。

不过当时我并没有去关注这项目。虽然我有使用现有 PHP 程序来搭建网站的经验（初三的时候玩过 Discuz 和 WordPress），但我没打算去部署这个程序。一来是就是我上面所说的，已经有一个够用的简陋的皮肤站；二是当时是高三，没什么时间折腾这些，也没什么时间玩 Minecraft。那时候的 Blessing Skin Server 好像是在 v1 阶段，我大概记得页面截图，网页是灰色背景。

然而后来~~也许~~是心血来潮，打算试试这个程序。那时候 Blessing Skin Server 已经完善不少，版本是 v2，同时前端的 UI 框架使用了 AdminLTE。当时我觉得这个东西挺好玩的，支持 CSL API 和 USM API 甚至是传统加载。

#### 贡献

我向 Blessing Skin Server 的仓库提了第5个 [issue](https://github.com/printempw/blessing-skin-server/issues/5)，这是我第一次向这个项目提 issue。毕竟在 SkinMe 的那种背景之下，我对皮肤这一块还是有些兴趣的（这也是我乐意为 CustomSkinLoader v14 测试的原因），而且我对这个项目也感兴趣。

当然了，后来的帮助推进 Blessing Skin Server 的 i18n 也只是纯粹的喜欢这个项目，没什么特别的。

Blessing Skin Server 的测试是在今年加入的。说实话，Blessing Skin Server 发展到了这种规模加入测试是十分有必要的。JavaScript 的测试是在今年暑假也就是7月底到8月初写的，那时候我正热衷于学习 JavaScript，为了学习 JavaScript 代码的测试，便给 Blessing Skin Server 写了 JavaScript 的测试。

完成 JavaScript 测试后，我并不打算给 PHP 部分写测试。不但不打算，而且还想，PHP 部分的代码量和复杂度超出 JavaScript 部分很多，而且我对 PHP 的生态并不了解，我是坚决不为 PHP 部分写测试的。

然而到了10月，内心一种莫名奇妙的冲动让我想学 PHP 的测试（真的，我也不知道为什么会有这样的冲动）。这样，我就拿 Blessing Skin Server 当作我的试验项目。原因很简单：我自己没有现成的项目，刚好 Blessing Skin Server 缺少 PHP 的测试。

#### 现状

如今 Blessing Skin Server 是一个工程上相当完善的项目了，包括测试、持续集成、测试覆盖检查。

相比最初的只有简单的 HTML 和 PHP，到使用 AdminLTE，到使用621自己写的框架（v3.0时代，现在只存在于 Blessing Skin Server 的 commit 记录中），到使用 Laravel（v3.1直到现在），再到前端工程化。不得不感叹，Blessing Skin Server 确实发展了不少啊。

### 工程上

目前 Blessing Skin Server 使用 Travis CI 进行持续集成。

测试方面，JavaScript 部分使用的测试框架是 Jest，PHP 部分使用的测试框架是 Laravel 官方推荐的 PHPUnit（不过我个人更喜欢 BDD 风格）。

Travis CI 上每次构建都会进行测试。其中 PHP 部分会分别进行 PHP 5.5 至 PHP 7.1 的测试（PHP 7.2 不兼容，原因是 Laravel 5.2 中的一些类以及 PHPUnit 4 中的一些类未实现 PHP 的 `Countable` 接口，而 PHP 7.2 中 `count` 或 `sizeof` 等函数的参数变量必须实现 `Countable` 接口）。而 JavaScript 部分则除了进行测试，还会使用 ESLint 进行静态检查。

测试完如果通过，会将测试覆盖报告发送到 codecov.io。

~~其实啊，搞那么多，只是为了在每次 commit 中显示绿色小勾，然后在 README 中加个 badge 而已。~~

接下来我会分测试 JavaScript 代码、测试 PHP 代码、CI 配置三部分进行阐述。

## 测试 JavaScript 代码

前面提到，JavaScript 部分所使用的测试框架是 Jest。Jest 内部使用 Jasmine，同时集成了 istanbul（生成测试覆盖报告）、JSDom（在 Node.js 中模拟浏览器的表现）等工具。

> 本篇文章并不会介绍如何使用 Jest，关于 Jest 的用法您可以参考官方文档。

### 导出 JavaScript 代码

目前 Blessing Skin Server 在 JavaScript 上并未使用模块化的构建工作流，也就是说，Blessing Skin Server 使用 gulp 来简单合并并压缩 JavaScript 代码，所有的函数都挂载在 `window` 全局变量上。这在浏览器上是没有问题的。

但在 Node.js 上，当我们使用 `require` 来导入 JavaScript 代码的时候（也就是 CommonJS），Node.js 其实是对你要导入的代码包装在一个 JavaScript 函数里。这种情况下，Blessing Skin Server 所定义的函数的作用域也就仅仅在那个函数中，外部是无法调用的。

既然这样，那我们按照 CommonJS 的方式去导出这些代码不就可以吗？当然可以，但是不要忘了，这些代码最终是被直接 concat 成一个文件放在浏览器上运行的，没有经过 webpack 或 Rollup 等工具进行模块化处理。因此，如果你在代码中直接调用 `module.exports`，放在浏览器中必然会报错。

所以我们可以像 UMD 那样对宿主环境进行判断，如果当前环境 `require` 不为 `undefined` 并且 `module` 也不为 `undefined`，那么我们可以认为当前环境支持 CommonJS，然后进行代码导出。

```javascript
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    module.exports = {
        changeEmail,
        deleteAccount,
        changeNickName,
        changePassword,
    };
}
```

`typeof` 是操作符，它可以安全地对变量进行类型检测，不会因为变量是 `undefined` 而报错。

接下来，我们就可以放心地在 Jest 中导入这些代码，同时浏览器不受影响。

*2017年12月28日更新：*

为了减少最终生成的 JavaScript 代码体积，判断条件不再是检测 CommonJS，而是直接检查 `NODE_ENV` 是否为 `test`：

```javascript
if (process.env.NODE_ENV === 'test') {
    module.exports = submitColor;
}
```

这样做是因为在测试的时候，Jest 会将 `NODE_ENV` 设为 `test`，另外再配合 Babel 插件 `transform-inline-environment-variables`，在 build 的时候这个 if 语句的条件必定为 false，`gulp-uglify` 就能将这段代码去掉。

### 模拟浏览器环境

Jest 在默认配置下会在测试环境中添加 `window` 作为全局变量（注意测试环境下仍然是 `global` 为真正的总的全局变量，`window` 只是挂载在 `global` 上而已）。Jest 内部使用 JSDom 来模拟浏览器，要注意的是，JSDom 只是模拟浏览器的行为和表现，并不是一个 headless 浏览器。

Blessing Skin Server 使用了 jQuery 进行 DOM 操作以及事件处理。那么我们在测试中可以像平时在浏览器上那样，把 jQuery 挂载在全局变量上。

```javascript
const $ = require('jquery');
window.$ = window.jQuery = $;
```

那么在测试中如何模拟网页的 DOM 结构呢？直接向 `document.body.innerHTML` 赋值即可，如：

```javascript
document.body.innerHTML = `
    <div id="closet-container"></div>
    <div id="skin-category" value="val"></div>
`;
```

这时候无论是在测试代码中还是源代码中，使用 `$` 来读取或操作 DOM 都是可以的。

### mock 其它无关的函数

由于 Blessing Skin Server 的 几乎所有 JavaScript 都直接放在全局变量中，因此不需要 `import` 就能直接使用这些函数。那么在测试的时候，我们应该使用 Jest 提供的 mock 功能来 mock 这些函数。

例如，在不少函数中都调用了 `url` 和 `fetch` 这个函数。那么我们可以：

```javascript
const fetch = jest.fn()
    .mockReturnValueOnce(Promise.resolve({ errno: 0, msg: 'success' }))
    .mockReturnValueOnce(Promise.resolve({ errno: 1, msg: 'warning' }))
    .mockReturnValueOnce(Promise.reject());
const trans = jest.fn(key => key);
const url = jest.fn(path => path);
window.fetch = fetch;
window.trans = trans;
window.url = url;
```

**要注意的是，对于同一个 mock 函数，不能同时使用 `mockImplementationOnce` 和 `mockReturnValueOnce`，只能选其中一个。**

然后就可以轻松地进行函数调用断言：

```javascript
expect(fetch).toBeCalledWith({/* options */})
```

### 异步

Blessing Skin Server 中普遍使用 AJAX，并用一个叫 `fetch` 的函数对 `$.ajax` 进行封装（覆盖了浏览器原生的 `fetch` 函数）。

由于 `$.ajax` 返回的是 thenable 对象，因此 `fetch` 的封装工作就是直接返回 `Promise` 对象。（直接 `return Promise.resolve($.ajax(/* ... */))`）

ES2017 中加入了 async/await，这让异步代码变得更加优雅。而 Blessing Skin Server 在 3.3.2 之前使用的是 Promise 链。

最初我为 Blessing Skin Server 写 JavaScript 测试的时候，一方面由于 Blessing Skin Server 使用的是 Promise 链式调用，一方面可能是因为 Jest 的一个 bug，对于 Promise 链的第二个 `then` 及其之后的代码不能被执行（`catch` 块也是）。这算是 Jest 的一个坑吧，我不知道现在 Jest 有没有发现并处理这个问题。这里特别记录一下。

11月的时候，我给 Blessing Skin Server 的 JavaScript 使用了 `async/await`，而测试代码那边一直是使用 `async/await`（这就要求 Node.js 版本必须不低于 7.6.0）。这样一来，之前那个部分代码无法执行的问题顺带地解决了。

这里扯点题外话。为什么在最初写 JavaScript 测试的时候不为原来的 Blessing Skin Server 代码使用 async/await 呢？我们知道， Blessing Skin Server 使用 Babel 进行 JavaScript 转译。对于 async/await 这一部分，Babel 使用的是 regenerator 来实现相应的功能，而 regenerator 并不是 Babel 的一部分，它是一个外部模块。默认情况下，Babel 对于我们写的 JavaScript 代码会进行 CommonJS 的模块化处理。因此，当我们在使用 async/await 并用 Babel 转译之后，生成的代码会包含 `require('regenerator-runtime')`。当时我并不知道可以在 Babel 的配置中将模块化关闭（`"module": false` 即可），就觉得，总不能因为使用 async/await 而产生的 `require`，从而将构建流改为 webpack 吧？因此就没有使用 async/await。直到后来我得知可以将 Babel 的模块化行为关闭，并且 regenerator-runtime 是个 UMD 模块，从而能在 Blessing Skin Server 中使用 async/await。

## 测试 PHP 代码

> 本篇文章并不会介绍如何使用 PHPUnit，关于 PHPUnit 的用法您可以参考官方文档。

### 前言

Laravel 为测试提供了许多方便、流畅的 API。当然了，我还是觉得，要是 Blessing Skin Server 使用的是 Laravel 5.4+ 那有多好啊，可以少写不少的 mock 代码。

对于 Blessing Skin Server 而言，很多重要的代码都是在控制器里。因此，写好这一部分的测试是十分重要的。当然了，目前所有的控制器都做到了 100% 的测试覆盖。

### 要测试什么？怎样测？

回答这个问题很简单，要测试的无非就是发送一些 HTTP 请求，然后让 Blessing Skin Server 执行代码，最后验证返回的结果，以及有没有产生相应的行为（如修改数据库、写入文件等）。

得益于 Blessing Skin Server 普遍使用了 AJAX，并且数据交换格式是 JSON，我们可以很方便地通过使用 GET 或 POST 等方法，发送一些请求，接着利用 Laravel 提供的 `seeJson` 方法验证返回的 JSON 响应。对于 `OptionForm` 部分，这一部分没有使用 AJAX，而是传统的表单提交，也很好处理。Laravel 也提供一些 API 让我们不需要浏览器就能跟这些表单进行交互（前提是这些表单的 HTML 必须是提前用 Blade 写的，通过 JavaScript 生成的是不行的，因为没有浏览器环境）。

### 一些准备工作

#### Eloquent 模型

目前 Blessing Skin Server 中包含了三个基于 Eloquent 的模型，分别是 `Player`、`User` 和 `Texture`（`Closet` 不是基于 Eloquent 的）。Laravel 中有一个帮助函数 `factory`，可以生成这些模型的实例。我们可以利用这个函数来生成模型实例，并用于测试中。

#### 文件读写

Laravel 使用了 Flysystem 包用于读写文件。这是一个提供抽象 API 的文件读写库，能够使用不同的适配器来对不同的文件系统进行读写（如本地磁盘或 Amazon S3），而上层的 API 不变。Flysystem 官方有一个 `memory` 适配器，这个适配器可以将读写操作放在内存中。这为测试带来便利，可以让我们不需要真正地对硬盘进行读写。

然而上面的做法对已经在 `config/filesystem.php` 中已经定义好的磁盘来说，没有问题。但对于使用 PHP 原生的文件操作函数，如 `filesize` 这些，就不起作用了。这时需要用到另外一个库，`vfsStream`。`vfsStream` 的用法可以参考官方文档，这里不作介绍。

### 避免直接使用超全局变量

Laravel 为 HTTP 请求做了一层封装，这就是 `Request` 类。在控制器中可以通过依赖注入来获取 `Request` 实例，而在其它地方，则可以通过全局的帮助函数 `request` 来获取实例。

Blessing Skin Server 中绝大多数地方使用了 `Request` 类，但由于当初代码迁移升级，有少数地方直接通过 `$_GET` 或 `$_POST` 等超全局变量来获取请求参数。

在实际的应用中，这没什么问题。但在测试中，由于并不会真的发送 HTTP 请求，所以直接读取超全局变量是不可取的。

不过 Blessing Skin Server 中，有一个在 `Utils` 类中的静态函数读取了 `$_SERVER` 超全局变量，这个函数是 `getClientIp` 函数。这个是比较特殊的，因此我在 `TestCase` 类中直接向 `$_SERVER` 赋值，确保测试顺利进行。

### 测试文件上传

Blessing Skin Server 中包含处理文件上传的代码。它会对用户上传的材质文件进行检查。例如检查上传是否出错；检查文件格式是否为 PNG（通过 MIME 来判断）；检查文件大小是否超过设置中的要求；检查材质文件的尺寸是否符合要求。

最开始我觉得检查上传是否出错这个有些不太可能，因为错误不可能轻易发生。不过好在 Laravel 有一个专门处理文件上传的类，`UploadedFile`，它是对 Symfony 的 `UploadedFile` 进行一层包装，并且在 Symfony 下的方法在 Laravel 中都可以使用。

首先是构造一个 `UploadedFile` 实例。`UploadedFile` 的构造函数有几个函数，其中最后一个参数的签名是 `test`，类型是 bool。从名字和类型我们不难判断出通过这个参数，我们可以告诉 Symfony 这是个测试用途的文件，并不是一个真正的文件。将这个参数设为 `true` 之后，另一个参数 `size` 就可以直接指定，因为这是在测试状态。

同样，在测试状态我们可以手动指定一个错误。我们可以在 `UploadedFile` 的构造函数的 `error` 函数里指定一个我们想模拟的错误，这个值跟 PHP 原生的 `UPLOAD_ERR_xx` 相同。

此时我们得到了一个 `UploadedFile` 实例，但这个实例不能直接用在 `post` 方法的 `data` 参数中。我们需要调用一个较为底层的函数，`call`，它的第5个参数 `files` 就用于提交文件，其参数类型是数组，我们可以在这个参数里放入刚刚的 `UploadedFile` 实例。

至于让我们的假的上传文件能让控制器判断是否符合尺寸要求，可以提交一个由 GD 生成的 PNG 文件。用 GD 保存文件的时候，利用前面提到的 vfsStream，可以不需要真实地向硬盘写入文件。

### 测试 `PluginController`

这部分的测试离不开插件。然而 Blessing Skin Server 源码本身是不带任何插件的。因此我们需要在测试前提前把插件下载好并解压在 plugins 目录。

然而可能是因为 ZipArchive 不够完善，我们不能将下载的插件压缩包放在 VFS 中（就是前面的 vfsStream），只能放在真实磁盘中。

### Mock

Laravel 的 Facade 为 mock 带来了很大的便利性，它内部使用了 Mockery 库。因此按照 Mockery 的用法来使用就行。

这里有个比较麻烦的 mock，就是“忘记密码”并发送带有链接的邮件那一段代码。Blessing Skin Server 调用的是 `Mail::send`，其中有个参数是一个闭包。闭包是不能直接通过对参数进行断言来判断的，因为它不是一个简单值（primitive type）。

StackOverflow 上有人给出了解决方案。先放出代码：

```php
Mail::shouldReceive('send')
	->once()
	->with(
		'auth.mail',
		\Mockery::on(function ($actual) use ($url) {
			$this->assertEquals(0, stristr($url, $actual['reset_url']));
			return true;
		}),
		\Mockery::on(function (\Closure $closure) use ($user) {
			$mock = \Mockery::mock(Illuminate\Mail\Message::class);

			$mock->shouldReceive('from')
				->once()
				->with(option('mail.username'), option('site_name'));

			$mock->shouldReceive('to')
				->once()
				->with($user->email)
				->andReturnSelf();

			$mock->shouldReceive('subject')
				->once()
				->with(trans('auth.mail.title', ['sitename' => option('site_name')]));
			$closure($mock);
			return true;
		})
);
```

`with` 函数是检查被 mock 的函数在被调用的时候，传入的参数是否正确。由上面可以看出，`with` 函数除了能接收字面量作为参数，还可以接收 `Mockery::on` 的结果。`Mockery::on` 接收一个闭包，并且这个闭包应该返回 `true` 或 `false`，表示测试的结果是否正确，而这个闭包所做的工作，就是做一些断言。

## 持续集成

### 构建与测试

作为一个 PHP 应用，应该测试在不同的 PHP 版本下测试是否都能通过；而 JavaScript 代码则因为最终只是在浏览器中运行，因此测试环境不需要多版本的 Node.js，这里选择了 Node 8。

那如何进行不同版本的测试呢？Travis CI 中有 matrix 的功能（翻译过来就是矩阵），我们可以利用这个功能配置不同的环境进行测试。

matrix 中各项单独的配置会覆盖根级别的配置，所以我们能把 JavaScript 的测试写在 matrix 的一个项里。测试过程除了运行 Jest，还运行 ESLint 的检查，ESLint 检查不通过，那么整个 CI 也将 fail。

对于 PHP 部分可没那么简单。首先要开启数据库服务器，然后创建一个数据库供测试使用。

```yaml
before_script:
- mysql -e 'CREATE DATABASE IF NOT EXISTS test;'
```

同时要指定环境变量 `APP_ENV` 的值为 `testing`，以告诉 Laravel 当前处于测试状态，当然在 phpunit.xml 中指定也是可以的。

### 上传代码测试覆盖报告

除了进行测试，检查测试的覆盖情况也是很重要的，这里我选择了 Codecov。PHP 部分相对简单，只需要告诉 PHPUnit 要生成测试覆盖报告然后执行由 Codecov 提供的 shell 脚本即可提交报告。注意如果在自己的电脑上生成测试覆盖报告，必须为 PHP 安装并开启 XDebug 扩展（Travis CI 已经开启）。JavaScript 这边则要增加一个依赖——由 Codecov 提供的 npm 包，用于上传测试覆盖报告。

## 总结

好像也没什么好总结的。

小小吐槽一下自己，这个文件是2017年11月25日创建的，也是在那时开始写的，没想到一直拖到现在（2017年12月30日）才完成。也在这里祝各位元旦快乐吧！
