const getTags = require('./scripts/tags')

const fonts = [
  'Roboto Mono',
  'Roboto Slab'
].map(name => name.replace(/\s/g, '+')).join('|')

module.exports = {
  css: [
    '@/assets/common.styl'
  ],
  modules: [
    '~/modules/prerender',
  ],
  plugins: [
    '~/plugins/disqus'
  ],
  vendor: [
    'feather-icons',
    'highlight.js/styles/paraiso-light.css',
    'vue-disqus'
  ],
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      {
        rel: 'stylesheet',
        href: `https://fonts.googleapis.com/css?family=${fonts}`
      },
      {
        rel: 'icon',
        href: 'https://hexo-blog-1251929322.file.myqcloud.com/avatar/fatpig.png'
      }
    ]
  },
  generate: {
    routes: getTags
  },
  render: {
    resourceHints: false
  }
}
