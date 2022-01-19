<template>
  <v-card>
    <v-container>
      <v-row
        no-gutters
        align="start"
        justify="space-between"
        class="mb-2"
      >
        <h3>{{ card.title }}</h3>
        <v-icon @click="$router.go(-1)">
          mdi-close
        </v-icon>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            color="red"
            @click="$emit('delete-card')"
          >
            delete
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  props: {
    card: { type: Object, required: true }
  }
}
</script>
