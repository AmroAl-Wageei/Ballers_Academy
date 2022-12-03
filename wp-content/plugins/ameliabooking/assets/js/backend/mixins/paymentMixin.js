export default {

  data: () => ({}),

  methods: {
    getPaymentType (payment) {
      if (!payment.gateway || payment.gateway === 'onSite') {
        return 'onsite'
      }
      if (payment.status === 'partiallyPaid') {
        return 'deposit'
      }
      return 'online'
    },

    getPaymentData (paymentId, appointment, event, pack) {
      let selectedPaymentModalData = {}

      selectedPaymentModalData.paymentId = paymentId

      if (appointment) {
        selectedPaymentModalData.bookableType = 'appointment'
        selectedPaymentModalData.bookings = appointment.bookings
        selectedPaymentModalData.bookingStart = appointment.bookingStart
        selectedPaymentModalData.bookableName = this.getServiceById(appointment.serviceId).name
        selectedPaymentModalData.bookable = this.getServiceById(appointment.serviceId)

        let provider = this.getProviderById(appointment.providerId)
        provider.fullName = provider.firstName + ' ' + provider.lastName

        selectedPaymentModalData.providers = [provider]

        appointment.bookings.forEach(function (bookItem) {
          bookItem.payments.forEach(function (payItem) {
            if (payItem.id === paymentId) {
              selectedPaymentModalData.customer = bookItem.customer
            }
          })
        })
      }

      if (event) {
        selectedPaymentModalData.bookableType = 'event'
        selectedPaymentModalData.bookings = event.bookings
        selectedPaymentModalData.bookingStart = event.periods[0].periodStart
        selectedPaymentModalData.bookableName = event.name
        selectedPaymentModalData.providers = event.providers
        selectedPaymentModalData.bookable = event

        event.bookings.forEach(function (bookItem) {
          bookItem.payments.forEach(function (payItem) {
            if (payItem.id === paymentId) {
              selectedPaymentModalData.customer = bookItem.customer
            }
          })
        })
      }

      if (pack) {
        selectedPaymentModalData.bookableType = 'package'
        selectedPaymentModalData.bookings = []
        selectedPaymentModalData.bookingStart = null
        selectedPaymentModalData.bookableName = pack.name
        selectedPaymentModalData.providers = []
        selectedPaymentModalData.bookable = pack

        selectedPaymentModalData.bookings = []
      }

      return selectedPaymentModalData
    },

    getPaymentStatusNiceName (status) {
      switch (status) {
        case ('paid'):
          return this.$root.labels.paid

        case ('pending'):
          return this.$root.labels.pending

        case ('partiallyPaid'):
          return this.$root.labels.partially_paid
      }
    },

    getPaymentGatewayNiceName (payment) {
      if (payment.gateway === 'onSite') {
        return this.$root.labels.on_site
      }

      if (payment.gateway === 'wc') {
        return payment.gatewayTitle
      }

      if (payment.gateway) {
        return payment.gateway.charAt(0).toUpperCase() + payment.gateway.slice(1)
      }
    },

    getPaymentIconWidth (paymentGateway) {
      if (paymentGateway === 'razorpay') {
        return '76px'
      }
      if (paymentGateway === 'mollie') {
        return '38px'
      }
      return '16px'
    }
  }

}
