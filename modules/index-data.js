const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const fm = require('front-matter')

const SOURCE_DIR = './pages/posts'

module.exports = function () {
  this.nuxt.hook('ready', async () => {
    const operations = fs.readdirSync(SOURCE_DIR)
      .filter(name => name.endsWith('.md'))
      .map(name => path.join(SOURCE_DIR, name))
      .map(async name => {
        const content = await promisify(fs.readFile)(name, 'utf-8')
        const matter = fm(content)
        return {
          name: path.basename(name, '.md'),
          title: matter.attributes.title,
          date: matter.attributes.date.toLocaleDateString('zh-Hans-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
        }
      })
    const json = JSON.stringify(await Promise.all(operations))
    await promisify(fs.writeFile)('./static/posts.json', json)
  })
}
