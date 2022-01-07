<template>
  <p>Sign out</p>
</template>
<script>
export default {
  name: 'AppLogout',
  async created () {
    await this.$fire.auth.signOut()
  }
}
</script>
