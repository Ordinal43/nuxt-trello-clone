<template>
  <v-app>
    <v-app-bar
      app
      dense
    >
      <v-toolbar-title>
        <NuxtLink to="/">
          Brello
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
          #activator="{ on, attrs }"
        >
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-account-circle</v-icon>
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
              to="/auth/applogout"
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
    <v-main>
      <Nuxt />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>
