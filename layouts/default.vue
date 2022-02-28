<template>
  <v-app>
    <div class="brello-flex-container">
      <v-app-bar
        dense
        flat
        dark
        class="brello-app-bar"
        color="#026AA7"
      >
        <v-toolbar-title>
          <NuxtLink
            to="/"
            class="d-flex align-center"
          >
            <v-icon>
              mdi-trello
            </v-icon>
            <span class="ml-2 mb-n1 text-h5 font-weight-bold">
              Brello
            </span>
          </NuxtLink>
        </v-toolbar-title>

        <AppBarMenu />

        <v-spacer />

        <v-menu
          bottom
          left
          offset-y
          :close-on-content-click="false"
        >
          <template
            #activator="{ on }"
          >
            <v-btn
              icon
              small
              v-on="on"
            >
              <v-icon>
                mdi-account-circle
              </v-icon>
            </v-btn>
          </template>

          <v-card width="300">
            <v-list v-if="$store.getters.getAccount">
              <v-list-item>
                <v-list-item-avatar color="grey lighten-3">
                  <span class="text-h6 font-weight-bold">
                    {{ getInitials($store.getters.getAccount.displayName) }}
                  </span>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>{{ $store.getters.getAccount.displayName }}</v-list-item-title>
                  <v-list-item-subtitle>{{ $store.getters.getAccount.email }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-divider />

            <v-list>
              <v-list-item
                nuxt
                to="/auth/logout"
              >
                <v-list-item-icon>
                  <v-icon>
                    mdi-logout
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    Logout
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <v-overlay
          :value="overlay"
          absolute
          opacity="0"
        />
      </v-app-bar>
      <div class="brello-content">
        <Nuxt />
        <v-overlay
          :value="overlay"
          absolute
          color="white"
          opacity="0.7"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </v-overlay>
      </div>
    </div>
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
  name: 'DefaultLayout',
  data: () => ({
    snackbar: false,
    snackbarColor: '',
    snackbarText: '',
    overlay: true,
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
    this.overlay = false
    this.$store.dispatch('setUserListener')
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
    },
    getInitials (name = '') {
      return name
        .split(' ')
        .reduce((acc, val) => {
          return acc + val[0]
        }, '')
    }
  }
}
</script>

<style lang="scss">
:root {
  overflow-y: hidden !important;
}
</style>

<style lang="scss" scoped>
a {
  color: white;
  text-decoration: none;
}

.brello-flex-container {
  height: 100vh; /* Use vh as a fallback for browsers that do not support Custom Properties */
  height: calc(var(--vh, 1vh) * 100);
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.brello-app-bar {
  flex: 0 0 auto;
}

.brello-content {
  min-height: 0;
  height: 100%;
  flex: 1 auto;
  overflow-y: auto;
  position: relative;
}
</style>
