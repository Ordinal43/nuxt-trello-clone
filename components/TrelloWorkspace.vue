<template>
  <v-row>
    <v-col cols="12">
      <h4>{{ workspace.title }}</h4>
    </v-col>
    <v-col
      v-for="b in workspace.boards"
      :key="`board-${b.id}`"
      cols="12"
      sm="4"
      md="3"
    >
      <LazyTrelloBoard :board="b" />
    </v-col>
    <v-hover v-slot="{ hover }">
      <v-col
        cols="12"
        sm="4"
        md="3"
      >
        <v-card
          rounded
          flat
          height="80"
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
    workspace: {
      type: Object,
      required: true
    }
  }
}
</script>
