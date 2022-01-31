<template>
  <p>Sign out</p>
</template>
<script>
import Cookie from 'js-cookie'

export default {
  name: 'AuthLogout',
  async created () {
    await this.$fire.auth.signOut()
    await Cookie.remove('brello_access_token')
  }
}
</script>
