<template>
  <div class="post-info">
    <span>
      <i class="icon" data-feather="clock" width="16" height="16" />
      {{ date }}
    </span>
    <span>
      <i class="icon" data-feather="tag" width="16" height="16" />
      <nuxt-link
        v-for="tag in splitedTags"
        :key="tag"
        :to="`/tag/${tag}`"
      >{{ tag }}</nuxt-link>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    date: String,
    tags: String
  },
  computed: {
    splitedTags() {
      return this.tags.split(',')
    }
  }
}
</script>

<style lang="stylus" scoped>
.post-info
  display flex
  justify-content space-between
  text-shadow 0 0 1px rgba(0, 0, 0, 0.22)
  font-size 12px
  color #999

.icon
  margin-bottom -4px

a
  text-decoration none
  color #999
  margin-right 8px
</style>
