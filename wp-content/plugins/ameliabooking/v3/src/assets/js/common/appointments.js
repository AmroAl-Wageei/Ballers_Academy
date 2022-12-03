import {useFormattedPrice} from "./formatting";
import {useTimeInSeconds} from "./date";
import {useCartItem} from "../public/cart";
import {useSortedDateStrings} from "./helper";
import {settings} from "../../../plugins/settings";

function useCapacity (employeeServices) {
  let options = {
    availability: false,
    min: 0,
    max: 0
  }

  let serviceMinCapacity = 0

  if (employeeServices.length && employeeServices.length > 1) {
    employeeServices.forEach(service => {
      serviceMinCapacity = service.minCapacity

      options.availability = service.bringingAnyone && service.maxCapacity > 1 && (service.maxExtraPeople === null || service.maxExtraPeople > 0)

      if (service.maxCapacity > options.max || options.max === 0) {
        options.max = service.maxExtraPeople !== null ? (service.maxExtraPeople + 1) : service.maxCapacity
      }

      if (options.min < service.minCapacity) {
        options.min = settings.appointments.allowBookingIfNotMin ? 1 : service.minCapacity
      }
    })

  } else if (employeeServices.length && employeeServices.length === 1) {
    let service = employeeServices[0]

    serviceMinCapacity = service.minCapacity

    options.availability = service.bringingAnyone && service.maxCapacity > 1 && (service.maxExtraPeople === null || service.maxExtraPeople > 0)
    options.min = settings.appointments.allowBookingIfNotMin ? 1 : service.minCapacity
    options.max = service.maxExtraPeople !== null && service.maxExtraPeople < service.maxCapacity ? (service.maxExtraPeople + 1) : service.maxCapacity
  }

  if (settings.appointments.openedBookingAfterMin) {
    options.min = serviceMinCapacity
  }

  options.max = options.max > 1 ? (options.max - 1) : options.max
  options.min = options.min > 0 ? (options.min - 1) : options.min

  return options
}

function usePaymentError (store, message) {
  store.commit('booking/setError', message)
}

function usePrepaidPrice (store, entity, type) {
  switch (type) {
    case 'appointment':
      let appointments = useAppointmentsPayments(
        store,
        entity.id,
        useCartItem(store).services[entity.id].list
      )

      return useAppointmentsTotalAmount(store, entity, appointments.prepaid)
    case 'package':
      return entity.price
  }
}

function useDuration (serviceDuration, extras) {
  let duration = serviceDuration

  extras.forEach((extra) => {
    duration += (extra.duration * extra.quantity)
  })

  return duration
}

function useBuildAppointment (
  index,
  serviceId,
  providerId,
  locationId,
  date = null,
  time = null,
  range = {start: null, end: null}
) {
  let items = [
    {
      packageId: null,
      serviceId: serviceId,
      index: 0,
      services: {},
    }
  ]

  items[index].services[serviceId] = {
    fetched: false,
    slots: [],
    providerId: providerId,
    locationId: locationId,
    list: [
      {
        providerId: providerId,
        locationId: locationId,
        date: date,
        time: time,
        range: range,
      }
    ],
  }

  return items
}

function useCalendarEvents (slots) {
  let calendarSlotsValues = []

  useSortedDateStrings(Object.keys(slots)).forEach((date) => {
    calendarSlotsValues.push({
      title  : 'e',
      start  : date,
      display: 'background',
      extendedProps: {
        slotsTotal: 100,
        slotsAvailable: 1,
        slots: slots[date]
      }
    })
  })

  return calendarSlotsValues
}

function useServices (store) {
  let type = store.getters['booking/getBookableType']

  let services = null

  switch (type) {
    case ('appointment'):
      services = store.getters['entities/getServices']

      break

    case ('package'):
      let packages = store.getters['entities/getPackages']

      let packagesServices = {}

      packages.forEach((pack) => {
        pack.bookable.forEach((book) => {
          packagesServices[book.service.id] = book.service
        })
      })

      services = Object.values(packagesServices)

      break
  }

  return services
}

