<template>
  <div class="am-wrap">
    <div id="am-events" class="am-body">

      <!-- Page Header -->
      <page-header
          @newEventBtnClicked="showDialogNewEvent"
      >
      </page-header>

      <!-- Spinner -->
      <div class="am-spinner am-section" style="display: none">
        <img :src="$root.getUrl+'public/img/spinner.svg'"/>
      </div>

      <!-- Empty State -->
      <div class="am-empty-state am-section"
           v-if="fetched && Object.keys(eventsDay).length === 0 && !filterApplied && fetchedFiltered && options.fetched">
        <img :src="$root.getUrl+'public/img/emptystate.svg'">
        <h2>{{ $root.labels.no_events_yet }}</h2>
        <p>{{ $root.labels.click_add_events }}</p>
      </div>

      <!-- Events -->
      <div
          v-show="(Object.keys(eventsDay).length !== 0 || (Object.keys(eventsDay).length === 0 && filterApplied) || !fetchedFiltered)">

        <!-- Search & Filter -->
        <div class="am-events-filter am-section">
          <el-form class="" method="POST">

            <!-- Global Search & Date Picker -->
            <el-row :gutter="16">
              <el-col :md="5" class="v-calendar-column">
                <el-form-item prop="dates">
                  <v-date-picker
                      @input="changeRange"
                      v-model="params.dates"
                      :is-double-paned="false"
                      mode='range'
                      popover-visibility="focus"
                      popover-direction="bottom"
                      popover-align="left"
                      tint-color='#1A84EE'
                      :show-day-popover=false
                      :input-props='{class: "el-input__inner"}'
                      :is-expanded=false
                      :is-required=true
                      input-class="el-input__inner"
                      :formats="vCalendarFormats"
                  >
                  </v-date-picker>
                </el-form-item>
              </el-col>
              <el-col :md="19">
                <div class="am-search">
                  <el-form-item>

                    <!-- Search -->
                    <el-input
                        class=""
                        :placeholder="$root.labels.event_search_placeholder"
                        v-model="params.search"
                    >
                    </el-input>

                  </el-form-item>
                </div>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- No Results -->
        <div class="am-empty-state am-section" style="display: none"
             v-show="fetched && Object.keys(eventsDay).length === 0 && filterApplied && fetchedFiltered && options.fetched">
          <img :src="$root.getUrl + 'public/img/emptystate.svg'">
          <h2>{{ $root.labels.no_results }}</h2>
        </div>

        <!-- Content Spinner -->
        <div class="am-spinner am-section" v-show="!fetched || !fetchedFiltered || !options.fetched">
          <img :src="$root.getUrl + 'public/img/spinner.svg'"/>
        </div>

        <!-- Event List -->
        <div class="am-events am-section"
             v-show="fetchedFiltered && options.fetched && Object.keys(eventsDay).length !== 0">

          <!-- Events List Header -->
          <div class="am-events-list-head">
            <el-row>
              <el-col :lg="11">
                <el-row :gutter="10" class="am-events-flex-row-middle-align">

                  <!-- Events List Checkbox -->
                  <el-col :lg="7">
                    <p>
                    </p>
                  </el-col>

                  <!-- Event List Name -->
                  <el-col :lg="8">
                    <p>{{ $root.labels.event_name }}</p>
                  </el-col>

                  <!-- Event List Location -->
                  <el-col :lg="4" class="am-event-location">
                    <p>{{ $root.labels.event_location }}</p>
                  </el-col>

                  <!-- Event List Spots -->
                  <el-col :lg="3">
                    <p class="am-event-spots">{{ $root.labels.booked + ':'}}</p>
                  </el-col>

                  <!-- Event List Recurring -->
                  <el-col :lg="4">
                    <p>{{ $root.labels.event_recurring }}</p>
                  </el-col>

                </el-row>
              </el-col>

              <el-col :lg="13">
                <el-row :gutter="10" class="am-events-flex-row-middle-align">
                  <el-col :lg="0" :md="3">
                  </el-col>

                  <!-- Event List Booking Opens -->
                  <el-col :lg="6">
                    <p>{{ $root.labels.event_booking_opens }}</p>
                  </el-col>

                  <!-- Event List Booking Closes -->
                  <el-col :lg="6">
                    <p>{{ $root.labels.event_booking_closes }}</p>
                  </el-col>

                  <!--Event List Status -->
                  <el-col :lg="3">
                    <p>{{ $root.labels.status_colon }}</p>
                  </el-col>

                  <!--Event List Actions -->
                  <el-col v-if="canManage()" :lg="9">
                  </el-col>

                  <!-- Zoom Link (For Customer) -->
                  <el-col v-if="$root.settings.zoom.enabled && $root.settings.role === 'customer'" :lg="9">
                    <p>{{ $root.labels.zoom_join_link }}</p>
                  </el-col>
                  <!-- /Zoom Link (For Customer) -->

                </el-row>
              </el-col>

            </el-row>
          </div>

          <!-- Events List Content -->
          <div v-for="(evtDay, evtDateKey) in eventsDay">

            <!-- Events Day -->
            <div class="am-events-list-day-title">
              <el-row>
                <el-col :span="24">
                  <h2>

                    <!-- Events Checkbox For Day -->
                    {{ handleDateTimeFormat(evtDay.date + ' 00:00:00')[0] }}
                  </h2>
                </el-col>
              </el-row>
            </div>

            <!-- Events -->
            <div class="am-events-list">
              <div
                  v-for="(evt, index) in evtDay.events"
                  :key="index"
                  :name="evt.id"
                  class="am-event">
                <div class="am-event-data">
                  <el-row>
                    <el-col :lg="11">
                      <el-row :gutter="10" class="am-events-flex-row-middle-align">

                        <!-- Checkbox -->
                        <el-col :lg="7" :sm="7">
                          <span class="am-event-checkbox" @click.stop>
                              <!-- Time -->
                              <span class="am-event-time">
                                {{ handleDateTimeFormat(evt.periodStart)[1] }} - {{ handleDateTimeFormat(evt.periodEnd)[1] }}
                              </span>
                          </span>
                        </el-col>

                        <!-- Event Name -->
                        <el-col :lg="8" :sm="9">
                          <p class="am-col-title">{{ $root.labels.event_name }}</p>
                          <h4>
                            {{ evt.name }}
                            <span class="am-event-data-id"> ({{ $root.labels.id }}: {{ evt.id }})</span>
                          </h4>
                        </el-col>

                        <!-- Location -->
                        <el-col :lg="4" :sm="4" :xs="12" class="am-event-location">
                          <p class="am-col-title">{{ $root.labels.event_location }}</p>
                          <p><span class="am-semi-strong">{{ evt.location }}</span></p>
                        </el-col>

                        <!-- Spots -->
                        <el-col :lg="3" :sm="3" :xs="12">
                          <p class="am-col-title am-event-spots">{{ $root.labels.booked + ':' }}</p>
                          <div class="am-event-spots" :style="{display: 'flex', justifyContent: 'space-evenly'}">
                            <span class="am-semi-strong">{{ evt.maxCapacity - evt.places }} / {{ evt.maxCapacity }}</span>
                            <el-tooltip placement="top">
                              <div style='text-align: left;' v-html="ticketsTooltipContent(evt.customTickets)" slot="content"></div>
                              <img
                                  v-if="ticketsTooltipContent(evt.customTickets) !== ''"
                                  :src="$root.getUrl + 'public/img/am-package.svg'"
                              />
                            </el-tooltip>
                          </div>
                        </el-col>

                        <!-- Recurring -->
                        <el-col :lg="4" :sm="4" :xs="12">
                          <p class="am-col-title">{{ $root.labels.event_recurring }}</p>
                          <div class="am-event-recurring">
                            <p v-if="evt.recurring" class="am-recurring-label"><img
                                :src="$root.getUrl + 'public/img/loop.svg'"> {{ $root.labels.yes }}</p>
                            <p v-else>{{ $root.labels.no }}</p>
                          </div>
                        </el-col>

                      </el-row>
                    </el-col>

                    <el-col :lg="13">
                      <el-row :gutter="10" class="am-events-flex-row-middle-align">

                        <!-- Booking Opens -->
                        <el-col :lg="6" :sm="10" :xs="12">
                          <p class="am-col-title">{{ $root.labels.event_booking_opens }}</p>
                          <el-tooltip
                              class="item"
                              effect="dark"
                              content="Open"
                              placement="top"
                              :disabled="!evt.bookingOpens"
                          >
                            <p :class="{ 'am-event-open': evt.opened && evt.status === 'approved' }">
                              <span class="am-semi-strong">{{ handleDateTimeFormat(evt.bookingOpens ? evt.bookingOpens : evt.created)[0] }}</span>
                              @ <span class="am-semi-strong"> {{ handleDateTimeFormat(evt.bookingOpens ? evt.bookingOpens : evt.created)[1] }}</span>
                            </p>
                          </el-tooltip>
                        </el-col>

                        <!-- Booking Closes -->
                        <el-col :lg="6" :sm="10" :xs="12">
                          <p class="am-col-title">{{ $root.labels.event_booking_closes }}</p>
                          <el-tooltip
                              class="item"
                              effect="dark"
                              content="Closed"
                              placement="top"
                              :disabled="!evt.bookingCloses"
                          >
                            <p :class="{ 'am-event-closed': evt.closed && evt.status === 'approved' }">
                              <span class="am-semi-strong">{{ handleDateTimeFormat(evt.bookingCloses ? evt.bookingCloses : evt.periodStart)[0] }}</span>
                              @ <span class="am-semi-strong"> {{ handleDateTimeFormat(evt.bookingCloses ? evt.bookingCloses : evt.periodStart)[1] }}</span>
                            </p>
                          </el-tooltip>
                        </el-col>

                        <!-- Event Status -->
                        <el-col :lg="3" :sm="4" :xs="24">
                          <p class="am-col-title">{{ $root.labels.status_colon }}</p>
                          <span :class="'am-customer-status ' + getEventStatus(evt).class">
                            {{ getEventStatus(evt).label }}
                          </span>
                        </el-col>

                        <!-- Event Actions -->
                        <el-col v-if="canManage()" :lg="9" :sm="10" :xs="24" class="am-align-right">
                          <div class="am-event-actions" @click.stop>

                            <!-- View Attendees -->
                            <el-button @click="showDialogAttendees(evt.id)" v-if="canManage()" :disabled="!canManage()">
                              {{ $root.labels.event_attendees}}
                            </el-button>

                            <!-- Edit Button -->
                            <el-button @click="showDialogEditEvent(evt.id)" v-if="canManage()" :disabled="!canManage()">
                              {{ $root.labels.edit }}
                            </el-button>
                          </div>

                        </el-col>

                        <!-- Zoom Link (For Customer) -->
                        <el-col
                            v-if="$root.settings.role === 'customer' && $root.settings.zoom.enabled && evt.zoomMeeting"
                            :lg="9" :sm="10" :xs="24"
                            class="am-align-right"
                        >
                          <p class="am-col-title">{{ $root.labels.zoom_join_link }}</p>
                          <a class="am-link" style="float: left" :href="evt.zoomMeeting.joinUrl">{{
                            evt.zoomMeeting.joinUrl }}</a>
                        </el-col>
                        <!-- /Zoom Link (For Customer) -->

                      </el-row>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Button New -->
      <div id="am-button-new" class="am-button-new" v-if="canManage()">
        <el-button
            id="am-plus-symbol"
            type="primary"
            icon="el-icon-plus"
            @click="showDialogNewEvent">
        </el-button>
      </div>

      <!-- Dialog Event -->
      <transition name="slide">
        <el-dialog
            :close-on-click-modal="false"
            class="am-side-dialog am-dialog-event"
            :show-close="false"
            :visible.sync="dialogEvent"
            v-if="dialogEvent"

        >
          <dialog-event
              :event="event"
              :employees="options.entities.employees"
              :locations="options.entities.locations"
              :tags="options.entities.tags"
              :settings="options.entities.settings"
              @closeDialog="closeDialogEvent"
              @saveCallback="saveEventCallback"
              @showDialogTranslate="showDialogTranslate"
              @duplicateCallback="duplicateEventCallback"
          >
          </dialog-event>
        </el-dialog>
      </transition>


      <!-- Dialog Attendees -->
      <transition name="slide">
        <el-dialog
            :close-on-click-modal="false"
            class="am-side-dialog am-dialog-event"
            :show-close="false"
            :visible.sync="dialogAttendees"
            v-if="dialogAttendees && event && eventBookings"
        >
          <dialog-attendees
              :customTickets="event.customTickets"
              :eventBookings="eventBookings"
              :bookingCreatedCount="bookingCreatedCount"
              :options="options"
              :popperAppendToBody="true"
              @closeDialog="closeDialogAttendees"
              @updateAttendeesCallback="updateAttendeesCallback"
              @showDialogAttendee="showDialogAttendee"
              @openExportAttendeesDialog="dialogExport = true"
          >
          </dialog-attendees>
        </el-dialog>
      </transition>

      <DialogLite/>

      <!-- Dialog Attendee -->
      <transition name="slide">
        <el-dialog
            :close-on-click-modal="false"
            class="am-side-dialog am-dialog-event"
            :show-close="false"
            :visible.sync="dialogEventCustomFields"
            v-if="dialogEventCustomFields && event && eventBooking"
        >
          <dialog-attendee
              :customTickets="event.customTickets"
              :eventBooking="eventBooking"
              :eventCustomPricing="event.customPricing"
              :eventCustomerIds="eventCustomerIds"
              :eventBookMultipleTimes = "eventBookMultipleTimes"
              :eventMaxCapacity="event.maxCapacity"
              :eventId="event.id"
              :options="options"
              :customerCreatedCount="customerCreatedCount"
              @closeDialog="closeDialogAttendee"
              @showDialogNewCustomer="showDialogNewCustomer"
              @saveCallback="saveAttendeeCallback"
          >
          </dialog-attendee>
        </el-dialog>
      </transition>

      <!-- Dialog New Customer -->
      <transition name="slide">
        <el-dialog
            :close-on-click-modal="false"
            class="am-side-dialog"
            :visible.sync="dialogCustomer"
            :show-close="false"
            v-if="dialogCustomer">
          <dialog-customer
              :customer="customer"
              @closeDialog="dialogCustomer=false"
              @saveCallback="saveCustomerCallback"
          >
          </dialog-customer>
        </el-dialog>
      </transition>

      <el-form v-if="event && event.id" :action="exportAction" method="POST">
        <!-- Dialog Export -->
        <transition name="slide">
          <el-dialog
              :close-on-click-modal="false"
              class="am-side-dialog am-dialog-export"
              :visible.sync="dialogExport"
              :show-close="false"
              v-if="dialogExport"
          >
            <dialog-export
                :data="Object.assign(exportParams, {id: event.id})"
                :action="$root.getAjaxUrl + '/report/event/attendees'"
                @updateAction="(action) => {this.exportAction = action}"
                @closeDialogExport="dialogExport = false"
            >
            </dialog-export>
          </el-dialog>
        </transition>
      </el-form>

      <!-- Dialog Translate -->
      <transition name="slide">
        <el-dialog
          :close-on-click-modal="false"
          class="am-side-dialog am-dialog-translate am-edit"
          :show-close="true"
          :visible.sync="dialogTranslate"
          v-if="dialogTranslate"
        >
          <dialog-translate
            :passed-translations="event.translations"
            :name="event.name"
            :used-languages="options.entities.settings.general.usedLanguages"
            :all-languages-data="languagesData"
            :type="dialogTranslateType"
            :eventTickets="eventTickets"
            :tab="eventTickets && eventTickets.length ? 'tickets' : 'event'"
            @saveDialogTranslate="saveDialogTranslate"
            @closeDialogTranslate="dialogTranslate = false"
          >
          </dialog-translate>
        </el-dialog>
      </transition>

      <!-- Help Button -->
      <el-col :md="6" class="">
        <a class="am-help-button" href="https://wpamelia.com/events/" target="_blank">
          <i class="el-icon-question"></i> {{ $root.labels.need_help }}?
        </a>
      </el-col>

      <!-- <dialog-new-customize></dialog-new-customize> -->

    </div>
  </div>
