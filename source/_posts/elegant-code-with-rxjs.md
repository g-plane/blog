---
title: 用 RxJS 编写优雅代码
description: 当然这个玩得有点过火了。
date: 2019-12-04 17:30:50
tags:
  - JavaScript
---

## 场景

最近给 [Blessing Skin Server](https://github.com/bs-community/blessing-skin-server) 升级到了 AdminLTE v3。新的 AdminLTE 提供了更多的配色供我们选择，因此 BS 里原来的「更改配色」那里就要进行改造，以便让用户也能使用更多的配色。

这里先说明一下，新的配色设置可以分别修改顶部导航栏（以下简称「导航栏」）和左侧边栏（以下简称「侧栏」）的颜色，而不是像以前那样只能一起修改。当用户点击设置面板里的不同按钮时，页面会相应地更改配色以便让用户预览效果。

面板的 UI 是这样的：

![Snipaste_2019-12-05_10-30-35.png](https://i.loli.net/2019/12/05/hO7XGSA9ysHuTLQ.png)

### 导航栏

AdminLTE v3 的导航栏有一点比较特别，那就是要根据不同的背景颜色给导航栏设置亮色模式或暗色模式。例如，当背景颜色偏亮时，就要给导航栏添加一个名为 `navbar-light` 的 CSS 类；反过来就要添加 `navbar-dark` 类。也就是说，我们在设置颜色的同时，还要处理好 `navbar-dark` 或 `navbar-light`，并且 `navbar-dark` 和 `navbar-light` 是互斥的。

### 侧栏

侧栏相对比较简单，并且在 CSS 类名中就能体现亮或暗，如 `dark-primary`、`light-primary` 等，每种颜色都有对应的 `dark-` 前缀和 `light-` 前缀。

不过，在 BS 的「更改配色」面板中，为了方便操作，我把暗的和亮的分开。（处于同一个 `<form>` 里，但不同的 `<div>` 中）

## 传统实现

我这里以导航栏为例子。下面的 JavaScript 代码仅作为示例，不保证一定能运行。

```javascript
const picker = document.querySelector('#navbar-color-picker')
if (picker) {
  picker.addEventListener('click', event => {
    const { target } = event
    if (target.tagName !== 'INPUT') {
      return
    }

    const color = target.value
  })
}
```

我们利用了事件的冒泡机制，监听了 `picker` 的单击事件。当用户单击 `picker` 时，先检查鼠标的单击动作是不是作用在 `<input>` 上（HTML 里有 20 个 `<input type="radio" name="navbar" value="...">`，`value` 记录着颜色名），如果不是就退出函数。

上面的 `color` 变量已经拿到了某个 radio 对应的颜色。不过，我们需要先把导航栏上旧的类名删除，才能加新的，因此需要「记住」之前的类名是什么：

```javascript
const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')
if (picker) {
  let previous = blessing.extra.navbar_color // 不用管这个怎么来的，我们只需要知道通过这个 navbar_color 属性可以获取到导航栏最初的颜色名
  picker.addEventListener('click', event => {
    const { target } = event
    if (target.tagName !== 'INPUT') {
      return
    }

    const current = target.value
    navbar.classList.remove(`navbar-${previous}`)
    navbar.classList.add(`navbar-${current}`)
    previous = current
  })
}
```

当然还要像前面所说的，根据不同的颜色来设置 `light` 或 `dark`：

```javascript
const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')
if (picker) {
  let previous = blessing.extra.navbar_color // 不用管这个怎么来的，我们只需要知道通过这个 navbar_color 属性可以获取到导航栏最初的颜色名
  picker.addEventListener('click', event => {
    const { target } = event
    if (target.tagName !== 'INPUT') {
      return
    }

    const current = target.value
    navbar.classList.remove(`navbar-${previous}`)
    navbar.classList.add(`navbar-${current}`)
    previous = current

    if (['light', 'warning', 'white', 'orange', 'lime'].includes(current)) {
      navbar.classList.remove('navbar-dark')
      navbar.classList.add('navbar-light')
    } else {
      navbar.classList.remove('navbar-light')
      navbar.classList.add('navbar-dark')
    }
  })
}
```

上面的代码看起来没什么问题，也是常见的做法，但不够优雅：事件的监听器里依赖了外部的一个可变变量，使得代码理解起来不够顺畅；另外两个 `if ` 语句虽然足够直观，但有改进空间。

## 引入 RxJS

> 本文使用 RxJS 6。

关于 RxJS 我不会做过多介绍，因为 [官网](https://rxjs.dev) 有详细解释。在这里我们利用 RxJS 提供的 Observable 即可观察对象，把整个过程看作一个流，通过由 RxJS 提供的各种操作符对这个流进行处理，最后 `subscribe` 这个流，在 subscription 中执行 **有副作用** 的代码。（也就是说，操作符中进行的操作全都是 **没有副作用** 的纯函数）

> 所谓的「纯函数」（*pure functions*），是指只要给定相同的输入，函数就能产生相同的输出。这中间的过程不依赖任何外部状态或变量，也不对外界的状态进行更改。

### 导航栏

#### 获取颜色名

第一步要做的自然就是从事件源开始。RxJS 提供了 `fromEvent`，适用于大多数的事件监听 API，比如 DOM 事件、jQuery 事件等。

我们要监听 `picker` 的鼠标单击事件：

```javascript
import { fromEvent } from 'rxjs'

const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')

fromEvent(picker, 'click')
```

现在就可以开始应用操作符啦。正如我前面所说的，数据像流一样进行，我们就可以把它想象成管道。`fromEvent` 将返回一个 Observable，Observable 上有 `pipe` 方法可供我们调用。我们现在就往 `pipe` 方法的参数上传入我们需要的操作符。

管道中最初的数据跟「传统实现」部分一样，是个 `Event` 实例，我们需要获取它的 `target` 属性。RxJS 中提供的 `map` 操作符可以对数据进行映射（类似于数组的 `map` 方法）：

```javascript
import { fromEvent } from 'rxjs'
import { map } from 'rxjs/operators'

const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')

fromEvent(picker, 'click').pipe(
	map(event => event.target)
)
```

你也可以使用 `pluck` 操作符。不过因为实际中我使用了 TypeScript，为了更好地类型推导，我使用 `map`。使用 `pluck` 会像下面这样：

```javascript
import { fromEvent } from 'rxjs'
import { pluck } from 'rxjs/operators'

const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')

fromEvent(picker, 'click').pipe(
	pluck('target')
)
```

接下来我们要判断 `target` 是不是一个 `<input>` 元素。对于一个 `HTMLElement`，我们可以获取它的 `tagName` 属性（注意是标签名是全大写）。想象一下我们的数据「管道」，对于 `<input>` 元素，我们允许通过；否则截止。这有点像过滤——只滤出我们需要的数据。因此，我们使用 `filter` 操作符（同样与数组的 `filter` 类似）：

```javascript
import { fromEvent } from 'rxjs'
import { map, filter } from 'rxjs/operators'

const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')

fromEvent(picker, 'click').pipe(
	map(event => event.target),
  filter(element => element.tagName === 'INPUT')
)
```

此时我们已经能确保流到后面的数据都是 `<input>` 元素了。再次使用 `map` 操作符以获取它的 `value` 属性，因为我把颜色名记录在 `value` 上。

```javascript
import { fromEvent } from 'rxjs'
import { map, filter } from 'rxjs/operators'

const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')

const color$ = fromEvent(picker, 'click').pipe(
	map(event => event.target),
  filter(element => element.tagName === 'INPUT'),
  map(element => element.value)
)
```

如果你留意的话，可以发现我用一个 `color$` 变量保存了这个 Observable，因为稍后这个 Observable 要复用。

#### 除旧立新

我们已经拿到了用户想要的新的颜色名，但在应用之前要先把旧的类名去掉。「传统实现」中是通过一个外部变量来记录上一次使用的颜色名。在 RxJS 中，我们有优雅的做法。

用户每一次单击 `picker` 都将触发事件，因此实际上管道中「流动」的是每次单击后产生的颜色名：

```
cyan -> indigo -> fuchsia -> maroon -> teal
```

如上所示，假设第一次单击是 cyan，如果第二次单击选择的是 indigo，就要删除 `navbar-cyan` 然后添加 `navbar-indigo`，依此类推。

那么有没有什么操作符可以记录流中的上一次数据呢？答案是肯定的。由于这里我们只需要知道上一次的数据和当前这一次数据，因此我们可以用 `pairwise` 操作符。这个操作符不接收任何参数，返回的是一个二元组。

```javascript
import { fromEvent } from 'rxjs'
import { map, filter, pairwise } from 'rxjs/operators'

const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')

const color$ = fromEvent(picker, 'click').pipe(
	map(event => event.target),
  filter(element => element.tagName === 'INPUT'),
  map(element => element.value)
)

color$.pipe(pairwise())
```

以前面的图为例，应用 `pairwise` 操作符后，将输出：

```javascript
['cyan', 'indigo']
['indigo', 'fuchsia']
['fuchsia', 'maroon']
['maroon', 'teal']
```

现在我们已经拿到了前一次的颜色名和当前的颜色名，然后就可以执行带有副作用的代码了。

```javascript
import { fromEvent } from 'rxjs'
import { map, filter, pairwise } from 'rxjs/operators'

const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')

const color$ = fromEvent(picker, 'click').pipe(
	map(event => event.target),
  filter(element => element.tagName === 'INPUT'),
  map(element => element.value)
)

color$
  .pipe(pairwise())
	.subscribe(([previous, current]) => {
		navbar.classList.replace(`navbar-${previous}`, `navbar-${current}`)
  })
```

#### 继续完善

上面的代码基本能工作。不过在实际测试中发现，第一次的单击是不会改变颜色的。原因就是，`pairwise` 操作符对于第一次的数据不会作任何输出。`pairwise` 要输出的是一个二元组，对于第一次的数据而言，它仅有一个值，不能构成二元组。

以前面的图为例，假设第一次选择的是 cyan，此时将不会有任何输出。只有点击了第二次即 indigo，才会输出 `['cyan', 'indigo']`。

既然它缺少一个初值，那我们手动给它一个就好了。RxJS 提供了 `of` 函数，可以依次将传递给它的参数送入管道中，类似于 JavaScript 的 `Array.of`。该函数可以接收任意数量的参数，不过这里我们只需要给一个。

```javascript
import { of } from 'rxjs'

const init = blessing.extra.navbar_color
of(init)
```

此时我们有两个流：一个是前面由 `fromEvent` 产生的，另一个是刚刚的 `of`。现在我们需要将两个流合并起来——使用 `merge` 函数：

```javascript
import { fromEvent, of, merge } from 'rxjs'
import { map, filter, pairwise } from 'rxjs/operators'

const init = blessing.extra.navbar_color
const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')

const color$ = fromEvent(picker, 'click').pipe(
	map(event => event.target),
  filter(element => element.tagName === 'INPUT'),
  map(element => element.value)
)

merge(of(init), color$)
  .pipe(pairwise())
	.subscribe(([previous, current]) => {
		navbar.classList.replace(`navbar-${previous}`, `navbar-${current}`)
  })
```

现在就算是第一次单击，也能看到颜色的改变了。因为在第一次单击之前，管道中已经存在了 `pairwise` 产生二元组所需的第一个值。此时的第一次单击对于 `pairwise` 而言已经是第二个值，因而能够产生输出。

#### 黑白分明

别忘了我们还要根据不同的颜色给导航栏控制亮色或暗色。一个比较传统的做法是：

```javascript
color$.subscribe(color => {
  if (['light', 'warning', 'white', 'orange', 'lime'].includes(color)) {
    navbar.classList.remove('navbar-dark')
    navbar.classList.add('navbar-light')
  } else {
    navbar.classList.remove('navbar-light')
    navbar.classList.add('navbar-dark')
  }
})
```

这样也能用，不过我们有更高端的做法。

首先想到的也许是借助 `filter` 操作符，即针对亮色使用一次 `filter`，然后针对暗色使用一次 `filter`。代码大概如下：

```javascript
color$.pipe(filter(color => ['light', 'warning', 'white', 'orange', 'lime'].includes(color)))  // light

color$.pipe(filter(color => !['light', 'warning', 'white', 'orange', 'lime'].includes(color)))  // dark
```

但是这样很不好，很明显这里有可复用的代码。仅仅为了区分「是」与「否」两种情况而如此分开写，还不如干脆像前面那样直接在 `subscribe` 里完成就好了。

如果你有留意过其它编程语言里的集合或数组，你也许会发现有一个 `partition` 方法。这个 `partition` 方法允许我们传递一个 predicate（本质上就是一个接收一个参数，然后对这个参数进行判断，最后返回 boolean 值的函数），`partition` 方法就会将每个元素作为 predicate 的参数，然后来执行 predicate 并判断该元素是否通过 predicate 的测试。`partition` 最后会根据每个元素通过 predicate 的测试与否来将原集合或数组分成两个集合或数组：一个是通过测试的那些元素，另一个是没有通过测试的那些元素。

RxJS 同样提供了 `partition` 函数，含义和用法也类似。

```javascript
import { partition } from 'rxjs'

const [light$, dark$] = partition(
	color$,
  color => ['light', 'warning', 'white', 'orange', 'lime'].includes(color)
)
```

`partition` 返回一个二元组，元组的第一个 component 是通过 predicate 测试的 Observable，第二个是没有通过测试的 Observable。

最后我们针对这两个 Observable 进行 `subscribe` 即可。

```javascript
light$.subscribe(() => {
  navbar.classList.remove('navbar-dark')
  navbar.classList.add('navbar-light')
})

dark$.subscribe(() => {
  navbar.classList.remove('navbar-light')
  navbar.classList.add('navbar-dark')
})
```

#### 完整代码

```javascript
import { fromEvent, of, merge, partition } from 'rxjs'
import { map, filter, pairwise } from 'rxjs/operators'

const init = blessing.extra.navbar_color
const navbar = document.querySelector('.wrapper > nav')
const picker = document.querySelector('#navbar-color-picker')

const color$ = fromEvent(picker, 'click').pipe(
	map(event => event.target),
  filter(element => element.tagName === 'INPUT'),
  map(element => element.value)
)

merge(of(init), color$)
  .pipe(pairwise())
	.subscribe(([previous, current]) => {
		navbar.classList.replace(`navbar-${previous}`, `navbar-${current}`)
  })

const [light$, dark$] = partition(
	color$,
  color => ['light', 'warning', 'white', 'orange', 'lime'].includes(color)
)
light$.subscribe(() => {
  navbar.classList.remove('navbar-dark')
  navbar.classList.add('navbar-light')
})
dark$.subscribe(() => {
  navbar.classList.remove('navbar-light')
  navbar.classList.add('navbar-dark')
})
```

### 侧栏

侧栏的情况比较简单。虽然暗色的选择和亮色的选择分开在两个不同的 `<div>` 中，这也意味着有两个流，但这两个流中数据的数据结构是相同的，所以可以先用 `merge` 函数合并起来，然后应用相同的操作符。代码如下：

```javascript
const sidebar = document.querySelector('.main-sidebar')
const darkPicker = document.querySelector('#sidebar-dark-picker')
const lightPicker = document.querySelector('#sidebar-light-picker')
const init = blessing.extra.sidebar_color

const color$ = merge(
  fromEvent(darkPicker, 'click'),
  fromEvent(lightPicker, 'click')
).pipe(
  map(event => (event.target as HTMLElement)),
  filter(
    (element): element is HTMLInputElement => element.tagName === 'INPUT',
  ),
  map(element => element.value)
)

merge(of(init), color$)
  .pipe(pairwise())
  .subscribe(([previous, current]) => {
    sidebar.classList.replace(`sidebar-${previous}`, `sidebar-${current}`)
  })
```

## 总结

读者可以对比「传统」方案和 RxJS 方案，显然 RxJS 方案的代码更优雅，逻辑处理过程更加清晰。如果你仔细观察的话，可以发现 RxJS 方案里没有一个 `if` 语句；另外完全不需要用 `let` 来声明可变变量——进一步地说，不用我们自己去手动维护一个状态。

全文完。
