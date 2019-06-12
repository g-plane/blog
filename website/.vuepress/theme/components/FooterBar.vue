<template>
  <footer class="footer">
    {{ thisYear }} © {{ author }}
    <br>
    Powered by
    <a
      href="https://vuepress.vuejs.org/"
      rel="noopener"
      target="_blank"
    >VuePress</a>
    | Theme by
    <a
      href="https://github.com/viko16/vuepress-theme-simple"
      rel="noopener"
      target="_blank"
    >Simple</a>
  </footer>
</template>

<script>
export default {
  computed: {
    thisYear() {
      return new Date().getFullYear()
    },
    author() {
      return this.$themeConfig.author || ''
    },
  }
}
</script>

<style lang="stylus">
@import '../styles/variables.styl'

.footer
  margin-bottom 15px
  text-align center
  color metaColor

  a
    color metaColor
    text-decoration underline
</style>
