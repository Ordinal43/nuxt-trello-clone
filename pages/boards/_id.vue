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
          @delete-list="promptDelete"
          @create-card="createCard(l, ...arguments)"
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
    <v-dialog
      v-model="dialogDelete"
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
                @click="dialogDelete = false"
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
      deleteId: null,
      dialogDelete: false,
      deleting: false
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
    promptDelete (listId) {
      this.deleteId = listId
      this.dialogDelete = true
    },
    async deleteList () {
      const index = this.board.lists
        .findIndex(({ id }) => id === this.deleteId)

      if (index > -1) {
        this.deleting = true
        this.board.lists.splice(index, 1)
        try {
          await this.updateBoard()
        } catch (error) {
          //
        } finally {
          this.dialogDelete = false
          this.deleting = false
          this.deleteId = null
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
    }
  }
}
</script>

<style scoped>
.brello-fill-height {
  height: 100%;
}
</style>
