// See more in https://github.com/ktquez/vuepress-theme-ktquez#themeconfig
module.exports = {
  locales: {
    '/': require('./locales/en/config')
  },
  disqus: 'gplane-blog',
  url: `https://blog.gplane.win`,
  cdn: '',
  blackWhite: true,
  topNavigation: false,
  searchMaxSuggestions: 7,
  responsive: {
    active: false,
    ext: 'png',
    breakpoints: []
  },
  lazyLoad: {},
  share: {},
  elevator: {
    duration: 0
  }
}
