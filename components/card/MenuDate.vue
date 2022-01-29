<template>
  <v-menu
    v-model="menu"
    absolute
    :close-on-click="false"
    :close-on-content-click="false"
    :position-x="x"
    :position-y="y"
  >
    <v-card width="300">
      <v-container>
        <v-row>
          <v-col class="d-flex align-center justify-space-between">
            <h4>Dates</h4>
            <v-icon @click="menu = false">
              mdi-close
            </v-icon>
          </v-col>
          <v-col cols="12" class="px-0 pt-0">
            <v-date-picker
              :value="getDateRange"
              :picker-date.sync="pickerDate"
              range
              flat
              no-title
              full-width
              show-adjacent-months
              color="primary"
              @click:date="setDate($event, true)"
            />
          </v-col>
          <v-col cols="12">
            <div class="mb-2">
              <div class="text-caption mb-1">
                Start date
              </div>
              <div class="d-flex">
                <v-simple-checkbox
                  :value="hasStartDate"
                  color="primary"
                  @click="toggleStart"
                />
                <input
                  ref="inputStartDate"
                  type="text"
                  placeholder="M/D/YYYY"
                  :value="hasStartDate? startDate : ''"
                  :class="`brello-input date-input ml-2 text-body-2 ${!isOnEndDate && hasStartDate? 'active' : ''}`"
                  :disabled="!hasStartDate"
                  @focus="focusDateInput(false)"
                  @blur="setDate($event.target.value)"
                >
              </div>
            </div>
            <div>
              <div class="text-caption mb-1">
                End date
              </div>
              <div class="d-flex">
                <v-simple-checkbox
                  :value="hasEndDate"
                  color="primary"
                  @click="toggleEnd"
                />
                <input
                  ref="inputEndDate"
                  type="text"
                  placeholder="M/D/YYYY"
                  :value="hasEndDate? endDate : ''"
                  :class="`brello-input date-input ml-2 text-body-2 ${isOnEndDate && hasEndDate? 'active' : ''}`"
                  :disabled="!hasEndDate"
                  @focus="focusDateInput(true)"
                  @blur="setDate($event.target.value)"
                >
                <input
                  ref="inputEndTime"
                  type="text"
                  placeholder="h:mm A"
                  :value="hasEndDate? endTime : ''"
                  :class="`brello-input date-input ml-2 text-body-2 ${isOnEndDate && hasEndDate? 'active' : ''}`"
                  :disabled="!hasEndDate"
                  @focus="focusDateInput(true)"
                  @blur="setEndTime($event.target.value)"
                >
              </div>
            </div>
          </v-col>
          <v-col cols="12">
            <v-btn
              block
              depressed
              color="primary"
              class="mb-2"
              @click="saveDate"
            >
              Save
            </v-btn>
            <v-btn
              block
              depressed
              @click="removeDate"
            >
              remove
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-menu>
</template>

<script>
import { cloneDeep } from 'lodash'
import { VALID_DATE_FORMATS, SANITIZE_DATE_STRING, SANITIZE_TIME_STRING } from '@/utils/date.utils'
import dayjs from '@/utils/dayjs.utils'

const FORMAT_DATE = 'M/D/YYYY'
const FORMAT_DATE_PICKER = 'YYYY-MM-DD'
const FORMAT_TIME = 'h:mm A'

let FLAG_PREVENT_SET_DATE = false

