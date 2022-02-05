<template>
  <div
    class="brello-board-sidenav white"
  >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="text-body-2">
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
    <v-list two-line>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Board color</v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
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
                  class="current-color"
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
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import tap from 'lodash/tap'
import cloneDeep from 'lodash/cloneDeep'

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
    isUseColor: !!vm.value.color
  }),
  computed: {
    showResetColor () {
      return this.value.color !== this.newColor
    }
  },
  methods: {
    updateBoard (callback) {
      this.$emit('input', tap(cloneDeep(this.value), callback))
    },
    updateColor () {
      this.updateBoard((board) => {
        board.color = this.isUseColor ? this.newColor : ''
      })
      this.colorMenu = false
    }
  }
}
</script>

<style lang="scss" scoped>
.current-color {
  border: 1px solid #091e423d;
}
</style>
