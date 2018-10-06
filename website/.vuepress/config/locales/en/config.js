module.exports = {
  languages: {
    label: 'English',
    shortname: 'EN'
  },
  translation: require('./trans'),
  logo: {
    name: 'fatpig',
    ext: 'png',
    alt: 'The Fat Pig'
  },
  share: {},
  ads: [],
  newsletter: {
    provider: 'mailchimp',
    action: ''
  },
  copy: `CC BY-SA 4.0 © Pig Fang - Powered By VuePress`,
  footer: {
    nav1: {
      title: '本博客',
      items: [
        {
          label: '关于我',
          path: '/about/'
        },
        {
          label: '小伙伴们',
          path: '/friends/'
        },
        {
          label: '分类',
          path: '/categories/'
        },
        {
          label: 'RSS',
          path: 'https://blog.gplane.win/atom.xml'
        },
      ]
    },
    nav2: {
      title: '开源作品',
      items: [
        {
          label: 'Rize',
          link: 'https://rize.js.org/'
        }
      ]
    }
  },
  social: [
    {
      name: 'github',
      link: `https://github.com/g-plane`
    },
    {
      name: 'twitter',
      link: `https://twitter.com/g3plane`
    },
  ]
}
