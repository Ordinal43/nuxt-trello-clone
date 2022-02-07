<template>
  <v-card
    class="elevation-5 mx-auto"
  >
    <v-card-text>
      <v-form
        ref="formLogin"
        @submit.prevent=";"
      >
        <h3 class="font-weight-black mb-4">
          Log in to Brello
        </h3>
        <v-text-field
          v-model="auth.email"
          name="email"
          label="Enter e-mail"
          prepend-icon="mdi-account"
          type="text"
          validate-on-blur
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="auth.password"
          name="password"
          label="Enter password"
          prepend-icon="mdi-lock"
          validate-on-blur
          :append-icon="isShowPass ? 'mdi-eye-off' : 'mdi-eye'"
          :type="isShowPass ? 'text' : 'password'"
          :rules="[rules.required]"
          @click:append="() => (isShowPass = !isShowPass)"
        />
      </v-form>
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
import { required } from '@/utils/input_rules.utils'

export default {
  name: 'AuthLogin',
  layout: 'login',
  data: () => ({
    auth: {
      email: '',
      password: ''
    },
    rules: {
      required
    },
    isShowPass: false,
    loading: false
  }),
  head: () => ({
    title: 'Sign in'
  }),
  watch: {
    '$store.getters.getUser' () {
      this.$router.push({
        path: '/'
      })
    }
  },
  methods: {
    async login () {
      if (this.$refs.formLogin.validate()) {
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
}
</script>
