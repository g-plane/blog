---
title:  巧用 TypeScript 的「条件类型」
description: 给一个库提 Pull request 时所想到的点子。
date: 2018-11-10 18:55:11
tags:
  - TypeScript
---

## 约定

本文假定读者对 TypeScript 有一定的了解，比如你得知道什么是交叉类型（intersection type）和联合类型（union type）。

## 起因和需求

最近在以 Node API 的方式来调用 [`typescript-estree`](https://github.com/JamesHenry/typescript-estree) 的时候，发现它虽然用 TypeScript 重写了，但是里面  `parse` 函数的返回值被打上了 `any` 类型。

这种做法我可以理解，毕竟在将一个 JavaScript 迁移到 TypeScript 时，的确会有可能暂时性地将某些类型标为 `any`。

但这对下游开发者相当不方便。你想，明明上游库是用 TypeScript 写的，但不能好好利用 TypeScript 带来的静态类型的好处。因此我决定给这个项目提 [PR](https://github.com/JamesHenry/typescript-estree/pull/33)。

## 问题

`typescript-estree` 的 `parse` 函数返回的是 `ESTree.Program`，这里不讨论为什么是这个类型。然而，`parse` 函数接收两个参数，第一个是源码（类型为 `string`），第二个是 `options`（类型为 `ParserOptions`，是个 JavaScript 对象）。通过控制 `options` 里某些选项的开关，可以让该函数返回更多信息（即，返回的对象上会有额外的 `ESTree.Program` 以外的属性）。例如，如果给 `options` 传递 `{ tokens: true }`，那么 `parse` 函数返回的对象上就会多出一个 `tokens` 属性。（为方便叙述，我将 `parse` 函数的返回值类型称为 `ParserResult`）

也就是说，这里额外的属性是否存在，取决于 `options` 里选项的情况。这意味着，你不能写死 `parse` 函数的返回值类型。

你可能会讲，可以给 `ParserResult` 添加这些额外的属性，然后给它们打上 optional 的标记，就像这样：

```typescript
type ParserResult = Program & { tokens?: ESTreeToken[] }
```

打上 `?` 标记意味着，这个属性的类型除了可能是你指定的之外，它还有可能是 `undefined`，即，下面的代码与上面的作用是一样的（但在编辑器或 IDE 的 auto complete 中会有差别）：

```typescript
type ParserResult = Program & { tokens: ESTreeToken[] | undefined }
```

这样做有什么缺点呢？假如我没在 `options` 中指定 `{ tokens: true }` 那还好，因为这种情况下，`tokens` 的确不存在于 `ParserResult` 中。但如果我指定了呢？像这样：

```typescript
const result = parse('', { tokens: true })
result.tokens.forEach(/* do something */)
```

上面的代码是不能编译通过的，因为按照前面的做法，TypeScript 认为 `tokens` 有可能是 `undefined`，因此不允许直接使用 `tokens` 属性，而是先做非空判断：

```typescript
const result = parse('', { tokens: true })
result.tokens && result.tokens.forEach(/* do something */)
```

这就让代码变得冗余。你明明知道 `tokens` 一定存在于 `result` 上，却还要傻傻地、多余地去判断。使用 `as` 去强制告诉编译器 `tokens` 一定存在，这种做法同样是麻烦的，与上面的相比只是没有运行时开销。

## 解决

### 引入 conditional type

TypeScript 从 2.8 起引入了 conditional type，这里简单介绍 conditional type 的用法。

比如，假设我们已经定义了 `TypeA`、`TypeB`、`TypeC` 和 `TypeD` 四个不同的类型：

```typescript
type NewType = TypeA extends TypeB ? TypeC : TypeD
```

这表示，如果 `TypeA` 是 `TypeB` 的子类型，那么 `NewType` 就是 `TypeC`，否则是 `TypeD`。

值得注意的是，虽然 conditional type 的语法使用了 ternary，但它实际上并不是一个真正的表达式，仅仅是类型注解。也就是说，像上面的语句会在编译时被去掉。又因为 TypeScript 是静态类型语言，因此所有的类型信息都能在编译时计算出来，即，对于 `NewType` 究竟是 `TypeC` 还是 `TypeD` 这一点是确定的。

有了 conditional type，我们就能利用它去判断传递给 `options` 的情况了。

### 给 `ParserResult` 添加额外属性

前面提到，`parse` 函数的返回值类型是 `ESTree.Program`，那么给该返回值添加更多的属性只需要使用交叉类型：

```typescript
type ParserResult = ESTree.Program & { tokens: ESTreeToken[] }
```

### 整合

这里还要使用 TypeScript 提供的另外一个特性——泛型。为什么需要泛型呢？因为实际传递给 `options` 的类型是不固定的。

为了让下游开发者不会出错以及方便编辑器的 auto complete（实际上对于后面判断 `options ` 而言这也是必须的），我们要用泛型约束：

```typescript
type ParserResult<T extends ParserOptions> = /* ... */
```

然后 `parse` 函数的函数签名就是：

```typescript
function parse(code: string, options: ParserOptions): ParserResult<typeof options> {}
```

接下来继续完善 `ParserResult` 的类型声明。

我们可以分析出，如果 `options` 上存在 `tokens` 属性且该属性的值为 `true`，那么 `ParserResult` 上应该有 `tokens` 属性。

因此 conditional type 这一部分可以写成：

```typescript
T['tokens'] extends true ? { tokens: ESTreeToken[] } : {}
```

这里对上面的代码作点解释：

第一，`T['tokens']` 表示获取 `T` 上的 `tokens` 属性的类型，这里的语法与 JavaScript 中获取一个对象上的属性的语法类似（如：`obj['prop']`）。但不能写成 `T.tokens`，因为 `T` 只是一个类型，不是一个值，并且这是 TypeScript 的语法要求。

第二，`true` 在这里不是表示 JavaScript 中的 `true` 值，而是 TypeScript 中的 `true` 这个类型。因为在 TypeScript 中字面量也可以作为类型，而 `true` 类型就表示 JavaScript 中字面量 `true` 的类型。（不一定是 `boolean`，这个要看情况）

第三，`{ tokens: ESTreeToken[] }` 表示一个包含 `tokens` 属性的对象的类型，这也是个类型，不是值。`tokens` 属性随后能够因交叉类型而合并到 `ESTree.Program` 中。

第四，`{}` 表示一个没有任何属性的对象的类型。由于这只是类型，它并不是 `Object` 的实例，因此不要觉得会有 `hasOwnProperty` 这样的玩意。像这样一个没有任何属性的对象类型被合并到 `ESTree.Program` 中后，不会增加任何新属性。

最后，`ParserResult` 的类型声明就是：

```typescript
type ParserResult<T extends ParserOptions> = ESTree.Program &
  (T['tokens'] extends true ? { tokens: ESTreeToken[] } : {})
```

实际的表现是，如果 `ParserOptions` 中的 `tokens` 属性的类型（注意我一直在说「类型」而不是「值」）为 `true`，那么 `ParserResult` 的类型就是 `ESTree.Program & { tokens: ESTreeToken[] }`，否则就是 `ESTree.Program`。

## 更深入一些

到这时候，`ParserResult` 是没问题的了。比如你可以做像这样的测试：

```typescript
let result: ParserResult<{ tokens: true }>
```

这时候你能够在 `result` 中拿到 `tokens` 这个属性。反过来，如果把 `tokens` 设为 `false`，就不行。

然而上面的代码仅仅是测试，实际中你不可能写出那样的代码，因为 `ParserResult` 是由 `parse` 函数返回过来的，而不是自己定义的。

我们再做一个测试：

```typescript
let result = parse('', { tokens: true })
```

你会发现（实际上我一开始就是遇到这种情况），你已经给 `options` 传递 `{ tokens: true }` 了，但 TypeScript 还是告诉你 `result` 上不存在 `tokens` 属性。

问题出在了 `parse` 函数的函数签名上。我们再看一次它的函数签名：~~（这样你就不需要滚回看上文）~~

```typescript
function parse(code: string, options: ParserOptions): ParserResult<typeof options> {}
```

返回值类型中的 `typeof options` 表示获取参数 `options` 的类型。而参数 `options` 被写死了（尽管 `ParserOptions` 这没错）。`typeof options` 拿到的类型也只能是 `ParserOptions`。`ParserOptions` 是已经定义好的，跟实际传递的值没什么关系。

既然要获取实际传入的值，就得再次动用泛型了，不过这次是使用在 `parse` 函数上。同样要加上泛型约束。同时为了避免下游开发者的麻烦以及困惑，这里给泛型加上默认类型。如下所示：

```typescript
function parse<T extends ParserOptions = ParserOptions>(
  code: string,
  options: T
): ParserResult<T> {}
```

这时候，TypeScript 就会去计算实际传入 `options` 的值的类型，并将此类型进一步传递给 `ParserResult`。

再次做前面那个测试：

```typescript
let result: ParserResult<{ tokens: true }>
```

这时候 TypeScript 就能正确提示 `result` 上存在 `tokens` 属性，并且类型为 `ESTreeToken[]`。

全文完毕。
