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
        <TrelloList
          v-for="l in board.lists"
          :key="`list-${l.id}`"
          :list="l"
          @delete-list="promptDeleteList"
          @create-card="createCard(l, ...arguments)"
          @show-details="navigateToCard(l, ...arguments)"
          @drop-card="dropCard(l, ...arguments)"
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
          <v-form
            ref="form"
            @submit.prevent="createList"
          >
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
          :value="deletingList"
        >
          <v-progress-circular
            indeterminate
          />
        </v-overlay>
      </v-card>
    </v-dialog>

    <!-- ============= Dialog card details ============= -->
    <v-dialog
      :value="showCardDetails"
      max-width="768"
      @click:outside="$router.go(-1)"
    >
      <NuxtChild
        :card="currentCard"
        @delete-card="promptDeleteCard"
      />
    </v-dialog>

    <!-- ============= Dialog delete Card ============= -->
    <v-dialog
      v-model="dialogDeleteCard"
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
            <h3>Delete Card</h3>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              class="text-right"
            >
              <v-btn
                text
                @click="dialogDeleteCard = false"
              >
                Cancel
              </v-btn>
              <v-btn
                color="red"
                @click="deleteCard(currentCard)"
              >
                Delete
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
        <v-overlay
          absolute
          :value="deletingCard"
        >
          <v-progress-circular
            indeterminate
          />
        </v-overlay>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'BoardDetails',
  async asyncData ({ app, store, params }) {
    let board = {}
    let currentCard = {}

    // Get board object
    const boardRef = app.$fire.firestore
      .collection('users')
      .doc(store.getters.getUser.uid)
      .collection('boards')
      .doc(params.id)

    const docBoard = await boardRef.get()
    if (docBoard.exists) {
      board = docBoard.data()
      board.id = docBoard.id
    }

    // Get card object if card_id param is present
    const cardId = params.card_id
    if (cardId) {
      const cardRef = boardRef
        .collection('cards')
        .doc(cardId)

      const docCard = await cardRef.get()
      if (docCard.exists) {
        currentCard = docCard.data()
        currentCard.id = docCard.id
      }
    }

    return { board, currentCard }
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
      deletingList: false,

      dialogDeleteCard: false,
      deletingCard: false,

      dragList: null,
      dropList: null,
      dragDropPayload: null
    }
  },
  computed: {
    showCardDetails () {
      return !!this.$route.params.card_id
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
          this.board.id = doc.id
        }
      })
  },
  methods: {
    /**
     * ============= List methods =============
     */
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
          await this.$fire.firestore
            .collection('users')
            .doc(this.$store.getters.getUser.uid)
            .collection('boards')
            .doc(this.board.id)
            .update(this.board)
        } catch (error) {
          // remove locally inserted list
          this.board.lists.pop()
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
        this.deletingList = true
        const cards = [...(this.board.lists[index].cards || [])]

        const deletedList = this.board.lists.splice(index, 1)[0]
        try {
          const batch = this.$fire.firestore
            .batch()

          const boardRef = this.$fire.firestore
            .collection('users')
            .doc(this.$store.getters.getUser.uid)
            .collection('boards')
            .doc(this.board.id)

          for (const card of cards) {
            const deleteRef = boardRef
              .collection('cards')
              .doc(card.id)

            batch.delete(deleteRef)
          }
          batch.update(boardRef, this.board)

          await batch.commit()
        } catch (error) {
          // re-insert locally deleted list
          this.board.lists.splice(index, 0, deletedList)
        } finally {
          this.dialogDeleteList = false
          this.deletingList = false
          this.deleteListId = null
        }
      }
    },
    /**
     * ============= Card methods =============
     */
    async createCard (currentList, title) {
      const uuid = uuidv4()

      if (!currentList.cards) {
        currentList.cards = []
      }
      currentList.cards.push({
        id: uuid,
        title
      })

      try {
        const batch = this.$fire.firestore
          .batch()

        const boardRef = this.$fire.firestore
          .collection('users')
          .doc(this.$store.getters.getUser.uid)
          .collection('boards')
          .doc(this.board.id)

        const newCardRef = boardRef
          .collection('cards')
          .doc(uuid)

        batch.update(boardRef, this.board)
        batch.set(newCardRef, { title })
        await batch.commit()
      } catch (error) {
        // remove locally inserted card
        currentList.cards.pop()
      }
    },
    navigateToCard (currentList, card) {
      this.currentCard = {
        ...card,
        list_id: currentList.id
      }
      this.$router.push(`/boards/${this.board.id}/card/${card.id}`)
    },
    promptDeleteCard () {
      this.dialogDeleteCard = true
    },
    async deleteCard (currentCard) {
      this.deletingCard = true
      this.$router.replace(`/boards/${this.board.id}`)

      let deletedCard = {}
      let listIdx, cardIdx
      try {
        const batch = this.$fire.firestore
          .batch()

        const boardRef = this.$fire.firestore
          .collection('users')
          .doc(this.$store.getters.getUser.uid)
          .collection('boards')
          .doc(this.board.id)

        // find index of list containing the card using currentCard's list_id
        listIdx = this.board.lists
          .findIndex(({ id }) => id === currentCard.list_id)

        if (listIdx > -1) {
          // find index of card to delete from list using currentCard's id
          cardIdx = this.board.lists[listIdx].cards
            .findIndex(({ id }) => id === currentCard.id)
          // delete card id from list, store the spliced element for error handling
          deletedCard = this.board.lists[listIdx].cards
            .splice(cardIdx, 1)[0]
        }

        const cardRef = boardRef
          .collection('cards')
          .doc(currentCard.id)

        batch.update(boardRef, this.board)
        batch.delete(cardRef)

        await batch.commit()
      } catch (error) {
        // re-insert locally deleted card
        this.board.lists[listIdx].cards
          .splice(cardIdx, 0, deletedCard)
      } finally {
        this.dialogDeleteCard = false
        this.deletingCard = false
      }
    },
    dropCard (currentList, droppedResult) {
      /**
       * This method will ALWAYS BE CALLED TWICE (by the source list and the target list.)
       * We'll handle the data changes for each of them here.
       */
      const { removedIndex, addedIndex, payload } = droppedResult
      if (removedIndex === null && addedIndex === null) {
        return
      }
      const result = [...currentList.cards]

      if (removedIndex !== null) {
        /**
         * Will only run once to remove the dragged item from the SOURCE list container
         */
        this.dragDropPayload = result.splice(removedIndex, 1)[0]
        this.dragList = {
          list: currentList,
          index: removedIndex
        }
      }
      if (addedIndex !== null) {
        /**
         * Will only run once to add the dropped item to the TARGET list container
         */
        result.splice(addedIndex, 0, payload)
        this.dropList = {
          list: currentList,
          index: addedIndex
        }
      }
      currentList.cards = result
      this.updateDragDropCards()
    },
    async updateDragDropCards () {
      /**
       * Only update firestore when both drag and drop objects are defined
       */
      if (this.dragList && this.dropList) {
        try {
          await this.$fire.firestore
            .collection('users')
            .doc(this.$store.getters.getUser.uid)
            .collection('boards')
            .doc(this.board.id)
            .update(this.board)
        } catch (error) {
          // return moved card from target to source list
          this.dropList.splice(this.dropList.index, 1)
          this.dragList.splice(this.dragList.index, 0, this.dragDropPayload)
        } finally {
          // reset drag and drop objects
          this.dragList = null
          this.dropList = null
          this.dragDropPayload = null
        }
      }
    }
  }
}
</script>

<style scoped>
.brello-fill-height {
  height: 100%;
}
</style>
