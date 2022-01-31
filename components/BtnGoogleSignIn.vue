<template>
  <v-btn
    block
    color="white"
    @click="googleLogin"
  >
    <v-icon left>
      $vuetify.icons.googleLogoColored
    </v-icon>
    Sign in with Google
  </v-btn>
</template>

<script>
export default {
  name: 'BtnGoogleSignIn',
  methods: {
    async googleLogin () {
      const provider = new this.$fireModule.auth.GoogleAuthProvider()
      try {
        await this.$fire.auth.signInWithPopup(provider)
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
      }
    }
  }
}
</script>
