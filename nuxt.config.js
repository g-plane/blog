const fonts = [
  'Roboto Mono',
  'Roboto Slab'
].map(name => name.replace(/\s/g, '+')).join('|')

module.exports = {
  css: [
    '@/assets/common.styl'
  ],
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
      },
      {
        rel: 'icon',
        href: 'https://hexo-blog-1251929322.file.myqcloud.com/avatar/fatpig.png'
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
