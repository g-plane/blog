<template>
  <div class="layout-404">
    <h1>404</h1>
    <router-link to="/">
      Back to Home
    </router-link>
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar'
import FooterBar from '../components/FooterBar'

export default {
  components: {
    HeaderBar,
    FooterBar,
  },
};
</script>

<style lang="stylus">
.layout-404
  margin 8em
  text-align center
</style>
