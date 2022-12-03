import moment from "moment";
import {useCartItem} from "../public/cart";
import {useSortedDateStrings} from "./helper";

function getFutureMonthDate (dateString, interval) {
  let date = moment(dateString, 'YYYY-MM-DD')
  let futureMonthDate = moment(date).add(interval, 'M')
  let futureMonthDateEnd = moment(futureMonthDate).startOf('month')

  if (date.date() !== futureMonthDate.date() &&
    futureMonthDate.isSame(futureMonthDateEnd.format('YYYY-MM-DD'))
  ) {
    futureMonthDate.subtract(1, 'd')
  }

  return futureMonthDate
}

function getGivenDateOfMonth (date, monthWeek, weekDay) {
  let firstWeek = moment(date, 'YYYY-MM-DD').startOf('month').day(weekDay)

  if (firstWeek.format('M') !== date.format('M')) {
    firstWeek.add(7, 'days')
  }

  let resultDate = firstWeek.add(7 * (monthWeek - 1), 'days')

  if (date.format('M') !== resultDate.format('M')) {
    resultDate.subtract(7, 'days')
  }

  return resultDate
}

function useExpectedDates (store, startDate, endDate, count, type, interval, weekDays, monthRule) {
  let cartItem = useCartItem(store)
  let lastAvailableDate = cartItem.services[cartItem.serviceId].lastDate

  let lastDate = endDate ? moment(endDate) : null

  let selectedDate = moment(startDate, 'YYYY-MM-DD')

  let expectedDates = {}

  let expectedDatesArray = []

  switch (type) {
    case ('daily'):
      expectedDatesArray.push(moment(startDate, 'YYYY-MM-DD'))

      break

    case ('weekly'):
      let selectedDateIndex = moment(startDate, 'YYYY-MM-DD').isoWeekday()

      weekDays.forEach((item, index) => {
        if (item.selected) {
          let dayIndex = index + 1

          let date = moment(startDate, 'YYYY-MM-DD')

          if (selectedDateIndex < dayIndex) {
            expectedDatesArray.push(date.add(dayIndex - selectedDateIndex, 'days'))
          } else if (selectedDateIndex === dayIndex) {
            expectedDatesArray.push(date)
          } else if (selectedDateIndex > dayIndex) {
            expectedDatesArray.push(date.subtract(selectedDateIndex - dayIndex, 'days'))
          }

          let lDate = lastDate ? lastDate : lastAvailableDate
          if (date.isSameOrBefore(lDate) && date.isAfter(selectedDate)) {
            expectedDates[date.format('YYYY-MM-DD')] = date
          }
        }
      })

      break

    case ('monthly'):
      expectedDatesArray.push(moment(startDate, 'YYYY-MM-DD'))

      break
  }

  let isValidExpected = expectedDatesArray.length > 0

  while (isValidExpected) {
    for (let i = 0; i < expectedDatesArray.length; i++) {
      switch (type) {
        case ('daily'):
          expectedDatesArray[i].add(interval, 'days')

          break

        case ('weekly'):
          expectedDatesArray[i].add(interval * 7, 'days')

          break

        case ('monthly'):
          let weekDayIndex = expectedDatesArray[i].isoWeekday()
          expectedDatesArray[i] = monthRule === 0 ?
            getFutureMonthDate(
              expectedDatesArray[i].format('YYYY-MM-DD'),
              interval
            ) :
            getGivenDateOfMonth(
              getFutureMonthDate(
                expectedDatesArray[i].startOf('month').format('YYYY-MM-DD'),
                interval
              ),
              monthRule,
              weekDayIndex
            )

          break
      }

      isValidExpected = lastDate ?
        expectedDatesArray[i].isSameOrBefore(lastDate) : (count + 1) >= Object.keys(expectedDates).length

      if (isValidExpected) {
        expectedDates[moment(expectedDatesArray[i]).format('YYYY-MM-DD')] = moment(expectedDatesArray[i])
      }
    }
  }

  return expectedDates
}

