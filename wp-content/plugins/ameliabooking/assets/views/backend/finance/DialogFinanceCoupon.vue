<template>
  <div>

    <!-- Dialog Loader -->
    <div class="am-dialog-loader" v-show="dialogLoading">
      <div class="am-dialog-loader-content">
        <img :src="$root.getUrl+'public/img/spinner.svg'" class="">
        <p>{{ $root.labels.loader_message }}</p>
      </div>
    </div>

    <!-- Dialog Content -->
    <div class="am-dialog-scrollable" :class="{'am-edit':coupon.id !== 0}" v-if="!dialogLoading">

      <!-- Dialog Header -->
      <div class="am-dialog-header">
        <el-row>
          <el-col :span="18">
            <h2 v-if="coupon.id !== 0">{{ $root.labels.edit_coupon }}</h2>
            <h2 v-else>{{ $root.labels.new_coupon }}</h2>
          </el-col>
          <el-col :span="6" class="align-right">
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Form -->
      <el-form :model="coupon" ref="coupon" :rules="rules" label-position="top" @submit.prevent="onSubmit">

        <el-tabs v-model="couponTabs">
          <!-- Details -->
          <el-tab-pane :label="$root.labels.details" name="details">
            <!-- Code -->
            <el-form-item label="placeholder" prop="code">
              <label slot="label">
                {{ $root.labels.code }}:
                <el-tooltip placement="top">
                  <div slot="content" v-html="$root.labels.code_tooltip"></div>
                  <i class="el-icon-question am-tooltip-icon"></i>
                </el-tooltip>
              </label>
              <el-input v-model="coupon.code" :placeholder="$root.labels.code" @input="clearValidation()"></el-input>
            </el-form-item>

            <!-- Discount & Deduction -->
            <el-row :gutter="20">

              <el-col :span="12">
                <el-form-item :label="$root.labels.discount + ':'" prop="discount">
                  <el-input-number
                      v-model="coupon.discount"
                      :min="0"
                      :max="100"
                      @input="clearValidation()"
                  >
                  </el-input-number>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item :label="$root.labels.deduction + ' (' + getCurrencySymbol() + '):'" prop="deduction">
                  <el-input-number v-model="coupon.deduction" :min="0" @input="clearValidation()"></el-input-number>
                </el-form-item>

              </el-col>
            </el-row>

            <!-- Usage Limit -->
            <el-form-item label="placeholder" prop="limit">
              <label slot="label">
                {{ $root.labels.usage_limit }}:
                <el-tooltip placement="top">
                  <div slot="content" v-html="$root.labels.usage_limit_tooltip"></div>
                  <i class="el-icon-question am-tooltip-icon"></i>
                </el-tooltip>
              </label>
              <el-input-number
                  v-model="coupon.limit"
                  :min="0"
                  :max="10000000000000"
                  @input="clearValidation()"
                  @change="limitChanged"
              >
              </el-input-number>
            </el-form-item>

            <!-- Usage Limit -->
            <el-form-item label="placeholder" prop="customerLimit" v-if="coupon.limit >= 100">
              <label slot="label">
                {{ $root.labels.usage_customer_limit }}:
                <el-tooltip placement="top">
                  <div slot="content" v-html="$root.labels.usage_customer_limit_tooltip"></div>
                  <i class="el-icon-question am-tooltip-icon"></i>
                </el-tooltip>
              </label>
              <el-input-number
                  v-model="coupon.customerLimit"
                  :min="0"
                  :max="coupon.limit"
                  @input="clearValidation()"
              >
              </el-input-number>
            </el-form-item>

            <!-- Minimum Time Prior to Booking -->
            <el-form-item label="placeholder" v-if="coupon.limit < 100">
              <label slot="label">
                {{ $root.labels.usage_customer_limit }}:
                <el-tooltip placement="top">
                  <div slot="content" v-html="$root.labels.usage_customer_limit_tooltip"></div>
                  <i class="el-icon-question am-tooltip-icon"></i>
                </el-tooltip>
              </label>
              <el-select v-model="coupon.customerLimit">
                <el-option
                    :key="0"
                    :label="$root.labels.unlimited"
                    :value="0">
                </el-option>
                <el-option
                    v-for="value in coupon.limit"
                    :key="value"
                    :label="value"
                    :value="value">
                </el-option>
              </el-select>
            </el-form-item>

            <!-- Expiration Date -->
            <el-form-item label="placeholder">
              <label slot="label">
                {{ $root.labels.expiration_date }}:
              </label>
              <v-date-picker
                  v-model="coupon.expirationDate"
                  clearable
                  mode='single'
                  popover-visibility="focus"
                  popover-direction="top"
                  :show-day-popover=false
                  :input-props='{class: "el-input__inner", readOnly: "readonly"}'
                  :disabled=false
                  :is-required=false
                  :formats="vCalendarFormats"
              >
              </v-date-picker>
              <span
                v-if="coupon.expirationDate"
                class="am-v-date-picker-suffix el-input__suffix-inner"
                @click="coupon.expirationDate = null"
                :disabled="!coupon.expirationDate"
              >
                <i class="el-select__caret el-input__icon el-icon-circle-close"></i>
              </span>
            </el-form-item>

            <!-- Services -->
            <el-form-item label="placeholder" v-if="services.length > 0" prop="services">
              <label slot="label">
                {{ $root.labels.services }}:
                <el-tooltip placement="top">
                  <div slot="content" v-html="$root.labels.services_tooltip"></div>
                  <i class="el-icon-question am-tooltip-icon"></i>
                </el-tooltip>
              </label>
              <el-select
                  v-model="coupon.serviceList"
                  value-key="id"
                  filterable
                  multiple
                  :placeholder="$root.labels.select_service"
                  collapse-tags
                  @change="clearValidation()"

              >
                <div class="am-drop-parent"
                     @click="allServicesSelection"
                >
                  <span>{{ $root.labels.select_all_services }}</span>
                </div>
                <el-option
                    v-for="item in services"
                    :key="item.id"
                    :label="item.name"
                    :value="item">
                </el-option>
              </el-select>
            </el-form-item>

            <!-- Events -->
            <el-form-item label="placeholder" v-if="events.length > 0" prop="events">
              <label slot="label">
                {{ $root.labels.events }}:
                <el-tooltip placement="top">
                  <div slot="content" v-html="$root.labels.events_tooltip"></div>
                  <i class="el-icon-question am-tooltip-icon"></i>
                </el-tooltip>
              </label>
              <el-select
                  v-model="coupon.eventList"
                  value-key="id"
                  filterable
                  multiple
                  :placeholder="$root.labels.select_event"
                  collapse-tags
                  @change="clearValidation()"

              >
                <div class="am-drop-parent"
                     @click="allEventsSelection"
                >
                  <span>{{ $root.labels.select_all_events }}</span>
                </div>
                <el-option
                    v-for="item in events"
                    :key="item.id"
                    :label="item.name + ( item.periods && item.periods.length ? ' (' + getFrontedFormattedDate(item.periods[0].periodStart.split(' ')[0]) + ')' : '')"
                    :value="item">
                </el-option>
              </el-select>
            </el-form-item>
          </el-tab-pane>

          <!-- Notifications -->
          <el-tab-pane :label="$root.labels.notifications" name="notifications">
            <!-- Send Interval -->
            <el-form-item label="placeholder" prop="notificationInterval">
              <label slot="label">
                {{ $root.labels.send_interval }}:
                <el-tooltip placement="top">
                  <div slot="content" v-html="$root.labels.send_interval_tooltip"></div>
                  <i class="el-icon-question am-tooltip-icon"></i>
                </el-tooltip>
              </label>
              <el-input-number
                  v-model="coupon.notificationInterval"
                  :min="0"
                  @input="clearValidation()"
                  @change="function () {if (!coupon.notificationInterval) coupon.notificationRecurring = false}"
              >
              </el-input-number>
            </el-form-item>

            <!-- Send Recurring -->
            <div class="am-setting-box am-switch-box">
              <el-row type="flex" align="middle" :gutter="24" :disabled="true">
                <el-col :span="19">
                  {{ $root.labels.send_recurring }}
                  <el-tooltip placement="top">
                    <div slot="content" v-html="$root.labels.send_recurring_tooltip"></div>
                    <i class="el-icon-question am-tooltip-icon"></i>
                  </el-tooltip>
                </el-col>
                <el-col :span="5" class="align-right">
                  <el-switch
                      v-model="coupon.notificationRecurring"
                      active-text=""
                      inactive-text=""
                      :disabled="!coupon.notificationInterval"
                  >
                  </el-switch>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

        </el-tabs>

      </el-form>

    </div>

    <!-- Dialog Actions -->
    <dialog-actions
        v-if="!dialogLoading"
        formName="coupon"
        urlName="coupons"
        :isNew="coupon.id === 0"
        :entity="coupon"
        :getParsedEntity="getParsedEntity"
        :hasIcons="true"

        :status="{
          on: 'visible',
          off: 'hidden'
        }"

        :buttonText="{
          confirm: {
            status: {
              yes: $root.labels.visibility_hide,
              no: $root.labels.visibility_show
            }
          }
        }"

        :action="{
          haveAdd: true,
          haveEdit: true,
          haveStatus: true,
          haveRemove: $root.settings.capabilities.canDelete === true,
          haveRemoveEffect: false,
          haveDuplicate: true
        }"

        :message="{
          success: {
            save: $root.labels.coupon_saved,
            remove: $root.labels.coupon_deleted,
            show: $root.labels.coupon_visible,
            hide: $root.labels.coupon_hidden
          },
          confirm: {
            remove: $root.labels.confirm_delete_coupon,
            show: $root.labels.confirm_show_coupon,
            hide: $root.labels.confirm_hide_coupon,
            duplicate: $root.labels.confirm_duplicate_coupon
          }
        }"
    >
    </dialog-actions>

  </div>
