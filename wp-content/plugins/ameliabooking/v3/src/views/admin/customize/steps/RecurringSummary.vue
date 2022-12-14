<template>
  <div
    class="am-fs__ro"
    :class="props.globalClass"
    :style="cssVars"
  >
    <div class="am-fs__ro-warning">
      <AmAlert
        type="warning"
        :title="labelsDisplay('recurring_unavailable_slots')"
        :description="`2 ${labelsDisplay('recurring_alert_content')}`"
        :show-icon="true"
        :closable="false"
      ></AmAlert>
    </div>
    <AmCollapse>
      <AmCollapseItem
        v-for="(appointment, index) in serviceSelection.list"
        :ref="el => recurringList[index] = el"
        :key="index"
        :name="index.toString()"
        class="am-fs__ro-app-items"
        :class="{'am-fs__ro-app-unavailable': appointment.isSubstitute}"
        :side="true"
        :delay="500"
        @collapse-open="selectCalendar()"
        @collapse-clicked="collapseClicked(index)"
      >
        <template #heading>
          <div class="am-fs__ro-app-heading">
            <span>
              {{ (index + 1) + '. ' + (appointment.date && appointment.time ? appointment.date + ' ' + appointment.time : labelsDisplay('recurring_chose_date')) }}
            </span>
          </div>
        </template>

        <template #icon-end>
          <SideMenu :cancel-label="labelsDisplay('recurring_delete')"></SideMenu>
        </template>

        <template #default>
          <div class="am-fs__ro-app-content">
            <AmAdvancedSlotCalendar
              :id="0"
              :slots="calendarEvents"
              :calendar-minimum-date="moment().format('YYYY-MM-DD hh:mm')"
              :calendar-maximum-date="moment().add(1,'year').format('YYYY-MM-DD hh:mm')"
              :time-zone="amCustomize[pageRenderKey].recurringSummary.options.timeZoneVisibility.visibility"
              :label-slots-selected="labelsDisplay('recurring_slots_selected')"
            ></AmAdvancedSlotCalendar>
          </div>
        </template>
      </AmCollapseItem>
    </AmCollapse>
  </div>
</template>

<script setup>
import { computed, inject, provide, ref } from "vue";
import moment from "moment";
import AmAlert from "../../../_components/alert/AmAlert";
import AmCollapse from "../../../_components/collapse/AmCollapse";
import AmCollapseItem from "../../../_components/collapse/AmCollapseItem";
import SideMenu from '../../../public/StepForm/RecurringStep/parts/SideMenu.vue'
import AmAdvancedSlotCalendar from '../../../_components/advanced-slot-calendar/AmAdvancedSlotCalendar.vue'
import { useColorTransparency } from "../../../../assets/js/common/colorManipulation";

let props = defineProps({
  globalClass: {
    type: String,
    default: ''
  }
})

// Container Width
let cWidth = inject('containerWidth', 0)
let checkScreen = computed(() => cWidth.value < 560)

let langKey = inject('langKey')
let amLabels = inject('labels')

let pageRenderKey = inject('pageRenderKey')
let amCustomize = inject('customize')

// * Label computed function
function labelsDisplay (label) {
  let computedLabel = computed(() => {
    return amCustomize.value[pageRenderKey.value].recurringSummary.translations
    && amCustomize.value[pageRenderKey.value].recurringSummary.translations[label]
    && amCustomize.value[pageRenderKey.value].recurringSummary.translations[label][langKey.value]
      ? amCustomize.value[pageRenderKey.value].recurringSummary.translations[label][langKey.value]
      : amLabels[label]
  })

  return computedLabel.value
}

let serviceSelection = ref({
  list: [
    {date: moment().format('YYYY-MM-DD'), time: '13:05'},
    {date: moment().add(3, 'days').format('YYYY-MM-DD'), time: '13:05', isSubstitute: false},
    {date: '', time: '', isSubstitute: true},
    {date: moment().add(9, 'days').format('YYYY-MM-DD'), time: '13:05', isSubstitute: true},
  ]
})

let calendarEvents = ref([])

let today = moment().format('YYYY-MM-DD')

for (let i = 0; i <= 31; i++) {
  let block = {
    display: "background",
    extendedProps: {
      slots: {'09:00': [7, 3]},
      slotsAvailable: 1,
      slotsTotal: 100
    },
    start: moment(today).add(i, 'd').format('YYYY-MM-DD'),
    title: "e"
  }
  calendarEvents.value.push(block)
}

let calendarEventSlots = ref([])
let calendarEventSlot = ref('')
let calendarStartDate = ref(moment().format('YYYY-MM-DD'))
let calendarChangeSideBar = ref(true)
provide('calendarEvents', calendarEvents)
provide('calendarEventSlots', calendarEventSlots)
provide('calendarEventSlot', calendarEventSlot)
provide('calendarStartDate', calendarStartDate)
provide('calendarChangeSideBar', calendarChangeSideBar)

/*********
 * Other *
 ********/
let calendarSlotDuration = 3600
provide('calendarSlotDuration', calendarSlotDuration)

let recurringList = ref([])

function collapseClicked (value) {
  recurringList.value.forEach((item, index) => {
    if (index !== value && item.contentVisibility) {
      item.closingFromParent()
    }
  })
}
function selectCalendar () {}


let amColors = inject('amColors')
let cssVars = computed(() => {
  return {
    '--am-c-ro-warning-op10': useColorTransparency(amColors.value.colorWarning, 0.1),
    '--am-c-ro-warning-op60': useColorTransparency(amColors.value.colorWarning, 0.6),
  }
})
</script>

<script>
export default {
  name: 'RecurringSummary',
  key: 'recurringSummary',
  sidebarData: {
    label: 'recurring_summary',
    icon: 'calendar-pencil',
    stepSelectedData: [],
    finished: false,
    selected: false,
  }
}
</script>

<style lang="scss">
#amelia-app-backend-new {
  #amelia-container {
    // ro - recurring overview
    .am-fs__ro {
      --am-c-ro-text: var(--am-c-main-text);
      --am-c-ro-success: var(--am-c-success);

      &-warning {
        .am-alert {
          i {
            font-size: 20px;
          }
          margin-bottom: 16px;
        }
      }

      .am-collapse-item {
        &__heading {
          transition-delay: .5s;

          &-side {
            transition-delay: 0s;
          }
        }
      }

      &-app {
        &-unavailable {
          .am-collapse-item__heading {
            /* $yellow-300 */
            background-color: var(--am-c-ro-warning-op10);
            /* $yellow-600 */
            border: 1px solid var(--am-c-ro-warning-op60);
            &-active {
              border-bottom: 0;
            }
          }
          .am-collapse-item__content {
            /* $yellow-300 */
            background-color: var(--am-c-ro-warning-op10);
            /* $yellow-600 */
            border: 1px solid var(--am-c-ro-warning-op60);
          }
        }

        &-items {
          .am-collapse-item__content {
            display: block;
          }
          .am-collapse-item__trigger {
            padding: 0
          }
        }

        &-heading {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.42857;
          /* $shade-900 */
          color: var(--am-c-ro-text);
          margin: 0 20px 0 0;
        }

        &-text {
          font-weight: 500;
          font-size: 14px;
          line-height: 20px;
          /* $shade-900 */
          color: var(--am-c-ro-text);
          &-selected {
            /* $green-900 */
            color: var(--am-c-ro-success);
          }
          margin-right: 10px;
          white-space: nowrap
        }
      }
    }

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
  }
}
</style>
