const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const lru = require('lru-cache')
const fm = require('front-matter')
const ejs = require('ejs')
const hljs = require('highlight.js')
const MarkdownIt = require('markdown-it')
const MarkdownItAnchor = require('markdown-it-anchor')
const MarkdownItAttrs = require('markdown-it-attrs')
const MarkdownItCJKBreaks = require('markdown-it-cjk-breaks')

const SOURCE_DIR = './pages/posts'
const DEST_DIR = './pages/p'

ejs.cache = lru(100)
const template = fs.readFileSync('./scaffolds/post.vue', 'utf-8')
const md = new MarkdownIt('default', {
  html: true,
  breaks: true,
  langPrefix: 'language-',
  linkify: true,
  typographer: true,
  highlight: (src, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          `<div class="hljs">${
            hljs.highlight(lang, src).value
          }</div>`
        )
      } catch (e) {}
      try {
        return (
          `<div class="hljs">${
            hljs.highlightAuto(src).value
          }</div>`
        )
      } catch (e) {}
      return src
    }
  }
})
  .use(MarkdownItAnchor, {
    level: [1, 2],
    permalink: true,
    permalinkBefore: true
  })
  .use(MarkdownItAttrs)
  .use(MarkdownItCJKBreaks)

async function generateFile(name, fullPath) {
  const filePath = fullPath ? name : `${SOURCE_DIR}/${name}`
  const file = await promisify(fs.readFile)(filePath, 'utf-8')
  const matter = fm(file)
  const vueFile = ejs.render(template, {
    name,
    title: matter.attributes.title,
    date: matter.attributes.date.toLocaleString('zh-Hans-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    tags: matter.attributes.tags,
    content: md.render(matter.body)
  })
  await promisify(fs.writeFile)(
    `${DEST_DIR}/${path.basename(name, '.md')}.vue`,
    vueFile
  )
}

chokidar.watch(`${SOURCE_DIR}/*.md`).on('all', async (event, filePath) => {
  if (event === 'add' || event === 'change') {
    await generateFile(filePath, true)
  }
})

module.exports = function () {
  this.nuxt.hook('ready', async () => {
    const operations = fs.readdirSync(SOURCE_DIR)
      .filter(name => name.endsWith('.md'))
      .map(generateFile)
    await Promise.all(operations)
  })
}
