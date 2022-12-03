<template>
  <div class="am-wrap">
    <div id="am-finance" class="am-body">

      <!-- Page Header -->
      <page-header
          :financeTotal="displayTotalCount"
          :addNewCouponBtnDisplay="addNewCouponBtnDisplay"
          @newCouponBtnClicked="showDialogNewCoupon()"
      >
      </page-header>

      <!-- Spinner -->
      <div class="am-spinner am-section" v-show="isPaymentsFiltering && isCouponsFiltering">
        <img :src="$root.getUrl + 'public/img/spinner.svg'"/>
      </div>

      <!-- Finance -->
      <div class="am-finances am-section">

        <el-tabs v-model="financeTabs" @tab-click="handleTabClick" v-show="!isPaymentsFiltering || !isCouponsFiltering">
          <el-tab-pane :label="$root.labels.payments" name="payments">

            <!-- Filter Finance -->
            <div
                class="am-finance-filter"
                v-show="hasPayments"
            >
              <el-form class="" :action="exportPaymentsAction" method="POST">
                <el-row :gutter="16">

                  <!-- Date Filter -->
                  <el-col :md="24" :lg="5" class="v-calendar-column">
                    <el-form-item class="calc-width-mobile">
                      <v-date-picker
                          @input="changeRange"
                          v-model="paymentsParams.dates"
                          :is-double-paned="true"
                          mode='range'
                          popover-visibility="focus"
                          popover-direction="bottom"
                          tint-color='#1A84EE'
                          :show-day-popover=false
                          :input-props='{class: "el-input__inner"}'
                          :is-expanded=false
                          :is-required=true
                          input-class="el-input__inner"
                          :placeholder="$root.labels.pick_a_date"
                          :formats="vCalendarFormats"
                      >
                      </v-date-picker>
                    </el-form-item>
                  </el-col>

                  <transition name="fade">
                    <div class="am-filter-fields" v-show="filterPaymentsFields">
                      <!-- Customers Filter -->
                      <el-col :md="6" :lg="4">
                        <el-form-item>
                          <el-select
                              v-model="paymentsParams.customerId"
                              filterable
                              clearable
                              :placeholder="$root.labels.customer"
                              @change="filterPayments"
                              remote
                              :remote-method="searchCustomers"
                              :loading="loadingCustomers"
                          >
                            <el-option
                                v-for="(item, key) in searchedCustomers.length ? searchedCustomers : options.entities.customers"
                                :key="key"
                                :label="item.firstName + ' ' + item.lastName"
                                :value="item.id"
                            >
                            </el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <!-- Employees Filter -->
                      <el-col :md="6" :lg="4">
                        <el-form-item>
                          <el-select
                              v-model="paymentsParams.providerId"
                              filterable
                              clearable
                              :placeholder="$root.labels.employee"
                              @change="filterPayments"
                          >
                            <el-option
                                v-for="item in visibleEmployees"
                                :key="item.id"
                                :label="item.firstName + ' ' + item.lastName"
                                :value="item.id"
                            >
                            </el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <!-- Services Filter -->
                      <el-col :md="6" :lg="4">
                        <el-form-item>
                          <el-select
                              v-model="paymentsParams.services"
                              multiple
                              filterable
                              :placeholder="$root.labels.services"
                              @change="filterPayments"
                              collapse-tags
                          >
                            <div v-for="category in options.entities.categories"
                                 :key="category.id">
                              <div class="am-drop-parent"
                                   @click="selectAllInCategoryFinance(category.id)"
                              >
                                <span>{{ category.name }}</span>
                              </div>
                              <el-option
                                  v-for="service in category.serviceList"
                                  :key="service.id"
                                  :label="service.name"
                                  :value="service.id"
                                  class="am-drop-child"
                              >
                              </el-option>
                            </div>
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <!-- Events Filter -->
                      <el-col :md="6" :lg="4">
                        <el-form-item>
                          <el-select
                              v-model="paymentsParams.events"
                              multiple
                              clearable
                              :placeholder="$root.labels.events"
                              @change="filterPayments"
                          >
                            <el-option
                                v-for="item in options.entities.events"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            >
                            </el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <!-- Status Filter -->
                      <el-col :md="6" :lg="3">
                        <el-form-item>
                          <el-select
                              v-model="paymentsParams.status"
                              clearable
                              :placeholder="$root.labels.status"
                              class="calc-width"
                              @change="filterPayments"
                          >
                            <el-option
                                v-for="item in statuses"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                              <span>{{ item.label }}</span>
                            </el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </div>
                  </transition>

                  <div class="">

                    <!-- Toggle More Filters -->
                    <el-button
                        class="button-filter-toggle am-button-icon"
                        title="Toggle Filters"
                        @click="filterPaymentsFields = !filterPaymentsFields"
                    >
                      <img class="svg-amelia" alt="Toggle Filters" :src="$root.getUrl + 'public/img/filter.svg'"/>
                    </el-button>

                    <!-- Export Payments -->
                    <el-tooltip placement="top">
                      <div slot="content" v-html="$root.labels.export_tooltip_payments"></div>
                      <el-button
                              class="button-export am-button-icon"
                              @click="dialogPaymentsExport = true"
                      >
                        <img class="svg-amelia" alt="Export" :src="$root.getUrl+'public/img/export.svg'"/>
                      </el-button>
                    </el-tooltip>

                  </div>

                </el-row>

                <!-- Dialog Export Payments -->
                <transition name="slide">
                  <el-dialog
                      :close-on-click-modal="false"
                      class="am-side-dialog am-dialog-export"
                      :visible.sync="dialogPaymentsExport"
                      :show-close="false"
                      v-if="dialogPaymentsExport"
                  >
                    <dialog-export
                        :data="Object.assign(paymentsParams, exportParamsPayments)"
                        :action="$root.getAjaxUrl + '/report/payments'"
                        @updateAction="(action) => {this.exportPaymentsAction = action}"
                        @closeDialogExport="dialogPaymentsExport = false"
                    >
                    </dialog-export>
                  </el-dialog>
                </transition>

              </el-form>
            </div>

            <!-- Spinner -->
            <div class="am-spinner am-section"
                 v-show="isPaymentsFiltering"
            >
              <img :src="$root.getUrl + 'public/img/spinner.svg'"/>
            </div>

            <!-- Empty State -->
            <div class="am-empty-state am-section"
                 v-if="!hasPayments && !isPaymentsFiltering">
              <img :src="$root.getUrl + 'public/img/emptystate.svg'">
              <h2>{{ $root.labels.no_payments_yet }}</h2>
              <p></p>
            </div>

            <!-- Table Header -->
            <div
                class="am-finance-list-head"
                v-show="hasPayments && hasPaymentsFiltered && !isPaymentsFiltering"
            >
              <el-row>

                <!-- Payment Date, Customer, Employee -->
                <el-col :lg="14">
                  <el-row :gutter="10" class="am-finance-flex-row-middle-align">

                    <!-- Check All -->
                    <el-col :lg="2" v-if="$root.settings.capabilities.canDelete === true">
                      <p>
                        <el-checkbox
                            v-model="checkPaymentData.allChecked"
                            @change="checkPaymentData = handleCheckAll(payments, checkPaymentData)">
                        </el-checkbox>
                      </p>
                    </el-col>

                    <!-- Payment Date -->
                    <el-col :lg="6">
                      <p>{{ $root.labels.payment_date }}:</p>
                    </el-col>

                    <!-- Customer -->
                    <el-col :lg="8">
                      <p>{{ $root.labels.customer }}:</p>
                    </el-col>

                    <!-- Employee -->
                    <el-col :lg="8">
                      <p>{{ $root.labels.employee }}:</p>
                    </el-col>
                  </el-row>

                </el-col>

                <!-- Service, Status -->
                <el-col :lg="10">
                  <el-row :gutter="10" class="am-finance-flex-row-middle-align">
                    <el-col :lg="0" class="hide-on-mobile"></el-col>

                    <!-- Service -->
                    <el-col :lg="12">
                      <p>{{ $root.labels.service }}/{{ $root.labels.event }}:</p>
                    </el-col>

                    <!-- Status -->
                    <el-col :lg="12">
                      <p>{{ $root.labels.status }}:</p>
                    </el-col>

                  </el-row>
                </el-col>

              </el-row>
            </div>

            <!-- Collapsible Data  -->
            <div
                class="am-finance-list"
                v-show="hasPayments && hasPaymentsFiltered && !isPaymentsFiltering"
            >

              <el-collapse>
                <el-collapse-item
                    v-for="(payment, index) in payments"
                    v-if="payment.providers.length === 0 || (payment.providers.length && getProviderById(payment.providers[0].id) !== null)"
                    :key="payment.id"
                    :name="payment.id"
                    class="am-finance"
                >
                  <template slot="title">
                    <div class="am-finance-data">
                      <span class="am-entity-color am-event-color"
                            v-if="payment.appointmentId === 0">
                      </span>
                      <span class="am-entity-color am-appointment-color"
                            v-else>
                      </span>
                      <el-row>

                        <!-- Payment Date, Customer, Employee -->
                        <el-col :lg="14">
                          <el-row :gutter="10" class="am-finance-flex-row-middle-align">

                            <!-- Checkbox -->
                            <el-col :lg="2" :sm="1" v-if="$root.settings.capabilities.canDelete === true">
                              <span @click.stop>
                                  <el-checkbox
                                      v-model="payment.checked"
                                      @change="checkPaymentData = handleCheckSingle(payments, checkPaymentData)">
                                  </el-checkbox>
                              </span>
                            </el-col>

                            <!-- Payment Date -->
                            <el-col :lg="6" :sm="6">
                              <p class="am-col-title">{{ $root.labels.payment_date }}:</p>
                              <h4>{{ getFrontedFormattedDate(payment.dateTime) }}</h4>
                            </el-col>

                            <!-- Customer -->
                            <el-col :lg="8" :sm="8">
                              <p class="am-col-title">{{ $root.labels.customer }}:</p>
                              <h3>
                                {{ payment.customerFirstName + ' ' + payment.customerLastName }}
                              </h3>
                              <span>{{ payment.customerEmail }}</span>
                            </el-col>

                            <!-- Employee -->
                            <el-col :lg="8" :sm="8">
                              <p class="am-col-title">{{ $root.labels.employee }}:</p>
                              <div class="am-assigned" v-if="payment.providers.length === 1 || $root.isLite">
                                <img
                                    v-if="payment.providers.length > 0 && (appointmentProvider = getProviderById(payment.providers[0].id)) !== null"
                                    :src="pictureLoad(appointmentProvider, true)"
                                    @error="imageLoadError(appointmentProvider, true)"/>
                                <h4>{{ (payment.providers.length > 0 && (user = getProviderById(payment.providers[0].id)) !== null ? user.firstName + ' ' +
                                  user.lastName : '') }}</h4>
                              </div>

                              <!-- Multiple Employees -->
                              <el-tooltip placement="top-start" v-if="payment.providers.length > 1 && !$root.isLite">
                                <div class="am-all-event-employees" slot="content">
                                  <div v-for="pp in payment.providers" :key="pp.id">
                                    {{ ((user = getProviderById(pp.id)) !== null ? user.firstName + ' ' + user.lastName : '') }}
                                  </div>
                                </div>
                                <div class="am-assigned am-multiple-employees">
                                  <img
                                      v-if="index <= 4"
                                      v-for="(pp, index) in payment.providers" :key="pp.id"
                                      :src="pictureLoad(getProviderById(pp.id), true)"
                                      @error="imageLoadError(getProviderById(pp.id), true)"/>
                                  <h4 v-if="index > 4 && (payment.providers.length - 5 > 0)"> + {{ payment.providers.length - 5 }}</h4>
                                </div>
                              </el-tooltip>
                            </el-col>

                          </el-row>
                        </el-col>

                        <el-col :lg="10">
                          <el-row :gutter="10" class="am-finance-flex-row-middle-align">
                            <el-col :lg="0" :sm="1" class="hide-on-mobile"></el-col>

                            <!-- Service -->
                            <el-col :lg="12" :sm="14" class="am-payment-service">
                              <p class="am-col-title">{{ $root.labels.service }}/{{ $root.labels.event }}:</p>
                              <img
                                v-if="payment.packageId"
                                :src="$root.getUrl + 'public/img/am-package-black.svg'"
                              >
                              <h4>{{ payment.name }}</h4>
                            </el-col>

                            <!-- Status -->
                            <el-col class="am-finance-payment-status" :lg="6" :sm="5">
                              <p class="am-col-title">{{ $root.labels.status }}:</p>

                              <h4>
                                <i :class="{'el-icon-circle-check': payment.status === 'paid' || payment.status === 'partiallyPaid', 'partially-paid': payment.status === 'partiallyPaid', 'el-icon-refresh': payment.status === 'pending'}"></i>
                                {{ getPaymentStatusNiceName(payment.status) }}
                              </h4>
                            </el-col>

                            <!-- Details Button -->
                            <el-col :lg="6" :sm="4" class="align-right">
                              <div @click.stop>
                                <el-button @click="showDialogEditPayment(payment)">
                                  {{ $root.labels.details }}
                                </el-button>
                              </div>
                            </el-col>

                          </el-row>
                        </el-col>
                      </el-row>
                    </div>
                  </template>

                  <div class="am-finance-details">
                    <el-row>

                      <!-- Appointment Date -->
                      <el-col :lg="14">
                        <el-row :gutter="10" class="am-finance-flex-row-top-align">
                          <el-col :lg="2" :sm="1" class="hide-on-mobile"></el-col>
                          <el-col :lg="22" :sm="23">
                            <p class="am-data">{{ payment.appointmentId === 0 ? $root.labels.event_date : $root.labels.appointment_date }}:</p>
                            <p class="am-value">{{ getFrontedFormattedDateTime(payment.bookingStart) }}</p>
                          </el-col>
                        </el-row>
                      </el-col>

                      <!-- Type, Amount -->
                      <el-col :lg="10">
                        <el-row :gutter="10" class="am-finance-flex-row-top-align">
                          <el-col :lg="0" :sm="1" class="hide-on-mobile"></el-col>

                          <!-- Type -->
                          <el-col class="am-finance-payment-gateway" :lg="12" :sm="14">
                            <p class="am-data">{{ $root.labels.method }}:</p>
                            <img :src="$root.getUrl + 'public/img/payments/' + payment.gateway + '.svg'" :style="{width: getPaymentIconWidth(payment.gateway)}">
                            <p class="am-value" v-if="payment.gateway !== 'razorpay'">{{ getPaymentGatewayNiceName(payment) }}</p>
                          </el-col>

                          <!-- Amount -->
                          <el-col :lg="12" :sm="10">
                            <p class="am-data">{{ $root.labels.amount }}:</p>
                            <p class="am-value">{{ getFormattedPrice(payment.amount) }}</p>
                          </el-col>

                        </el-row>
                      </el-col>

                    </el-row>
                  </div>
                </el-collapse-item>

              </el-collapse>
            </div>

            <!-- No Results -->
            <div class="am-empty-state am-section"
                 v-show="hasPayments && !hasPaymentsFiltered && !isPaymentsFiltering">
              <img :src="$root.getUrl + 'public/img/emptystate.svg'">
              <h2>{{ $root.labels.no_results }}</h2>
            </div>

            <!-- Pagination -->
            <pagination-block
                :params="paymentsParams"
                :count="paymentsFilteredCount"
                :label="$root.labels.payments_lower"
                :visible="hasPayments && hasPaymentsFiltered && !isPaymentsFiltering"
                @change="filterPayments"
            >
            </pagination-block>
          </el-tab-pane>

          <el-tab-pane :label="$root.labels.coupons" name="coupons" v-if="$root.settings.payments.coupons || $root.isLite">
            <BlockLite/>

            <!-- Filter Coupons -->
            <div class="am-finance-filter"
                 v-show="hasCoupons">
              <el-form class="" :action="exportCouponsAction" method="POST">
                <el-row :gutter="16">
                  <el-col :md="24" :lg="8">
                    <div class="am-search">
                      <el-form-item>
                        <el-input
                            class="calc-width-mobile"
                            :placeholder="searchPlaceholder"
                            v-model="couponsParams.search"
                        >
                        </el-input>
                      </el-form-item>
                    </div>
                  </el-col>

                  <transition name="fade">
                    <div class="am-filter-fields" v-show="filterCouponsFields">

                      <!-- Services Filter -->
                      <el-col :md="24" :lg="8">
                        <el-form-item>
                          <el-select
                              v-model="couponsParams.services"
                              multiple
                              filterable
                              :placeholder="$root.labels.services"
                              @change="filterCoupons"
                              collapse-tags
                          >
                            <div v-for="category in options.entities.categories"
                                 :key="category.id">
                              <div
                                  class="am-drop-parent"
                                  @click="selectAllInCategoryCoupons(category.id)"
                              >
                                <span>{{ category.name }}</span>
                              </div>
                              <el-option
                                  v-for="service in category.serviceList"
                                  :key="service.id"
                                  :label="service.name"
                                  :value="service.id"
                                  class="am-drop-child"
                              >
                              </el-option>
                            </div>
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <!-- Events Filter -->
                      <el-col :md="24" :lg="8">
                        <el-form-item>
                          <el-select
                              v-model="couponsParams.events"
                              multiple
                              filterable
                              class="calc-width"
                              :placeholder="$root.labels.events"
                              @change="filterCoupons"
                              collapse-tags
                          >
                            <el-option
                                v-for="event in options.entities.events"
                                :key="event.id"
                                :label="event.name + ( event.periods && event.periods.length ? ' (' + getFrontedFormattedDate(event.periods[0].periodStart.split(' ')[0]) + ')' : '')"
                                :value="event.id"
                                class="am-drop-child"
                            >
                            </el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>

                    </div>
                  </transition>

                  <!-- Toggle More Filters -->
                  <div class="">
                    <el-button class="button-filter-toggle am-button-icon" title="Toggle Filters"
                               @click="filterCouponsFields = !filterCouponsFields">
                      <img class="svg-amelia" alt="Toggle Filters"
                           :src="$root.getUrl+'public/img/filter.svg'"/>
                    </el-button>

                    <!-- Export Coupons -->
                    <el-tooltip placement="top">
                      <div slot="content" v-html="$root.labels.export_tooltip_coupons"></div>
                      <el-button
                          class="button-export am-button-icon"
                          @click="dialogCouponsExport = true"
                      >
                        <img class="svg-amelia" alt="Export" :src="$root.getUrl+'public/img/export.svg'"/>
                      </el-button>
                    </el-tooltip>
                  </div>
                </el-row>

                <!-- Dialog Export Coupons -->
                <transition name="slide">
                  <el-dialog
                      :close-on-click-modal="false"
                      class="am-side-dialog am-dialog-export"
                      :visible.sync="dialogCouponsExport"
                      :show-close="false"
                      v-if="dialogCouponsExport"
                  >
                    <dialog-export
                        :data="Object.assign(couponsParams, exportParamsCoupons)"
                        :action="$root.getAjaxUrl + '/report/coupons'"
                        @updateAction="(action) => {this.exportCouponsAction = action}"
                        @closeDialogExport="dialogCouponsExport = false"
                    >
                    </dialog-export>
                  </el-dialog>
                </transition>

              </el-form>
            </div>

            <!-- Spinner -->
            <div class="am-spinner am-section"
                 v-show="isCouponsFiltering && hasCoupons"
            >
              <img :src="$root.getUrl + 'public/img/spinner.svg'"/>
            </div>

            <!-- Empty State -->
            <div class="am-empty-state am-section"
                 v-if="!hasCoupons && !isCouponsFiltering">
              <img :src="$root.getUrl + 'public/img/emptystate.svg'">
              <h2>{{ $root.labels.no_coupons_yet }}</h2>
              <p></p>
            </div>

            <!-- Coupons Table Header -->
            <div
                class="am-finance-list-head"
                v-show="hasCoupons && hasCouponsFiltered && !isCouponsFiltering"
            >
              <el-row>

                <!-- Checkbox, Code, Discount, Deduction -->
                <el-col :lg="8">
                  <el-row :gutter="10" class="am-finance-flex-row-middle-align">

                    <!-- Checkbox -->
                    <el-col :lg="2" v-if="$root.settings.capabilities.canDelete === true">
                      <p>
                        <el-checkbox
                            v-model="checkCouponData.allChecked"
                            @change="checkCouponData = handleCheckAll(coupons, checkCouponData)">
                        </el-checkbox>
                      </p>
                    </el-col>

                    <!-- Code -->
                    <el-col :lg="8">
                      <p>{{ $root.labels.code }}:</p>
                    </el-col>

                    <!-- Discount -->
                    <el-col :lg="7">
                      <p>{{ $root.labels.discount }}:</p>
                    </el-col>

                    <!-- Deduction -->
                    <el-col :lg="7">
                      <p>{{ $root.labels.deduction }}:</p>
                    </el-col>

                  </el-row>
                </el-col>

                <!-- Service, Usage, Number of Times Used -->
                <el-col :lg="16">
                  <el-row :gutter="10" class="am-finance-flex-row-middle-align">

                    <el-col :lg="0" class="hide-on-mobile"></el-col>

                    <!-- Service -->
                    <el-col :lg="6">
                      <p>{{ $root.labels.service }}:</p>
                    </el-col>

                    <!-- Event -->
                    <el-col :lg="6">
                      <p>{{ $root.labels.event }}:</p>
                    </el-col>

                    <!-- Usage Limit -->
                    <el-col :lg="3">
                      <p>{{ $root.labels.usage_limit }}:</p>
                    </el-col>

                    <!-- Number of Times Used -->
                    <el-col :lg="3">
                      <p>{{ $root.labels.times_used }}:</p>
                    </el-col>

                    <!-- Expiration Date -->
                    <el-col :lg="3">
                      <p>{{ $root.labels.expiration_date }}:</p>
                    </el-col>

                  </el-row>
                </el-col>

              </el-row>
            </div>

            <div
                class="am-finance-list"
                v-show="hasCoupons && hasCouponsFiltered && !isCouponsFiltering"
            >
              <div v-for="coupon in coupons"
                   :class="{'am-coupon-row am-hidden-entity' : coupon.status === 'hidden', 'am-coupon-row' : coupon.status === 'visible'}"
              >
                <el-row>

                  <!-- Checkbox, Code, Discount, Deduction -->
                  <el-col :lg="8">
                    <el-row :gutter="10" class="am-finance-flex-row-middle-align">

                      <!-- Checkbox -->
                      <el-col :lg="2" :sm="1" v-if="$root.settings.capabilities.canDelete === true">
                        <span @click.stop>
                          <el-checkbox
                              v-model="coupon.checked"
                              @change="checkCouponData = handleCheckSingle(coupons, checkCouponData)"
                          >
                          </el-checkbox>
                        </span>
                      </el-col>

                      <!-- Code -->
                      <el-col :lg="8" :sm="9">
                        <p class="am-col-title">{{ $root.labels.code }}:</p>
                        <h4>{{ coupon.code }}</h4>
                      </el-col>

                      <!-- Discount -->
                      <el-col :lg="7" :sm="5">
                        <p class="am-col-title">{{ $root.labels.discount }}:</p>
                        <h4>{{ coupon.discount }}</h4>
                      </el-col>

                      <!-- Deduction -->
                      <el-col :lg="7" :sm="5">
                        <p class="am-col-title">{{ $root.labels.deduction }}:</p>
                        <h4>{{ getFormattedPrice(coupon.deduction) }}</h4>
                      </el-col>

                    </el-row>
                  </el-col>

                  <!-- Service, Usage, Number of Times Used -->
                  <el-col :lg="16">
                    <el-row :gutter="10" class="am-finance-flex-row-middle-align">

                      <el-col :lg="0" :sm="1" class="hide-on-mobile"></el-col>

                      <!-- Service -->
                      <el-col :lg="6" :sm="9">
                        <p class="am-col-title">{{ $root.labels.service }}:</p>
                        <h4>
                          {{coupon.serviceList.length > 0 ? (coupon.serviceList[0].name + (coupon.serviceList.length > 1
                          ? $root.labels.coupons_multiple_services_text : '')) : ''}}
                        </h4>
                      </el-col>

                      <!-- Event -->
                      <el-col :lg="6" :sm="9">
                        <p class="am-col-title">{{ $root.labels.event }}:</p>
                        <h4>
                          {{coupon.eventList.length > 0 ? (coupon.eventList[0].name + (coupon.eventList.length > 1
                          ? $root.labels.coupons_multiple_events_text : '')) : ''}}
                        </h4>
                      </el-col>

                      <!-- Usage Limit -->
                      <el-col :lg="3" :sm="5">
                        <p class="am-col-title">{{ $root.labels.usage_limit }}:</p>
                        <h4>{{ coupon.limit }}</h4>
                      </el-col>

                      <!-- Number of Times Used -->
                      <el-col :lg="3" :sm="5">
                        <p class="am-col-title">{{ $root.labels.times_used }}:</p>
                        <h4>{{ coupon.used }}</h4>
                      </el-col>

                      <!-- Expiration Date -->
                      <el-col :lg="3" :sm="5">
                        <p class="am-col-title">{{ $root.labels.expiration_date }}:</p>
                        <h4>{{ coupon.expirationDate ? getFrontedFormattedDate(coupon.expirationDate) : '/'}}</h4>
                      </el-col>

                      <!-- Edit Button -->
                      <el-col :lg="3" :sm="4" class="align-right">
                        <div @click.stop>
                          <el-button @click="showDialogEditCoupon(coupon.id)">{{ $root.labels.edit }}</el-button>
                        </div>
                      </el-col>

                    </el-row>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!-- No Results -->
            <div class="am-empty-state am-section"
                 v-show="hasCoupons && !hasCouponsFiltered && !isCouponsFiltering">
              <img :src="$root.getUrl + 'public/img/emptystate.svg'">
              <h2>{{ $root.labels.no_results }}</h2>
            </div>

            <!-- Pagination -->
            <pagination-block
                :params="couponsParams"
                :count="couponsFilteredCount"
                :label="$root.labels.coupons_lower"
                :visible="hasCoupons && hasCouponsFiltered && !isCouponsFiltering"
                @change="filterCoupons"
            >
            </pagination-block>
          </el-tab-pane>

        </el-tabs>

      </div>

      <!-- Selected Popover Delete -->
      <group-delete
          name="payments"
          :entities="payments"
          :checkGroupData="checkPaymentData"
          :confirmDeleteMessage="$root.labels.confirm_delete_payment"
          :successMessage="{single: $root.labels.payment_deleted, multiple: $root.labels.payments_deleted}"
          :errorMessage="{single: $root.labels.payment_not_deleted, multiple: $root.labels.payments_not_deleted}"
          @groupDeleteCallback="paymentGroupDeleteCallback"
      >
      </group-delete>

      <!-- Selected Popover Delete -->
      <group-delete
          name="coupons"
          :entities="coupons"
          :checkGroupData="checkCouponData"
          :confirmDeleteMessage="$root.labels.confirm_delete_coupon"
          :successMessage="{single: $root.labels.coupon_deleted, multiple: $root.labels.coupons_deleted}"
          :errorMessage="{single: $root.labels.coupon_not_deleted, multiple: $root.labels.coupons_not_deleted}"
          @groupDeleteCallback="couponGroupDeleteCallback"
      >
      </group-delete>

      <!-- Dialog Coupon -->
      <transition name="slide" v-if="$root.settings.payments.coupons">
        <el-dialog
            :close-on-click-modal="false"
            class="am-side-dialog am-dialog-coupon"
            :visible.sync="dialogCoupon"
            :show-close="false"
            v-if="dialogCoupon"
        >
          <dialog-coupon
              :coupon="coupon"
              :services="options.entities.services"
              :events="options.entities.events"
              :couponFetched="couponFetched"
              @closeDialog="closeDialogCoupon()"
              @saveCallback="fetchData"
              @duplicateCallback="duplicateCouponCallback"
          >
          </dialog-coupon>
        </el-dialog>
      </transition>

      <!-- Dialog Payment -->
      <transition name="slide">
        <el-dialog
            :close-on-click-modal="false"
            class="am-side-dialog am-dialog-coupon"
            :visible.sync="dialogPayment"
            :show-close="false"
            v-if="dialogPayment"
        >
          <dialog-payment
              :modalData="selectedPaymentModalData"
              :bookingFetched="bookingFetched"
              @updatePaymentCallback="updatePaymentCallback"
              @closeDialogPayment="closeDialogPayment()"
          >
          </dialog-payment>
        </el-dialog>
      </transition>

      <DialogLite/>

      <!-- Help Button -->
      <el-col :md="6" class="">
        <a class="am-help-button" href="https://wpamelia.com/admin-finances/" target="_blank">
          <i class="el-icon-question"></i> {{ $root.labels.need_help }}?
        </a>
      </el-col>

      <!-- <dialog-new-customize></dialog-new-customize> -->

    </div>
  </div>