export default {
  props: {
    value: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      menu: false,
      x: 0,
      y: 0,
      dates: [],
      pickerDate: undefined,
      startDate: undefined,
      endDate: undefined,
      endTime: undefined,
      hasStartDate: false,
      hasEndDate: false,
      isOnEndDate: true
    }
  },
  computed: {
    // getPickerDate () {
    //   const from = this.hasStartDate ? dayjs(this.startDate).format(FORMAT_DATE_PICKER) : null
    //   const to = this.hasEndDate ? dayjs(this.endDate).format(FORMAT_DATE_PICKER) : null
    //   return this.isOnEndDate ? to : from
    // },
    getDateRange () {
      const arr = []
      const from = this.hasStartDate ? dayjs(this.startDate).format(FORMAT_DATE_PICKER) : null
      const to = this.hasEndDate ? dayjs(this.endDate).format(FORMAT_DATE_PICKER) : null
      if (from) { arr.push(from) }
      if (to) { arr.push(to) }

      return arr
    }
  },
  watch: {
    menu (val) {
      if (val) {
        /**
         * Vuetify issue:
         * https://github.com/vuetifyjs/vuetify/issues/4454
         */
        setTimeout(() => {
          let saved = this.value || {}
          if (Object.keys(saved).length !== 0) {
            this.hasStartDate = !!(saved.startDate)
            this.hasEndDate = !!(saved.endDate)
          } else {
            saved = {}
            this.hasStartDate = false
            this.hasEndDate = true
            this.isOnEndDate = true
          }
          this.startDate = saved.startDate || dayjs().format(FORMAT_DATE)
          this.endDate = saved.endDate || dayjs().format(FORMAT_DATE)
          this.endTime = saved.endTime || dayjs().format(FORMAT_TIME)
          this.$refs.inputEndDate.focus()
        }, 100)
      }
    }
  },
  methods: {
    showMenu (e) {
      this.x = e.clientX
      this.y = e.clientY
      this.menu = true
    },
    toggleStart () {
      this.hasStartDate = !this.hasStartDate
      if (this.hasStartDate) {
        this.$nextTick(() => {
          this.$refs.inputStartDate.focus()
        })
      } else if (this.hasEndDate) {
        this.$nextTick(() => {
          this.$refs.inputEndDate.focus()
        })
      }
    },
    toggleEnd () {
      this.hasEndDate = !this.hasEndDate
      if (this.hasEndDate) {
        this.$nextTick(() => {
          this.$refs.inputEndDate.focus()
        })
      } else if (this.hasStartDate) {
        this.$nextTick(() => {
          this.$refs.inputStartDate.focus()
        })
      }
    },
    focusDateInput (isOnEndDate) {
      this.isOnEndDate = isOnEndDate
      let date = this.isOnEndDate ? this.endDate : this.startDate
      date = SANITIZE_DATE_STRING(date)
      const dateObj = dayjs(date, VALID_DATE_FORMATS)

      if (dateObj.isValid()) {
        this.pickerDate = dateObj.format(FORMAT_DATE_PICKER)
      }
    },
    setDate (date, fromPicker) {
      // Prevent blur eve
      if (!FLAG_PREVENT_SET_DATE) {
        date = SANITIZE_DATE_STRING(date)
        const dateObj = dayjs(date, VALID_DATE_FORMATS)

        if (dateObj.isValid()) {
          const formatted = dateObj.format(FORMAT_DATE)

          if (this.isOnEndDate) {
            this.endDate = formatted

            let start = dayjs(this.startDate)
            if (start.diff(dateObj) > 0) {
              start = dateObj.subtract(1, 'day')
              this.startDate = start.format(FORMAT_DATE)
              this.$refs.inputStartDate.value = this.startDate
            }
          } else {
            this.startDate = formatted

            let end = dayjs(this.endDate)
            if (end.diff(dateObj) < 0) {
              end = dateObj.add(1, 'day')
              this.endDate = end.format(FORMAT_DATE)
              this.$refs.inputEndDate.value = this.endDate
            }
          }

          this.pickerDate = dateObj.format(FORMAT_DATE_PICKER)
        }

        // reset date to previous value if not valid
        if (this.isOnEndDate) {
          this.$refs.inputEndDate.value = this.endDate
        } else {
          this.$refs.inputStartDate.value = this.startDate
          if (this.hasEndDate && fromPicker) {
            /**
             * When inputEndDate is focused, inputStartDate will fire a "blur" event.
             * if not handled, inputEndDate's value will be mistakenly updated.
             *
             * To prevent this, we'll set a flag to prevent setDate from firing again
             * until said flag is reset
             */
            FLAG_PREVENT_SET_DATE = true
            this.$refs.inputEndDate.focus()
          }
        }
      } else {
        // reset the flag when setDate() is called again
        FLAG_PREVENT_SET_DATE = false
      }
    },
    setEndTime (time) {
      time = SANITIZE_TIME_STRING(time)

      const timeObj = dayjs(`1/1/1 ${time}`)
      if (timeObj.isValid()) {
        const formatted = timeObj.format(FORMAT_TIME)
        this.endTime = formatted
      }
      this.$refs.inputEndTime.value = this.endTime
    },
    update (obj) {
      this.menu = false
      this.$emit('input', cloneDeep(obj))
    },
    saveDate () {
      let saveObj
      if (this.hasStartDate) {
        saveObj = {}
        saveObj.startDate = this.startDate
      }
      if (this.hasEndDate) {
        saveObj = saveObj || {}
        saveObj.endDate = this.endDate
        saveObj.endTime = this.endTime
        saveObj.isDone = false
      }
      this.update(saveObj)
    },
    removeDate () {
      this.update(null)
    }
  }
}
</script>

<style lang="scss" scoped>
input.date-input {
  width: 98px;
}
</style>
