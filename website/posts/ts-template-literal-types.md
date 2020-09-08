---
title: 使用 TypeScript 模板字面类型
date: 2020-09-01 18:12:39
tags:
  - TypeScript
---

## 介绍

在今天的早些时候，Anders Hejlsberg 在 TypeScript 的仓库中发了一个 Pull Request：[Template string types and mapped type `as` clauses](https://github.com/microsoft/TypeScript/pull/40336)。这个特性估计会在 4.1 版本中可用。

具体给 TypeScript 带来什么新特性，我就不在这里重复说了，Anders Hejlsberg 在 PR 中介绍得很清楚。这篇文章主要讨论利用这个模板字面类型，来对字符串字面类型进行一些典型的字符串操作。

## 清除字符串的特定前缀

### 实现与分析

JavaScript 的字符串中有一个实例方法 `trimStart`，它可以去掉字符串前面的空格字符。我们将在 TypeScript 的类型层面上实现这个功能。代码如下：

```typescript
type Whitespace = ' ' | '\n' | '\r' | '\t'

type TrimStart<S extends string, P extends string = Whitespace> =
  S extends `${P}${infer R}` ? TrimStart<R, P> : S
```

第 1 行的 `Whitespace` 类型定义了常用的一些空格字符。当然 Unicode 中还定义了其它的一些空格字符，我们根据需要往 `Whitespace` 这个联合类型后面补充就可以。

第 3 行至第 5 行就是 `TrimStart` 类型的定义。这个类型需要两个类型参数，其中 `S` 是要被处理的字符串，`P` 是要被搜索并删除的前缀。这两个参数都指定 `string` 类型作为泛型约束。另外 TypeScript 允许我们为类型参数提供一个默认类型，在这里，类型参数 `P` 的默认类型是 `Whitespace`，表示在不指定要搜索哪些字符串的时候，默认搜索空格字符。

我们利用 conditional types 来让 TypeScript 分析字符串 `S` 是否匹配我们指定的 pattern：以 `P` 为开头，后面跟随任意字符串，同时利用 `infer` 关键字将后面的字符串提取出来用作被返回的类型。

如果传入的字符串匹配该 pattern，则会递归地 trim 下去，直到不再匹配这个带有指定前缀的字符串为止。

如果传入的字符串没带有该前缀或者已经完成前缀删除，就会将 `S` 类型原样返回。

### 应用

```typescript
type String1 = '\t  \r  \n   value'
type Trimmed1 = TrimStart<String1>

type String2 = '---value'
type Trimmed2 = TrimStart<String2, '-'>
```

以上的例子中，`Trimmed1` 和 `Trimmed2` 的类型都是 `'value'`。

当不给 `TrimStart` 类型传入第二个类型参数时，默认使用 `Whitespace` 类型；若提供，则可以删除指定的前缀。

## 字符串替换

### 实现与分析

这里我分别实现了单次替换和全部替换。代码如下：

```typescript
type ReplaceOnce<Search extends string, Replace extends string, Subject extends string> =
    Subject extends `${infer L}${Search}${infer R}` ? `${L}${Replace}${R}` : Subject

type ReplaceAll<Search extends string, Replace extends string, Subject extends string> =
    Subject extends `${infer L}${Search}${infer R}` ? ReplaceAll<Search, Replace, `${L}${Replace}${R}`> : Subject
```

`ReplaceOnce` 类型和 `ReplaceAll` 类型需要三个类型参数：`Search` 类型是要被搜索的字符串；`Replace` 类型用于找到 `Search` 后，替换掉原来的 `Search`；`Subject` 就是要被处理的字符串。

`ReplaceOnce` 类型和 `ReplaceAll` 类型很相似：都用到了 conditional types，而且条件还相同。不同的是条件判断通过后返回的类型不同。

在上面的 conditional types 的条件中，我们对 `Subject` 字符串进行 pattern 匹配：检查字符串中是否包含 `Search` 字符串。如果包含，则还利用 `infer` 关键字将位于 `Search` 左边、右边的字符串提取出来用于返回。需要注意的是，尽管在我们的 pattern 中 `Search` 在中间，但这并不意味着 `Search` 一定要在中间才算匹配——放在开头或末尾也是可以的（放在末尾时，可能存在某些 edge cases 不能被匹配，这应该是 TypeScript 的问题），而这时候 `infer L` 或 `infer R` 推断出来的类型是一个空字符串字面类型，即 `''` 类型。

如果字符串匹配我们的 pattern，则利用传入的 `Replace` 字符串代替原来的 `Search` 字符串，同时使用之前提取出来的类型 `L` 和类型 `R` 来组成新的字符串：`${L}${Replace}${R}`。

到这里，我们已经完成一次替换了。对于 `ReplaceOnce` 类型，现在就可以将刚刚生成的新字符串类型返回；而对于 `ReplaceAll` 类型，则将这个新的字符串类型作为 `Subject` 参数，再次传入 `ReplaceAll` 类型中然后递归下去，直到所有字符串都被替换。

### 应用

```typescript
type String2 = 'process'
type Replaced1 = ReplaceOnce<'s', 'x', String2>
type Replaced2 = ReplaceOnce<'ss', 'x', String2>
type Replaced3 = ReplaceAll<'s', 'x', String2>
```

在上面的例子中，`Replaced1` 的类型是 `'procexs'`，`Replaced2` 的类型是 `'procex'`，`Replaced3` 的类型是 `'procexx'`。结果符合预期。

## 检查是否包含指定的子字符串

### 实现与分析

这个可以由上面的「字符串替换」简化而来：

```typescript
type IsIncludes<Needle extends string, Haystack extends string> =
  Haystack extends `${infer L}${Needle}${infer R}` ? true : false
```

`Needle` 就是要查找的子字符串，`Haystack` 就是要被搜索的字符串。conditional types 中的 pattern 与上面「字符串替换」中的 pattern 一样。最后根据匹配与否返回 `true` 类型或 `false` 类型即可。

### 应用

```typescript
type String2 = 'process'
type Included = IsIncludes<'pro', String2>
type NotIncluded = IsIncludes<'pre', String2>
```

在上面的例子中，`Included` 的类型为 `true`，`NotIncluded` 的类型为 `false`。

---

最后，这里有我写的一份代码，我把它放在 TypeScript 的 [Playground](https://www.typescriptlang.org/play?ts=4.1.0-pr-40336-8#code/C4TwDgpgBA6gFgS2BAzmAhgY2gXigcgKgB8CAdAO0NPzICdrzh8AoF0SKAFToQFsAysHR1gAHgFQIAD2QUAJiigpgvCgHMANFAAKU2RAVKVa9VDzwkqDNgB85llCdRJMuYqgADACQBvHQC+fggUAGYQdFAASgGeUAD83LyCwqJiUdo69gBcLmwc0EKmAIzmTE70FRTOAG7oADYArhCsBUn8fBDyZTz8QiLiRSHqxbb54NBREGD1WBAA8hTYEhAimHD67saqw9pTM3Obhh4muy6NAEYAVhCYwEdGyjsa9jiOzgKXN3cPHj6+IXCkQAMkFfAJVnR1mDARForEEl4-KC-PtZtgwTE4rlPtdbsB2BNotN0RAAIL1eorNYbNzHbamPYkw50x6nDTaXHfe6sk7PdSvd5OLn435Kf6wkFgiE0mFhOFYxFouYUqkyqFwJkHbDaf4o3zKjGo2I5c54u7jThDDQAJjK+DAdAA9tgUChWkTDV1SngvYtlvh3dp8NJ8Jz+Taxm0vfI7b7mdh-RAxIGgwRQ+HTJHCZwYwBmMpe1UptMhsMuCNjHPQACSKBrSya8lQYgAchAuvVoLyGWcABLoEAqLAAazFT1MrygA6HwkwY57SIB8qlfnbnYgcqB8LiiVUzSguVCDRQEGrUAbmCbXTKdcv15QKcdTvL1vU2baradwHvjWb3TwO9Gz-FsHToFpM2GSMgA) 上。

全文完。