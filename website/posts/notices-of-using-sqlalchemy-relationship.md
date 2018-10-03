---
title: 使用 SQLAlchemy 模型关联要注意的事项
categories:
  - development
tags:
  - Python
created_at: 2017-03-08 16:05:03
view: post
layout: post
author: gplane
lang: en
---

这两天在弄把B站所有番剧信息抓取下来的程序，并存入 PostgreSQL。因为懒得写 SQL 语句和处理游标，我打算使用 ORM，自然就选择了 SQLAlchemy。SQLAlchemy 的模型关联比较“啰嗦”，不如其它 ORM 框架那么简洁。

## 约定

在这个程序中，我设计了4个模型，一是 Anime 模型，包含了番剧的基本信息；二是 Episode 模型，对应的是番剧中每一集的信息；三是 Actor 模型，是记录番剧中的角色与声优关系，这个模型中的 id 字段使用了 Auto Increment ；最后是 Tag 模型，这个比较简单，模型中只有 id 和 name 两个属性，这个是跟番剧标签有关的。

上面四个模型的所有字段都是 NOT NULL 的。

我很自然地把这个四个模型分成了四个 Python 源代码文件，其中 Anime、Episode、Actor 是有关系的，只有 Tag 是独立的。在这个程序中，我只考虑进行一对多的模型关联。下面的阐述都是以我的实际情况而言。

顺便一提，四个数据表表名分别是 `animes`、`episodes`、`actors`、`tags`。

## 在模型的属性中定义外键

相对而言，Anime 是主的，Episode 和 Actor 是次的。

在 Episode 和 Actor 模型中定义外键之前，先导入：

```python
from sqlalchemy import ForeignKey
```

按照模型的设计，Episode 和 Actor 中都要有 `anime_id` 属性，这个属性在数据表中就是我们所要的外键。因此，这个属性要这样定义：

```python
anime_id = Column(Integer, ForeignKey('animes.anime_id'))
```

这样就指明，`episodes` 和 `actors` 表中的 `anime_id` 是外键，并且与 `animes` 表中的 `anime_id` 一栏进行关联。

接下来要在 Anime 模型中指定 episodes 属性和 actors 属性：

```python
actors = relationship("Anime", backref="actors")
episodes = relationship("Anime", backref="episodes")
```

别忘了要在 Anime 中导入：

```python
from sqlalchemy.orm import relationship
```
这样就完成了多个模型中的一对多关联。

## 使用相同的基类

在 SQLAlchemy 中，每定义一个模型，都要继承由 `declarative_base()` 产生的基类。如果在一个 Python 源代码文件中定义多个模型，是没有问题的。但我们通常都是一个文件对应一个模型。一开始，我在各自的文件中产生了它们自己的基类。结果我在 create schema 时报错了，错误是在建 `actors` 表的时候，无法生成外键。一开始我以为是要先建 `animes` 表才可以，然而我调换顺序后，错误仍旧。然后我在网上查了很久，才找到原因：要使用相同的基类。所以，我单独建了个 Base.py，然后在四个模型中导入它。

这里还要注意一个问题，就是在建表并进行关联之前，一定要先把旧的数据表删除。我在第一次进行使用相同基类并调试程序时，报了另外一个错误，当时也没找到原因。后来把旧的数据表删掉就没事了。

## 奇怪的 session.merge()

SQLAlchemy 有个跟 Sequelize 中 `upsert()` 方法类似的，就是 `session.merge()`，这两个方法的作用类似，都是先查询数据库中有没有与实例中相同的行，如果有就执行 UPDATE 语句，没有则执行 INSERT 语句。在 Node.js 中，`upsert()`中也包含了 actors 信息和 episodes 信息，并没有什么问题。但在 SQLAlchemy 中，同样是包含了 actors 信息和 episodes 信息，在进行 INSERT 的时候，能正常工作，但在 INSERT 的时候，却出现 actors 中 `anime_id` 出现中空值。

随后我临时把 `actors` 表中 `anime_id` 字段的 NOT NULL 关掉，结果是插入成功了，但是 actors 信息与之前现有的重复了，并且新增的几行中 `anime_id` 的值是空的，而 episodes 那边却没有这样的问题。我猜想可能跟 actors 中 `id` 的 Auto Increment 有关。

这个我上网查过，也看了官方文档，目前还没有找到有效的解决方案。在这里，我只能是使用 `one_or_none()` 方法，这个方法是先从数据库中查询，找到就返回实例，否则返回 None。利用这个方法，我检测返回的结果是否为 None，如果为 None，则添加所有字段的信息，如果是实例，则指定 `anime_id` 和需要更新数据的字段（毕竟不是所有字段都要更新的，actors 就是这样），最后执行 `session.merge()`。

这里我找到一个不错的 SQLAlchemy 的简单教程：（虽然是别人写的，但我完全没有要做广告的意思）

[SQLAlchemy ORM教程之一：Create](http://www.jianshu.com/p/0d234e14b5d3)

[SQLAlchemy ORM教程之二：Query](http://www.jianshu.com/p/8d085e2f2657)

[SQLAlchemy ORM教程之三：Relationship](http://www.jianshu.com/p/9771b0a3e589)

[SQLAlchemy ORM实践：怎样将SQLAlchemy整合进入你的工程](http://www.jianshu.com/p/28d3f5079f50)
