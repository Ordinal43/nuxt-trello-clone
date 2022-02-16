<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <v-col cols="12" class="d-flex align-center">
      <v-avatar
        size="30"
        rounded
        class="mr-3"
        :style="{
          background: `linear-gradient(${workspace.color[0]}, ${workspace.color[1]})`
        }"
      >
        <span class="white--text text-uppercase font-weight-black">
          {{ workspace.title[0] }}
        </span>
      </v-avatar>
      <h4>{{ workspace.title }}</h4>
    </v-col>
    <v-col
      v-for="b in workspace.boards"
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
    workspace: {
      type: Object,
      required: true
    }
  }
}
</script>
