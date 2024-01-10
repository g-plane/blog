---
title: Object.hasOwn 与 {}.hasOwnProperty 的差异
date: 2023-12-13 10:25:26
tags:
  - JavaScript
---

尽管 `Object.hasOwn` 被作为 `Object.prototype.hasOwnProperty` 的替代品，但实际上两者对于参数的 normalize 在顺序上是有差别的：

- `Object.hasOwn`[^1] 会先对第一个参数执行 `ToObject` 再对第二个参数执行 `ToPropertyKey`；
- `Object.prototype.hasOwnProperty`[^2] 则会先对第一个参数（即传入的 key）执行 `ToPropertyKey` 再对 this 执行 `ToObject`。

两者的顺序刚好相反。（虽然两个方法的参数数量不同，但不影响这里的逻辑，并且实际中基本是以 `Object.prototype.hasOwnProperty.call` 的形式来使用的，这也勉强算是两个参数）

在绝大多数时候，这个顺序上的差别不会对实际使用造成影响。不过，通过刻意的设计还是可以观测到两者的区别：

```javascript
const fakeKey = {
  [Symbol.toPrimitive]() {
    console.log('type conversion')
    return 'key'
  },
}

function callHasOwn() {
  try {
    // @ts-expect-error
    Object.hasOwn(null, fakeKey)
  } catch {
    //
  }
}

function callHasOwnProperty() {
  try {
    // @ts-expect-error
    Object.prototype.hasOwnProperty.call(null, fakeKey)
  } catch {
    //
  }
}

console.log('Using Object.hasOwn:')
callHasOwn()
console.log('====================')
console.log('Using Object.prototype.hasOwnProperty:')
callHasOwnProperty()
```

提示：对 null 或 undefined 执行 `ToObject` 会抛出错误。

[^1]: [ES 标准中关于 `Object.hasOwn` 的说明](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.hasown)
[^2]: [ES 标准中关于 `Object.prototype.hasOwnProperty` 的说明](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.prototype.hasownproperty)
