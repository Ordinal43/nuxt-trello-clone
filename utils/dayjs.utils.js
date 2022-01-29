/**
 * Since extending dayjs() will affect every instance of it,
 * we'll to make it into a single file.
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)

export default dayjs
