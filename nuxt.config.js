const fonts = [
  'Raleway',
  'Roboto Mono'
].map(name => name.replace(/\s/g, '+')).join('|')

module.exports = {
  modules: [
    '@nuxtjs/markdownit',
    '@nuxtjs/feed',
    '~/modules/prerender',
  ],
  vendor: [
    'feather-icons',
    'highlight.js/styles/paraiso-light.css'
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
      }
    ]
  },
  markdownit: {
    preset: 'default',
    linkify: true,
    breaks: true,
    use: [
      'markdown-it-attrs',
      'markdown-it-cjk-breaks',
    ]
  },
}
