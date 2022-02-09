<template>
  <div
    v-if="$fetchState.pending"
    class="fill-height d-flex align-center justify-center"
  >
    Fetching...
  </div>
  <div
    v-else-if="$fetchState.error"
    class="fill-height d-flex align-center justify-center"
  >
    Error!
  </div>
  <div
    v-else-if="board"
    class="brello-board-container"
    :style="getBackgroundStyle"
  >
    <div class="brello-board-main">
      <div class="pa-3 d-flex">
        <span
          v-show="!isEditBoardTitle"
          class="brello-header-button text-h6"
          @click="showInputBoardTitle"
        >
          {{ board.title }}
        </span>
        <input
          v-show="isEditBoardTitle"
          ref="inputEditBoardTitle"
          :value="board.title"
          type="text"
          class="brello-input text-h6"
          @focus="mixin_resizeInputWidth"
          @input="mixin_resizeInputWidth"
          @keydown.enter.prevent="updateBoardTitle"
          @blur="updateBoardTitle"
        >
        <v-spacer />
        <span
          v-show="!isSidenav"
          class="brello-header-button"
          @click="isSidenav = true"
        >
          <v-icon>mdi-dots-horizontal</v-icon>
        </span>
      </div>
      <div class="brello-list-container pl-5 pr-2 pb-3">
        <TrelloList
          v-for="l in board.lists"
          :key="`list-${l.id}`"
          :list="l"
          @update-list-title="updateListTitle(l, ...arguments)"
          @delete-list="promptDeleteList"
          @create-card="createCard(l, ...arguments)"
          @show-details="navigateToCard(l, ...arguments)"
          @drop-card="dropCard(l, ...arguments)"
          @update-card="updateCard"
        />
        <v-card
          flat
          class="brello-list"
          :color="isCreateList ? '#EBECF0' : '#00000014'"
        >
          <div
            v-show="!isCreateList"
            class="pa-4"
            @click="showInputList"
          >
            <div class="text-body-2">
              <v-icon small>
                mdi-plus
              </v-icon>
              Add {{ (board.lists || []).length? 'another' : 'a' }} list
            </div>
          </div>
          <div
            v-show="isCreateList"
            class="pa-2"
          >
            <input
              ref="inputCreateList"
              v-model="list.title"
              type="text"
              placeholder="Enter list title..."
              class="text-body-2 py-2"
              @keydown.enter="createList"
            >
            <div class="mt-2">
              <v-btn
                small
                color="primary"
                @click="createList"
              >
                Add list
              </v-btn>
              <v-btn
                text
                small
                icon
                @click="isCreateList = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>
    </div>
    <v-expand-x-transition>
      <BoardSidenav
        v-show="isSidenav"
        v-model="board"
        @close="isSidenav = false"
        @update="updateBoardBasic"
        @delete-board="deleteBoard"
      />
    </v-expand-x-transition>

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
        @update-card="updateCard"
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
                @click="deleteCard"
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

    <v-overlay
      :value="isDeletingBoard"
      color="white"
    />
  </div>
  <div
    v-else
    class="fill-height d-flex align-center justify-center"
  >
    <div>
      <img
        src="~/assets/not-found.svg"
        alt="board-not-found.svg"
        height="160"
      >
      <p class="text-subtitle-1 mt-3 text-center">
        Board not found...
      </p>
      <div class="text-center">
        <v-btn
          depressed
          dark
          nuxt
          to="/"
          color="#026AA7"
        >
          <v-icon
            left
          >
            mdi-arrow-left
          </v-icon>
          Back to home page
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'
import { mixinInput } from '@/mixins/vue-mixins'

