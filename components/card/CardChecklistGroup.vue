<template>
  <Container
    :get-child-payload="getChildPayload"
    :tag="containerTagOptions"
    :drop-placeholder="dropPlaceholderOptions"
    lock-axis="y"
    @drop="onDrop"
  >
    <Draggable
      v-for="(cl, clIdx) in value"
      :key="`checklist-${cl.id}`"
      :drag-not-allowed="!!menu[cl.id]"
    >
      <v-overlay
        absolute
        opacity="0"
        :value="!!menu[cl.id]"
      />
      <v-card
        flat
        color="#F4F5F7"
        class="pa-2"
      >
        <div class="d-flex align-start">
          <v-icon
            class="brello-card-icon pr-4"
          >
            mdi-checkbox-marked-outline
          </v-icon>
          <div class="brello-card-header">
            <div
              v-if="cl.id !== activeInputEditTitle"
              class="d-flex"
            >
              <p
                class="brello-card-header text-subtitle-1 font-weight-medium"
                @click="openEditChecklistTitle(cl.id)"
              >
                {{ cl.title }}
              </p>
              <v-menu
                v-model="menu[cl.id]"
                :close-on-content-click="false"
                offset-y
              >
                <template #activator="{ on }">
                  <v-btn
                    small
                    depressed
                    color="#091E420A"
                    class="brello-card-icon ml-3"
                    v-on="on"
                  >
                    Delete
                  </v-btn>
                </template>
                <v-card width="300" color="#F4F5F7">
                  <v-container>
                    <v-row>
                      <v-col class="d-flex align-center justify-space-between">
                        <h4>Delete checklist?</h4>
                        <v-icon @click="menu[cl.id] = false">
                          mdi-close
                        </v-icon>
                      </v-col>
                      <v-col cols="12">
                        Deleting a checklist is permanent and there is no way to get it back.
                      </v-col>
                      <v-col cols="12">
                        <v-btn
                          color="red darken-2 white--text"
                          block
                          @click="deleteChecklist(clIdx)"
                        >
                          delete
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </v-menu>
            </div>
            <div
              v-else
              class="mb-4"
            >
              <textarea
                :ref="`textarea-title-${cl.id}`"
                :value="cl.title"
                class="add-item text-subtitle-1 font-weight-medium"
                placeholder="Add an item"
                @focus="mixin_resizeTextarea"
                @input="mixin_resizeTextarea"
              />
              <div class="mt-1">
                <v-btn
                  small
                  color="primary"
                  @click="updateChecklistTitle(cl, clIdx)"
                >
                  Save
                </v-btn>
                <v-btn
                  text
                  small
                  icon
                  @click="activeInputEditTitle = undefined"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
        <div class="ml-sm-10">
          <div
            v-if="cl.items.length"
            class="d-flex align-center mb-1"
          >
            <div class="brello-percent mr-3 text-center text-caption">
              {{ getProgress(cl) }}%
            </div>
            <v-progress-linear
              rounded
              height="7"
              :color="getProgress(cl) === 100? 'success' : 'primary'"
              :value="getProgress(cl)"
            />
          </div>
          <div
            v-for="(item, itemIdx) in cl.items"
            :key="`checklist-item-${item.id}`"
            class="d-flex py-2"
          >
            <v-checkbox
              :value="item.id"
              :input-value="cl.checked"
              class="brello-card-icon ma-0 pa-0"
              hide-details
              @change="updateChecked(clIdx, $event)"
            />
            <div class="brello-card-header ml-3">
              <div
                v-if="activeInputEditItem !== item.id"
                :class="{
                  'text-decoration-line-through': cl.checked.includes(item.id)
                }"
                @click="openEditItem(item.id)"
              >
                {{ item.name }}
              </div>
              <template v-else>
                <textarea
                  :ref="`textarea-edit-item-${item.id}`"
                  :value="item.name"
                  class="add-item text-subtitle-1"
                  @focus="mixin_resizeTextarea"
                  @input="mixin_resizeTextarea"
                  @keydown.enter.prevent="updateItem(clIdx, item.id, itemIdx)"
                  @blur="activeInputEditItem = undefined"
                />
                <div class="mt-1">
                  <v-btn
                    small
                    color="primary"
                    @click="updateItem(clIdx, item.id, itemIdx)"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    text
                    small
                    icon
                    @click="activeInputEditItem = undefined"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
              </template>
            </div>
          </div>

          <div class="mt-4">
            <v-btn
              v-if="activeInputAddItem !== cl.id"
              small
              depressed
              color="#091E420A"
              @click="openAddTextarea(cl.id)"
            >
              Add an item
            </v-btn>
            <template v-else>
              <textarea
                :ref="`textarea-add-${cl.id}`"
                v-model="name"
                class="add-item text-subtitle-1"
                placeholder="Add an item"
                @focus="mixin_resizeTextarea"
                @input="mixin_resizeTextarea"
                @keydown.enter.prevent="addChecklistItem(cl.id, clIdx)"
              />
              <div class="mt-1">
                <v-btn
                  small
                  color="primary"
                  @click="addChecklistItem(cl.id, clIdx)"
                >
                  Add
                </v-btn>
                <v-btn
                  text
                  small
                  icon
                  @click="closeAddTextarea"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </template>
          </div>
        </div>
      </v-card>
    </Draggable>
  </Container>
