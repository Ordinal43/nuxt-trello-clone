<template>
  <v-card
    rounded
    :style="getBoardStyle"
    :color="board.color"
    :to="`/boards/${board.id}`"
    nuxt
  >
    <div class="bg-fade white--text pa-2">
      <h4>
        {{ board.title }}
      </h4>
      <p class="text-caption">
        {{ board.dateCreated | formatFromNow }}
      </p>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'TrelloBoard',
  props: {
    board: { type: Object, required: true }
  },
  computed: {
    getBoardStyle () {
      return {
        'background-image': this.board.image.downloadURL ? `url(${this.board.image.downloadURL})` : false,
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
        'background-position': 'center'
      }
    }
  }
}
</script>

<style scoped>
.bg-fade {
  background-color: #00000073;
}
</style>
