import { settings } from "../../../plugins/settings";
import { useRemoveUrlParameter } from "../common/helper.js";
import { useAppointmentCalendarData, usePackageCalendarData, useBookingError, useNotify } from "./booking.js";
import { useBuildPackage } from "./package.js";
import { useLocalValue } from "../common/date";
import { useCartItem } from "./cart";

function fixType (item, key) {
  item[key] = !item[key] ? null : parseInt(item[key])
}

function fixCacheData (data) {
  let keys = []

  data.request.state.attachments = []

  data.request.state.booked = null

  data.request.state.loading = true

  data.request.state.ready = false

  if (!('extras' in data.request.state.appointment.bookings[0])) {
    data.request.state.appointment.bookings[0].extras = []
  }

  fixType(data.request.state, 'packageId')

  fixType(data.request.state, 'appointmentsIndex')

  data.request.state.appointments.forEach((a) => {
    keys = ['index', 'packageId', 'serviceId']

    keys.forEach((key) => {
      fixType(a, key)
    })

    for (let serviceId in a.services) {
      a.services[serviceId].list.forEach((i) => {
        keys = ['locationId', 'providerId']

        keys.forEach((key) => {
          fixType(i, key)
        })
      })

      keys = ['locationId', 'providerId']

      keys.forEach((key) => {
        fixType(a.services[serviceId], key)
      })
    }
  })

  keys = ['locationId', 'providerId', 'serviceId', 'categoryId', 'packageId']

  keys.forEach((key) => {
    fixType(data.request.state.appointment, key)
  })
}

function useRestore (store, shortcodeData) {
  let data = 'ameliaCache' in window && window.ameliaCache.length && window.ameliaCache[0] ?
    JSON.parse(window.ameliaCache[0]) : null

  if (!data || (parseInt(data.request.form.shortcode.counter) !== parseInt(shortcodeData.counter))) {
    return null
  }

  try {
    window.history.replaceState(
      null,
      null,
      useRemoveUrlParameter(
        useRemoveUrlParameter(
          window.location.href,
          'ameliaWcCache'
        ),
        'ameliaCache'
      )
    )
  } catch (e) {
    console.log(e)
  }

  if (data.request.state.attachments && (data.request.state.attachments.length || Object.keys(data.request.state.attachments).length)) {
    fixCacheData(data)
  }

  store.state.booking = {...data.request.state }

  switch ((data.status !== null) ? data.status : 'paid') {
    case ('canceled'):
      return {
        result: 'canceled',
        steps: data.request.form.steps,
        sidebar: data.request.form.sidebar,
      }

    case ('failed'):
      store.commit('booking/setError', useBookingError(data))

      return {
        result: 'error',
        steps: data.request.form.steps,
        sidebar: data.request.form.sidebar,
      }

    case ('paid'):
      switch (data.response.type) {
        case ('appointment'):
          store.commit('booking/setBooked', useAppointmentCalendarData(store, data.response))

          break

        case ('package'):
          store.commit('booking/setBooked', usePackageCalendarData(store, data.response))

          break
      }

      useNotify(data.response, () => {}, () => {})

      return {
        result: 'success',
        steps: data.request.form.steps,
        sidebar: data.request.form.sidebar,
      }
  }
}

export default useRestore
