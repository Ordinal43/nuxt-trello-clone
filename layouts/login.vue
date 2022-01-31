<template>
  <v-app>
    <v-container
      class="fill-height"
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          sm="8"
          md="6"
          lg="4"
          align="center"
        >
          <Nuxt />
        </v-col>
      </v-row>
    </v-container>
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
