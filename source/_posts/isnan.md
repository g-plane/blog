---
title: isNaN 与 Number.isNaN 的区别
date: 2023-12-17 09:46:24
tags:
  - JavaScript
---

位于全局的 `isNaN` 与 `Number.isNaN` 虽然函数名字一样，但具体行为是有差别的：
- `isNaN` 会对传入的参数执行类型转换，转换为数字类型后再去判断；
- `Number.isNaN` 则不会执行类型转换，对于数字类型以外的值均返回 `false`。

请尽可能使用 `Number.isNaN` 以避免因类型转换而导致意外发生。

参考：

1. [MDN 上的示例代码](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN#difference_between_number.isnan_and_global_isnan)
2. [ECMAScript 标准中关于 `isNaN` 的说明](https://tc39.es/ecma262/multipage/global-object.html#sec-isnan-number)
3. [ECMAScript 标准中关于 `Number.isNaN` 的说明](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number.isnan)
