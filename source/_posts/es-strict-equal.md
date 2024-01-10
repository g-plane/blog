---
title: ECMAScript 三种严格相等判断语义
date: 2023-12-20 11:50:04
tags:
  - JavaScript
---

## 介绍

ECMAScript 有三种严格（即不会执行类型转换）相等判断的语义，分别是：

- [SameValue](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevalue)
- [SameValueZero](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero)
- [IsStrictEqual](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-isstrictlyequal)

对于这三种语义，它们都会对类型不同的值返回 false；对于非数字类型的值，都会执行 [SameValueNonNumber](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluenonnumber) 语义；而对于数字类型，它们的差别在于比较 NaN、+0 与 -0 有不同：

- SameValue 会视 NaN 与 NaN 为相等，+0 与 -0 不等；
- SameValueZero 会视 NaN 与 NaN 为相等，+0 与 -0 相等；
- IsStrictEqual 会视 NaN 与 NaN 为不等，+0 与 -0 相等。

## 使用之处

下面是三种语义所被使用到的常见地方：

### SameValue

- [`Object.is`](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.is)
- [`WeakMap` 的 key](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-weakmap.prototype.has)、[`WeakSet`](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-weakset.prototype.has)

### SameValueZero

- [`Array.prototype.includes`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.includes)
- [`%TypedArray%.prototype.includes`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-%typedarray%.prototype.includes)
- [`Map` 的 key](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map-objects)、[`Set`](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-set-objects)

### IsStrictEqual

- [`===` 比较运算符](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-equality-operators-runtime-semantics-evaluation)
- [`Array.prototype.indexOf`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.indexof)
- [`Array.prototype.lastIndexOf`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.lastindexof)
- [`%TypedArray%.prototype.indexOf`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-%typedarray%.prototype.indexof)
- [`%TypedArray%.prototype.lastIndexOf`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-%typedarray%.prototype.lastindexof)

## 如何区分？

笔者根据规律想到一个辅助记忆办法：

1. `===` 与 `indexOf`/`lastIndexOf` 都是 ECMAScript 中很早就存在的，对于这类「古老」的都使用 IsStrictEqual 语义；
2. `includes` 与 `Map`/`Set` 是 ES2015 及更晚才出现的，对于这类「新兴」的使用 SameValueZero 语义；
3. 虽然 `Object.is` 也是新的，但它可以被认为有别于 === 的存在，所以特殊处理（Jest 等测试框架对于 `toBe` 断言就是使用 `Object.is` 去判断）；
4. `WeakMap` 的 key 与 `WeakSet` 不允许是 primitive type，因此可以忽略。