</template>

<script>
import { Container, Draggable } from 'vue-dndrop'
import { tap, cloneDeep } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { mixinTextArea } from '@/mixins/vue-mixins'

export default {
  components: {
    Container, Draggable
  },
  mixins: [
    mixinTextArea
  ],
  props: {
    value: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data () {
    return {
      containerTagOptions: {
        value: 'div',
        props: {
          class: 'my-5'
        }
      },
      dropPlaceholderOptions: {
        className: 'drop-preview',
        showOnTop: false
      },
      activeInputEditTitle: undefined,
      activeInputAddItem: undefined,
      activeInputEditItem: undefined,
      menu: {},
      name: ''
    }
  },
  methods: {
    getChildPayload (clIdx) {
      return this.value[clIdx]
    },
    update (callback) {
      this.$emit('input', tap(cloneDeep(this.value), callback))
    },
    onDrop (droppedResult) {
      const { removedIndex, addedIndex, payload } = droppedResult
      // Only trigger update if position is changed
      if (removedIndex !== addedIndex) {
        this.update((arr) => {
          arr.splice(removedIndex, 1)
          arr.splice(addedIndex, 0, payload)
        })
      }
    },
    openEditChecklistTitle (id) {
      this.activeInputEditTitle = id
      this.$nextTick(() => {
        this.$refs[`textarea-title-${id}`][0].height = 0
        this.$refs[`textarea-title-${id}`][0].focus()
      })
    },
    updateChecklistTitle (cl, clIdx) {
      const value = this.$refs[`textarea-title-${cl.id}`][0].value
      if (value) {
        if (value !== cl.title) {
          this.update((arr) => {
            arr[clIdx].title = value
          })
        }
        this.activeInputEditTitle = undefined
      } else {
        this.$refs[`textarea-title-${cl.id}`][0].focus()
      }
    },
    deleteChecklist (clIdx) {
      this.update((arr) => {
        arr.splice(clIdx, 1)
      })
    },
    openAddTextarea (id) {
      this.name = ''
      this.activeInputAddItem = id
      this.$nextTick(() => {
        this.$refs[`textarea-add-${id}`][0].focus()
      })
    },
    closeAddTextarea () {
      this.activeInputAddItem = undefined
      this.name = ''
    },
    addChecklistItem (id, clIdx) {
      if (this.name) {
        this.update((arr) => {
          arr[clIdx].items.push({
            id: uuidv4(),
            name: this.name
          })
        })
        this.name = ''
        this.activeInputAddItem = undefined
      } else {
        this.$refs[`textarea-add-${id}`][0].focus()
      }
    },
    updateChecked (clIdx, value) {
      this.update((arr) => {
        arr[clIdx].checked = value
      })
    },
    openEditItem (itemId) {
      this.activeInputEditItem = itemId
      this.$nextTick(() => {
        this.$refs[`textarea-edit-item-${itemId}`][0].focus()
      })
    },
    updateItem (clIdx, itemId, itemIdx) {
      const value = this.$refs[`textarea-edit-item-${itemId}`][0].value
      if (value) {
        if (value !== this.value[clIdx].items[itemIdx].name) {
          this.update((arr) => {
            arr[clIdx].items[itemIdx].name = value
          })
        }
        this.activeInputEditItem = undefined
      } else {
        this.$refs[`textarea-edit-item-${itemId}`][0].focus()
      }
    },
    getProgress (cl) {
      return Math.round((cl.checked || []).length / (cl.items || []).length * 100)
    }
  }
}
</script>

<style lang="scss" scoped>
.checklist-item {
  border-radius: 4px;
}

::v-deep .drop-preview {
  border-radius: 4px;
  background-color: rgb(0 0 0 / 5%);
  margin: 4px;
}

textarea {
  background-color: #fff;
  padding: 8px 12px;
  &.edit-title {
    min-height: 40px;
  }
  &.add-item {
    min-height: 40px;
  }
}

.brello-percent {
  width: 34px;
}
</style>
