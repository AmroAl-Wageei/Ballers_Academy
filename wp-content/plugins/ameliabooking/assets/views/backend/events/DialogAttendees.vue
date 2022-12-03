<template>
  <div class="am-dialog-attendees-inner">

    <!-- Dialog Loader -->
    <div class="am-dialog-loader" v-show="dialogLoading">
      <div class="am-dialog-loader-content">
        <img :src="$root.getUrl + 'public/img/spinner.svg'" class=""/>
        <p>{{ $root.labels.loader_message }}</p>
      </div>
    </div>

    <!-- Dialog Content -->
    <div class="am-dialog-scrollable" v-if="bookings && !dialogLoading">

      <!-- Dialog Header -->
      <div v-if="showHeader" class="am-dialog-header" style="border-bottom: none;">
        <el-row>
          <el-col :span="18">
            <h2>{{ $root.labels.event_attendees }}</h2>
          </el-col>
          <el-col :span="6" class="align-right">
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close">
            </el-button>
          </el-col>
        </el-row>
      </div>

      <el-button
          v-if="writeEvents" @click="addAttendee" size="large" type="primary"
          class="am-dialog-create" style="width: 100%"
      >
        <i class="el-icon-plus"></i> <span class="button-text">{{ $root.labels.event_add_attendee }}</span>
      </el-button>

      <!-- Search -->
      <div class="am-search">
        <el-row :gutter="10">
          <el-col :lg="showExport ? 20 : 24">
            <el-input
                v-model="search"
                class=""
                :placeholder="$root.labels.event_attendees_search"
                @input="searchAttendees()"
            >
            </el-input>
          </el-col>

          <el-col v-if="showExport" :lg="4">
            <!-- Export -->
            <el-tooltip placement="top">
              <div slot="content" v-html="$root.labels.export_tooltip_attendees"></div>
              <el-button
                  class="button-export am-button-icon"
                  @click="openExportAttendeesDialog"
              >
                <img class="svg-amelia" :alt="$root.labels.export" :src="$root.getUrl+'public/img/export.svg'"/>
              </el-button>
            </el-tooltip>
          </el-col>
        </el-row>
      </div>

      <div v-if="bookings.length === 0" class="am-empty-state am-section">
        <img :src="$root.getUrl + 'public/img/emptystate.svg'">
        <h2>{{ $root.labels.no_attendees_yet }}</h2>
      </div>

      <div v-show="!hasResult && bookings.length > 0" class="am-empty-state am-section">
        <img :src="$root.getUrl + 'public/img/emptystate.svg'">
        <h2>{{ $root.labels.no_results }}</h2>
      </div>

      <!-- Attendees -->
      <div class="am-attendees">
        <el-collapse>
          <el-collapse-item
              v-for="(booking, index) in bookings"
              v-show="booking.show"
              :key="index"
              :name="booking.id"
              class="am-attendee">
            <template slot="title">
              <div class="am-attendee-data" style="width: 100%">
                <el-row :gutter="10">
                  <el-col v-if="$root.settings.capabilities.canDelete === true" :sm="2">
                    <span class="am-attendee-checkbox" @click.stop>
                      <el-checkbox
                          v-if="$root.settings.capabilities.canDelete === true"
                          v-model="booking.checked">
                      </el-checkbox>
                    </span>
                  </el-col>
                  <el-col :sm="$root.settings.capabilities.canDelete === true ? 17 : 19">
                    <div class="am-attendee-name">
                      <h3>
                        {{ ((user = getCustomer(booking)) !== null ? user.firstName + ' ' + user.lastName : '') +
                        (booking.token ? ' (' + booking.token.substring(0, 5) + ')' : '') }}
                        <span v-if="booking.persons > 1" class="am-attendees-plus">+{{ booking.persons - 1 }}</span>
                      </h3>
                      <a class="am-attendee-email" :href="`mailto:${booking.customer.email}`">{{ booking.customer.email }}</a>
                      <a class="am-attendee-phone" :href="`tel:${((user = getCustomer(booking)) !== null ? user.phone : '')}`">{{ ((user = getCustomer(booking)) !== null ? user.phone : '') }}</a>
                      <span
                        class="am-attendees-plus"
                        :style="{ marginLeft: 0}"
                        v-if="customTickets.length"
                        v-for="ticket in booking.ticketsData"
                      >
                        {{ getTicketsSoldString(ticket) }}
                      </span>
                    </div>
                  </el-col>
                  <el-col :sm="5">
                    <div class="am-appointment-status small">
                      <span class="am-appointment-status-symbol"
                            :class="booking.status === 'rejected' ? 'canceled' : booking.status"></span>
                      <el-select
                          v-model="booking.status"
                          :popper-append-to-body="popperAppendToBody"
                          :disabled="!writeEvents"
                          @change="updateBookingStatus(booking)"
                      >
                        <el-option
                            v-for="item in statuses"
                            :key="item.value"
                            :value="item.value">
                          <span class="am-appointment-status-symbol"
                                :class="item.value === 'rejected' ? 'canceled' : item.value"></span>
                        </el-option>
                      </el-select>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </template>
            <div class="am-attendee-collapse">
              <el-row :gutter="10" v-if="booking.payments.length">
                <el-col :span="6">
                  <span>{{ $root.labels.payment }}</span>
                </el-col>
                <el-col :span="18" v-if="booking.payments.length">
                  <p>
                    <img class="svg-amelia" :style="{width: getPaymentIconWidth(booking.payments[0].gateway)}"
                         :src="$root.getUrl + 'public/img/payments/' + booking.payments[0].gateway + '.svg'"/>
                    {{ getPaymentGatewayNiceName(booking.payments[0].gateway) }}
                  </p>
                </el-col>
              </el-row>
              <el-row :gutter="10" v-if="booking.payments.length">
                <el-col :span="6" v-if="booking.payments[0].wcOrderUrl">
                  <span>{{ $root.labels.wc_order }}:</span>
                </el-col>
                <el-col :span="18" v-if="booking.payments[0].wcOrderUrl">
                  <a :href="booking.payments[0].wcOrderUrl" target="_blank">
                    #{{ booking.payments[0].wcOrderId }}
                  </a>
                </el-col>
              </el-row>
              <el-row :gutter="10">
                <el-col :span="12">
                  <div class="">
                    <el-button
                        :loading="booking.removing"
                        @click="removeAttendee(index)">
                      {{ $root.labels.event_attendee_remove }}
                    </el-button>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="">
                    <el-button
                        v-if="writeEvents"
                        @click="editAttendee(index)">
                      {{ $root.labels.event_edit_attendee }}
                    </el-button>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

    </div>

    <!-- Dialog Actions -->
    <transition name="slide-vertical">
      <div v-show="!dialogLoading && bookings.length > 0 && bookings.filter(booking => booking.checked).length > 0">
        <div class="am-dialog-footer">
          <div class="am-dialog-footer-actions">
            <el-row>
              <el-col :sm="12" class="align-left">
                <el-button
                    class="am-button-icon"
                    @click="showDeleteConfirmation = !showDeleteConfirmation">
                  <img class="svg-amelia" :alt="$root.labels.delete" :src="$root.getUrl+'public/img/delete.svg'"/>
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </transition>

    <!-- Dialog Delete Confirmation -->
    <transition name="slide-vertical">
      <div class="am-dialog-confirmation" v-show="!dialogLoading && showDeleteConfirmation">
        <h3>{{ bookings.filter(booking => booking.checked).length > 1 ? $root.labels.confirm_delete_attendees :
          $root.labels.confirm_delete_attendee }}</h3>
        <div class="align-left">
          <el-button size="small" @click="showDeleteConfirmation = !showDeleteConfirmation">
            {{ $root.labels.cancel }}
          </el-button>
          <el-button size="small" @click="removeAttendees" type="primary">
            {{ $root.labels.delete }}
          </el-button>
        </div>
      </div>
    </transition>

  </div>

