const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const fm = require('front-matter')

const SOURCE_DIR = './source/posts'

const readFile = promisify(fs.readFile)

module.exports = async () => {
  const docs = await Promise.all(fs.readdirSync(SOURCE_DIR)
    .filter(name => name.endsWith('.md'))
    .map(async name => {
      const content = await readFile(path.join(SOURCE_DIR, name), 'utf-8')
      return fm(content)
    }))  // eslint-disable-line vue/script-indent
  return Array.from(
    new Set(docs.reduce((acc, cur) => acc.concat(cur.attributes.tags), []))
  ).map(tag => `/tag/${tag}`)
}
