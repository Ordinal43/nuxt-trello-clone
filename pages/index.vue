<template>
  <v-container class="fill-height">
    <FetchPending v-if="$fetchState.pending" />
    <FetchError v-else-if="$fetchState.error" />
    <div
      v-else
      class="brello-workspace"
    >
      <div
        class="brello-workspace-sidenav d-none d-sm-block"
      >
        <v-list dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text--secondary">
                Workspaces
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                x-small
                icon
                text
                @click="openDialogWorkspace"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <SidenavWorkspace
            :workspaces="user.workspaces"
          />
        </v-list>
      </div>
      <div
        class="brello-workspace-main"
      >
        <v-row class="flex-grow-0 flex-shrink-0">
          <v-col class="d-flex align-center">
            <h3 class="text-uppercase text--secondary">
              Your workspaces
            </h3>
          </v-col>
        </v-row>
        <v-row class="align-content-start">
          <v-col v-if="!getWorkspaces.length">
            <p class="text-subtitle-1 text-uppercase text--secondary font-weight-bold">
              your workspaces
            </p>
            <div class="text--secondary">
              You aren't a member of any workspaces yet.
              <span
                class="create-workspace-link"
                @click="dialogWorkspace = true"
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
      </div>
    </div>

    <!-- ============= Dialog create workspace ============= -->
    <v-dialog
      v-model="dialogWorkspace"
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
            <h3>Add Workspace</h3>
            <v-icon @click="dialogWorkspace = false;">
              mdi-close
            </v-icon>
          </v-row>
          <v-form
            ref="formWorkspace"
            @submit.prevent=";"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  ref="inputWorkspaceTitle"
                  v-model="workspaceTitle"
                  label="Workspace title"
                  name="Workspace title"
                  type="text"
                  required
                  validate-on-blur
                  :rules="[inputRequired]"
                />
              </v-col>
              <v-col cols="12">
                <v-btn
                  color="primary"
                  block
                  @click="createWorkspace"
                >
                  Submit
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
        <v-overlay
          absolute
          :value="uploadingWorkspace"
        >
          <v-progress-circular
            indeterminate
          />
        </v-overlay>
      </v-card>
    </v-dialog>

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
  </v-container>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'
import { MIMETYPE_IMAGES, inputRequired } from '@/utils/input_rules.utils'

const WORKSPACE_COLOR = [
  ['#cc4223', '#cb7d25'],
  ['#403294', '#0747a6'],
  ['#0747a6', '#008da6'],
  ['#b22865', '#cd5a91'],
  ['#006644', '#00875a']
]

const getRandomGradient = () => {
  const idx = Math.floor(Math.random() * WORKSPACE_COLOR.length)
  return WORKSPACE_COLOR[idx]
}

export default {
  name: 'IndexPage',
  data: () => ({
    workspaceTitle: '',
    dialogWorkspace: false,
    uploadingWorkspace: false,
    dialogBoard: false,
    uploadingBoard: false,
    enableColor: false,
    user: {},
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
    // Get created board list
    const userRef = this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)

    const boardsRef = this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)
      .collection('boards')
      .orderBy('created_at', 'asc')

    const [docUser, snapshotBoards] = await Promise.all([userRef.get(), boardsRef.get()])

    if (docUser.exists) {
      this.user = docUser.data()
    }
    this.boards = snapshotBoards.docs.map(doc => doc.data())
  },
  head: () => ({
    title: 'Home'
  }),
  computed: {
    getWorkspaces () {
      let boardsClone = cloneDeep(this.boards)

      const workspacesNew = (cloneDeep(this.user.workspaces) || [])
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
      .doc(this.$store.getters.getUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          this.user = doc.data()
        }
      })

    this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)
      .collection('boards')
      .orderBy('created_at', 'asc')
      .onSnapshot((querySnapshot) => {
        this.boards = querySnapshot.docs.map(doc => doc.data())
      })
  },
  methods: {
    inputRequired,
    /**
     * Workspace methods
     */
    openDialogWorkspace () {
      this.dialogWorkspace = true
      setTimeout(() => {
        this.$refs.inputWorkspaceTitle.focus()
      }, 100)
    },
    resetWorkspaceForm () {
      this.workspaceTitle = ''
    },
    async createWorkspace () {
      if (this.$refs.formWorkspace.validate()) {
        const uuidWorkspace = uuidv4()
        this.uploadingWorkspace = true
        if (!this.user.workspaces) {
          this.user.workspaces = []
        }
        this.user.workspaces.push({
          id: uuidWorkspace,
          title: this.workspaceTitle,
          color: getRandomGradient()
        })
        try {
          await this.$fire.firestore
            .collection('users')
            .doc(this.$store.getters.getUser.uid)
            .set(this.user)
        } catch (error) {
          this.$store.commit('SET_ERROR', error)
          this.user.workspaces.pop()
        }
        this.dialogWorkspace = false
        this.uploadingWorkspace = false
      }
    },
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
    },
    async uploadBoardData (uuidBoard, itemRef) {
      try {
        this.board.id = uuidBoard
        this.board.created_at = this.$fireModule.firestore.FieldValue.serverTimestamp()

        await this.$fire.firestore
          .collection('users')
          .doc(this.$store.getters.getUser.uid)
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

<style lang="scss">
.brello-workspace {
  display: flex;
  width: 100%;
  &-sidenav {
    width: 272px;
    flex: 0 0 auto;
  }
  &-main {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }
}

input,
textarea {
  width: 100%;
  outline: none;
}

textarea {
  resize: none;
  overflow-wrap: break-word;
}

.create-workspace-link {
  text-decoration: underline;
  &:hover {
    cursor: pointer;
  }
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
