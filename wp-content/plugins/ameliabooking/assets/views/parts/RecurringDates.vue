<template>
  <div
    id="am-recurring-dates"
    class="am-recurring-dates"
    :class="$root.settings.customization.forms ? `am-form-${formType}-${formName}` : ''"
  >
    <div v-if="substitutesCount > 0" class="am-recurring-dates-header">
      <p v-if="isFrontend">{{ $root.labels.recurring_sub_message1 }}</p>
      <p>{{ $root.labels.recurring_sub_message2 }}{{ substitutesCount }}</p>
    </div>
    <div v-else class="am-recurring-dates-header">
      <template v-if="headingVisibility">
        <p v-if="isFrontend" class="am-recurring-dates-header-first">{{ labelRecurringAppointments || $root.labels.recurring_appointments }}</p>
        <p v-if="isFrontend" class="am-recurring-dates-header-second">{{ labelRecurringEdit || $root.labels.recurring_edit }}</p>
      </template>
    </div>

    <div class="am-recurring-dates-row-header hide-on-mobile">
      <el-row>
        <!-- Order -->
        <el-col :lg="3" :sm="3">
          <span style="visibility: hidden;">#</span>
        </el-col>

        <!-- Date -->
        <el-col :lg="10" :sm="10" class="am-recurring-dates-row-header-date">
          <span>{{ labelDate || $root.labels.date }}</span>
        </el-col>

        <!-- Time -->
        <el-col :lg="7" :sm="7" class="am-recurring-dates-row-header-time">
          <span>{{ labelTime || $root.labels.time }}</span>
        </el-col>

        <!-- Action -->
        <el-col :lg="4" :sm="4">
          <span></span>
        </el-col>
      </el-row>
    </div>

    <div
      v-loading="loading"
      class="am-recurring-dates-rows"
      :style="{opacity: loading ? 0.5 : 1}"
    >
      <el-row
        v-for="(item, index) in recurringData.pageRecurringDates"
        :key="index"
        class="am-recurring-flex-row-middle-align"
        :class="getRowClass(item)"
        v-if="typeof item !== 'undefined'"
      >
        <!-- Order -->
        <el-col
          :lg="item.isDeleting ? 18 : 3"
          :sm="item.isDeleting ? 18 : 3"
          :class="[
            {
              'is-editing': item.isEditing,
              'is-deleting': item.isDeleting,
            },
            $root.settings.customization.forms ? `am-block-${formType}-${formName}` : ''
           ]"
          class="am-recurring-row-item am-recurring-row-order"
        >
          <span :class="isFrontend ? 'hide-on-mobile' : ''" v-if="!item.isDeleting">{{ index + 1 + (recurringData.pagination.show * (recurringData.pagination.page - 1)) }}</span>
          <span class="am-col-title am-col-title-date" v-if="isFrontend && !item.isDeleting">{{ labelDate || $root.labels.date }} / {{ labelTime || $root.labels.time }}</span><i v-if="item.isSubstituteDate || item.isSubstituteTime" class="el-icon-warning-outline"></i>
          <span v-if="item.isDeleting" class="am-recurring-row-delete-message">{{ $root.labels.recurring_confirm_delete }}</span>
        </el-col>

        <!-- Date -->
        <el-col
          :lg="item.isDeleting ? 1 : 10"
          :sm="item.isDeleting ? 1 : 10"
          :class="[
            {
              'is-editing': item.isEditing,
              'is-substitute': item.isSubstituteDate
            },
            $root.settings.customization.forms ? `am-calendar-${formType}-${formName}`: ''
          ]"
          class="am-recurring-row-item am-recurring-row-item-date v-calendar-column"
        >
          <v-date-picker
            :style="{'visibility': item.isDeleting ? 'hidden' : 'visible'}"
            v-model="item.date"
            @input="changedDate(item)"
            mode='single'
            popover-visibility="focus"
            :popover-direction="isFrontend ? 'bottom' : 'top'"
            popover-align="center"
            :tint-color='$root.settings.customization.primaryColor'
            input-class='el-input__inner'
            :show-day-popover=false
            :input-props='{class: "el-input__inner", readOnly: "readonly"}'
            :available-dates="recalculatedAvailableDates"
            :is-expanded=false
            :is-required=false
            :disabled-dates='disabledWeekdays'
            :disabled=false
            :formats="vCalendarFormats"
          >
          </v-date-picker>
        </el-col>

        <!-- Time -->
        <el-col
          :lg="item.isDeleting ? 1 : 7" :sm="item.isDeleting ? 1 : 7"
          :class="[
            {
              'is-editing': item.isEditing,
              'is-substitute': item.isSubstituteTime
            },
            $root.settings.customization.forms ? `am-select-${formType}-${formName}`: ''
          ]"
          class="am-recurring-row-item am-recurring-row-item-time"
        >
          <div>
            <el-select
              v-model="item.time"
              value-key="time"
              filterable
              :popper-class="$root.settings.customization.forms ? `am-dropdown-${formType}-${formName}` : ''"
              :style="{'visibility': item.isDeleting ? 'hidden' : 'visible'}"
              :class="item.time === null ? 'am-recurring-row-item-time' : ''"
            >
              <el-option
                v-for="slot in Object.keys(item.slots).sort()"
                :key="slot"
                :label="getFrontedFormattedTime(slot + ':00')"
                :value="slot"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>

        <!-- Action -->
        <el-col :lg="item.isDeleting ? 4 : 4" :sm="item.isDeleting ? 4 : 4" class="am-recurring-row-action" :class="item.isEditing ? 'is-editing' : ''">
          <div v-if="!item.isEditing && !item.isDeleting && (recurringData.pagination.page > 1 || (recurringData.pagination.page === 1 && index > 0))">
            <div
              v-if="isFrontend"
              class="am-edit-element"
              @click="editDate(item)"
              :class="$root.settings.customization.forms ? `am-block-${formType}-${formName}` : ''"
            >
              <i class="el-icon-edit"></i>
            </div>

            <div
              class="am-edit-element"
              :style="{'visibility': recurringData.dates.length === 1 ? 'hidden' : 'visible'}"
              :class="$root.settings.customization.forms ? `am-block-${formType}-${formName}` : ''"
              @click="isFrontend ? deleteDate(item) : confirmDeleteDate(item, index)"
            >
            <i class="el-icon-delete"></i>
            </div>
          </div>
          <div v-else-if="recurringData.pagination.page > 1 || (recurringData.pagination.page === 1 && index > 0)">
            <div
              class="am-edit-element"
              :class="$root.settings.customization.forms ? `am-block-${formType}-${formName}` : ''"
              @click="!item.isDeleting ? confirmEditDate(item) : confirmDeleteDate(item, index)"
            >
              <i class="el-icon-check"></i>
            </div>

            <div
              class="am-delete-element"
              :class="$root.settings.customization.forms ? `am-block-${formType}-${formName}` : ''"
              @click="!item.isDeleting ? cancelEditDate(item) : cancelDeleteDate(item)"
            >
              <i class="el-icon-close"></i>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div
      class="am-pagination am-section"
      :class="[
        recurringData.pagination.count > recurringData.pagination.show ? '' : 'am-pagination-hidden',
        $root.settings.customization.forms ? `am-block-${formType}-${formName}` : ''
      ]"
    >
      <div>
        <p>{{ $root.labels.showing }} {{ recurringData.pageRecurringDates.length }} {{ $root.labels.out_of }} {{ recurringData.dates.length}} {{ $root.labels.recurring_appointments }}</p>
      </div>
      <el-pagination
        :page-size="recurringData.pagination.show"
        :total="recurringData.pagination.count"
        layout="prev, pager, next"
        :current-page.sync=recurringData.pagination.page
      >
      </el-pagination>
    </div>

    <!-- Confirm Dialog Footer -->
    <div class="dialog-footer" slot="footer" v-if="isFrontend">
      <div class="el-button el-button--default" @click="cancelRecurringDates()">
        <span>{{ $root.labels.cancel }}</span>
      </div>

      <div class="el-button el-button--primary" @click="confirmRecurringDates()">
        <span>{{ $root.labels.continue }}</span>
      </div>
    </div>
    <!-- /Confirm Dialog Footer -->
  </div>