</template>

<script>
  import liteMixin from '../../../js/common/mixins/liteMixin'
  import backendEventMixin from '../../../js/backend/mixins/eventMixin'
  import commonEventMixin from '../../../js/common/mixins/eventMixin'
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import DialogEvent from './DialogEvent'
  import DialogAttendees from './DialogAttendees'
  import DialogAttendee from './DialogAttendee'
  import durationMixin from '../../../js/common/mixins/durationMixin'
  import entitiesMixin from '../../../js/common/mixins/entitiesMixin'
  import Form from 'form-object'
  import helperMixin from '../../../js/backend/mixins/helperMixin'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import moment from 'moment'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import PageHeader from '../parts/PageHeader.vue'
  import DialogCustomer from '../customers/DialogCustomer.vue'
  import customerMixin from '../../../js/backend/mixins/customerMixin'
  import DialogExport from '../parts/DialogExport.vue'
  import DialogTranslate from '../parts/DialogTranslate'
  // import DialogNewCustomize from '../parts/DialogNewCustomize.vue'

  export default {
    mixins: [liteMixin, entitiesMixin, imageMixin, dateMixin, durationMixin, notifyMixin, helperMixin, backendEventMixin, commonEventMixin, customerMixin],

    data () {
      return {
        exportAction: '',
        exportParams: {
          fields: [
            {label: this.$root.labels.first_name, value: 'firstName', checked: true},
            {label: this.$root.labels.last_name, value: 'lastName', checked: true},
            {label: this.$root.labels.email, value: 'email', checked: true},
            {label: this.$root.labels.phone, value: 'phone', checked: true},
            {label: this.$root.labels.gender, value: 'gender', checked: true},
            {label: this.$root.labels.date_of_birth, value: 'birthday', checked: true},
            {label: this.$root.labels.payment_amount, value: 'paymentAmount', checked: true},
            {label: this.$root.labels.payment_status, value: 'paymentStatus', checked: true},
            {label: this.$root.labels.payment_method, value: 'paymentMethod', checked: true},
            {label: this.$root.labels.customer_note, value: 'note', checked: true},
            {label: this.$root.labels.event_book_persons, value: 'persons', checked: true},
            {label: this.$root.labels.event_book_status, value: 'status', checked: true},
            {label: this.$root.labels.event_book_tickets, value: 'tickets', checked: true},
            {label: this.$root.labels.custom_fields, value: 'customFields', checked: true}
          ]
        },
        dialogExport: false,
        event: null,
        eventBookings: null,
        eventBooking: null,
        clonedEventBooking: null,
        updateStatusDisabled: false,
        allEventsChecked: false,
        allDateEventsChecked: {},
        eventsDay: {},
        customer: null,
        customerCreatedCount: 0,

        dialogEvent: false,
        dialogCustomer: false,
        dialogAttendees: false,
        dialogEventCustomFields: false,

        fetched: false,
        fetchedFiltered: false,

        form: new Form(),
        params: {
          dates: this.getDatePickerInitRange(),
          search: ''
        },
        activeTab: 'event_details',

        showDeleteConfirmation: false,
        timer: null,
        toaster: false,
        count: {
          success: 0,
          error: 0
        },
        dialogTranslate: false,
        dialogTranslateType: 'name',
        eventTickets: null,
        languagesData: []
      }
    },

    created () {
      Form.defaults.axios = this.$http

      // Set filter params based on URL GET fields
      let urlParams = this.getUrlQueryParams(window.location.href)

      if (!('dateFrom' in urlParams) || !('dateTo' in urlParams)) {
        this.params.dates = this.getDatePickerInitRange()
      } else {
        this.params.dates = {
          start: moment(urlParams['dateFrom']).toDate(),
          end: moment(urlParams['dateTo']).toDate()
        }
      }

      this.getEventOptions(true)

      this.setInitialCustomers()
    },

    mounted () {
      if (this.$root.settings.payments.wc && this.$root.settings.payments.wc.enabled) {
        this.exportParams.fields.splice(8, 0, {label: this.$root.labels.wc_order_id, value: 'wcOrderId', checked: true})
      }
    },

    methods: {
      ticketsTooltipContent (tickets) {
        let content = 'Tickets: '

        for (let i = 0; i < tickets.length; i++) {
          content += tickets[i].sold !== 0 ? (tickets[i].name + ' x ' + tickets[i].sold + (tickets.length - 1 !== i ? ', ' : '')) : ''
        }
        if (content.charAt(content.length - 2) === ',') content = content.slice(0, content.length - 2)

        return content !== 'Tickets: ' ? content : ''
      },

      getEventMaxCapacity (tickets) {
        let capacity = 0
        tickets.forEach(ticket => {
          capacity += ticket.spots
        })
        return capacity
      },

      canManage () {
        return this.$root.settings.role !== 'customer' && (this.$root.settings.role === 'admin' || this.$root.settings.role === 'manager' || (this.$root.settings.role === 'provider' && this.$root.settings.roles.allowWriteEvents))
      },

      updateAttendeesCallback () {
        this.getEvents()
      },

      duplicateEventCallback (entity) {
        this.event = entity
        this.event.id = 0
        this.event.duplicated = true
        this.event.periods.forEach((period) => {
          period.googleCalendarEventId = null
          period.googleMeetUrl = null
          period.outlookCalendarEventId = null
        })

        setTimeout(() => {
          this.dialogEvent = true
        }, 300)
      },

      saveAttendeeCallback (response) {
        if (!('bookingStatusChanged' in response) || response.booking.persons !== this.clonedEventBooking.persons) {
          this.$http.post(`${this.$root.getAjaxUrl}/bookings/success/` + response.booking.id, {
            type: 'event',
            appointmentStatusChanged: response.appointmentStatusChanged,
            paymentId: 'paymentId' in response && response.paymentId ? response.paymentId : null
          }).then(response => {
          }).catch(e => {
          })
        }

        this.getEvents()
        this.getEvent(response.event.id)
      },

      showDialogNewCustomer () {
        this.customer = this.getInitCustomerObject()
        this.dialogCustomer = true
      },

      saveCustomerCallback (response) {
        delete response.user['birthday']

        this.options.entities.customers.push(response.user)
        this.customerCreatedCount++
      },

      saveEventCallback () {
        if (this.$root.settings.role !== 'provider') {
          this.$http.post(`${this.$root.getAjaxUrl}/settings`, {usedLanguages: this.options.entities.settings.general.usedLanguages})
            .catch((e) => {
              console.log(e)
            })
        }

        this.getEvents()
      },

      changeRange () {
        this.setDatePickerSelectedDaysCount(this.params.dates.start, this.params.dates.end)

        this.changeFilter()
      },

      changeFilter () {
        this.getEvents()
      },

      getEventOptions (fetchEvents) {
        this.options.fetched = false

        this.$http.get(`${this.$root.getAjaxUrl}/entities`, {
          params: this.getAppropriateUrlParams(
            {types: ['employees', 'settings']}
          )
        })
          .then(response => {
            if (this.$root.settings.role !== 'customer') {
              this.options.entities.settings.general.usedLanguages = response.data.data.settings.general.usedLanguages
            }

            this.options.entities.locations = response.data.data.locations
            this.options.entities.employees = response.data.data.employees
            this.options.entities.customFields = response.data.data.customFields
            this.options.entities.customers = response.data.data.customers
            this.options.entities.coupons = response.data.data.coupons
            this.languagesData = response.data.data.settings.languages

            this.fetched = true
            this.options.fetched = true

            let $this = this

            response.data.data.tags.forEach(function (eventTag) {
              if ($this.options.entities.tags.indexOf(eventTag.name) === -1) {
                $this.options.entities.tags.push(eventTag.name)
              }
            })

            if (fetchEvents) {
              this.getEvents()
            }
          })
          .catch(e => {
            console.log(e.message)
            this.fetched = true
            this.options.fetched = true
          })
      },

      getEvents () {
        this.fetchedFiltered = false

        let params = JSON.parse(JSON.stringify(this.params))
        let dates = []

        if (params.dates) {
          if (params.dates.start) {
            dates.push(moment(params.dates.start).format('YYYY-MM-DD'))
          }

          if (params.dates.end) {
            dates.push(moment(params.dates.end).format('YYYY-MM-DD'))
          }

          params.dates = dates
        }

        Object.keys(params).forEach((key) => (!params[key] && params[key] !== 0) && delete params[key])

        if (this.$root.settings.role === 'provider' && this.$root.settings.roles.allowWriteEvents) {
          params.providers = this.options.entities.employees.map(employee => employee.id)
        }

        let $this = this

        this.$http.get(`${this.$root.getAjaxUrl}/events`, {
          params: this.getAppropriateUrlParams(params)
        })
          .then(response => {
            let eventsDay = {}

            response.data.data.events.forEach(function (event) {
              event.periods.forEach(function (eventPeriod) {
                let startDate = moment(eventPeriod.periodStart, 'YYYY-MM-DD HH:mm:ss')
                let endDate = moment(eventPeriod.periodEnd, 'YYYY-MM-DD HH:mm:ss')

                while (startDate.isBefore(endDate)) {
                  let dateString = startDate.format('YYYY-MM-DD')

                  if (!(dateString in eventsDay)) {
                    eventsDay[dateString] = {
                      date: dateString,
                      events: []
                    }
                  }

                  if (event.customTickets.length && event.customPricing) {
                    event.maxCapacity = event.maxCustomCapacity ? event.maxCustomCapacity : $this.getEventMaxCapacity(event.customTickets)
                    event.places = event.maxCapacity
                    event.customTickets.forEach(ticket => {
                      event.places -= ticket.sold
                    })
                  }

                  if (event.full) event.status = 'full'
                  else if (event.upcoming) event.status = 'upcoming'
                  let location = event.customLocation ? event.customLocation : (event.locationId ? $this.options.entities.locations.find(l => l.id === event.locationId).name : null)
                  eventsDay[dateString].events.push({
                    id: event.id,
                    name: event.name,
                    periodStart: eventPeriod.periodStart,
                    periodEnd: eventPeriod.periodEnd,
                    bookingOpens: event.bookingOpens,
                    bookingCloses: event.bookingCloses,
                    location: location,
                    recurring: event.recurring,
                    maxCapacity: event.maxCapacity,
                    status: event.status,
                    places: event.places,
                    created: event.created,
                    opened: event.opened,
                    closed: event.closed,
                    checked: false,
                    zoomMeeting: eventPeriod.zoomMeeting,
                    translations: event.translations,
                    customTickets: event.customTickets
                  })

                  startDate.add(1, 'days')
                }
              })
            })

            let dateKeys = Object.keys(eventsDay)

            dateKeys.sort((date1, date2) => {
              if (date1 < date2) {
                return -1
              } else if (date1 > date2) {
                return 1
              } else {
                return 0
              }
            })

            let sortedEvents = {}

            dateKeys.forEach((dateString) => {
              sortedEvents[dateString] = eventsDay[dateString]
            })

            this.eventsDay = sortedEvents
            this.fetched = true
            this.fetchedFiltered = true
          })
          .catch(e => {
            console.log(e.message)
            this.fetched = true
            this.fetchedFiltered = true
          })
      },

      closeDialogAttendees () {
        this.dialogAttendees = false
      },

      handleDateTimeFormat (dateTime) {
        return [
          this.getFrontedFormattedDate(dateTime.split(' ')[0]),
          this.getFrontedFormattedTime(dateTime.split(' ')[1])
        ]
      },

      showDialogAttendee (eventBooking) {
        this.eventBooking = eventBooking
        this.clonedEventBooking = JSON.parse(JSON.stringify(eventBooking))
        this.dialogEventCustomFields = true
      },

      closeDialogAttendee () {
        this.dialogEventCustomFields = false
      },

      showDialogTranslate (type, tickets) {
        this.dialogTranslateType = type
        this.eventTickets = tickets
        this.dialogTranslate = true
      },

      saveDialogTranslate (translations, newLanguages, tab, options, tickets) {
        this.options.entities.settings.general.usedLanguages = this.options.entities.settings.general.usedLanguages.concat(newLanguages)

        if (tab === 'tickets') {
          this.eventTickets.forEach((item, index) => {
            item.translations = tickets[index].translations
          })
        } else {
          this.event.translations = translations
        }

        this.dialogTranslate = false
      }
    },

    computed: {
      filterApplied () {
        return !!this.params.search || !!this.params.dates.start || !!this.params.dates.end
      },
      eventCustomerIds () {
        return this.eventBookings.map(event => event.customerId)
      },
      eventBookMultipleTimes () {
        return this.event.bookMultipleTimes
      }
    },

    watch: {
      'params.search' () {
        if (typeof this.params.search !== 'undefined') {
          this.fetchedFiltered = false
          clearTimeout(this.timer)
          this.timer = setTimeout(this.changeFilter, 500)
        }
      }
    },

    components: {
      DialogCustomer,
      PageHeader,
      DialogExport,
      DialogEvent,
      DialogAttendees,
      DialogAttendee,
      DialogTranslate,
      // DialogNewCustomize
    }
  }
</script>
