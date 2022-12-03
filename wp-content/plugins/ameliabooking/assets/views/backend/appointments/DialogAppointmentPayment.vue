<template>
  <div class="am-dialog-table">
    <div v-if="appointment.bookings.length > 0">
      <div v-for="booking in appointment.bookings" class="am-customer-extras">
        <div v-for="payment in booking.payments">
          <el-row class="am-customer-extras-data">
            <el-col>
              <h3>{{ booking.customer.firstName }} {{ booking.customer.lastName }}</h3>
              <span>{{ booking.customer.email }}</span>
            </el-col>
          </el-row>

          <el-row class="am-customer-extras-payment" :gutter="10">
            <el-col :span="12">
              <span class="am-strong">{{ $root.labels.payment }}</span>
            </el-col>
            <el-col :span="12">
              <span class="am-link" @click="showDialogEditPayment(payment, booking)">
                {{ $root.labels.view_payment_details }}
              </span>
            </el-col>
            <el-col :span="12">
              <span>{{ $root.labels.date }}:</span>
            </el-col>
            <el-col :span="12">
              <span class="am-semi-strong">{{ getFrontedFormattedDate(payment.dateTime) }}</span>
            </el-col>
            <el-col :span="12">
              <span>{{ $root.labels.payment_method }}:</span>
            </el-col>
            <el-col :span="12">
                      <span class="am-semi-strong">
                        <img class="svg-amelia"  :style="{width: getPaymentIconWidth(payment.gateway)}"
                             :src="$root.getUrl + 'public/img/payments/' + payment.gateway + '.svg'"/>
                        <span v-if="payment.gateway !== 'razorpay'">{{ getPaymentGatewayNiceName(payment) }}</span>
                      </span>
            </el-col>
            <el-col :span="12" v-if="payment.wcOrderId && !isCabinet">
              <span>{{ $root.labels.wc_order }}:</span>
            </el-col>
            <el-col :span="12" v-if="payment.wcOrderUrl && !isCabinet">
              <a :href="payment.wcOrderUrl" target="_blank">
                #{{ payment.wcOrderId }}
              </a>
            </el-col>
            <el-col :span="12">
              <span>{{ $root.labels.status }}:</span>
            </el-col>
            <el-col :span="12">
              <span class="am-semi-strong">
                <i :class="{'el-icon-circle-check': payment.status === 'paid' || payment.status === 'partiallyPaid', 'partially-paid': payment.status === 'partiallyPaid', 'el-icon-refresh': payment.status === 'pending'}"></i>
                {{ getPaymentStatus(payment.status) }}
              </span>
            </el-col>

            <el-col :span="12" v-if="booking.packageCustomerService">
              <span>{{ $root.labels.package }}:</span>
            </el-col>
            <el-col :span="12" v-if="booking.packageCustomerService" class="am-payment-package-name">
              <img
                :src="$root.getUrl + 'public/img/am-package.svg'"
              >
                <span class="am-semi-strong">
                  {{(pack = getPackageById(booking.packageCustomerService.packageCustomer.packageId)) ? pack.name : 'Package' }}
                </span>
            </el-col>
          </el-row>

          <el-row :gutter="10" class="subtotal" v-if="!booking.packageCustomerService">
            <el-col :span="14" class="align-right">
              {{ $root.labels.price }}:
            </el-col>
            <el-col :span="10" class="align-right">
              {{ getFormattedPrice(booking.serviceTotalPrice) }}
            </el-col>

            <el-col :span="14" class="align-right">
              {{ $root.labels.extras }}:
            </el-col>
            <el-col :span="10" class="align-right">
              {{ getFormattedPrice(booking.extrasTotalPrice) }}
            </el-col>

            <el-col :span="14" class="align-right">
              <span>{{ $root.labels.subtotal }}:</span>
            </el-col>
            <el-col :span="10" class="align-right">
              <span>{{ getFormattedPrice(getBookingSubtotal(booking)) }}</span>
            </el-col>

            <el-col :span="14" class="align-right">
              {{ $root.labels.discount_amount }}:
            </el-col>
            <el-col :span="10" class="align-right">
              {{ getFormattedPrice((discount = getBookingDiscount(booking)) > (subtotal = getBookingSubtotal(booking)) ? subtotal : discount) }}
            </el-col>

            <el-col :span="14" class="align-right" v-if="getBookingTax(booking)">
              {{ $root.labels.tax }}:
            </el-col>
            <el-col :span="10" class="align-right" v-if="getBookingTax(booking)">
              {{ getFormattedPrice(getBookingTax(booking)) }}
            </el-col>

            <el-col :span="14" class="align-right">
              {{ $root.labels.paid }}:
            </el-col>
            <el-col :span="10" class="align-right">
              {{ getFormattedPrice(payment.amount) }}
            </el-col>


            <el-col :span="14" class="align-right">
              <span>{{ $root.labels.due }}:</span>
            </el-col>
            <el-col :span="10" class="align-right">
              <span>{{ getFormattedPrice(getBookingDue(booking)) }}</span>
            </el-col>

            <el-col :span="14" class="align-right">
              <span class="am-strong">{{ $root.labels.total }}:</span>
            </el-col>
            <el-col :span="10" class="align-right">
              <span class="am-strong">{{ getFormattedPrice(getBookingTotal(booking)) }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="10" class="subtotal" v-else>
            <div class="am-payment-package-deal">
              <img
                :src="$root.getUrl + 'public/img/am-package-black.svg'"
              >
              <span>{{ $root.labels.package_deal }}</span>
            </div>
            <el-col :span="14" class="align-right">
              {{ $root.labels.package_price }}:
            </el-col>
            <el-col :span="10" class="align-right">
              {{ getFormattedPrice(booking.packageCustomerService.packageCustomer.price) }}
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div v-else>
      <p align="center">{{ $root.labels.no_selected_customers }}</p>
    </div>
  </div>
</template>

<script>
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import priceMixin from '../../../js/common/mixins/priceMixin'
  import paymentMixin from '../../../js/backend/mixins/paymentMixin'
  import entitiesMixin from '../../../js/common/mixins/entitiesMixin'

  export default {
    mixins: [dateMixin, priceMixin, paymentMixin, entitiesMixin],

    props: {
      appointment: {
        default: () => {},
        type: Object
      },
      isCabinet: false,
      options: null
    },

    data () {
      return {
        paymentStatuses: [
          {
            value: 'paid',
            label: this.$root.labels.paid

          }, {
            value: 'pending',
            label: this.$root.labels.pending

          },
          {
            value: 'partiallyPaid',
            label: this.$root.labels.partially_paid

          }
        ]
      }
    },

    methods: {
      showDialogEditPayment (payment, booking) {
        payment.customerId = booking.customerId

        let pack = booking.packageCustomerService ? this.getPackageById(booking.packageCustomerService.packageCustomer.packageId) : null

        this.$emit(
          'editPayment',
          {
            payment: payment,
            appointment: this.appointment,
            booking: booking,
            package: booking.packageCustomerService ? {name: pack ? pack.name : 'Package'} : null
          })
      },

      getPaymentStatus (status) {
        let statusLabel = ''

        this.paymentStatuses.forEach(function (statItem) {
          if (statItem.value === status) {
            statusLabel = statItem.label
          }
        })

        return statusLabel
      },

      getBookingSubtotal (booking) {
        return booking.serviceTotalPrice + booking.extrasTotalPrice
      },

      getBookingDiscount (booking) {
        return booking.discountTotalPrice + (booking.payments[0] && booking.payments[0].wcItemCouponValue ? booking.payments[0].wcItemCouponValue : 0)
      },

      getBookingDue (booking) {
        let due = this.getBookingTotal(booking) - (booking.payments[0] ? booking.payments[0].amount : 0)

        return due >= 0 ? due : 0
      },

      getBookingTotal (booking) {
        let total = (this.getBookingSubtotal(booking) + this.getBookingTax(booking)) - this.getBookingDiscount(booking)

        return total >= 0 ? total : 0
      },

      getBookingTax (booking) {
        return booking.payments[0] && booking.payments[0].wcItemTaxValue ? booking.payments[0].wcItemTaxValue : 0
      }
    }
  }
</script>
