<template>
  <v-app>
    <v-container class="login-container">
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          sm="7"
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
import debounce from 'lodash/debounce'

export default {
  name: 'LoginLayout',
  data: () => ({
    snackbar: false,
    snackbarColor: '',
    snackbarText: '',
    windowHeight: process.server ? 100 : window.innerHeight
  }),
  watch: {
    '$store.getters.getAccount' () {
      this.$router.push({
        path: '/'
      })
    },
    '$store.getters.getError' (val) {
      if (val) {
        this.snackbarColor = 'red darken-1'
        this.snackbarText = val.message
        this.snackbar = true
      }
    },
    '$store.getters.getAlert' (val) {
      if (val) {
        this.snackbarColor = 'success'
        this.snackbarText = val
        this.snackbar = true
      }
    },
    snackbar (val) {
      if (val) {
        this.$store.commit('RESET_ALERT_ERROR')
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.setCustomVh()
      window.addEventListener('resize', this.onResize)
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    setCustomVh: debounce(function () {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }, 250),
    onResize () {
      this.setCustomVh()
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh; /* Use vh as a fallback for browsers that do not support Custom Properties */
  height: calc(var(--vh, 1vh) * 100);
  min-height: 300px;
  display: flex;
  align-items: center;
}
</style>
