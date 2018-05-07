<template>
  <div class="skeleton">
    <span id="top" />
    <header-bar />
    <main>
      <div class="side-dummy" />
      <nuxt class="main-content" />
      <div class="side-dummy right-dummy">
        <span class="btn-to-top" @click.stop="backToTop">&lt;/&gt;</span>
      </div>
    </main>
    <footer-bar />
  </div>
</template>

<script>
import HeaderBar from '@/components/post-header'
import FooterBar from '@/components/footer'

export default {
  components: {
    HeaderBar,
    FooterBar
  },
  methods: {
    backToTop() {
      const timer = window.setInterval(() => {
        const top = window.scrollY
        window.scrollTo(0, Math.max(Math.floor(top * 0.88)))
        if (top === 0) {
          window.clearInterval(timer)
        }
      }, 20)
    }
  },
  mounted() {
    const el = document.querySelector('.btn-to-top')
    window.addEventListener('scroll', () => {
      const total = document.body.scrollHeight -
        window.innerHeight +
        document.body.scrollTop
      const position = window.scrollY / total
      el.style.opacity = position > 0.1 ? 1 : 0
    })
  }
}
</script>

<style lang="stylus" scoped>
main
  padding-top 85px
  padding-bottom 60px
  min-height 77vh
  display flex
  justify-content center

.side-dummy
  @media (max-width: 768px)
    width 15px
  @media (min-width: 768px)
    width 25%

.right-dummy
  .btn-to-top
    position fixed
    right 20px
    bottom -10px
    font-size 100px
    font-weight 900
    opacity 0
    color rgba(0, 0, 0, 0.2)
    cursor pointer
    transition opacity 0.4s ease-out, color 0.4s ease-out
    &:hover
      color rgba(0, 0, 0, 0.55)
    @media (max-width: 768px)
      display none

.main-content
  @media (max-width: 768px)
    width 90%
  @media (min-width: 768px)
    width 50%
</style>
