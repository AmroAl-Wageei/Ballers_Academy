<template>
  <div
    id="am-recurring-setup"
    class="am-recurring-setup am-mobile-collapsed am-select-date"
    :class="$root.settings.customization.forms ? `am-form-${formType}-${formName}` : ''"
  >
    <recurring-setup-heading-form-field
      v-if="isFrontend"
      :class-identifier="`${formType}-${formName}`"
      :formField="formsData[formName].itemsStatic.recurringSetupHeadingFormField"
    ></recurring-setup-heading-form-field>

    <el-form
      :model="recurring"
      ref="recurring"
      label-position="top"
    >
      <div>
        <el-row :gutter="24">
          <el-col :sm="12">
            <el-form-item
              :label="labelRepeat || $root.labels.recurring_repeat"
              :class="$root.settings.customization.forms ? `am-select-${formType}-${formName}`: ''"
            >
              <el-select
                v-model="initialRecurringData.cycle"
                :class="service.recurringCycle !== 'all' ? 'am-recurring-setup-all-cycle' : ''"
                :popper-class="$root.settings.customization.forms ? `am-dropdown-${formType}-${formName}` : ''"
                :disabled="service.recurringCycle !== 'all'"
                @change="setRecurringValues('count')"
              >
                <el-option
                  v-for="(option, index) in cycles"
                  :key="index"
                  :value="option.value"
                  :label="option.label"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :sm="12">
            <el-form-item
              :label="labelEvery || $root.labels.recurring_every"
              :class="$root.settings.customization.forms ? `am-select-${formType}-${formName}`: ''"
            >
              <el-select
                v-model="initialRecurringData.cycleInterval"
                :popper-class="$root.settings.customization.forms ? `am-dropdown-${formType}-${formName}` : ''"
                @change="setRecurringValues('count')"
              >
                <el-option
                  v-for="(option, index) in initialRecurringData.repeatIntervalLabels"
                  :key="index"
                  :value="option.value"
                  :label="option.label"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24" v-if="initialRecurringData.cycle === 'weekly'" class="am-recurring-setup-weekly">
          <el-col :sm="24">
            <el-form-item
              :label="labelOn || $root.labels.recurring_on"
              :class="$root.settings.customization.forms ? `am-checkbox-btn-${formType}-${formName}` : ''"
            >
              <el-checkbox-group
                v-model="initialRecurringData.weekDaysSelected"
                @change="setRecurringValues('date')"
                :border="true"
                size="small"
              >
                <el-checkbox-button
                  v-for="(weekDay, index) in weekDays"
                  :label="index"
                  :key="index"
                  :disabled="!weekDay.enabled"
                >
                  {{weekDay.label}}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24" v-if="initialRecurringData.cycle === 'monthly'">
          <el-col :sm="24">
            <el-form-item
              :label="labelOn || $root.labels.recurring_on"
              :class="$root.settings.customization.forms ? `am-select-${formType}-${formName}`: ''"
            >
              <el-select
                v-model="initialRecurringData.monthDateRule"
                :popper-class="$root.settings.customization.forms ? `am-dropdown-${formType}-${formName}` : ''"
                @change="setRecurringValues('date')"
              >
                <el-option
                  v-for="(option, index) in monthlyWeekDayRepeat"
                  :key="index"
                  :value="option.value"
                  :label="option.label + (index !== 0 ? (' ' + initialRecurringData.selectedMonthlyWeekDayString) : '')"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24" :style="{'opacity': initialRecurringData.cycle !== null ? 1 : 0.2, 'pointer-events': initialRecurringData.cycle !== null ? 'all' : 'none'}">
          <el-col :sm="12" class="v-calendar-column">
            <el-form-item
              :label="labelUntil || $root.labels.recurring_until"
              :class="$root.settings.customization.forms ? `am-calendar-${formType}-${formName}`: ''"
            >
              <v-date-picker
                v-model="initialRecurringData.maxDate"
                @input="setRecurringValues('date')"
                :is-double-paned="false"
                mode='single'
                popover-visibility="focus"
                popover-direction="bottom"
                popover-align="center"
                :tint-color='$root.settings.customization.primaryColor'
                input-class='el-input__inner'
                :show-day-popover=false
                :input-props='{class: "el-input__inner", readOnly: "readonly"}'
                :is-expanded=false
                :is-required=true
                :formats="vCalendarFormats"
                :available-dates="{start: minFrom, end: maxUntil}"
                :disabled="initialRecurringData.cycle === null"
              >
              </v-date-picker>
            </el-form-item>
          </el-col>

          <el-col :sm="12" class="am-recurring-setup-times">
            <el-form-item
              :label="labelTimes || $root.labels.recurring_times"
              :class="$root.settings.customization.forms ? `am-input-number-${formType}-${formName}`: ''"
            >
              <el-input-number
                v-model="initialRecurringData.maxCount"
                :min="1"
                :disabled="initialRecurringData.cycle === 0"
                @change="setRecurringValues('count')"
              >
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <div
          v-if="isFrontend && selectedRecurringInterval"
          :class="$root.settings.customization.forms ? `am-block-${formType}-${formName}` : ''"
          class="am-recurring-setup-description"
        >
          <span>{{ recurringData.recurringString }}</span>
          <br>
          <span>{{ $root.labels.recurring_from_text + ' ' + getFromDateFormatted() + ' ' + $root.labels.at + ' ' + getFromTimeFormatted() }}</span>
        </div>

        <!-- Back & Continue Buttons -->
        <div class="am-button-wrapper" v-if="isFrontend">
          <!-- Back Button -->
          <transition name="fade">
            <el-button @click="cancelRecurringSetup()">
              {{ $root.labels.back }}
            </el-button>
          </transition>

          <!-- Continue Button -->
          <transition name="fade">
            <el-button id="am-recurring-continue-button" class="am-recurring-continue" @click="confirmRecurringSetup" :disabled="!initialRecurringData.maxDate || recurringData.dates.length === 0">
              {{ $root.labels.continue }}
            </el-button>
          </transition>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
  import moment from 'moment'
  import dateMixin from '../../js/common/mixins/dateMixin'
  import helperMixin from '../../js/backend/mixins/helperMixin'
  import recurringMixin from '../../js/common/mixins/recurringMixin'
  import recurringSetupHeadingFormField from '../frontend/booking/components/formFields/RecurringSetupHeadingFormField'
  import slotsMixin from '../../js/common/mixins/slotsMixin'

  export default {
    name: 'recurringSetupForm',

    components: {recurringSetupHeadingFormField},

    mixins: [
      slotsMixin,
      dateMixin,
      recurringMixin,
      helperMixin
    ],

    props: {
      containerId: null,
      initialRecurringData: null,
      recurringData: null,
      availableDates: null,
      disabledWeekdays: null,
      calendarTimeSlots: null,
      occupiedTimeSlots: null,
      service: null,
      isFrontend: true,
      calendarPosition: 'bottom',
      formType: {
        type: String
      },
      formsData: {
        type: Object,
        default: () => {}
      }
    },

    data () {
      return {
        formName: this.$options.name,
        monthlyWeekDayRepeat: [
          {
            label: this.$root.labels.recurring_date_specific,
            value: 0
          },
          {
            label: this.$root.labels.recurring_date_first,
            value: 1
          },
          {
            label: this.$root.labels.recurring_date_second,
            value: 2
          },
          {
            label: this.$root.labels.recurring_date_third,
            value: 3
          },
          {
            label: this.$root.labels.recurring_date_fourth,
            value: 4
          },
          {
            label: this.$root.labels.recurring_date_last,
            value: 5
          }
        ],
        cycles: [
          {
            label: this.$root.labels.recurring_type_daily,
            value: 'daily'
          },
          {
            label: this.$root.labels.recurring_type_weekly,
            value: 'weekly'
          },
          {
            label: this.$root.labels.recurring_type_monthly,
            value: 'monthly'
          }
        ],
        weekDays: [],
        recurring: {
          maxDate: null
        },
        labelRepeat: this.formsData.recurringSetupForm.itemsStatic.recurringSettingsFormField.labels.recurring_repeat.value,
        labelEvery: this.formsData.recurringSetupForm.itemsStatic.recurringSettingsFormField.labels.recurring_every.value,
        labelOn: this.formsData.recurringSetupForm.itemsStatic.recurringSettingsFormField.labels.recurring_on.value,
        labelUntil: this.formsData.recurringSetupForm.itemsStatic.recurringSettingsFormField.labels.recurring_until.value,
        labelTimes: this.formsData.recurringSetupForm.itemsStatic.recurringSettingsFormField.labels.recurring_times.value
      }
    },

    created () {
      this.weekDays = []

      for (let i = 0; i < 7; i++) {
        this.weekDays.push({
          label: moment().isoWeekday(i + 1).format('dd'),
          enabled: true
        })
      }
    },

    mounted () {
      this.scrollView('am-recurring-setup', 'start')
      this.recurring.maxDate = this.initialRecurringData.calendarDates[this.initialRecurringData.calendarDates.length - 1]

      if (this.initialRecurringData.weekDaysSelected.length === 0) {
        this.initialRecurringData.weekDaysSelected.push(this.initialRecurringData.selectedWeekDayIndex)
      }

      if (!this.isFrontend) {
        this.recurringData.setupCallback = this.setRecurringValues
      }

      this.setRecurringValues('count')
    },

    methods: {
      setRecurringValues: function () {},

      getFromDateFormatted () {
        return this.getFrontedFormattedDate(
          moment(this.recurringData.startDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')
        )
      },

      getFromTimeFormatted () {
        return this.getFrontedFormattedTime(
          moment(this.recurringData.startDate, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')
        )
      },

      confirmRecurringSetup: function () {},

      cancelRecurringSetup: function () {}
    },

    computed: {
      maxUntil () {
        return moment(this.initialRecurringData.calendarDates[this.initialRecurringData.calendarDates.length - 1]).toDate()
      },

      minFrom () {
        return moment(this.recurringData.startDate, 'YYYY-MM-DD').add(1, 'days').toDate()
      },

      selectedRecurringInterval () {
        return this.initialRecurringData.repeatIntervalLabels.find(item => item.value === this.initialRecurringData.cycleInterval)
      }
    }
  }
</script>
