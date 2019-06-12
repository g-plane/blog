<template>
  <div class="navbar">
    <router-link
      v-for="(url, name) in navbar"
      :key="name"
      :to="url"
      class="navbar-item"
    >{{ name }}</router-link>
  </div>
</template>

<script>
export default {
  computed: {
    navbar() {
      return this.$themeConfig.navbar || []
    }
  }
}
</script>

<style lang="stylus">
@import '../styles/variables.styl'

.navbar
  margin 10px 10px 0

.navbar-item
  margin-right 10px
  color metaColor
  text-decoration underline
</style>
