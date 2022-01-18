<template>
  <v-container
    fluid
    class="brello-fill-height"
  >
    <div class="d-flex flex-column brello-fill-height">
      <div class="flex-grow-0 mb-2">
        <h3>{{ board.title }}</h3>
        <div class="text-caption">
          {{ board.dateCreated | formatDate }}
        </div>
      </div>
      <div class="flex-grow-1 d-flex align-start">
        <LazyTrelloList
          v-for="l in board.lists"
          :key="`list-${l.id}`"
          :list="l"
          @delete-list="promptDeleteList"
          @create-card="createCard(l, ...arguments)"
          @show-details="navigateToCard"
        />
        <v-card
          width="272"
          class="pa-2"
          color="#00000014"
          flat
          @click="dialogCreate = true"
        >
          <div class="pa-2">
            <div class="text-body-2">
              <v-icon small>
                mdi-plus
              </v-icon>
              Add {{ (board.lists || []).length? 'another' : 'a' }} list
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- ============= Dialog create List ============= -->
    <v-dialog
      :key="dialogCreate"
      v-model="dialogCreate"
      max-width="400"
      persistent
    >
      <v-card>
        <v-container>
          <v-row
            no-gutters
            align="center"
            justify="space-between"
            class="mb-2"
          >
            <h3>Add List</h3>
            <v-icon @click="dialogCreate = false">
              mdi-close
            </v-icon>
          </v-row>
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="list.title"
                  label="List title"
                  name="list_title"
                  type="text"
                  :rules="[v => !!v || 'List title is required']"
                  required
                />
              </v-col>
              <v-col
                cols="12"
                class="text-right"
              >
                <v-btn
                  color="primary"
                  @click="createList"
                >
                  Submit
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
        <v-overlay
          absolute
          :value="uploading"
        >
          <v-progress-circular
            indeterminate
          />
        </v-overlay>
      </v-card>
    </v-dialog>

    <!-- ============= Dialog delete List ============= -->
    <v-dialog
      v-model="dialogDeleteList"
      max-width="400"
      persistent
    >
      <v-card>
        <v-container>
          <v-row
            no-gutters
            align="center"
            justify="space-between"
            class="mb-2"
          >
            <h3>Delete List</h3>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              class="text-right"
            >
              <v-btn
                text
                @click="dialogDeleteList = false"
              >
                Cancel
              </v-btn>
              <v-btn
                color="red"
                @click="deleteList"
              >
                Delete
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
        <v-overlay
          absolute
          :value="deleting"
        >
          <v-progress-circular
            indeterminate
          />
        </v-overlay>
      </v-card>
    </v-dialog>

    <!-- ============= Dialog card details ============= -->
    <v-dialog
      v-model="showCardDetails"
      max-width="400"
      persistent
    >
      <NuxtChild
        :card="currentCard"
      />
    </v-dialog>
  </v-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

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
      dialogCreate: false,
      uploading: false,
      list: {
        title: ''
      },
      deleteListId: null,
      dialogDeleteList: false,
      deleting: false,
      currentCard: {}
    }
  },
  computed: {
    showCardDetails () {
      return !!this.$route.params.card_id
    }
  },
  mounted () {
    // get card object on initial page load if on card details page
    const cardId = this.$route.params.card_id
    if (cardId) {
      for (const list of this.board.lists) {
        const card = (list.cards || [])
          .find(card => card.id === cardId)

        if (card) {
          this.currentCard = card
          break
        }
      }
    }

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
  },
  methods: {
    updateBoard () {
      return this.$fire.firestore
        .collection('users')
        .doc(this.$store.getters.getUser.uid)
        .collection('boards')
        .doc(this.board.id)
        .update(this.board, { merge: true })
    },
    async createList () {
      if (this.$refs.form.validate()) {
        this.uploading = true
        this.list.id = uuidv4()
        this.list.cards = []
        this.list.dateCreated = Date.now()
        if (!this.board.lists) {
          this.board.lists = []
        }
        this.board.lists.push(this.list)
        try {
          await this.updateBoard()
        } catch (error) {
          //
        } finally {
          this.dialogCreate = false
          this.uploading = false
          this.list = {}
        }
      }
    },
    promptDeleteList (listId) {
      this.deleteListId = listId
      this.dialogDeleteList = true
    },
    async deleteList () {
      const index = this.board.lists
        .findIndex(({ id }) => id === this.deleteListId)

      if (index > -1) {
        this.deleting = true
        this.board.lists.splice(index, 1)
        try {
          await this.updateBoard()
        } catch (error) {
          //
        } finally {
          this.dialogDeleteList = false
          this.deleting = false
          this.deleteListId = null
        }
      }
    },
    async createCard (currentList, title) {
      if (!currentList.cards) {
        currentList.cards = []
      }
      const id = uuidv4()
      currentList.cards.push({ id, title })

      try {
        await this.updateBoard()
      } catch (error) {
        //
      }
    },
    navigateToCard (card) {
      this.currentCard = card
      this.$router.push(`/boards/${this.board.id}/card/${card.id}`)
    }
  }
}
</script>

<style scoped>
.brello-fill-height {
  height: 100%;
}
</style>