</template>

<script>
  import PageHeader from '../parts/PageHeader.vue'
  import Form from 'form-object'
  import liteMixin from '../../../js/common/mixins/liteMixin'
  import customerMixin from '../../../js/backend/mixins/customerMixin'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import checkMixin from '../../../js/backend/mixins/checkMixin'
  import DialogCoupon from './DialogFinanceCoupon.vue'
  import DialogPayment from './DialogFinancePayment.vue'
  import DialogExport from '../parts/DialogExport.vue'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import entitiesMixin from '../../../js/common/mixins/entitiesMixin'
  import paymentMixin from '../../../js/backend/mixins/paymentMixin'
  import GroupDelete from '../parts/GroupDelete.vue'
  import priceMixin from '../../../js/common/mixins/priceMixin'
  import PaginationBlock from '../parts/PaginationBlock.vue'
  import helperMixin from '../../../js/backend/mixins/helperMixin'
  // import DialogNewCustomize from '../parts/DialogNewCustomize.vue'

  export default {

    mixins: [liteMixin, customerMixin, paymentMixin, entitiesMixin, imageMixin, dateMixin, checkMixin, notifyMixin, priceMixin, helperMixin],

    data () {
      return {
        bookingFetched: false,
        paymentsFilteredCount: 0,
        paymentsTotalCount: 0,
        couponFetched: false,
        couponsFilteredCount: 0,
        couponsTotalCount: 0,

        displayTotalCount: 0,

        paymentsFiltering: false,
        couponsFiltering: false,

        fetchedFilteredPayments: false,
        fetchedFilteredCoupons: false,

        addNewCouponBtnDisplay: false,
        dialogCoupon: false,
        dialogPayment: false,

        coupon: null,

        form: new Form(),

        checkPaymentData: {
          toaster: false,
          allChecked: false
        },

        checkCouponData: {
          toaster: false,
          allChecked: false
        },

        options: {
          entities: {
            events: [],
            services: [],
            employees: [],
            customers: []
          },
          fetched: false
        },

        dialogPaymentsExport: false,
        dialogCouponsExport: false,

        paymentsParams: {
          page: 1,
          dates: this.getDatePickerInitRange(),
          status: '',
          services: [],
          events: [],
          providerId: '',
          customerId: ''
        },
        exportParamsPayments: {
          fields: [
            {label: this.$root.labels.service + '/' + this.$root.labels.event, value: 'service', checked: true},
            {label: this.$root.labels.booking_start, value: 'bookingStart', checked: true},
            {label: this.$root.labels.customer, value: 'customer', checked: true},
            {label: this.$root.labels.customer_email, value: 'customerEmail', checked: true},
            {label: this.$root.labels.employee, value: 'employee', checked: true},
            {label: this.$root.labels.employee_email, value: 'employeeEmail', checked: true},
            {label: this.$root.labels.amount, value: 'amount', checked: true},
            {label: this.$root.labels.method, value: 'type', checked: true},
            {label: this.$root.labels.status, value: 'status', checked: true},
            {label: this.$root.labels.payment_date, value: 'paymentDate', checked: true}
          ]
        },
        exportPaymentsAction: '',

        couponsParams: {
          page: 1,
          status: '',
          services: [],
          events: [],
          search: ''
        },
        exportParamsCoupons: {
          fields: [
            {label: this.$root.labels.code, value: 'code', checked: true},
            {label: this.$root.labels.discount, value: 'discount', checked: true},
            {label: this.$root.labels.deduction, value: 'deduction', checked: true},
            {label: this.$root.labels.services, value: 'services', checked: true},
            {label: this.$root.labels.events, value: 'events', checked: true},
            {label: this.$root.labels.limit, value: 'limit', checked: true},
            {label: this.$root.labels.used, value: 'used', checked: true}
          ]
        },
        exportCouponsAction: '',

        statuses: [
          {
            value: 'paid',
            label: this.$root.labels.paid

          }, {
            value: 'pending',
            label: this.$root.labels.pending

          },
          {
            value: 'partiallyPaid',
            label: this.$root.labels.partially_paid

          }
        ],

        selectedPaymentModalData: {
          paymentId: null,
          bookingStart: null,
          bookings: null,
          service: null,
          providers: null,
          customer: null
        },

        // Filter
        filterPaymentsFields: true,
        filterCouponsFields: true,
        searchPlaceholder: this.$root.labels.finance_coupons_search_placeholder,

        // Finance
        financeTabs: 'payments',
        payments: [],
        coupons: [],

        timer: null
      }
    },

    created () {
      Form.defaults.axios = this.$http

      // Set filter params based on URL GET fields
      let urlParams = this.getUrlQueryParams(window.location.href)

      if (!('dateFrom' in urlParams) || !('dateTo' in urlParams)) {
        this.paymentsParams.dates = this.getDatePickerInitRange()
      } else {
        this.paymentsParams.dates = {
          start: this.$moment(urlParams['dateFrom']).toDate(),
          end: this.$moment(urlParams['dateTo']).toDate()
        }
      }

      if (urlParams['status']) { this.paymentsParams.status = urlParams['status'] }

      this.fetchData()
      this.handleResize()
      this.getFinanceOptions()
    },

    mounted () {
      this.inlineSVG()
      if (this.$root.settings.payments.wc && this.$root.settings.payments.wc.enabled) {
        this.exportParamsPayments.fields.push({label: this.$root.labels.wc_order_id, value: 'wcOrderId', checked: true})
      }
    },

    methods: {

      fetchData () {
        this.getPayments()
        this.getCoupons()
      },

      getPayments () {
        this.paymentsFiltering = true
        this.fetchedFilteredPayments = false

        let params = JSON.parse(JSON.stringify(this.paymentsParams))
        let dates = []

        if (params.dates) {
          if (params.dates.start) {
            dates.push(this.$moment(params.dates.start).format('YYYY-MM-DD'))
          }

          if (params.dates.end) {
            dates.push(this.$moment(params.dates.end).format('YYYY-MM-DD'))
          }

          params.dates = dates
        }

        Object.keys(params).forEach((key) => (!params[key] && params[key] !== 0) && delete params[key])

        this.$http.get(`${this.$root.getAjaxUrl}/payments`, {
          params: this.getAppropriateUrlParams(params)
        })
          .then(response => {
            response.data.data.payments.forEach(function (payItem) {
              payItem.checked = false
            })

            let customersIds = this.options.entities.customers.map(customer => customer.id)

            let customers = this.options.entities.customers

            response.data.data.payments.forEach(function (payment) {
              if (customersIds.indexOf(payment.customerId) === -1) {
                customers.push({
                  id: payment.customerId,
                  firstName: payment.customerFirstName,
                  lastName: payment.customerLastName,
                  email: payment.customerEmail
                })
              }
            })

            this.options.entities.customers = Object.values(customers)

            this.payments = response.data.data.payments
            this.paymentsFilteredCount = response.data.data.filteredCount
            this.paymentsTotalCount = response.data.data.totalCount

            if (this.financeTabs === 'coupons') {
              this.displayTotalCount = this.couponsTotalCount
            } else {
              this.displayTotalCount = this.paymentsTotalCount
            }

            this.paymentsFiltering = false
            this.fetchedFilteredPayments = true
          })
          .catch(e => {
            console.log(e.message)

            this.paymentsFiltering = false
            this.fetchedFilteredPayments = true
          })
      },

      getFinanceOptions () {
        this.options.fetched = false

        this.searchCustomers(
          '',
          () => {
            let customersIds = this.options.entities.customers.map(customer => parseInt(customer.id))

            let customers = this.options.entities.customers

            this.searchedCustomers.forEach((customer) => {
              if (customersIds.indexOf(parseInt(customer.id)) === -1) {
                customersIds.push(customer.id)
                customers.push(customer)
              }
            })

            this.options.entities.customers = Object.values(customers)
          }
        )

        this.$http.get(`${this.$root.getAjaxUrl}/entities`, {
          params: this.getAppropriateUrlParams({
            types: ['categories', 'employees', 'events', 'packages']
          })
        })
          .then(response => {
            this.options.entities = response.data.data

            this.filterResponseData(response)

            this.options.entities.services = this.getServicesFromCategories(this.options.entities.categories)

            this.options.fetched = true
          })
          .catch(e => {
            console.log(e.message)

            this.options.fetched = true
          })
      },

      getCoupons: function () {},

      getPaymentAppointment (payment) {
        this.$http.get(`${this.$root.getAjaxUrl}/appointments/` + payment.appointmentId)
          .then(response => {
            this.selectedPaymentModalData = this.getPaymentData(payment.id, response.data.data.appointment, null, null)

            this.selectedPaymentModalData.customer = {
              email: payment.customerEmail,
              firstName: payment.customerFirstName,
              lastName: payment.customerLastName
            }

            this.bookingFetched = true
          })
          .catch(e => {
            console.log(e.message)
          })
      },

      getEvent (payment) {
        this.$http.get(`${this.$root.getAjaxUrl}/events/` + payment.eventId)
          .then(response => {
            this.selectedPaymentModalData = this.getPaymentData(payment.id, null, response.data.data.event, null)

            this.selectedPaymentModalData.customer = {
              email: payment.customerEmail,
              firstName: payment.customerFirstName,
              lastName: payment.customerLastName
            }

            this.bookingFetched = true
          })
          .catch(e => {
            console.log(e.message)
          })
      },

      getPackage: function () {},

      getCoupon: function () {},

      paymentGroupDeleteCallback () {
        this.checkPaymentData.allChecked = false
        this.checkPaymentData.toaster = false
        this.fetchData()
      },

      couponGroupDeleteCallback: function () {},

      changeRange () {
        this.setDatePickerSelectedDaysCount(this.paymentsParams.dates.start, this.paymentsParams.dates.end)

        this.filterPayments()
      },

      filterPayments () {
        this.getPayments()
      },

      filterCoupons: function () {},

      updatePaymentCallback () {
        this.dialogPayment = false
        this.fetchData()
      },

      duplicateCouponCallback: function (coupon) {},

      handleResize () {
        this.filterPaymentsFields = window.innerWidth >= 992
        this.filterCouponsFields = window.innerWidth >= 992
      },

      showDialogNewCoupon: function () {},

      showDialogEditCoupon: function () {},

      showDialogEditPayment (payment) {
        this.dialogPayment = true

        if (payment.appointmentId) {
          this.getPaymentAppointment(payment)
        }

        if (payment.eventId) {
          this.getEvent(payment)
        }

        if (payment.packageId) {
          this.getPackage(payment)
        }
      },

      handleTabClick (tab) {
        if (tab.name === 'coupons') {
          this.addNewCouponBtnDisplay = true
          this.displayTotalCount = this.couponsTotalCount
        } else {
          this.addNewCouponBtnDisplay = false
          this.displayTotalCount = this.paymentsTotalCount
        }
      },

      selectAllInCategoryFinance (id) {
        let services = this.getCategoryServices(id)
        let servicesIds = services.map(service => service.id)

        // Deselect all services if they are already selected
        if (_.isEqual(_.intersection(servicesIds, this.paymentsParams.services), servicesIds)) {
          this.paymentsParams.services = _.difference(this.paymentsParams.services, servicesIds)
        } else {
          this.paymentsParams.services = _.uniq(this.paymentsParams.services.concat(servicesIds))
        }

        this.filterPayments()
      },

      selectAllInCategoryCoupons: function () {},

      getInitCouponObject: function () {},

      closeDialogPayment () {
        this.dialogPayment = false
        this.bookingFetched = false
      },

      closeDialogCoupon: function () {}
    },

    watch: {
      'couponsParams.search' () {
        clearTimeout(this.timer)
        this.timer = setTimeout(this.filterCoupons, 500)
      },

      'dialogPayment' () {
        if (this.dialogPayment === false) {
          this.bookingFetched = false
        }
      },

      'dialogCoupon' () {
        if (this.dialogCoupon === false) {
          this.couponFetched = false
          this.coupon = null
        }
      }
    },

    computed: {
      hasPayments () {
        return this.paymentsTotalCount !== 0
      },

      hasPaymentsFiltered () {
        return this.payments.length !== 0
      },

      isPaymentsFiltering () {
        return this.paymentsFiltering && this.financeTabs === 'payments'
      },

      hasCoupons () {
        return this.couponsTotalCount !== 0
      },

      hasCouponsFiltered () {
        return this.coupons.length !== 0
      },

      isCouponsFiltering () {
        return this.couponsFiltering && this.financeTabs === 'coupons'
      }
    },

    components: {
      PageHeader,
      DialogCoupon,
      DialogPayment,
      DialogExport,
      GroupDelete,
      PaginationBlock,
      // DialogNewCustomize
    }

  }
</script>

