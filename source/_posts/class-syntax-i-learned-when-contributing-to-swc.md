---
title: Class Syntax I Learned When Contributing to SWC
description: The weired class syntax you don't know.
date: 2021-12-03 16:52:18
tags:
  - JavaScript
---

## Quiz

Before talking about the detail, let's do some quiz.

> Don't cheat by using AST explorer.

### Question 1

What's the structure of the class below?

```javascript
class C1 {
  set
  x(arg) {}
}
```

Options:

1. There's a class property named `set` and a class method named `x`.
2. There's a setter named `x`.
3. Syntax error.

### Question 2

What's the structure of the class below?

```javascript
class C2 {
  set
  *x(arg) {}
}
```

Options:

1. There's a class property named `set` and a generator function named `x`.
2. There's a generator setter named `x`.
3. There's a variable named `set` which multiplies with a function named `x`.
4. Syntax error.

### Question 3

What's the structure of the class below?

```javascript
class C3 {
  set
  async x(arg) {}
}
```

Options:

1. There's a class property named `set` and an async function named `x`.
2. There's a async setter named `x`.
3. Syntax error.

## Semicolons and ASI

If you can't answer those three questions above, it's not your fault.
The syntax design of ECMAScript class really confuses many developers; it's problematic!

If you look at the questions above carefully, you will find that the code examples
above are using semicolon-less style which causes those problems happened.

You may know there's a mechanism called Automatic Semicolon Insertion, a.k.a. ASI.
It can detect and insert semicolons at the end of line of code.

Before class fields appears, rules of ASI are so simple:

- If next line of code starts with `+`, `-`, `*`, `/`, `[`, `(` or `.`, it **won't** insert semicolon.
- If current line of code is a `ReturnStatement` (even it's empty), it **will** insert a semicolon.

## Class Getters and Setters

Applying the rules above back to our questions, now you may know how to think
and understand those code examples. But, really?

### Question 1

Look at the code example below:

```javascript
a
b
```

We already know it's referencing two variables at different lines,
which is equivalent to:

```javascript
a;
b;
```

Now we look at Question 1 again:

```javascript
class C1 {
  set
  x(arg) {}
}
```

Intuitively, there should be a class property called `set` and a class method called `x`:

```javascript
// WRONG!
class C1 {
  set;
  x(arg) {}
}
```

But, it's wrong! Actually, there's just a class setter called `x`:

```javascript
// Correct
class C1 {
  set x(arg) {}
}
```

Therefore, the answer of Question 1 is Option 2.

### Question 2

If we apply ASI rules to Question 2, it's also wrong, and it can be syntax error.

However, the fact is that the answer is Option 1, which will be:

```javascript
class C2 {
  set;
  *x(arg) {}
}
```

Yes, it "violates" the ASI rules, with no reasons.

### Question 3

It's similar to Question 1, so we can "join" two lines together:

```javascript
class C3 {
  set async x(arg) {}
}
```

Now there's a syntax error, so the answer of Question 3 is Option 3.
I even don't know how to explain it...

## Conclusion

I encountered those problems when contributing to [SWC](https://swc.rs/), a faster Babel-alternative.
In early days, I found SWC didn't handle those "edge cases" correctly,
but actually I also don't know those weird behaviors in ECMAScript before contributing.

Those weired behaviors can't be simply applied with ASI rules.
It's entirely different, and you must be careful when using class fields.
In my opinion, TC39 didn't design the proposal carefully.
Even worse, some of them didn't hear from JavaScript community, lack of feedback.

But, the proposal had reached Stage 4, which means nothing can be changed.
For us, the only thing we can do is to setup a proper linter, such as ESLint, to detect problems.
If possible, also consider using Prettier (but not everyone like it),
and it can format the weird code to more readable code, which can reduce confusion.
For example, code of Question 1 will be formatted into:

```javascript
class C1 {
  set x(arg) {}
}
```

([*Prettier playground*](https://prettier.io/playground/#N4Igxg9gdgLgprEAucAbAhgZ0wAgMICMOwAOlDjpnDGRQB4AU6ATgOYCUxAvmVyADQgIABxgBLaJmSgWzCAHcACiwRSU6VPPQBPKYIBGzdGADW1AMroAtnAAyYqHGQAzDVQNHTF4cYetkMMwArnCCcFb6cAAmUdG26FCsQeiscABiEMxW6DDiicgg6EEwEAIgABYwVqgA6uVi8Jg+YHDmqg1iAG4N2gVg2GUOVMwwikas2S5uoSAAVph05n6ocACKQRDwU6juID7MwwX66JGoZcLMDjA1YlEw5cgAHAAMghcQVDVGwgUXcMOdJyCACOG3gYxEakKmAAtI5otEysw4KCxMixilJkhXDsZlQrGIAsE8cs1mCnNjpoIYCcbncHkgAEzUoxiVB+PAQKxYkD-ACsZSCVAAKic1Djdp0QgBJKCxWDmMCXUQAQTl5hg2hW2yoXC4QA))

Now it's clear.

Maybe someone claims "Don't use semicolon-less style".
Well, those people are usually using semicolon style, and it just avoids those problems.
But for me, I use semicolon-less style, so I disagree.
