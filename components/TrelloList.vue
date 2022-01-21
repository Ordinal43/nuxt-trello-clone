<template>
  <v-card
    color="#EBECF0"
    width="272"
    class="py-2 px-1 mr-2 d-flex flex-column"
    flat
    @mouseover="isMouseover = true"
    @mouseleave="isMouseover = false"
  >
    <div class="py-2 px-1 flex-grow-0 flex-shrink-0 d-flex">
      <div class="text-subtitle-2 pl-2 brello-list-title">
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
            class="brello-list-action"
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
      <Container
        v-show="list.cards.length || (isMouseover && isDragging)"
        :get-child-payload="getChildPayload"
        group-name="list-container"
        drag-class="card-ghost"
        drop-class="card-ghost-drop"
        :drop-placeholder="dropPlaceholderOptions"
        @drop="onDrop"
        @drag-start="isDragging = true"
        @drag-end="isDragging = false"
      >
        <Draggable
          v-for="card in list.cards"
          :key="`card-${card.id}`"
        >
          <v-hover
            v-slot="{ hover }"
          >
            <v-card
              class="mt-1 ma-1 pa-2 text-body-2"
              elevation="1"
              :color="`${hover? 'grey lighten-5' : ''}`"
              :ripple="false"
              @click="$emit('show-details', card)"
            >
              {{ card.title }}
            </v-card>
          </v-hover>
        </Draggable>
      </Container>
    </div>
    <v-hover
      v-show="!isInputShown"
      class="flex-grow-0 flex-shrink-0"
    >
      <template #default="{ hover }">
        <v-card
          flat
          class="pa-2 mt-1 mx-1"
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
      class="mt-1 pa-2 mx-1"
    >
      <textarea
        ref="cardcreate"
        v-model="cardTitle"
        type="text"
        placeholder="Enter card title..."
        class="create-card-textarea text-body-2"
        @input="resize"
        @blur="blurAction()"
        @keydown.enter.prevent="blurAction(true)"
      />
    </v-card>
  </v-card>
</template>

<script>
import { Container, Draggable } from 'vue-dndrop'

export default {
  components: {
    Container, Draggable
  },
  props: {
    list: { type: Object, required: true }
  },
  data () {
    return {
      menu: false,
      listAction: [
        { icon: 'mdi-delete', title: 'Delete list', color: 'red', method: this.deleteList }
      ],
      dropPlaceholderOptions: {
        className: 'drop-preview',
        animationDuration: '150',
        showOnTop: false
      },
      isInputShown: false,
      cardTitle: '',

      isMouseover: false,
      // only show container when "isDragging = true"
      isDragging: false
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
    resize ({ target }) {
      /**
       * Dynamically adjust height to textarea content
       */
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
    },
    /**
     * ============= Drag and drop methods =============
     */
    getChildPayload (index) {
      return this.list.cards[index]
    },
    onDrop (droppedResult) {
      this.$emit('drop-card', droppedResult)
    }
  }
}
</script>

<style scoped>
.brello-list-title {
  flex: 1 1 auto;
  min-width: 0;
}

.brello-list-action {
  flex: 0 0 auto;
}

.create-card-textarea {
  width: 100%;
  resize: none;
  outline: none;
  overflow-wrap: break-word;
  min-height: 54px;
  max-height: 162px;
}

.card-ghost {
  transition: transform 0.18s ease;
  transform: rotateZ(3deg);
}

.card-ghost-drop {
  transition: transform 0.18s ease-in-out;
  transform: rotateZ(0deg);
}
</style>
