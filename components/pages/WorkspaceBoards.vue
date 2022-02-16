<template>
  <FetchPending v-if="$fetchState.pending" />
  <FetchError
    v-else-if="$fetchState.error"
    @retry="$fetch"
  />
  <div v-else>
    <template v-if="boards.length">
      <LazyTrelloWorkspace
        :boards="boards"
        @add-board=";"
      />
    </template>
    <template v-else>
      <img
        src="@/assets/undraw_scrum_board.svg"
        class="scrum-board px-4"
      >
      <p class="empty-board text--secondary text-body-2 text-center mx-auto pt-8">
        Boards are where work gets done in Brello.
        On a board, you can move cards between lists to keep projects, tasks, and more on track.
      </p>
      <div class="text-center pt-4">
        <v-btn
          small
          color="primary"
          @click="$emit('add-board')"
        >
          Create your first board
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    boards: []
  }),
  async fetch () {
    const snapshotBoards = await this.$fire.firestore
      .collection('users')
      .doc(this.getAccount.uid)
      .collection('boards')
      .where('workspace_id', '==', this.$route.params.ws_id)
      .orderBy('created_at', 'asc')
      .get()

    this.boards = snapshotBoards.docs.map(doc => doc.data())
  },
  computed: {
    ...mapGetters([
      'getAccount'
    ])
  },
  watch: {
    '$route.params.ws_id' () {
      this.$fetch()
    }
  }
}
</script>

<style lang="scss" scoped>
img.scrum-board {
  width: 100%;
  max-height: 200px;
}

p.empty-board {
  max-width: 500px;
}
</style>
