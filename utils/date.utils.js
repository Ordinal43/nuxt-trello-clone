export const VALID_DATE_FORMATS = [
  'YYYY-M-D', 'YYYY/M/D', 'YYYY M D',
  'YYYY-MM-D', 'YYYY/MM/D', 'YYYY MM D',
  'YYYY-MM-DD', 'YYYY/MM/DD', 'YYYY MM DD',
  'YYYY-M-DD', 'YYYY/M/DD', 'YYYY M DD',

  'M/D/YYYY', 'M/DD/YYYY', 'MM/D/YYYY', 'MM/DD/YYYY',
  'M/D/YY', 'M/DD/YY', 'MM/D/YY', 'MM/DD/YY',

  'M-D-YYYY', 'M-DD-YYYY', 'MM-D-YYYY', 'MM-DD-YYYY',
  'M-D-YY', 'M-DD-YY', 'MM-D-YY', 'MM-DD-YY',

  'M D YYYY', 'M DD YYYY', 'MM D YYYY', 'MM DD YYYY',
  'M D YY', 'M DD YY', 'MM D YY', 'MM DD YY'
]

export const SANITIZE_DATE_STRING = (dirty) => {
  // remove any non-numerics before and after
  dirty = dirty.replace(/(^[^0-9]*)|([^0-9]*$)/gs, '')
  // replace any characters between numbers with '-'
  dirty = dirty.replace(/[^0-9].*?(?=[0-9])/gs, '-')
  // only take the first 3 groups
  let endIdx = -1
  for (let i = 0; i < 3; i++) {
    endIdx = dirty.indexOf('-', endIdx + 1)
  }
  if (endIdx !== -1) {
    dirty = dirty.substring(0, endIdx)
  }
  return dirty
}

export const SANITIZE_TIME_STRING = (dirty) => {
  // remove any non-numerics before and non-alphanumeric after
  dirty = dirty.replace(/(^[^0-9]*)|([^\w]*$)/gs, '')
  // replace any characters between alphanumeric with ':'
  dirty = dirty.replace(/[^\w].*?(?=[\w])/gs, ':')
  // get last instance of AM/PM
  const signArr = dirty.match(/(am|pm)(?!.*(am|pm))/gi)
  // remove all non-numerics before and after
  dirty = dirty.replace(/(^[^0-9]*)|([^0-9]*$)/g, '')

  const timeArr = dirty.split(':')
  dirty = `${timeArr[0]}:${timeArr[1] || '00'}`
  if (signArr) {
    dirty = `${dirty} ${signArr[0].toLowerCase()}`
  }

  return dirty
}
