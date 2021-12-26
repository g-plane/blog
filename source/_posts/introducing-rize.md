---
title: Introducing Rize
description: Rize is a puppeteer wrapper which provides convenient APIs.
date: 2018-03-04 22:53:49
tags:
  - JavaScript
---

## What is "Rize"?

"Rize" is a Node.js library which provides high-level, fluent and chainable API for people who use puppeteer. I started to create it in Feb, 2018.

GitHub repository is [here](https://github.com/g-plane/rize/).

## Why did you create this library?

Puppeteer is a useful tool to control Chromium while we don't need to concern about how to use Chrome DevTools Protocol at low level. It is well worth using puppeteer to execute UI automated test, web crawling and so on.

Most APIs of puppeteer are in asynchronous mode. It is recommended to use ES2017 syntax `async/await` while using puppeteer.

However, using puppeteer makes me write more not-elegant code.

Here is an example of using puppeteer: (Copied from puppeteer's official repo)

```javascript
const puppeteer = require('puppeteer')

void (async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('http://example.com')
  await page.screenshot({ path: 'example.png' })
  await browser.close()
})()
```

As you can see, to use `async/await` syntax, you must put your code into an IIFE. You may say you can use `Promise` chain, but it make it harder to read the code.

Meanwhile, I have read the documentation of Laravel Dusk and I was greatly inspired from it. I decided to create a library which lets us can use puppeteer in chainable-API style. (Another example is `webpack-chain`)

Now the example above can be rewritten like this if you use Rize:

```javascript
const Rize = require('rize')

const rize = new Rize()
rize
  .goto('http://example.com')
  .saveScreenshot('example.png')
  .end()
```

No `async/await ` any more. (But still asynchronously in internal operations)

## What the library name "Rize" means?

"Rize" is a character in [*Is the Order a Rabbit?*](https://en.wikipedia.org/wiki/Is_the_Order_a_Rabbit%3F).

Her full name is "Rize Tedeza" and written "リゼ" in Japanese.

So "Rize" is pronounced like /ɾize/, not /raɪzɪ/.

You may want to know the reason why I use this name…… Just my personal decision.

## Why is it written in TypeScript?

Well, TypeScript is a static-typed language. (But not strongly-typed!) I am just a starter to learn Node.js (Node.js doesn't mean and equal to JavaScript). Static type system can help me catch some mistakes.

As a fan of Visual Studio Code, VS Code provides out-of-the-box support of TypeScript. And the experience of using TypeScript is better than using Flow, IMHO.

Type is also a kind of documentation. If you use vanilla JavaScript, when you use JSDoc to write documentation, you should specify the type of parameters and return value. However, if we use TypeScript, we can use TypeDoc to generate documentation but without annotating types manually.

Last, the TypeScript compiler can generate type declarations files when compiling our code. We don't need to maintain those declarations files manually.

## What can I do with this library?

### Web crawling

You can use this library to do web crawling. Because of some limitations, you still need to use `async/await` to retrieve data. However, the `saveScreenshot` method and `savePDF` method return the current instance of `Rize` instead of a `Promise`, so these two methods are chainable.

### UI testing

It's common to use puppeteer to execute UI testing, so you can use Rize to do the same work but using simple and elegant API. All assertion methods are chainable. Just like this:

```javascript
const rize = new Rize()
rize
  .goto('http://example.com')
  .assertTitle('Example page')
  .assertSee('Some text in page')
  .assertClassHas('span#greeting', 'harmony')
  .end()
```

For more details, please visit [https://rize.js.org/api/classes/_index_.rize.html](https://rize.js.org/api/classes/_index_.rize.html) . All assertion methods are prefixed with `assert`.

## Any guides or documentation?

Of course! You can visit [https://rize.js.org/](https://rize.js.org/).

## Last...

Any contributions are welcome! Feel free to file issues or send pull requests. If you think this library is helpful or useful, just go to https://github.com/g-plane/rize and star!
