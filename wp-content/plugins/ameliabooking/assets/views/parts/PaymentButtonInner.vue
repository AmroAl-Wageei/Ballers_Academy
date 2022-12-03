<template>
    <div class="am-payment-button-inner">
      <img v-if="value !== 'onsite' && value !== 'mollie'" :width="value === 'razorpay' ? '70' : '32'" height="32" :src="$root.getUrl + 'public/img/payments/icons/' + value.toLowerCase() +'.svg'">
      <svg-icon
        v-else-if="value === 'onsite' || value === 'mollie'"
        :iconName="value"
        :iconColor="color"
      >
      </svg-icon>
      <p v-if="value !== 'razorpay'">{{ formatPaymentName(value) }}</p>
    </div>
</template>

<script>
import svgIcon from '../backend/customize/parts/svgIcon'

export default {
  name: 'paymentButtonInner',

  components: {
    svgIcon
  },

  props: {
    value: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    }
  },

  data () {
    return {

    }
  },

  methods: {
    formatPaymentName (name) {
      let paymentName = name.toLowerCase()

      switch (paymentName) {
        case 'paypal':
          return 'Paypal'
        case 'stripe':
          return 'Stripe'
        case 'onsite':
          return 'On-Site'
        case 'mollie':
          return 'Online'
        case 'razorpay':
          return 'Razorpay'
        default:
          return name
      }
    }
  }
}
</script>
