<template>
  <div class="am-fs__payments-wrapper" :style="cssVars">
    <div class="am-fs__payments">

      <AmCollapse v-if="isRecurring" class="am-fs__payments-services">
        <AmCollapseItem :side="true" @collapse-open="recurringCollapseState = false" @collapse-close="recurringCollapseState = true">
          <template #heading>
            <div class="am-fs__payments-services-info">
              <span>{{ amLabels.summary_services }}</span>
            </div>
          </template>
          <template #icon-below>
            <Transition :duration="{enter: 500, leave: 500}" @enter="onCollapseClose" @leave="onCollapseOpen">
              <div v-show="recurringCollapseState" class="am-fs__payments-services-sub">
                <p>{{ amLabels.summary_services_subtotal }}</p>
                <p class="am-amount">{{ useFormattedPrice(prepaidServiceAmount + postpaidServiceAmount) }}</p>
              </div>
            </Transition>
          </template>
          <template #default>
            <div class="am-fs__payments-services-open">
              <div v-for="(sNum, sPrice) in servicePrices" :key="sPrice" class="am-fs__payments-services-open-text">
                <span> {{ service.name }} ({{ useFormattedPrice(sPrice) }}) {{ 'x' + persons + ' ' + (persons > 1 ? amLabels.summary_persons : amLabels.summary_person)}}</span>
                <span class="am-amount"> {{ useFormattedPrice(sPrice*(service.aggregatedPrice ? persons : 1)) }} </span>
              </div>

              <div
                v-for="(sNum, sPrice) in servicePrices"
                v-show="isRecurring"
                :key="sPrice"
                class="am-fs__payments-services-open-total am-fs__payments-services-open-text"
              >
                <span>{{ sNum + ' ' + (sNum > 1 ? amLabels.summary_recurrences : amLabels.summary_recurrence) + ' x ' + service.name + ' (' + useFormattedPrice(sPrice) + ') x ' + persons + ' ' + (persons > 1 ? amLabels.summary_persons : amLabels.summary_person) }}</span>
              </div>

              <div class="am-fs__payments-services-sub">
                <p> {{ amLabels.summary_services_subtotal }}</p>
                <p class="am-amount">{{ useFormattedPrice(prepaidServiceAmount + postpaidServiceAmount) }}</p>
              </div>
            </div>
          </template>
        </AmCollapseItem>
      </AmCollapse>

      <div v-else class="am-fs__payments-service">
        <div class="am-fs__payments-services-info">
          <span>{{ amLabels.summary_services }}</span>
        </div>
        <div class="am-fs__payments-services-open">
          <div v-for="(sNum, sPrice) in servicePrices" :key="sPrice" class="am-fs__payments-services-sub">
            <p> {{ service.name }} ({{ useFormattedPrice(sPrice) }}) <span v-if="service.aggregatedPrice">{{ 'x ' + persons + ' ' + (persons > 1 ? amLabels.summary_persons : amLabels.summary_person)}}</span></p>
            <p class="am-amount"> {{ useFormattedPrice(sPrice*(service.aggregatedPrice ? persons : 1)) }} </p>
          </div>
        </div>
      </div>

      <AmCollapse v-if="extras.length" class="am-fs__payments-services">
        <!--  -->
        <AmCollapseItem :side="true" @collapse-open="extrasCollapseState = false" @collapse-close="extrasCollapseState = true">
          <template #heading>
            <div class="am-fs__payments-services-info">
              <span>{{ amLabels.summary_extras }}</span>
            </div>
          </template>
          <template #icon-below>
            <Transition :duration="{enter: 500, leave: 500}" @enter="onCollapseClose" @leave="onCollapseOpen">
              <div v-show="extrasCollapseState" class="am-fs__payments-services-sub">
                <p>{{ amLabels.summary_extras_subtotal }}</p>
                <p class="am-amount">{{ useFormattedPrice(postpaidExtrasAmount + prepaidExtrasAmount) }}</p>
              </div>
            </Transition>
          </template>
          <template #default>
            <div class="am-fs__payments-services-open">
              <div v-for="extra in extras" :key="extra.extraId" class="am-fs__payments-services-open-text">
                <span> {{ extra.quantity }} {{ extra.name }} ({{ useFormattedPrice(extra.price) }}) <span v-if="extra.aggregatedPrice === null ? service.aggregatedPrice : extra.aggregatedPrice">{{ 'x ' + persons + ' ' + (persons > 1 ? amLabels.summary_persons : amLabels.summary_person) }}</span>  </span>
                <span class="am-amount"> {{ useFormattedPrice(useAppointmentExtraAmount(service, extra, persons)) }} </span>
              </div>

              <div
                v-for="(sNum, sPrice) in servicePrices"
                v-show="isRecurring"
                :key="sPrice" class="am-fs__payments-services-open-total am-fs__payments-services-open-text"
              >
                <span>{{ `${sNum} ${sNum > 1 ? amLabels.summary_recurrences : amLabels.summary_recurrence} x ${amLabels.summary_extras} ( ${useFormattedPrice(extras.reduce((partialSum, extra) => partialSum + useAppointmentExtraAmount(service, extra, persons), 0))} )` }}</span>
              </div>

              <div class="am-fs__payments-services-sub">
                <p>{{ amLabels.summary_extras_subtotal }}</p>
                <p class="am-amount">{{ useFormattedPrice(postpaidExtrasAmount + prepaidExtrasAmount) }}</p>
              </div>
            </div>
          </template>
        </AmCollapseItem>
      </AmCollapse>
    </div>

    <div class="am-fs__payments-app-info">
      <div class="am-fs__payments-app-info-subtotal">
        <span>{{amLabels.subtotal}}:</span>
        <span class="am-amount">{{ useFormattedPrice(prepaidServiceAmount + postpaidServiceAmount + prepaidExtrasAmount + postpaidExtrasAmount) }}</span>
      </div>

      <Coupon
        v-if="settings.payments.coupons"
        @coupon-applied="couponApplied"
      />

      <Transition name="am-fade">
        <div
          v-if="settings.payments.coupons"
          v-show="discount.prepaid > 0"
          class="am-fs__payments-app-info-discount"
          :class="{'am-fs__payments-app-info-discount-green': discount.prepaid > 0 }"
        >
          <span>{{amLabels.discount_amount_colon}}:</span>
          <span class="am-amount">{{ (totalDiscount = discount.prepaid + discount.postpaid) > (totalPrice = prepaidServiceAmount + postpaidServiceAmount + prepaidExtrasAmount + postpaidExtrasAmount) ? useFormattedPrice(totalPrice) : useFormattedPrice(totalDiscount) }}</span>
        </div>
      </Transition>

      <div
        class="am-fs__payments-app-info-total"
        :class="{'am-single-row': !settings.payments.coupons || discount.prepaid === 0}"
      >
        <span>{{amLabels.total_amount_colon}}</span>
        <span class="am-amount">
          {{
            useFormattedPrice(
              (prepaidServiceAmount + prepaidExtrasAmount + postpaidServiceAmount + postpaidExtrasAmount - discount.prepaid - discount.postpaid) < 0 ?
                0 : (prepaidServiceAmount + prepaidExtrasAmount + postpaidServiceAmount + postpaidExtrasAmount - discount.prepaid - discount.postpaid)
            )
          }}
        </span>
      </div>

      <div v-if="hasDeposit && paymentGateway !== 'onSite'">
        <div class="am-fs__payments-app-info-total">
          <span>{{ amLabels.paying_now }}:</span>
          <span class="am-amount">{{ useFormattedPrice((paymentDeposit ? (prepaidServiceAmount + prepaidExtrasAmount + postpaidServiceAmount + postpaidExtrasAmount - discount.prepaid - discount.postpaid) : depositAmount)) }}</span>
        </div>

        <div class="am-fs__payments-app-info-total">
          <span>{{ amLabels.paying_later }}:</span>
          <span class="am-amount">{{ useFormattedPrice(paymentDeposit ? 0 : (prepaidServiceAmount + prepaidExtrasAmount + postpaidServiceAmount + postpaidExtrasAmount - discount.prepaid - discount.postpaid - depositAmount)) }}</span>
        </div>
      </div>
      <div v-else-if="isRecurring && paymentGateway !== 'onSite'">
        <div class="am-fs__payments-app-info-total">
          <span>{{ amLabels.paying_now }}:</span>
          <span class="am-amount">{{ useFormattedPrice(prepaidServiceAmount + prepaidExtrasAmount - discount.prepaid) }}</span>
        </div>

        <div class="am-fs__payments-app-info-total">
          <span>{{ amLabels.paying_later }}:</span>
          <span class="am-amount">{{ useFormattedPrice(postpaidServiceAmount + postpaidExtrasAmount - discount.postpaid) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Coupon from '../../../Parts/Payment/Coupon.vue'
import AmCollapse from '../../../../_components/collapse/AmCollapse'
import AmCollapseItem from '../../../../_components/collapse/AmCollapseItem'
import { inject, provide, reactive, ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useFormattedPrice } from '../../../../../assets/js/common/formatting.js'
import {
  useAppointmentsAmount,
  useAppointmentExtrasAmount,
  useAppointmentExtraAmount,
  useDiscountAmount,
  useAppointmentDepositAmount,
  useAppointmentsPayments,
  useAppointmentsLabels,
  useExtrasLabels,
  useServicePrices
} from '../../../../../assets/js/common/appointments.js'
import { useCartItem } from "../../../../../assets/js/public/cart";
import { useColorTransparency } from '../../../../../assets/js/common/colorManipulation.js'

const store = useStore()

const amLabels = inject('amLabels')

// * Root Settings
const settings = inject('settings')

let appointments = reactive({
  prepaid: [],
  postpaid: [],
})

let prepaidServiceAmount = ref(0)

let prepaidExtrasAmount = ref(0)

let prepaidLabels = ref([])

let prepaidExtrasLabels = ref([])

let servicePrices = ref([])

let extras = store.getters['booking/getSelectedExtras']

let persons = store.getters['booking/getBookingPersons']

let postpaidServiceAmount = ref(0)

let postpaidExtrasAmount = ref(0)

let postpaidLabels = ref([])

let postpaidExtrasLabels = ref([])

let isRecurring = ref(false)

let paymentDeposit = computed(() => store.getters['booking/getPaymentDeposit'])
let hasDeposit = inject('hasDeposit')
let depositAmount = computed(() => useAppointmentDepositAmount(
    store,
    store.getters['entities/getService'](
      store.getters['booking/getServiceId']
    ),
    prepaidServiceAmount.value + prepaidExtrasAmount.value
  )
)
let paymentGateway = computed(() => store.getters['booking/getPaymentGateway'])

let bookingsCount = ref(0)

provide('bookingsCount', bookingsCount)

let discount = computed(() => {
  let discount = {
    prepaid: 0,
    postpaid: 0,
  }

  let coupon = store.getters['booking/getCoupon']

  if (coupon) {
    let couponLimit = coupon.limit

    if (couponLimit) {
      discount.prepaid = useDiscountAmount(store, coupon, appointments.prepaid.slice(0, couponLimit))

      couponLimit = couponLimit > appointments.prepaid.length ? couponLimit - appointments.prepaid.length : 0

      discount.postpaid = useDiscountAmount(store, coupon, appointments.postpaid.slice(0, couponLimit))
    }
  }

  return discount
})

provide('discount', discount)

let service = reactive(store.getters['entities/getService'](
    store.getters['booking/getServiceId']
))

const emits = defineEmits(['setOnSitePayment'])

function couponApplied () {
  let appointments = useAppointmentsPayments(
    store,
    service.id,
    useCartItem(store).services[service.id].list
  )

  emits(
    'setOnSitePayment',
      useAppointmentsAmount(store, service, appointments.prepaid) - discount.value.prepaid <= 0
  )
}

onMounted(() => {
  appointments = useAppointmentsPayments(
    store,
    service.id,
    useCartItem(store).services[service.id].list
  )

  servicePrices.value = useServicePrices(store, service.id, appointments.prepaid.concat(appointments.postpaid))

  prepaidServiceAmount.value = useAppointmentsAmount(store, service, appointments.prepaid)

  postpaidServiceAmount.value = useAppointmentsAmount(store, service, appointments.postpaid)


  prepaidExtrasAmount.value = useAppointmentExtrasAmount(store, service, appointments.prepaid)

  postpaidExtrasAmount.value = useAppointmentExtrasAmount(store, service, appointments.postpaid)


  prepaidLabels.value = useAppointmentsLabels(store, service.id, appointments.prepaid)

  postpaidLabels.value = useAppointmentsLabels(store, service.id, appointments.postpaid)


  prepaidExtrasLabels.value = useExtrasLabels(store, service, appointments.prepaid)

  postpaidExtrasLabels.value = useExtrasLabels(store, service, appointments.postpaid)


  isRecurring.value = appointments.prepaid.length > 1 || appointments.postpaid.length > 0

  bookingsCount.value = appointments.prepaid.length + appointments.postpaid.length
})

// * Collapse visualisation
let recurringCollapseState = ref(true)
let extrasCollapseState = ref(true)

function onCollapseClose (el) {
  el.style.opacity = 0
  setTimeout(() => {
    el.style.opacity = 1
    el.style.height = 'var(--am-h-services-sub)'
  }, 200)
}

function onCollapseOpen (el) {
  el.style.opacity = 0
  el.style.setProperty('--am-h-services-sub', `${el.offsetHeight}px`)
  setTimeout(() => {
    el.style.height = '0px'
  }, 100)
}

// * Colors
let amColors = inject('amColors')
let cssVars = computed(() => {
  return {
    '--am-c-pay-text': amColors.value.colorMainText,
    '--am-c-pay-text-op70': useColorTransparency(amColors.value.colorMainText, 0.7),
    '--am-c-pay-text-op60': useColorTransparency(amColors.value.colorMainText, 0.6),
    '--am-c-pay-text-op30': useColorTransparency(amColors.value.colorMainText, 0.3),
    '--am-c-pay-success': amColors.value.colorSuccess,
    '--am-c-pay-primary': amColors.value.colorPrimary,
  }
})
</script>


<script>
export default {
  name: 'AppointmentInfo'
}
</script>

<style lang="scss">
.amelia-v2-booking {
  #amelia-container {
    .am-fs__payments {
      &-app-info {
        margin: 0;

        &-subtotal {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed var(--am-c-pay-text-op30);
          padding: 0 0 16px;
          margin: 16px 0 0;

          span {
            font-size: 14px;
            font-weight: 500;
            line-height: 1.42857;
            color: var(--am-c-pay-text);
          }
        }

        &-discount {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.3846;
          color: var(--am-c-pay-text);
          padding: 16px 0 0;

          &-green {
            color: var(--am-c-pay-success);
          }
        }

        &-total {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.33333;
          color: var(--am-c-pay-text);
          padding: 8px 0 0;

          &.am-single-row {
            padding-top: 16px;
          }

          & > span:nth-child(2) {
            color: var(--am-c-pay-primary);
          }
        }
      }

      &-service {
        border: 1px solid var(--am-c-pay-text-op30);
        border-radius: 8px;
        padding: 12px;
        box-sizing: border-box;
      }

      &-services {
        .am-collapse-item__heading {
          flex-wrap: wrap;
          width: 100%;
          padding: 12px;
          transition-delay: .5s;

          &-side {
            transition-delay: 0s;
          }

          .am-collapse-item__trigger {
            padding: 0
          }
        }
        .am-collapse-item__content {
          & > * {
            padding: 12px;
          }
        }

        &-info {
          span {
            font-size: 12px;
            line-height: 1.33333;
            font-weight: 500;
            color: var(--am-c-pay-text-op60);
          }
        }

        &-sub {
          width: 100%;
          display: flex;
          justify-content: space-between;
          transition: all ease-in-out .3s;

          p {
            font-size: 13px;
            font-weight: 500;
            line-height: 1.384615;
            color: var(--am-c-pay-text);
            margin: 0;
            padding: 0;
          }
        }

        &-open {
          width: 100%;

          &-total {
            border-top: 1px dashed var(--am-c-pay-text-op30);
            padding: 12px 0 0;
            margin: 12px 0 4px;

            & > span {
              color: var(--am-c-pay-text-op70)
            }

            &:last-child {
              font-weight: 500;
            }
          }

          &-text {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            line-height: 1.384615;
            color: var(--am-c-pay-text);
          }
        }

      }

      .am-amount {
        white-space: nowrap;
      }

      .am-fade-enter-active,
      .am-fade-leave-active {
        transition: opacity 0.5s ease;
      }

      .am-fade-enter-from,
      .am-fade-leave-to {
        opacity: 0;
      }
    }
  }
}
</style>
