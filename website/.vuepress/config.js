// See more in https://github.com/ktquez/vuepress-theme-ktquez#configuration
const path = require('path')
const themeConfig = require('./config/themeConfig')
const resolve = pathName => path.join(__dirname, pathName)

module.exports = {
  theme: 'ktquez',
  themeConfig,
  base: '/',
  title: 'Pig Fang',
  description: 'Pig Fang 的博客',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/fatpig.png'
      }
    ]
  ],
  shouldPrefetch: () => false,
  evergreen: true,
  locales: {
    '/': {
      lang: 'en'
    }
  },
  configureWebpack() {
    return {
      resolve: {
        alias: {
          '@public': resolve('./public')
        }
      }
    }
  }
}
