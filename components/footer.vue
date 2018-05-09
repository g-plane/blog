<template>
  <footer>
    <div class="social">
      <a
        class="mail"
        target="_blank"
        rel="noopener"
        href="mailto:g-plane@hotmail.com"
      >
        <i data-feather="mail"></i>
      </a>
      <a
        class="github"
        target="_blank"
        rel="noopener"
        href="https://github.com/g-plane"
      >
        <i data-feather="github"></i>
      </a>
      <a
        class="twitter"
        target="_blank"
        rel="noopener"
        href="https://twitter.com/g3plane"
      >
        <i data-feather="twitter"></i>
      </a>
      <a
        class="rss"
        target="_blank"
        rel="noopener"
        href="/rss2.xml"
      >
        <i data-feather="rss"></i>
      </a>
    </div>

    <div class="license">
      <a
        class="img"
        rel="license"
        href="http://creativecommons.org/licenses/by-sa/4.0/"
      >
        <img
          alt="Creative Commons License"
          style="border-width:0"
          src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png" />
      </a>
      © Pig Fang
    </div>

    <div class="coding-pages-copyright">
      <p>
        Hosted by <a href="https://pages.coding.me" style="font-weight: bold">
        Coding Pages</a>
      </p>
    </div>
  </footer>
</template>

<script>
import feather from 'feather-icons'

export default {
  mounted() {
    feather.replace()
  }
}
</script>

<style lang="stylus" scoped>
footer
  display flex
  flex-direction column
  align-items center

.license
  font-family 'Roboto Slab'
  margin-top 15px
  margin-bottom 10px
  display flex
  justify-content center
  a
    margin 2px 10px 0 0

.social
  a
    color #434950
    padding 0 10px 0 10px
    transition 0.5s

  .mail
    &:hover
      color #0cb49d

  .github
    &:hover
      color #000

  .twitter
    &:hover
      color #1da1f2

  .rss
    &:hover
      color #ef8c17

.coding-pages-copyright
  font-size 8px
  a
    text-decoration none
    color #000
</style>