</template>

<script>
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import deleteMixin from '../../../js/backend/mixins/deleteMixin'
  import entitiesMixin from '../../../js/common/mixins/entitiesMixin'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import paymentMixin from '../../../js/backend/mixins/paymentMixin'

  export default {

    mixins: [
      imageMixin,
      dateMixin,
      entitiesMixin,
      paymentMixin,
      notifyMixin,
      deleteMixin
    ],

    props: {
      customTickets: null,
      options: null,
      eventBookings: null,
      bookingCreatedCount: 0,
      newBooking: null,
      showHeader: {
        required: false,
        default: true,
        type: Boolean
      },
      showExport: {
        required: false,
        default: true,
        type: Boolean
      },
      writeEvents: {
        type: Boolean,
        default: true,
        required: false
      },
      popperAppendToBody: {
        type: Boolean,
        default: true,
        required: false
      }
    },

    data () {
      return {
        dialogExport: false,
        bookings: [],
        name: 'events/bookings',
        successMessage: {
          single: this.$root.labels.event_attendee_deleted,
          multiple: this.$root.labels.event_attendees_deleted
        },
        errorMessage: {
          single: this.$root.labels.event_attendee_not_deleted,
          multiple: this.$root.labels.event_attendees_not_deleted
        },
        search: '',
        hasResult: true,
        dialogLoading: true,
        showDeleteConfirmation: false,
        statuses: [
          {
            value: 'approved',
            label: this.$root.labels.approved
          },
          {
            value: 'rejected',
            label: this.$root.labels.rejected
          }
        ]
      }
    },

    methods: {
      getInitAttendeeObject () {
        return {
          id: 0,
          customer: null,
          status: 'approved',
          persons: 1,
          added: false,
          info: null,
          aggregatedPrice: true,
          customFields: {}
        }
      },

      addAttendee () {
        this.$emit('showDialogAttendee', this.getInitAttendeeObject())
      },

      updateBookingStatus (booking) {
        this.$http.post(`${this.$root.getAjaxUrl}/events/bookings/` + booking.id, {
          status: booking.status,
          bookings: [{status: booking.status}]
        }).then(() => {
          this.notify(this.$root.labels.success, this.$root.labels.event_status_changed + (this.$root.labels[booking.status]).toLowerCase(), 'success')
        }).catch(e => {
          this.notify(this.$root.labels.error, e.message, 'error')
        })
      },

      getCustomer (booking) {
        return booking.info ? JSON.parse(booking.info) : booking.customer
      },

      getTicketsSoldString (bookedTicket) {
        let ticketName = this.customTickets.filter(ticket => ticket.id === bookedTicket.eventTicketId)[0].name
        return bookedTicket.persons + ' x ' + ticketName
      },

      instantiateDialog () {
        if (this.eventBookings) {
          this.bookings = this.eventBookings
          this.bookings.tickets = []
          this.dialogLoading = false
        }
      },

      closeDialog () {
        this.$emit('closeDialog')
      },

      removeAttendee (index) {
        let $this = this
        let deletedSuccessIds = []

        this.bookings[index].removing = true

        this.deleteEntities(
          [this.bookings[index].id],
          function () {
            setTimeout(function () {
              for (let i = $this.bookings.length - 1; i >= 0; i--) {
                if (deletedSuccessIds.indexOf($this.bookings[i].id) !== -1) {
                  $this.bookings.splice(i, 1)
                }
              }

              $this.$emit('updateAttendeesCallback')

              if ($this.bookings.length === 0) {
                $this.$emit('closeDialog')
              }
            }, 500)
          },
          function (id) {
            deletedSuccessIds.push(id)
          },
          function (id) {
          }
        )
      },

      editAttendee (index) {
        this.$emit('showDialogAttendee', this.bookings[index])
      },

      removeAttendees () {
        let $this = this
        let deletedSuccessIds = []

        $this.dialogLoading = true
        $this.showDeleteConfirmation = false

        this.deleteEntities(
          $this.bookings.filter(booking => booking.checked).map(booking => booking.id),
          function () {
            setTimeout(function () {
              for (let i = $this.bookings.length - 1; i >= 0; i--) {
                if (deletedSuccessIds.indexOf($this.bookings[i].id) !== -1) {
                  $this.bookings.splice(i, 1)
                }
              }

              $this.dialogLoading = false

              $this.$emit('updateAttendeesCallback')

              if ($this.bookings.length === 0) {
                $this.$emit('closeDialog')
              }
            }, 500)
          },
          function (id) {
            deletedSuccessIds.push(id)
          },
          function (id) {
          }
        )
      },

      searchAttendees () {
        let $this = this

        this.bookings.forEach(function (booking) {
          booking.show = (booking.customer.firstName.toLowerCase().startsWith($this.search.toLowerCase()) ||
            booking.customer.lastName.toLowerCase().startsWith($this.search.toLowerCase()) ||
            (booking.customer.firstName + ' ' + booking.customer.lastName).toLowerCase().startsWith($this.search.toLowerCase()) ||
            (booking.customer.lastName + ' ' + booking.customer.firstName).toLowerCase().startsWith($this.search.toLowerCase()) ||
            (booking.customer.email !== null && booking.customer.email.toLowerCase().startsWith($this.search.toLowerCase())) ||
            (booking.customer.phone !== null && booking.customer.phone.toLowerCase().startsWith($this.search.toLowerCase())) ||
            (booking.token !== null ? booking.token.toLowerCase().substring(0, 5).startsWith($this.search.toLowerCase()) : false)
          )
        })

        this.hasResult = this.bookings.filter(booking => booking.show === true).length > 0
      },

      openExportAttendeesDialog () {
        this.$emit('openExportAttendeesDialog')
      }
    },

    mounted () {
      this.instantiateDialog()
    },

    watch: {
      'bookingCreatedCount' () {
        this.bookings = this.eventBookings

        this.bookings.sort(function (a, b) {
          return (a.customer.firstName + ' ' + a.customer.lastName).localeCompare((b.customer.firstName + ' ' + b.customer.lastName))
        })

        this.hasResult = true
        this.search = ''
      }
    }
  }
</script>

