<template>
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
    <v-card-text>
      <NuxtLink to="/auth/sign-up">
        Sign Up for an account
      </NuxtLink>
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
</template>
<script>
export default {
  name: 'AuthLogin',
  layout: 'login',
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
