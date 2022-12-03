<template>
  <div class="am-advsc__wrapper" :style="cssVars">
    <div
      v-show="headerMonthOptions.length"
      class="am-advsc__header"
      :class="[
        {'am-advsc__header-mobile': checkScreen},
        {'am-advsc__header-mobile-s': mobileS}
      ]"
    >
      <AmSelect v-model="calMonth" size="medium" @change="changeMonth(calYear + '-' + calMonth)">
        <AmOption
          v-for="month in headerMonthOptions"
          v-show="month.available"
          :key="month.value"
          :value="month.value"
          :label="month.label"
        >
        </AmOption>
      </AmSelect>
      <AmSelect v-model="calYear" size="medium" @change="changeYear()">
        <AmOption
          v-for="year in headerYearOption"
          :key="year"
          :value="year"
          :label="year"
        >
        </AmOption>
      </AmSelect>

      <AmButtonGroup>
        <AmButton category="secondary" type="plain" size="medium" icon-only :icon="AmIconArrowLeft" @click="prevMonth"></AmButton>
        <AmButton category="secondary" type="plain" size="medium" icon-only :icon="AmIconArrowRight" @click="nextMonth"></AmButton>
      </AmButtonGroup>
    </div>

    <div class="am-advsc__duration">
      <AmSelect
        v-if="calendarServiceDurations.length > 1"
        v-model="calendarServiceDuration"
        @change="selectDuration"
      >
        <AmOption
          v-for="item in calendarServiceDurations"
          :key="item.duration"
          :label="useSecondsToDuration(item.duration, amLabels.h, amLabels.min) + '(' + item.priceLabel + ')'"
          :value="item.duration"
        >
          <AmOptionTemplate1
            :identifier="item.duration"
            :label="useSecondsToDuration(item.duration, amLabels.h, amLabels.min)"
            :price-string="item.priceLabel"
            icon-string="clock"
          ></AmOptionTemplate1>
        </AmOption>
      </AmSelect>
    </div>

    <div v-if="props.timeZone" class="am-advsc__time-zone">
      <span>{{ timeZoneString }}</span>
    </div>

    <FullCalendar
      ref="advCalendarRef"
      class="am-advsc"
      :am-mobile="checkScreen"
      :am-mobile-s="mobileS"
      :options="options"
    ></FullCalendar>

    <div
      v-if="calendarEventSlots.length"
      ref="slotsWrapper"
      class="am-advsc__slots-wrapper"
    >
      <div class="am-advsc__slots-heading">
        {{ slotsHeading }}
      </div>
      <div class="am-advsc__slots">
        <div
          v-for="slot in calendarEventSlots"
          :key="slot"
          class="am-advsc__slots-item"
          :class="[
            {'am-advsc__slots-item__selected': calendarEventSlot === slot},
            {'am-advsc__slots-item-mobile': checkScreen}
          ]"
          @click="slotSelected(slot)">
          <div class="am-advsc__slots-item__inner">
            {{ `${getFrontedFormattedTime(slot)} ${ props.endTime ? ' - ' + getFrontedFormattedTime(addSeconds(slot, calendarSlotDuration)) : '' }` }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="isDateSelected && !calendarEventSlots.length">
      {{ props.labelSlotsSelected }}
    </div>
  </div>
</template>

<script setup>
import moment from 'moment'
import '@fullcalendar/core/vdom'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import allLocales from "@fullcalendar/core/locales-all";
import AmSelect from '../select/AmSelect.vue';
import AmOption from '../select/AmOption.vue';
import AmButtonGroup from '../button/AmButtonGroup';
import AmButton from '../button/AmButton.vue';
import AmIconArrowRight from '../icons/IconArrowRight.vue';
import AmIconArrowLeft from '../icons/IconArrowLeft.vue';
import AmOptionTemplate1 from '../../_components/select/parts/AmOptionTemplate1.vue';
import { ref, reactive, onBeforeMount, inject, computed, watch, onMounted } from "vue";
import { useColorTransparency } from "../../../assets/js/common/colorManipulation";
import { months, getFrontedFormattedTime, getFrontedFormattedDate, addSeconds, getFirstDayOfWeek, useSecondsToDuration } from "../../../assets/js/common/date";
import { shortLocale } from "../../../plugins/settings.js";
import { useScrollTo } from "../../../assets/js/common/scrollElements.js";

/**
 * Component Props
 * @type {Readonly<ExtractPropTypes<{}>>}
 */
const props = defineProps({
  initialView: {
    type: String,
    default: 'dayGridMonth'
  },
  weekDaysVisibility: {
    type: Boolean,
    default: true
  },
  weekDaysEnabled: {
    type: Boolean,
    default: true
  },
  notMultiple: {
    type: Boolean,
    default: true
  },
  calendarMinimumDate: {
    type: String,
    default: ''
  },
  calendarMaximumDate: {
    type: String,
    default: ''
  },
  id: {
    type: Number,
    default: 0
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
  nestedItem: {
    type: Object,
    default: () => {
      return {
        inCollapse: false
      }
    }
  }
})

let slotsWrapper = ref(null)
let containerWrapper = inject('formWrapper', ref(null))

// timeZoneString: this.$root.settings.general.showClientTimeZone ? Intl.DateTimeFormat().resolvedOptions().timeZone : this.$root.settings.wordpress.timezone
const amSettings = inject('settings')
let timeZoneString = ref(amSettings.general.showClientTimeZone ? Intl.DateTimeFormat().resolvedOptions().timeZone : amSettings.wordpress.timezone)

// * Calendar Reference
const advCalendarRef = ref(null);

let isDateSelected = ref(false)

const baseUrls = inject('baseUrls')

// * Duration
let calendarServiceDurations = inject('calendarServiceDurations', [])

// * Labels
let amLabels = inject('labels')

// * Calendar Header
// Month
let calMonth = ref('')

let headerMonthOptions = ref([])

// Year
let calYear = ref(1)
let headerYearOption = reactive([])

function selectDuration (duration) {
  emits('selectedDuration', duration)
}

function getYearMonthString () {
  return moment(advCalendarRef.value.getApi().getDate()).format('YYYY-MM')
}

function getHeaderMonths (year) {
  let minimumDate = moment(props.calendarMinimumDate, 'YYYY-MM-DD HH:mm')

  let maximumDate = moment(props.calendarMaximumDate, 'YYYY-MM-DD HH:mm')

  let availableMonths = []

  for (let i = 1; i <= 12; i++) {
    let monthString = i < 10 ? '0'.concat(i.toString()) : i.toString()

    let monthStartDate = moment(year + '-' + monthString + '-01', 'YYYY-MM-DD')
    let monthEndDate = moment(year + '-' + monthString + '-01', 'YYYY-MM-DD').endOf('month')

    availableMonths.push({
      value: monthString,
      label: months[i - 1],
      available: minimumDate.isSameOrBefore(monthEndDate) && maximumDate.isSameOrAfter(monthStartDate)
    })
  }

  return availableMonths
}

function changeYear () {
  let availableMonths = getHeaderMonths(calYear.value)

  advCalendarRef.value.getApi().gotoDate(
    calYear.value + '-' + availableMonths.filter(i => i.available)[0].value + '-01'
  )

  emits('changedMonth', getYearMonthString())
}

function changeMonth () {
  advCalendarRef.value.getApi().gotoDate(calYear.value + '-' + calMonth.value + '-01')

  emits('changedMonth', getYearMonthString())
}

function prevMonth() {
  advCalendarRef.value.getApi().prev()

  emits('changedMonth', getYearMonthString())
}

function nextMonth() {
  advCalendarRef.value.getApi().next()

  emits('changedMonth', getYearMonthString())
}

function renderedMonth (data) {
  emits(
    'renderedMonth',
    {
      start: moment(data.start).format('YYYY-MM-DD'),
      end: moment(data.end).format('YYYY-MM-DD'),
      yearMonth: getYearMonthString()
    }
  )
}

let calendarStartDate = inject('calendarStartDate')

// * Amelia Calendar Options
const options = ref({
  initialDate: calendarStartDate.value,
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: props.initialView,
  headerToolbar: false,
  views: {
    dayGridMonth: {

    },
    dayGridWeek: {

    }
  },
  slotLabelFormat: {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  },
  eventTimeFormat: {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  },
  aspectRatio: 1.45,
  firstDay: getFirstDayOfWeek(),
  dayMaxEvents: true,
  selectLongPressDelay: 0,
  dayHeaderClassNames: calendarDayHeaderClassBuilder,
  dayCellClassNames: calendarDayClassBuilder,
  // dayCellContent: calendarDayCellContent,
  dateClick: calendarDateClick,
  // eventClassNames: 'am-advsc__occupancy',
  eventContent: calendarEventContent,
  eventClick: calendarEventClick,
  // weekends: true,
  // hiddenDays: [0, 6],
  weekends: props.weekDaysVisibility,
  events: inject('calendarEvents'),
  datesSet: renderedMonth,
  locales: allLocales,
  locale: shortLocale
})

let cWidth = inject('containerWidth', 0)
let checkScreen = computed(() => cWidth.value < 560 || (cWidth.value > 560 && cWidth.value < 640))
let mobileS = computed(() => cWidth.value < 340)

const emits = defineEmits([
  'selectedDate',
  'selectedTime',
  'renderedMonth',
  'changedMonth',
  'selectedDuration',
  'unselectDate',
])

let calendarEventSlots = inject('calendarEventSlots')

let calendarEventSlot = inject('calendarEventSlot')

let calendarChangeSideBar = inject('calendarChangeSideBar')

let calendarSlotDuration = inject('calendarSlotDuration')

let calendarServiceDuration = inject('calendarServiceDuration')

let cartItem = inject('cartItem', ref({
  index: ''
}))

// * Slots heading
let slotsHeading = ref(
  cartItem.value &&
  cartItem.value.index !== '' &&
  cartItem.value.services[cartItem.value.serviceId].list[parseInt(cartItem.value.index)].date
    ? getFrontedFormattedDate(cartItem.value.services[cartItem.value.serviceId].list[parseInt(cartItem.value.index)].date) : ''
)

/**
 * Html class builder for calendar header day cell
 * @param data
 * @returns {string[]}
 */
function calendarDayHeaderClassBuilder (data) {
  let classCollector = [`am-advsc__${data.view.type}-header-cell`];

  // * Week days class
  if (data.date.getDay() === 0 || data.date.getDay() === 6) {
    classCollector.push(`am-advsc__${data.view.type}-header-weekend`);
  }

  return classCollector;
}

watch(calendarStartDate, () => {
  const advCalendar = advCalendarRef.value.getApi()

  advCalendar.gotoDate(calendarStartDate.value)
})

/**
 * Html class builder for calendar day cell
 * @param data
 * @returns {*[]}
 */
function calendarDayClassBuilder (data) {
  let classCollector = [`am-advsc__${data.view.type}-cell`];

  // * Week days class
  if (!props.weekDaysEnabled && (data.date.getDay() === 0 || data.date.getDay() === 6)) {
    classCollector.push(`am-advsc__${data.view.type}-weekend`);
  }

  // * Determine which day has slots => [] - no slots || [...] has slots
  let eventIdentifier = options.value.events.filter((item) => moment(item.start).format('YYYY-MM-DD') === moment(data.date).format('YYYY-MM-DD'));

  // TODO - this condition should be refactorized after implementation in the system
  // * Disabled class
  if ((eventIdentifier.length && 'slotsAvailable' in eventIdentifier[0].extendedProps && !eventIdentifier[0].extendedProps.slotsAvailable) ||
      !eventIdentifier.length
  ) {
    classCollector.push(`am-advsc__${data.view.type}-disabled`);
  }

  if (cartItem.value.index !== '' &&
      cartItem.value.services[cartItem.value.serviceId].list[props.id].date === moment(data.date).format('YYYY-MM-DD')
  ) {
    classCollector.push(`am-advsc__${data.view.type}-selected`)
  }

  return classCollector;
}

/**
 * Click on Day Cell handler
 * @param data
 */
function calendarDateClick (data) {
  const advCalendar = advCalendarRef.value.getApi()

  const advCalendarType = advCalendar.currentData.currentViewType

  // * Adding or Removing html class that determines selection state
  let selectedDayClass = `am-advsc__${advCalendarType}-selected`
  let disabledDayClass = `am-advsc__${advCalendarType}-disabled`

  if (data.dayEl.classList.contains(disabledDayClass)) {
    return
  }

  if (data.dayEl.classList.contains(selectedDayClass)) {
    isDateSelected.value = false

    data.dayEl.classList.remove(selectedDayClass)

    slotsHeading.value = ''

    emits('unselectDate')
  } else {
    isDateSelected.value = true

    if (calendarEventSlot.value && !calendarEventSlots.value.includes(calendarEventSlot.value)) {
      calendarEventSlot.value = calendarEventSlots.value[0]
      emits('selectedTime', calendarEventSlot.value)
    } else if (calendarEventSlot.value && calendarEventSlots.value.includes(calendarEventSlot.value)) {
    } else if (calendarEventSlots.value.length) {
      calendarEventSlot.value = calendarEventSlots.value[0]
      emits('selectedTime', calendarEventSlot.value)
    }

    slotsHeading.value = (data.dateStr ? getFrontedFormattedDate(data.dateStr) : data.dateStr) + (calendarEventSlots.value.includes(calendarEventSlot.value)  ? ' - ' + getFrontedFormattedTime(calendarEventSlot.value) : '')

    if (advCalendar.el.querySelectorAll(`.${selectedDayClass}`).length) {
      for (let i = 0; i < advCalendar.el.querySelectorAll(`.${selectedDayClass}`).length; i++) {
        advCalendar.el.querySelectorAll(`.${selectedDayClass}`)[i].classList.remove(selectedDayClass)
      }
    }

    if (!data.dayEl.classList.contains(disabledDayClass)) {
      data.dayEl.classList.add(selectedDayClass)
    }

    if (containerWrapper.value && calendarEventSlots.value.length && slotsWrapper.value) {
      useScrollTo(containerWrapper.value, slotsWrapper.value, 20, 300, props.nestedItem)
    }
  }


  let selectedSlot = {
    reference: 'slot',
    position: 1,
    value: ''
  }
  selectedSlot.value = slotsHeading.value ? `${slotsHeading.value}` : ''
  if (!props.notMultiple && cartItem.value) {
    selectedSlot.reference = 'package-slot ' + cartItem.value.index + ' ' + cartItem.value.serviceId
  }

  sidebarDataCollector(selectedSlot)

}

/**
 * Click on Event handler
 * @param eventData
 */
function calendarEventClick (eventData) {
  emits('selectedDate', moment(eventData.event.start).format('YYYY-MM-DD'))
}

/**
 * Calendar Event Content Block render function
 * @param eventCalendarData
 * @returns {{html: string}}
 */
function calendarEventContent (eventCalendarData) {
  let eventContent;

  if ('slotsAvailable' in eventCalendarData.event.extendedProps) {
    // * Month view
    // if (eventCalendarData.view.type === 'dayGridMonth') {
    // const slotsAvailablePercentage = 100 - (100 * eventCalendarData.event.extendedProps.slotsAvailable / eventCalendarData.event.extendedProps.slotsTotal);
    // if (eventCalendarData.event.extendedProps.slotsAvailable) {
    //   eventContent = `<div class="am-advsc__slot-wrapper" style="height: ${slotsAvailablePercentage}%"></div>`
    // }
    // }
  }

  // if (eventCalendarData.view.type === 'dayGridWeek') {
  //   eventContent = `<div class="am-advsc__slot">${eventCalendarData.event.title}</div>`
  // }

  return {html: eventContent}
}

const { sidebarDataCollector } = inject('sidebarStepsFunctions', {
  sidebarDataCollector: () => {}
})

// * Click on slot
function slotSelected (slot) {
    if (calendarChangeSideBar.value) {
      let selectedSlot = {
        reference: 'slot',
        // position will depends on fields order
        position: 1,
        value: ''
      }

      selectedSlot.value = !slotsHeading.value.includes(' - ') ?
        slotsHeading.value + ' - ' + getFrontedFormattedTime(slot) :
        slotsHeading.value.split(' - ')[0] + ' - ' + getFrontedFormattedTime(slot)

      if (!props.notMultiple && cartItem.value) {
        selectedSlot.reference = 'package-slot ' + cartItem.value.index + ' ' + cartItem.value.serviceId
      }

      sidebarDataCollector(selectedSlot)

    }

    calendarEventSlot.value = slot

    emits('selectedTime', slot)

}

window.addEventListener('resize', resize);
// * resize function
function resize() {
  if (advCalendarRef.value) {
    advCalendarRef.value.options.aspectRatio = mobileS.value ? 1 : checkScreen.value ? 1.2 : 1.45
    advCalendarRef.value.getApi().render()
  }
}

// * Color Vars
let amColors = inject('amColors',  {
  amColors: {
    value: {
      colorPrimary: '#1246D6',
      colorSuccess: '#019719',
      colorError: '#B4190F',
      colorWarning: '#CCA20C',
      colorMainBgr: '#FFFFFF',
      colorMainHeadingText: '#33434C',
      colorMainText: '#1A2C37',
      colorSbBgr: '#17295A',
      colorSbText: '#FFFFFF',
      colorInpBgr: '#FFFFFF',
      colorInpBorder: '#D1D5D7',
      colorInpText: '#1A2C37',
      colorInpPlaceHolder: '#1A2C37',
      colorDropBgr: '#FFFFFF',
      colorDropBorder: '#D1D5D7',
      colorDropText: '#0E1920',
      colorCalCell: '#1246D6',
      colorCalCellText: '#1246D6',
      colorCalCellSelected: '#1246D6',
      colorCalCellSelectedText: '#FFFFFF',
      colorCalCellDisabled: '#B4190F',
      colorCalCellDisabledText: '#1A2C37',
      colorBtnPrim: '#265CF2',
      colorBtnPrimText: '#FFFFFF',
      colorBtnSec: '#1A2C37',
      colorBtnSecText: '#FFFFFF',
    }
  }
})

const cssVars = computed(() => {
  return {
    '--am-c-advsc-bgr-op10': useColorTransparency(amColors.value.colorMainText, 0.1),
    '--am-c-cal-init': amColors.value.colorCalCell,
    '--am-c-cal-init-text': amColors.value.colorCalCellText,
    '--am-c-cal-init-op10': useColorTransparency(amColors.value.colorCalCell, 0.1),
    '--am-c-cal-init-op20': useColorTransparency(amColors.value.colorCalCell, 0.2),
    '--am-c-cal-init-op60': useColorTransparency(amColors.value.colorCalCell, 0.6),

    '--am-c-cal-selected': amColors.value.colorCalCellSelected,
    '--am-c-cal-selected-text': amColors.value.colorCalCellSelectedText,
    '--am-c-cal-selected-op80': useColorTransparency(amColors.value.colorCalCellSelected, 0.8),

    '--am-c-cal-disabled': amColors.value.colorCalCellDisabled,
    '--am-c-cal-disabled-text': amColors.value.colorCalCellDisabledText,
    '--am-c-cal-disabled-op10': useColorTransparency(amColors.value.colorCalCellDisabled, 0.1),
    '--am-c-cal-disabled-op60': useColorTransparency(amColors.value.colorCalCellDisabled, 0.4),
  }
})

/**
 * Lifecycle Hooks
 */
onBeforeMount(() => {
  let minimumDate = moment(props.calendarMinimumDate, 'YYYY-MM-DD HH:mm')
  let maximumDate = moment(props.calendarMaximumDate, 'YYYY-MM-DD HH:mm')

  let pastYears = parseInt(minimumDate.format('YYYY'))
  let futureYears = parseInt(maximumDate.format('YYYY'))

  for (pastYears; pastYears <= futureYears; pastYears++) {
    headerYearOption.push(pastYears)
  }

  let date = moment(calendarStartDate.value, 'YYYY-MM-DD')

  calMonth.value = date.format('MM')

  let year = parseInt(date.format('YYYY'))

  headerMonthOptions.value = getHeaderMonths(year)

  calYear.value = year
})

onMounted( () => {
  if (advCalendarRef.value) {
    advCalendarRef.value.options.aspectRatio = mobileS.value ? 1 : checkScreen.value ? 1.2 : 1.45
  }

  if (containerWrapper.value && calendarEventSlots.value.length && slotsWrapper.value) {
    let calendarHeight = advCalendarRef.value ? (advCalendarRef.value.getApi().el.offsetHeight + 25) : 20
    useScrollTo(containerWrapper.value, slotsWrapper.value, calendarHeight, 300, props.nestedItem)
  }
})

</script>

<script>
export default {
  name: "AmAdvancedCalendar"
}
</script>

<style lang="scss">
//Amelia Calendar
$amCalClass: am-advsc;
@mixin am-advsc-block {
  .am-advsc {
    margin-bottom: 24px;

    &__wrapper {
      --am-fs-advsc: 15px;
      --am-ln-advsc: 1.6;
      --am-c-advsc-text: var(--am-c-main-text);
      // Calendar cell
      --am-c-advsc-cell-bgr: var(--am-c-cal-init-op10);
      --am-c-advsc-cell-border: var(--am-c-cal-init-op60);
      --am-c-advsc-cell-text: var(--am-c-cal-init-text);
      // Slot
      --am-fs-asdvsc-slot: 15px;
      --am-c-advsc-slot-text: var(--am-c-cal-init-text);
      --am-rad-advsc-slot: 4px;

      * {
        font-family: var(--am-font-family);
        box-sizing: border-box;
      }

      & > div {
        $count: 5;
        @for $i from 0 through $count {
          &:nth-child(#{$i + 1}) {
            animation: 600ms cubic-bezier(.45,1,.4,1.2) #{$i*100}ms am-animation-slide-up;
            animation-fill-mode: both;
          }
        }
      }
    }

    &__time-zone {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 12px 0 4px;

      span {
        font-size: 15px;
        font-weight: 400;
        line-height: 1;
        background-color: var(--am-c-advsc-cell-bgr);
        border-radius: 8px;
        color: var(--am-c-advsc-cell-text);
        padding: 4px 8px;
      }
    }

    &__duration {
      margin-top: 10px;
    }

    table, tr, th {
      background-color: transparent;
    }

    &.fc {
      &-theme-standard {
        .fc {
          &-scrollgrid {
            border: none;
          }
        }

        th, td {
          border: none;
        }

        // Calendar header cell
        th.#{$amCalClass} {
          // Month View
          &__dayGridMonth {
            &-header {
              &-cell {
                font-size: 16px;
                line-height: 1.5;
                color: #8C959A;
                padding: 4px 6px;
                .fc-col-header-cell-cushion {
                  font-size: var(--am-fs-advsc);
                  text-transform: initial;
                  text-decoration: none;
                  line-height: 1;
                  letter-spacing: 0;
                  color: var(--am-c-advsc-text);
                  padding: 12px 0;
                  white-space: nowrap;
                }
              }

              &-weekend {
                color: #D1D5D7;
              }
            }
          }
        }

        // Calendar cell
        td.#{$amCalClass} {
          // Month view
          &__dayGridMonth {
            // Calendar cell
            &-cell {
              position: relative;
              border: none;
              padding: 4px 6px;

              // Calendar today day
              &.fc-day-today {
                position: relative;
                background: none;

                // Calendar cell state
                &.#{$amCalClass} {
                  // Selected cell
                  &__dayGridMonth-selected {
                    .fc-daygrid-day-frame {
                      background-color: var(--am-c-advsc-cell-bgr);
                      border-color: var(--am-c-advsc-cell-border);

                      &:after {
                        background-color: var(--am-c-advsc-cell-text);
                      }
                    }
                  }

                  // Disabled cell
                  &__dayGridMonth-disabled {
                    .fc-daygrid-day {
                      &-frame {
                        --am-c-advsc-cell-bgr: var(--am-c-cal-disabled-op10);
                        --am-c-advsc-cell-border: transparent;

                        &:hover {
                          --am-c-advsc-cell-bgr: var(--am-c-cal-disabled-op10);
                          --am-c-advsc-cell-border: transparent;
                          cursor: not-allowed;
                        }
                      }

                      &-number {
                        --am-c-advsc-cell-text: var(--am-c-cal-disabled-text);
                      }
                    }
                  }
                }

                .fc-daygrid-day-frame {
                  // Today marker - dot
                  &:after {
                    content: '';
                    display: block;
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: var(--am-c-advsc-cell-text);
                  }
                }
              }

              // Calendar cell state
              &.#{$amCalClass} {
                // Disabled cell
                &__dayGridMonth-disabled {
                  .fc-daygrid-day {
                    &-frame {
                      --am-c-advsc-cell-bgr: var(--am-c-cal-disabled-op10);
                      --am-c-advsc-cell-border: transparent;

                      &:hover {
                        --am-c-advsc-cell-bgr: var(--am-c-cal-disabled-op10);
                        --am-c-advsc-cell-border: transparent;
                        cursor: not-allowed;
                      }
                    }

                    &-number {
                      --am-c-advsc-cell-text: var(--am-c-cal-disabled-text);
                    }
                  }
                }

                // Selected cell
                &__dayGridMonth-selected {
                  .fc-daygrid-day-frame {
                    --am-c-advsc-cell-text: var(--am-c-cal-selected-text);
                    --am-c-advsc-cell-bgr: var(--am-c-cal-selected);
                    --am-c-advsc-cell-border: var(--am-c-cal-selected);

                    &:hover {
                      --am-c-advsc-cell-bgr: var(--am-c-cal-selected-op80);
                      --am-c-advsc-cell-border: var(--am-c-cal-selected-op80);
                    }
                  }
                }

                // Weekend days cell
                &__dayGridMonth-weekend {
                  .fc-daygrid-day {
                    &-frame {
                      background-color: transparent;
                      border-color: transparent;

                      &:hover {
                        border-color: transparent;
                        cursor: not-allowed;
                      }
                    }

                    &-number {
                      color: #D1D5D7;
                    }
                  }
                }
              }

              // Calendar inner cell items
              .fc-daygrid-day {
                // Calendar inner cell wrapper
                &-frame {
                  position: absolute;
                  width: calc(100% - 12px);
                  height: calc(100% - 8px);
                  min-height: auto;
                  top: 4px;
                  left: 6px;
                  background-color: var(--am-c-advsc-cell-bgr);
                  border: 1px solid var(--am-c-advsc-cell-border);
                  border-radius: 4px;
                  cursor: pointer;

                  &:hover {
                    --am-c-advsc-cell-bgr: var(--am-c-cal-init-op20);
                    --am-c-advsc-cell-border: var(--am-c-cal-init);
                    transition: all 0.3s ease-in-out;
                  }
                }

                // Calendar date slot availability wrapper
                &-bg {
                  .fc-bg-event {
                    background: none;
                    opacity: 1;

                    // Calendar date slot availability
                    /*.#{$amCalClass}__slot-wrapper {
                      position: absolute;
                      width: 100%;
                      bottom: 0;
                      left: 0;
                      background-color: rgba($primary-color, 0.3);
                    }*/
                  }
                }

                // Inner cell date wrapper
                &-top {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                }

                // Inner cell date holder
                &-number {
                  color: var(--am-c-advsc-cell-text);
                  line-height: 1;
                  padding: 0;
                  white-space: nowrap;
                }
              }
            }
          }
        }
      }
    }

    // Mobile Calendar cell
    &[am-mobile=true] {
      &.fc {
        &-theme-standard {
          td.#{$amCalClass} {
            // Month view
            &__dayGridMonth {
              // Calendar cell TODO
              &-cell {
                padding: 3px;
                .fc-daygrid-day {
                  &-frame {
                    width: calc(100% - 6px);
                    height: calc(100% - 4px);
                  }
                }
              }
            }
          }
        }
      }
    }
    // Mobile S (<340px) Calendar cell
    &[am-mobile-s=true] {
      &.fc {
        &-theme-standard {
          height: 230px;
          th.#{$amCalClass} {
            // Month view
            &__dayGridMonth {
              &-header-cell {
                --am-fs-advsc: 12px;
                padding: 2px 3px;
                line-height: 1.2;
              }
            }
          }
          td.#{$amCalClass} {
            // Month view
            &__dayGridMonth {
              // Calendar cell TODO
              &-cell {
                padding: 2px;
                .fc-daygrid-day {
                  &-frame {
                    top: 2px;
                    left: 2px;
                    &:after {
                      right: 1px;
                      top: 1px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    &__header {
      display: flex;

      & > div {
        margin-right: 24px;

        &:last-child {
          margin-right: 0;
        }
      }

      .am-button {
        font-size: 18px;
        padding: 8px;
      }

      &-mobile {
        & > div {
          margin-right: 8px;
        }
      }

      &-mobile-s {
        flex-direction: column;
        align-items: center;
        gap: 8px;
        & > div {
          margin-right: 0px;
        }
      }
    }

    &__slots {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;

      &-wrapper {}

      &-heading {
        font-size: var(--am-fs-advsc);
        line-height: var(--am-ln-advsc);
        color: var(--am-c-advsc-text);
        margin-bottom: 8px;
        padding: 0 6px;
      }

      &-item {
        --am-c-advsc-slot-bgr: var(--am-c-cal-init-op10);
        --am-c-advsc-slot-border: var(--am-c-cal-init-op60);
        width: 100%;
        flex: 50%;
        padding: 0 6px;
        margin-bottom: 8px;

        $count: 1000;
        @for $i from 0 through $count {
          &:nth-child(#{$i + 1}) {
            animation: 600ms cubic-bezier(.45,1,.4,1.2) #{$i*100}ms am-animation-slide-up;
            animation-fill-mode: both;
          }
        }

        &:last-child {
          max-width: 50%;
        }

        &__selected {
          --am-c-advsc-slot-bgr: var(--am-c-cal-selected);
          --am-c-advsc-slot-border: var(--am-c-cal-selected);
          --am-c-advsc-slot-text: var(--am-c-cal-selected-text);
        }

        &__inner {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--am-fs-asdvsc-slot);
          font-weight: 400;
          line-height: 1.6;
          color: var(--am-c-advsc-slot-text);
          padding: 7px;
          border: 1px solid var(--am-c-advsc-slot-border);
          border-radius: var(--am-rad-advsc-slot);
          background-color: var(--am-c-advsc-slot-bgr);
          cursor: pointer;
        }

        &-mobile { // TODO - for time view
          padding: 0 4px;
          --am-fs-asdvsc-slot: 12px;

          .am-advsc__slots-item__inner {
            padding: 4px;
          }
        }
      }
    }
  }
}

.amelia-v2-booking #amelia-container {
  @include am-advsc-block;
}

#amelia-app-backend-new {
  @include am-advsc-block;
}
</style>
