<template>
  <div
    class="my-3 ml-sm-10 pa-2"
  >
    <div class="text-caption mb-1">
      {{ getDateTitle }}
    </div>
    <div class="d-flex">
      <v-simple-checkbox
        v-if="value.endDate"
        :value="value.isDone"
        color="primary"
        @input="updateStatus"
      />
      <v-sheet
        rounded
        class="date-button d-flex align-center ml-1 px-2 py-1 text-body-2 blue-grey--text text--darken-4"
        @click="$emit('open-date-menu', $event)"
      >
        {{ getDateDetails }}
        <v-chip
          v-if="value.isDone"
          x-small
          label
          class="ml-2"
          color="success"
        >
          complete
        </v-chip>
        <v-chip
          v-else-if="getDateDueStatus"
          x-small
          label
          class="ml-2 font-weight-medium"
          :color="getDateDueStatus.color"
        >
          {{ getDateDueStatus.message }}
        </v-chip>
        <v-icon right>
          mdi-chevron-down
        </v-icon>
      </v-sheet>
    </div>
  </div>
</template>

<script>
import tap from 'lodash/tap'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from '@/utils/dayjs.utils'
import { mixinDate } from '@/mixins/vue-mixins'

const FORMAT_DATE_SAME_YEAR = 'MMM D'
const FORMAT_DATE_DIFFERENT_YEAR = 'MMM D, YYYY'

export default {
  mixins: [
    mixinDate
  ],
  props: {
    value: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    getDateTitle () {
      if (this.value.startDate && this.value.endDate) {
        return 'Dates'
      } else if (!this.value.startDate) {
        return 'Due date'
      } else {
        return 'Start date'
      }
    },
    getDateDueStatus () {
      return this.mixin_getDateDueStatus(
        `${this.value.endDate} ${this.value.endTime || ''}`
      )
    },
    getDateDetails () {
      let dateStr, format, sameYear
      if (this.value.startDate) {
        dateStr = ''
        sameYear = dayjs().isSame(this.value.startDate, 'year')
        format = sameYear ? FORMAT_DATE_SAME_YEAR : FORMAT_DATE_DIFFERENT_YEAR
        dateStr += dayjs(this.value.startDate).format(format)
      }
      if (this.value.endDate) {
        dateStr = dateStr ? `${dateStr} - ` : ''
        sameYear = dayjs().isSame(this.value.endDate, 'year')
        format = sameYear ? FORMAT_DATE_SAME_YEAR : FORMAT_DATE_DIFFERENT_YEAR
        dateStr += dayjs(this.value.endDate).format(format)
        dateStr += ` at ${this.value.endTime}`
      }
      return dateStr
    }
  },
  methods: {
    updateStatus ($event) {
      this.$emit('input', tap(cloneDeep(this.value), (obj) => {
        obj.isDone = $event
      }))
    }
  }
}
</script>

<style lang="scss" scoped>
.date-button {
  background-color: #091E420A;
  &:hover {
    background-color: #091E4214;
    cursor: pointer;
  }
}
</style>