function useAvailableSlots (store) {
  let cart = store.getters['booking/getAllMultipleAppointments']

  let cartIndex = store.getters['booking/getMultipleAppointmentsIndex']

  let activeAppointment = cart[cartIndex].services[cart[cartIndex].serviceId].list[cart[cartIndex].index]

  let services = useServices(store)

  if (activeAppointment.date) {
    let selectedSlots = []

    cart.forEach((cartItem) => {
      for (let serviceId in cartItem.services) {
        let service = services.find(i => i.id === parseInt(serviceId))

        cartItem.services[serviceId].list.forEach((i, index) => {
          if (i.date &&
            i.date === activeAppointment.date &&
            i.time &&
            (cart[cartIndex].serviceId === parseInt(serviceId) ? parseInt(cart[cartIndex].index) !== index : true)
          ) {
            selectedSlots.push({
              time: i.time,
              duration: service.duration,
              timeAfter: service.timeAfter,
              timeBefore: service.timeBefore
            })
          }
        })
      }
    })

    let service = services.find(i => i.id === cart[cartIndex].serviceId)

    let defaultSlots = Object.keys(cart[cartIndex].services[cart[cartIndex].serviceId].slots[activeAppointment.date])

    let availableSlots = {}

    for (let i = 0; i < defaultSlots.length; i++) {
      let defaultSlotSeconds = useTimeInSeconds(defaultSlots[i])

      let isFreeSlot = true

      for (let j = 0; j < selectedSlots.length; j++) {
        let slotInSeconds = useTimeInSeconds(selectedSlots[j].time)

        if (defaultSlotSeconds > (slotInSeconds - service.duration - service.timeAfter) &&
          defaultSlotSeconds < (slotInSeconds + selectedSlots[j].duration + selectedSlots[j].timeBefore + service.timeAfter)
        ) {
          isFreeSlot = false

          break
        }
      }

      if (isFreeSlot) {
        availableSlots[defaultSlots[i]] = useTimeInSeconds(defaultSlots[i])
      }
    }

    return useSortedDateStrings(Object.keys(availableSlots))
  }

  return activeAppointment.slots
}

function useFillAppointments (store) {
  let cartItem = useCartItem(store)

  if (!cartItem.packageId &&
    Object.keys(cartItem.services).length === 1 &&
    cartItem.services[cartItem.serviceId].list.length === 1
  ) {
    let booking = cartItem.services[cartItem.serviceId].list[0]

    if (!booking.providerId) {
      let employeesIds = cartItem.services[cartItem.serviceId].slots[booking.date][booking.time].map(
        i => i[0]
      ).filter(
        (v, i, a) => a.indexOf(v) === i
      )

      booking.providerId = employeesIds[Math.floor(Math.random() * (employeesIds.length) + 1) - 1]
    }

    if (!booking.locationId) {
      let locationsIds = cartItem.services[cartItem.serviceId].slots[booking.date][booking.time].filter(
        i => i[0] === booking.providerId
      ).map(i => i[1])

      booking.locationId = locationsIds.length ? getPreferredEntityId(
        cartItem.services[cartItem.serviceId].slots[booking.date],
        booking.date in cartItem.services[cartItem.serviceId].occupied
          ? cartItem.services[cartItem.serviceId].occupied[booking.date] : {},
        booking.time,
        booking.providerId,
        locationsIds,
        1
      ) : null
    }
  } else {
    Object.keys(cartItem.services).forEach((serviceId) => {
      if (cartItem.services[serviceId].list.length &&
        cartItem.services[serviceId].list.filter(i => i.date && i.time).length
      ) {
        setPreferredEntitiesData(cartItem.services[serviceId])
      }
    })
  }

  let activeItemServices = cartItem.services

  Object.keys(activeItemServices).forEach((serviceId) => {
    if (activeItemServices[serviceId].list.filter(i => i.date && i.time).length) {
      activeItemServices[serviceId].list.forEach((booking) => {
        if (booking.date && booking.time) {
          setProviderServicePrice(store, booking.providerId, serviceId)
        }
      })
    }
  })
}

function setProviderServicePrice (store, employeeId, serviceId) {
  let employee = store.getters['entities/getEmployee'](employeeId)

  let service = employee.serviceList.find(i => i.id === parseInt(serviceId))

  let duration = store.getters['booking/getDuration']

  if (store.getters['booking/getDuration'] in service.customPricing.durations) {
    service.duration = duration

    service.price = service.customPricing.durations[duration].price
  }
}

