<template>
  <div class="am-dialog-appointment">

    <!-- Dialog Loader -->
    <div class="am-dialog-loader" v-show="dialogLoading">
      <div class="am-dialog-loader-content">
        <img :src="$root.getUrl+'public/img/spinner.svg'" class=""/>
        <p>{{ $root.labels.loader_message }}</p>
      </div>
    </div>

    <!-- Dialog Content -->
    <div class="am-dialog-scrollable" :class="{'am-edit':appointment.id !== 0}" v-if="appointment !== null && !dialogLoading">

      <!-- Dialog Header -->
      <div v-if="showHeader" class="am-dialog-header">
        <el-row>
          <el-col :span="18">
            <h2 v-if="appointment.id !== 0">{{ $root.labels.edit_appointment }}</h2>
            <h2 v-else>{{ $root.labels.new_appointment }}</h2>
          </el-col>
          <el-col :span="6" class="align-right">
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Form -->
      <el-form v-if="mounted && appointment !== null" :model="appointment" ref="appointment" :rules="rules" label-position="top">
        <el-tabs v-model="newAppointmentTabs" @tab-click="handleTabClick">
          <!-- Schedule -->
          <el-tab-pane :label="$root.labels.schedule" name="schedule">
            <!-- Customer -->
            <el-form-item
              v-if="showCustomer"
              :label="$root.labels.customers_singular_plural + ':'" prop="bookings"
              class="am-appointment-customer"
            >
              <el-select
                v-model="appointment.bookings"
                class="no-tags"
                value-key="customer.id"
                remote
                multiple
                filterable
                collapse-tags
                :loading="loadingCustomers"
                :multiple-limit="customersMaxLimit"
                :placeholder="$root.labels.select_customers"
                :popper-class="'am-dropdown-cabinet'"
                :remote-method="searchExistingCustomers"
                @change="handleCustomerChange"
                :disabled="packageServices && !appointment.id"
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
                    v-for="(item, key) in clonedBookings"
                    v-if="item.visible"
                    :key="key"
                    :label="(user = getCustomerInfo(item)) !== null ? (!user.firstName.trim() && !user.lastName.trim() ? $root.labels.customer + ' ' + user.id : user.firstName + ' ' + user.lastName) : ''"
                    :value="item"
                    class="am-has-option-meta"
                  >
                    <span :class="{'am-drop-item-name': item.customer.email}">
                      {{ !item.customer.firstName.trim() && !item.customer.lastName.trim() ? $root.labels.customer + ' ' + item.customer.id : '' }} {{ `${item.customer.firstName} ${item.customer.lastName}` }}
                    </span>
                    <span
                      v-if="item.customer.email"
                      class="am-drop-item-meta"
                    >
                      {{ item.customer.email }}
                    </span>
                  </el-option>
                  <el-option
                    v-if="clonedBookings.length === 0"
                    v-for="item in [{customer: {id: 0, firstName: '', lastName: '', email: '', info: JSON.stringify({firstName: '', lastName: '', email: '', phone: ''})}}]"
                    :key="item.customer.id"
                    :label="(user = getCustomerInfo(item)) !== null ? (!user.firstName.trim() && !user.lastName.trim() ? $root.labels.customer + ' ' + user.id : user.firstName + ' ' + user.lastName) : ''"
                    :style="{'display': 'none'}"
                    :value="item"
                    class="am-has-option-meta"
                  >
                  </el-option>
                </div>
              </el-select>
            </el-form-item>

            <transition name="fade">
              <div
                v-if="appointment.bookings.length > 0 && this.$root.settings.role !== 'customer'"
                class="am-selected-dropdown-items"
              >
                <el-form-item :label="selectedCustomersMessage"></el-form-item>
                <!-- Selected Customers -->
                <div
                  v-for="(booking, index) in appointment.bookings" :key="index"
                  class="am-selected-dropdown-item"
                >
                  <el-row class="am-selected-dropdown-item__inner" align="middle" :gutter="4" justify="left">
                    <!-- Selected Customer Name & Email -->
                    <el-col :sm="10">
                      <h3>
                        {{ (user = getCustomerInfo(booking)) !== null ? (!user.firstName.trim() && !user.lastName.trim() ? $root.labels.customer + ' ' + user.id : user.firstName + ' ' + user.lastName) : '' }}
                      </h3>
                      <a
                        v-if="booking.customer.email"
                        class="am-customer-link"
                        :href="`mailto:${booking.customer.email}`"
                      >
                        {{ booking.customer.email }}
                      </a>
                      <a
                        v-if="booking.customer.phone"
                        class="am-customer-link"
                        :href="`tel:${booking.customer.phone}`"
                      >
                        {{ booking.customer.phone }}
                      </a>
                    </el-col>
                    <!-- Selected Customer Status -->
                    <el-col :sm="14" class="am-align-right">
                      <div class="am-appointment-status small">
                        <span class="am-appointment-status-symbol" :class="booking.status"></span>
                        <el-select
                          :disabled="disableStatusChange()"
                          v-model="booking.status"
                          :popper-class="'am-dropdown-cabinet'"
                          @change="handleBookingChange"
                        >
                          <el-option
                            v-for="item in statuses"
                            :key="item.value"
                            :value="item.value"
                          >
                            <span class="am-appointment-status-symbol" :class="item.value"></span>
                          </el-option>
                        </el-select>
                      </div>
                      <!-- Selected Customer Number Of Persons -->
                      <div class="am-appointment-persons small">
                        <img
                          slot="prefix"
                          width="16px"
                          :src="$root.getUrl+'public/img/group.svg'" class="svg-amelia"
                        />
                        <el-select
                          v-model="booking.persons"
                          class="small-status"
                          :popper-class="'am-dropdown-cabinet'"
                          :no-data-text="$root.labels.choose_a_group_service"
                          @change="handleBookingChange"
                        >
                          <el-option
                            v-for="n in appointment.providerServiceMaxAdditonalCapacity"
                            :key="n"
                            :value="n"
                          >
                          </el-option>
                        </el-select>
                      </div>
                      <!-- Selected Customer Duration -->
                      <div
                          v-if="!packageServices && appointment.serviceId && getServiceById(appointment.serviceId).customPricing.enabled"
                          class="am-appointment-duration small"
                      >
                        <img
                          slot="prefix"
                          width="16px"
                          :src="$root.getUrl+'public/img/duration.svg'" class="svg-amelia"
                        />
                        <el-select
                          v-model="booking.duration"
                          class="small-status"
                          :popper-class="'am-dropdown-cabinet'"
                          :no-data-text="$root.labels.choose_a_group_service"
                          @change="handleBookingChange"
                        >
                          <el-option
                            v-for="duration in getPossibleCustomDurations(booking)"
                            :key="duration"
                            :label="secondsToNiceDuration(duration)"
                            :value="duration"
                          >
                          </el-option>
                        </el-select>
                      </div>

                      <div class="am-appointment-remove small">
                        <el-tooltip placement="top">
                          <div slot="content" v-html="$root.labels.customers_tooltip"></div>
                          <i class="el-icon-question am-tooltip-icon"></i>
                        </el-tooltip>

                        <!-- Selected Customer Remove -->
                        <i class="el-icon-close remove" @click="handleCustomerRemove(index)"></i>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <!-- Change Group Status -->
                <div v-if="appointment.bookings.length > 1" class="group-status-change">
                  <el-row :gutter="4">
                    <!-- Change Group Status Label -->
                    <el-col :sm="14">
                      <h3>{{ $root.labels.change_group_status }}</h3>
                    </el-col>
                    <!-- Change Group Status Selectbox -->
                    <el-col :sm="10">
                      <el-form-item>
                        <div class="am-appointment-status">
                          <span class="am-appointment-status-symbol" :class="appointment.status"></span>
                          <el-select
                            :disabled="disableStatusChange()"
                            v-model="appointment.status"
                            :popper-class="'am-dropdown-cabinet'"
                            @change="handleGroupStatusChange"
                            @visible-change="handleSelected"
                          >
                            <el-option
                              v-for="opt in statuses"
                              :key="opt.value"
                              :label="opt.label"
                              :value="opt.value"
                              class="am-appointment-status-option"
                            >
                              <span class="am-appointment-status-symbol" :class="opt.value">
                                {{ opt.label }}
                              </span>
                            </el-option>
                          </el-select>
                        </div>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </transition>

            <!-- Service Category -->
            <el-form-item :label="$root.labels.category + ':'" :class="{active:categorySpinnerActive}">
              <el-select
                v-model="appointment.categoryId"
                filterable
                clearable
                :placeholder="$root.labels.select_service_category"
                :popper-class="'am-dropdown-cabinet'"
                :disabled="$root.settings.role === 'customer'"
                @change="handleCategoryChange"
              >
                <el-option
                  v-for="item in categoriesFiltered"
                  :disabled="item.disabled"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
              <img :src="$root.getUrl+'public/img/oval-spinner.svg'" class="svg-amelia is-spinner"/>
            </el-form-item>
            <!-- Service -->
            <el-form-item
              :class="{active:serviceSpinnerActive}" prop="serviceId"
              :label="capitalizeFirstLetter($root.labels.service) + ':'"
            >
              <el-select
                v-model="appointment.serviceId"
                filterable
                clearable
                :placeholder="$root.labels.select_service + ':'"
                :popper-class="'am-dropdown-cabinet'"
                :disabled="$root.settings.role === 'customer'"
                @change="handleServiceChange"
              >
                <el-option
                  v-for="item in getAllowedServices()"
                  :disabled="item.disabled"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
              <img :src="$root.getUrl+'public/img/oval-spinner.svg'" class="svg-amelia is-spinner"/>
            </el-form-item>

            <!-- Location -->
            <el-form-item
              v-if="locationsFiltered.length"
              :label="$root.labels.location + ':'"
              :class="{active:locationSpinnerActive}"
              :disabled="$root.settings.role === 'customer'"
            >
              <el-select
                v-model="appointment.locationId"
                filterable
                clearable
                :placeholder="$root.labels.select_location"
                :popper-class="'am-dropdown-cabinet'"
                @change="handleLocationChange"

              >
                <el-option
                  v-for="item in locationsFiltered"
                  :disabled="item.disabled"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
              <img :src="$root.getUrl+'public/img/oval-spinner.svg'" class="svg-amelia is-spinner"/>
            </el-form-item>

            <!-- Employee -->
            <el-form-item
              v-show="$root.settings.capabilities.canReadOthers && $root.settings.capabilities.canWriteOthers"
              :label="capitalizeFirstLetter($root.labels.employee) + ':'"
              :class="{active:employeeSpinnerActive}"
              prop="providerId"
              v-if="!$root.isLite"
            >
              <el-select
                v-model="appointment.providerId"
                filterable
                clearable
                :placeholder="$root.labels.select_employee"
                :popper-class="'am-dropdown-cabinet'"
                :disabled="$root.settings.role === 'customer'"
                @change="handleEmployeeChange"
              >
                <el-option
                  v-for="item in employeesFiltered"
                  :disabled="item.disabled"
                  :key="item.id"
                  :label="item.firstName + ' ' + item.lastName"
                  :value="item.id"
                >
                </el-option>
              </el-select>
              <img :src="$root.getUrl+'public/img/oval-spinner.svg'" class="svg-amelia is-spinner"/>
            </el-form-item>


            <!-- Lesson Space spaces -->
            <el-form-item
              v-show="$root.settings.lessonSpace.enabled && $root.settings.role !== 'customer'"
              :label="$root.labels.lesson_space + ':'"
              prop="lessonSpaceId"
            >
              <el-select
                v-model="appointment.lessonSpace"
                filterable
                clearable
                :popper-class="'am-dropdown-cabinet'"
                :disabled="$root.settings.role === 'customer'"
                :loading="loadingSpaces"
                remote
                :remote-method="searchExistingSpaces"
              >
                <el-option
                  :key="0"
                  :label="$root.labels.lesson_space_new_space"
                  :value="0"
                >
                </el-option>
                <el-option
                  v-for="item in spaces"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-form-item>


            <!-- Service Coupon -->
            <el-form-item
              v-if="!(packageServices && packageServices.length) && couponsFilteredService.length > 0 && showCoupon && ($root.settings.role === 'admin' || $root.settings.role === 'manager')"
              :label="$root.labels.apply_coupon" :class="{active:categorySpinnerActive}"
            >
              <el-select
                v-model="coupon"
                filterable
                clearable
                :placeholder="$root.labels.select_coupon"
                :popper-class="'am-dropdown-cabinet'"
                :disabled="$root.settings.role === 'customer'"
                @change = "filterServices"
              >
                <el-option
                  v-for="item in couponsFilteredService"
                  :disabled="item.disabled"
                  :key="item.id"
                  :label="item.code + (couponExpired(item.expirationDate) ? ` - ${$root.labels.expired}` : '')"
                  :value="item.id"
                >
                </el-option>
              </el-select>
              <img :src="$root.getUrl+'public/img/oval-spinner.svg'" class="svg-amelia is-spinner"/>
            </el-form-item>

            <!-- Date & Time -->
            <el-row :gutter="20">
              <!-- Date -->
              <el-col :lg="12" :md="12" :sm="24" class="v-calendar-column">
                <el-form-item
                  :class="{active: loadingTimeSlots}"
                  :label="$root.labels.date + ':'"
                  prop="selectedDate"
                >
                  <v-date-picker
                    v-show="!loadingTimeSlots"
                    v-model="appointment.selectedDate"
                    mode='single'
                    popover-visibility="focus"
                    popover-direction="top"
                    :popover-align="screenWidth < 768 ? 'center' : 'left'"
                    :tint-color='isCabinet ? $root.settings.customization.primaryColor : "#1A84EE"'
                    :is-required=true
                    :is-expanded=false
                    :show-day-popover=false
                    :input-props='{class: "el-input__inner", readOnly: "readonly"}'
                    :available-dates="availableDates"
                    :disabled-dates='disabledWeekdays'
                    :disabled=false
                    :formats="vCalendarFormats"
                    @input="dateChange"
                  >
                  </v-date-picker>
                  <el-input
                    v-show="loadingTimeSlots"
                    :placeholder="appointment.selectedDate ? getFrontedFormattedDate(appointment.selectedDate) : this.momentDateFormat"
                    :disabled=true
                  >
                  </el-input>
                  <img :src="$root.getUrl+'public/img/oval-spinner.svg'" class="svg-amelia is-spinner is-spinner-right"/>
                </el-form-item>
              </el-col>

              <!-- Time -->
              <el-col :lg="12" :md="12" :sm="24">
                <el-form-item
                  :class="{active: loadingTimeSlots}"
                  :label="$root.labels.time + ':'"
                  prop="selectedPeriod.time"
                >
                  <el-select
                    v-model="appointment.selectedPeriod"
                    value-key="time"
                    filterable
                    :placeholder="$root.labels.select_time"
                    :popper-class="'am-dropdown-cabinet'"
                    :disabled="loadingTimeSlots"
                    @change="selectedTime()"
                  >
                    <el-option
                      v-for="item in appointment.dateTimeSlots"
                      :key="item.time"
                      :label="getFrontedFormattedTime(item.time + ':00')"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                  <img :src="$root.getUrl+'public/img/oval-spinner.svg'" class="svg-amelia is-spinner"/>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- Recurring -->
            <el-form-item
              v-if="!packageServices && $root.settings.role !== 'customer' && !appointment.id && appointment.serviceId && getServiceById(appointment.serviceId).recurringCycle !== 'disabled'"
              class="am-recurring-check"
            >
              <el-checkbox
                v-model="activeRecurring"
                :disabled="!appointment.selectedDate || !appointment.selectedPeriod"
                @change="showRecurringTab()"
              >
                {{ $root.labels.recurring_active }}
                <el-tooltip placement="top">
                  <div slot="content" v-html="$root.labels.recurring_active_tooltip"></div>
                  <i class="el-icon-question am-tooltip-icon"></i>
                </el-tooltip>
              </el-checkbox>
            </el-form-item>

            <!-- Notify Participants -->
            <el-form-item v-if="this.$root.settings.role !== 'customer'">
              <el-checkbox
                v-model="appointment.notifyParticipants"
                @change="clearValidation()"
              >
                {{ $root.labels.notify_customers }}
                <el-tooltip placement="top">
                  <div slot="content" v-html="$root.labels.notify_customers_tooltip"></div>
                  <i class="el-icon-question am-tooltip-icon"></i>
                </el-tooltip>
              </el-checkbox>
            </el-form-item>

            <!-- Note -->
            <div class="am-divider" v-if="this.$root.settings.role !== 'customer'"></div>
            <el-form-item :label="$root.labels.note_internal + ':'" v-if="this.$root.settings.role !== 'customer'">
              <el-input
                v-model="appointment.internalNotes"
                type="textarea"
                placeholder=""
                :autosize="{ minRows: 4, maxRows: 6}"
                @input="clearValidation()"
              >
              </el-input>
            </el-form-item>
          </el-tab-pane>

          <!-- Extras -->
          <el-tab-pane name="extras" v-if="this.$root.settings.role !== 'customer'">
            <BlockLite/>

            <span slot="label">{{ $root.labels.extras }}
              <el-badge
                v-if="appointment.serviceId && appointment.bookings.length > 0 && appointment.extrasSelectedCount > 0"
                class="mark" :value="appointment.extrasSelectedCount"
              >
              </el-badge>
            </span>
            <div class="am-dialog-table" :class="{'am-lite-container-disabled': $root.isLite}">
              <div
                v-if="appointment.providerId && appointment.serviceId && appointment.extrasCount > 0 && appointment.bookings.length > 0"
              >
                <div
                  v-if="['approved', 'pending'].includes(booking.status)"
                  v-for="(booking, index) in appointment.bookings" :key="index" class="am-customer-extras"
                >
                  <el-row class="am-customer-extras-data">
                    <el-col>
                      <h3>
                        {{ `${booking.customer.firstName} ${booking.customer.lastName}` }}
                      </h3>
                      <span>{{ booking.customer.email }}</span>
                    </el-col>
                  </el-row>
                  <el-row :gutter="10" v-for="item in booking.extras" :key="item.extraId">
                    <el-col :sm="10" :xs="24">
                      <el-row>
                        <el-col :sm="4" :xs="2">
                          <el-checkbox
                            v-model="item.selected"
                            @change="handleExtrasSelectionChange(item)"
                          >
                          </el-checkbox>
                        </el-col>
                        <el-col :sm="20" :xs="22">
                          <span>{{ item.name }}</span>
                        </el-col>
                      </el-row>
                    </el-col>
                    <el-col :sm="14" :xs="24">
                      <el-row>
                        <el-col :sm="14" :xs="14" class="align-right">
                          <el-input-number
                            v-model="item.quantity"
                            size="small"
                            type="number"
                            :min="1"
                            :max="item.maxQuantity"
                            :value="item.quantity"
                            :disabled="!item.selected"
                            @change="handleExtrasSelectionChange(item)"
                          >
                          </el-input-number>
                        </el-col>
                        <el-col :sm="10" :xs="10" class="align-right">
                          {{ getFormattedPrice(item.price) }}
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row>
                  <el-row :gutter="10" class="subtotal">
                    <el-col :span="14" class="align-right">
                      {{ $root.labels.subtotal }}:
                    </el-col>
                    <el-col :span="10" class="align-right">
                      {{ getFormattedPrice(booking.extrasTotalPrice) }}
                    </el-col>
                  </el-row>
                </div>
                <div class="total">
                  <el-row :gutter="10">
                    <el-col :span="14" class="align-right">{{ $root.labels.price }}:</el-col>
                    <el-col :span="10" class="align-right ">{{ getFormattedPrice(appointment.serviceTotalPrice) }}
                    </el-col>
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :span="14" class="align-right">{{ $root.labels.extras }}:</el-col>
                    <el-col :span="10" class="align-right ">{{ getFormattedPrice(appointment.extrasTotalPrice) }}
                    </el-col>
                  </el-row>
                  <el-row class="am-strong" :gutter="10">
                    <el-col :span="14" class="align-right">{{ $root.labels.total }}:</el-col>
                    <el-col :span="10" class="align-right ">
                      {{ getAppointmentPrice(savedAppointment ? savedAppointment.serviceId : appointment.serviceId, getAppointmentService(appointment), appointment.bookings, false) }}
                    </el-col>
                  </el-row>
                </div>
              </div>
              <div
                v-else-if="appointment.serviceId && appointment.providerId && appointment.extrasCount === 0"
              >
                <p align="center">{{ $root.labels.service_no_extras }}</p>
              </div>
              <div v-else>
                <p align="center">{{ $root.labels.no_selected_extras_requirements }}</p>
              </div>
            </div>

          </el-tab-pane>

          <!-- Payment -->
          <el-tab-pane
            v-if="appointment.id !== 0 && this.$root.settings.role !== 'customer'"
            :label="$root.labels.payment" name="payment"
          >
            <dialog-appointment-payment
              :appointment="appointment"
              :options="options"
              @editPayment="editPayment"
              :is-cabinet="isCabinet"
            ></dialog-appointment-payment>
          </el-tab-pane>

          <!-- Custom Fields -->
          <el-tab-pane
            v-if="showCustomFieldsTab() && this.$root.settings.role !== 'customer'"
            :label="$root.labels.custom_fields" name="customFields"
          >
            <dialog-custom-fields
              :appointment="appointment"
              :entityId="appointment.serviceId"
              :customFields="this.options.entities.customFields"
              :showCustomerInfo="true"
              :hide-attachment-custom-field="hideAttachmentCustomField"
              :is-cabinet="isCabinet"
              entityType="appointment"
              @clearValidation="clearValidation"
            >
            </dialog-custom-fields>
          </el-tab-pane>

          <!-- Zoom -->
          <el-tab-pane
            v-if="$root.settings.zoom.enabled && appointment.zoomMeeting"
            class="am-zoom-tabpane"
            :label="$root.labels.zoom" name="zoom"
          >
            <div v-if="this.$root.settings.role !== 'customer'">
              {{ $root.labels.zoom_start_link }}:
              <a class="am-link" :href="appointment.zoomMeeting.startUrl">
                {{ $root.labels.zoom_click_to_start }}
              </a>
            </div>
            <div>
              {{ $root.labels.zoom_join_link }}:
              <a class="am-link" :href="appointment.zoomMeeting.joinUrl">
                {{ $root.labels.zoom_click_to_join }}
              </a>
            </div>
          </el-tab-pane>
          <!-- /Zoom -->

          <!-- Lesson Space -->
          <el-tab-pane
            v-if="$root.settings.lessonSpace.enabled && appointment.lessonSpace"
            :label="$root.labels.lesson_space" name="lessonSpace"
            class="am-zoom-tabpane"
          >
            <div>
              {{ $root.labels.lesson_space_link }}:
              <a class="am-link" :href="appointment.lessonSpace">
                {{ $root.labels.lesson_space_join }}
              </a>
            </div>
          </el-tab-pane>
          <!-- /Lesson Space -->

          <!-- Recurring -->
          <el-tab-pane
            v-if="appointment.serviceId && getServiceById(appointment.serviceId).recurringCycle !== 'disabled' && (appointment.id ? recurringAppointments.length : activeRecurring)"
            :label="$root.labels.recurring" name="recurring"
          >
            <div v-if="appointment.id" class="am-recurring-dates-edit">
              <el-row v-for="(item, index) in recurringAppointments" :key="item.id">
                <el-col :span="3">
                  {{ index + 1 }}
                </el-col>
                <el-col :span="12">
                  {{ getFrontedFormattedDateTime(item.bookingStart) }}
                </el-col>
                <el-col :span="9">
                  <el-button @click="openRecurringAppointment(item.id)">
                    {{ $root.labels.edit }}
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <div v-else-if="appointment.selectedDate && appointment.selectedPeriod && activeRecurring">
              <recurring-setup
                :initialRecurringData="initialRecurringData"
                :recurringData="recurringData"
                :disabledWeekdays="disabledWeekdays"
                :availableDates="availableDates"
                :calendarTimeSlots="appointment.calendarTimeSlots"
                :occupiedTimeSlots="appointment.occupiedTimeSlots"
                :service="getServiceById(appointment.serviceId)"
                :isFrontend="false"
                :form-type="'recurring'"
                :forms-data="renderObject"
              >
              </recurring-setup>

              <recurring-dates
                dialogClass="am-recurring-dates"
                :recurringData="recurringData"
                :availableDates="availableDates"
                :calendarTimeSlots="appointment.calendarTimeSlots"
                :isFrontend="false"
                :form-type="'recurring'"
                :forms-data="renderObject"
                :service="getServiceById(appointment.serviceId)"
                :selectedExtras="getSelectedDistinctExtras()"
                @datesDefined="recurringDatesDefined"
              >
              </recurring-dates>
            </div>
            <div v-else-if="activeRecurring">
              <p align="center">{{ $root.labels.no_selected_slot_requirements }}</p>
            </div>
          </el-tab-pane>
          <!-- /Recurring -->

        </el-tabs>

      </el-form>
    </div>

    <!-- Dialog Actions -->
    <dialog-actions
      v-if="appointment !== null && !dialogLoading && this.$root.settings.role !== 'customer'"
      formName="appointment"
      urlName="appointments"
      :isNew="appointment.id === 0"
      :entity="appointment"
      :getParsedEntity="getParsedEntity"
      @errorCallback="errorCallback"
      @validationTabFailCallback="validationTabFailCallback"
      :haveSaveConfirmation="haveSaveConfirmation"
      :hasIcons="true"

      :status="{
        on: 'visible',
        off: 'hidden'
      }"

      :action="{
        haveAdd: true,
        haveEdit: true,
        haveStatus: false,
        haveRemove: $root.settings.capabilities.canDelete === true,
        haveRemoveEffect: false,
        haveDuplicate: haveDuplicate,
        haveSaveWarning: this.activeRecurring
      }"

      :message="{
        success: {
          save: $root.labels.appointment_saved,
          remove: $root.labels.appointment_deleted,
          show: '',
          hide: ''
        },
        confirm: {
          remove: $root.labels.confirm_delete_appointment,
          show: '',
          hide: '',
          duplicate: $root.labels.confirm_duplicate_appointment,
          save: $root.labels.recurring_changed_message
        }
      }"
    >
    </dialog-actions>

    <div>
      <div class="am-dialog-footer" v-if="this.$root.settings.role === 'customer'">
        <div class="am-dialog-footer-actions">
          <el-row>
            <el-col :sm="24" class="align-right">
              <el-button type="primary" @click="updateByCustomer" class="am-dialog-create">
                {{ $root.labels.save }}
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import formsCustomizationMixin from '../../../js/common/mixins/formsCustomizationMixin'
  import appointmentPriceMixin from '../../../js/backend/mixins/appointmentPriceMixin'
  import customFieldMixin from '../../../js/common/mixins/customFieldMixin'
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import durationMixin from '../../../js/common/mixins/durationMixin'
  import DialogActions from '../parts/DialogActions.vue'
  import DialogAppointmentPayment from './DialogAppointmentPayment'
  import DialogCustomFields from '../parts/DialogCustomFields'
  import entitiesMixin from '../../../js/common/mixins/entitiesMixin'
  import helperMixin from '../../../js/backend/mixins/helperMixin'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import moment from 'moment'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import priceMixin from '../../../js/common/mixins/priceMixin'
  import RecurringDates from '../../parts/RecurringDates.vue'
  import recurringMixin from '../../../js/common/mixins/recurringMixin'
  import RecurringSetup from '../../parts/RecurringSetup.vue'
  import windowMixin from '../../../js/backend/mixins/windowMixin'
  import customerMixin from '../../../js/backend/mixins/customerMixin'

  export default {

    mixins: [
      customerMixin,
      entitiesMixin,
      imageMixin,
      dateMixin,
      durationMixin,
      notifyMixin,
      priceMixin,
      customFieldMixin,
      appointmentPriceMixin,
      recurringMixin,
      helperMixin,
      windowMixin,
      formsCustomizationMixin
    ],

    props: {
      packageServices: null,
      selectedTimeZone: '',
      appointment: null,
      recurringAppointments: null,
      savedAppointment: null,
      bookings: null,
      options: null,
      customerCreatedCount: 0,
      showHeader: {
        required: false,
        default: true,
        type: Boolean
      },
      haveDuplicate: {
        required: false,
        default: true,
        type: Boolean
      },
      hideAttachmentCustomField: {
        required: false,
        default: false,
        type: Boolean
      },
      isCabinet: {
        type: Boolean,
        default: false,
        required: false
      }
    },

    data () {
      let validateServiceCapacity = (rule, bookings, callback) => {
        // this.$set(rule, 'type', 'array')
        if (this.appointment.serviceId && this.appointment.providerId) {
          if (this.isProviderService && this.getApprovedPersonsCount() > this.appointment.providerServiceMaxCapacity) {
            this.newAppointmentTabs = 'schedule'
            callback(new Error(this.$root.labels.select_max_customer_count_warning + ' ' + this.appointment.providerServiceMaxCapacity))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }

      let validateScheduleEmpty = (rule, value, callback) => {
        if (!value) {
          this.newAppointmentTabs = 'schedule'
        }

        callback()
      }

      return {
        searchSpacesTimer: null,
        loadingSpaces: false,
        spaces: [],
        searchSpacesCounter: 0,
        coupon: null,
        showCoupon: false,
        clonedBookings: null,
        cachedClonedBookings: [],
        serviceUpdated: false,
        calendarUpdated: false,
        recurringDatesChanged: false,
        selectedRecurringDates: [],
        activeRecurring: false,
        initialRecurringData: null,
        recurringData: {
          dates: [],
          startDate: null,
          startTime: null,
          pageRecurringDates: [],
          pagination: {
            show: this.$root.settings.general.itemsPerPage,
            page: 1,
            count: 0
          },
          recurringString: '',
          datesCallback: null,
          setupCallback: null
        },
        isProviderService: true,
        availableDates: [],
        categorySpinnerActive: false,
        dialogLoading: true,
        disabledWeekdays: null,
        employeeSpinnerActive: false,
        filter: null,
        locationSpinnerActive: false,
        mounted: false,
        newAppointmentTabs: 'schedule',
        serviceSpinnerActive: false,
        statusMessage: '',
        loadingTimeSlots: false,
        payment: {
          amount: 0,
          gateway: 'onSite'
        },
        rulesInit: {
          bookings: [
            {required: true, message: this.$root.labels.select_customer_warning, trigger: 'submit', type: 'array'},
            {validator: validateServiceCapacity, trigger: 'submit'}
          ],
          serviceId: [
            {required: true, message: this.$root.labels.select_service_warning, trigger: 'submit', type: 'number'}
          ],
          providerId: [
            {required: true, message: this.$root.labels.select_employee_warning, trigger: 'submit', type: 'number'}
          ],
          selectedDate: [
            {validator: validateScheduleEmpty, trigger: 'submit'},
            {required: true, message: this.$root.labels.select_date_warning, trigger: 'submit', type: 'date'}
          ],
          'selectedPeriod.time': [
            {validator: validateScheduleEmpty, trigger: 'submit'},
            {required: true, message: this.$root.labels.select_time_warning, trigger: 'submit'}
          ]
        },
        rules: {},
        statuses: [
          {
            id: 1,
            value: 'approved',
            label: this.$root.labels.approved

          }, {
            id: 0,
            value: 'pending',
            label: this.$root.labels.pending

          },
          {
            id: 2,
            value: 'canceled',
            label: this.$root.labels.canceled

          },
          {
            id: 3,
            value: 'rejected',
            label: this.$root.labels.rejected

          }
        ],

        // render object
        renderObject: {
          recurringSetupForm: {
            globalSettings: {
              formTextColor: '#ffffff',
              formGradientColor1: '#1A84EE',
              formGradientColor2: '#0454A2',
              formGradientAngle: 135,
              formInputColor: 'rgba(0, 0, 0, 0)',
              formInputTextColor: '#ffffff',
              formDropdownColor: '#ffffff',
              formDropdownTextColor: '#354052'
            },
            itemsStatic: {
              recurringSetupHeadingFormField: {
                labels: {
                  recurring_active: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  }
                },
                visibility: true
              },
              recurringSettingsFormField: {
                labels: {
                  recurring_repeat: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  },
                  recurring_every: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  },
                  recurring_on: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  },
                  recurring_until: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  },
                  recurring_times: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  }
                }
              }
            }
          },
          recurringDatesForm: {
            globalSettings: {
              formBackgroundColor: '#ffffff',
              formTextColor: '#354052',
              formInputColor: '#ffffff',
              formInputTextColor: '#354052',
              formDropdownColor: '#ffffff',
              formDropdownTextColor: '#354052'
            },
            itemsStatic: {
              recurringDatesHeadingFormField: {
                labels: {
                  recurring_appointments: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  },
                  recurring_edit: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  }
                },
                visibility: true
              },
              recurringInfoFormField: {
                labels: {
                  date: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  },
                  time: {
                    value: '',
                    translations: {
                      x: ''
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    mounted () {
      if (this.appointment && this.appointment.id === 0) {
        this.instantiateDialog()
      }

      this.rules = this.rulesInit
    },

    methods: {
      disableStatusChange () {
        return this.isCabinet && moment(this.appointment.bookingStart) < moment()
      },

      getAllowedServices () {
        let allowedServices = []

        if (this.packageServices && this.packageServices.length === 0) {
          return [this.getServiceById(this.appointment.serviceId)]
        }

        allowedServices = this.packageServices && this.packageServices.length
          ? this.servicesFiltered.filter(service => this.packageServices.map(packageService => packageService.id).indexOf(service.id) !== -1) : this.servicesFiltered

        if (this.packageServices &&
            this.packageServices.length &&
            this.appointment.id &&
            this.appointment.serviceId &&
            allowedServices.map(service => service.id).indexOf(this.appointment.serviceId) === -1
        ) {
          allowedServices.push(this.getServiceById(this.appointment.serviceId))
        }

        return allowedServices
      },

      filterServices () {
        this.options.entities['services'].forEach((s) => {
          s.disabled = false
        })
        let coupon = this.options.entities.coupons ? this.options.entities.coupons.find(c => c.id === this.coupon) : null
        if (coupon) {
          this.options.entities['services'].forEach(s => {
            if (!coupon.serviceList.map(se => se.id).includes(s.id)) s.disabled = true
          })
        }
      },

      searchExistingSpaces (query) {
        if (query) {
          this.searchSpaces(query)
        } else {
          setTimeout(() => {
            clearTimeout(this.searchSpacesTimer)
            this.spaces = this.options.entities.spaces
          }, 500)
        }
      },

      searchSpaces (query) {
        clearTimeout(this.searchSpacesTimer)

        this.loadingSpaces = true
        this.searchSpacesCounter++

        this.searchSpacesTimer = setTimeout(() => {
            let lastSearchCounter = this.searchSpacesCounter

            this.$http.get(`${this.$root.getAjaxUrl}/entities`, {
              params: { types: ['lessonSpace_spaces'] , lessonSpaceSearch: query}
            })
              .then(response => {
                let searchedSpaces = this.options.entities.spaces
                if (lastSearchCounter >= this.searchSpacesCounter) {
                  searchedSpaces = response.data.data.spaces
                }

                this.spaces = searchedSpaces
                this.loadingSpaces = false

              })
              .catch(e => {
                this.loadingSpaces = false
              })
          },
          500
        )
      },

      searchExistingCustomers (query) {
        if (query) {
          this.searchCustomers(query, this.setFilteredBookings)
        } else {
          setTimeout(() => {
            clearTimeout(this.searchCustomersTimer)
            this.setFilteredBookings(false)
          }, 500)
        }
      },

      setFilteredBookings (haveQuery) {
        let existingCustomersIds = []

        this.appointment.bookings.forEach(function (bookItem) {
          existingCustomersIds.push(bookItem.customerId)
        })

        let customers = this.searchedCustomers

        if (typeof haveQuery !== 'undefined' && !haveQuery) {
          customers = this.options.entities.customers
          this.clonedBookings = []
        }

        let alreadyAddedCustomersIds = this.clonedBookings.map(booking => booking.customer).map(customer => customer.id)

        customers.forEach((cusItem) => {
          if (existingCustomersIds.indexOf(cusItem.id) === -1 && alreadyAddedCustomersIds.indexOf(cusItem.id) === -1) {
            this.clonedBookings.push({
              id: 0,
              customer: cusItem,
              status: this.$root.settings.general.defaultAppointmentStatus,
              duration: this.appointment.serviceId ? this.getServiceById(this.appointment.serviceId).duration : null,
              persons: 1,
              total: 0,
              extras: [],
              payments: [],
              price: 0,
              coupon: null,
              added: false,
              visible: true,
              info: JSON.stringify({
                firstName: cusItem.firstName,
                lastName: cusItem.lastName,
                email: cusItem.email,
                phone: cusItem.phone
              }),
              aggregatedPrice: null,
              packageCustomerService: null,
              customFields: {}
            })
          }
        })

        let searchedCustomersIds = customers.map(customer => customer.id)

        for (let i = this.clonedBookings.length - 1; i >= 0; i--) {
          if (searchedCustomersIds.indexOf(this.clonedBookings[i].customer.id) === -1) {
            this.clonedBookings[i].visible = false
          } else {
            this.clonedBookings[i].visible = true
          }
        }
      },

      selectedTime () {
        let $this = this

        let selectedDateString = this.getStringFromDate(this.appointment.selectedDate)

        if (selectedDateString in this.appointment.calendarTimeSlots && this.appointment.selectedPeriod.time in this.appointment.calendarTimeSlots[selectedDateString]) {
          this.appointment.calendarTimeSlots[selectedDateString][this.appointment.selectedPeriod.time].forEach(function (employeeLocation) {
            if (employeeLocation[0] === $this.appointment.providerId) {
              $this.appointment.locationId = employeeLocation[1]
            }
          })
        }

        if (this.selectedRecurringDates.length) {
          this.$nextTick(() => {
            this.refreshRecurringData()
          })
        } else {
          this.setRecurringData()
        }

        this.clearValidation()
      },

      updateByCustomer () {
        this.dialogLoading = true

        let bookingStart = this.getStringFromDate(this.appointment.selectedDate) + ' ' + this.appointment.selectedPeriod.time

        this.$http.post(`${this.$root.getAjaxUrl}/bookings/reassign/${this.appointment.bookings[0].id}`, {
          'bookingStart': bookingStart
        })
          .then(response => {
            this.$emit('saveCallback', response)

            setTimeout(() => {
              this.dialogLoading = false
              this.$emit('closeDialog')
            }, 300)
            this.notify(this.$root.labels.success, this.$root.labels.appointment_rescheduled, 'success')
          })
          .catch(e => {
            if (e.response) {
              this.dialogLoading = false

              let $this = this

              setTimeout(function () {
                if ('timeSlotUnavailable' in e.response.data.data && e.response.data.data.timeSlotUnavailable === true) {
                  $this.notify($this.$root.labels.error, $this.$root.labels.time_slot_unavailable, 'error')
                }

                if ('rescheduleBookingUnavailable' in e.response.data.data && e.response.data.data.rescheduleBookingUnavailable === true) {
                  $this.notify($this.$root.labels.error, $this.$root.labels.booking_reschedule_exception, 'error')
                }
              }, 200)
            }
          })
      },

      editPayment (obj) {
        this.$emit('editPayment', obj)
      },

      instantiateDialog () {
        if (this.appointment !== null) {
          this.clonedBookings = JSON.parse(JSON.stringify(this.bookings))

          this.spaces = this.options.entities.spaces

          this.clonedBookings.forEach((booking) => {
            booking.visible = true
          })

          this.cachedClonedBookings = JSON.parse(JSON.stringify(this.clonedBookings))

          if (this.$root.settings.role === 'provider') {
            this.appointment.providerId = this.options.entities.employees[0].id
          }

          if (this.appointment.id !== 0) {
            this.activeRecurring = this.recurringAppointments.length > 0

            this.initialRecurringData = this.getDefaultRecurringSettings(
              this.appointment.selectedDate,
              this.getServiceById(this.appointment.serviceId).recurringCycle,
              this.appointment.calendarTimeSlots
            )

            this.setCategory()
            this.setLocation()
            this.handleCustomerChange()

            this.coupon = this.appointment.bookings[0].coupon ? this.appointment.bookings[0].coupon.id : null
            this.showCoupon = !!this.coupon

            this.getTimeSlots(function (timeSlots, occupiedSlots) {
              let $this = this

              let selectedTimeSlot = $this.appointment.bookingStart.split(' ')
              let selectedDate = selectedTimeSlot[0]
              let selectedTime = selectedTimeSlot[1].slice(0, -3)

              if (!(selectedDate in timeSlots)) {
                timeSlots[selectedDate] = {}
                timeSlots[selectedDate][selectedTime] = [[this.appointment.providerId, this.appointment.locationId]]
              } else if (!(selectedTime in timeSlots[selectedDate])) {
                let keys = Object.keys(timeSlots[selectedDate])

                keys.push(selectedTime)

                let sortedDateTimeSlots = {}

                keys.sort().forEach(function (timeKey) {
                  if (timeKey === selectedTime) {
                    sortedDateTimeSlots[timeKey] = [$this.appointment.providerId]
                  } else {
                    sortedDateTimeSlots[timeKey] = timeSlots[selectedDate][timeKey]
                  }
                })

                timeSlots[selectedDate] = sortedDateTimeSlots
              }

              this.appointment.selectedDate = moment(selectedDate).toDate()
              this.appointment.selectedPeriod = {
                time: selectedTime,
                employee: $this.appointment.providerId
              }

              this.updateCalendar(timeSlots, occupiedSlots)
            }.bind(this))
          } else if (this.appointment.serviceId !== '') {
            this.setCategory()
            this.setLocation()
            this.getTimeSlots(this.updateCalendar)
          } else if (this.appointment.id === 0) {
            this.dialogLoading = false
            this.showCoupon = true
          }

          this.mounted = true
        }
      },

      setCategory () {
        this.appointment.categoryId = this.options.entities.services.filter(
          service => service.id === this.appointment.serviceId
        )[0].categoryId
      },

      setLocation () {
        this.appointment.locationId = this.appointment.locationId ? this.appointment.locationId : this.options.entities.employees.filter(employee => this.appointment.providerId === employee.id)[0].locationId
      },

      closeDialog () {
        this.$emit('closeDialog')
      },

      getParsedEntity () {
        let bookings = []

        this.appointment.bookings.forEach((bookItem) => {
          let extras = []

          for (let key in bookItem.customFields) {
            if (bookItem.customFields[key].type === 'datepicker' && bookItem.customFields[key].value) {
              bookItem.customFields[key].value = bookItem.customFields[key].value instanceof Date
                ? this.getStringFromDate(bookItem.customFields[key].value)
                : bookItem.customFields[key].value
            }
          }

          bookItem.extras.forEach(function (extItem) {
            if (extItem.selected) {
              extras.push({
                id: extItem.id,
                customerBookingId: bookItem.id,
                extraId: extItem.extraId,
                quantity: extItem.quantity,
                price: extItem.price
              })
            }
          })

          let bookingData = {
            id: bookItem.id,
            customerId: bookItem.customer.id,
            customer: bookItem.customer,
            status: bookItem.status,
            duration: bookItem.duration,
            persons: bookItem.persons,
            extras: extras,
            customFields: JSON.stringify(bookItem.customFields),
            payments: bookItem.payments,
            packageCustomerService: bookItem.packageCustomerService
          }

          bookingData['coupon'] = (this.$root.settings.role === 'admin' || this.$root.settings.role === 'manager') && this.options.entities.coupons
            ? this.options.entities.coupons.find(c => c.id === this.coupon) : bookItem.coupon

          bookings.push(bookingData)
        })

        if (this.activeRecurring && 'dates' in this.recurringData && this.recurringData.dates.length) {
          this.recurringData.dates.forEach((dateData, index) => {
            if (index in this.selectedRecurringDates) {
              this.selectedRecurringDates[index].bookingStart = moment(dateData.date).format('YYYY-MM-DD') + ' ' + dateData.time
            }
          })
        }

        let bookingStart = this.getStringFromDate(this.appointment.selectedDate) + ' ' + this.appointment.selectedPeriod.time

        if (this.selectedTimeZone === 'UTC' && this.$root.settings.general.showClientTimeZone) {
          bookingStart = moment(bookingStart, 'YYYY-MM-DD HH:mm').utc().format('YYYY-MM-DD HH:mm')
        }

        let removedBookings = []

        if (this.savedAppointment && 'bookings' in this.savedAppointment) {
          let bookingsIds = bookings.map(booking => booking.id)

          this.savedAppointment.bookings.forEach((savedBooking) => {
            if (bookingsIds.indexOf(savedBooking.id) === -1) {
              removedBookings.push(savedBooking)
            }
          })
        }

        bookings.forEach((booking) => {
          let bookingCustomFields = this.getAllowedCustomFields(
            JSON.parse(booking.customFields),
            'services',
            this.appointment.serviceId
          )

          booking.customFields = JSON.stringify(bookingCustomFields)
        })

        return {
          'serviceId': this.appointment.serviceId,
          'providerId': this.appointment.providerId,
          'locationId': this.appointment.locationId,
          'bookings': bookings,
          'removedBookings': removedBookings,
          'bookingStart': bookingStart,
          'utc': this.selectedTimeZone === 'UTC',
          'timeZone': this.selectedTimeZone === 'UTC' ? null : this.selectedTimeZone,
          'notifyParticipants': this.appointment.notifyParticipants ? 1 : 0,
          'internalNotes': this.appointment.internalNotes,
          'id': this.appointment.id,
          'payment': this.payment,
          'recurring': this.activeRecurring ? this.selectedRecurringDates : [],
          'lessonSpace': this.appointment.lessonSpace ? 'https://www.thelessonspace.com/space/' + this.appointment.lessonSpace : null
        }
      },

      showDialogNewCustomer () {
        this.$emit('showDialogNewCustomer')
      },

      getPossibleCustomDurations (booking) {
        let service = this.getServiceById(this.appointment.serviceId)

        let durations = service.customPricing.durations.map(i => i.duration)

        durations.push(service.duration)

        if (booking.duration && durations.indexOf(booking.duration) === -1) {
          durations.push(booking.duration)
        }

        durations.sort(function (a, b) { return a - b })

        return durations
      },

      handleBookingDurationChange () {
        let service = this.appointment.serviceId ? this.getServiceById(this.appointment.serviceId) : null

        if (service && service.customPricing) {
          if (service.customPricing.enabled) {
            this.setDuration()
          }

          this.appointment.bookings.forEach((booking) => {
            if (!booking.duration || service.customPricing.durations.filter(i => i.duration === booking.duration).length === 0) {
              booking.duration = service.duration
            }
          })
        }
      },

      handleCustomerChange () {
        let duration = this.appointment.duration

        this.setServiceExtrasForCustomers(false)
        this.handleBookingDurationChange()
        this.setPrice()
        this.setServiceCapacityForProvider()
        this.setBookingCustomFields()
        this.addCustomFieldsValidationRules()

        if (duration !== this.appointment.duration && this.mounted) {
          this.getTimeSlots(this.updateCalendar)
        }
        this.showCoupon = true

        let cachedCustomersIds = this.cachedClonedBookings.map(booking => booking.customer).map(customer => customer.id)

        let existingCustomersIds = this.clonedBookings.map(booking => booking.customer).map(customer => customer.id)

        let missingCustomersIds = []

        cachedCustomersIds.forEach((customerId) => {
          if (existingCustomersIds.indexOf(customerId) === -1) {
            missingCustomersIds.push(customerId)
          }
        })

        for (let i = this.clonedBookings.length - 1; i >= 0; i--) {
          if (missingCustomersIds.indexOf(this.clonedBookings[i].customer.id) !== -1) {
            this.clonedBookings.splice(i, 1)
          }
        }

        setTimeout(() => {
          this.clonedBookings.forEach((booking) => {
            booking.visible = true
          })

          this.cachedClonedBookings = JSON.parse(JSON.stringify(this.clonedBookings))
        }, 200)

        this.$emit('sortBookings', this.appointment.bookings)
      },

      handleCustomerRemove (index) {
        let duration = this.appointment.duration

        for (let i = this.clonedBookings.length - 1; i >= 0; i--) {
          if (this.clonedBookings[i].customer.id === this.appointment.bookings[index].customer.id) {
            this.clonedBookings.splice(i, 1)
          }
        }

        this.clearValidation()
        this.appointment.bookings.splice(index, 1)
        this.setPrice()
        this.setSelectedExtrasCount()
        this.setDuration()

        if (duration !== this.appointment.duration && this.mounted) {
          this.getTimeSlots(this.updateCalendar)
        }
      },

      setServiceExtrasForCustomers (resetExtras) {
        let $this = this

        let extras = null

        if ($this.appointment.serviceId) {
          $this.options.entities.services.forEach(function (serItem) {
            if (serItem.id === $this.appointment.serviceId) {
              extras = serItem.extras
              $this.appointment.extrasCount = extras.length
            }
          })

          $this.appointment.bookings.forEach(function (bookItem) {
            if (resetExtras || (!bookItem.id && !bookItem.added)) {
              bookItem.extras = JSON.parse(JSON.stringify(extras))
              bookItem.extras.forEach(function (extItem) {
                extItem.selected = false
                extItem.id = 0
                extItem.customerBookingId = 0
              })
            }

            bookItem.added = true
          })

          this.setSelectedExtrasCount()
          this.setDuration()
        }
      },

      handleSelected () {
        let $this = this
        let selected = document.querySelectorAll('.am-appointment-status-option.selected')
        for (let i = 0; i < selected.length; i++) {
          selected[i].addEventListener('click', function (e) {
            $this.handleGroupStatusChange()
          })
        }
      },

      handleGroupStatusChange () {
        this.clearValidation()
        let $this = this

        this.appointment.bookings.forEach(function (bookItem) {
          bookItem.status = $this.appointment.status
        })
      },

      handleEmployeeChange () {
        this.serviceSpinnerActive = true
        this.locationSpinnerActive = true
        this.categorySpinnerActive = true

        this.setServiceExtrasForCustomers(false)
        this.setServiceCapacityForProvider()
        this.setPrice()

        if (this.mounted) {
          this.getTimeSlots(this.updateCalendar)
        }

        setTimeout(() => {
          this.serviceSpinnerActive = false
          this.locationSpinnerActive = false
          this.categorySpinnerActive = false
        }, 300)
      },

      handleLocationChange () {
        this.clearValidation()
        this.serviceSpinnerActive = true
        this.employeeSpinnerActive = true
        this.categorySpinnerActive = true

        if (this.mounted) {
          this.getTimeSlots(this.updateCalendar)
        }

        setTimeout(() => {
          this.serviceSpinnerActive = false
          this.employeeSpinnerActive = false
          this.categorySpinnerActive = false
        }, 300)
      },

      handleServiceChange () {
        this.locationSpinnerActive = true
        this.employeeSpinnerActive = true
        this.categorySpinnerActive = true

        this.setServiceCapacityForProvider()
        this.handleBookingDurationChange()
        this.setPrice()
        this.setServiceExtrasForCustomers(true)
        this.addCustomFieldsValidationRules()
        this.serviceUpdated = true
        if (this.mounted) {
          this.getTimeSlots(this.updateCalendar)
        }

        setTimeout(() => {
          this.locationSpinnerActive = false
          this.employeeSpinnerActive = false
          this.categorySpinnerActive = false
        }, 300)
      },

      handleCategoryChange () {
        this.clearValidation()
        this.locationSpinnerActive = true
        this.employeeSpinnerActive = true
        this.serviceSpinnerActive = true

        setTimeout(() => {
          this.locationSpinnerActive = false
          this.employeeSpinnerActive = false
          this.serviceSpinnerActive = false
        }, 300)
      },

      getProviderService () {
        let $this = this
        let serviceProvider = null

        if (this.appointment.providerId && this.appointment.serviceId) {
          this.options.entities.employees.forEach(function (proItem) {
            if (proItem.id === $this.appointment.providerId) {
              proItem.serviceList.forEach(function (proSerItem) {
                if (proSerItem.id === $this.appointment.serviceId) {
                  serviceProvider = proSerItem
                }
              })
            }
          })
        }

        if (this.appointment.id && this.appointment.serviceId && !serviceProvider) {
          this.isProviderService = false
          return this.getServiceById(this.appointment.serviceId)
        }

        return serviceProvider
      },

      setServiceCapacityForProvider () {
        let providerService = this.getProviderService()

        let service = this.appointment.serviceId ? this.getServiceById(this.appointment.serviceId) : null

        this.appointment.providerServiceMaxCapacity = providerService ? providerService.maxCapacity : 0
        this.appointment.providerServiceMaxAdditonalCapacity = service && service.maxExtraPeople !== null && (!providerService || service.maxExtraPeople < providerService.maxCapacity)  ? (service.maxExtraPeople + 1) : (providerService ? providerService.maxCapacity : 0)
        this.appointment.providerServiceMinCapacity = providerService ? providerService.minCapacity : 0

        this.setStatusMessage()
      },

      setStatusMessage () {
        this.statusMessage = this.getApprovedPersonsCount() < this.appointment.providerServiceMinCapacity ? '(minimum ' + this.appointment.providerServiceMinCapacity + ')' : ''
      },

      handleBookingChange () {
        let duration = this.appointment.duration

        this.handleBookingDurationChange()
        this.setPrice()
        this.setStatusMessage()

        if (duration !== this.appointment.duration) {
          this.getTimeSlots(this.updateCalendar)
        }
      },

      getApprovedPersonsCount () {
        let customersCount = 0

        this.appointment.bookings.forEach(function (bookItem) {
          if (bookItem.status === 'approved') {
            customersCount += bookItem.persons
          }
        })

        return customersCount
      },

      setPrice () {
        this.clearValidation()
        let $this = this

        let isChangedServicePrice = this.appointment && this.savedAppointment ? this.appointment.serviceId !== parseInt(this.savedAppointment.serviceId) : false

        $this.$nextTick(() => {
          if ($this.appointment.serviceId && $this.appointment.providerId && $this.appointment.bookings) {
            let providerService = $this.getProviderService()
            let service = $this.getServiceById($this.appointment.serviceId)

            let serviceTotalPrice = 0
            let extrasTotalPrice = 0
            let discountTotalPrice = 0

            $this.appointment.bookings.forEach(function (booking) {
              if (['approved', 'pending'].includes(booking.status)) {
                let isChangedBookingDuration = (booking.duration === null ? providerService.duration : booking.duration) !== providerService.duration

                let providerServicePrice = $this.getBookingServicePrice(providerService, booking)

                let bookingExtrasTotalPrice = 0

                let aggregatedPrice = booking.id ? booking.aggregatedPrice : service.aggregatedPrice

                booking.extras.forEach(function (extItem) {
                  if (extItem.selected) {
                    let serviceExtra = service.extras.filter(extra => extra.id === extItem.extraId)

                    let extraPrice = booking.id ? extItem.price : (serviceExtra.length ? serviceExtra[0].price : 0)

                    let aggregatedExtraPrice = extItem.aggregatedPrice === null ? (booking.id ? booking.aggregatedPrice : service.aggregatedPrice) : extItem.aggregatedPrice

                    bookingExtrasTotalPrice += (aggregatedExtraPrice ? booking.persons : 1) * (extItem.quantity ? extItem.quantity : 0) * extraPrice
                  }
                })

                let servicePricePrice = booking.id ? (isChangedServicePrice || isChangedBookingDuration ? providerServicePrice : booking.price) : providerServicePrice

                booking.extrasTotalPrice = bookingExtrasTotalPrice
                booking.serviceTotalPrice = servicePricePrice * (aggregatedPrice ? booking.persons : 1)
                booking.discountTotalPrice = (booking.serviceTotalPrice + booking.extrasTotalPrice) / 100 * (booking.coupon ? booking.coupon.discount : 0) + (booking.coupon ? booking.coupon.deduction : 0)

                serviceTotalPrice += booking.serviceTotalPrice
                extrasTotalPrice += booking.extrasTotalPrice
                discountTotalPrice += booking.discountTotalPrice
              }
            })

            $this.appointment.serviceTotalPrice = serviceTotalPrice
            $this.appointment.extrasTotalPrice = extrasTotalPrice
            $this.appointment.discountTotalPrice = discountTotalPrice
          }
        })
      },

      handleExtrasSelectionChange (item) {
        if (typeof item.quantity === 'undefined') {
          item.quantity = 1
        }

        this.setPrice()
        this.setSelectedExtrasCount()
        this.setDuration()

        if (item.duration > 0 && this.mounted) {
          this.getTimeSlots(this.updateCalendar)
        }
      },

      updateCalendar (timeSlots, occupiedSlots) {
        let $this = this

        this.appointment.calendarTimeSlots = timeSlots

        this.appointment.occupiedTimeSlots = occupiedSlots

        let availableDates = []

        this.useSortedDateStrings(Object.keys(this.appointment.calendarTimeSlots)).forEach(function (dateString) {
          availableDates.push($this.getDate(dateString))
        })

        this.availableDates = availableDates

        this.disabledWeekdays = {weekdays: []}

        this.disabledWeekdays = (this.availableDates.length === 0) ? {weekdays: [1, 2, 3, 4, 5, 6, 7]} : null

        this.dateChange()
      },

      getTimeSlots (callback) {
        let appointment = this.appointment

        let extras = []

        if (appointment.serviceId) {
          this.loadingTimeSlots = true

          this.appointment.bookings.forEach(function (bookItem) {
            bookItem.extras.forEach(function (extItem) {
              if (extItem.selected) {
                extras.push({
                  id: extItem.extraId,
                  quantity: extItem.quantity
                })
              }
            })
          })

          this.$http.get(`${this.$root.getAjaxUrl}/slots`, {
            params: this.getAppropriateUrlParams({
              serviceId: appointment.serviceId,
              serviceDuration: this.getMaxBookingDuration(),
              locationId: appointment.locationId,
              providerIds: appointment.providerId ? [appointment.providerId] : [],
              extras: JSON.stringify(extras),
              excludeAppointmentId: appointment.id,
              group: this.$root.settings.role === 'customer' ? 1 : 0,
              timeZone: this.selectedTimeZone,
              page: 'appointments'
            })
          })
            .then(response => {
              let converting =
                this.selectedTimeZone === 'UTC' &&
                (
                  this.$root.settings.general.showClientTimeZone ||
                  (this.$root.settings.role === 'provider' && this.isCabinet)
                )

              callback(
                converting ? this.getConvertedTimeSlots(response.data.data.slots) : response.data.data.slots,
                converting ? this.getConvertedTimeSlots(response.data.data.occupied) : response.data.data.occupied
              )
              this.dialogLoading = false
              this.loadingTimeSlots = false
            })
            .catch(e => {
              console.log(e.message)
              this.loadingTimeSlots = false
            })
        }
      },

      dateChange () {
        this.clearValidation()
        let $this = this
        let timeSlots = []
        let dateTimeSlots = null
        let selectedPeriodExists = false

        if (this.appointment.selectedDate &&
          this.appointment.calendarTimeSlots &&
          (dateTimeSlots = this.appointment.calendarTimeSlots[this.getStringFromDate(this.appointment.selectedDate)])
        ) {
          Object.keys(dateTimeSlots).forEach(function (key) {
            if ($this.appointment.selectedPeriod && $this.appointment.selectedPeriod.hasOwnProperty('time') && $this.appointment.selectedPeriod.time === key) {
              selectedPeriodExists = true
            }

            timeSlots.push({
              'time': key,
              'employees': dateTimeSlots[key]
            })
          })

          if (!selectedPeriodExists) {
            this.appointment.selectedPeriod = ''
          }
        } else {
          this.appointment.selectedDate = null
          this.appointment.selectedPeriod = ''
        }

        this.appointment.dateTimeSlots = timeSlots

        this.$nextTick(() => {
          this.refreshRecurringData()
        })
      },

      openRecurringAppointment (id) {
        this.$emit('openRecurringAppointment', id)
      },

      handleTabClick (tab) {
        if (tab.name === 'recurring') {
          this.calendarUpdated = false
          this.recurringDatesChanged = false
        }
      },

      haveSaveConfirmation () {
        let haveConfirm = this.activeRecurring && this.recurringDatesChanged && this.calendarUpdated

        if (haveConfirm) {
          this.recurringDatesChanged = false
          this.showRecurringTab()
        }

        return haveConfirm
      },

      getSelectedDistinctExtras () {
        let selectedExtras = []
        let selectedExtrasIds = []

        this.appointment.bookings.forEach((booking) => {
          booking.extras.filter(extra => extra.selected).forEach((extra) => {
            if (selectedExtrasIds.indexOf(extra.id) === -1) {
              selectedExtras.push(extra)
              selectedExtrasIds.push(extra.id)
            }
          })
        })

        return selectedExtras
      },

      refreshRecurringData () {
        if (this.activeRecurring && this.appointment.selectedDate && this.appointment.selectedPeriod) {
          if (this.serviceUpdated) {
            this.serviceUpdated = false
            this.setRecurringData()
          }

          this.calendarUpdated = true
          this.activeRecurring = false
          this.recurringData.startDate = moment(this.appointment.selectedDate).format('YYYY-MM-DD HH:mm:ss')
          this.recurringData.startTime = this.appointment.selectedPeriod.time
          this.initialRecurringData.calendarDates = this.getAvailableRecurringDates(this.appointment.calendarTimeSlots)
          this.activeRecurring = true

          if (this.recurringData.setupCallback !== null) {
            this.recurringData.setupCallback('count')
          }
        }
      },

      recurringDatesDefined (recurringDates) {
        let newRecurringDates = []

        recurringDates.forEach((item) => {
          newRecurringDates.push({
            bookingStart: moment(item.date).format('YYYY-MM-DD') + ' ' + item.time,
            providerId: item.providerId,
            locationId: item.locationId
          })
        })

        this.recurringDatesChanged = false

        if (newRecurringDates.length !== this.selectedRecurringDates.length) {
          this.recurringDatesChanged = true
        } else {
          for (let i = 0; i < newRecurringDates.length; i++) {
            if (newRecurringDates[i].bookingStart !== this.selectedRecurringDates[i].bookingStart) {
              this.recurringDatesChanged = true
            }
          }
        }

        this.selectedRecurringDates = newRecurringDates
      },

      setRecurringData () {
        if (this.appointment.selectedDate && this.appointment.selectedPeriod) {
          this.recurringData.dates = []
          this.recurringData.startDate = moment(this.appointment.selectedDate).format('YYYY-MM-DD HH:mm:ss')
          this.recurringData.startTime = this.appointment.selectedPeriod.time

          let service = this.getServiceById(this.appointment.serviceId)

          this.initialRecurringData = this.getDefaultRecurringSettings(
            this.appointment.selectedDate,
            service.recurringCycle,
            this.appointment.calendarTimeSlots
          )
        }
      },

      setSelectedExtrasCount () {
        let extrasSelectedCount = 0

        this.appointment.bookings.forEach(function (bookItem) {
          bookItem.extras.forEach(function (extItem) {
            if (extItem.selected) {
              extrasSelectedCount++
            }
          })
        })

        this.appointment.extrasSelectedCount = extrasSelectedCount
      },

      getMaxBookingDuration () {
        let maxBookingDuration = 0

        this.appointment.bookings.forEach(function (bookItem) {
          if ((bookItem.status === 'pending' || bookItem.status === 'approved') && bookItem.duration > maxBookingDuration) {
            maxBookingDuration = bookItem.duration
          }
        })

        return maxBookingDuration
      },

      setDuration () {
        if (this.appointment.serviceId) {
          let maxBookingDuration = this.getMaxBookingDuration()

          let duration = maxBookingDuration !== 0 ? maxBookingDuration : this.getServiceById(this.appointment.serviceId).duration

          this.appointment.bookings.forEach(function (bookItem) {
            let maxExtraDuration = 0

            bookItem.extras.forEach(function (extItem) {
              if (extItem.selected && extItem.duration > maxExtraDuration) {
                maxExtraDuration = extItem.duration
              }
            })

            duration += maxExtraDuration
          })

          this.appointment.duration = duration
        }
      },

      clearValidation () {
        if (typeof this.$refs.appointment !== 'undefined') {
          this.$refs.appointment.clearValidate()
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

      addCustomFieldsValidationRules () {
        if (this.appointment.serviceId && this.appointment.bookings.length > 0) {
          this.rules = this.rulesInit

          // Go through all bookings
          for (let i = 0; i < this.appointment.bookings.length; i++) {
            // Go through all custom fields
            for (let j = 0; j < this.options.entities.customFields.length; j++) {
              // Check if custom fields is assigned to selected service
              if (this.isCustomFieldVisible(this.options.entities.customFields[j], 'appointment', this.appointment.serviceId)) {
                if (typeof this.rules.bookings[i] === 'undefined') {
                  this.$set(this.rules.bookings, i, {type: 'array'})
                }

                if (typeof this.rules.bookings[i].customFields === 'undefined') {
                  this.$set(this.rules.bookings[i], 'customFields', {})
                }

                this.rules.bookings[i].customFields[this.options.entities.customFields[j].id] = {
                  value: [
                    {required: true, message: this.$root.labels.required_field, trigger: 'submit'}
                  ]
                }
              }
            }
          }
        }
      },

      showCustomFieldsTab () {
        let servicesIdsWithCustomField = Array.prototype.concat.apply(
          [], this.options.entities.customFields.map(customField => customField.services.map(service => service.id))
        )

        return this.options.entities.customFields.length > 0 &&
          this.appointment.bookings.length > 0 &&
          this.appointment.serviceId &&
          (servicesIdsWithCustomField.includes(this.appointment.serviceId) || this.options.entities.customFields.filter(cf => cf.allServices).length > 0)
      },

      showRecurringTab () {
        if (this.activeRecurring) {
          this.newAppointmentTabs = 'recurring'
        }
      },

      validationTabFailCallback () {
        this.newAppointmentTabs = 'customFields'
      }
    },

    computed: {
      selectedCustomersMessage () {
        return this.statusMessage !== '' ? this.$root.labels.selected_customers + ' ' + this.statusMessage + ':' : this.$root.labels.selected_customers + ':'
      },

      customersMaxLimit () {
        if (this.appointment.serviceId && this.appointment.providerId && this.getProviderService()) {
          return this.getProviderService().maxCapacity
        }

        if (this.appointment.serviceId && !this.appointment.providerId) {
          return this.getServiceById(this.appointment.serviceId).maxCapacity
        }

        return 0
      },

      showCustomer () {
        return this.$root.settings.role !== 'customer'
      }
    },

    watch: {
      'customerCreatedCount' () {
        let customersIds = this.clonedBookings.map(booking => booking.customer.id)

        this.bookings.forEach((booking) => {
          if (customersIds.indexOf(booking.customer.id) === -1) {
            booking.visible = true

            this.clonedBookings.push(booking)
          }
        })

        this.clonedBookings.sort(function (a, b) {
          return (a.customer.firstName + ' ' + a.customer.lastName).localeCompare((b.customer.firstName + ' ' + b.customer.lastName))
        })

        this.addCustomFieldsValidationRules()
      },
      'appointment' () {
        this.instantiateDialog()

        if (this.$root.settings.role === 'provider' && this.isCabinet && this.appointment !== null && this.appointment.providerId !== null) {
          this.appointment.providerId = this.options.entities.employees[0].id
        }
      }
    },

    components: {
      DialogAppointmentPayment,
      DialogCustomFields,
      RecurringSetup,
      RecurringDates,
      DialogActions
    }
  }
</script>