export default {
  name: 'BoardDetails',
  mixins: [
    mixinInput
  ],
  data: () => ({
    board: null,
    currentCard: null,
    isEditBoardTitle: false,
    isSidenav: false,

    isDeletingBoard: false,

    isCreateList: false,
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
  }),
  async fetch () {
    // Get board object
    const boardRef = this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)
      .collection('boards')
      .doc(this.$route.params.id)

    const docBoard = await boardRef.get()
    if (docBoard.exists) {
      this.board = docBoard.data()
    }

    // Get card object if card_id param is present
    const cardId = this.$route.params.card_id
    if (cardId) {
      const cardRef = boardRef
        .collection('cards')
        .doc(cardId)

      const docCard = await cardRef.get()
      if (docCard.exists) {
        this.currentCard = docCard.data()
      }
    }
  },
  head: vm => ({
    title: vm.$fetchState.pending ? '...' : (vm.board?.title || 'Board not found!')
  }),
  computed: {
    getBackgroundStyle () {
      return {
        'background-image': this.board.image.downloadURL ? `url(${this.board.image.downloadURL})` : false,
        'background-color': this.board.color,
        'background-repeat': 'repeat',
        'background-size': this.board.image.repeat ? 'auto' : 'cover',
        'background-attachment': 'fixed',
        'background-position': 'center'
      }
    },
    showCardDetails () {
      return !!this.$route.params.card_id
    }
  },
  mounted () {
    if (this.board) {
      this.mixin_resizeInputWidth({ target: this.$refs.inputEditBoardTitle })
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
        }
      })
  },
  methods: {
    /**
     * ============= Board methods =============
     */
    updateBoardPromise () {
      return this.$fire.firestore
        .collection('users')
        .doc(this.$store.getters.getUser.uid)
        .collection('boards')
        .doc(this.board.id)
        .update(this.board)
    },
    async updateBoardBasic () {
      try {
        await this.updateBoardPromise()
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
      }
    },
    showInputBoardTitle () {
      this.isEditBoardTitle = true
      this.$nextTick(() => {
        this.$refs.inputEditBoardTitle.focus()
      })
    },
    updateBoardTitle ({ target }) {
      this.isEditBoardTitle = false
      if (target.value && (target.value !== this.board.title)) {
        this.board.title = target.value
        this.updateBoardBasic()
      }
    },
    async deleteBoard () {
      this.isDeletingBoard = true
      try {
        const batch = this.$fire.firestore
          .batch()

        const boardRef = this.$fire.firestore
          .collection('users')
          .doc(this.$store.getters.getUser.uid)
          .collection('boards')
          .doc(this.board.id)

        const snapshot = await boardRef
          .collection('cards')
          .get()

        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref)
        })

        batch.delete(boardRef)

        await batch.commit()

        this.$store.commit('SET_ALERT', 'Board deleted!')
        this.$router.push('/')
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
      } finally {
        this.isDeletingBoard = false
      }
    },
    /**
     * ============= List methods =============
     */
    showInputList () {
      this.isCreateList = true
      this.$nextTick(() => {
        this.$refs.inputCreateList.focus()
      })
    },
    async createList () {
      if (this.list.title) {
        this.isCreateList = false
        this.list.id = uuidv4()
        this.list.cards = []
        this.list.dateCreated = Date.now()
        if (!this.board.lists) {
          this.board.lists = []
        }
        this.board.lists.push(this.list)
        try {
          await this.updateBoardPromise()
        } catch (error) {
          this.$store.commit('SET_ERROR', error)
          // remove locally inserted list
          this.board.lists.pop()
        } finally {
          this.list = {}
        }
      } else {
        this.$refs.inputCreateList.focus()
      }
    },
    async updateListTitle (currentList, title) {
      const oldTitle = currentList.title
      currentList.title = title
      try {
        await this.updateBoardPromise()
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
        currentList.title = oldTitle
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
          this.$store.commit('SET_ERROR', error)
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
        batch.set(newCardRef, {
          id: uuid,
          title,
          list_id: currentList.id
        })
        await batch.commit()
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
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
    async updateCard (detailedCard) {
      try {
        const idxList = this.board.lists
          .findIndex(({ id }) => id === detailedCard.list_id)
        const idxCard = this.board.lists[idxList].cards
          .findIndex(({ id }) => id === detailedCard.id)

        if (idxCard !== -1) {
          const cardList = this.board.lists[idxList].cards
          cardList.splice(idxCard, 1, cloneDeep(detailedCard))

          const batch = this.$fire.firestore
            .batch()

          const boardRef = this.$fire.firestore
            .collection('users')
            .doc(this.$store.getters.getUser.uid)
            .collection('boards')
            .doc(this.board.id)

          const cardRef = boardRef
            .collection('cards')
            .doc(detailedCard.id)

          batch.update(boardRef, this.board)
          batch.update(cardRef, detailedCard)
          await batch.commit()
        }
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
      }
    },
    promptDeleteCard () {
      this.dialogDeleteCard = true
    },
    async deleteCard () {
      this.deletingCard = true
      this.$router.replace(`/boards/${this.board.id}`)

      let deletedCard = {}
      let listIdx, cardIdx
      try {
        const batch = this.$fire.firestore
          .batch()

        // Ensure this.currentCard is not empty
        if (this.currentCard.id && this.currentCard.list_id) {
          // find index of list containing the card using currentCard's list_id
          listIdx = this.board.lists
            .findIndex(({ id }) => id === this.currentCard.list_id)

          if (listIdx > -1) {
            // find index of card to delete from list using currentCard's id
            cardIdx = this.board.lists[listIdx].cards
              .findIndex(({ id }) => id === this.currentCard.id)
            // delete card id from list, store the spliced element for error handling
            deletedCard = this.board.lists[listIdx].cards
              .splice(cardIdx, 1)[0]
          }

          const boardRef = this.$fire.firestore
            .collection('users')
            .doc(this.$store.getters.getUser.uid)
            .collection('boards')
            .doc(this.board.id)
          const cardRef = boardRef
            .collection('cards')
            .doc(this.currentCard.id)

          batch.delete(cardRef)
          batch.update(boardRef, this.board)
          await batch.commit()
        } else {
          throw (new Error('Card not found!'))
        }
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
        // re-insert locally deleted card
        this.board.lists[listIdx].cards
          .splice(cardIdx, 0, deletedCard)
      } finally {
        this.dialogDeleteCard = false
        this.deletingCard = false
        this.currentCard = {}
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
          await this.updateBoardPromise()
        } catch (error) {
          this.$store.commit('SET_ERROR', error)
          // return moved card from target to source list
          this.dropList.list.cards.splice(this.dropList.index, 1)
          this.dragList.list.cards.splice(this.dragList.index, 0, this.dragDropPayload)
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

<style lang="scss" scoped>
.brello-header-button {
  padding: 4px 8px;
  border-radius: 2px;
  background: white;
  display: flex;
  align-items: center;
  &:hover {
    cursor: pointer;
  }
}

.brello-board {
  &-container {
    height: 100%;
    width: 100%;
    display: flex;
  }
  &-main {
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    display: flex;
    flex-direction: column;
  }
  &-sidenav {
    flex: 0 0 auto;
    width: 339px;
    box-shadow: 0 12px 24px -6px #091e4240, 0 0 0 1px #091e4214;
  }
}

.brello-input {
  width: auto;
}

.brello-list-container {
  flex: 1 1 auto;
  display: flex;
  align-items: flex-start;
  overflow-x: scroll;
  // Override 'touch-action: none' from vue-dndrop
  touch-action: auto !important;
}

::v-deep .brello-list {
  flex: 1 0 auto;
  width: 272px;
  max-width: 272px;
}

input {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: inset 0 0 0 2px #0079bf;
}
</style>
