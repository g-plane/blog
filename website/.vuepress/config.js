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
  shouldPrefetch: () => false,
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
      ],
      globalPagination: {
        prevText: '上一页',
        nextText: '下一页',
      },
      comment: {
        service: 'disqus',
        shortname: 'gplane-blog',
      },
      feed: {
        canonical_base: 'https://blog.gplane.win/',
        feed_options: {
          title: 'Pig Fang',
          description: 'Pig Fang\'s blog.',
          id: 'https://blog.gplane.win/',
          link: 'https://blog.gplane.win/',
          favicon: 'https://blog.gplane.win/favicon.png',
        },
        feeds: {
          atom1: {
            file_name: 'atom.xml',
          },
        },
        posts_directories: ['/posts/'],
        count: Infinity,
        sort: items => items.sort((a, b) => b.frontmatter.date - a.frontmatter.date)
      },
    }],
  ],
}
