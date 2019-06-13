module.exports = {
  theme: 'simple-blog',
  themeConfig: {
    author: 'Pig Fang',
    navbar: {
      '关于我': '/about/',
      '朋友们': '/friends/',
    },
    disqus: 'gplane-blog',
  },
  base: '/',
  title: 'Pig Fang',
  head: [
    ['link', { rel: 'shortcut icon', href: '/favicon.png' }],
    ['meta', { name: 'keywords', content: 'Pig Fang, gplane, g-plane, 博客' }],
    ['meta', { name: 'author', content: 'Pig Fang' }],
  ],
  //shouldPrefetch: () => false,
  evergreen: true,
  plugins: [
    ['@vuepress/blog', {
      directories: [
        {
          id: 'post',
          dirname: 'posts',
          path: '/',
          itemPermalink: '/posts/:slug.html',
          pagination: {
            perPagePosts: 7,
          },
        },
      ],
      frontmatters: [
        {
          id: 'tag',
          keys: ['tag', 'tags'],
          path: '/tag/',
          layout: 'Tags',
          frontmatter: { title: 'Tags' },
          itemlayout: 'Tags',
        },
      ]
    }],
  ],
}