</template>

<script>
  import dateMixin from '../../js/common/mixins/dateMixin'
  import durationMixin from '../../js/common/mixins/durationMixin'
  import helperMixin from '../../js/backend/mixins/helperMixin'
  import moment from 'moment'

  export default {
    name: 'recurringDatesForm',

    mixins: [dateMixin, durationMixin, helperMixin],

    props: {
      recurringData: null,
      availableDates: null,
      calendarTimeSlots: null,
      isFrontend: true,
      selectedExtras: null,
      service: null,
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
        currentlyEditingItemIndex: null,
        recalculatedAvailableDates: null,
        disabledWeekdays: null,
        loading: false,
        formName: this.$options.name,
        labelRecurringAppointments: this.formsData[this.$options.name].itemsStatic.recurringDatesHeadingFormField.labels.recurring_appointments.value,
        labelRecurringEdit: this.formsData[this.$options.name].itemsStatic.recurringDatesHeadingFormField.labels.recurring_edit.value,
        headingVisibility: this.formsData[this.$options.name].itemsStatic.recurringDatesHeadingFormField.visibility,
        labelDate: this.formsData[this.$options.name].itemsStatic.recurringInfoFormField.labels.date.value,
        labelTime: this.formsData[this.$options.name].itemsStatic.recurringInfoFormField.labels.time.value
      }
    },

    mounted () {
      this.scrollView('am-recurring-dates', 'start')
      if (!this.isFrontend) {
        this.recurringData.datesCallback = this.setAvailableDates
      }

      this.setAvailableDates()
    },

    methods: {
      getRowClass: function () {
        return ''
      },

      getAppointmentDate (date) {
        return this.getFrontedFormattedDate(
          moment(date).format('YYYY-MM-DD')
        )
      },

      getAppointmentTime (time) {
        return this.getFrontedFormattedTime(time)
      },

      cancelRecurringDates: function () {},

      getRequiredDuration: function () {},

      confirmRecurringDates: function () {},

      setAvailableDates: function () {},

      changedDate: function () {},

      editDate: function () {},

      cancelEditDate: function () {},

      confirmEditDate: function () {},

      deleteDate: function () {},

      confirmDeleteDate: function () {},

      cancelDeleteDate: function () {}
    },

    watch: {
      'recurringData.pagination.page' () {
        this.loading = true

        setTimeout(() => {
          let startIndex = (this.recurringData.pagination.page - 1) * this.recurringData.pagination.show
          this.recurringData.pageRecurringDates = this.recurringData.dates.slice(startIndex, startIndex + this.recurringData.pagination.show)

          this.loading = false
        }, 500)
      }
    },

    computed: {
      substitutesCount () {
        return this.recurringData.dates.filter(date => date.isSubstituteDate || date.isSubstituteTime).length
      }
    }
  }
</script>
