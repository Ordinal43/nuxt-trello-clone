<template>
  <div>
    <p>{{ board.title }}</p>
    <p>{{ board.dateCreated | formatFromNow }}</p>
  </div>
</template>

<script>
export default {
  name: 'BoardDetails',
  async asyncData ({ app, store, params }) {
    // Get board details
    const boardsRef = app.$fire.firestore
      .collection('users')
      .doc(store.getters.getUser.uid)
      .collection('boards')
      .doc(params.id)

    let board = {}
    await boardsRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          board = doc.data()
          board.id = params.id
        }
      })

    return { board }
  },
  data () {
    return {
      board: {}
    }
  },
  mounted () {
    // Add listener to refresh board when data changes
    this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)
      .collection('boards')
      .doc(this.$route.params.id)
      .onSnapshot((doc) => {
        if (doc.exists) {
          this.board = doc.data()
          this.board.id = this.$route.params.id
        }
      })
  }
}
</script>
