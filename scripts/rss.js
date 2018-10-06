const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const fm = require('front-matter')
const MarkdownIt = require('markdown-it')
const { Feed } = require('feed')

const readFile = promisify(fs.readFile)
const SOURCE_DIR = './website/posts'
const md = new MarkdownIt('default', {
  html: true,
  breaks: true,
  langPrefix: 'language-',
  linkify: true,
  typographer: true
})
;(async () => {
  const posts = await Promise.all(
    fs
      .readdirSync(SOURCE_DIR)
      .filter(name => name.endsWith('.md') && name !== 'README.md')
      .map(async name => {
        const content = await readFile(path.join(SOURCE_DIR, name), 'utf-8')
        return {
          name: path.basename(name, '.md'),
          matter: fm(content)
        }
      })
  )

  const feed = new Feed({
    title: 'Pig Fang',
    description: 'The blog of Pig Fang.',
    id: 'https://blog.gplane.win/',
    link: 'https://blog.gplane.win/',
    favicon: 'https://blog.gplane.win/fatpig.png'
  })
  posts.forEach(doc => {
    feed.addItem({
      title: doc.matter.attributes.title,
      id: doc.name,
      link: `https://blog.gplane.win/posts/${doc.name}.html`,
      author: [
        {
          name: 'Pig Fang',
          email: 'g-plane@hotmail.com',
          link: 'https://gplane.win/'
        }
      ],
      content: md.render(doc.matter.body),
      date: doc.matter.attributes.created_at
    })
  })

  await promisify(fs.writeFile)(
    './website/.vuepress/dist/atom.xml',
    feed.atom1()
  )

  console.log(chalk.green(' DONE  RSS generated!'))
})().catch(e => {
  console.error(chalk.red(` ERROR Failed to generate RSS: ${e.message}`))
})
