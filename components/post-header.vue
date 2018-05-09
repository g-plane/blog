<template>
  <header>
    <nuxt-link class="link" to="/">Pig Fang</nuxt-link>
    <div class="post-title">{{ title }}</div>
    <div class="right-links">
      <nuxt-link class="link" to="/about">About Me</nuxt-link>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      title: ''
    }
  },
  beforeMount() {
    if (!window.$title) {
      Object.defineProperty(window, '$title', {
        get: () => this.title,
        set: value => this.title = value
      })
    }
  },
  mounted() {
    function scrollPostion() {
      const total = document.body.scrollHeight -
        window.innerHeight +
        document.body.scrollTop
      return window.scrollY / total
    }
    Array.from(document.querySelectorAll('.link'))
      .forEach(el => {
        el.onmouseenter = () => el.style.color = '#41b883'
        el.onmouseleave = () => {
          el.style.color = scrollPostion() > 0.5 ? '#fff' : '#000'
        }
      })

    const rgb = [249, 249, 250]
    function changeColor() {
      const position = scrollPostion()
      const index = ~~(Math.random() * 3)
      rgb[index] = (1 - position) * 255
      document
        .getElementsByTagName('header')[0]
        .style
        .backgroundColor = position >= 0.9
          ? 'rgba(0, 8, 6, 0.8)'
          : `rgba(${rgb.join()}, 0.8)`
      Array.from(document.querySelectorAll('.link'))
        .forEach(el => el.style.color = position > 0.5 ? '#fff' : '#000')
      document
        .querySelector('header')
        .style
        .color = position > 0.5 ? '#fff' : '#000'
    }
    window.addEventListener('scroll', changeColor)

    this.title = window.$title
  }
}
</script>

<style lang="stylus" scoped>
header
  position fixed
  width 100%
  display flex
  padding 0 18px 0 18px
  z-index 999
  flex 1
  justify-content space-between
  align-items center
  border-bottom 1px solid #B0BCC8
  background-color rgba(249, 249, 250, 0.8)
  transition 0.3s
  text-shadow 0 0 1px rgba(0, 0, 0, 0.22)
  box-shadow -0.2rem 0 0.7rem 0 rgba(0, 0, 0, 0.8)
  font-family 'Roboto Slab', 'Microsoft Yahei', 'Ubunto Mono'

  a
    word-wrap nowrap

.post-title
  font-size 23px
  font-weight 500

.link
  padding 16px
  margin-bottom 0
  color #000
  text-decoration none
  border-bottom 5px solid transparent
  transition border 0.2s ease-out, color 0.15s ease-out

  &:hover
    color #41b883
    border-bottom 5px solid #41b883

  @media (max-width: 768px)
    visibility hidden
    max-width 1px

.right-links
  margin-right 40px
  @media (max-width: 768px)
    visibility hidden
    max-width 1px

  .link
    padding-bottom 13px
</style>
