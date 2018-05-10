const fs = require('fs/promises')
const { statSync, mkdirSync, readdirSync, readFileSync } = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const lru = require('lru-cache')
const fm = require('front-matter')
const ejs = require('ejs')
const md = require('./markdown')
const generatePostsData = require('./posts-json')
const generateRss = require('./rss')

const SOURCE_DIR = './source/posts'
const DEST_DIR = './pages/p'

function mkdir(dir) {
  try {
    statSync(dir)
  } catch (error) {
    mkdirSync(dir)
  }
}

mkdir(DEST_DIR)
mkdir('./static')

ejs.cache = lru(100)
const template = readFileSync('./scaffolds/post.vue', 'utf-8')

async function generateFile({ name, matter }) {
  const sfc = ejs.render(template, {
    name,
    title: matter.attributes.title,
    date: matter.attributes.date.toLocaleString('zh-Hans-CN', {
      timeZone: 'UTC',
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
  await fs.writeFile(`${DEST_DIR}/${name}.vue`, sfc)
}

chokidar.watch(`${SOURCE_DIR}/*.md`).on('all', async (event, filePath) => {
  if (event === 'add' || event === 'change') {
    const content = await fs.readFile(filePath, 'utf-8')
    await generateFile({
      name: path.basename(filePath, '.md'),
      matter: fm(content)
    })
  }
})

module.exports = function () {
  this.nuxt.hook('ready', async () => {
    const posts = await Promise.all(readdirSync(SOURCE_DIR)
      .filter(name => name.endsWith('.md'))
      .map(async name => {
        const content = await fs.readFile(path.join(SOURCE_DIR, name), 'utf-8')
        return {
          name: path.basename(name, '.md'),
          matter: fm(content)
        }
      }))  // eslint-disable-line vue/script-indent
    posts.sort((a, b) => b.matter.attributes.date.valueOf() -
      a.matter.attributes.date.valueOf())
    Promise.all(posts.map(generateFile))
    generatePostsData(posts)
    generateRss(posts)
  })
}
