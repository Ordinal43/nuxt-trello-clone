<template>
  <div class="brello-board-sidenav">
    <v-list-item class="brello-board-sidenav-header">
      <v-list-item-content>
        <v-list-item-title class="font-weight-medium">
          Edit board
        </v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn
          icon
          small
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>

    <v-divider class="mx-3" />

    <div class="brello-board-sidenav-content">
      <v-card-text class="d-flex align-center">
        <span>
          Board color
        </span>
        <v-spacer />
        <v-menu
          v-model="colorMenu"
          :close-on-content-click="false"
          offset-y
        >
          <template #activator="{ on }">
            <v-btn
              depressed
              class="px-1"
              v-on="on"
            >
              <v-avatar
                :color="value.color || '#00000000'"
                size="25"
              />
              <v-icon class="pl-1">
                mdi-chevron-down
              </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="d-flex align-center">
              <v-switch
                v-model="isUseColor"
                inset
                hide-details
                label="Use color"
                class="mt-0"
              />
            </v-card-text>
            <v-color-picker
              v-model="newColor"
              :disabled="!isUseColor"
              dot-size="25"
              hide-mode-switch
              mode="hexa"
            />
            <v-card-actions>
              <v-btn
                color="primary"
                @click="updateColor"
              >
                save
              </v-btn>
              <v-btn
                v-show="showResetColor"
                text
                @click="newColor = value.color"
              >
                reset
              </v-btn>
              <v-btn
                icon
                small
                @click="colorMenu = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-card-text>

      <v-card-text>
        <p>Image</p>
        <v-row>
          <v-col cols="6">
            <v-hover v-slot="{ hover }">
              <v-card
                flat
                rounded
                height="100"
                :color="`grey lighten-${hover? '3' : '5'}`"
                class="d-flex align-center justify-center"
                @click="chooseImage"
              >
                <v-icon large>
                  mdi-plus
                </v-icon>
              </v-card>
            </v-hover>
          </v-col>
          <v-col
            v-for="(image, i) in value.images"
            :key="image.name"
            cols="6"
          >
            <v-menu
              v-model="imageMenus[i]"
              :close-on-content-click="false"
              offset-y
            >
              <template #activator="{ on }">
                <v-hover v-slot="{ hover }">
                  <v-card
                    flat
                    rounded
                    height="100"
                    :ripple="false"
                    @click="setAsBackground(image)"
                  >
                    <v-img
                      :src="image.downloadURL"
                      :alt="image.originalName"
                      height="100"
                      class="align-end"
                    >
                      <v-sheet
                        v-show="hover"
                        class="image-options white--text px-2 py-1"
                        v-on="on"
                      >
                        Options
                        <v-icon color="white">
                          mdi-dots-horizontal
                        </v-icon>
                      </v-sheet>
                    </v-img>
                  </v-card>
                </v-hover>
              </template>
              <v-card>
                <v-list
                  dense
                  subheader
                >
                  <v-subheader>Display type</v-subheader>

                  <v-list-item @click="setBackgroundRepeat(false)">
                    <v-list-item-content>
                      <v-list-item-title>
                        Cover
                        <v-icon
                          v-if="!value.image.repeat"
                          small
                          class="ml-2 pb-1"
                        >
                          mdi-check
                        </v-icon>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item @click="setBackgroundRepeat(true)">
                    <v-list-item-content>
                      <v-list-item-title>
                        Tile
                        <v-icon
                          v-if="value.image.repeat"
                          small
                          class="ml-2 pb-1"
                        >
                          mdi-check
                        </v-icon>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-divider class="mb-2" />

                  <v-list-item @click="deleteImage(i, image)">
                    <v-list-item-content>
                      <v-list-item-title>
                        Delete image
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </v-col>
          <v-col
            v-show="isUploading"
          >
            <v-card
              flat
              rounded
              height="100"
              :ripple="false"
            >
              <v-img
                :src="tempUrl"
                alt="temporary image"
                height="100"
                class="align-end"
              >
                <v-sheet
                  class="image-options white--text px-2 py-1"
                >
                  Uploading
                  <v-icon color="white">
                    mdi-dots-horizontal
                  </v-icon>
                </v-sheet>
              </v-img>
            </v-card>
          </v-col>
        </v-row>
        <input
          ref="imageFileInput"
          type="file"
          accept="image/jpg, image/jpeg, image/png"
          style="display: none;"
          @change="uploadImage"
        >
      </v-card-text>
    </div>
    <v-card-text class="brello-board-sidenav-bottom">
      <v-menu
        v-model="deleteBoardMenu"
        :close-on-content-click="false"
      >
        <template #activator="{ on }">
          <v-btn
            block
            text
            color="red darken-1"
            v-on="on"
          >
            <v-icon left>
              mdi-delete
            </v-icon>
            delete board
          </v-btn>
        </template>
        <v-card width="320">
          <v-container>
            <v-row>
              <v-col class="d-flex align-center justify-space-between">
                <h4>Delete board</h4>
                <v-icon @click="deleteBoardMenu = false">
                  mdi-close
                </v-icon>
              </v-col>
              <v-col cols="12">
                You can't recover its content afterwards. Delete this board?
              </v-col>
              <v-col cols="12">
                <v-btn
                  depressed
                  block
                  dark
                  color="red darken-1"
                  @click="deleteBoard"
                >
                  delete
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-menu>
    </v-card-text>
  </div>
