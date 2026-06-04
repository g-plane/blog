---
title: "Amber Tree: A Middle Ground Between Red and Green Trees"
date: 2026-06-04 22:53:23
tags:
  - Rust
lang: en
---

## Problems of rowan red tree and green tree

Rowan provides two kinds of syntax trees:

- Red tree: Feature-rich and API-friendly. It allows traversal not just to children and tokens, but also to parents and siblings via parent references. However, these parent references create cyclic references, so nodes must be heap-allocated and wrapped in `Rc` to reduce cloning overhead.
- Green tree: Much better performance, but with trade-offs. You can only access children, and the API doesn't directly distinguish between nodes and tokens - it returns `NodeOrToken` enum, which is awkward to work with. Green nodes also don't store a text range, so there's no way to know where a node appears in the source code.

It’s worth noting that in rowan, the red and green trees aren’t two independent structures. They are different views of the same underlying data: the red tree is essentially a wrapper around the green tree.

For most use cases in my project, [wasm-language-tools](https://github.com/g-plane/wasm-language-tools), I don’t need to traverse up to parents or siblings. I use the red tree primarily because its API is more convenient and it provides text ranges. So can I design a syntax tree that offers a reasonably friendly API and text range support, without parent/sibling consideration, while approaching green tree performance?

Absolutely. And it turns out to be much simpler than you might expect. Since its capabilities sit somewhere between the red and green trees, I call it the "Amber Tree."

## Implementation

Here's the definition of an amber node:

```rust
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub struct AmberNode<'a> {
    green: &'a GreenNode,
    range: TextRange,
}
```

- `green`: Holds reference to the green node, making the amber node lightweight. Thanks to Rust's borrow checker, the lifetime of the `AmberNode` is tied to its `GreenNode`, ensuring memory safety without runtime overhead.
- `range`: Stores the node's source location, solving the green node's lack of text range info.

Both fields are `Copy` (`GreenNode` itself isn't `Copy` but the reference is) so [`AmberNode`](https://docs.rs/wat_syntax/latest/wat_syntax/struct.AmberNode.html) can also be `Copy` naturally.

From here, we can implement some APIs we need. Because we hold a reference to the green tree, traversing to children or deeper descendants remains cheap and efficient.

I replaced parts of my language service that previously used the red tree with the amber tree. Note that these benchmarks compare against my own optimized implementation of the red tree (not the vanilla rowan implementation), so the baseline is already quite tuned.

| Benchmark | Before | After | Change |
|----------|--------|--------|--------|
| **unchanged text** | 15.469 µs | 7.609 µs | ↓ 50.8% |
| **changed text** | 224.73 µs | 172.39 µs | ↓ 23.3% |

## Improving formatter

[wat_formatter](https://crates.io/crates/wat_formatter) is a code formatter for WebAssembly Text Format (WAT) - similar to `rustfmt` for Rust but for `.wat` files. [wat_formatter](https://github.com/g-plane/wasm-language-tools/tree/main/crates/formatter) rarely needs parent or sibling access, making it a perfect candidate for the amber tree. This switch unlocked a significant secondary optimization.

With the red tree, `SyntaxToken` text is stored on the heap, and its lifetime is decoupled from the token itself. This meant I couldn't pass the `&str` directly to [`tiny_pretty`](https://docs.rs/tiny_pretty); I had to call `.text().to_string()`, incurring unnecessary heap allocations and string copies.

With the amber tree, the token text's lifetime is tied directly to the green tree reference held by the node. This allows me to pass the `&str` directly to [tiny_pretty](https://docs.rs/tiny_pretty) with zero allocations.

Due to the design of `SyntaxToken` in red tree, the lifetime of token text (which is `&str`) isn't related to the lifetime of `SyntaxToken` itself, so we can't pass that `&str` to [`tiny_pretty`](https://docs.rs/tiny_pretty) directly. To work around, we have to call `.text().to_string()` but this introduces heap allocation and string copying, decreasing the performance. Now with amber tree, the lifetime of token text is consistent with the lifetime of token itself because amber token holds the reference to `GreenToken`, and we can directly use the `&str` returned by amber token.

The result? The formatter's execution time dropped from **~85.191 µs** to **~34.808 µs** - a **~59% reduction** in time, or roughly a **2.4x speedup**.

## Conclusion

By sacrificing upward traversal, the amber tree provides a sweet spot: the ergonomics of the red tree with performance approaching the green tree.

More detail and implementation can be found in this pull request：[#36 Rewrite rowan with our own implementation](https://github.com/g-plane/wasm-language-tools/pull/36) in [wasm-language-tools](https://github.com/g-plane/wasm-language-tools).
