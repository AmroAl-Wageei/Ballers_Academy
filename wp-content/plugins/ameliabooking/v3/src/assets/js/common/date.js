import moment from "moment";
import {DateTime, Settings} from "luxon";
import {settings, shortLocale} from "../../../plugins/settings.js";

Settings.defaultLocale = shortLocale

const months = []

for (let i = 1; i <= 12; i++) {
  months.push(DateTime.local(2022, i, 1).monthLong)
}

const formatRegex = {
  formatPHPtoJsMap: {
    d: 'dd',
    D: 'ccc',
    j: 'd',
    l: 'cccc',
    N: 'c',
    w: 'c',
    W: 'W',
    F: 'MMMM',
    m: 'MM',
    M: 'MMM',
    n: 'M',
    o: 'kkkk',
    Y: 'yyyy',
    y: 'yy',
    a: 'a',
    A: 'a',
    g: 'h',
    G: 'H',
    h: 'hh',
    H: 'HH',
    i: 'mm',
    s: 'ss',
    O: 'ZZZ',
    P: 'ZZ',
    c: 'yyyy-MM-dd[T]HH:mm:ssZZ',
    r: 'ccc, dd MMM yyyy HH:mm:ss ZZZ',
    U: 'X',
    T: '',
    S: 'o'
  },

  formatEx: /[dDjlNwWFmMntoYyaAgGhHisOPcrUTS]/g
}

function useLocalValue (value) {
  return moment.utc(value, 'YYYY-MM-DD HH:mm').local().format('YYYY-MM-DD HH:mm')
}

function useUtcValue (value) {
  return moment(value, 'YYYY-MM-DD HH:mm').utc().format('YYYY-MM-DD HH:mm')
}

function useUtcValueOffset (value) {
  return value ? moment(value, 'YYYY-MM-DD HH:mm:ss').utcOffset() : moment().utcOffset()
}

function useStringFromDate (d) {
  return d.getFullYear() + '-' + ('0'.concat(d.getMonth() + 1)).slice(-2) + '-' + ('0'.concat(d.getDate())).slice(-2)
}

function useFormatTime (t) {
  return t.split(':')[0] + ':' + t.split(':')[1]
}

function useTimeInSeconds (time) {
  return moment(time, 'HH:mm').diff(moment().startOf('day'), 'seconds')
}

function useSecondsInTime (seconds) {
  return moment.utc(seconds * 1000).format('HH:mm')
}

function addSeconds (time, seconds) {
  return moment(time, 'HH:mm').add(seconds, 'seconds').format('HH:mm')
}

function jsTimeFormat () {
  // Fix for French "G \h i \m\i\n" and "G\hi" format
  if (settings.wordpress.timeFormat === 'G \\h i \\m\\i\\n' || settings.wordpress.timeFormat === 'G\\hi') {
    return 'HH:mm'
  }

  return settings.wordpress.timeFormat.replace(formatRegex.formatEx, function (phpStr) {
    return formatRegex.formatPHPtoJsMap[phpStr]
  })
}

function jsDateFormat () {
  // Fix for Portuguese "j \d\e F, Y" format
  if (settings.wordpress.dateFormat === 'j \\d\\e F, Y') {
    return 'd MMMM, yyyy'
  }

  // Fix for Spanish/Catalan "j \d\e F \d\e Y" format
  if (settings.wordpress.dateFormat === 'j \\d\\e F \\d\\e Y') {
    return 'd MMMM yyyy'
  }

  return settings.wordpress.dateFormat.replace(formatRegex.formatEx, function (phpStr) {
    return formatRegex.formatPHPtoJsMap[phpStr]
  })
}

function getFrontedFormattedTime (time) {
  return DateTime.fromFormat(time, 'HH:mm').toFormat(jsTimeFormat())
}

function getFrontedFormattedDate (date) {
  let dateString = DateTime.fromFormat(date, 'yyyy-MM-dd').toFormat(jsDateFormat())

  // Fix for Portuguese "j \d\e F, Y" format
  if (settings.wordpress.dateFormat === 'j \\d\\e F, Y') {
    let result = ''

    dateString.split(' ').forEach(function (value, index) {
      if (index === 1) {
        value = value.charAt(0).toUpperCase() + value.slice(1)
      }

      result = result + value + ' '

      if (index === 0) {
        result += 'de '
      }
    })

    return result
  }

  // Fix for Spanish/Catalan "j \d\e F \d\e Y" format
  if (settings.wordpress.dateFormat === 'j \\d\\e F \\d\\e Y') {
    let result = ''

    let format = !dateString.includes(' de ') ? dateString : dateString.replace('de ', '')

    format.split(' ').forEach(function (value, index) {
      if (index === 1 || index === 3) {
        value = value.charAt(0).toUpperCase() + value.slice(1)
      }

      result = result + value + ' '

      if (index === 0 || index === 1) {
        result += 'de '
      }
    })

    return result
  }

  return dateString
}

function getFirstDayOfWeek () {
  return settings.wordpress.startOfWeek
}

function useSecondsToDuration (seconds, hourLabel, minuteLabel) {
  let hours = Math.floor(seconds / 3600)
  let minutes = seconds / 60 % 60

  return (hours ? (hours + hourLabel + ' ') : '') + ' ' + (minutes ? (minutes + minuteLabel) : '')
}

export {
  months,
  useUtcValue,
  useLocalValue,
  useUtcValueOffset,
  useStringFromDate,
  useFormatTime,
  useTimeInSeconds,
  useSecondsInTime,
  getFrontedFormattedTime,
  getFrontedFormattedDate,
  addSeconds,
  getFirstDayOfWeek,
  useSecondsToDuration,
}