</template>

<script>
import tap from 'lodash/tap'
import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'
import { MIMETYPE_IMAGES } from '@/utils/input_rules.utils'

export default {
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data: vm => ({
    colorMenu: false,
    newColor: vm.value.color,
    isUseColor: !!vm.value.color,
    imageMenus: [],
    deleteBoardMenu: false,
    isUploading: false,
    tempUrl: null
  }),
  computed: {
    showResetColor () {
      return this.value.color !== this.newColor
    }
  },
  methods: {
    updateBoard (callback) {
      // alert parent to update value locally
      this.$emit('input', tap(cloneDeep(this.value), callback))
      // alert parent to update value on database
      this.$emit('update')
    },
    updateColor () {
      this.updateBoard((board) => {
        board.color = this.isUseColor ? this.newColor : ''
      })
      this.colorMenu = false
    },
    chooseImage () {
      this.$refs.imageFileInput.click()
    },
    async uploadImage ($event) {
      const file = $event.target.files[0]

      this.isUploading = true
      this.tempUrl = URL.createObjectURL(file)
      if (file && MIMETYPE_IMAGES.includes(file.type)) {
        const uuidImage = uuidv4()
        const itemFilename = `${uuidImage}-${file.name}`
        const itemName = `images/${this.$store.getters.getAccount.uid}/boards/${this.value.id}/${itemFilename}`

        const itemRef = this.$fire.storage.ref().child(itemName)
        const itemMeta = {
          customMetadata: {
            owner: this.$store.getters.getAccount.uid
          }
        }

        try {
          const snapshot = await itemRef.put(file, itemMeta)
          const url = await snapshot.ref.getDownloadURL()
          const image = {
            name: itemFilename,
            originalName: file.name,
            downloadURL: url,
            uuid: uuidImage
          }

          this.updateBoard((board) => {
            board.image = image
            board.images.unshift(image)
          })
        } catch (error) {
          this.$store.commit('SET_ERROR', error)
          return false
        } finally {
          this.isUploading = false
          this.tempUrl = null
        }
      } else {
        alert('Invalid file!')
      }
    },
    setAsBackground (image) {
      if (image.name !== this.value.image.name) {
        this.updateBoard((board) => {
          board.image = image
        })
      }
    },
    async deleteImage (index, image) {
      this.imageMenus[index] = false
      const itemName = `images/${this.$store.getters.getAccount.uid}/boards/${this.value.id}/${image.name}`
      const itemRef = this.$fire.storage.ref().child(itemName)

      let deletedImage
      let isCurrentBackground = false
      try {
        this.updateBoard((board) => {
          if (board.image.name === image.name) {
            isCurrentBackground = true
            board.image = {}
          }
          deletedImage = board.images.splice(index, 1)[0]
        })
        await itemRef.delete(itemRef)
        this.$store.commit('SET_ALERT', 'Background deleted!')
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
        this.updateBoard((board) => {
          if (isCurrentBackground) {
            board.image = image
          }
          board.images.splice(index, 0, deletedImage)
        })
      }
    },
    setBackgroundRepeat (value) {
      this.updateBoard((board) => {
        board.image.repeat = value
      })
    },
    deleteBoard () {
      this.deleteBoardMenu = false
      this.$emit('delete-board')
    }
  }
}
</script>

<style lang="scss" scoped>
.brello-board-sidenav {
  background-color: #F4F5F7;
  display: flex;
  flex-direction: column;
  &-header {
    flex: 0 0 auto;
  }
  &-content {
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
  }
  &-bottom {
    flex: 0 0 auto;
  }
}

.image-options {
  background-color: #0000005c;
  &:hover {
    cursor: pointer;
    background-color: #00000080;
  }
}
</style>