function getEntityIdWithMaxSlotCount (entitiesIds) {
  let maxSlotsCount = Math.max.apply(Math, Object.entries(entitiesIds).map(function (o) { return o[1] }))

  return parseInt(Object.entries(entitiesIds).find(function (o) { return o[1] === maxSlotsCount })[0])
}

function getAppointmentServiceAmount (store, serviceId, appointment) {
  let employeeService = store.getters['entities/getEmployeeService'](appointment.providerId, serviceId)

  return employeeService.price * (employeeService.aggregatedPrice ? store.getters['booking/getBookingPersons'] : 1)
}

function useAppointmentsAmount (store, service, appointments) {
  let amount = 0

  appointments.forEach((appointment) => {
    amount += getAppointmentServiceAmount(store, service.id, appointment)
  })

  return amount
}

function useAppointmentExtraAmount (service, selectedExtra, persons) {
  let extra = service.extras.find(item => item.id === parseInt(selectedExtra.extraId))

  if (extra) {
    let extraAggregatedPrice = extra.aggregatedPrice === null ? service.aggregatedPrice : extra.aggregatedPrice

    return extra.price * selectedExtra.quantity * (extraAggregatedPrice ? persons : 1)
  }

  return 0
}

function useAppointmentExtrasAmount (store, service, appointments) {
  let amount = 0

  let persons = store.getters['booking/getBookingPersons']

  let selectedExtras = store.getters['booking/getSelectedExtras']

  selectedExtras = selectedExtras ? selectedExtras : []

  selectedExtras.forEach((selectedExtra) => {
    appointments.forEach((appointment) => {
      amount += useAppointmentExtraAmount(service, selectedExtra, persons)
    })
  })

  return amount
}

function useAppointmentsTotalAmount (store, service, appointments) {
  return useAppointmentsAmount(store, service, appointments) + useAppointmentExtrasAmount(store, service, appointments)
}

function useAppointmentDepositAmount (store, service, totalAmount) {
  let depositAmount = 0

  if (service.depositPayment !== 'disabled') {
    switch (service.depositPayment) {
      case ('fixed'):
        depositAmount = (service.depositPerPerson && service.aggregatedPrice ? store.getters['booking/getBookingPersons'] : 1) * service.deposit

        break

      case 'percentage':
        depositAmount = totalAmount / 100 * service.deposit

        break
    }
  }

  return totalAmount > depositAmount ? depositAmount : 0
}

function useDiscountAmount (store, coupon, appointments) {
  let persons = store.getters['booking/getBookingPersons']

  let selectedExtras = store.getters['booking/getSelectedExtras']

  let service = store.getters['entities/getService'](
    store.getters['booking/getServiceId']
  )

  let discountAmount = 0

  appointments.forEach((appointment) => {
    let amount = getAppointmentServiceAmount(store, service.id, appointment)

    selectedExtras.forEach((selectedExtra) => {
      amount += useAppointmentExtraAmount(service, selectedExtra, persons)
    })

    discountAmount += amount / 100 * coupon.discount + coupon.deduction
  })

  return discountAmount
}

function useAppointmentsPayments (store, serviceId, appointments) {
  let service = store.getters['entities/getService'](
    serviceId
  )

  let prepaidCount = 1

  if (service.recurringPayment) {
    prepaidCount = service.recurringPayment > appointments.length
      ? appointments.length : service.recurringPayment
  }

  return {
    prepaid: appointments.slice(0, prepaidCount),
    postpaid: appointments.slice(prepaidCount),
  }
}

function useServicePrices (store, serviceId, appointments) {
  let data = {}

  appointments.map(i => i.providerId).forEach((providerId) => {
    let service = store.getters['entities/getEmployeeService'](
      providerId,
      serviceId
    )

    if (!(service.price in data)) {
      data[service.price] = 0
    }

    data[service.price]++
  })

  return data
}

function useAppointmentsLabels (store, serviceId, appointments) {
  let data = useServicePrices(store, serviceId, appointments)

  let persons = store.getters['booking/getBookingPersons']

  let labels = []

  for (let price in data) {
    let count = data[price]

    labels.push(
      count + ' ' + (count > 1 ? 'recurrences' : 'recurrence')
      + ' x ' + persons + ' ' + (persons > 1 ? 'persons' : 'person')
      + ' x ' + useFormattedPrice(price)
    )
  }

  return labels
}

