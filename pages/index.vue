<template>
  <v-container class="fill-height">
    <v-row class="fill-height">
      <v-col class="d-flex flex-column">
        <v-row class="flex-grow-0 flex-shrink-0">
          <v-col class="d-flex align-center">
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
          </v-col>
        </v-row>
        <FetchPending v-if="$fetchState.pending" />
        <FetchError v-else-if="$fetchState.error" />
        <v-row v-else class="align-content-start">
          <v-col
            v-if="!boards.length"
            class="text-center"
          >
            <img
              src="~/assets/no-boards.svg"
              alt="no-boards.svg"
              height="160"
              class="my-5"
            >
            <p class="text-h4 mt-3 text-center">
              "Looks clean..."
            </p>
            <div class="text-center">
              You have no boards at the moment.
              <v-btn
                small
                depressed
                dark
                color="#026AA7"
                class="ml-3"
                @click="dialog = true"
              >
                <v-icon
                  left
                >
                  mdi-trello
                </v-icon>
                Add one!
              </v-btn>
            </div>
          </v-col>
          <template v-else>
            <v-col
              v-for="b in boards"
              :key="`board-${b.id}`"
              cols="12"
              sm="4"
              md="3"
              lg="2"
            >
              <LazyTrelloBoard :board="b" />
            </v-col>
          </template>
        </v-row>
      </v-col>
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
                  required
                  validate-on-blur
                  :rules="[v => !!v || 'Board title is required']"
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
                      @click="resetFileInput"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-img>
                </v-row>
                <input
                  ref="imageFileInput"
                  type="file"
                  accept="image/jpg, image/jpeg, image/png"
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
  </v-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import { MIMETYPE_IMAGES } from '@/utils/input_rules.utils'

export default {
  name: 'IndexPage',
  data: () => ({
    enableColor: false,
    dialog: false,
    uploading: false,
    boards: [],
    board: {
      title: '',
      color: '',
      image: {
        name: '',
        originalName: '',
        downloadURL: '',
        uuid: ''
      },
      images: []
    },
    fileToUpload: {}
  }),
  async fetch () {
    // Get created board list
    const boardsRef = this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)
      .collection('boards')

    const querySnapshot = await boardsRef
      .get()

    this.boards = querySnapshot.docs.map(doc => doc.data())
  },
  head: () => ({
    title: 'Home'
  }),
  mounted () {
    // Add listener to refresh board when data changes
    this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)
      .collection('boards')
      .onSnapshot((querySnapshot) => {
        this.boards = querySnapshot.docs.map(doc => doc.data())
      })
  },
  methods: {
    removeColor () {
      this.board.color = ''
      this.enableColor = false
    },
    async createBoard () {
      if (this.$refs.form.validate()) {
        const uuidBoard = uuidv4()
        const uuidImage = uuidv4()
        this.uploading = true
        if (this.fileToUpload.file) {
          if (MIMETYPE_IMAGES.includes(this.fileToUpload.file.type)) {
            const itemFilename = `${uuidImage}-${this.fileToUpload.file.name}`
            const itemName = `images/${this.$store.getters.getUser.uid}/boards/${uuidBoard}/${itemFilename}`

            const itemRef = this.$fire.storage.ref().child(itemName)
            const itemMeta = {
              customMetadata: {
                owner: this.$store.getters.getUser.uid
              }
            }

            try {
              const snapshot = await itemRef.put(this.fileToUpload.file, itemMeta)
              const url = await snapshot.ref.getDownloadURL()
              const image = {
                name: itemFilename,
                originalName: this.fileToUpload.file.name,
                downloadURL: url,
                uuid: uuidImage
              }
              this.board.image = image
              this.board.images.push(image)

              this.uploadBoardData(uuidBoard, itemRef)
            } catch (error) {
              this.$store.commit('SET_ERROR', error)
            }
          } else {
            alert('Invalid file!')
          }
        } else {
          this.uploadBoardData(uuidBoard)
        }
      }
    },
    async uploadBoardData (uuidBoard, itemRef) {
      this.board.id = uuidBoard
      this.board.dateCreated = Date.now()
      try {
        await this.$fire.firestore
          .collection('users')
          .doc(this.$store.getters.getUser.uid)
          .collection('boards')
          .doc(uuidBoard)
          .set(this.board)

        this.dialog = false
        this.$refs.form.reset()
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
        if (itemRef) {
          try {
            await itemRef.delete()
          } catch (error) {
            this.$store.commit('SET_ERROR', error)
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
