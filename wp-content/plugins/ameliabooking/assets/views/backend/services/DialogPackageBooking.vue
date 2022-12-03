<template>
  <div>

    <!-- Dialog Loader -->
    <div class="am-dialog-loader" v-show="dialogLoading">
      <div class="am-dialog-loader-content">
        <img :src="$root.getUrl+'public/img/spinner.svg'" class=""/>
        <p>{{ $root.labels.loader_message }}</p>
      </div>
    </div>

    <!-- Dialog Content -->
    <div class="am-dialog-scrollable" v-if="!dialogLoading">

      <!-- Dialog Header -->
      <div v-if="showHeader" class="am-dialog-header">
        <el-row>
          <el-col :span="18">
            <h2>{{ $root.labels.new_package_booking }}</h2>
          </el-col>
          <el-col :span="6" class="align-right">
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Form -->
      <el-form v-if="mounted" :model="packageBooking" ref="packageBooking" :rules="rules" label-position="top" @submit.prevent="onSubmit">
          <!-- Customer -->
          <el-form-item
            v-if="showCustomer"
            :label="$root.labels.customer + ':'"
            prop="customers"
          >
            <el-select
              v-model="packageBooking.customers"
              class="no-tags"
              remote
              filterable
              collapse-tags
              value-key="id"
              :loading="loadingCustomers"
              :placeholder="$root.labels.select_customer"
              :popper-class="'am-dropdown-cabinet'"
              :remote-method="searchExistingCustomers"
              @change="clearValidation()"
            >
              <div class="am-drop">
                <div
                  v-if="this.$root.settings.additionalCapabilities.canWriteCustomers"
                  class="am-drop-create-item"
                  @click="showDialogNewCustomer"
                >
                  {{ $root.labels.create_new }}
                </div>
                <el-option
                  v-for="user in filteredCustomers"
                  :key="user.id"
                  :label="(!user.firstName.trim() && !user.lastName.trim() ? $root.labels.customer + ' ' + user.id : user.firstName + ' ' + user.lastName)"
                  :value="user"
                  class="am-has-option-meta"
                >
                  <span :class="{'am-drop-item-name': user.email}">
                    {{ !user.firstName.trim() && !user.lastName.trim() ? $root.labels.customer + ' ' + user.id : '' }} {{ `${user.firstName} ${user.lastName}` }}
                  </span>
                  <span
                    v-if="user.email"
                    class="am-drop-item-meta"
                  >
                    {{ user.email }}
                  </span>
                </el-option>
                <el-option
                  v-if="filteredCustomers.length === 0"
                  v-for="user in [{customer: {id: 0, firstName: '', lastName: '', email: '', info: JSON.stringify({firstName: '', lastName: '', email: '', phone: ''})}}]"
                  :key="user.id"
                  :label="!user.firstName.trim() && !user.lastName.trim() ? $root.labels.customer + ' ' + user.id : user.firstName + ' ' + user.lastName"
                  :style="{'display': 'none'}"
                  :value="user"
                  class="am-has-option-meta"
                >
                </el-option>
              </div>
            </el-select>
          </el-form-item>


          <!-- Notify Participants -->
          <el-form-item v-if="this.$root.settings.role !== 'customer'">
            <el-checkbox
              v-model="notifyParticipants"
              @change="clearValidation()"
            >
              {{ $root.labels.notify_customer }}
              <el-tooltip placement="top">
                <div slot="content" v-html="$root.labels.notify_customers_package_tooltip"></div>
                <i class="el-icon-question am-tooltip-icon"></i>
              </el-tooltip>
            </el-checkbox>
          </el-form-item>

      </el-form>
    </div>

    <!-- Dialog Actions -->
    <dialog-actions
      v-if="!dialogLoading && this.$root.settings.role !== 'customer'"
      formName="packageBooking"
      urlName="packages/customers"
      :isNew="true"
      :entity="passedPackage"
      :getParsedEntity="getParsedEntity"
      @errorCallback="errorCallback"
      :haveSaveConfirmation="false"
      :hasIcons="true"

      :action="{
        haveAdd: true,
        haveEdit: true,
        haveStatus: false,
        haveRemove: $root.settings.capabilities.canDelete === true,
        haveRemoveEffect: false,
        haveDuplicate: false,
        haveSaveWarning: false
      }"

      :message="{
        success: {
          save: $root.labels.package_booking_saved,
          remove: '',
          show: '',
          hide: ''
        },
        confirm: {
          remove: '',
          show: '',
          hide: '',
          duplicate: '',
          save: ''
        }
      }"
    >
    </dialog-actions>

  </div>