function useExtrasLabels (store, service, appointments) {
  let labels = []

  let selectedExtras = store.getters['booking/getSelectedExtras']

  let persons = store.getters['booking/getBookingPersons']

  selectedExtras.forEach((selectedExtra) => {
    let count = appointments.length

    let extra = service.extras.find(i => i.id === parseInt(selectedExtra.extraId))

    if (extra) {
      labels.push(
          {
            name: extra.name,
            value: count + ' ' + (count > 1 ? 'appointments' : 'appointment')
                + ' x ' + selectedExtra.quantity + ' x '
                + (persons + ' ' + (persons > 1 ? 'persons' : 'person'))
                + ' x ' + useFormattedPrice(extra.price)
          }
      )
    }

  })

  return labels
}

function setPreferredEntitiesData (bookings) {
  let employeesIds = getAllEntitiesIds(bookings, 0)

  let locationsIds = getAllEntitiesIds(bookings, 1)

  let isSingleEmployee = employeesIds.length === 1

  let isSingleLocation = locationsIds.length === 1

  bookings.list.forEach((booking) => {
    if (booking.date && booking.time) {
      if (!locationsIds.length && isSingleEmployee) {
        booking.providerId = employeesIds[0]

        booking.locationId = null
      } else if (!locationsIds.length && !isSingleEmployee) {
        for (let i = 0; i < employeesIds.length; i++) {
          for (let j = 0; j < bookings.slots[booking.time].length; j++) {
            if (bookings.slots[booking.time][j][0] === employeesIds[i]) {
              booking.providerId = employeesIds[i]

              break
            }
          }
        }

        booking.locationId = null
      } else if (isSingleLocation && isSingleEmployee) {
        booking.providerId = employeesIds[0]

        booking.locationId = locationsIds[0]
      } else if (!isSingleLocation && isSingleEmployee) {
        booking.providerId = employeesIds[0]

        booking.locationId = getPreferredEntityId(
          bookings.slots[booking.date],
          booking.date in bookings.occupied ? bookings.occupied[booking.date] : {},
          booking.time,
          booking.providerId,
          locationsIds,
          1
        )
      } else if (isSingleLocation && !isSingleEmployee) {
        booking.locationId = locationsIds[0]

        booking.providerId = getPreferredEntityId(
          bookings.slots[booking.date],
          booking.date in bookings.occupied ? bookings.occupied[booking.date] : {},
          booking.time,
          booking.locationId,
          employeesIds,
          0
        )
      } else {
        for (let i = 0; i < locationsIds.length; i++) {
          for (let j = 0; j < employeesIds.length; j++) {
            let isPreferred = isPreferredLocationAndEmployee(
              bookings.slots[booking.date],
              booking.date in bookings.occupied ? bookings.occupied[booking.date] : {},
              booking.time,
              locationsIds[i],
              employeesIds[j]
            )

            if (isPreferred) {
              booking.providerId = employeesIds[j]

              booking.locationId = locationsIds[i]

              return
            }
          }
        }

        for (let i = 0; i < locationsIds.length; i++) {
          for (let j = 0; j < employeesIds.length; j++) {
            for (let k = 0; k < bookings.slots[booking.time].length; k++) {
              if (bookings.slots[booking.time][k][0] === employeesIds[j] &&
                bookings.slots[booking.time][k][1] === locationsIds[i]
              ) {
                booking.providerId = employeesIds[j]

                booking.locationId = locationsIds[i]

                return
              }
            }
          }
        }
      }
    }
  })
}

function getAllEntitiesIds (bookings, index) {
  let ids = {}

  for (let i = 0; i < bookings.list.length; i++) {
    if (bookings.list[i].date && bookings.list[i].time) {
      bookings.slots[bookings.list[i].date][bookings.list[i].time].forEach((slotData) => {
        if (!(slotData[index] in ids)) {
          ids[slotData[index]] = 0
        }

        ids[slotData[index]]++
      })
    }
  }

  let sortedEntitiesIds = []

  Object.keys(ids).forEach((id) => {
    sortedEntitiesIds.push({id: parseInt(id), quantity: ids[id]})
  })

  sortedEntitiesIds.sort((a, b) => b.quantity - a.quantity)

  return sortedEntitiesIds.map(entity => entity.id)
}

