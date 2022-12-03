<template>
  <div>
    <el-row :gutter="24" class="zero-margin-bottom">
      <el-col :sm="24" class="zero-margin-bottom" style="min-height: 20px;">
        {{ $root.labels.booking + ': ' + getBookingStatusLabelWithDefault() }}
      </el-col>
    </el-row>

    <el-row :gutter="24" class="zero-margin-bottom">
      <el-col :sm="24" class="zero-margin-bottom" style="min-height: 20px;">
        {{ $root.labels.payment + ': ' + getPaymentStatusLabel(extension.payment) }}
      </el-col>
    </el-row>

    <el-row :gutter="24" class="zero-margin-bottom">
      <el-col :sm="24" class="zero-margin-bottom" style="min-height: 20px;">
        {{ $root.labels.wc_status_update_order + ': ' + (extension.update ? $root.labels.wc_status_update_order_yes : $root.labels.wc_status_update_order_no) }}
      </el-col>
    </el-row>
  </div>
</template>

<script>
import propertiesMixin from '../../../../js/common/mixins/propertiesMixin'

export default {
  name: 'wooCommerceRuleInfo',

  mixins: [
    propertiesMixin
  ],

  props: {
    type: {
      type: String,
      default: ''
    },

    extension: {
      type: Object,
      default: () => {}
    }
  },

  methods: {
    getBookingStatusLabelWithDefault () {
      return this.extension.booking === 'default' ? this.$root.labels.default_appointment_status : this.getBookingStatusLabel(this.extension.booking, this.type)
    }
  }
}
</script>