</template>

<script>
  import DialogActions from '../parts/DialogActions.vue'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import priceMixin from '../../../js/common/mixins/priceMixin'
  import dateMixin from '../../../js/common/mixins/dateMixin'

  export default {

    mixins: [imageMixin, notifyMixin, priceMixin, dateMixin],

    props: {
      coupon: null,
      couponFetched: false,
      services: null,
      events: null
    },

    data () {
      let validateAmount = (rule, value, callback) => {
        if (this.coupon.discount === 0 && this.coupon.deduction === 0) {
          callback(new Error(this.$root.labels.no_coupon_amount))
        } else {
          callback()
        }
      }

      let validateEntitiesCount = (rule, value, callback) => {
        if (this.coupon.serviceList.length === 0 && this.coupon.eventList.length === 0) {
          callback(new Error(this.$root.labels.no_entities_selected))
        } else {
          callback()
        }
      }

      let validateUsageCount = (rule, value, callback) => {
        if (this.coupon.limit <= 0) {
          callback(new Error(this.$root.labels.coupon_usage_limit_validation))
        } else {
          callback()
        }
      }

      return {
        couponTabs: 'details',
        allServicesSelected: false,
        allEventsSelected: false,
        dialogLoading: true,
        rules: {
          code: [
            {required: true, message: this.$root.labels.enter_coupon_code_warning, trigger: 'submit'}
          ],
          discount: [
            {validator: validateAmount, trigger: 'submit'}
          ],
          deduction: [
            {validator: validateAmount, trigger: 'submit'}
          ],
          services: [
            {validator: validateEntitiesCount, trigger: 'submit'}
          ],
          events: [
            {validator: validateEntitiesCount, trigger: 'submit'}
          ],
          limit: [
            {validator: validateUsageCount, trigger: 'submit'}
          ]
        }
      }
    },

    mounted: function () {},

    created: function () {},

    updated () {
      this.inlineSVG()
    },

    methods: {
      limitChanged () {
        if (this.coupon.limit < this.coupon.customerLimit) {
          this.coupon.customerLimit = this.coupon.limit
        }
      },

      instantiateDialog: function () {},

      getParsedEntity: function () {},

      closeDialog: function () {},

      allServicesSelection: function () {},

      allEventsSelection () {
        this.coupon.eventList = (this.allEventsSelected = !this.allEventsSelected) ? this.events : []
      },

      clearValidation: function () {}
    },

    watch: {
      'couponFetched' () {
        if (this.couponFetched === true) {
          this.instantiateDialog()
        }
      }
    },

    components: {
      DialogActions
    }
  }
</script>
