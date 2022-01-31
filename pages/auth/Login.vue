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
    <div class="text-body-1 text-center">
      OR
    </div>
    <v-card-text>
      <BtnGoogleSignIn />
    </v-card-text>
    <v-card-text>
      Don't have an account?
      <NuxtLink to="/auth/signup">
        Sign up for an account
      </NuxtLink>
    </v-card-text>
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
      loading: false
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
    async login () {
      this.loading = true
      try {
        await this.$fire.auth.signInWithEmailAndPassword(
          this.auth.email,
          this.auth.password
        )
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
