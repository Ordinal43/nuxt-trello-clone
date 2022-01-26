import Vue from 'vue'
import dayjs from '@/utils/dayjs.utils'

Vue.filter('formatFromNow', (value) => {
  const dayjsObj = dayjs(value)
  if (!dayjsObj.isValid()) { return '' }
  return dayjsObj.fromNow()
})

Vue.filter('formatDate', (value, format = 'MMM D, YYYY') => {
  const dayjsObj = dayjs(value)
  if (!dayjsObj.isValid()) { return '' }
  return dayjsObj.format(format)
})
