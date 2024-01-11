---
title: TypeScript 的内置 NoInfer 类型
date: 2023-12-16 10:33:40
tags:
  - TypeScript
---

TypeScript 新特性抢先看：新的内置类型 `NoInfer<T>`。它与 `Uppercase` 等类型都属于 marker type（即 lib.d.ts 里的实现只有一个 `intrinsic` 关键字），编译器对于这类 marker type 都会特殊对待。

## 介绍

正如其名， `NoInfer<T>` 类型用于防止类型被自动推断。也就是说，在某些地方（通常是函数泛型等），如果不希望该处的类型被自动推断，就可以使用。例如：（下面的例子由官方示例简化而来）

```typescript
declare function test<T extends string>(a: T, b: NoInfer<T>): void

test('a', 'b')
```

[*playground*](https://www.staging-typescript.org/play?ts=5.4.0-pr-56794-2#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwxAGcMAeAFXhAA9DVgj4SYtUBzAPgAooAuecgBp4AI34A5HAElUiEDAocAlPwBuOLMABQWwiS4ByKAeEGRBpVqA)

在这个例子中，参数 a 的类型将被自动推断，此时 `T` 为 `'a'`；而对于参数 b，因为我们使用 `NoInfer` 类型，那么它也就不会参与自动推断，由于前面 `T` 被推断为 `'a'`，而此处的实际参数却是 `'b'`，因此类型不兼容进而报错。

如果上面没有使用 `NoInfer`， `T` 将会被推断为 `'a' | 'b'`，读者可以打开 playground 链接自行修改测试。

## 对泛型参数的影响

另外， `NoInfer<T>` 不会对 `T` 产生影响，例如：

```typescript
type Result = NoInfer<'s'>
```

[*playground*](https://www.staging-typescript.org/play?ts=5.4.0-pr-56794-2&ssl=1&ssc=27&pln=1&pc=1#code/C4TwDgpgBAShDOBXANsKBeKA5A9gSQDsAzCAJwB4ByeSgPgCgB6RqVgPQH4g)

类型 `Result` 仍为 `'s'`。

## 本质

在参与类型计算时， `NoInfer<T>` 其实只是被替换为 `unknown`。以上面的 `test` 函数为例，它相当于：

```typescript
declare function test<T extends string>(a: T, b: unknown): void
```

这里 `T` 仍为 `'a'`，只不过因为使用了 `unknown` 而无法对参数 b 进行约束。

## 注意事项

值得注意的是，在使用 `NoInfer<T>` 时，一定要留意 `T` 在可被推断的地方被推断为了什么类型。例如：

```typescript
declare function test2<T>(a: T, b: NoInfer<T>): void

test2('a', 'b')
```

[*playground*](https://www.staging-typescript.org/play?ts=5.4.0-pr-56794-2#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwxAGcMAmAHgBUA+ACigC55KAaeAIyYDkcBJVRCBhVqASiYA3HFmAAoWYRKlaAcigq2K9itGygA)

它跟上面的 `test` 函数相比， `T` 没有了 `extends string` 的泛型约束。这时，参数 a 将被推断为 `string` 而不是 `'a'`，也就是 `T` 被推断为 `string`。但因为 `'b'` 满足 `string` 的要求，因此这段代码不会报错。

---

PR: https://github.com/microsoft/TypeScript/pull/56794
