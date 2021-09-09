---
title: Type-safe Way to Build a Parser
date: 2021-09-05 11:48:57
description: Type-safe way for building a parser with the power of TypeScript type system.
tags:
  - TypeScript
---

> This post is for testing my hugely updated blog theme.

## Prerequisites

You're required to know TypeScript types, such as some built-in types like `Extract` and `Omit`.

And, you may need to know how JavaScript parser works, but I'll try to explain it.

## Background

Suppose we're building a JavaScript parser, and we only focus on the parser which accepts a stream of tokens then produces AST.

For a parser written in JavaScript or TypeScript, there's a common first step which is creating an object which only contains locations or other basic information, since we can't know the detail of that node before consuming tokens. Once we finished consuming enough tokens and gathered detail, we can set properties on that object.

## The Way That Babel Does

Here, we take some code from Babel as example. Babel is written in [Flow](https://flow.org/) but they're migrating to TypeScript progressively at the time I wrote this post.

Let's see [how Babel parses `IfStatement`](https://github.com/babel/babel/blob/c25ec3e06964b06d8207712d54f7c78e621071cd/packages/babel-parser/src/parser/statement.js#L648). I'll show you the code without implementation detail:

```typescript
parseIfStatement(node: N.IfStatement): N.IfStatement {
  this.next();
  node.test = // call another method to parse something else
  node.consequent = // call another method to parse something else
  node.alternate = // call another method to parse something else
  return this.finishNode(node, "IfStatement");
}
```

For the `IfStatement`, there're three important properties: `test`, `consequent` and `alternate`. When parsing `IfStatement`, Babel calls other parser methods, then once those methods return ASTs, it *mount* those ASTs to corresponding properties.

This looks okay, right? Yes, it actually works. However, this isn't type-safe.

What if we forget to *mount* AST to a property? Please note **line 3**.

```ts
parseIfStatement(node: N.IfStatement): N.IfStatement {
  this.next();
  // just call another method to parse something else, without setting it to current node
  node.consequent = // call another method to parse something else
  node.alternate = // call another method to parse something else
  return this.finishNode(node, "IfStatement");
}
```

If we run the code above, oh, the AST will be broken. We got an `IfStatement` with the `test` property whose value is `undefined`. This introduces a bug, but it hasn't been caught at compile-time.

The reason why that error won't be caught at compile-time is that the type of parameter `node` is already `IfStatement`, and when compiler checks this code and sees the type of that parameter is `IfStatement`, it thinks: okay, it's already an `IfStatement`, so all the properties of that type have been properly set and I don't need to care whether there'll be assignments to those properties later or not.

## To be Type-safe

To address the problem above, we shouldn't assign values to properties on an object directly, because this makes harder to ensure type-safety.

We can move those assignments to the `finishNode` method. After changed, `finishNode` may look like this:

```ts
this.finishNode(node, 'IfStatement', { test, consequent, alternate })
```

TypeScript can check the call above and make sure all required properties are properly given.

But, how can we tell TypeScript we're parsing `IfStatement` or other type of nodes? Use generics. But before using generics, we must declare a [discriminated union type](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions).

For most parsers, all kinds of nodes have a shared property called `type` which indicates the type of a specific kind of AST node, so we can declare it like this:

```ts
type Node = IfStatement | WhileStatement | /* etc */
```

And, each kind of AST node must have the `type` property whose type is a string literal:

```ts
type IfStatement = {
  type: 'IfStatement'
  /* other properties */
}
// or
interface IfStatement {
  type: 'IfStatement'
  /* other properties */
}
```

This is necessary; otherwise, TypeScript won't be able to distinguish them.

Now the signature of method `finishNode` can be:

```ts
finishNode<N extends Node['type']>(node: /* type? */, type: N, properties: /* type? */)
```

So far, the second parameter has become type-safe. We can't give an arbitrary string like `'YuruCamp'` because there's no AST node whose type is `'YuruCamp'`.

How about the first parameter and the third parameter?

To solve it, we must find a solution that we can retrieve a specific AST node by type name. For example, if we have a string `'Identifier'`, we should get the `Identifier` AST node.

Thanks to discriminated union and the `Node` type we declared above, we can make a good use of built-in `Extract` type:

```ts
type GetNodeByType<N extends Node['type']> = Extract<Node, { type: N }>
```

`Extract` returns the type which is a subtype of the `Node` type. If we give `'Identifier'`, it will be instantiated like this:

```ts
Extract<IfStatement | Identifier | /* etc */, { type: 'Identifier' }>
```

There's only one type which is a subtype of `{ type: 'Identifier' }`, and that is the `Identifier`.

Now the signature of method `finishNode` can be:

```ts
finishNode<N extends Node['type']>(node: GetNodeByType<N>, type: N, properties: /* type? */)
```

The rest problem, completing the type of parameter `properties`, would be easy if you know another TypeScript built-in type: `Omit`. We omit some information like locations and range:

```ts
finishNode<N extends Node['type']>(node: GetNodeByType<N>, type: N, properties: Omit<GetNodeByType<N>, 'loc' | 'start' | 'end' | 'range'>)
```

Here's the final code of calling `finishNode`:

```ts
parseIfStatement(node: N.NodeBase): N.IfStatement {
  this.next();
  const test = // call another method to parse something else
  const consequent = // call another method to parse something else
  const alternate = // call another method to parse something else
  return this.finishNode(node, "IfStatement", { test, consequent, alternate });
}
```

You may find that we introduced a new type `NodeBase`. There's nothing magical: it only contains shared properties in all kinds of AST nodes, such as locations and range.

Therefore, the signature of method `finishNode` can be simplified:

```ts
finishNode<N extends Node['type']>(node: GetNodeByType<N>, type: N, properties: Omit<GetNodeByType<N>, keyof NodeBase>)
```

Thanks for reading!
