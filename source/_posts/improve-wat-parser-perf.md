---
title: How did I improve the performance of WAT parser?
date: 2025-10-28 17:29:12
tags:
  - WebAssembly
  - Rust
---

The WAT (WebAssembly Text Format) parser in [wasm-language-tools](https://github.com/g-plane/wasm-language-tools) v0.5 or before was not fast enough. Recently I have rewritten the parser from scratch, and the performance has been increased by 350% in the benchmark.
Let me share how I optimized it.

## Use hand-written parser

The old parser was written with [winnow](https://github.com/winnow-rs/winnow) which is a parser combinator library.
While it's easy to create a parser with parser combinators, it's generally slower than a hand-written parser,
so the first step is to write the parser by hands. Hand-written parser is not only faster but also allows to do more optimizations in the future.

## Clone well-known green tokens and green nodes

There're many parentheses and keywords in WAT. For these tokens and nodes, they shouldn't be created again and again when parsing.
Looking into the implementation of `rowan::GreenToken` and `rowan::GreenNode`, there's a `Arc` inside,
so we can prepare these well-known tokens and nodes in advance, then put them into `LazyLock` one by one, and clone them when needed.

## Keyword matching

There're many keywords in WAT such as `module`, `func`, `param`, `result`, etc.
When recognizing keywords in lexer, we don't capture a word and then check it by comparing strings.

Instead, we check the prefix of source code in bytes:

```rust
self.input.as_bytes().starts_with(keyword.as_bytes())
```

However, there may be a word like `function` that starts with `func` but it isn't a keyword, so we must check the next character is not an identifier character.

## Use `get_unchecked` to create token

Except strings and comments, other kinds of tokens are just ASCII strings.
For these tokens, we can use `get_unchecked` to avoid unnecessary UTF-8 boundary check which `get` will do.

## Use our own `Token` type

The lexer will produce tokens in our own `Token` type instead of `rowan::GreenToken`,
because creating `rowan::GreenToken` is much more expensive, and we should create it only when needed.

The `Token` type is simple as below:

```rust
struct Token<'s> {
    kind: SyntaxKind,
    text: &'s str,
}
```

For convenience, I added `impl From<Token<'_>> for rowan::NodeOrToken<rowan::GreenNode, rowan::GreenToken>`.

## Use a shared single `Vec` to avoid allocations

When creating a `rowan::GreenNode`, an iterator whose items are `rowan::NodeOrToken<rowan::GreenNode, rowan::GreenToken>`s is required.

At first, we may create a new `Vec` for each node.  However, this will create many temporary `Vec`s because a syntax tree contains many nodes, which causes many allocations and deallocations.

Instead, inspired by `rowan::GreenNodeBuilder`, we only create a single shared `Vec` in the parser.
When parsing, we push children tokens and nodes into that `Vec`;
when finishing a node, we use the `drain` method of `Vec` which can remove a range of children and return them as an iterator, and the iterator can be used to create a `rowan::GreenNode`.

But, how to know which range to drain? Certainly the end of the range is the current length of the `Vec`.
Inspired by `rowan::GreenNodeBuilder`, we use a `usize` to record the start index which is the length of the `Vec` when starting the node.

This is stack-like naturally, though we don't need to create an explicit stack,
but this is unlike how `rowan::GreenNodeBuilder` implements, which avoids another `Vec` and `unwrap` calls.

There is nothing similar to `rowan::GreenNodeBuilder::start_node_at` in our implementation,
instead we need to manually pass the start index to other functions, but this is cheap since it's just a `usize`.

## Result

The code snippet below is used in the benchmark:

```wasm
(module
    (func $f1 (param $p1 i32) (param $p2 i32) (result i32)
        (i32.add (local.get $p1) (local.get $p2))
    )
    (global $g1 f64 (f64.const 0))
    (func $f2 (result f64)
        (global.get $g1)
    )
    (type $t (func (result f64)))
    (func $f3 (type $t)
        (call $f2)
    )
    (func (export "f32.min_positive") (result i32) (i32.reinterpret_f32 (f32.const 0x1p-149)))
    (func (export "f32.min_normal") (result i32) (i32.reinterpret_f32 (f32.const 0x1p-126)))

    (rec (type $r (sub $t (struct (field (ref $r))))))
    (global (;7;) (mut f32) (f32.const -13))
    (rec
        (type $t1 (sub (func (param i32 (ref $t3)))))
        (type $t2 (sub $t1 (func (param i32 (ref $t2)))))
    )
    (global (;8;) (mut f64) (f64.const -14))

    (func (export "f32.max_finite") (result i32) (i32.reinterpret_f32 (f32.const 0x1.fffffep+127)))
    (func (export "f32.max_subnormal") (result i32) (i32.reinterpret_f32 (f32.const 0x1.fffffcp-127)))
)
```

Here is the benchmark result after all optimizations:

```
parser/old  time:   [59.473 µs 59.559 µs 59.648 µs]
            change: [-2.2351% -1.9312% -1.6268%] (p = 0.00 < 0.05)

parser/new  time:   [13.004 µs 13.120 µs 13.299 µs]
            change: [-1.6774% +0.4516% +4.8905%] (p = 0.82 > 0.05)
```
