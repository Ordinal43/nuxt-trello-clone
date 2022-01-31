<template>
  <v-container class="mt-3">
    <v-row align="center">
      <h2>My Boards</h2>
      <v-btn
        v-show="boards.length"
        small
        class="ml-4"
        @click="dialog = true"
      >
        <v-icon
          left
        >
          mdi-trello
        </v-icon>
        create
      </v-btn>
    </v-row>
    <v-row>
      <v-col v-if="$fetchState.pending">
        <p class="text-center text-caption">
          Fetching boards...
        </p>
      </v-col>
      <v-col v-else-if="$fetchState.error">
        <p class="text-center text-caption">
          An error occurred :(
        </p>
      </v-col>
      <template v-else>
        <div v-if="!boards.length">
          <p class="text-center">
            No boards yet...
          </p>
          <v-btn @click="dialog = true">
            <v-icon
              left
            >
              mdi-trello
            </v-icon>
            Add a board
          </v-btn>
        </div>
        <template v-else>
          <v-col
            v-for="b in boards"
            :key="`board-${b.id}`"
            sm="4"
            md="3"
            lg="2"
          >
            <LazyTrelloBoard :board="b" />
          </v-col>
        </template>
      </template>
    </v-row>
    <v-dialog
      :key="dialog"
      v-model="dialog"
      max-width="355"
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
            <h3>Add Board</h3>
            <v-icon @click="dialog = false">
              mdi-close
            </v-icon>
          </v-row>
          <v-form
            ref="form"
            @submit.prevent=";"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="board.title"
                  label="Board title"
                  name="title"
                  type="text"
                  :rules="[v => !!v || 'Board title is required']"
                  required
                />
              </v-col>
              <v-col
                cols="12"
                class="mb-2"
              >
                <p class="subtitle-2">
                  Board color
                </p>
                <v-row justify="center">
                  <v-btn
                    v-if="!enableColor"
                    small
                    depressed
                    @click="enableColor = true"
                  >
                    <v-icon left>
                      mdi-palette
                    </v-icon>
                    Choose
                  </v-btn>
                  <template v-else>
                    <v-color-picker
                      v-model="board.color"
                      class="mt-2"
                      hide-inputs
                    />
                    <v-btn
                      x-small
                      @click="removeColor"
                    >
                      no color
                    </v-btn>
                  </template>
                </v-row>
              </v-col>
              <v-col
                cols="12"
                class="mb-2"
              >
                <p class="subtitle-2">
                  Background
                </p>
                <v-row justify="center">
                  <v-btn
                    v-if="!fileToUpload.tempUrl"
                    small
                    depressed
                    @click="chooseImage"
                  >
                    <v-icon left>
                      mdi-image
                    </v-icon>
                    add
                  </v-btn>
                  <v-img
                    v-else
                    :src="fileToUpload.tempUrl"
                    max-width="300"
                    max-height="170"
                    class="pt-2 mt-2"
                  >
                    <v-btn
                      fab
                      x-small
                      absolute
                      right
                      class="mr-n2"
                      @click="resetFileInput()"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-img>
                </v-row>
                <input
                  ref="imageFileInput"
                  type="file"
                  accept="jpg, jpeg, png"
                  style="display: none;"
                  @change="previewImage($event)"
                >
              </v-col>
              <v-col cols="12">
                <v-btn
                  color="primary"
                  block
                  @click="createBoard"
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
    <v-snackbar
      v-model="snackbar"
      :timeout="5000"
      :color="snackbarColor"
    >
      {{ snackbarText }}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          icon
          v-bind="attrs"
          @click="snackbar = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'IndexPage',
  data () {
    return {
      enableColor: false,
      dialog: false,
      uploading: false,
      board: {
        title: '',
        color: '',
        image: {
          name: '',
          originalName: '',
          downloadURL: '',
          uuid: ''
        }
      },
      boards: [],
      fileToUpload: {},
      snackbar: false,
      snackbarColor: '',
      snackbarText: ''
    }
  },
  async fetch () {
    // Get created board list
    const boardsRef = this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)
      .collection('boards')

    const querySnapshot = await boardsRef
      .get()

    if (querySnapshot.docs.length > 0) {
      for (const doc of querySnapshot.docs) {
        const data = doc.data()
        data.id = doc.id
        this.boards.push(data)
      }
    }
  },
  mounted () {
    // Add listener to refresh board when data changes
    this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)
      .collection('boards')
      .onSnapshot((querySnapshot) => {
        if (querySnapshot.docs.length > 0) {
          this.boards = []
          for (const doc of querySnapshot.docs) {
            const data = doc.data()
            data.id = doc.id
            this.boards.push(data)
          }
        }
      })
  },
  methods: {
    removeColor () {
      this.board.color = ''
      this.enableColor = false
    },
    createBoard () {
      if (this.$refs.form.validate()) {
        const uuid = uuidv4()
        this.uploading = true
        if (this.fileToUpload.file) {
          const itemFilename = `${uuid}-${this.fileToUpload.file.name}`
          const itemName = `images/${this.$store.getters.getUser.uid}/boards/${uuid}/${itemFilename}`

          const itemRef = this.$fire.storage.ref().child(itemName)
          const itemMeta = {
            customMetadata: {
              owner: this.$store.getters.getUser.uid
            }
          }

          const task = itemRef.put(this.fileToUpload.file, itemMeta)
          return task.on(
            'state_changed',
            null,
            // on upload error
            (error) => {
              this.snackbarColor = 'red darken-1'
              this.snackbarText = error.message
              this.snackbar = true
              return false
            },
            // on upload success
            async () => {
              const url = await task.snapshot.ref.getDownloadURL()

              this.board.image = {
                name: itemFilename,
                originalName: this.fileToUpload.file.name,
                downloadURL: url,
                uuid
              }

              this.uploadBoardData(uuid, itemRef)
            }
          )
        } else {
          this.uploadBoardData(uuid)
        }
      }
    },
    async uploadBoardData (uuid, itemRef) {
      this.board.dateCreated = Date.now()
      try {
        await this.$fire.firestore
          .collection('users')
          .doc(this.$store.getters.getUser.uid)
          .collection('boards')
          .doc(uuid)
          .set(this.board)

        this.dialog = false
        this.$refs.form.reset()
      } catch (error) {
        this.snackbarColor = 'red darken-1'
        this.snackbarText = error.message
        this.snackbar = true

        if (itemRef) {
          try {
            itemRef.delete()
          } catch (error) {
            this.snackbarColor = 'red darken-1'
            this.snackbarText = error.message
            this.snackbar = true
          }
        }
      } finally {
        this.uploading = false
      }
    },
    chooseImage () {
      this.$refs.imageFileInput.click()
    },
    resetFileInput () {
      this.fileToUpload = {}
    },
    previewImage ($event) {
      const file = $event.target.files[0]
      this.fileToUpload = {
        file,
        tempUrl: URL.createObjectURL(file),
        originalName: file.name
      }
    }
  }
}
</script>

<style lang="scss">
input,
textarea {
  width: 100%;
  outline: none;
}

textarea {
  resize: none;
  overflow-wrap: break-word;
}

input.brello-input {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #fafbfc;;
  box-shadow: inset 0 0 0 2px #dfe1e6;
  &:hover {
    background-color: #ebecf0;
  }
  &:focus, &.active {
    background-color: #fff;
    box-shadow: inset 0 0 0 2px #0079bf;
  }
  &[disabled] {
    background-color: #dfe1e6;
    &:hover {
      cursor: not-allowed;
    }
  }
}
</style>
