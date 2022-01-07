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
              @click="login"
            >
              Log in
            </v-btn>
          </v-card-text>
          <v-snackbar
            v-model="snackbar"
            :timeout="5000"
            absolute
            bottom
            centered
          >
            {{ snackbarText }}
            <v-btn
              text
              color="primary"
              @click="snackbar = false"
            >
              Close
            </v-btn>
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
      snackbar: false,
      snackbarText: ''
    }
  },
  methods: {
    login () {
      this.$fire.auth.signInWithEmailAndPassword(
        this.auth.email,
        this.auth.password
      ).catch((error) => {
        this.snackbarText = error.message
        this.snackbar = true
      })
    }
  }
}
</script>
