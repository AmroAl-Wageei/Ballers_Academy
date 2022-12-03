import moment from "moment";
import httpClient from "../../../plugins/axios.js";
import { settings, locale } from "../../../plugins/settings.js"
import { useUtcValue, useLocalValue, useUtcValueOffset, useStringFromDate } from "../common/date.js";
import {reactive, ref} from "vue";
import {useCartItem} from "./cart";
import {useAppointmentsTotalAmount, useDiscountAmount, useServices} from "../common/appointments";
import {usePackageAmount} from "./package";
import useAction from "./actions";
import {useUrlQueryParams} from "../common/helper";

const globalLabels = reactive(window.wpAmeliaLabels)
let errorMessage = ref()

function usePaymentError (store, callback) {
  store.commit('booking/setLoading', false)

  callback()
}

function buildFormData (formData, data, parentKey) {
  if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
    Object.keys(data).forEach(key => {
      buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key)
    })
  } else {
    formData.append(parentKey, data !== null ? data : '')
  }
}

function useBookingData (store, formData, mandatoryJson = false, paymentData = {}, recaptcha = null) {
  let customFields = {}

  let availableCustomFields = store.getters['booking/getAvailableCustomFields']

  let attachments = store.getters['booking/getAttachments']

  for (let id in availableCustomFields) {
    if (availableCustomFields[id].type === 'file' &&
      Object.keys(attachments).length &&
      id in attachments && attachments[id].length
    ) {
      let uploadCustomField = {
        label: availableCustomFields[id].label,
        value: [],
        type: 'file'
      }

      for (let i = 0; i < attachments[id].length; i++) {
        uploadCustomField.value.push({
          name: attachments[id][i].name
        })
      }

      customFields[id] = uploadCustomField
    } else if (availableCustomFields[id].type !== 'content') {
      customFields[id] = availableCustomFields[id]
    }

    if (availableCustomFields[id].type === 'datepicker') {
      customFields[id].value = availableCustomFields[id].value ?
        useStringFromDate(new Date(availableCustomFields[id].value)) : null
    }
  }

  let bookableType = store.getters['booking/getBookableType']

  let deposit = !store.getters['booking/getPaymentDeposit']

  let componentProps = formData ? {
    state: store.state.booking,
    form: formData,
  } : null

  if (formData && 'form' in componentProps && 'sidebar' in componentProps.form) {
    componentProps.form.sidebar.forEach((item) => {
      item.data.forEach((data) => {
        if (data && 'value' in data) {
          data.value = data.value.replace(/"/g, "'")
        }
      })
    })
  }

  let jsonData = {
    type: bookableType,
    bookings: [
      {
        extras: store.getters['booking/getSelectedExtras'],
        customFields: customFields,
        deposit: deposit,
        locale: locale,
        utcOffset: null,
        persons: store.getters['booking/getBookingPersons'],
        customerId: store.getters['booking/getCustomerId'],
        customer: {
          id: store.getters['booking/getCustomerId'],
          firstName: store.getters['booking/getCustomerFirstName'],
          lastName: store.getters['booking/getCustomerLastName'],
          email: store.getters['booking/getCustomerEmail'],
          phone: store.getters['booking/getCustomerPhone'],
          countryPhoneIso: store.getters['booking/getCustomerCountryPhoneIso'],
          externalId: store.getters['booking/getCustomerExternalId'],
        }
      }
    ],
    payment: Object.assign(
      {
        gateway: store.getters['booking/getPaymentGateway'],
        currency: settings.payments.currencyCode,
      },
      {
        data: paymentData
      }
    ),
    recaptcha: recaptcha,
    locale: locale,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    urlParams: useUrlQueryParams(window.location.href),
    componentProps: componentProps,
    returnUrl: location.href,
  }

  switch (bookableType) {
    case ('appointment'):
      jsonData = Object.assign(jsonData, useAppointmentBookingData(store))

      jsonData.bookings[0].utcOffset = jsonData.utcOffset

      jsonData.bookings[0].duration = store.getters['booking/getDuration']

      break

    case ('package'):
      jsonData = Object.assign(jsonData, usePackageBookingData(store))

      break
  }

  let bookingData = jsonData
  let requestOptions = {}

  if (Object.keys(attachments).length && !mandatoryJson) {
    if (bookingData.componentProps && bookingData.componentProps.state) {
      bookingData.componentProps.state.appointments.forEach(a => {
        Object.keys(a.services).forEach(s => {
           a.services[s].slots = [];
        })
      })
    }

    bookingData = new FormData()

    buildFormData(bookingData, jsonData)

    for (let id in attachments) {
      attachments[id].forEach((item, index) => {
        bookingData.append('files[' + id + '][' + index + ']', item.raw)
      })
    }

    requestOptions = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  }

  return {
    data: bookingData,
    options: requestOptions
  }
}

function useAppointmentBookingData (store) {
  let serviceId = store.getters['booking/getServiceId']

  let cartItem = useCartItem(store)

  let appointments = cartItem.services[serviceId].list

  let firstAppointment = appointments[0]

  let otherAppointments = []

  appointments.slice(1).forEach((appointment) => {
    otherAppointments.push({
      providerId: appointment.providerId,
      locationId: appointment.locationId,
      bookingStart: appointment.date + ' ' + appointment.time,
    })
  })

  let bookingStart = firstAppointment.date + ' ' + firstAppointment.time

  let utcOffset = null

  if (settings.general.showClientTimeZone) {
    bookingStart = useUtcValue(bookingStart)

    utcOffset = useUtcValueOffset(bookingStart)

    otherAppointments.forEach((appointment) => {
      appointment.bookingStart = useUtcValue(appointment.bookingStart)

      appointment.utcOffset = useUtcValueOffset(appointment.bookingStart)
    })
  }

  let coupon = store.getters['booking/getCoupon']

  return {
    bookingStart: bookingStart,
    notifyParticipants: settings.notifications.notifyCustomers ? 1 : 0,
    locationId: firstAppointment.locationId,
    providerId: firstAppointment.providerId,
    serviceId: serviceId,
    utcOffset: utcOffset,
    recurring: otherAppointments,
    package: [],
    couponCode: coupon && (coupon.discount || coupon.deduction)? coupon.code : null,
  }
}

function usePackageBookingData (store) {
  let appointments = []

  let rules = []

  let cartItem = useCartItem(store)

  let activeItemServices = cartItem.services

  for (let serviceId in activeItemServices) {
    activeItemServices[serviceId].list.forEach((appointment) => {
      if (appointment.date && appointment.time) {
        let utcOffset = null

        let bookingStart = appointment.date + ' ' + appointment.time

        if (settings.general.showClientTimeZone) {
          bookingStart = useUtcValue(bookingStart)

          utcOffset = useUtcValueOffset(bookingStart)
        }

        appointments.push({
          bookingStart: bookingStart,
          serviceId: parseInt(serviceId),
          providerId: appointment.providerId,
          locationId: appointment.locationId,
          utcOffset: utcOffset,
          notifyParticipants: settings.notifications.notifyCustomers ? 1 : 0,
        })
      }
    })

    rules.push({
      serviceId: parseInt(serviceId),
      providerId: activeItemServices[serviceId].providerId ? activeItemServices[serviceId].providerId : null,
      locationId: activeItemServices[serviceId].locationId ? activeItemServices[serviceId].locationId : null
    })
  }

  return {
    package: appointments,
    packageId: store.getters['booking/getPackageId'],
    packageRules: rules,
    utcOffset: useUtcValueOffset(null),
    deposit: !store.getters['booking/getPaymentDeposit']
  }
}

function createBooking (store, requestData, successCallback, errorCallback) {
  httpClient.post(
    '/bookings',
    requestData.data,
    requestData.options
  ).then(successCallback).catch(errorCallback)
}

function useCreateBooking (store, requestData, successCallback, errorCallback) {
  useAction(
    store,
    useBookingData(
      store,
      null,
      true,
      {},
      null
    ).data,
    'beforeBooking',
    store.getters['booking/getBookableType'],
    () => {
      createBooking(store, requestData, successCallback, errorCallback)
    },
    message => {
      errorCallback({response:{data:{data:{message: message}}}})
    }
  )
}

function useBookingError (response) {
  let message = globalLabels['payment_error_default']

  if ('data' in response) {
    if ('customerAlreadyBooked' in response.data && response.data.customerAlreadyBooked === true) {
      message = globalLabels['customer_already_booked_app']
    } else if ('timeSlotUnavailable' in response.data && response.data.timeSlotUnavailable === true) {
      message = globalLabels['time_slot_unavailable']
    } else if ('emailError' in response.data && response.data.emailError === true) {
      message = globalLabels['email_exist_error']
    } else if ('couponUnknown' in response.data && response.data.couponUnknown === true) {
      message = globalLabels['coupon_unknown']
    } else if ('couponInvalid' in response.data && response.data.couponInvalid === true) {
      message = globalLabels['coupon_invalid']
    } else if ('couponExpired' in response.data && response.data.couponExpired === true) {
      message = globalLabels['coupon_expired']
    } else if ('couponMissing' in response.data && response.data.couponMissing === true) {
      message = globalLabels['coupon_missing']
    } else if ('paymentSuccessful' in response.data && response.data.paymentSuccessful === false) {
      message = globalLabels['payment_error']
    } else if ('bookingAlreadyInWcCart' in response.data && response.data.bookingAlreadyInWcCart === true) {
      message = globalLabels['booking_already_in_wc_cart']
    } else if ('wcError' in response.data && response.data.wcError === true) {
      message = globalLabels['wc_error']
    } else if ('recaptchaError' in response.data && response.data.recaptchaError === true) {
      message = globalLabels['recaptcha_invalid_error']
    } else if ('message' in response.data) {
      message = response.data.message
    }
  }

  return message
}

function saveStats (requestData) {
  httpClient.post(
    '/stats',
    requestData
  ).catch(e => {
    console.log(e.message)
  })
}

function useNotify (response, success, error) {
  let request = {}

  switch (response.type) {
    case ('appointment'):
      request = getAppointmentNotifyData(response)

      break

    case('package'):
      request = getPackageNotifyData(response)

      break
  }

  httpClient.post(
    '/bookings/success/' + request.id + '&nocache=' + (new Date().getTime()),
    request.data,
    {}
  ).then(success).catch(error)
}

function getAppointmentNotifyData (response) {
  let recurringData = []

  response.recurring.forEach((recurring) => {
    recurringData.push(
      {
        type: 'appointment',
        id: recurring.booking.id,
        appointmentStatusChanged: recurring.appointmentStatusChanged
      }
    )
  })

  return {
    id: response.booking.id,
    data: {
      type: 'appointment',
      appointmentStatusChanged: response.appointmentStatusChanged,
      recurring: recurringData,
      packageId: null,
      customer: response.customer,
      paymentId: 'paymentId' in response && response.paymentId ? response.paymentId : null,
      packageCustomerId: null
    }
  }
}

function getPackageNotifyData (response) {
  let bookings  = []
  let bookingId = 0
  response.package.forEach((packData, index) => {
    if (index > 0) {
      bookings.push(
          {
            type: 'appointment',
            id: packData.booking.id,
            appointmentStatusChanged: packData.appointmentStatusChanged
          }
      )
    } else {
      bookingId = packData.booking.id
    }
  })

  return {
    id: bookingId,
    data: {
      type: 'package',
      appointmentStatusChanged: response.appointmentStatusChanged,
      recurring: bookings,
      packageId: response.packageId,
      customer: response.customer,
      paymentId: 'paymentId' in response && response.paymentId ? response.paymentId : null,
      packageCustomerId: response.packageCustomerId,
    }
  }
}


function getSingleAppointmentData (store, date, data) {
  let services = useServices(store)

  let bookable = services.find(i => i.id === data.appointment.serviceId)

  return {
    appointmentId: data.appointment ? data.appointment.id : '',
    bookingId: data.booking.id,
    serviceId: data.appointment.serviceId,
    providerId: data.appointment.providerId,
    locationId: data.appointment.locationId,
    title: bookable.name,
    description: bookable.description,
    start: settings.general.showClientTimeZone ? useLocalValue(date.start) : data.appointment.bookingStart,
    end: settings.general.showClientTimeZone ? useLocalValue(date.end) : data.appointment.bookingEnd,
    utcStart: moment.utc(date.start.replace(/ /g, 'T')).toDate(),
    utcEnd: moment.utc(date.end.replace(/ /g, 'T')).toDate(),
  }
}

function runAction (store, response) {
  useAction(
    store,
    {
      payment: Object.assign(response.payment, {currency: settings.payments.currencyCode}),
    },
    response.payment.gateway === 'onSite' ? 'Schedule' : 'Purchase',
    response.type,
    null,
    null
  )
}

function useAppointmentCalendarData (store, response) {
  let appointments = []

  let payments = []
  let paymentAmount = 0
  response.utcTime.forEach((date) => {
    appointments.push(getSingleAppointmentData(store, date, response))
    payments.push(response.payment)
    paymentAmount = response.payment.amount
  })

  response.recurring.forEach((data) => {
    data.utcTime.forEach((date) => {
      appointments.push(getSingleAppointmentData(store, date, data))
      if (response.bookable.recurringPayment > 0) {
        payments.push(response.booking.payments[0])
        paymentAmount += response.booking.payments[0].amount
      }
    })
  })

  runAction(store, response)

  return {
    type: 'appointment',
    data: appointments,
    token: response.booking.token,
    payments: payments,
    paymentAmount: paymentAmount,
    price: useAppointmentsTotalAmount(store, response.bookable, appointments) - (response.booking && response.booking.coupon ? useDiscountAmount(store, response.booking.coupon, appointments) : 0),
    customerCabinetUrl: response.customerCabinetUrl,
  }
}

function usePackageCalendarData (store, response) {
  let token = ''

  let appointments = []

  response.package.forEach((data, index) => {
    if (index === 0) {
      token = data.booking.token
    }

    data.utcTime.forEach((date) => {
      appointments.push(getSingleAppointmentData(store, date, data))
    })
  })

  runAction(store, response)

  return {
    type: 'package',
    data: appointments,
    token: token,
    payments: [response.payment],
    paymentAmount: response.payment.amount,
    payment: response.payment,
    price: usePackageAmount(store),
    customerCabinetUrl: response.customerCabinetUrl,
  }
}

function useCreateBookingSuccess (store, response, callback) {
  if (response.data.data) {
    store.commit('booking/setLoading', false)

    switch (store.getters['booking/getBookableType']) {
      case ('appointment'):
        store.commit('booking/setBooked', useAppointmentCalendarData(store, response.data.data))

        break

      case ('package'):
        store.commit('booking/setBooked', usePackageCalendarData(store, response.data.data))

        break
    }

    useNotify(response.data.data, () => {}, () => {})
  }

  if (typeof callback !== 'undefined') {
    callback()
  }
}

function useCreateBookingError (store, response, callback) {
  if ('data' in response) {
    errorMessage.value = useBookingError(response)
  }

  store.commit('booking/setLoading', false)

  if (typeof callback !== 'undefined') {
    callback()
  }
}

function getErrorMessage () {
  return errorMessage.value
}

export {
  usePaymentError,
  useBookingData,
  useCreateBooking,
  useCreateBookingSuccess,
  useCreateBookingError,
  useAppointmentCalendarData,
  usePackageCalendarData,
  getErrorMessage,
  useBookingError,
  useNotify,
  saveStats,
  useAppointmentBookingData,
}
