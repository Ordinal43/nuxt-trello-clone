<template>
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
        <v-card
          class="elevation-5 mx-auto"
        >
          <v-card-text>
            <h3 class="font-weight-black mb-4">
              Log in to Brello
            </h3>
            <v-text-field
              v-model="auth.email"
              name="email"
              label="Enter e-mail"
              prepend-icon="mdi-account"
              type="text"
            />
            <v-text-field
              v-model="auth.password"
              name="password"
              label="Enter password"
              prepend-icon="mdi-lock"
              :append-icon="isShowPass ? 'mdi-eye-off' : 'mdi-eye'"
              :type="isShowPass ? 'text' : 'password'"
              @click:append="() => (isShowPass = !isShowPass)"
            />
          </v-card-text>
          <v-card-text>
            <v-btn
              block
              color="primary"
              :loading="loading"
              @click="login"
            >
              Log in
            </v-btn>
          </v-card-text>
          <v-snackbar
            v-model="snackbar"
            :timeout="5000"
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
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'AppLogin',
  data () {
    return {
      auth: {
        email: '',
        password: ''
      },
      isShowPass: false,
      loading: false,
      snackbar: false,
      snackbarText: ''
    }
  },
  watch: {
    '$store.state.user' () {
      this.$router.push({
        path: '/'
      })
    }
  },
  methods: {
    login () {
      this.loading = true
      this.$fire.auth.signInWithEmailAndPassword(
        this.auth.email,
        this.auth.password
      )
        .catch((error) => {
          this.loading = false
          this.snackbarText = error.message
          this.snackbar = true
        })
    }
  }
}
</script>
