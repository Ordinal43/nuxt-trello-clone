import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Vue from 'vue'

dayjs.extend(relativeTime)

Vue.filter('formatFromNow', (value) => {
  if (!value) { return '' }
  return dayjs(value).fromNow()
})

Vue.filter('formatDate', (value) => {
  if (!value) { return '' }
  return dayjs(value).format('MMM D, YYYY')
})
