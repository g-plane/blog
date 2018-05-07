<template>
  <div id="index">
    <div class="blog-name">Pig Fang</div>

    <div class="interal-links">
      <nuxt-link class="first" to="/about">About Me</nuxt-link>
      <nuxt-link to="/friends">Friends</nuxt-link>
    </div>

    <ul class="posts-list">
      <li>
        <span class="post-date">2018/02/15</span>
        <span class="post-title">test</span>
      </li>
    </ul>

    <footer-bar />
  </div>
</template>

<script>
import FooterBar from '@/components/footer'

export default {
  components: {
    FooterBar
  }
}
</script>

<style lang="stylus" scoped>
#index
  display flex
  flex-direction column
  align-items center
  
  .blog-name
    margin-top 6%
    text-align center
    font-size 37px
    font-family Raleway
    color #373D42
    cursor default
  
  .index-posts
    display flex
    justify-content center

.interal-links
  margin-top 20px
  display flex
  justify-content space-between

  @media (max-width: 768px)
    width 55%
  @media (min-width: 768px) and (max-width: 960px)
    width 30%
  @media (min-width: 960px) and (max-width: 1920px)
    width 17%
  @media (min-width: 1920px)
    width 10%

  a
    text-decoration none
    color #000
    padding 0 0 8px 0
    border-bottom 3px solid transparent
    transition border 0.5s, color 0.2s
    &:hover
      color #41b883
      border-bottom 3px solid #41b883

.posts-list
  display flex
  flex-direction column
  list-style none
  max-width 60vw
  padding-left 0
  
  @media (max-width: 768px)
    max-width 85vw

  li
    display flex
    padding 20px 0 20px 0
    border-bottom 1px solid #e6e6e6

.post-date
  margin-right 35px
  color #aaa

.post-title
  transition 0.5s
  word-wrap break-word
  max-width (60vw - 87px)
  &:hover
    color #41b883
</style>
