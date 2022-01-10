<template>
  <v-container class="mt-3">
    <v-row align="center">
      <h2>My Boards</h2>
      <v-btn
        small
        class="ml-4"
        @click="openDialogCreateBoard"
      >
        <v-icon
          left
        >
          mdi-trello
        </v-icon>
        create
      </v-btn>
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
            v-model="valid"
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
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="snackbar"
      :timeout="5000"
      absolute
      bottom
      centered
    >
      {{ snackbarText }}
      <v-btn
        text
        color="primary"
        @click="snackbar = false"
      >
        Close
      </v-btn>
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
      valid: false,
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
      currentImageId: '',
      fileToUpload: {},
      snackbar: false,
      snackbarText: ''
    }
  },
  methods: {
    openDialogCreateBoard () {
      this.currentImageId = uuidv4()
      this.dialog = true
    },
    removeColor () {
      this.board.color = ''
      this.enableColor = false
    },
    createBoard () {
      //
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
