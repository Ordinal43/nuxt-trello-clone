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

          <v-card>
            <v-list>
              <v-list-item>
                <v-list-item-avatar>
                  <img
                    src="https://cdn.vuetifyjs.com/images/john.jpg"
                    alt="John"
                  >
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>[Your name here]</v-list-item-title>
                  <v-list-item-subtitle>{{ $store.getters.getUser.email }}</v-list-item-subtitle>
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
      </v-app-bar>
      <div class="brello-content">
        <Nuxt />
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
export default {
  name: 'DefaultLayout',
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

<style lang="scss">
html {
  overflow-y: hidden !important;
}
</style>

<style lang="scss" scoped>
a {
  color: white;
  text-decoration: none;
}

.brello-flex-container {
  height: 100vh;
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
}
</style>
