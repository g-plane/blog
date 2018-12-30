const fs = require('fs')

const title = process.argv[2]

const template = `---
title: ${title}
categories:
  - TO BE FILLED
tags:
  - TO BE FILLED
created_at: ${now()}
view: post
layout: post
author: gplane
lang: en
---
`

fs.writeFileSync(`./website/posts/${title}.md`, template)

function now() {
  const d = new Date()
  return (
    d.getFullYear() +
    '-' +
    (d.getMonth() + 1) +
    '-' +
    d.getDate() +
    ' ' +
    d.getHours() +
    ':' +
    d.getMinutes() +
    ':' +
    d.getSeconds()
  )
}
