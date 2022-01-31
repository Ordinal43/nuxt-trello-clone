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
    <v-snackbar
      v-model="snackbar"
      left
      :timeout="5000"
      :color="snackbarColor"
    >
      {{ snackbarText }}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          icon
          v-bind="attrs"
          @click="snackbar = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: 'LoginLayout',
  data: () => ({
    snackbar: false,
    snackbarColor: '',
    snackbarText: ''
  }),
  watch: {
    '$store.state.error' (val) {
      this.snackbarColor = 'red darken-1'
      this.snackbarText = val.message
      this.snackbar = true
    }
  }
}
</script>