function useProposedDates (store, expectedDates, startDate, endDate, count) {
  let service = store.getters['entities/getService'](
    store.getters['booking/getServiceId']
  )

  let cartItem = useCartItem(store)

  let activeService = cartItem.services[cartItem.serviceId]

  let slots = activeService.slots

  let startTime = activeService.list[0].time

  let recurringStartDate = moment(startDate, 'YYYY-MM-DD')
  let recurringEndDate = endDate ? moment(endDate, 'YYYY-MM-DD') : null

  let proposedDates = {}
  let availableDates = {}

  useSortedDateStrings(Object.keys(slots)).forEach((dateString) => {
    availableDates[dateString] = moment(dateString + ' 00:00:00')
  })

  let bookingStartString = moment(startDate, 'YYYY-MM-DD').format('YYYY-MM-DD')

  let lastProposedDate = null

  for (let expectedDateString in expectedDates) {
    let expectedDate = moment(expectedDateString, 'YYYY-MM-DD')

    let isBefore = recurringEndDate ? expectedDate.isSameOrBefore(recurringEndDate) : true

    lastProposedDate = moment(expectedDate)

    if (expectedDateString in slots &&
      Object.keys(slots[expectedDateString]).length &&
      !(expectedDateString in proposedDates) &&
      isBefore
    ) {
      let isAvailableTime = startTime in slots[expectedDateString]

      lastProposedDate = moment(expectedDates[expectedDateString])

      proposedDates[expectedDateString] = {
        isSubstituteDate: false,
        isSubstituteTime: !isAvailableTime,
        time: isAvailableTime ? startTime : Object.keys(slots[expectedDateString])[0],
      }
    } else if (expectedDateString !== bookingStartString && !(expectedDateString in proposedDates) && isBefore) {
      let previousDate = null
      let nextDate = null

      for (let availableDateString in availableDates) {
        if ((service.recurringSub === 'past' || service.recurringSub === 'both') &&
          availableDates[availableDateString].isBefore(expectedDates[expectedDateString]) &&
          availableDates[availableDateString].isAfter(recurringStartDate) &&
          availableDateString !== expectedDateString &&
          !(availableDateString in proposedDates)
        ) {
          previousDate = availableDates[availableDateString]
        }

        if ((service.recurringSub === 'future' || service.recurringSub === 'both') &&
          availableDates[availableDateString].isAfter(expectedDates[expectedDateString]) &&
          availableDateString !== expectedDateString &&
          !(availableDateString in proposedDates)
        ) {
          nextDate = availableDates[availableDateString]

          break
        }
      }

      let previousDateTimeDiff = previousDate !== null ?
        moment(expectedDates[expectedDateString]).diff(previousDate, 'days') : null

      let nextDateTimeDiff = nextDate !== null ?
        moment(nextDate).diff(expectedDates[expectedDateString], 'days') : null

      let substituteDate = null

      if (previousDateTimeDiff && nextDateTimeDiff) {
        substituteDate = previousDateTimeDiff < nextDateTimeDiff ? previousDate : nextDate
      } else if (previousDateTimeDiff) {
        substituteDate = previousDate
      } else if (nextDateTimeDiff) {
        substituteDate = nextDate
      }

      if (substituteDate !== null &&
        (recurringEndDate ? moment(substituteDate).isSameOrBefore(recurringEndDate) : true)
      ) {
        let substituteDateString = moment(substituteDate).format('YYYY-MM-DD')

        if (substituteDateString in slots &&
          !(expectedDateString in proposedDates) &&
          !(substituteDateString in expectedDates)
        ) {
          let isAvailableTime = startTime in slots[substituteDateString]

          lastProposedDate = moment(substituteDate)

          proposedDates[substituteDateString] = {
            isSubstituteDate: true,
            isSubstituteTime: !isAvailableTime,
            time: isAvailableTime ? startTime : Object.keys(slots[substituteDateString])[0],
          }
        }
      }
    }

    if (recurringEndDate ? !isBefore : useSortedDateStrings(Object.keys(proposedDates)).length >= count) {
      break
    }
  }

  return proposedDates
}

export {
  useProposedDates,
  useExpectedDates,
}
