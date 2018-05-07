<template>
  <div class="post-info">
    <span>
      <i class="icon" data-feather="clock" width="16" height="16" />
      {{ date }}
    </span>
    <span>
      <i class="icon" data-feather="tag" width="16" height="16" />
      {{ tags }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    date: String,
    tags: String
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
</style>
