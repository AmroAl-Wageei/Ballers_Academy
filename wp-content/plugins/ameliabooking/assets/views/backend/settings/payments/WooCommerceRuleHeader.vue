<template>
  <h3>#{{ index + 1 + ' ' + getOrderStatusLabel(extension.order) + ' (WooCommerce)'}}</h3>
</template>

<script>
import propertiesMixin from '../../../../js/common/mixins/propertiesMixin'

export default {
  name: 'wooCommerceRuleHeader',

  mixins: [
    propertiesMixin
  ],

  props: {
    index: {
      type: Number,
      default: 0
    },

    type: {
      type: String,
      default: ''
    },

    extension: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
