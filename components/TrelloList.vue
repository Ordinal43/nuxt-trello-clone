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
          <v-hover v-slot="{ hover }">
            <v-card
              class="simple-card mt-1 ma-1 pa-2 text-body-2"
              elevation="1"
              :color="`${hover? 'grey lighten-5' : ''}`"
              @click.native="$emit('show-details', card)"
            >
              <div>
                {{ card.title }}
              </div>
              <div
                v-if="Object.keys(card).length > 2"
                class="mt-2"
              >
                <v-hover v-slot="{ hover: hoverDate }">
                  <v-btn
                    v-if="card.date"
                    x-small
                    depressed
                    :ripple="false"
                    :color="getDateStatusColor(card.date)"
                    class="text-none mr-1"
                    @click.stop="updateStatus(card)"
                  >
                    <v-icon
                      dense
                      small
                      left
                    >
                      {{
                        hoverDate
                          ? `mdi-checkbox-${card.date.isDone? 'marked' : 'blank'}-outline`
                          : 'mdi-clock-time-four-outline'
                      }}
                    </v-icon>
                    <span class="text-caption">
                      {{ getDateDetails(card.date) }}
                    </span>
                  </v-btn>
                </v-hover>
                <v-icon
                  v-if="card.description"
                  dense
                  small
                  class="mr-1"
                >
                  mdi-text
                </v-icon>
                <v-btn
                  v-if="card.checklists"
                  x-small
                  depressed
                  :ripple="false"
                  :color="getChecklistColor(card.checklists)"
                  class="text-none mr-1"
                >
                  <v-icon
                    dense
                    small
                    left
                  >
                    mdi-checkbox-marked-outline
                  </v-icon>
                  <span class="text-caption">
                    {{ getChecklistCombined(card.checklists).done }} /
                    {{ getChecklistCombined(card.checklists).total }}
                  </span>
                </v-btn>
              </div>
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
          class="px-2 py-1 mt-1 mx-1"
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
        @input="mixin_resizeTextarea"
        @blur="blurAction()"
        @keydown.enter.prevent="blurAction(true)"
      />
    </v-card>
  </v-card>
</template>

<script>
import { Container, Draggable } from 'vue-dndrop'
import { cloneDeep } from 'lodash'
import { mixinTextArea, mixinDate } from '@/mixins/vue-mixins'
import dayjs from '@/utils/dayjs.utils'

const FORMAT_DATE_SAME_YEAR = 'MMM D'
const FORMAT_DATE_DIFFERENT_YEAR = 'MMM D, YYYY'

export default {
  components: {
    Container, Draggable
  },
  mixins: [
    mixinTextArea,
    mixinDate
  ],
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
    getDateStatusColor ({ isDone, endDate, endTime }) {
      return isDone
        ? 'success'
        : (this.mixin_getDateDueStatus(
            `${endDate} ${endTime || ''}`
          ) || {}).color || 'transparent'
    },
    getDateDetails (date) {
      let dateStr, format, sameYear
      if (date.startDate) {
        dateStr = date.endDate ? '' : dayjs().isBefore(date.startDate, 'day') ? 'Starts: ' : 'Started: '
        sameYear = dayjs().isSame(date.startDate, 'year')
        format = sameYear ? FORMAT_DATE_SAME_YEAR : FORMAT_DATE_DIFFERENT_YEAR
        dateStr += dayjs(date.startDate).format(format)
      }
      if (date.endDate) {
        dateStr = dateStr ? `${dateStr} - ` : ''
        sameYear = dayjs().isSame(date.endDate, 'year')
        format = sameYear ? FORMAT_DATE_SAME_YEAR : FORMAT_DATE_DIFFERENT_YEAR
        dateStr += dayjs(date.endDate).format(format)
      }
      return dateStr
    },
    getChecklistCombined (checklists) {
      return checklists.reduce((acc, value) => {
        acc.done = (acc.done || 0) + value.checked.length
        acc.total = (acc.total || 0) + value.items.length
        return acc
      }, {})
    },
    getChecklistColor (checklists) {
      const { done, total } = this.getChecklistCombined(checklists)
      return done === total ? 'success' : 'transparent'
    },
    updateStatus (card) {
      const clonedCard = cloneDeep(card)
      clonedCard.date.isDone = !clonedCard.date.isDone
      this.$emit('update-card', clonedCard)
    },
    showCardForm () {
      this.isInputShown = true
      this.$nextTick(() => {
        this.$refs.cardcreate.focus()
      })
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

<style lang="scss" scoped>
::v-deep .drop-preview {
  border-radius: 4px;
  background-color: rgb(0 0 0 / 5%);
  margin: 4px;
}

.simple-card:hover {
  cursor: pointer;
}

.brello-list{
  &-title {
    flex: 1 1 auto;
    min-width: 0;
  }
  &-action {
    flex: 0 0 auto;
  }
}

.create-card-textarea {
  min-height: 54px;
  max-height: 162px;
  background-color: rgb(255 255 255 / 0%);
}

.card-ghost {
  transition: transform 0.18s ease;
  transform: rotateZ(3deg);
  &-drop {
    transition: transform 0.18s ease-in-out;
    transform: rotateZ(0deg);
  }
}
</style>
