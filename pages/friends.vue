<template>
  <main>
    <header>Pig Fang's Friends</header>
    <nuxt-link class="link-to-home" to="/">Back to home</nuxt-link>
    <ul>
      <li v-for="link in links" :key="link.link">
        <a :href="link.link" target="_blank" rel="noopener">
          {{ link.name }}
        </a>
      </li>
    </ul>
    <footer-bar />
  </main>
</template>

<script>
import FooterBar from '@/components/footer'

export default {
  components: {
    FooterBar
  },
  head() {
    return {
      title: 'Friends - Pig Fang'
    }
  },
  data() {
    return {
      links: [
        {
          name: 'DreamCity',
          link: 'https://www.littleqiu.net/'
        },
        {
          name: 'Blessing Studio',
          link: 'https://blessing.studio/'
        },
        {
          name: 'ZqStudio',
          link: 'https://blog.zqstudio.top/'
        },
        {
          name: '哈陆lu',
          link: 'https://halu.lu/'
        },
        {
          name: 'NciYuan! Blog',
          link: 'https://blog.nciyuan.net/'
        },
        {
          name: '刘伟的博客',
          link: 'https://darrenliuwei.com/'
        },
      ]
    }
  }
}
</script>

<style lang="stylus" scoped>
main
  display flex
  flex-direction column
  align-items center
  font-family 'Roboto Slab', 'Microsoft Yahei', 'Ubunto Mono'

header
  margin-top 5%
  text-align center
  font-size 37px
  color #373D42
  cursor default

.link-to-home
  margin-top 15px
  padding 0 0 8px 0
  font-size 15px
  text-decoration none
  color #000
  border-bottom 3px solid transparent
  transition border 0.5s, color 0.2s
  &:hover
    color #41b883
    border-bottom 3px solid #41b883

ul, li
  display block

li
  list-style none
  box-shadow 0px 0px 25px 0px rgba(132, 132, 132, 0.3)
  padding 8px 18px
  margin 20px 0 20px 0
  transition 0.5s
  &:hover
    box-shadow 0px 0px 25px 0px rgba(132, 132, 132, 0.8)
  a
    display block
    width 100%
    height 100%
    color #000
    text-decoration none
    transition 0.4s
    &:hover
      color #0ED6D6
</style>
