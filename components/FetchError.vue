<template>
  <div class="mx-auto d-flex align-center justify-center">
    <div class="text-center">
      <p>Fetching Error!</p>
      <v-btn
        small
        depressed
        @click="$emit('retry')"
      >
        <v-icon left>
          mdi-refresh
        </v-icon>
        retry
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {}
</script>
