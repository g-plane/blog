---
title: 用 TypeScript 模板字符串类型来制作 URL parser
date: 2020-09-02 11:40:04
tags:
  - TypeScript
---

## 想法

昨天写了一些简单的基于 TypeScript 模板字符串类型的字符串操作后，看到 [@Kingwl](https://github.com/Kingwl) 做了一个 [算术（只有加和减）执行器](https://github.com/microsoft/TypeScript/pull/40336#issuecomment-684784211)，于是手有点痒，想写一个 parser。

无疑写一个 JSON parser 是相对高大上的，但是很复杂（毕竟完全基于类型系统）。后来决定做一个 URL parser，这样相对简单。

关于 URL 的结构，我参考的是 [Node.js 的文档](https://nodejs.org/api/url.html#url_url_strings_and_url_objects)，里面有介绍 URL 中各个 component 的情况。

## 实现

由于纯粹是为了好玩，因此这个 URL parser 不会考虑到一些 edge cases，但也针对常见的情况做了一些处理。例如：不允许「端口」中出现非数字字符；URL 中的用户名、密码、端口、query string 以及 hash 都是可选的，缺少它们不会导致解析失败。

代码如下：

```typescript
type ParseProtocol<I, AST> =
    I extends `${infer P}://${infer Rest}` ? [AST & { protocol: P }, Rest] : never

type ParseAuth<I, AST> =
    I extends `${infer A}@${infer Rest}` ?
    A extends `${infer U}:${infer P}` ? [AST & { username: U, password: P }, Rest] :
    [AST & { username: A }, Rest] : [AST, I]

type ParseHost<I, AST> =
    I extends `${infer H}/${infer Rest}` ?
    H extends `${infer Name}:${infer Port}` ?
    ParsePort<Port> extends never ? never :
    ParsePort<Port> extends infer Port ?
    [AST & { hostname: Name, port: Port }, Rest] :
    [AST & { hostname: H }, Rest] :
    never : never
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type ParsePort<I, O extends string = ''> =
    I extends '' ? O :
    I extends `${Digit}${infer Rest}` ?
    I extends `${infer Char}${Rest}` ?
    ParsePort<Rest, `${O}${Char}`> :
    never : never

type ParsePathname<I, AST> =
    I extends `${infer P}?${infer Rest}` ? [AST & { pathname: `/${P}` }, `?${Rest}`] :
    I extends `${infer P}#${infer Rest}` ? [AST & { pathname: `/${P}` }, `#${Rest}`] :
    I extends `${infer P}` ? [AST & { pathname: `/${P}` }, ''] : never

type ParseQuery<I, AST> =
    I extends `?${infer Q}#${infer Rest}` ? [AST & { query: ParseQueryItems<Q> }, `#${Rest}`] :
    I extends `?${infer Q}` ? [AST & { query: ParseQueryItems<Q> }, ''] : [AST, I]
type ParseQueryItems<I> =
    string extends I ? [] :
    I extends '' ? [] :
    I extends `${infer K}=${infer V}&${infer Rest}` ? [{ key: K, value: V }, ...ParseQueryItems<Rest>] :
    I extends `${infer K}&${infer Rest}` ? [{ key: K, value: null }, ...ParseQueryItems<Rest>] :
    I extends `${infer K}=${infer V}` ? [{ key: K, value: V }] :
    I extends `${infer K}` ? [{ key: K, value: null }] : []

type ParseHash<I, AST> =
    I extends `#${infer H}` ? [AST & { hash: `#${H}` }] : [AST]

type ParseURL<I extends string> =
    ParseProtocol<I, {}> extends [infer AST, infer Rest] ?
    ParseAuth<Rest, AST> extends [infer AST, infer Rest] ?
    ParseHost<Rest, AST> extends [infer AST, infer Rest] ?
    ParsePathname<Rest, AST> extends [infer AST, infer Rest] ?
    ParseQuery<Rest, AST> extends [infer AST, infer Rest] ?
    ParseHash<Rest, AST> extends [infer AST] ? AST :
    never : never : never : never : never : never

type Merge<T> = { [P in keyof T as T[P] extends '' ? never : P]: T[P] }

type Result = Merge<ParseURL<'https://username:password@example.com:443/p/a/t/h?k1=v1&k2=v2#h'>>

```

可以在 [TypeScript Playground](https://www.typescriptlang.org/play?ts=4.1.0-pr-40336-8#code/C4TwDgpgBACghgJwM4Rgg9sdBjdAbAHgEkAaKAQQGUAVAPigF4AoKVqIqCAD2AgDsAJkigADACQBvAJZ8AZhASwAvgC4A9Gskz5igEoQkwJSKgB+KAG0q1KADIoEqGAxZceFbChKy+wwF0oDz4IADcFJiZQSFhEFHIAV2AAC2Iya3pmNnZOHn4hUS05BQolAAFCnShfIxNTFjZyHN5BYXFpIsUAVVUK4phjM0trOwcoeJQEPjgAWwgPTrIwOCQkAHd0BAEPGC8fA2AAlXrWKxoRx3GFKdmPRu8q-cOhmjIiPwio6HhkCAAJdEMqQoNAyx2y3Ga+Ta2mKvyUmnalWqAzqWV+TTyrV6igAcjMID1EX0NjUzGDvigYCSCFSEMB6BDMVBgmFFOYWcUjlkKahqbT6RiWlAYYp+WSsqcbPZHEkAcBrnMoHjZosSdsSbsHv5AmDJecoLLDAqPOj7tVDmCOYogqFwp8oAARKQAcykwEYUAA5AAGT1QAA+XoAjH7A56AEyhr0AZijnoALHGAKxxgBscYA7HGABxxgCcnsi4C+sV5dKBAHlBflDAgZM6PZ7PaCshxGUKm4Mq1y2G3ckK2k7XUZsVrSaje9WsUTFABhJKIJSSZG1cml-kEapkNoVpcSeeLkT0HusK2BZm2hAfYsxH7wZIKoHpRhgvuQ6ci5SmUcrwZ66VOHAD74h4IgIv0Jj3CI34SCuFqtlOBQzsoADEP77CizxSqMSzATcojgQMUFobBGEiPBk7tlCo4QX+wwAbhSTGgRki0fcTZPFa17RDyACK8QKCAT4gi+CFUa0MGfrxSgkZ+v7mP+owAI4CQgIDbKW-GCUQvDTEgBC8fQxHLmRFGsG+TLQaO0m1Fh+oqYJGk-Fpak6RAekGUZZAceekqvO89p8apIBuR5RAtmwtb1ohHAKWZ4L9vknZxTqYmJR+HRQAA0koDCjgAakotjoYYmEWI4ADWEDqdlZAhHAeACR4+WagAdO1QXabp+nVLQ8UWQOo45cVyHyZYlXVR4WV1Q1TXMvEeB4G1HWacFoU9fsfWpZR6VIZ+OV5chhW2eVUBVTV01QPVjWKi1Sj9Yh0KZTlJ0TRdM03UEC1LfdvnvEWPGlr8ywpKQwJ0KJO3vqIsmZXCJ30aMC5IEkoEkfDXhPJK-2BaWnS6AAMsQiFRXwzoRawPJoJgOD4ECEhKAyu0WJ+1hkHJjzimwPIJMkm77GkIniZYrMvMKmXmlzlNA3K-OGILEPCyzmVs+LSKcxO0t3kBTH4nLwAK0z0PK5Uqsc9qmu3igLlCVu4NG0yJvFGbEsa2uPzAyj+uG4hTuKNYATmMMJ4Xqy55njaYeR5yocx1xAPQAAsgozoQAQEMMKMFg7DIZ3VegshQDYyxF9nATC8lsfWrAfgeNQZdeNx0C+At7qZ8nCCpzSeOEwQnpJMAwBgEg6hqJckwgUsKzrJspTcDMYB4BArW4NMKjxvG0ZqGAahwGowBqEkpgVUGDAhEGtgVeGZ-hihSTNrQTBAA) 上进行试玩。

## 分析

### 概览

所有名字以 `Parse` 开头的类型都是负责完成解析工作。其中，除了 `ParseHash` 和 `ParseURL` 这两个类型以外，其它的用于解析的类型都返回一个二元组。元组的第一个分量是 AST（Abstract Syntax Tree），第二个分量是完成当前解析工作剩下的字符串内容（为了给后面的解析继续使用）。`ParseHash` 只返回一元组是因为 hash 已经是 URL 中最后的一部分，不再需要继续解析；而 `ParseURL` 作为整个 parser 没必要返回未被解析的字符串。

### 解析「协议」

这个比较简单，位于 `://` 前面的就是 URL 的「协议」，后面的用 `infer Rest` 把它提取出来就可以了。因为协议是必需的，因此解析失败要返回 `never`。

得到「协议」之后，利用联合类型将 `{ protocol: P }` 合并到 AST 对象中。后面的 parser 也一样。

### 解析「认证」

这一部分的格式是 `username:password@xxx`，其中 `password` 是可以被忽略的，`@` 后面的字符串就是主机名及后续的内容。需要注意的是，「认证」这一部分是可选的（我们看到的大多数 URL 也没有这一部分），因此缺少这一部分时不能返回 `never`，而要将输入的字符串和 AST 原样返回：`[AST, I]`。

我们先用一个 conditional types 将位于 `@` 前面的字符串提取出来。如果输入的字符串不符合这个格式，说明没有「认证」这一部分，返回 `[AST, I]`。

取出这一部分字符串后，我们还分别对「用户名」和「密码」进行分析。由于「密码」是可选的，因此采用跟上面同样的办法去分别提取「用户名」和「密码」。最后将提取到的信息合并到 AST 中并返回剩下的字符串。

### 解析「主机名」

实际上我把「主机名」的解析和「端口」的解析写在了一起，因为「端口」不是必需的，不过我在这里分开分析。

从输入的字符串开始一直到 `/` 出现为止，这中间的字符串都是「主机」，而「主机」包含「主机名」和「端口」。`/` 往后的就是「路径」（path）。

「主机名」与「端口」之间以冒号隔开，所以可以先用带有冒号的 pattern 尝试进行匹配。如果匹配上了，说明里面含有「端口」，然后将「主机名」和「端口」分别提取出来。如果不匹配，说明不包含「端口」，则整个字符串都是「主机名」，这时候将整个字符串当作「主机名」返回即可。

### 解析「端口」

这里我们还对「端口」进行简单的检查，确保里面只有数字字符。

首先定义一个 `Digit` 类型，里面包含了从 `0` 到 `9` 的 10 个数字。

然后 `ParsePort` 类型需要两个类型参数。第一个参数是输入的字符串；第二个参数是输出的字符串，它在解析过程中会被跟其它字符串一起拼接，在最后被返回。为了方便，我们指定一个空的字符串用作默认类型。这个有点像 reduce 操作。

开始检查输入的字符串的第一个字符是不是数字，如果不是则表示解析失败，并返回 `never`。如果是数字，则使用 `infer Rest` 将后面的字符串提取出来以便继续解析。

但我们还需要获取刚刚匹配到的第一个数字，以便我们把它拼接起来并返回。因此，我们借助另外一个 conditional types 并在里面使用 `infer` 来提取刚刚那个数字。后面直接使用 `${Rest}` 即可，而不是用 `infer`。

接着就将剩下的字符串 `Rest` 作为输入传入到 `ParsePort` 类型中，而 `ParsePort` 的第二个参数则是新拼接的字符串 `${O}${Char}`。如此递归下去，直到遇到空的字符串。

遇到空的字符串，表示已经完成解析，此时将 `ParsePort` 类型的第二个参数原样返回即可。

### 解析「路径」

这个比较简单。要注意的是，URL 中的 query string 和 hash 是可选的，因此要对这些情况分别处理——即允许以 `?` 或 `#` 作为 pattern 中的分隔符。

还要一点要注意的是，这时候输入的字符串已经不再以 `/` 开头，因为在前面解析「主机」的时候已经被 consume 掉，所以在 AST 中还要手动把它补上。

### 解析「查询字符串」

同样要注意 hash 可选的问题。

另外，我还对 query string 中的 key-value 进行解析并组成数组。（但在 TypeScript 的类型系统里这其实是元组，是有固定长度的）

解析 key-value 不算太复杂，适当地处理一些 edge cases 即可。例如，只有 key 而没有 value 的情况，还有 key-value 位于整个 query string 的最后这种情况。

这里利用了 `[T, ...T[]]` 的语法来实现了递归并组成最终的数组。元组中的每个元素是一个 object：`{ key: K, value: V }`，如果某个 key 没有对应的 value，则 value 为 `null`。

需要注意的是，可能是由于 TypeScript 的限制，需要在最前面加入 `string extends I`  的判断才不会导致 TypeScript 报告类型递归的深度太深的问题。

### 解析 Hash

这个就很简单了。Hash 在最后的位置，直接把输入字符串当作解析结果直接返回就是了。注意需要带上前缀的 `#`，因为这个 `#` 已经在它的 conditional types 中被 consume 掉。

### 组合

类型 `ParseURL` 就是将上面所有的 parser 组合起来，一步一步地解析。每完成一步的解析，就检查它是否返回一个二元组：如果是，表示解析成功，并将得到的 AST 和剩下的字符串传递给下一个 parser 继续解析；如果不是（这里解析失败会返回 `never`），则返回 `never` 而不再继续解析。解析到最后会得到 AST。

### 整理

由于每个 parser 都利用了联合类型将当前解析得到的信息与原 AST 合并，因此最终生成的 AST 类型会像这样：

```typescript
type AST = { protocol: P } & { hostname: H } & { pathname: P }
```

这样很难看。于是我弄了一个类型 `Merge` 将所有的内容合并到一个 object 中，使 AST 显得更直观。

在整理的过程中，我还使用了与模板字符串类型一起的新特性：mapped type `as` clauses。利用这个特性，将 AST 中那些值为空字符串的属性去掉。原理是 `as` clauses 中返回 `never` 表示不包含这个属性。

全文完。