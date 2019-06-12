<template>
  <div class="theme-container vuepress-theme-simple">
    <header-bar />
    <DefaultGlobalLayout />
    <footer-bar />
  </div>
</template>

<script>
import GlobalLayout from '@app/components/GlobalLayout.vue'
import HeaderBar from '../components/HeaderBar'
import FooterBar from '../components/FooterBar'

export default {
  components: {
    DefaultGlobalLayout: GlobalLayout,
    HeaderBar,
    FooterBar,
  },
}
</script>
