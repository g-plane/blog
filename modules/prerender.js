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
const Feed = require('feed')

const SOURCE_DIR = './source/posts'
const DEST_DIR = './pages/p'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

try {
  fs.statSync(DEST_DIR)
} catch (error) {
  fs.mkdirSync(DEST_DIR)
}

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

async function generateFile({ name, matter }) {
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
  await writeFile(`${DEST_DIR}/${name}.vue`, vueFile)
}

chokidar.watch(`${SOURCE_DIR}/*.md`).on('all', async (event, filePath) => {
  if (event === 'add' || event === 'change') {
    const content = await readFile(filePath, 'utf-8')
    await generateFile({
      name: path.basename(filePath, '.md'),
      matter: fm(content)
    })
  }
})

function generatePostsData(docs) {
  const data = docs.map(({ name, matter }) => ({
    name,
    title: matter.attributes.title,
    date: matter.attributes.date.toLocaleDateString('zh-Hans-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }))
  writeFile('./static/posts.json', JSON.stringify(data))
}

async function generateRss(docs) {
  const feed = new Feed({
    title: 'Pig Fang',
    description: 'Coders are artisans, code is artwork and coding is an art.',
    id: 'https://blog.gplane.win/',
    link: 'https://blog.gplane.win/',
    favicon: 'https://hexo-blog-1251929322.file.myqcloud.com/avatar/fatpig.png',
    generator: 'Nuxt.js',
  })
  docs.forEach(doc => {
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
  await writeFile('./static/rss2.xml', feed.rss2())
}

module.exports = function () {
  this.nuxt.hook('ready', async () => {
    const docs = await Promise.all(fs.readdirSync(SOURCE_DIR)
      .filter(name => name.endsWith('.md'))
      .map(async name => {
        const content = await readFile(path.join(SOURCE_DIR, name), 'utf-8')
        return {
          name: path.basename(name, '.md'),
          matter: fm(content)
        }
      }))
    docs.sort((a, b) => b.matter.attributes.date.valueOf() -
      a.matter.attributes.date.valueOf())
    Promise.all(docs.map(generateFile))
    generatePostsData(docs)
    generateRss(docs)
  })
}
