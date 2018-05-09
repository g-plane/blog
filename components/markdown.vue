<template>
  <article>
    <slot />
  </article>
</template>

<style lang="stylus" scoped>
@import "highlight.js/styles/paraiso-light.css"

article
  color #2c3e50
  font-family 'Roboto Slab', 'Microsoft Yahei', 'Ubunto Mono'
  text-shadow 0 0 1px rgba(0, 0, 0, 0.22)

  p, ul, ol
    line-height 1.6em
    margin 1.2em 0 -1.2em
    padding-bottom 1.2em
    position relative
    z-index 1

  p
    word-spacing 0.05em

  h1, h2, h3, h4, strong
    font-weight 600
    color #2c3e50

  h1
    display block
    font-size 2em

  h2
    margin 45px 0 0.8em
    padding-bottom 0.7em
    border-bottom 1px solid #ddd
    z-index -1

  a
    text-decoration none
    color #42b983
    font-weight 600

  img
    max-width 100%

  code
    font-family "Roboto Mono", Monaco, Consolas, courier, monospace
    color #e96900
    padding 3px 5px
    margin 0 2px

  code:not([class^="language"])
    color #e96900
    padding 3px 5px
    margin 0 2px
    border-radius 2px
    font-size 0.9em
    background-color #f8f8f8

  blockquote
    margin 2em 0
    padding-left 20px
    padding-right 15px
    border-left 4px solid #42b983
    color #858585

  table
    border-spacing 0
    border-collapse collapse
    margin 1.2em auto
    padding 0
    display block
    overflow-x auto
    border-color grey

    th
      background-color #f8f8f8
      font-weight bold

    tr:nth-child(2n)
      background-color #f8f8f8

    th, td
      line-height 1.5em
      padding 0.4em 0.8em
      border 1px solid #ddd
</style>
