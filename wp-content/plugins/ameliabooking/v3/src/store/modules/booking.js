export default {
  namespaced: true,

  state: () => ({
    appointment: {
      bookingStartDate: '',
      bookingStartTime: '',
      bookings: [{
        customer: {
          email: '',
          externalId: null,
          firstName: '',
          id: null,
          lastName: '',
          phone: '',
          countryPhoneIso : '',
        },
        customFields: {},
        customerId: 0,
        extras: [],
        persons: 1,
        haveMandatoryExtras: false,
        minSelectedExtras: 0
      }],
      duration: 0,
      group: false,
      notifyParticipants:'',
      payment: {
        amount: 0,
        gateway: '',
        deposit: false,
        data: {}
      },
      categoryId: null,
      serviceId: null,
      locationId: null,
      providerId: null,
      packageId: null,
    },
    coupon: {
      code: '',
      discount: '',
      deduction: '',
      limit: '',
    },
    appointmentsIndex: 0,
    appointments: [],
    attachments: {},
    recurringRules: {
      repeat: {
        type: 'daily',
        interval: 1,
      },
      occurrence: {
        type: 'After',
        date: null,
        count: 1,
      },
      days: [
        {value: 'monday', selected: false},
        {value: 'tuesday', selected: false},
        {value: 'wednesday', selected: false},
        {value: 'thursday', selected: false},
        {value: 'friday', selected: false},
        {value: 'saturday', selected: false},
        {value: 'sunday', selected: false}
      ],
      monthly: 0
    },
    loading: false,
    booked: null,
    ready: false,
    packageId: null,
    error: '',
  }),

  getters: {
    getSelection (state) {
      return {
        packageId: state.packageId,
        categoryId: state.appointment.categoryId,
        serviceId: state.appointment.serviceId,
        providerId: state.appointment.providerId,
        locationId: state.appointment.locationId,
        persons: state.appointment.bookings[0].persons,
        type: state.appointment.type,
      }
    },

    getServiceProviderSelection (state) {
      return {
        serviceId: state.appointment.serviceId,
        providerId: state.appointment.providerId,
        locationId: state.appointment.locationId,
      }
    },

    getPackageId (state) {
      return state.packageId
    },

    getCategoryId (state) {
      return state.appointment.categoryId
    },

    getServiceId (state) {
      return state.appointment.serviceId
    },

    getEmployeeId (state) {
      return state.appointment.providerId
    },

    getLocationId (state) {
      return state.appointment.locationId
    },

    getBookingPersons (state) {
      return state.appointment.bookings[0].persons
    },

    getBookableType (state) {
      return state.appointment.type
    },

    getMultipleAppointmentsIndex (state) {
      return state.appointmentsIndex
    },

    getAllMultipleAppointments (state) {
      return state.appointments
    },

    getMultipleAppointmentsServiceSlots (state) {
      let selection = state.appointments[state.appointmentsIndex].services[state.appointments[state.appointmentsIndex].serviceId]

      if (selection.providerId || selection.locationId) {
        let slots = {}

        for (let date in selection.slots) {
          for (let time in selection.slots[date]) {
            for (let i = 0; i < selection.slots[date][time].length; i++) {
              if ((selection.providerId && selection.slots[date][time][i][0] === selection.providerId) ||
                (selection.locationId && selection.slots[date][time][i][1] === selection.locationId)
              ) {
                if (!(date in slots)) {
                  slots[date] = {}
                }

                slots[date][time] = selection.slots[date][time]
              }
            }
          }
        }

        return slots
      }

      return state.appointments[state.appointmentsIndex].services[state.appointments[state.appointmentsIndex].serviceId].slots
    },

    getMultipleAppointmentsOccupied (state) {
      return state.appointments[state.appointmentsIndex].services[state.appointments[state.appointmentsIndex].serviceId].occupied
    },

    getMultipleAppointmentsRange (state) {
      let i = state.appointmentsIndex

      return state.appointments[i]
        .services[state.appointments[i].serviceId]
        .list[state.appointments[i].index]
        .range
    },

    getMultipleAppointmentsDate (state) {
      let i = state.appointmentsIndex

      return state.appointments[i]
          .services[state.appointments[i].serviceId]
          .list[state.appointments[i].index]
          .date
    },

    getMultipleAppointmentsTime (state) {
      let i = state.appointmentsIndex

      return state.appointments[i]
          .services[state.appointments[i].serviceId]
          .list[state.appointments[i].index]
          .time
    },

    getMultipleAppointmentsSlots (state) {
      let i = state.appointmentsIndex

      return state.appointments[i]
        .services[state.appointments[i].serviceId]
        .slots
    },

    getMultipleAppointmentsLastDate (state) {
      let i = state.appointmentsIndex

      return state.appointments[i]
          .services[state.appointments[i].serviceId]
          .lastDate
    },

    getSelectedExtras (state) {
      return state.appointment.bookings[0].extras
    },

    getCustomerId (state) {
      return state.appointment.bookings[0].customer.id
    },

    getCustomerFirstName (state) {
      return state.appointment.bookings[0].customer.firstName
    },

    getCustomerLastName (state) {
      return state.appointment.bookings[0].customer.lastName
    },

    getCustomerEmail (state) {
      return state.appointment.bookings[0].customer.email
    },

    getCustomerPhone (state) {
      return state.appointment.bookings[0].customer.phone
    },

    getCustomerCountryPhoneIso (state) {
      return state.appointment.bookings[0].customer.countryPhoneIso
    },

    getCustomerExternalId (state) {
      return state.appointment.bookings[0].customer.externalId
    },

    getAvailableCustomFields (state) {
      return state.appointment.bookings[0].customFields
    },

    getRecurringRules (state) {
      return state.recurringRules
    },

    getRecurringRepeatType (state) {
      return state.recurringRules.repeat.type
    },

    getRecurringRepeatInterval (state) {
      return state.recurringRules.repeat.interval
    },

    getRecurringOccurrenceType (state) {
      return state.recurringRules.occurrence.type
    },

    getRecurringOccurrenceDate (state) {
      return state.recurringRules.occurrence.date
    },

    getRecurringOccurrenceCount (state) {
      return state.recurringRules.occurrence.count
    },

    getRecurringDays (state) {
      return state.recurringRules.days
    },

    getRecurringMonthly (state) {
      return state.recurringRules.monthly
    },

    getAttachments (state) {
      return state.attachments
    },

    getCoupon (state) {
      return state.coupon
    },

    getPaymentGateway (state) {
      return state.appointment.payment.gateway
    },

    getPaymentDeposit (state) {
      return state.appointment.payment.deposit
    },

    getDuration (state) {
      return state.appointment.duration
    },

    getLoading (state) {
      return state.loading
    },

    getBooked (state) {
      return state.booked
    },

    getError (state) {
      return state.error
    },
  },

  mutations: {
    setPackageId (state, payload) {
      state.packageId = payload
    },

    setCategoryId (state, payload) {
      state.appointment.categoryId = payload
    },

    setServiceId (state, payload) {
      state.appointment.serviceId = payload
    },

    setEmployeeId (state, payload) {
      state.appointment.providerId = payload
    },

    setLocationId (state, payload) {
      state.appointment.locationId = payload
    },

    setMultipleIndex (state, payload) {
      state.appointmentsIndex = payload
    },

    setMultipleAppointments (state, payload) {
      state.appointments = payload
    },

    setMultipleAppointmentsServiceId (state, payload) {
      state.appointments[state.appointmentsIndex].serviceId = payload
    },

    setMultipleAppointmentsIndex (state, payload) {
      state.appointments[state.appointmentsIndex].index = payload
    },

    unsetMultipleAppointmentsData (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .list[payload] = {
        date: null,
        time: null,
        providerId: null,
        locationId: null,
      }
    },

    setMultipleAppointmentsRange (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .list[state.appointments[i].index]
        .range = payload
    },

    setMultipleAppointmentsDate (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .list[state.appointments[i].index]
        .date = payload
    },

    setMultipleAppointmentsTime (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .list[state.appointments[i].index]
        .time = payload
    },

    setMultipleAppointmentsProviderId (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .list[state.appointments[i].index]
        .providerId = payload
    },

    setMultipleAppointmentsLocationId (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .list[state.appointments[i].index]
        .locationId = payload
    },

    setMultipleAppointmentsSlots (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .slots = payload
    },

    setMultipleAppointmentsOccupied (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .occupied = payload
    },

    setMultipleAppointmentsLastDate (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
          .services[state.appointments[i].serviceId]
          .lastDate = payload
    },

    setMultipleAppointmentsServiceProvider (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .providerId = payload ? parseInt(payload) : null
    },

    setMultipleAppointmentsServiceLocation (state, payload) {
      let i = state.appointmentsIndex

      state.appointments[i]
        .services[state.appointments[i].serviceId]
        .locationId = payload ? parseInt(payload) : null
    },

    setBookingPersons (state, payload) {
      state.appointment.bookings[0].persons = payload + 1
    },

    setAvailableCustomFields (state, payload) {
      state.appointment.bookings[0].customFields = payload
    },

    setBookableType (state, payload) {
      state.appointment.type = payload
    },

    setSelectedExtras (state, payload) {
      state.appointment.bookings[0].extras = payload
    },

    setCustomerId (state, payload) {
      state.appointment.bookings[0].customer.id = payload
    },

    setCustomerFirstName (state, payload) {
      state.appointment.bookings[0].customer.firstName = payload
    },

    setCustomerLastName (state, payload) {
      state.appointment.bookings[0].customer.lastName = payload
    },

    setCustomerEmail (state, payload) {
      state.appointment.bookings[0].customer.email = payload
    },

    setCustomerPhone (state, payload) {
      state.appointment.bookings[0].customer.phone = payload
    },

    setCustomerCountryPhoneIso (state, payload) {
      state.appointment.bookings[0].customer.countryPhoneIso = payload
    },

    setCustomerExternalId (state, payload) {
      state.appointment.bookings[0].customer.externalId = payload
    },

    setRecurringRules (state, payload) {
      state.recurringRules = payload
    },

    setRecurringRepeatType (state, payload) {
      state.recurringRules.repeat.type = payload
    },

    setRecurringRepeatInterval (state, payload) {
      state.recurringRules.repeat.interval = payload
    },

    setRecurringOccurrenceType (state, payload) {
      state.recurringRules.occurrence.type = payload
    },

    setRecurringOccurrenceDate (state, payload) {
      state.recurringRules.occurrence.date = payload
    },

    setRecurringOccurrenceCount (state, payload) {
      state.recurringRules.occurrence.count = payload
    },

    setRecurringDays (state, payload) {
      state.recurringRules.days.find(day => day.value === payload.value).selected = payload.selected
    },

    setRecurringMonthly (state, payload) {
      state.recurringRules.monthly = payload
    },

    setAttachment (state, payload) {
      state.attachments[payload.id] = payload.raw
    },

    setCoupon (state, payload) {
      state.coupon = payload
    },

    setPaymentGateway (state, payload) {
      state.appointment.payment.gateway = payload
    },

    setPaymentDeposit (state, payload) {
      state.appointment.payment.deposit = payload
    },

    setDuration (state, payload) {
      state.appointment.duration = payload
    },

    setLoading (state, payload) {
      state.loading = payload
    },

    setBooked (state, payload) {
      state.booked = payload
    },

    setError (state, payload) {
      state.error = payload
    },
  },
}
