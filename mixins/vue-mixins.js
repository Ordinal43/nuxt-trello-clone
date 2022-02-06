import dayjs from '@/utils/dayjs.utils'

export const mixinTextArea = {
  methods: {
    mixin_resizeTextareaHeight ({ target }) {
      /**
       * Dynamically adjust height to textarea content
       */
      target.style.height = '0px'
      target.style.height = (target.scrollHeight) + 'px'
    }
  }
}

export const mixinInput = {
  methods: {
    mixin_resizeInputWidth ({ target }) {
      target.style.width = '0px'
      target.style.width = (target.value.length + 2) + 'ch'
    }
  }
}

export const mixinDate = {
  methods: {
    /**
     * get date status in array form
     */
    mixin_getDateDueStatus (dateStr, dueSoonMessage = 'due soon', overdueMessage = 'overdue') {
      const diff = dayjs(dateStr).diff(dayjs(), 'second')
      let color, message
      if (diff <= 0) {
        color = 'red lighten-1'
        message = overdueMessage
      } else if (diff < 86400) {
        color = 'amber lighten-1'
        message = dueSoonMessage
      } else {
        return null
      }
      return { color, message }
    }
  }
}
