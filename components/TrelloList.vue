<template>
  <v-card
    color="#EBECF0"
    width="272"
    class="pa-2 mr-2 d-flex flex-column"
    flat
  >
    <div class="pa-2 flex-grow-0 flex-shrink-0 d-flex justify-space-between">
      <div class="text-subtitle-2">
        {{ list.title }}
      </div>
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
      >
        <template #activator="{ on }">
          <v-btn
            text
            icon
            x-small
            v-on="on"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-list dense>
            <v-list-item
              v-for="(action, i) in listAction"
              :key="`action-${i}`"
              @click="action.method"
            >
              <v-list-item-icon>
                <v-icon :color="action.color">
                  {{ action.icon }}
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  {{ action.title }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>
    <div class="flex-grow-1 flex-shrink-1">
      <v-card
        v-for="card in list.cards"
        :key="`card-${card.id}`"
        class="mt-2 pa-2"
        @click="$emit('show-details', card)"
      >
        {{ card.title }}
      </v-card>
    </div>
    <v-hover
      v-show="!isInputShown"
      class="flex-grow-0 flex-shrink-0"
    >
      <template #default="{ hover }">
        <v-card
          flat
          class="px-2 py-1 mt-3"
          :color="hover? '#00000014' : '#00000000'"
          @click="showCardForm"
        >
          <div>
            <div class="text-body-2">
              <v-icon small>
                mdi-plus
              </v-icon>
              Add card
            </div>
          </div>
        </v-card>
      </template>
    </v-hover>
    <v-card
      v-show="isInputShown"
      class="mt-2 pa-2"
    >
      <textarea
        ref="cardcreate"
        v-model="cardTitle"
        type="text"
        placeholder="Enter card title..."
        class="create-card-textarea"
        @input="resize"
        @blur="blurAction()"
        @keydown.enter.prevent="blurAction(true)"
      />
    </v-card>
  </v-card>
</template>

<script>
export default {
  props: {
    list: { type: Object, required: true }
  },
  data () {
    return {
      menu: false,
      listAction: [
        { icon: 'mdi-delete', title: 'Delete list', color: 'red', method: this.deleteList }
      ],
      isInputShown: false,
      cardTitle: ''
    }
  },
  methods: {
    deleteList () {
      this.$emit('delete-list', this.list.id)
    },
    showCardForm () {
      this.isInputShown = true
      this.$nextTick(() => {
        this.$refs.cardcreate.focus()
      })
    },
    // dynamically adjust height to textarea content
    resize ({ target }) {
      target.style.height = '0px'
      target.style.height = (target.scrollHeight) + 'px'
    },
    blurAction (enterPressed) {
      if (this.cardTitle) {
        this.$emit('create-card', this.cardTitle)
        this.cardTitle = ''
        this.isInputShown = false
      } else if (!enterPressed) {
        this.isInputShown = false
      }
    }
  }
}
</script>

<style scoped>
.create-card-textarea {
  width: 100%;
  resize: none;
  outline: none;
  overflow-wrap: break-word;
  min-height: 54px;
  max-height: 162px;
}
</style>
