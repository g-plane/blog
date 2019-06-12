<template>
  <div class="list-view">
    <ol class="list">
      <li v-for="page of filteredList" :key="page.key" class="list-item">
        <router-link :to="page.path" class="item-title">
          {{ page.title }}
        </router-link>
        <br>
        <time-ago :last-updated="page.frontmatter.date" class="item-date" />
      </li>
    </ol>
  </div>
</template>

<script>
import TimeAgo from '../components/TimeAgo'

export default {
  components: {
    TimeAgo
  },
  computed: {
    filteredList() {
      return this.$pagination.pages
        .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
    }
  },
  mounted() {
    console.log(this.$pagination.pages)
  }
}
</script>

<style lang="stylus">
@import '../styles/variables.styl'

.list-view
  margin 0 20px

  ol,
  ul
    padding 0
    list-style none

.list-item
  position relative
  margin-bottom 50px

.item-title
  display inline-block
  margin-bottom 10px
  font-size fontSize + 2
  color textColor

  &:hover
    color linkColor

.item-date
  display inline-block
  font-size fontSize - 2
  color metaColor
  border-top 1px solid lineColor
  padding-top 12px
</style>
