<template>
  <FetchPending v-if="$fetchState.pending" />
  <FetchError
    v-else-if="$fetchState.error"
    @retry="$fetch"
  />
  <div
    v-else
    class="brello-all-workspace"
  >
    <v-row class="flex-grow-0 flex-shrink-0">
      <v-col class="d-flex align-center">
        <h4 class="text-uppercase text--secondary">
          Your workspaces
        </h4>
      </v-col>
    </v-row>
    <v-row class="align-content-start">
      <v-col v-if="!getWorkspaces.length">
        <div class="text--secondary">
          You aren't a member of any workspaces yet.
          <span
            class="create-workspace-link"
            @click="$emit('open-dialog-workspace')"
          >
            Create a workspace
          </span>
        </div>
      </v-col>
      <v-col v-else>
        <LazyTrelloWorkspace
          v-for="w in getWorkspaces"
          :key="`workspace-${w.id}`"
          :workspace="w"
          @add-board="openDialogBoard(w.id)"
        />
      </v-col>
    </v-row>

    <!-- ============= Dialog create board ============= -->
    <v-dialog
      v-model="dialogBoard"
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
            <v-icon @click="dialogBoard = false">
              mdi-close
            </v-icon>
          </v-row>
          <v-form
            ref="formBoard"
            @submit.prevent=";"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  ref="inputBoardTitle"
                  v-model="board.title"
                  label="Board title"
                  name="title"
                  type="text"
                  required
                  validate-on-blur
                  :rules="[inputRequired]"
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
          :value="uploadingBoard"
        >
          <v-progress-circular
            indeterminate
          />
        </v-overlay>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'
import { mapGetters } from 'vuex'
import { MIMETYPE_IMAGES, inputRequired } from '@/utils/input_rules.utils'

export default {
  name: 'AllWorkspaces',
  data: () => ({
    dialogBoard: false,
    uploadingBoard: false,
    enableColor: false,
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
      images: [],
      workspace_id: ''
    },
    fileToUpload: {}
  }),
  async fetch () {
    const snapshotBoards = await this.$fire.firestore
      .collection('users')
      .doc(this.getAccount.uid)
      .collection('boards')
      .orderBy('created_at', 'asc')
      .get()

    this.boards = snapshotBoards.docs.map(doc => doc.data())
  },
  computed: {
    ...mapGetters([
      'getAccount',
      'getUser'
    ]),
    getWorkspaces () {
      let boardsClone = cloneDeep(this.boards)

      const workspacesNew = (cloneDeep(this.getUser.workspaces) || [])
        .map((workspace) => {
          const [selected, remaining] = boardsClone.reduce(([pass, fail], current) => {
            return current.workspace_id === workspace.id
              ? [[...pass, current], fail]
              : [pass, [...fail, current]]
          }, [[], []])

          workspace.boards = selected
          boardsClone = remaining
          return workspace
        })
      return workspacesNew
    }
  },
  watch: {
    dialogWorkspace (val) {
      if (!val) {
        this.resetWorkspaceForm()
      }
    },
    dialogBoard (val) {
      if (!val) {
        this.resetBoardForm()
      }
    }
  },
  mounted () {
    this.$fire.firestore
      .collection('users')
      .doc(this.getAccount.uid)
      .collection('boards')
      .orderBy('created_at', 'asc')
      .onSnapshot((querySnapshot) => {
        this.boards = querySnapshot.docs.map(doc => doc.data())
      })
  },
  methods: {
    inputRequired,
    /**
     * Board methods
     */
    openDialogBoard (workspaceID) {
      this.board.workspace_id = workspaceID
      this.dialogBoard = true
      setTimeout(() => {
        this.$refs.inputBoardTitle.focus()
      }, 100)
    },
    removeColor () {
      this.board.color = ''
      this.enableColor = false
    },
    resetBoardForm () {
      this.board = {
        title: '',
        color: '',
        image: {
          name: '',
          originalName: '',
          downloadURL: '',
          uuid: ''
        },
        images: [],
        workspace_id: ''
      }
      this.fileToUpload = {}
    },
    async createBoard () {
      if (this.$refs.formBoard.validate()) {
        const uuidBoard = uuidv4()
        this.uploadingBoard = true
        if (this.fileToUpload.file) {
          await this.uploadBoardImage(uuidBoard)
        } else {
          await this.uploadBoardData(uuidBoard)
        }
        // Reset board form data
        this.resetBoardForm()

        this.dialogBoard = false
        this.uploadingBoard = false
      }
    },
    async uploadBoardImage (uuidBoard) {
      const uuidImage = uuidv4()
      if (MIMETYPE_IMAGES.includes(this.fileToUpload.file.type)) {
        const itemFilename = `${uuidImage}-${this.fileToUpload.file.name}`
        const itemName = `images/${this.getAccount.uid}/boards/${uuidBoard}/${itemFilename}`

        const itemRef = this.$fire.storage.ref().child(itemName)
        const itemMeta = {
          customMetadata: {
            owner: this.getAccount.uid
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
    },
    async uploadBoardData (uuidBoard, itemRef) {
      try {
        this.board.id = uuidBoard
        this.board.created_at = this.$fireModule.firestore.FieldValue.serverTimestamp()

        await this.$fire.firestore
          .collection('users')
          .doc(this.getAccount.uid)
          .collection('boards')
          .doc(uuidBoard)
          .set(this.board)

        this.dialogBoard = false
        this.$refs.formBoard.reset()
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
        if (itemRef) {
          try {
            await itemRef.delete()
          } catch (error) {
            this.$store.commit('SET_ERROR', error)
          }
        }
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

<style lang="scss" scoped>
.brello-all-workspace {
  display: flex;
  flex-direction: column;
}
</style>