</template>

<script>
  import formsCustomizationMixin from '../../../js/common/mixins/formsCustomizationMixin'
  import appointmentPriceMixin from '../../../js/backend/mixins/appointmentPriceMixin'

  import dateMixin from '../../../js/common/mixins/dateMixin'
  import DialogActions from '../parts/DialogActions.vue'

  import entitiesMixin from '../../../js/common/mixins/entitiesMixin'
  import helperMixin from '../../../js/backend/mixins/helperMixin'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import priceMixin from '../../../js/common/mixins/priceMixin'

  import windowMixin from '../../../js/backend/mixins/windowMixin'
  import customerMixin from '../../../js/backend/mixins/customerMixin'

  import packageMixin from "../../../js/frontend/mixins/packageMixin";
  import moment from "moment";

  export default {

    mixins: [
      customerMixin,
      entitiesMixin,
      imageMixin,
      dateMixin,
      notifyMixin,
      priceMixin,
      appointmentPriceMixin,
      helperMixin,
      windowMixin,
      formsCustomizationMixin,
      packageMixin
    ],

    props: {
      passedPackage: null,
      options: null,
      customerCreatedCount: 0,
      showHeader: {
        required: false,
        default: true,
        type: Boolean
      },
      newUser: null
    },

    data () {
      return {
        packageBooking: null,
        notifyParticipants: true,
        filteredCustomers: [],
        customers: [],
        rules: {
          customers: [
            {required: true, message: this.$root.labels.select_a_customer_warning, trigger: 'submit'},
          ]
        },
        mounted: false,
        dialogLoading: true,
        statusMessage: '',
        loadingTimeSlots: false,
        payment: {
          amount: 0,
          gateway: 'onSite'
        },
      }
    },

    mounted () {
      this.setInitialCustomers()
      this.filteredCustomers = JSON.parse(JSON.stringify(this.options.entities.customers))
      this.packageBooking = {customers: []}
      this.instantiateDialog()
    },

    methods: {
      searchExistingCustomers (query) {
        if (query) {
          this.searchCustomers(query, this.setFilteredCustomers)
        } else {
          setTimeout(() => {
            clearTimeout(this.searchCustomersTimer)
            this.setFilteredCustomers(false)
          }, 500)
        }
      },

      setFilteredCustomers (haveQuery) {
        this.filteredCustomers = this.searchedCustomers

        if (typeof haveQuery !== 'undefined' && !haveQuery) {
          this.filteredCustomers = this.options.entities.customers
        }
      },

      editPayment (obj) {
        this.$emit('editPayment', obj)
      },

      instantiateDialog () {
        this.dialogLoading = false
        this.mounted = true
      },

      closeDialog () {
        this.$emit('closeDialog')
      },

      getParsedEntity () {
        let packageRules = []
        this.passedPackage.bookable.forEach((bookable) => {
          packageRules.push({
            serviceId: bookable.service.id,
            providerId: bookable.providerId ? bookable.providerId : null,
            locationId: bookable.locationId ? bookable.locationId : null
          })
        })
        return {
          'packageId': this.passedPackage.id,
          'customerId': this.packageBooking.customers.id,
          'rules': packageRules,
          'notify': this.notifyParticipants
        }
      },

      showDialogNewCustomer () {
        this.$emit('showDialogNewCustomer')
      },

      clearValidation () {
        if (typeof this.$refs.packageBooking !== 'undefined') {
          this.$refs.packageBooking.clearValidate()
        }
      },

      errorCallback (responseData) {
        let $this = this

        setTimeout(function () {
          if ('timeSlotUnavailable' in responseData && responseData.timeSlotUnavailable === true) {
            $this.notify($this.$root.labels.error, $this.$root.labels.time_slot_unavailable, 'error')
            $this.getTimeSlots($this.updateCalendar)
          }

          if ('packageBookingUnavailable' in responseData && responseData.packageBookingUnavailable === true) {
            $this.notify($this.$root.labels.error, $this.$root.labels.package_booking_unavailable, 'error')
            $this.getTimeSlots($this.updateCalendar)
          }
        }, 200)
      },

    },

    computed: {
      showCustomer () {
        return this.$root.settings.role !== 'customer'
      }
    },

    watch: {
      'customerCreatedCount' () {
        if (this.newUser) {
          this.filteredCustomers.push(this.newUser)
          this.packageBooking.customers = this.newUser
          this.clearValidation()
        }
      }
    },

    components: {
      DialogActions
    }
  }
</script>
