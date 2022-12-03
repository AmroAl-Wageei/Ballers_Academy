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
    <div class="am-dialog-scrollable" :class="{'am-edit':employee.id !== 0}" v-if="employee && !dialogLoading">

      <!-- Dialog Header -->
      <div class="am-dialog-header">
        <el-row>
          <el-col :span="14">
            <h2 v-if="employee.id !== 0">{{ !$root.isLite ? $root.labels.edit_employee : $root.labels.settings_employee }} </h2>
            <h2 v-else>{{ !$root.isLite ? $root.labels.new_employee : $root.labels.settings_employee }}</h2>
          </el-col>
          <el-col :span="10" class="align-right">
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Form -->
      <el-form :model="employee" ref="employee" :rules="rules" label-position="top" @submit.prevent="onSubmit">
        <el-tabs v-model="employeeTabs">

          <!-- Details -->
          <el-tab-pane :label="$root.labels.details" name="details">

            <!-- Profile Photo -->
            <div class="am-employee-profile">
              <picture-upload
                  :edited-entity="this.employee"
                  :entity-name="'employee'"
                  v-on:pictureSelected="pictureSelected"
              >
              </picture-upload>
              <h2>{{ employee.firstName }} {{ employee.lastName }}</h2>
              <span
                  v-if="typeof employee.activity !== 'undefined'"
                  class="am-employee-status-label"
                  :class="employee.activity"
              >
                {{ getEmployeeActivityLabel(employee.activity) }}
              </span>
            </div>

            <el-row :gutter="16">

              <el-col :sm="12">
                <div class="am-event-translate" @click="showDialogTranslate('firstName')" style="display: inline-block;float: right;cursor: pointer;">
                  <img class="am-dialog-translate-svg" width="16px" :src="$root.getUrl+'public/img/translate.svg'">
                  {{ $root.labels.translate }}
                </div>

                <!-- First Name -->
                <el-form-item :label="$root.labels.first_name + ':'" prop="firstName">
                  <el-input v-model="employee.firstName" auto-complete="off" @input="clearValidation()" @change="trimNames()"></el-input>
                </el-form-item>
              </el-col>
              <el-col :sm="12">
                <div class="am-event-translate" @click="showDialogTranslate('lastName')" style="display: inline-block;float: right;cursor: pointer;">
                  <img class="am-dialog-translate-svg" width="16px" :src="$root.getUrl+'public/img/translate.svg'">
                  {{ $root.labels.translate }}
                </div>

                <!-- Last Name -->
                <el-form-item :label="$root.labels.last_name + ':'" prop="lastName">
                  <el-input v-model="employee.lastName" auto-complete="off" @input="clearValidation()" @change="trimNames()"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :sm="12">

                <!-- Email -->
                <el-form-item :label="$root.labels.email + ':'" prop="email" :error="errors.email">
                  <el-input
                    v-model="employee.email"
                    auto-complete="off"
                    :placeholder="$root.labels.email_placeholder"
                    @input="clearValidation()"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :sm="12">

                <!-- Location -->
                <el-form-item :label="$root.labels.location + ':'" prop="locationId" v-if="locations.length">
                  <el-select
                      v-model="employee.locationId"
                      placeholder=""
                      @change="clearValidation()"
                  >
                    <el-option
                        v-for="location in filteredLocations"
                        :key="location.id"
                        :label="location.name"
                        :value="location.id"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :sm="12">

                <!-- WP User -->
                <el-form-item label="placeholder" v-if="$root.settings.capabilities.canWriteOthers === true">
                  <label slot="label">
                    {{ $root.labels.wp_user }}:
                    <el-tooltip placement="top">
                      <div slot="content" v-html="$root.labels.wp_user_employee_tooltip"></div>
                      <i class="el-icon-question am-tooltip-icon"></i>
                    </el-tooltip>
                  </label>
                  <el-popover :disabled="!$root.isLite" ref="externalIdPop" v-bind="$root.popLiteProps"><PopLite/></el-popover>
                  <el-select
                          v-model="employee.externalId"
                          ref="wpUser"
                          filterable
                          :placeholder="$root.labels.select_wp_user"
                          clearable
                          @change="clearValidation()"
                          :disabled="$root.isLite"
                          v-popover:externalIdPop
                  >
                    <div class="am-drop">
                      <div class="am-drop-create-item" @click="selectCreateNewWPUser">
                        {{ $root.labels.create_new }}
                      </div>
                      <el-option
                        :class="{'hidden' : item.value === 0}"
                        v-for="item in formOptions.wpUsers"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </div>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :sm="12">

                <!-- Phone -->
                <el-form-item :label="$root.labels.phone + ':'">
                  <phone-input
                    :countryPhoneIso="employee.countryPhoneIso"
                    :savedPhone="employee.phone"
                    @phoneFormatted="phoneFormatted"
                  >
                  </phone-input>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- Set Employee Panel Password -->
            <el-row :gutter="16">
              <el-col :span="12">

                <!-- Password -->
                <el-popover :disabled="!$root.isLite" ref="passwordPop" v-bind="$root.popLiteProps"><PopLite/></el-popover>
                <el-form-item
                    v-if="this.$root.settings.role === 'admin' || this.$root.settings.role === 'manager'"
                    :label="$root.labels.employee_panel_password + ':'" prop="password"
                >
                  <el-input
                      v-model="employee.password"
                      auto-complete="off"
                      :placeholder="$root.labels.enter_employee_panel_password"
                      show-password
                      @input="clearValidation()"
                      :disabled="$root.isLite"
                      v-popover:passwordPop
                  >
                  </el-input>
                </el-form-item>
                <!-- /Password -->

                <!-- Send Email With New Password -->
                <el-form-item
                    v-if="this.$root.settings.role === 'admin' || this.$root.settings.role === 'manager'"
                    v-show="employee.password && employee.password.length > 0"
                >
                  <el-checkbox
                      v-model="employee.sendEmployeePanelAccessEmail"
                      @change="clearValidation()"
                  >
                    {{ $root.labels.send_employee_panel_access_email }}
                  </el-checkbox>
                </el-form-item>
                <!-- /Send Email With New Password -->

              </el-col>

              <el-col :span="12" v-if="!$root.isLite">
                <div class="am-cabinet-timezone">
                  <el-form-item label="placeholder" v-if="$root.settings.capabilities.canWriteOthers === true"
                                :label="$root.labels.timezone + ':'">
                    <el-select
                      v-model="employee.timeZone"
                      filterable
                      clearable
                      popper-class="am-cabinet-timezone-dropdown"
                      :placeholder="$root.timezone"
                    >
                      <template slot="prefix">
                        <img :src="$root.getUrl + 'public/img/am-globe.svg'">
                      </template>
                      <el-option
                        v-for="(timeZone, index) in $root.timezones"
                        :key="index"
                        :label="timeZone"
                        :value="timeZone"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
            </el-row>

            <!-- Google Calendar -->
            <el-row
                :gutter="24"
                v-if="$root.settings.googleCalendar && employee.id !== 0"
            >

              <!-- Google Calendar List -->
              <el-col :span="24" v-if="employee.googleCalendar && employee.googleCalendar.calendarList">
                <el-form-item label="placeholder">
                  <label slot="label">
                    {{ $root.labels.google_calendar }}:
                    <el-tooltip placement="top">
                      <div slot="content" v-html="$root.labels.google_calendar_tooltip"></div>
                      <i class="el-icon-question am-tooltip-icon"></i>
                    </el-tooltip>
                  </label>

                  <el-col :span="15" style="padding: 0">

                    <el-select
                      v-model="employee.googleCalendar"
                      placeholder=""
                      :disabled="!employee.googleCalendar || !employee.googleCalendar.token || googleLoading"
                      @change="clearValidation()"
                    >
                      <el-option
                        v-for="calendar in employee.googleCalendar.calendarList"
                        :key="calendar.id"
                        :label="calendar.summary"
                        :value="calendar.id"
                      >
                      </el-option>
                    </el-select>

                  </el-col>

                  <!-- Google Calendar Connect Button -->
                  <el-col :span="9" v-if="employee.googleCalendar">

                    <el-button
                      class="am-google-calendar-button"
                      :class="{ 'connected': employee.googleCalendar && employee.googleCalendar.token }"
                      type="primary"
                      @click="!employee.googleCalendar || !employee.googleCalendar.token ? redirectToGoogleAuthPage() : disconnectFromGoogleAccount()"
                    >
                      <div class="am-google-calendar-button-image">
                        <img class="" :src="$root.getUrl + 'public/img/google-button.png'"/>
                      </div>
                      <span class="am-google-calendar-button-text">
                        {{ !employee.googleCalendar || !employee.googleCalendar.token ? $root.labels.google_sign_in : $root.labels.google_sign_out }}
                      </span>
                    </el-button>
                  </el-col>

                </el-form-item>
              </el-col>

            </el-row>
            <!-- /Google Calendar -->

            <!-- Outlook Calendar -->
            <el-row
              :gutter="24"
              v-if="$root.settings.outlookCalendar && employee.id !== 0"
            >

              <!-- Outlook Calendar List -->
              <el-col :span="24" v-if="employee.outlookCalendar && employee.outlookCalendar.calendarList">
                <el-form-item label="placeholder">

                  <!-- Outlook Calendar Label -->
                  <label slot="label">
                    {{ $root.labels.outlook_calendar }}:
                    <el-tooltip placement="top">
                      <div slot="content" v-html="$root.labels.outlook_calendar_tooltip"></div>
                      <i class="el-icon-question am-tooltip-icon"></i>
                    </el-tooltip>
                  </label>
                  <!-- /Outlook Calendar Label -->

                  <!-- Outlook Calendar List Selectbox -->
                  <el-col :span="15" style="padding: 0">
                    <el-select
                      v-model="employee.outlookCalendar"
                      placeholder=""
                      :disabled="!employee.outlookCalendar || !employee.outlookCalendar.token || outlookLoading"
                      @change="clearValidation()"
                    >
                      <el-option
                        v-for="calendar in employee.outlookCalendar.calendarList"
                        :key="calendar.id"
                        :label="calendar.name"
                        :value="calendar.id"
                      >
                      </el-option>
                    </el-select>
                  </el-col>
                  <!-- /Outlook Calendar List Selectbox -->

                  <!-- Outlook Calendar Connect Button -->
                  <el-col :span="9">
                    <el-button
                      class="am-google-calendar-button"
                      :class="{ 'connected': employee.outlookCalendar && employee.outlookCalendar.token }"
                      type="primary"
                      @click="!employee.outlookCalendar || !employee.outlookCalendar.token ? redirectToOutlookAuthPage() : disconnectFromOutlookAccount()"
                    >
                      <div class="am-google-calendar-button-image">
                        <img class="" :src="$root.getUrl + 'public/img/outlook-calendar.png'"/>
                      </div>
                      <span class="am-google-calendar-button-text">
                        {{ !employee.outlookCalendar || !employee.outlookCalendar.token ? $root.labels.outlook_sign_in : $root.labels.outlook_sign_out }}
                      </span>
                    </el-button>
                  </el-col>
                  <!-- /Outlook Calendar Connect Button -->

                </el-form-item>
              </el-col>
              <!-- /Outlook Calendar List -->

            </el-row>
            <!-- /Outlook Calendar -->

            <!-- Zoom-->
            <el-row v-if="$root.settings.zoom.enabled">
              <el-form-item label="placeholder" :label="$root.labels.zoom_user + ':'">
                <label slot="label">
                  {{ $root.labels.zoom_user }}:
                  <el-tooltip placement="top">
                    <div slot="content" v-html="$root.labels.zoom_user_tooltip"></div>
                    <i class="el-icon-question am-tooltip-icon"></i>
                  </el-tooltip>
                </label>

                <!-- Zoom Users List -->
                <el-select
                  clearable
                  filterable
                  v-model="employee.zoomUserId"
                  :placeholder="$root.labels.zoom_user_placeholder"
                  @change="clearValidation()"
                >
                  <el-option
                    v-for="(zoomUser, index) in zoomUsers"
                    :key="index"
                    :label="zoomUser.first_name + ' ' + zoomUser.last_name + ' (' + zoomUser.email + ')'"
                    :value="zoomUser.id"
                  >
                  </el-option>
                </el-select>

              </el-form-item>
            </el-row>

            <div class="am-divider"></div>

            <!-- Description -->
            <content-block
              v-show="!hideDescription"
              :label="$root.labels.description"
              :entity="employee"
              textProperty="description"
              htmlProperty="descriptionHtml"
              :hasTranslation="true"
              :hasQuill="true"
              :textModeProp="true"
              :allowImage="true"
              @showDialogTranslate="showDialogTranslate('description')"
            >
            </content-block>

            <!-- Notes -->
            <el-form-item :label="$root.labels.note_internal + ':'">
              <el-input
                type="textarea"
                :autosize="{minRows: 4, maxRows: 6}"
                placeholder=""
                v-model="employee.note"
                @input="clearValidation()"
              >
              </el-input>
            </el-form-item>

          </el-tab-pane>

          <!-- Assigned Services -->
          <el-tab-pane
            v-if="$root.settings.capabilities.canWriteOthers === true || $root.settings.roles.allowConfigureServices === true"
            :label="$root.labels.assigned_services" name="services"
          >
            <assigned-services
              :week-schedule="editWeekDayList"
              :categorized-service-list="editCategorizedServiceList"
              :future-appointments="futureAppointments"
              :employee-id="employee.id"
            />
          </el-tab-pane>

          <!-- Work Hours -->
          <el-tab-pane
            :label="$root.labels.work_hours" name="hours"
            v-if="$root.settings.capabilities.canWriteOthers === true || $root.settings.roles.allowConfigureSchedule === true"
          >
            <working-hours
              :active-tab="employeeTabs"
              :week-schedule="editWeekDayList"
              :categorized-service-list="editCategorizedServiceList"
              :locations="locations"
            >
            </working-hours>
          </el-tab-pane>

          <!-- Days Off -->
          <el-tab-pane
            :label="$root.labels.days_off" name="off"
            v-if="$root.settings.capabilities.canWriteOthers === true || $root.settings.roles.allowConfigureDaysOff === true"
          >
            <BlockLite/>

            <div class="am-days-off">
              <div class="am-employee-days-off">
                <days-off
                  @changeDaysOff="changeDaysOff"
                  @showCompanyDaysOffSettingsDialog="showCompanyDaysOffSettingsDialog"
                  :daysOff="employee.id !== 0 ? employee.dayOffList : []"
                  :listedDaysOff="companyDaysOff"
                >
                </days-off>
              </div>
            </div>
          </el-tab-pane>

          <!-- Special Days -->
          <el-tab-pane
              :label="$root.labels.special_days" name="special"
              v-if="$root.settings.capabilities.canWriteOthers === true || $root.settings.roles.allowConfigureSpecialDays === true"
          >
            <BlockLite/>

            <div class="am-special-days">
              <special-days
                  @changeSpecialDays="changeSpecialDays"
                  :active-tab="employeeTabs"
                  :specialDays="employee.specialDayList"
                  :locations="locations"
                  :categorizedServiceList="editCategorizedServiceList">
              </special-days>
            </div>
          </el-tab-pane>

        </el-tabs>

      </el-form>
    </div>

    <!-- Dialog Actions -->
    <dialog-actions
        v-if="employee && !dialogLoading"
        formName="employee"
        urlName="users/providers"
        :isNew="employee.id === 0"
        :entity="employee"
        :getParsedEntity="getParsedEntity"
        @errorCallback="errorCallback"
        @validationFailCallback="validationFailCallback"
        :isDisabledDuplicate="isDisabledDuplicate"
        :hasIcons="true"
        :updateStash="true"

        :status="{
          on: 'visible',
          off: 'hidden'
        }"

        :buttonText="{
          confirm: {
            status: {
              yes: employee.status === 'visible' ? $root.labels.visibility_hide : $root.labels.visibility_show,
              no: $root.labels.no
            }
          }
        }"

        :action="{
          haveAdd: true,
          haveEdit: true,
          haveStatus: $root.settings.capabilities.canWriteOthers === true && !$root.isLite,
          haveRemove: $root.settings.capabilities.canDelete === true && !$root.isLite,
          haveRemoveEffect: true,
          haveDuplicate: $root.settings.capabilities.canWriteOthers === true && !$root.isLite
        }"

        :message="{
          success: {
            save: $root.labels.employee_saved,
            remove: $root.labels.employee_deleted,
            show: $root.labels.employee_visible,
            hide: $root.labels.employee_hidden
          },
          confirm: {
            remove: $root.labels.confirm_delete_employee,
            show: $root.labels.confirm_show_employee,
            hide: $root.labels.confirm_hide_employee,
            duplicate: $root.labels.confirm_duplicate_employee
          }
        }"
    >
    </dialog-actions>

  </div>
