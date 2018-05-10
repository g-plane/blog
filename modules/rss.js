const { promisify } = require('util')
const fs = require('fs')
const Feed = require('feed')
const md = require('./markdown')

module.exports = posts => {
  const feed = new Feed({
    title: 'Pig Fang',
    description: 'Coders are artisans, code is artwork and coding is an art.',
    id: 'https://blog.gplane.win/',
    link: 'https://blog.gplane.win/',
    favicon: 'https://hexo-blog-1251929322.file.myqcloud.com/avatar/fatpig.png',
    generator: 'Nuxt.js',
  })
  posts.forEach(doc => {
    feed.addItem({
      title: doc.matter.attributes.title,
      id: doc.name,
      link: `https://blog.gplane.win/p/${doc.name}/`,
      author: [{
        name: 'Pig Fang',
        email: 'g-plane@hotmail.com',
        link: 'https://gplane.win/'
      }],
      content: md.render(doc.matter.body),
      date: doc.matter.attributes.date
    })
  })
  return promisify(fs.writeFile)('./static/rss2.xml', feed.rss2())
}
