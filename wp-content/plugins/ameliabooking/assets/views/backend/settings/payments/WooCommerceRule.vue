<template>
  <div>
    <el-row :gutter="24" class="zero-margin-bottom">
      <el-col :span="14">
        <el-form-item prop="order" :rules="rules.order">
          <label slot="label">
            {{ $root.labels.wc_order }}:
          </label>
          <el-select
            v-model="extension.order"
          >
            <el-option
              v-for="item in unusedOrderStatuses"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="10">
        <el-form-item prop="update" :rules="rules.update">
          <label slot="label">
            {{ $root.labels.wc_status_update_order }}:
          </label>
          <el-select
              v-model="extension.update"
          >
            <el-option
              v-for="item in [{value: true, label: $root.labels.wc_status_update_order_yes}, {value: false, label: $root.labels.wc_status_update_order_no}]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="zero-margin-bottom">
      <el-col :span="14">
        <el-form-item prop="booking" :rules="rules.booking">
          <label slot="label">
            {{ $root.labels.booking }}:
          </label>
          <el-select
              v-model="extension.booking"
          >
            <el-option
              v-for="item in bookingStatuses"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="10">
        <el-form-item prop="payment" :rules="rules.payment">
          <label slot="label">
            {{ $root.labels.payment }}:
          </label>
          <el-select
              v-model="extension.payment"
          >
            <el-option
              v-for="item in paymentStatuses"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import propertiesMixin from '../../../../js/common/mixins/propertiesMixin'

export default {
  name: 'wooCommerceRule',

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
    },

    extensions: {
      type: Array,
      default: []
    }
  },

  data () {
    return {
      rules: {
        order: [
          {required: true, message: this.$root.labels.select_value_warning, trigger: 'submit'}
        ],
        update: [
          {required: true, message: this.$root.labels.select_value_warning, trigger: 'submit'}
        ],
        booking: [
          {required: true, message: this.$root.labels.select_value_warning, trigger: 'submit'}
        ],
        payment: [
          {required: true, message: this.$root.labels.select_value_warning, trigger: 'submit'}
        ]
      }
    }
  },

  computed: {
    bookingStatuses () {
      switch (this.type) {
        case ('appointment'):
          return [{value: 'default', label: this.$root.labels.default_appointment_status}].concat(this.bookingAppointmentStatuses)

        case ('package'):
          return this.bookingPackageStatuses

        case ('event'):
          return this.bookingEventStatuses
      }
    },

    unusedOrderStatuses () {
      return this.orderStatuses
    }
  }
}
</script>
