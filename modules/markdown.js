const hljs = require('highlight.js')
const MarkdownIt = require('markdown-it')
const MarkdownItAnchor = require('markdown-it-anchor')
const MarkdownItAttrs = require('markdown-it-attrs')
const MarkdownItCJKBreaks = require('markdown-it-cjk-breaks')
const MarkdownItContainer = require('markdown-it-container')
const MarkdownItEmoji = require('markdown-it-emoji')
const MarkdownItFootnote = require('markdown-it-footnote')

const md = new MarkdownIt('default', {
  html: true,
  breaks: true,
  langPrefix: 'language-',
  linkify: true,
  typographer: true,
  highlight: (src, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          `<div class="hljs">${
            hljs.highlight(lang, src).value
          }</div>`
        )
      } catch (e) {}
      try {
        return (
          `<div class="hljs">${
            hljs.highlightAuto(src).value
          }</div>`
        )
      } catch (e) {}
      return src
    }
  }
})
  .use(MarkdownItAnchor, {
    level: [1, 2],
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: '#',
    slugify: require('lodash.kebabcase')
  })
  .use(MarkdownItAttrs)
  .use(MarkdownItCJKBreaks)
  .use(MarkdownItEmoji)
  .use(MarkdownItFootnote)

const containerVPre = {
  render(tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<div v-pre>\n'
    } else {
      return '</div>\n'
    }
  }
}

const containerInfo = {
  render(tokens, idx) {
    const m = tokens[idx].info.trim().match(/^info\s+(.*)$/)
    const title = m ? md.utils.escapeHtml(m[1]) : ''
    if (tokens[idx].nesting === 1) {
      return m
        ? `<div class="tip tip-info"><p class="tip-title">${title}</p>\n`
        : '<div class="tip tip-info">\n'
    } else {
      return '</div>\n'
    }
  }
}

const containerWarning = {
  render(tokens, idx) {
    const m = tokens[idx].info.trim().match(/^warning\s+(.*)$/)
    const title = m ? md.utils.escapeHtml(m[1]) : ''
    if (tokens[idx].nesting === 1) {
      return m
        ? `<div class="tip tip-warning"><p class="tip-title">${title}</p>\n`
        : '<div class="tip tip-warning">\n'
    } else {
      return '</div>\n'
    }
  }
}

const containerDanger = {
  render(tokens, idx) {
    const m = tokens[idx].info.trim().match(/^danger\s+(.*)$/)
    const title = m ? md.utils.escapeHtml(m[1]) : ''
    if (tokens[idx].nesting === 1) {
      return m
        ? `<div class="tip tip-danger"><p class="tip-title">${title}</p>\n`
        : '<div class="tip tip-danger">\n'
    } else {
      return '</div>\n'
    }
  }
}

md.use(MarkdownItContainer, 'v-pre', containerVPre)
  .use(MarkdownItContainer, 'info', containerInfo)
  .use(MarkdownItContainer, 'warning', containerWarning)
  .use(MarkdownItContainer, 'danger', containerDanger)

module.exports = md