function getPreferredEntityId (availableSlots, occupiedSlots, timeString, selectedId, allIds, targetIndex) {
  let searchIndex = targetIndex ? 0 : 1

  let appointmentsStarts = {}

  Object.keys(occupiedSlots).forEach((time) => {
    occupiedSlots[time].forEach((slotData) => {
      if (slotData[searchIndex] === selectedId) {
        appointmentsStarts[useTimeInSeconds(time)] = slotData[targetIndex]
      }
    })
  })

  Object.keys(availableSlots).forEach((time) => {
    availableSlots[time].forEach((slotData) => {
      if (slotData.length >= 3 && slotData[searchIndex] === selectedId) {
        appointmentsStarts[useTimeInSeconds(time)] = slotData[targetIndex]
      }
    })
  })

  let availableIds = []

  availableSlots[timeString].forEach((slotData) => {
    if (slotData[searchIndex] === selectedId) {
      availableIds.push(slotData[targetIndex])
    }
  })

  if (Object.keys(appointmentsStarts).length) {
    let timeInSeconds = useTimeInSeconds(timeString)

    let closestSlot = Object.keys(appointmentsStarts).reduce((a, b) => {
      return Math.abs(b - timeInSeconds) < Math.abs(a - timeInSeconds) ? b : a
    })

    if (availableIds.indexOf(appointmentsStarts[closestSlot]) !== -1) {
      return appointmentsStarts[closestSlot]
    }
  }

  for (let i = 0; i < allIds.length; i++) {
    for (let j = 0; j < availableSlots[timeString].length; j++) {
      if (availableSlots[timeString][j][searchIndex] === selectedId &&
        allIds[i] === availableSlots[timeString][j][targetIndex]
      ) {
        return availableSlots[timeString][j][targetIndex]
      }
    }
  }

  return null
}

function isPreferredLocationAndEmployee (slotsData, occupiedData, timeString, locationId, employeeId) {
  let isEmployeeLocation = false

  slotsData[timeString].forEach((slotData) => {
    if (slotData[0] === employeeId && slotData[1] === locationId) {
      isEmployeeLocation = true
    }
  })

  // inspect if employee is available on proposed location
  if (!isEmployeeLocation) {
    return false
  }

  let appointmentStarts = {
    onLocation: {},
    offLocation: {}
  }

  Object.keys(occupiedData).forEach((time) => {
    occupiedData[time].forEach((slotData) => {
      if (slotData[0] === employeeId && slotData[1] === locationId) {
        appointmentStarts.onLocation[useTimeInSeconds(time)] = slotData[1]
      } else if (slotData[0] === employeeId) {
        appointmentStarts.offLocation[useTimeInSeconds(time)] = slotData[1]
      }
    })
  })

  Object.keys(slotsData).forEach((time) => {
    slotsData[time].forEach((slotData) => {
      if (slotData.length >= 3 && slotData[0] === employeeId && slotData[1] === locationId) {
        appointmentStarts.onLocation[useTimeInSeconds(time)] = slotData[1]
      } else if (slotData.length >= 3 && slotData[0] === employeeId) {
        appointmentStarts.offLocation[useTimeInSeconds(time)] = slotData[1]
      }
    })
  })

  // inspect if employee has appointments only on proposed location, or has no appointments in that day
  if (
    (!Object.keys(appointmentStarts.onLocation).length && !Object.keys(appointmentStarts.offLocation).length) ||
    (Object.keys(appointmentStarts.onLocation).length && !Object.keys(appointmentStarts.offLocation).length)
  ) {
    return true
  }

  let timeInSeconds = useTimeInSeconds(timeString)

  appointmentStarts = Object.assign(appointmentStarts.onLocation, appointmentStarts.offLocation)

  let closestTime = Object.keys(appointmentStarts).reduce((a, b) => {
    return Math.abs(b - timeInSeconds) < Math.abs(a - timeInSeconds) ? b : a
  })

  return locationId === appointmentStarts[closestTime]
}

export {
  useCapacity,
  useBuildAppointment,
  useAvailableSlots,
  useFillAppointments,
  useCalendarEvents,
  useAppointmentsPayments,
  useAppointmentsLabels,
  useServicePrices,
  useExtrasLabels,
  useAppointmentExtrasAmount,
  useAppointmentExtraAmount,
  useAppointmentsAmount,
  useDiscountAmount,
  useAppointmentDepositAmount,
  useAppointmentsTotalAmount,
  useDuration,
  usePrepaidPrice,
  usePaymentError,
  useServices,
}
