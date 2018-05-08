<template>
  <div>
    <post-info date="<%= date %>" tags="<%= tags %>" />
    <markdown>
      <%- content %>
    </markdown>
  </div>
</template>

<script>
import Markdown from '@/components/markdown'
import PostInfo from '@/components/post-info'

export default {
  layout: 'post',
  components: {
    Markdown,
    PostInfo
  },
  head() {
    return {
      title: '<%= title %> - Pig Fang'
    }
  },
  beforeMount() {
    window.$title = '<%= title %>'
  }
}
</script>
