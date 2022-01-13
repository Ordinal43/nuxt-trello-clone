<template>
  <v-card
    rounded
    :style="`
      background-image: url(${board.image.downloadURL});
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    `"
    :color="board.color"
    :to="`/boards/${board.id}`"
    nuxt
  >
    <div class="bg-fade white--text pa-2">
      <h4>
        {{ board.title }}
      </h4>
      <div>
        {{ dayjs(board.dateCreated).fromNow() }}
      </div>
    </div>
  </v-card>
</template>

<script>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default {
  name: 'TrelloBoard',
  props: {
    board: { type: Object, required: true }
  },
  methods: {
    dayjs
  }
}
</script>

<style scoped>
.bg-fade {
  background-color: #00000073;
}
</style>
