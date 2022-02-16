<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <slot name="header" />
    <v-col
      v-for="b in boards"
      :key="`board-${b.id}`"
      cols="6"
      md="4"
      lg="3"
    >
      <LazyTrelloBoard :board="b" />
    </v-col>
    <v-hover v-slot="{ hover }">
      <v-col
        cols="6"
        md="4"
        lg="3"
      >
        <v-card
          rounded
          flat
          height="96"
          :color="`grey lighten-${hover? '2' : '4'}`"
          @click="$emit('add-board')"
        >
          <div class="fill-height d-flex align-center justify-center text-body-2">
            Create new board
          </div>
        </v-card>
      </v-col>
    </v-hover>
  </v-row>
</template>

<script>
export default {
  props: {
    boards: {
      type: Array,
      required: true
    }
  }
}
</script>
