---
title: 前端也要谈编译原理！
tags:
  - 编译原理
date: 2021-03-17 17:31:11
---

Babel、ESLint 以及 webpack 等工具虽然用途不同，但这些工具的基本工作流程都是读取源代码，然后对其分析、处理。这篇文章将会简单地讨论编译原理，以及介绍 JavaScript 中的 AST，最后大致介绍 ESLint 和 Babel 的原理。

## 编译器的工作过程

> 如果没有特别说明，这里的「前端」都是指「编译器前端」，而不是「Web 前端」。

编译器可以分为两个部分，一部分是编译器前端，另一部分是编译器后端。

### 前端

前端主要负责对源代码字符串的解析、分析工作。源代码在前端通常会经历以下几个步骤：

1. 词法分析
2. 语法分析
3. 语义分析

#### 词法分析

这个工作由词法分析器（通常称作 tokenizer 或 lexer）来完成。

> TypeScript 比较奇葩，它把词法分析器称为 scanner。

我们以下面的代码为例：

```javascript
if (ifa === ifb) {
  // comment
  console.log('same')
}
```

tokenizer 会使用 [有限状态机](https://zh.wikipedia.org/wiki/有限状态机) 等技术把上面的代码由字符串转换成一系列的 token。（国内有些文章把它翻译为「令牌」，这种翻译是错误的，它应该被称为「词法单元」或其它类似词语）

不同的词法分析器可能会产生有它们自己格式的 tokens。例如，espree（ESLint 所使用的 JavaScript 解析器）的词法分析器会产生如下的结果：

> 这里为了便于展示，对诸如位置等信息进行了删减。

```json
[
  {
    "type": "Keyword",
    "value": "if"
  },
  {
    "type": "Punctuator",
    "value": "("
  },
  {
    "type": "Identifier",
    "value": "ifa"
  },
  {
    "type": "Punctuator",
    "value": "==="
  },
  {
    "type": "Identifier",
    "value": "ifb"
  },
  {
    "type": "Punctuator",
    "value": ")"
  },
  {
    "type": "Punctuator",
    "value": "{"
  },
  {
    "type": "Identifier",
    "value": "console"
  },
  {
    "type": "Punctuator",
    "value": "."
  },
  {
    "type": "Identifier",
    "value": "log"
  },
  {
    "type": "Punctuator",
    "value": "("
  },
  {
    "type": "String",
    "value": "'same'"
  },
  {
    "type": "Punctuator",
    "value": ")"
  },
  {
    "type": "Punctuator",
    "value": "}"
  }
]
```

对应到原来的源代码，依次是：`if` 关键字、`(` 符号、`ifa` 标识符、`===` 符号……

通过对源代码与 tokens 列表的比较，我们可以发现：

- 源代码中的空白字符和注释会被忽略；
- 有多种不同类型的 token。

更进一步地，我们可以发现更多信息。

对于像 `if` 和 `for` 等的关键字，tokenizer 会把它识别为 `Keyword` 类型的 token；而对于像 `ifa` 和 `ifb` 这样的，虽然它们以 `if` 开头，但 tokenizer 不会错误地把它拆分成 `if` 关键字和 `a` 这样两个部分，而是将 `ifa` 看作一个整体，并且类型为 `Identifier` 即标识符；对于其它的标点符号则记录为 `Punctuator` 类型（注意 `===` 也是一个整体）；以及还有字面量的 token（某些词法分析器可能会记录为 `Literal` 类型）。

### 语法分析

语法分析器，也被称作 parser，负责将词法分析器输出的 tokens 流或 tokens 列表进行进一步的分析，从而得到 AST，即抽象语法树（Abstract Syntax Tree）。

语法分析器通常使用递归下降解析器来实现解析工作。（不过 parser 有很多种技术，这里不展开讨论）

例如，Babel 的 parser 在解析上面的代码时，首先会遇到 `if` keyword 这个 token。（具体见 [Babel parser 对 `if` token 判断相关的代码](https://github.com/babel/babel/blob/b97a627964a832aac84f0fe9f7be560dce2b60f1/packages/babel-parser/src/parser/statement.js#L206-L207)）

此时 Babel 就知道接下来应该解析一个 if 语句，因此调用 `parseIfStatement` 方法。（具体代码见 [Babel 的 `parseIfStatement` 方法定义](https://github.com/babel/babel/blob/b97a627964a832aac84f0fe9f7be560dce2b60f1/packages/babel-parser/src/parser/statement.js#L565-L571)）

在 `parseIfStatement` 中，Babel 调用了 `next` 方法。这个表示将当前位置指向下一个 token，也就是完成了 `if` keyword，准备处理下一个 token。

随后调用 `parseHeaderExpression` 方法。（具体代码见 [Babel 的 `parseHeaderExpression` 定义](https://github.com/babel/babel/blob/b97a627964a832aac84f0fe9f7be560dce2b60f1/packages/babel-parser/src/parser/statement.js#L460-L465)）在该方法中，首先调用 `expect(tt.parenL)`。其中 `expect` 的作用是如果当前 token 符合期望的 token，则完成当前 token 并准备处理下一个；如果不符合期望的 token，则抛出一个 parsing error，提示出现语法错误并报告解析失败。`parenL` 代表的是 `(` 这个 token。随后调用 `parseExpression` 方法，该方法将会解析一个表达式并将该表达式的 AST 返回。最后处理 `)` 符号并返回刚才得到的表达式。

回到 `parseIfStatement` 中，在调用 `parseHeaderExpression` 之后，如果没有语法错误，我们将得到一个表达式的 AST，此时 Babel 将此 AST 节点以 `test` 属性保存在当前正在生成的 AST 节点中。后面的操作也大概能理解了：`eat` 方法将判断下一个 token 是不是预期的 token，但与 `expect` 不同的是，它不会抛出 parsing error，只会返回一个 boolean 值。最后的 `finishNode` 调用是为了保存该 AST 节点的位置信息，并记录该 AST 节点的类型。（以上面的代码为例，即 `type` 为 `IfStatement`）

我们可以在 astexplorer.net 上查看任意一段代码经过解析后生成的 AST。比如，上面的代码经过 Babel 的 parser（本文编写时，版本是 7.13.9）后可得到这样的 AST：[astexplorer.net](https://astexplorer.net/#/gist/ee2462a31b1c05debc7303973fc5b3c4/30318d58a62c2279e551ae7555d37b778a5bccc1) 。

这里针对生成的 AST 简单解释一下：

最外层是一个 `Program` 节点，所有的顶级（top-level）节点均为 `Program` 节点的子节点。例如，我们的代码现在只有一个 if 语句，现在它是 `Program` 节点下唯一的子节点。需要注意的是，对于不同的节点，子节点会位于不同的属性下。比如 `Program` 里的子节点在 `body` 属性下；`IfStatement` 还会有多个不同的子节点，因为它包含了 if 语句中的「测试条件」（位于 `test` 属性下），以及测试结果为 true 时对应的子节点（位于 `consequent` 属性下），如果有 else 则还会有另外对应的子节点（位于 `alternate` 属性下）。

所有的节点都会有 `type` 属性，用来区分不同类型的 AST 节点。此外，还可能会有 `start`、`end`、`range` 等信息，它们被用于记录该节点在源代码中的位置。

需要注意的是，AST 仅仅包含源代码的结构信息，它不会像 tokens 列表那样包含 Punctuator 这样的信息，因为对于某种特定类型的 AST 节点，它的 tokens 组成是确定的。比如一个 `IfStatement`，它的开头必定是一个 `if` keyword，然后是一个 `(`——正如我们前面对 Babel 中 `parseIfStatement` 的分析那样。

### 语义分析

并不是所有的编译器都有语义分析，比如 Babel 就没有。不过对于其它大部分编程语言（包括 TypeScript）的编译器来说，是有语义分析这一步骤的。特别是静态类型语言，类型检查就属于语义分析的其中一个步骤。有些编程语言的编译器还会在这一阶段进行除了类型检查以外的其它检查，比如 Rust 在类型检查完成之后会有「借用检查」（borrow check）。

语义分析虽然会从前面的语法分析拿到 AST，但不一定直接基于 AST 进行语义分析（比如会先转换成中间的表现形式，IR），这要看编译器具体实现。

### 后端

> 到这里就没 ESLint 的事了。

后端一般包括优化阶段与代码生成阶段。

> 如果对编译器后端感兴趣，推荐阅读《Engineering a Compiler》，国内叫《编译器工程》。

### 优化

就是对输入的代码进行优化（包括但不限于运行效率优化），使最终程序能更好地运行。

### 代码生成

不管前面得到的是 AST 还是 IR，这些都只是编译器内部的数据结构，最终还要生成代码（即 codegen），程序才能被运行。代码生成的目标（target）根据编译器而有不同，像 Babel 就仍然会输出 JavaScript，而 LLVM 则会生成二进制代码。

## ESLint 的基本原理

首先 ESLint 会将源代码交给 espree 来解析，此时将得到一份 AST，另外 ESLint 还会基于 AST 进行 JavaScript 的代码作用域静态分析。

ESLint 具有插件机制，能允许开发者添加自己的 ESLint 规则。（实际上 ESLint 的内置规则也使用类似的机制）ESLint 在这一部分应用了一种被称为 visitor pattern 的设计模式。规则先定义想要处理的 AST 节点，然后 ESLint 遍历前面 espree 解析得到的 AST，并检查是否与规则中定义的目标 AST 节点匹配，如果匹配，则执行规则中的代码。最后 ESLint 会收集规则的检查报告。

### 简单应用

假如我们希望禁止对 `console.log` 的访问（注意是访问不是调用），则可以像下面这样写：

```javascript
const rule = {
  create(context) {
    return {
      MemberExpression(node) {
        const { object, property } = node
        if (
          object.type === 'Identifier' &&
          object.name === 'console' &&
          property.type === 'Identifier' &&
          property.name === 'log'
        ) {
          context.report({
            /* ... */
          })
        }
      },
    }
  },
}
```

因为我们要禁止的是对 `console.log` 的访问而不是其调用，因此我们要处理 `MemberExpression` 而不是 `CallExpression`。

## Babel 的基本原理

Babel 与 ESLint 在某些方面类似：它们都有插件机制，因此都会使用 visitor pattern。

Babel 的插件负责修改 AST：插件拿到 AST 节点后，通过 Babel 提供的 API，对 AST 进行增、删、改。

Babel 在执行完插件后，仍然持有一份 AST。接下来 Babel 将进行代码生成。parser 是从代码文本到 AST 的转换，而 codegen 则是从 AST 到代码文本的转换。例如，我们可以在 [这里](https://github.com/babel/babel/blob/b97a627964a832aac84f0fe9f7be560dce2b60f1/packages/babel-generator/src/generators/statements.ts#L13-L43) 来了解 Babel 是如何将 AST 中 `IfStatement` 转换成文本的。

关于 Babel 插件的开发，Babel 官方文档有非常简单的示例：[https://babel.dev/docs/en/plugins#plugin-development](https://babel.dev/docs/en/plugins#plugin-development) 。
