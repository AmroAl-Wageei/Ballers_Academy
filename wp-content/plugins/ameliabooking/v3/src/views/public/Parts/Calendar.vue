<template>
  <div v-if="!calendarSlotsLoading" class="am-fs-dt__calendar">
    <AmAdvancedSlotCalendar
      :id="props.id"
      :slots="calendarEvents"
      :calendar-minimum-date="calendarMinimumDate"
      :calendar-maximum-date="calendarMaximumDate"
      :not-multiple="props.notMultiple"
      :end-time="props.endTime"
      :time-zone="props.timeZone"
      :nested-item="nested"
      @selected-date="setSelectedDate"
      @selected-time="setSelectedTime"
      @changed-month="changeMonth"
      @rendered-month="renderedMonth"
      @unselect-date="unselectDate"
      @selected-duration="setSelectedDuration"
    ></AmAdvancedSlotCalendar>
  </div>

  <!-- Skeleton -->
  <el-skeleton v-else animated class="am-skeleton-slots" :class="checkScreen ? 'am-skeleton-slots-mobile':''">
    <template #template>
      <div class="am-skeleton-slots-filters">
        <el-skeleton-item v-for="item in new Array(4)" :key="item" variant="text" />
      </div>
      <div class="am-skeleton-slots-weekdays">
        <el-skeleton-item v-for="item in new Array(7)" :key="item" variant="text" />
      </div>
      <div class="am-skeleton-slots-days">
        <el-skeleton-item v-for="item in new Array(42)" :key="item" variant="text" />
      </div>
    </template>
  </el-skeleton>
  <!-- /Skeleton -->
</template>

<script setup>
import { ref, provide, inject, computed, watch, nextTick } from "vue";
import { useStore } from "vuex";
import moment from "moment";
import AmAdvancedSlotCalendar from "../../_components/advanced-slot-calendar/AmAdvancedSlotCalendar";
import { useAvailableSlots, useCalendarEvents, useDuration } from "../../../assets/js/common/appointments.js";
import { useCartItem } from "../../../assets/js/public/cart";
import { useSortedDateStrings } from "../../../assets/js/common/helper";
import { useAppointmentSlots } from "../../../assets/js/public/slots";

