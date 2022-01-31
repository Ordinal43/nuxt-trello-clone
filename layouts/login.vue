<template>
  <v-app>
    <Nuxt />
  </v-app>
</template>

<script>
export default {
  name: 'LoginLayout',
  watch: {
    '$store.state.user' () {
      this.$router.push({
        path: '/'
      })
    }
  }
}
</script>
