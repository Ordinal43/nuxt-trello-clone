import Vue from 'vue'
import dayjs from '@/utils/dayjs.utils'

Vue.filter('formatFromNow', (value) => {
  const dayjsObj = dayjs(value)
  if (!dayjsObj.isValid()) { return '' }
  return dayjsObj.fromNow()
})