const props = defineProps({
  id: {
    type: Number,
    default: 0
  },
  loadCounter: {
    type: Number,
    default: 0
  },
  preselectSlot: {
    type: Boolean,
    default: false
  },
  notMultiple: {
    type: Boolean,
    default: true
  },
  endTime: {
    type: Boolean,
    default: true
  },
  timeZone: {
    type: Boolean,
    default: true
  },
  labelSlotsSelected: {
    type: String,
    default: ''
  },
  rememberSlots: {
    type: Boolean,
    default: false
  },
  inCollapse: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits([
  'loadingSlots'
])

let nested = computed(() => {
  return {
    inCollapse: props.inCollapse
  }
})

const store = useStore()

let cartItem = computed(() => useCartItem(store))

let searchStart = ref(null)

let searchEnd = ref(null)

let selectedYearMonth = ref('')

let slotsParams = inject('slotsParams')

function loadSlots (customCallback) {
  let range = store.getters['booking/getMultipleAppointmentsRange']

  if (range) {
    searchStart.value = range.start

    searchEnd.value = range.end
  }

  getSlots(customCallback)
}

watch(() => props.loadCounter, () => {
  loadSlots(() => {})
})

let cWidth = inject('containerWidth', 0)

let checkScreen = computed(() => cWidth.value < 560 || (cWidth.value - 240 < 520))

/*****************
 * Calendar Data *
 ****************/

let calendarMinimumDate = ref(null)

let calendarMaximumDate = ref(null)

let calendarSlotsLoading = ref(true)

let calendarEvents = ref([])

let calendarEventSlots = ref([])

let calendarEventSlot = ref('')

let calendarStartDate = ref(null)

let calendarChangeSideBar = inject('calendarChangeSideBar')

let calendarSlotDuration = inject('calendarSlotDuration')

let calendarServiceDuration = inject('calendarServiceDuration')

provide('calendarEvents', calendarEvents)

provide('calendarEventSlots', calendarEventSlots)

provide('calendarEventSlot', calendarEventSlot)

provide('calendarStartDate', calendarStartDate)

provide('calendarChangeSideBar', calendarChangeSideBar)

provide('cartItem', cartItem)


/*********
 * Other *
 ********/

function setSelectedDuration (value) {
  store.commit('booking/setDuration', value)

  let service = store.getters['entities/getService'](cartItem.value.serviceId)

  let extrasIds = store.getters['booking/getSelectedExtras'].map(i => i.extraId)

  calendarSlotDuration.value = useDuration(value, service.extras.filter(i => extrasIds.includes(i.id)))

  calendarServiceDuration.value = value

  getSlots(() => {})
}

function setSelectedDate (value) {
  store.commit('booking/setMultipleAppointmentsDate', value)

  store.commit('booking/setMultipleAppointmentsRange', {
    start: searchStart.value,
    end: searchEnd.value,
  })

  calendarEventSlots.value = useAvailableSlots(store)

  if (props.preselectSlot && calendarEventSlots.value.length) {
    setSelectedTime(calendarEventSlots.value[0])
  }
}

function setSelectedTime (value) {
  store.commit('booking/setMultipleAppointmentsTime', value)

  calendarEventSlot.value = value
}

function unselectDate () {
  store.commit('booking/unsetMultipleAppointmentsData', cartItem.value.index)

  calendarEventSlots.value = []

  calendarEventSlot.value = ''
}

function changeMonth (yearMonth) {
  selectedYearMonth.value = yearMonth

  getSlots(() => {})
}

function renderedMonth (data) {
  searchStart.value = data.start

  searchEnd.value = data.end
}

function getSlotsCallback (slots, minimumDateTime, maximumDateTime, customCallback) {
  calendarMinimumDate.value = minimumDateTime
  calendarMaximumDate.value = maximumDateTime

  let dates = useSortedDateStrings(Object.keys(slots))

  let activeService = cartItem.value.services[cartItem.value.serviceId]

  calendarEvents.value = useCalendarEvents(slots)

  if (cartItem.value.index !== '' && activeService.list.length) {
    calendarStartDate.value = (selectedYearMonth.value ? selectedYearMonth.value + '-01' : (activeService.list[cartItem.value.index].date ? activeService.list[cartItem.value.index].date : (dates.length ? dates[0] : null)))
    if (!(activeService.list[cartItem.value.index].date in slots)) {
      store.commit('booking/setMultipleAppointmentsDate', null)
      store.commit('booking/setMultipleAppointmentsTime', null)

      calendarEventSlot.value = ''

      calendarEventSlots.value = []

    } else if (activeService.list.length && !(activeService.list[cartItem.value.index].time in slots[activeService.list[cartItem.value.index].date])) {
      store.commit('booking/setMultipleAppointmentsTime', null)

      calendarEventSlot.value = ''
    }

    if (activeService.list.length &&
      activeService.list[cartItem.value.index].date &&
      (searchStart.value ? moment(activeService.list[cartItem.value.index].date).isSameOrAfter(searchStart.value) : true) &&
      (searchEnd.value ? moment(activeService.list[cartItem.value.index].date).isSameOrBefore(searchEnd.value) : true)
    ) {
      if (activeService.list[cartItem.value.index].date in activeService.slots) {
        calendarEventSlots.value = Object.keys(activeService.slots[activeService.list[cartItem.value.index].date])

        if (activeService.list[cartItem.value.index].time) {
          calendarEventSlot.value = activeService.list[cartItem.value.index].time
        }
      }
    }
  }

  nextTick(() => {
    customCallback()

    calendarSlotsLoading.value = false

    emits('loadingSlots', false)
  })
}

function getSlots (customCallback) {
  calendarSlotsLoading.value = true

  emits('loadingSlots', true)

  useAppointmentSlots(
    store,
    Object.assign(
      {
        startDateTime: searchStart.value,
        endDateTime: searchEnd.value,
      },
      slotsParams.value
    ),
    props.rememberSlots,
    getSlotsCallback,
    customCallback
  )
}

function unsetData () {
  calendarEventSlots.value = []

  calendarEventSlot.value = ''
}

defineExpose({
  loadSlots,
  unsetData
})
</script>

<script>
export default {
  name: 'CalendarBlock',
}
</script>

<style lang="scss">
// am -- amelia
// fs -- form steps

.amelia-v2-booking #amelia-container {
  // Amelia Form Steps
  .am-fs {
    // Container Wrapper
    &__main {
      &-heading {
        &-inner {
          display: flex;
          align-items: center;

          .am-heading-prev {
            margin-right: 12px;
          }
        }
      }
      &-inner {
        &#{&}-dt {
          padding: 0 20px;
        }
      }
    }
  }

  // Skeleton
  .am-skeleton-slots {

    &-mobile {
      padding: 0px;

      .am-skeleton-slots-days {
        gap: 6px;

        .el-skeleton__item {
          height: 28px;
          max-width: 56px;
        }
      }

    }

    &-filters {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 0 0 24px;

      .el-skeleton__item {
        height: 36px;
        width: 20%;
      }

      :first-child {
        width: 26%;
        margin-right: 16px;
      }

      :last-child {
        width: 16%;
        margin-left: 16px;
      }
    }

    &-weekdays {
      padding-bottom: 12px;
      display: flex;
      flex-direction: row;
      justify-content: space-around;

      .el-skeleton__item {
        max-width: 30px;
        height: 24px;
      }
    }

    &-days {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
      gap: 8px;

      .el-skeleton__item {
        margin: 0 1.5px;
        height: 40px;
        max-width: 56px;
      }
    }
  }
}
</style>
