const getTags = require('./scripts/tags')

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
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#63BB0A' }
    ],
    link: [
      {
        rel: 'icon',
        href: '/fatpig.png'
      }
    ]
  },
  generate: {
    routes: getTags
  },
  loading: {
    color: '#63BB0A'
  },
  render: {
    resourceHints: false
  }
}
