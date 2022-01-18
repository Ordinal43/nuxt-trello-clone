<template>
  <v-card>
    <v-card-text>
      <p>
        {{ card.id }}
      </p>
      <p>
        {{ card.title }}
      </p>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    card: { type: Object, required: true }
  }
}
</script>
