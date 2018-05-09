<template>
  <div class="tag-page">
    <div class="blog-name">Pig Fang</div>

    <div class="tag">Tag: {{ tag }}</div>

    <paginate name="posts" :list="posts" :per="7" class="posts-list">
      <li v-for="post in paginated('posts')" :key="post.name">
        <span class="post-date">{{ post.date }}</span>
        <nuxt-link :to="`/p/${post.name}/`" class="post-title">
          {{ post.title }}
        </nuxt-link>
      </li>
    </paginate>

    <paginate-links for="posts" :simple="{
      next: 'Next »',
      prev: '« Back'
    }"></paginate-links>

    <footer-bar />
  </div>
</template>

<script>
import Vue from 'vue'
import VuePaginate from 'vue-paginate'
import FooterBar from '@/components/footer'

Vue.use(VuePaginate)

export default {
  components: {
    FooterBar
  },
  head() {
    return {
      title: `Tag: ${this.tag} - Pig Fang`
    }
  },
  data() {
    return {
      tag: '',
      posts: [],
      paginate: ['posts']
    }
  },
  asyncData({ params }) {
    const { tag } = params
    const posts = require('../../static/posts.json')
    return {
      tag,
      posts: posts.filter(post => post.tags.includes(tag)),
      paginate: ['posts']
    }
  }
}
</script>

<style lang="stylus" scoped>
.tag-page
  display flex
  flex-direction column
  align-items center
  font-family 'Roboto Slab', 'Microsoft Yahei', 'Ubunto Mono'
  
  .blog-name
    margin-top 5%
    text-align center
    font-size 37px
    color #373D42
    cursor default

.tag
  margin-top 15px

.posts-list
  display flex
  flex-direction column
  list-style none
  max-width 60vw
  padding 0 0 0 0
  
  @media (max-width: 768px)
    max-width 85vw

  li
    display flex
    padding 20px 15px 20px 15px
    border-bottom 1px solid #e6e6e6
    @media (max-width: 768px)
      padding 20px 0 20px 0

.post-date
  min-width 82px
  margin 2px 35px 0 0
  color #aaa

.post-title
  transition 0.5s
  word-wrap break-word
  max-width (60vw - 87px)
  text-decoration none
  color #000
  font-size 18px
  &:hover
    color #41b883
</style>

<!-- This is for `vue-paginate` and DO NOT add `scoped` flag. -->
<style lang="stylus">
.paginate-links
  list-style none
  display flex
  justify-content space-between
  padding 0 0 30px 0
  @media (max-width: 768px)
    width 55%
  @media (min-width: 768px) and (max-width: 960px)
    width 30%
  @media (min-width: 960px) and (max-width: 1920px)
    width 17%
  @media (min-width: 1920px)
    width 10%
  a
    cursor pointer
    padding 11px 17px
    border 1.4px solid transparent
    border-radius 3px
    transition border-color 0.4s ease-out, color 0.36s ease-out
    &:hover
      border-color #0084ff
      color #0084ff
  li.disabled
    a
      cursor no-drop
      color #ccc
      &:hover
        border-color #fff
</style>
