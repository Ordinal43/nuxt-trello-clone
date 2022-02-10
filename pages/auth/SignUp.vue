<template>
  <v-card
    class="elevation-5 mx-auto"
  >
    <v-card-text>
      <v-form
        ref="formSignUp"
        @submit.prevent=";"
      >
        <h3 class="font-weight-black mb-4">
          Sign up for Brello
        </h3>
        <v-text-field
          v-model="auth.displayName"
          name="name"
          label="Enter your name"
          prepend-icon="mdi-account"
          type="text"
          validate-on-blur
          :rules="[inputRequired]"
        />
        <v-text-field
          v-model="auth.email"
          name="email"
          label="Enter e-mail"
          prepend-icon="mdi-email"
          type="text"
          validate-on-blur
          :rules="[inputRequired, inputEmail]"
        />
        <v-text-field
          v-model="auth.password"
          name="password"
          label="Enter password"
          prepend-icon="mdi-lock"
          validate-on-blur
          :append-icon="isShowPass ? 'mdi-eye-off' : 'mdi-eye'"
          :type="isShowPass ? 'text' : 'password'"
          :rules="[inputRequired]"
          @click:append="() => (isShowPass = !isShowPass)"
        />
        <v-text-field
          v-model="passwordConfirm"
          name="password confirm"
          label="Confirm password"
          type="password"
          :rules="[matchPassword]"
          :success="getMatchPassStatus"
          :append-icon="getMatchPassStatus? 'mdi-check' : ''"
        >
          <v-icon
            slot="prepend"
            color="transparent"
          >
            mdi-lock
          </v-icon>
        </v-text-field>
      </v-form>
    </v-card-text>
    <v-card-text>
      <v-btn
        block
        color="primary"
        :loading="loading"
        @click="signUp"
      >
        Sign up
      </v-btn>
    </v-card-text>
    <div class="text-body-1 text-center">
      OR
    </div>
    <v-card-text>
      <BtnGoogleSignIn />
    </v-card-text>
    <v-card-text>
      Already have an account?
      <NuxtLink to="/auth/login">
        Sign in
      </NuxtLink>
    </v-card-text>
  </v-card>
</template>

<script>
import { inputRequired, inputEmail } from '@/utils/input_rules.utils'

export default {
  name: 'AuthSignUp',
  layout: 'login',
  data: vm => ({
    auth: {
      displayName: '',
      email: '',
      password: ''
    },
    passwordConfirm: '',
    isShowPass: false,
    loading: false
  }),
  head: () => ({
    title: 'Sign up'
  }),
  computed: {
    getMatchPassStatus () {
      return !!this.passwordConfirm && (this.passwordConfirm === this.auth.password)
    }
  },
  methods: {
    inputRequired,
    inputEmail,
    matchPassword (v) {
      return v === this.auth.password || 'Password does not match!'
    },
    async signUp () {
      if (this.$refs.formSignUp.validate()) {
        this.loading = true
        try {
          const res = await this.$fire.auth.createUserWithEmailAndPassword(
            this.auth.email,
            this.auth.password
          )
          await res.user.updateProfile({
            displayName: this.auth.displayName
          })

          const { uid, email, displayName } = res.user
          this.$store.commit('SET_USER', { uid, email, displayName })
          this.$router.push({
            path: '/'
          })
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