</template>

<script>
  import AssignedServices from '../../parts/assignedServices/AssignedServices'
  import DaysOff from '../parts/DaysOff.vue'
  import WorkingHours from '../parts/WorkingHours.vue'
  import SpecialDays from '../parts/SpecialDays.vue'
  import DialogActions from '../parts/DialogActions.vue'
  import PhoneInput from '../../parts/PhoneInput.vue'
  import { Money } from 'v-money'
  import PictureUpload from '../parts/PictureUpload.vue'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import durationMixin from '../../../js/common/mixins/durationMixin'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import priceMixin from '../../../js/common/mixins/priceMixin'
  import employeeMixin from '../../../js/common/mixins/employeeMixin'
  import googleMixin from '../../../js/frontend/mixins/googleMixin'
  import outlookMixin from '../../../js/frontend/mixins/outlookMixin'
  import ContentBlock from '../parts/ContentBlock'

  export default {
    mixins: [imageMixin, dateMixin, durationMixin, notifyMixin, priceMixin, employeeMixin, outlookMixin, googleMixin],

    props: {
      locations: null,
      employee: null,
      editCategorizedServiceList: null,
      editWeekDayList: null,
      companyDaysOff: null,
      futureAppointments: null,
      isDisabledDuplicate: null
    },

    data () {
      return {
        hideDescription: true,
        appointmentsServices: [],
        dialogLoading: true,
        employeeTabs: 'details',
        errors: {
          email: ''
        },
        executeUpdate: true,
        formOptions: {
          wpUsers: []
        },
        googleAuthURL: '',
        outlookAuthURL: '',
        googleLoading: false,
        outlookLoading: false,
        zoomUsers: [],
        rules: {
          firstName: [
            {required: true, message: this.$root.labels.enter_first_name_warning, trigger: 'submit'}
          ],
          lastName: [
            {required: true, message: this.$root.labels.enter_last_name_warning, trigger: 'submit'}
          ],
          email: [
            {required: true, message: this.$root.labels.enter_email_warning, trigger: 'submit'},
            {type: 'email', message: this.$root.labels.enter_valid_email_warning, trigger: 'submit'}
          ],
          locationId: [
            {
              required: this.visibleLocations().length > 0,
              message: this.$root.labels.enter_location_warning,
              trigger: 'blur'
            }
          ],
          password: [
            {min: 4, max: 128, message: this.$root.labels.new_password_length, trigger: 'submit'}
          ]
        }
      }
    },

    created () {
      this.instantiateDialog()
      setTimeout(() => {
        this.hideDescription = false
      }, 500)
    },

    updated () {
      this.instantiateDialog()
    },

    methods: {
      showDialogTranslate (type) {
        this.$emit('showDialogTranslate', type)
      },

      instantiateDialog () {
        if ((this.employee !== null || (this.employee !== null && this.employee.id === 0)) && this.executeUpdate === true) {
          if (this.$root.settings.capabilities.canWriteOthers) {
            if (this.employee.id !== 0) {
              this.getWPUsers(this.employee.externalId)
            } else {
              this.getWPUsers(0)
            }
          }

          this.employee.googleCalendar = null

          this.employee.outlookCalendar = null

          // Send request for Google Authorization URL if token is not already set
          if (this.employee.googleCalendar && !this.employee.googleCalendar.token) {
            this.getGoogleAuthURL(false)
          }

          if (this.employee.outlookCalendar && !this.employee.outlookCalendar.token) {
            this.getOutlookAuthURL(false)
          }

          let locations = this.visibleLocations()

          if (locations.length === 1) {
            this.employee.locationId = locations[0].id
          }

          if (this.$root.settings.zoom.enabled) {
            this.getZoomUsers()
          }

          if (this.employee.id in this.futureAppointments) {
            this.appointmentsServices = this.futureAppointments[this.employee.id]
          }

          this.$set(this.employee, 'sendEmployeePanelAccessEmail', true)

          // Remove loading when employee is connected to google calendar
          if (!this.$root.settings.capabilities.canWriteOthers) {
            this.dialogLoading = false
            this.inlineDialogEmployeeSVG()
          }

          if (this.employee.description !== null && this.employee.description.startsWith('<!-- Content -->')) {
            this.employee.descriptionHtml = this.employee.description
          }

          this.executeUpdate = false
        }
      },

      checkCapacityLimits (item) {
        this.clearValidation()
        if (item.minCapacity > item.maxCapacity) {
          item.maxCapacity = item.minCapacity
        }
      },

      validationFailCallback () {
        this.employeeTabs = 'details'
      },

      errorCallback (responseData) {
        let $this = this

        $this.errors.email = ''

        setTimeout(function () {
          $this.errors.email = responseData
          $this.employeeTabs = 'details'
        }, 200)
      },

      closeDialog () {
        this.$emit('closeDialog')
      },

      trimNames () {
        this.employee.firstName = this.employee.firstName.trim()
        this.employee.lastName = this.employee.lastName.trim()
      },

      getParsedEntity () {
        this.employee.serviceList = this.getParsedServiceList(this.editCategorizedServiceList)
        this.employee.weekDayList = this.getParsedWeekDayList(this.editWeekDayList)

        this.trimNames()

        let employee = JSON.parse(JSON.stringify(this.employee))

        employee.serviceList.forEach((item) => {
          item.customPricing = this.getJsonCustomPricing(item.customPricing)
        })

        return employee
      },

      changeDaysOff: function () {},

      changeSpecialDays: function () {},

      phoneFormatted (phone, countryPhoneIso) {
        this.clearValidation()
        this.employee.phone = phone
        this.employee.countryPhoneIso = countryPhoneIso && countryPhoneIso !== 'auto' ? countryPhoneIso : null
      },

      pictureSelected (pictureFullPath, pictureThumbPath) {
        this.employee.pictureFullPath = pictureFullPath
        this.employee.pictureThumbPath = pictureThumbPath
      },

      getWPUsers (currentId) {
        this.$http.get(`${this.$root.getAjaxUrl}/users/wp-users`, {
          params: {
            id: currentId,
            role: 'provider'
          }
        }).then(response => {
          this.formOptions.wpUsers = response.data.data.users
          this.formOptions.wpUsers.unshift({'value': 0, 'label': this.$root.labels.create_new})

          if (this.formOptions.wpUsers.map(user => user.value).indexOf(this.employee.externalId) === -1) {
            this.employee.externalId = ''
          }

          this.dialogLoading = false
          this.inlineDialogEmployeeSVG()
        })
      },

      visibleLocations () {
        return this.locations.filter(location => location.status === 'visible' || (this.employee && location.status === 'hidden' && location.id === this.employee.locationId))
      },

      showCompanyDaysOffSettingsDialog: function () {},

      clearValidation () {
        if (typeof this.$refs.employee !== 'undefined') {
          this.$refs.employee.clearValidate()
        }
      },

      selectCreateNewWPUser () {
        this.employee.externalId = 0
        this.$refs.wpUser.blur()
      },

      getGoogleAuthURL: function () {},

      getOutlookAuthURL: function () {},

      getZoomUsers: function () {},

      redirectToGoogleAuthPage: function () {},

      redirectToOutlookAuthPage: function () {},

      disconnectFromGoogleAccount: function () {},

      disconnectFromOutlookAccount: function () {},

      inlineDialogEmployeeSVG () {
        let $this = this
        setTimeout(function () {
          $this.inlineSVG()
        }, 10)
      }
    },

    computed: {
      filteredLocations () {
        return this.visibleLocations()
      }
    },

    components: {
      AssignedServices,
      PhoneInput,
      PictureUpload,
      DaysOff,
      WorkingHours,
      SpecialDays,
      DialogActions,
      Money,
      ContentBlock
    }
  }
</script>
