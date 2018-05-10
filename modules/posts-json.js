const fs = require('fs/promises')

module.exports = posts => {
  const data = posts.map(({ name, matter }) => ({
    name,
    title: matter.attributes.title,
    tags: matter.attributes.tags,
    date: matter.attributes.date.toLocaleDateString('zh-Hans-CN', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }))
  return fs.writeFile('./static/posts.json', JSON.stringify(data))
}
