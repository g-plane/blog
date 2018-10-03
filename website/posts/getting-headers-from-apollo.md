---
title: 从 Apollo Client 中获取 HTTP 头部信息
created_at: 2018-01-18 11:05:35
categories:
  - development
tags:
  - JavaScript
view: post
layout: post
author: gplane
lang: en
---

## 基于 JWT 的认证

最近在写 Blessing Skin Server v4。v4 相对于 v3 较大的变化之一是使用了 JWT 来进行认证，而不是像以前那样使用 Session/Cookies。这种情况下，前端与后端的通信需要在 HTTP Headers 里加入 token。

这里要提一下的是，后端使用了 [jwt-auth](https://github.com/tymondesigns/jwt-auth) 这个库，利用这个库可以完成基于 JWT 的认证工作，总体来说还是挺好。

jwt-auth 库里有两项关于时间的设置，其中一个是 token 的过期时间，另一个是用于刷新 token 的过期时间（就是假设 token 过期了，但如果还在刷新限期内，那么可以进行刷新而不用重新认证）。

Emmm……似乎扯远了。目前我在 v4 里设了一个中间件，用于自动进行刷新 token（方法是参考别人的，原文见本文底部的「参考资料」）。在 token 已经过期但未过刷新期限的时间内，会刷新 token 并将新的 token 通过 HTTP Headers 发送至前端。

## 问题

我在 Postman 下测试这个中间件以及自动刷新过程是没有问题的，但是在 Apollo Client 下我却不知道如何完成这个过程，毕竟它不像一般的 HTTP 连接库那样可以直接从响应中获取头部信息。

## 解决

### 获取 response 对象

在网上搜索了一下，发现可以使用 Apollo Client 的 Afterware 功能来拿到 response 的信息。代码大概如下：

```javascript
const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const token = operation.getContext().response.headers.get('Authorization')
    if (token) {
      // 下面这个是将 token 交给 Vuex 的，
      // 你可以根据你的实际情况来处理得到的 token
      store.dispatch('refreshToken', { token })
    }
    return response
  })
})
```

上面的 `forward(operation)` 虽然会提供 `map` 和 `forEach` 两个函数，但我实际测试似乎使用 `forEach` 是不行的。（心里很难受啊，明明是会产生副作用的代码，却用 `map` 来完成）

`operation.getContext()` 里虽然直接有 `headers` 这个对象，但这个是请求的头部而不是响应的头部，因此要 `operation.getContext().response.headers`，这个才是响应体的头部。

然而我还是得不到 token，通过 F12 我能够看到 Laravel 已经通过头部将 token 返回给我了，而且这个 afterware 里的代码也是有被执行到的。

### 暴露 HTTP Headers

后来在 Google 上搜索，在 Apollo Client 的 GitHub 仓库上找到一个 [issue](https://github.com/apollographql/apollo-client/issues/1156) 。里面是说，要在服务端返回的响应里添加一条 header 信息，`Access-Control-Expose-Headers`。

随后我在 MDN 上查找了这个 `Access-Control-Expose-Headers` 的用法，它的值就是你想要暴露的 header 的名字。

所以我们可以在那个 Laravel 中间件中这么写：

```php
$response = $next($request);
$response->headers->set('Access-Control-Expose-Headers', 'Authorization');
return $this->setAuthenticationHeader($response, $token);
```

（突然发现自己写带有 FP 向的代码写多了之后，会不经意地思考一个操作是 mutable 还是 immutable 的，哈哈）

如此一来，Apollo Client 就能拿到 `Authorization` 这个头部信息了。

以上。

## 参考资料

- [Laravel 5.5 使用 Jwt-Auth 实现 API 用户认证以及无痛刷新访问令牌](https://segmentfault.com/a/1190000012606246)
- [Apollo Link response headers](https://stackoverflow.com/questions/47443858/apollo-link-response-headers)
- [can't get response header in afterware](https://github.com/apollographql/apollo-client/issues/1156)
- [Access-Control-Expose-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers)

