<template>
  <div class="am-wrap">
    <transition name="fade">
      <div v-if="ameliaQAPromoBannerVisible && $root.settings.activation.enableAmeliaQAPromoBanner" class="am-amelia-banner"
        :style="{backgroundImage: `url(${$root.getUrl + 'public/img/amelia-qanda-promo-banner.png'})`}">
        <div class="am-amelia-banner__content">
          <div class="am-amelia-banner__content-main">
            <div class="am-amelia-banner__content-logo">
              <img :src="$root.getUrl + 'public/img/amelia-logo-symbol.svg'" alt="Amelia Logo">
              <div class="am-amelia-banner__text-logo">{{ $root.labels.promo_live_qa }}</div>
            </div>
            <div class="am-amelia-banner__content-text">
              <h1>
                <span class="am-amelia-banner__text-center">{{ $root.labels.promo_text1 }}</span>
                <div class="am-amelia-banner__text-center-subtitle">
                  {{ $root.labels.only_on_our }}<a href="https://www.youtube.com/watch?v=A7MTbivOdD0" target="_blank" class="am-youtube-text"> {{ $root.labels.youtube }} </a> {{ $root.labels.channel }}
                </div>
              </h1>
            </div>
            <div class="am-amelia-banner__content-premier">
              <div class="am-amelia-banner__content-premier-text">{{ $root.labels.promo_date }}</div>
            </div>
          </div>
        </div>

        <div class="am-amelia-banner__buttons">
          <p @click="removeBanner">{{ $root.labels.not_show }}</p>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="$root.settings.activation.enableAmeliaPromoBanner && promoBannerEnabled" class="am-promo-banner"
           :style="{backgroundImage: `url(${$root.getUrl + 'public/img/am-promo-banner-liteblue.svg'})`}">
        <div class="am-promo-banner__content">
          <div class="am-promo-banner-left">
            <div class="am-promo-banner__content-logo">
              <img :src="$root.getUrl + 'public/img/amelia-logo-symbol.svg'" alt="Amelia Logo">
            </div>
            <div class="am-upgrade-to-premium">
              <p class="am-amelia-text">Exclusive offer</p>
            </div>

          </div>
          <div class="am-promo-banner-center">
            <img :src="$root.getUrl + 'public/img/promo-discount-lite.png'" alt="Discount 30">

          </div>

          <div class="am-promo-banner__buttons">
            <div class="banner-counter" ref="bannerCounter">
              <p class="am-amelia-lite-users">for Lite users!</p>
            </div>
            <p @click="removeAmeliaLiteBanner">{{ $root.labels.not_show }}<img :src="$root.getUrl + 'public/img/am-close-x.svg'" alt="Close"></p>
            <a @click="grabYoursBtnHandler" class="am-promo-banner__button tms-store-checkout-ameliabooking" href="" >{{ $root.labels.grab_yours }}</a>
          </div>
        </div>
      </div>
    </transition>

    <div id="am-dashboard" class="am-body">

      <!-- Page Header -->
      <page-header @changeFilter="changeFilter" :params="params"></page-header>

      <!-- Spinner -->
      <div class="am-spinner am-section" v-show="!fetched || !fetchedStats">
        <img :src="$root.getUrl + 'public/img/spinner.svg'"/>
      </div>

      <!-- Statistics -->
      <div v-if="fetched === true && fetchedStats === true">
        <div class="am-hello am-section">
          <div class="am-user-name">
            <h1 v-if="currentUser !== null">{{$root.labels.hello_message_part0}} {{currentUser.firstName}} {{currentUser.lastName}} <img :src="$root.getUrl + 'public/img/wave.png'"></h1>
            <div class="am-user-alert">
              <span>{{$root.labels.hello_message_part1}} <img :src="$root.getUrl + 'public/img/check.png'"> <span>{{todayAppointmentsCount.approved !== null ? todayAppointmentsCount.approved : 0}}</span> {{$root.labels.approved_appointments.toLowerCase()}} {{$root.labels.hello_message_part2}} <img :src="$root.getUrl + 'public/img/clock.png'"> {{todayAppointmentsCount.pending !== null ? todayAppointmentsCount.pending : 0}} {{$root.labels.pending_appointments.toLowerCase()}} {{$root.labels.hello_message_part3}}</span>
            </div>
          </div>
        </div>

        <div class="am-stats am-section">
          <div class="am-big-stats">
            <el-row :gutter="0">
              <el-col :sm="24" :md="12" :lg="8">
                <div class="am-grid-content">
                  <div class="am-title">
                    <h3>{{$root.labels.approved_appointments}}
                      <el-tooltip placement="top">
                        <div slot="content" v-html="$root.labels.approved_appointments_tooltip"></div>
                        <i class="el-icon-question am-tooltip-icon"></i>
                      </el-tooltip>
                      <span class="am-change" :class="countGrowthClass">{{ selectedPeriodStats.count - previousPeriodStats.count }}</span>
                    </h3>
                  </div>
                  <div class="am-big-num">
                    <span>{{calculateChartTotal('count')}}</span>
                  </div>

                  <!-- Small Chart -->
                  <bar-chart
                      ref="appointmentsCountChart"
                      :data="smallBarChartAppointmentsData"
                      :options="smallBarChartAppointmentsOptions"
                      :width=40
                      :height=15
                  >
                  </bar-chart>

                  <div>
                    <a class="am-goto" @click="navigateTo('appointments')">{{ $root.labels.view }} {{$root.labels.appointments}}</a>
                  </div>
                </div>
              </el-col>

              <el-col :sm="24" :md="12" :lg="8">
                <div class="am-grid-content">
                  <div class="am-title">
                    <h3>{{$root.labels.percentage_of_load}}
                      <el-tooltip placement="top">
                        <div slot="content" v-html="$root.labels.percentage_of_load_tooltip"></div>
                        <i class="el-icon-question am-tooltip-icon"></i>
                      </el-tooltip>
                      <span class="am-change" :class="loadGrowthClass">{{ loadGrowthPercentage }}{{ loadGrowthPercentageCharacter }}</span>
                    </h3>
                  </div>
                  <div class="am-big-num">
                    <span>{{calculateChartTotal('load')}}</span>
                  </div>

                  <line-chart
                      ref="appointmentsLoadChart"
                      :data="smallLineChartLoadData"
                      :options="smallLineChartLoadOptions"
                      :width=40
                      :height=15
                  >
                  </line-chart>

                  <div v-if="!$root.isLite">
                    <a class="am-goto" @click="navigateTo('employees')">{{ $root.labels.view }} {{$root.labels.employees}}</a>
                  </div>
                </div>
              </el-col>

              <el-col :sm="24" :md="12" :lg="8">
                <div class="am-grid-content">
                  <div class="am-title">
                    <h3>{{$root.labels.revenue}}
                      <el-tooltip placement="top">
                        <div slot="content" v-html="$root.labels.revenue_tooltip"></div>
                        <i class="el-icon-question am-tooltip-icon"></i>
                      </el-tooltip>
                      <span class="am-change" :class="revenueGrowthClass">{{ revenueGrowthPercentage }}{{ revenueGrowthPercentageCharacter }}</span>
                    </h3>
                  </div>
                  <div class="am-big-num">
                    <span>{{calculateChartTotal('revenue')}}</span>
                  </div>

                  <line-chart
                      ref="appointmentsRevenueChart"
                      :data="smallLineChartRevenueData"
                      :options="smallLineChartRevenueOptions"
                      :width=40
                      :height=15
                  >
                  </line-chart>

                  <div>
                    <a class="am-goto" @click="navigateTo('finance')">{{ $root.labels.view }} {{$root.labels.finance}}</a>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- Employee Stats-->
        <div class="am-employee-table-stats am-section">
          <el-tabs v-model="tableStats">
            <el-tab-pane :label="$root.labels.employees" name="employeeTableStats" v-if="!$root.isLite">
              <el-table
                  :data="visibleEmployeeTableData"
                  :default-sort = "{prop: 'employeeName', order: 'ascending'}"
                  style="width: 100%;"
                  :empty-text="$root.labels.no_employees_yet"
                  @sort-change="employeeTableSortChange">
                <el-table-column
                    fixed
                    prop="employeeName"
                    :label="$root.labels.employee"
                    sortable
                    min-width="180"
                >
                  <template slot-scope="scope">
                    <img :src="pictureLoad(scope.row.provider, true)" @error="imageLoadError(scope.row.provider, true)" />
                    {{ scope.row.employeeName }}
                  </template>
                </el-table-column>
                <el-table-column
                    prop="numAppointments"
                    :label="$root.labels.appointments_count"
                    sortable
                    min-width="220"
                >
                </el-table-column>
                <el-table-column
                    prop="sumPayments"
                    :label="$root.labels.appointments_revenue"
                    :formatter="revenueFormatter"
                    sortable
                    min-width="220"
                >
                </el-table-column>

                <el-table-column
                    prop="hoursAppointment"
                    :label="$root.labels.appointments_hours"
                    :formatter="hoursFormatter"
                    sortable
                    min-width="220"
                >
                </el-table-column>
                <el-table-column
                    prop="load"
                    :label="$root.labels.appointments_load"
                    sortable
                    min-width="220"
                >
                  <template slot-scope="scope">
                    <div style="width: 100%;">
                      <div style="width: 50px; display: inline-block;">{{ scope.row.load }}%</div>
                      <el-progress
                          :width="120"
                          :show-text=false
                          :percentage=scope.row.load
                          :color=getPercentageBarColor(scope.row.load)>

                      </el-progress>
                    </div>

                  </template>
                </el-table-column>
              </el-table>

              <!-- Pagination -->
              <pagination-block
                  :params="employeeTableParams"
                  :show="employeeTableParams.show"
                  :count="employeeTableParams.total"
                  :label="$root.labels.employees.toLowerCase()"
                  :visible="employeeTableParams.show < employeeTableParams.total"
                  @change="changeVisibleEmployeeTableData"
              >
              </pagination-block>

            </el-tab-pane>

            <el-tab-pane :label="$root.labels.services" name="serviceTableStats">
              <el-table
                  :data="visibleServiceTableData"
                  :default-sort = "{prop: 'serviceName', order: 'ascending'}"
                  style="width: 100%;"
                  :empty-text="$root.labels.no_services_yet"
                  @sort-change="serviceTableSortChange">
                <el-table-column
                    fixed
                    prop="serviceName"
                    :label="$root.labels.service"
                    sortable
                    min-width="180"
                >
                  <template slot-scope="scope">
                    <img :src="pictureLoad(scope.row.service, false)" @error="imageLoadError(scope.row.service, false)" />
                    {{ scope.row.serviceName }}
                  </template>
                </el-table-column>
                <el-table-column
                    prop="numAppointments"
                    :label="$root.labels.appointments_count"
                    sortable
                    min-width="220"
                >
                </el-table-column>
                <el-table-column
                    prop="sumPayments"
                    :label="$root.labels.appointments_revenue"
                    :formatter="revenueFormatter"
                    sortable
                    min-width="220"
                >
                </el-table-column>

                <el-table-column
                    prop="hoursAppointment"
                    :label="$root.labels.appointments_hours"
                    :formatter="hoursFormatter"
                    sortable
                    min-width="220"
                >
                </el-table-column>
                <el-table-column
                    prop="load"
                    :label="$root.labels.appointments_load"
                    sortable
                    min-width="220"
                >
                  <template slot-scope="scope">
                    <div style="width: 100%">
                      <span>{{ scope.row.load }}%</span>
                      <el-progress
                          :width="120"
                          :show-text=false
                          :percentage=scope.row.load
                          :color=getPercentageBarColor(scope.row.load)>
                      </el-progress>
                    </div>

                  </template>
                </el-table-column>
              </el-table>

              <!-- Pagination -->
              <pagination-block
                  :params="serviceTableParams"
                  :show="serviceTableParams.show"
                  :count="serviceTableParams.total"
                  :label="$root.labels.services.toLowerCase()"
                  :visible="serviceTableParams.show < serviceTableParams.total"
                  @change="changeVisibleServiceTableData"
              >
              </pagination-block>
            </el-tab-pane>

            <el-tab-pane :label="$root.labels.packages" name="packageTableStats" class="am-packages-feature" v-if="($root.licence.isPro || $root.licence.isDeveloper) && !$root.isLite">
              <el-table
                  :data="visiblePackageTableData"
                  :default-sort = "{prop: 'packageName', order: 'ascending'}"
                  style="width: 100%;"
                  :empty-text="$root.labels.no_packages_yet"
                  @sort-change="packageTableSortChange">
                <el-table-column
                    fixed
                    prop="packageName"
                    :label="$root.labels.package"
                    sortable
                    min-width="180"
                >
                  <template slot-scope="scope">
                    <img :src="pictureLoad(scope.row.pack, false)" @error="imageLoadError(scope.row.pack, false)" />
                    {{ scope.row.packageName }}
                  </template>
                </el-table-column>
                <el-table-column
                    prop="numPurchased"
                    :label="$root.labels.packages_purchased_count"
                    sortable
                    min-width="220"
                >
                </el-table-column>
                <el-table-column
                    prop="sumPayments"
                    :label="$root.labels.appointments_revenue"
                    :formatter="revenueFormatter"
                    sortable
                    min-width="220"
                >
                </el-table-column>

                <el-table-column
                    prop="hoursAppointment"
                    :label="$root.labels.appointments_hours"
                    :formatter="hoursFormatter"
                    sortable
                    min-width="220"
                >
                </el-table-column>
              </el-table>

              <!-- Pagination -->
              <pagination-block
                  :params="packageTableParams"
                  :show="packageTableParams.show"
                  :count="packageTableParams.total"
                  :label="$root.labels.packages.toLowerCase()"
                  :visible="packageTableParams.show < packageTableParams.total"
                  @change="changeVisiblePackageTableData"
              >
              </pagination-block>
            </el-tab-pane>

          </el-tabs>

        </div>

        <!-- Upcoming Appointments -->
        <div id="am-appointments" class="am-upcoming-appointments am-section">

          <!-- Header -->
          <el-form :model="params" class="demo-form-inline" :action="exportAction" method="POST">
            <el-row>

              <!-- Header Title -->
              <el-col :span="20">
                <h2 class="am-section-title">{{ $root.labels.upcoming_appointments }}</h2>
              </el-col>

              <!-- Export Button -->
              <el-col :span="4">
                <div class="align-right">
                  <el-tooltip placement="top">
                    <div slot="content" v-html="$root.labels.export_tooltip_appointments"></div>
                    <el-button
                        class="button-export am-button-icon"
                        :disabled="appointments.length === 0"
                        @click="dialogExport = true"
                    >
                      <img class="svg-amelia" :alt="$root.labels.export" :src="$root.getUrl+'public/img/export.svg'"/>
                    </el-button>
                  </el-tooltip>
                </div>
              </el-col>
            </el-row>


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
                    :data="getExportParams()"
                    :action="$root.getAjaxUrl + '/report/appointments'"
                    @updateAction="(action) => {this.exportAction = action}"
                    @closeDialogExport="dialogExport = false"
                >
                </dialog-export>
              </el-dialog>
            </transition>
          </el-form>

          <!-- Appointments List Head -->
          <div class="am-appointments-list-head" v-if="appointments.length > 0">
            <el-row>

              <el-col :lg="15">
                <el-row :gutter="10" class="am-appointments-flex-row-middle-align">
                  <el-col :lg="5" :md="5">
                    <p>{{ $root.labels.date }} / {{ $root.labels.time }}:</p>
                  </el-col>
                  <el-col :lg="5" :md="5">
                    <p>{{ $root.labels.customer }}:</p>
                  </el-col>
                  <el-col :lg="5" :md="5">
                    <p>{{ $root.labels.assigned_to }}:</p>
                  </el-col>
                  <el-col :lg="9" :md="9">
                    <p>{{ $root.labels.service }}:</p>
                  </el-col>
                </el-row>
              </el-col>

              <el-col :lg="9">
                <el-row :gutter="10" class="am-appointments-flex-row-middle-align">
                  <el-col :lg="0" :md="3"></el-col>
                  <el-col :lg="5" :md="6">
                    <p>{{ $root.labels.duration }}:</p>
                  </el-col>
                  <el-col :lg="6" :md="6">
                    <p>{{ $root.labels.price }}:</p>
                  </el-col>
                  <el-col :lg="13" :md="6">
                    <p>{{ $root.labels.status }}:</p>
                  </el-col>
                </el-row>
              </el-col>

            </el-row>
          </div>

          <!-- Appointments List -->
          <div class="am-appointments" v-if="appointments.length > 0">
            <div class="am-appointments-list">
              <el-collapse>
                <el-collapse-item
                    v-for="app in appointments"
                    v-if="app.providerId && (appointmentProvider = getProviderById(app.providerId)) && appointmentProvider !== null"
                    :key="app.id"
                    :name="app.id"
                    class="am-appointment">

                  <template slot="title">
                    <div class="am-appointment-data">
                      <el-row>
                        <el-col :lg="15">
                          <el-row :gutter="10" class="am-appointments-flex-row-middle-align">

                            <!-- Appointment Time -->
                            <el-col :lg="5" :sm="5">
                              <span class="am-appointment-time" :class="app.status">{{ getFrontedFormattedDateTime(app.bookingStart) }}</span>
                            </el-col>

                            <!-- Appointment Customer(s) -->
                            <el-col :lg="5" :sm="6">
                              <p class="am-col-title">{{ $root.labels.customer }}:</p>
                              <template>
                                <el-tooltip
                                    class="item"
                                    effect="dark"
                                    placement="top"
                                    :disabled="app.bookings.length === 1"
                                    popper-class="am-align-left"
                                >
                                  <div v-if="app.bookings.length > 1"
                                       slot="content"
                                       v-html="getCustomersFromGroup(app)"></div>
                                  <h3 :class="{ grouped: app.bookings.length > 1 }">
                                    <img
                                        v-show="app.bookings.length > 1"
                                        width="16px"
                                        :src="$root.getUrl+'public/img/group.svg'"
                                        class="svg-amelia"
                                    />
                                    <span v-for="(booking, index) in app.bookings">
                                      {{ ((user = getCustomerById(booking.customerId)) !== null ? user.firstName + ' ' + user.lastName : '') }}<span
                                        v-if="app.bookings.length > 1 && index + 1  !== app.bookings.length">,</span>
                                    </span>
                                  </h3>
                                </el-tooltip>
                                <span v-if="app.bookings.length === 1" v-for="booking in app.bookings">{{ ((user = getCustomerById(booking.customerId)) !== null ? user.email : '') }}</span>
                                <span v-if="app.bookings.length > 1">{{$root.labels.multiple_emails}}</span>
                              </template>
                            </el-col>

                            <!-- Appointment Provider -->
                            <el-col :lg="5" :sm="6">
                              <p class="am-col-title">{{ $root.labels.assigned }}:</p>
                              <div class="am-assigned">
                                <img :src="pictureLoad(getProviderById(app.providerId), true)"
                                     @error="imageLoadError(getProviderById(app.providerId), true)"
                                     v-if="options.fetched"/>
                                <h4>
                                  {{ ((user = getProviderById(app.providerId)) !== null ? user.firstName + ' ' +
                                  user.lastName : '') }}
                                </h4>
                              </div>
                            </el-col>

                            <!-- Appointment Service -->
                            <el-col :lg="9" :sm="7">
                              <p class="am-col-title">{{ $root.labels.service }}:</p>
                              <h4>
                                {{ ((service = getServiceById(app.serviceId)) !== null ? service.name : '') }}
                              </h4>
                            </el-col>

                          </el-row>
                        </el-col>

                        <el-col :lg="9">
                          <el-row :gutter="10" class="am-appointments-flex-row-middle-align">

                            <!-- Appointment Duration -->
                            <el-col :lg="5" :sm="5" :xs="12">
                              <p class="am-col-title">{{ $root.labels.duration }}:</p>
                              <h4>{{
                                momentDurationToNiceDurationWithUnit(convertDateTimeRangeDifferenceToMomentDuration(app.bookingStart,
                                  app.bookingEnd)) }}</h4>
                            </el-col>

                            <!-- Appointment Payment -->
                            <el-col class="am-appointment-payment" :lg="6" :sm="6" :xs="12">
                              <p class="am-col-title">{{ $root.labels.price }}:</p>
                              <div class="am-appointment-package-wrap" v-if="getAppointmentPaymentMethods(app.bookings).length">
                                <h4>
                                  <el-tooltip placement="top" effect="light">
                                    <div slot="content" class="am-appointment-payment-tooltip">
                                      <span style="margin-bottom: 0; vertical-align: middle">{{ $root.labels.payment_method }}:</span>
                                      <img
                                          v-for="method in getAppointmentPaymentMethods(app.bookings)"
                                          v-if="getAppointmentPaymentMethods(app.bookings).length && method"
                                          :src="$root.getUrl + 'public/img/payments/' + method + '.svg'"
                                          height="16px"
                                          style="margin-left: 5px; vertical-align: middle"
                                      >
                                    </div>
                                    <div class="am-appointment-payment-wrap">
                                      <img
                                          v-for="method in getAppointmentPayment(app.bookings)"
                                          v-if="getAppointmentPayment(app.bookings).length"
                                          :src="$root.getUrl + 'public/img/payments/icons/' + getPaymentType(method) + '.svg'"
                                          class="am-appointment-payment-icons"
                                      >
                                      <span v-if="bookingTypeCountInPackage(app.bookings).regular" class="am-appointment-payment-wrap-price">
                                        <span style="vertical-align: middle">
                                          {{ getAppointmentPrice(app.serviceId, getAppointmentService(app), app.bookings, true) }}
                                        </span>
                                        <span v-if="Object.keys(bookingTypeCountInPackage(app.bookings).package).length">+</span>
                                      </span>
                                    </div>
                                  </el-tooltip>
                                </h4>
                                <el-tooltip v-if="Object.keys(bookingTypeCountInPackage(app.bookings).package).length"
                                            placement="top"
                                            :content="$root.labels.bookings_payment_package_tooltip"
                                            effect="light"
                                >
                                  <img
                                          v-if="Object.keys(bookingTypeCountInPackage(app.bookings).package).length"
                                          :src="$root.getUrl + 'public/img/am-package.svg'"
                                  >
                                </el-tooltip>
                              </div>
                            </el-col>

                            <!-- Appointment Status -->
                            <el-col :lg="8" :sm="8" :xs="17">
                              <div class="am-appointment-status" @click.stop>
                                <span class="am-appointment-status-symbol" :class="app.status"></span>
                                <el-select
                                    v-model="app.status"
                                    :placeholder="$root.labels.status"
                                    @change="updateAppointmentStatus(app, app.status, false)"
                                >
                                  <el-option
                                      v-for="opt in statuses"
                                      :key="opt.value"
                                      :label="opt.label"
                                      :value="opt.value"
                                      class="am-appointment-status-option"

                                  >
                                    <span class="am-appointment-status-symbol" :class="opt.value">{{ opt.label }}</span>
                                  </el-option>
                                </el-select>
                              </div>
                            </el-col>

                            <!-- Appointment Edit -->
                            <el-col :lg="5" :sm="5" :xs="7">
                              <div class="am-edit-btn" @click.stop>
                                <el-button @click="showDialogEditAppointment(app.id)">
                                  {{ $root.labels.edit }}
                                </el-button>
                              </div>
                            </el-col>

                          </el-row>
                        </el-col>
                      </el-row>
                    </div>
                  </template>

                  <appointment-list-collapsed
                      :app="app"
                      :options="options"
                  >
                  </appointment-list-collapsed>

                </el-collapse-item>
              </el-collapse>
            </div>
          </div>

          <!-- No Results -->
          <div class="am-empty-state am-section" v-if="appointments.length === 0">
            <img :src="$root.getUrl + 'public/img/emptystate.svg'">
            <p>{{ $root.labels.no_upcoming_appointments }}</p>
          </div>

        </div>

        <!-- Charts -->
        <div class="am-charts am-section">
          <el-row :gutter="32">

            <!-- Conversions Charts -->
            <el-col :md="16" class="am-border-right">
              <div class="am-chart bar-chart">
                <h2 class="am-section-title">
                  {{ $root.labels.conversions }}
                  <el-tooltip placement="top">
                    <div slot="content" v-html="$root.labels.conversions_tooltip"></div>
                    <i class="el-icon-question am-tooltip-icon"></i>
                  </el-tooltip>
                </h2>
                <el-tabs v-model="chartTabs">

                  <!-- Employees Conversions Chart Tab -->
                  <el-tab-pane :label="$root.labels.employees" name="employee" v-if="!$root.isLite">

                    <!-- Employees Conversions Chart Filter -->
                    <div class="am-chart-filter">
                      <el-row :gutter="10">
                        <el-col :sm="12">
                          <el-select
                              v-model="employees"
                              @change="filterEmployeesChart"
                              filterable
                              clearable
                              :placeholder="$root.labels.select_employee"
                              multiple
                              collapse-tags
                          >
                            <el-option
                                v-for="item in options.entities.employees"
                                :key="item.id"
                                :label="item.firstName + ' ' + item.lastName"
                                :value="item.id"
                            >
                            </el-option>
                          </el-select>
                        </el-col>
                      </el-row>
                    </div>

                    <!-- Employees Conversions Chart -->
                    <bar-chart
                        v-if="chartTabs === 'employee'"
                        ref="employeesChart"
                        :data="employeesChartData"
                        :options="defaultBarChartOptions"
                    >
                    </bar-chart>

                  </el-tab-pane>

                  <!-- Services Conversions Chart Tab -->
                  <el-tab-pane :label="$root.labels.services" name="service">

                    <!-- Services Conversions Chart Filter -->
                    <div class="am-chart-filter">
                      <el-row :gutter="10">
                        <el-col :sm="12">
                          <el-select
                              v-model="services"
                              @change="filterServicesChart"
                              filterable
                              clearable
                              :placeholder="$root.labels.select_service"
                              multiple
                              collapse-tags
                          >
                            <el-option
                                v-for="item in options.entities.services"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            >
                            </el-option>
                          </el-select>
                        </el-col>
                      </el-row>
                    </div>

                    <!-- Services Conversions Chart -->
                    <bar-chart
                        v-if="chartTabs === 'service'"
                        ref="servicesChart"
                        :data="servicesChartData"
                        :options="defaultBarChartOptions"
                    >
                    </bar-chart>

                  </el-tab-pane>

                  <!-- Locations Conversions Chart Tab -->
                  <el-tab-pane :label="$root.labels.locations" name="location" v-if="options.entities.locations.length">

                    <!-- Locations Conversions Chart Filter -->
                    <div class="am-chart-filter">
                      <el-row :gutter="10">
                        <el-col :sm="12">
                          <el-select
                              v-model="locations"
                              @change="filterLocationsChart"
                              filterable
                              clearable
                              :placeholder="$root.labels.select_location"
                              multiple
                              collapse-tags
                          >
                            <el-option
                                v-for="item in options.entities.locations"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            >
                            </el-option>
                          </el-select>
                        </el-col>
                      </el-row>
                    </div>

                    <!-- Locations Conversions Chart -->
                    <bar-chart
                        v-if="chartTabs === 'location'"
                        ref="locationsChart"
                        :data="locationsChartData"
                        :options="defaultBarChartOptions"
                    >
                    </bar-chart>

                  </el-tab-pane>

                </el-tabs>
              </div>
            </el-col>

            <!-- Customers Chart -->
            <el-col :md="8">
              <div class="am-chart doughnut-chart">

                <!-- Customers Label and Growth Stats -->
                <el-row>
                  <el-col :span="12">
                    <h2 class="am-section-title">
                      {{ $root.labels.customers }}
                      <el-tooltip placement="top">
                        <div slot="content" v-html="$root.labels.customers_tooltip"></div>
                        <i class="el-icon-question am-tooltip-icon"></i>
                      </el-tooltip>
                    </h2>
                  </el-col>
                  <el-col :span="12">
                    <h2 class="align-right" v-if="fetched">{{ totalCustomers }}
                      <span :class="customerGrowthClass">
                      {{ customersGrowthPercentage }}{{ customerGrowthPercentageCharacter }}
                    </span>
                    </h2>
                  </el-col>
                </el-row>

                <!-- Customers Chart -->
                <div class="" style="padding: 0 40px;">
                  <doughnut-chart
                      ref="customersChart"
                      :data="customersChartData"
                  >
                  </doughnut-chart>
                </div>

                <!-- Customers Progress Charts -->
                <el-row>
                  <el-col :span="12">
                    <p class="am-big-num" v-if="fetched">
                      {{ newCustomers }}
                    </p>
                    <p>{{ $root.labels.new }}</p>
                    <el-progress
                        v-if="fetched"
                        :percentage="newCustomersPercentage"
                        color="#1A84EE"
                    >
                    </el-progress>
                  </el-col>
                  <el-col :span="12">
                    <p class="am-big-num" v-if="fetched">
                      {{ returningCustomers }}
                    </p>
                    <p>{{ $root.labels.returning }}</p>
                    <el-progress
                        v-if="fetched"
                        :percentage="returnedCustomersPercentage"
                        color="#FFD400"
                    >
                    </el-progress>
                  </el-col>
                </el-row>

              </div>
            </el-col>

          </el-row>
        </div>

        <!-- Button New -->
        <div v-if="$root.settings.capabilities.canWrite === true" id="am-button-new" class="am-button-new">
          <el-popover
              ref="popover"
              placement="top"
              width="160"
              v-model="popover"
              visible-arrow="false"
              popper-class="am-button-popover">
            <div class="am-overlay" @click="popover = false; buttonNewItems = !buttonNewItems">
              <div class="am-button-new-items">
                <transition name="el-zoom-in-bottom">
                  <div v-show="buttonNewItems">
                    <el-button @click="showDialogNewAppointment()">{{ $root.labels.new_appointment }}</el-button>
                    <el-button @click="showDialogNewCustomer">{{ $root.labels.create_customer }}</el-button>
                  </div>
                </transition>
              </div>
            </div>
          </el-popover>
          <el-button
              id="am-plus-symbol"
              v-popover:popover
              type="primary"
              icon="el-icon-plus"
              @click="buttonNewItems = !buttonNewItems"
              ref="rotating"
          >
          </el-button>
        </div>

        <!-- Dialog New Appointment -->
        <transition name="slide">
          <el-dialog
              :close-on-click-modal="false"
              class="am-side-dialog"
              :visible.sync="dialogAppointment"
              :show-close="false"
              v-if="dialogAppointment"
          >
            <dialog-appointment
                :close-on-click-modal="false"
                :appointment="appointment"
                :recurringAppointments="recurringAppointments"
                :savedAppointment="savedAppointment"
                :bookings="bookings"
                :options="options"
                @sortBookings="sortBookings"
                @saveCallback="getDashboardOptions"
                @duplicateCallback="duplicateAppointmentCallback"
                @closeDialog="closeDialogAppointment"
                @showDialogNewCustomer="showDialogNewCustomer"
                @editPayment="editPayment"
                @openRecurringAppointment="openRecurringAppointment"
            >
            </dialog-appointment>
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
                @saveCallback="saveCustomerCallback"
                @closeDialog="dialogCustomer = false"
            >
            </dialog-customer>
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
                :appointmentFetched=true
                :bookingFetched=true
                @closeDialogPayment="dialogPayment = false"
                @updatePaymentCallback="updatePaymentCallback"
            >
            </dialog-payment>
          </el-dialog>
        </transition>
      </div>

      <DialogLite/>

      <!-- Help Button -->
      <el-col :md="6" class="">
        <a class="am-help-button" href="https://wpamelia.com/admin-dashboard/" target="_blank">
          <i class="el-icon-question"></i> {{ $root.labels.need_help }}?
        </a>
      </el-col>

    </div>

    <!-- <dialog-new-customize></dialog-new-customize> -->
  </div>
</template>

<script>
  import AppointmentListCollapsed from '../appointments/AppointmentListCollapsed.vue'
  import liteMixin from '../../../js/common/mixins/liteMixin'
  import appointmentMixin from '../../../js/backend/mixins/appointmentMixin'
  import appointmentPriceMixin from '../../../js/backend/mixins/appointmentPriceMixin'
  import BarChart from '../../../js/backend/components/barchart'
  import DoughnutChart from '../../../js/backend/components/doughnutchart'
  import LineChart from '../../../js/backend/components/linechart'
  import customerMixin from '../../../js/backend/mixins/customerMixin'
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import DialogAppointment from '../appointments/DialogAppointment.vue'
  import DialogCustomer from '../customers/DialogCustomer.vue'
  import DialogExport from '../parts/DialogExport.vue'
  import DialogPayment from '../finance/DialogFinancePayment.vue'
  import durationMixin from '../../../js/common/mixins/durationMixin'
  import entitiesMixin from '../../../js/common/mixins/entitiesMixin'
  import Form from 'form-object'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import moment from 'moment'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import PageHeader from '../parts/PageHeader.vue'
  import paymentMixin from '../../../js/backend/mixins/paymentMixin'
  import priceMixin from '../../../js/common/mixins/priceMixin'
  import PaginationBlock from '../parts/PaginationBlock.vue'
  // import DialogNewCustomize from '../parts/DialogNewCustomize.vue'

  export default {

    mixins: [liteMixin, paymentMixin, entitiesMixin, appointmentMixin, imageMixin, dateMixin, durationMixin, priceMixin, customerMixin, notifyMixin, appointmentPriceMixin],

    data () {
      return {
        ameliaQAPromoBannerVisible: false,
        promoBannerEnabled: true,
        currentUser: null,
        todayAppointmentsCount: {
          approved: null,
          pending: null
        },
        periodChange: {
          count: 0,
          available: 0,
          occupied: 0,
          revenue: 0
        },
        previousPeriodStats: {
          count: 0,
          available: 0,
          occupied: 0,
          revenue: 0
        },
        selectedPeriodStats: {
          count: 0,
          available: 0,
          occupied: 0,
          revenue: 0
        },
        statsLabels: [],
        customer: null,
        appointments: [],
        appointmentsCount: [],
        buttonNewItems: false,
        chartTabs: !this.$root.isLite ? 'employee' : 'service',
        customersChartData: {
          labels: [this.$root.labels.new, this.$root.labels.returning, ''],
          datasets: [
            {
              backgroundColor: ['#1a84ee', '#ffd400', '#ebeef5'],
              borderColor: '#E2E6EC',
              data: [0, 0, 1],
              hoverBackgroundColor: ['#117ce6', '#eec600', '#ebeef5'],
              hoverBorderColor: '#D3DDEA'
            }
          ]
        },
        dialogAppointment: false,
        dialogPayment: false,
        dialogExport: false,
        employees: [],

        tableStats: !this.$root.isLite ? 'employeeTableStats' : 'serviceTableStats',

        smallBarChartAppointmentsData: {
          labels: [],
          datasets: [
            {
              backgroundColor: '#5FCE19',
              data: [],
              hoverBackgroundColor: '#5FCE19',
              label: '',
              borderWidth: 0
            }
          ]
        },

        smallBarChartAppointmentsOptions: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              barThickness: 6,
              beginAtZero: true,
              gridLines: {
                display: false
              },
              ticks: {
                stepSize: 1,
                min: 1,
                autoSkip: true

              }
            }],
            yAxes: [{
              display: false,
              beginAtZero: true,
              gridLines: {
                display: false
              },
              ticks: {
                stepSize: 10,
                min: 0
              }
            }]
          },
          tooltips: {
            custom: function (tooltip) {
              if (!tooltip) {
                return
              }

              tooltip.displayColors = false
            },
            callbacks: {
              label: (tooltipItems, data) => {
                return this.statsLabels[tooltipItems.xLabel] + ': ' + tooltipItems.yLabel
              },
              title: (tooltipItems, data) => {
              }
            }
          }
        },

        smallLineChartLoadData: {
          labels: [],
          datasets: [
            {
              backgroundColor: 'transparent',
              borderColor: '#9A47FF',
              data: [],
              label: '',
              borderWidth: 2,
              lineTension: 0,
              pointRadius: 3,
              pointBorderColor: '#fff'
            }
          ]
        },

        smallLineChartLoadOptions: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              gridLines: {
                display: false
              },
              ticks: {
                stepSize: 10,
                min: 0,
                autoSkip: true
              }
            }],
            yAxes: [{
              display: false,
              beginAtZero: true,
              gridLines: {
                display: false
              },
              ticks: {
                stepSize: 1,
                min: 0
              }
            }]
          },
          tooltips: {
            custom: function (tooltip) {
              if (!tooltip) {
                return
              }

              tooltip.displayColors = false
            },
            callbacks: {
              label: (tooltipItems, data) => {
                return this.statsLabels[tooltipItems.xLabel] + ': ' + tooltipItems.yLabel + '%'
              },
              title: (tooltipItems, data) => {
              }
            }
          }
        },

        smallLineChartRevenueData: {
          labels: [],
          datasets: [
            {
              backgroundColor: 'transparent',
              borderColor: '#FD8863',
              data: [],
              label: '',
              borderWidth: 2,
              lineTension: 0,
              pointBackgroundColor: '#FD8863',
              pointRadius: 3,
              pointBorderColor: '#fff'
            }
          ]
        },

        smallLineChartRevenueOptions: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              barPercentage: 0.2,
              categoryPercentage: 0.8,
              gridLines: {
                display: false
              },
              ticks: {
                stepSize: 1,
                min: 0,
                autoSkip: true
              }
            }],
            yAxes: [{
              display: false,
              beginAtZero: true,
              gridLines: {
                display: false
              },
              ticks: {
                stepSize: 1,
                min: 0
              }
            }]
          },
          tooltips: {
            custom: function (tooltip) {
              if (!tooltip) {
                return
              }

              tooltip.displayColors = false
            },
            callbacks: {
              label: (tooltipItems, data) => {
                return this.statsLabels[tooltipItems.xLabel] + ': ' + this.getFormattedPrice(tooltipItems.yLabel)
              },
              title: (tooltipItems, data) => {
              }
            }
          }
        },

        employeePeriodStats: [],
        employeeTableData: [],
        visibleEmployeeTableData: [],
        serviceTableData: [],
        visibleServiceTableData: [],
        packageTableData: [],
        visiblePackageTableData: [],
        visibleTableDataCount: [],
        employeeTableParams: {
          show: 5,
          total: 0,
          page: 1
        },
        serviceTableParams: {
          show: 5,
          total: 0,
          page: 1
        },
        packageTableParams: {
          show: 5,
          total: 0,
          page: 1
        },

        employeesChartData: {
          labels: [],
          datasets: [
            {
              backgroundColor: '#D3DDEA',
              data: [],
              hoverBackgroundColor: '#c8d4e5',
              label: this.$root.labels.views,
              borderWidth: 0
            },
            {
              backgroundColor: '#5FCE19',
              data: [],
              hoverBackgroundColor: '#58BF17',
              label: this.$root.labels.appointments,
              borderWidth: 0
            }
          ]
        },
        defaultBarChartOptions: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              barPercentage: 0.5,
              categoryPercentage: 0.8,
              ticks: {
                stepSize: 1,
                min: 0,
                autoSkip: false
              }
            }],
            yAxes: [{
              gridLines: {
                display: true
              },
              ticks: {
                beginAtZero: true,
                userCallback: function (label) {
                  if (Math.floor(label) === label) {
                    return label
                  }
                }
              }
            }]
          }
        },

        employeesStats: [],
        fetched: false,
        fetchedStats: false,
        form: new Form(),
        locations: [],
        locationsChartData: {
          labels: [],
          datasets: [
            {
              backgroundColor: '#D3DDEA',
              data: [],
              hoverBackgroundColor: '#c8d4e5',
              label: this.$root.labels.views,
              borderWidth: 0
            },
            {
              backgroundColor: '#5FCE19',
              data: [],
              hoverBackgroundColor: '#58BF17',
              label: this.$root.labels.appointments,
              borderWidth: 0
            }
          ]
        },
        locationsStats: [],
        params: {
          dates: this.getDatePickerInitRange()
        },
        popover: false,
        selectedPaymentModalData: null,
        services: [],
        servicesChartData: {
          labels: [],
          datasets: [
            {
              backgroundColor: '#D3DDEA',
              data: [],
              hoverBackgroundColor: '#c8d4e5',
              label: this.$root.labels.views,
              borderWidth: 0
            },
            {
              backgroundColor: '#5FCE19',
              data: [],
              hoverBackgroundColor: '#58BF17',
              label: this.$root.labels.appointments,
              borderWidth: 0
            }
          ]
        },
        totalPastPeriodCustomers: 0
      }
    },

    created () {
      Form.defaults.axios = this.$http

      this.getDashboardOptions()
      this.getCurrentUser()
    },

    methods: {
      grabYoursBtnHandler (e) {
        e.preventDefault()
      },

      initializeClock () {
        const clock = this.$refs.bannerCounter;
        const daysSpan = this.$refs.days;
        const hoursSpan = this.$refs.hours;
        const minutesSpan = this.$refs.minutes;
        const secondsSpan = this.$refs.seconds;
        const endTime = new Date("Aug 15, 2022 17:00:00").getTime();
        var updateClock = setInterval(function() {
          const now = new Date().getTime()
          const total = endTime - now;
          const days = Math.floor(total / (1000 * 60 * 60 * 24));
          const hours = days * 24 + Math.floor((total / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((total / 1000 / 60) % 60);
          const seconds = Math.floor((total / 1000)) % 60
          daysSpan.innerHTML = days;
          if (hours >= 100) {
          hoursSpan.innerHTML = (('0' + hours).slice(-3));
        } else {
          hoursSpan.innerHTML = (('0' + hours).slice(-2));
        }
        hoursSpan.innerHTML = (hours%24)
        minutesSpan.innerHTML = (('0' + minutes).slice(-2));
        secondsSpan.innerHTML = (('0' + seconds).slice(-2));

        /*$('.time-dots').css('visibility', 'hidden');
        setTimeout(function() {
          $('.time-dots').css('visibility', 'visible');
        }, 500);*/

        if (total < 1) {
          clearInterval(updateClock);
          clock.remove();
        }
      }, 1000);
      },

      removeBanner () {
        localStorage.setItem('ameliaQAPromoBanner', false)

        this.$http.post(`${this.$root.getAjaxUrl}/settings`, {activation: {enableAmeliaQAPromoBanner: !this.ameliaQAPromoBannerVisible}})
          .then(response => {
          })
          .catch(e => {
          })

        this.ameliaQAPromoBannerVisible = false
      },

      removeAmeliaLiteBanner () {
        this.promoBannerEnabled = false

        this.$http.post(`${this.$root.getAjaxUrl}/settings`, {activation: {enableAmeliaPromoBanner: false}})
          .then(response => {
          })
          .catch(e => {
          })
      },

      revenueFormatter (row, column) {
        return this.getFormattedPrice(row.sumPayments)
      },

      hoursFormatter (row, column) {
        let hours = this.getMinutesToDays(row.hoursAppointment)

        return hours === '' ? 0 : hours
      },

      employeeTableSortChange (sortProps) {
        switch (sortProps.order) {
          case (null):
            this.employeeTableData = this.employeeTableData.sort((a, b) => (a.employeeName > b.employeeName) ? 1 : -1)

            break
          case ('ascending'):
            this.employeeTableData = this.employeeTableData.sort((a, b) => (a[sortProps.prop] > b[sortProps.prop]) ? 1 : -1)

            break
          case ('descending'):
            this.employeeTableData = this.employeeTableData.sort((a, b) => (a[sortProps.prop] < b[sortProps.prop]) ? 1 : -1)

            break
        }

        this.showVisibleEmployeeTableData()
      },

      serviceTableSortChange (sortProps) {
        switch (sortProps.order) {
          case (null):
            this.serviceTableData = this.serviceTableData.sort((a, b) => (a.serviceName > b.serviceName) ? 1 : -1)

            break
          case ('ascending'):
            this.serviceTableData = this.serviceTableData.sort((a, b) => (a[sortProps.prop] > b[sortProps.prop]) ? 1 : -1)

            break
          case ('descending'):
            this.serviceTableData = this.serviceTableData.sort((a, b) => (a[sortProps.prop] < b[sortProps.prop]) ? 1 : -1)

            break
        }

        this.showVisibleServiceTableData()
      },

      packageTableSortChange (sortProps) {
        switch (sortProps.order) {
          case (null):
            this.packageTableData = this.packageTableData.sort((a, b) => (a.serviceName > b.serviceName) ? 1 : -1)

            break
          case ('ascending'):
            this.packageTableData = this.packageTableData.sort((a, b) => (a[sortProps.prop] > b[sortProps.prop]) ? 1 : -1)

            break
          case ('descending'):
            this.packageTableData = this.packageTableData.sort((a, b) => (a[sortProps.prop] < b[sortProps.prop]) ? 1 : -1)

            break
        }

        this.showVisiblePackageTableData()
      },

      changeVisibleEmployeeTableData () {
        this.showVisibleEmployeeTableData()
      },

      changeVisibleServiceTableData () {
        this.showVisibleServiceTableData()
      },

      changeVisiblePackageTableData () {
        this.showVisiblePackageTableData()
      },

      showVisibleEmployeeTableData () {
        this.visibleEmployeeTableData = this.employeeTableData.slice(
          (this.employeeTableParams.page - 1) * this.employeeTableParams.show,
          (this.employeeTableParams.page - 1) * this.employeeTableParams.show + this.employeeTableParams.show
        )
      },

      showVisibleServiceTableData () {
        this.visibleServiceTableData = this.serviceTableData.slice(
          (this.serviceTableParams.page - 1) * this.serviceTableParams.show,
          (this.serviceTableParams.page - 1) * this.serviceTableParams.show + this.serviceTableParams.show
        )
      },

      showVisiblePackageTableData () {
        this.visiblePackageTableData = this.packageTableData.slice(
          (this.packageTableParams.page - 1) * this.packageTableParams.show,
          (this.packageTableParams.page - 1) * this.packageTableParams.show + this.packageTableParams.show
        )
      },

      getExportParams () {
        return Object.assign({count: this.appointmentsCount, dates: {start: moment().format('YYYY-MM-DD'), end: ''}}, this.exportParams)
      },

      showDialogNewCustomer () {
        this.customer = this.getInitCustomerObject()
        this.dialogCustomer = true
      },

      getDashboardOptions () {
        this.fetchEntities((success) => {
          if (success) {
            this.filterResponseData()
            this.setBookings(0)
            this.getDashboard()
          }

          this.fetched = true
          this.options.fetched = true
        }, {
          types: ['categories', 'employees', 'customers'],
          page: 'appointments',
          isFrontEnd: false,
          isPanel: false
        })
      },

      changeFilter () {
        this.setDatePickerSelectedDaysCount(this.params.dates.start, this.params.dates.end)
        this.getDashboard()
      },

      getDashboard () {
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

        this.fetchedStats = false

        this.$http.get(`${this.$root.getAjaxUrl}/stats`, {
          params: this.getAppropriateUrlParams(params)
        })
          .then(response => {
            this.employeePeriodStats = response.data.data.selectedPeriodStats

            // this.previousPeriodStats = this.getPeriodStats(response.data.data.previousPeriodStats, 'providers')
            // this.selectedPeriodStats = this.getPeriodStats(this.employeePeriodStats, 'providers')

            this.fillAppointmentsChartStats(response.data.data.selectedPeriodStats)

            this.fillAppointmentsTablesStats(this.employeePeriodStats)

            this.todayAppointmentsCount.approved = response.data.data.count.approved
            this.todayAppointmentsCount.pending = response.data.data.count.pending

            let customersIds = this.options.entities.customers.map(customer => parseInt(customer.id))

            let customers = this.options.entities.customers

            response.data.data.appointments.forEach((app) => {
              app.bookings.forEach((booking) => {
                if (customersIds.indexOf(parseInt(booking.customer.id)) === -1) {
                  customersIds.push(booking.customer.id)
                  customers.push(booking.customer)
                }
              })
            })

            this.options.entities.customers = Object.values(customers)

            this.appointments = response.data.data.appointments
            this.appointmentsCount = response.data.data.appointmentsCount

            this.fillCustomersChart(response.data.data.customersStats)
            this.employeesStats = response.data.data.employeesStats
            this.fillEmployeesChart(response.data.data.employeesStats)
            this.servicesStats = response.data.data.servicesStats
            this.fillServicesChart(response.data.data.servicesStats)
            this.locationsStats = response.data.data.locationsStats
            this.fillLocationsChart(response.data.data.locationsStats)

            this.updateCharts()
            this.filterEmployeesChart()
            this.filterServicesChart()
            this.filterLocationsChart()
            this.fetched = true
            this.fetchedStats = true
          })
      },

      navigateTo (pageName) {
        let startDate = moment(this.params.dates.start).format('YYYY-MM-DD')
        let endDate = moment(this.params.dates.end).format('YYYY-MM-DD')

        let url = 'admin.php?page=wpamelia-' + pageName

        switch (pageName) {
          case ('appointments'):
            url += '&dateFrom=' + startDate + '&dateTo=' + endDate + '&status=approved'
            break

          case ('finance'):
            url += '&dateFrom=' + startDate + '&dateTo=' + endDate + '&status=paid'
            break

          case ('employees'):
            break
        }

        window.location = url
      },

      updateCharts () {
        if (typeof this.$refs.customersChart !== 'undefined') { this.$refs.customersChart.update(false) }
        if (typeof this.$refs.employeesChart !== 'undefined') { this.$refs.employeesChart.update(false) }
        if (typeof this.$refs.servicesChart !== 'undefined') { this.$refs.servicesChart.update(false) }
        if (typeof this.$refs.locationsChart !== 'undefined') { this.$refs.locationsChart.update(false) }
        if (typeof this.$refs.appointmentsCountChart !== 'undefined') { this.$refs.appointmentsCountChart.update(true) }
        if (typeof this.$refs.appointmentsLoadChart !== 'undefined') { this.$refs.appointmentsLoadChart.update(true) }
        if (typeof this.$refs.appointmentsRevenueChart !== 'undefined') { this.$refs.appointmentsRevenueChart.update(true) }
      },

      getPeriodStats: function (data, type) {
        let appointmentsCount = 0
        let appointmentsAvailable = 0
        let appointmentsOccupied = 0
        let appointmentsRevenue = 0

        for (let dateKey in data) {
          if (!data.hasOwnProperty(dateKey) || data[dateKey] === null || !data[dateKey].hasOwnProperty(type)) { continue }

          for (let providerId in data[dateKey][type]) {
            if (!data[dateKey][type].hasOwnProperty(providerId)) { continue }

            let availableTime = 0

            for (let i = 0; i < data[dateKey][type][providerId].intervals.length; i++) {
              availableTime += (parseInt(data[dateKey][type][providerId].intervals[i].time[1]) - parseInt(data[dateKey][type][providerId].intervals[i].time[0])) / 60
            }

            appointmentsCount += parseInt(data[dateKey][type][providerId].count)
            appointmentsAvailable += availableTime
            appointmentsOccupied += parseInt(data[dateKey][type][providerId].occupied)
            appointmentsRevenue += parseInt(data[dateKey][type][providerId].revenue)
          }
        }

        return {
          count: appointmentsCount,
          occupied: appointmentsOccupied,
          available: appointmentsAvailable,
          revenue: appointmentsRevenue
        }
      },

      fillAppointmentsChartStats (data) {
        this.statsLabels = []

        this.smallBarChartAppointmentsData.labels = []
        this.smallBarChartAppointmentsData.datasets[0].data = []

        this.smallLineChartLoadData.labels = []
        this.smallLineChartLoadData.datasets[0].data = []

        this.smallLineChartRevenueData.labels = []
        this.smallLineChartRevenueData.datasets[0].data = []

        let type = ''

        for (let dateKey in data) {
          if (!data.hasOwnProperty(dateKey) || data[dateKey] === null) { continue }

          let dateFormatted = moment(dateKey, 'YYYY-MM-DD').format('MMM D')

          this.statsLabels[dateFormatted] = moment(dateKey, 'YYYY-MM-DD').format('dddd')

          this.smallBarChartAppointmentsData.labels.push(dateFormatted)
          this.smallLineChartLoadData.labels.push(dateFormatted)
          this.smallLineChartRevenueData.labels.push(dateFormatted)

          let dateAppointmentsCount = 0
          let dateAppointmentsAvailable = 0
          let dateAppointmentsOccupied = 0
          let dateRevenue = 0
          let hasData = false

          type = 'providers'

          for (let providerId in data[dateKey][type]) {
            if (!data[dateKey][type].hasOwnProperty(providerId)) { continue }

            let availableTime = 0

            for (let i = 0; i < data[dateKey][type][providerId].intervals.length; i++) {
              availableTime += (data[dateKey][type][providerId].intervals[i].time[1] - data[dateKey][type][providerId].intervals[i].time[0]) / 60
            }

            dateAppointmentsCount += parseInt(data[dateKey][type][providerId].count)
            dateAppointmentsAvailable += availableTime
            dateAppointmentsOccupied += parseInt(data[dateKey][type][providerId].occupied)
            dateRevenue += parseInt(data[dateKey][type][providerId].revenue)
          }

          if (dateAppointmentsAvailable > 0) {
            hasData = true
          }

          type = 'packages'

          for (let packageId in data[dateKey][type]) {
            if (!data[dateKey][type].hasOwnProperty(packageId)) { continue }

            dateRevenue += parseInt(data[dateKey][type][packageId].revenue)
          }

          if (dateRevenue > 0) {
            hasData = true
          }

          if (!hasData) {
            this.smallBarChartAppointmentsData.datasets[0].data.push(null)
            this.smallLineChartLoadData.datasets[0].data.push(null)
            this.smallLineChartRevenueData.datasets[0].data.push(null)
          } else {
            this.smallBarChartAppointmentsData.datasets[0].data.push(dateAppointmentsCount)
            this.smallLineChartLoadData.datasets[0].data.push(dateAppointmentsAvailable > 0 ? parseFloat((dateAppointmentsOccupied / dateAppointmentsAvailable * 100).toFixed(1)) : 0)
            this.smallLineChartRevenueData.datasets[0].data.push(dateRevenue)
          }
        }
      },

      fillAppointmentsTablesStats: function (data) {
        let employeeData = []
        let serviceData = []
        let packageData = []
        let that = this

        this.options.entities.packages.forEach((pack) => {
          packageData[pack.id] = {
            count: 0,
            available: 0,
            occupied: 0,
            revenue: 0,
            purchased: 0
          }
        })

        for (let dateKey in data) {
          if (!data.hasOwnProperty(dateKey) || data[dateKey] === null) { continue }

          for (let serviceId in data[dateKey].services) {
            if (!data[dateKey].services.hasOwnProperty(serviceId)) { continue }

            let servicesStats = data[dateKey].services[serviceId]

            if (!(serviceId in serviceData)) {
              serviceData[serviceId] = {
                count: 0,
                available: 0,
                occupied: 0,
                revenue: 0
              }
            }

            serviceData[serviceId].occupied += parseInt(servicesStats.occupied)
            serviceData[serviceId].count += parseInt(servicesStats.count)
            serviceData[serviceId].revenue += parseInt(servicesStats.revenue)
          }

          for (let providerId in data[dateKey].providers) {
            if (!data[dateKey].providers.hasOwnProperty(providerId)) { continue }

            if (!(providerId in employeeData)) {
              employeeData[providerId] = {
                count: 0,
                available: 0,
                occupied: 0,
                revenue: 0
              }
            }

            let providerAvailableTime = 0

            let providerStats = data[dateKey].providers[providerId]

            let providerServices = that.options.entities.employees.find(employee => parseInt(employee.id) === parseInt(providerId)).serviceList.map(service => service.id)

            providerStats['intervals'].forEach(function (interval) {
              let intervalTime = (parseInt(interval.time[1]) - parseInt(interval.time[0])) / 60

              providerAvailableTime += intervalTime

              let intervalServices = interval.services.length === 0 ? providerServices : interval.services

              intervalServices.forEach(function (serviceId) {
                if (!(serviceId in serviceData)) {
                  serviceData[serviceId] = {
                    count: 0,
                    available: 0,
                    occupied: 0,
                    revenue: 0
                  }
                }

                serviceData[serviceId].available += intervalTime
              })
            })

            employeeData[providerId].available += providerAvailableTime
            employeeData[providerId].occupied += parseInt(providerStats.occupied)
            employeeData[providerId].count += parseInt(providerStats.count)
            employeeData[providerId].revenue += parseInt(providerStats.revenue)
          }

          if (packageData.length) {
            for (let packageId in data[dateKey].packages) {
              if (!data[dateKey].packages.hasOwnProperty(packageId)) { continue }

              let packagesStats = data[dateKey].packages[packageId]

              packageData[packageId].occupied += parseInt(packagesStats.occupied)
              packageData[packageId].count += parseInt(packagesStats.count)
              packageData[packageId].revenue += parseInt(packagesStats.revenue)
              packageData[packageId].purchased += parseInt(packagesStats.purchased)
            }
          }
        }

        let employeeTableData = []

        for (let providerId in employeeData) {
          if (!employeeData.hasOwnProperty(providerId)) { continue }

          let provider = this.getProviderById(parseInt(providerId))

          employeeTableData.push({
            provider,
            employeeName: provider.firstName + ' ' + provider.lastName,
            employeePhoto: provider.pictureThumbPath,
            numAppointments: employeeData[providerId].count,
            sumPayments: employeeData[providerId].revenue,
            hoursAppointment: employeeData[providerId].occupied,
            load: employeeData[providerId].available !== 0 ? parseFloat((employeeData[providerId].occupied / employeeData[providerId].available * 100).toFixed(1)) : 0,
            available: employeeData[providerId].available,
            occupied: employeeData[providerId].occupied
          })
        }

        this.employeeTableParams.total = employeeTableData.length

        employeeTableData = employeeTableData.sort((a, b) => (a.employeeName > b.employeeName) ? 1 : -1)

        this.employeeTableData = employeeTableData

        this.showVisibleEmployeeTableData()

        let serviceTableData = []

        for (let serviceId in serviceData) {
          if (!serviceData.hasOwnProperty(serviceId)) { continue }

          let service = this.getServiceById(parseInt(serviceId))

          serviceTableData.push({
            service,
            serviceName: service.name,
            servicePhoto: service.pictureThumbPath,
            numAppointments: serviceData[serviceId].count,
            sumPayments: serviceData[serviceId].revenue,
            hoursAppointment: serviceData[serviceId].occupied,
            load: serviceData[serviceId].available !== 0 ? parseFloat((serviceData[serviceId].occupied / serviceData[serviceId].available * 100).toFixed(1)) : 0
          })
        }

        this.serviceTableParams.total = serviceTableData.length

        serviceTableData = serviceTableData.sort((a, b) => (a.serviceName > b.serviceName) ? 1 : -1)

        this.serviceTableData = serviceTableData

        this.showVisibleServiceTableData()

        let packageTableData = []

        for (let packageId in packageData) {
          if (!packageData.hasOwnProperty(packageId)) { continue }

          let pack = this.getPackageById(parseInt(packageId))

          packageTableData.push({
            pack,
            packageName: pack.name,
            packagePhoto: pack.pictureThumbPath,
            numPurchased: packageData[packageId].purchased,
            numAppointments: packageData[packageId].count,
            sumPayments: packageData[packageId].revenue,
            hoursAppointment: packageData[packageId].occupied
          })
        }

        this.packageTableParams.total = packageTableData.length

        packageTableData = packageTableData.sort((a, b) => (a.packageName > b.packageName) ? 1 : -1)

        this.packageTableData = packageTableData

        this.showVisiblePackageTableData()
      },

      fillCustomersChart: function (data) {
        this.customersChartData.datasets[0].data.splice(0, 1, data.newCustomersCount)
        this.customersChartData.datasets[0].data.splice(1, 1, data.returningCustomersCount)
        this.customersChartData.datasets[0].data.splice(2, 1, (this.newCustomers === 0 && this.returningCustomers === 0) ? 1 : 0)
        this.totalPastPeriodCustomers = data.totalPastPeriodCustomers
      },

      fillEmployeesChart: function (data) {
        this.employeesChartData.labels = []
        this.employeesChartData.datasets[0].data = []
        this.employeesChartData.datasets[1].data = []

        for (let i = 0; i < data.length; i++) {
          this.employeesChartData.labels.push(data[i].name)
          this.employeesChartData.datasets[0].data.push(data[i].views)
          this.employeesChartData.datasets[1].data.push(data[i].appointments)
        }
      },

      filterEmployeesChart: function () {
        let employeesStats = []
        let employeesToRemoveFromStats = []

        for (let i = 0; i < this.employeesStats.length; i++) {
          if (_.indexOf(this.employees, this.employeesStats[i].id) === -1) {
            employeesToRemoveFromStats.push(this.employeesStats[i])
          }
        }

        if (_.difference(this.employeesStats, employeesToRemoveFromStats).length === 0) {
          employeesStats = this.employees.length === 0 ? this.employeesStats : []
        } else {
          employeesStats = _.difference(this.employeesStats, employeesToRemoveFromStats)
        }

        if (typeof this.$refs.employeesChart !== 'undefined') {
          this.$refs.employeesChart.update()
        }
      },

      fillServicesChart: function (data) {
        this.servicesChartData.labels = []
        this.servicesChartData.datasets[0].data = []
        this.servicesChartData.datasets[1].data = []

        for (let i = 0; i < data.length; i++) {
          this.servicesChartData.labels.push(data[i].name)
          this.servicesChartData.datasets[0].data.push(data[i].views)
          this.servicesChartData.datasets[1].data.push(data[i].appointments)
        }
      },

      filterServicesChart: function () {
        let servicesStats = []
        let servicesToRemoveFromStats = []

        this.fillServicesChart(servicesStats)

        if (typeof this.$refs.servicesChart !== 'undefined') {
          this.$refs.servicesChart.update()
        }
      },

      fillLocationsChart: function (data) {
        this.locationsChartData.labels = []
        this.locationsChartData.datasets[0].data = []
        this.locationsChartData.datasets[1].data = []

        for (let i = 0; i < data.length; i++) {
          this.locationsChartData.labels.push(data[i].name)
          this.locationsChartData.datasets[0].data.push(data[i].views)
          this.locationsChartData.datasets[1].data.push(data[i].appointments)
        }
      },

      filterLocationsChart: function () {
        let locationsStats = []
        let locationsToRemoveFromStats = []

        for (let i = 0; i < this.locationsStats.length; i++) {
          if (_.indexOf(this.locations, this.locationsStats[i].id) === -1) {
            locationsToRemoveFromStats.push(this.locationsStats[i])
          }
        }

        if (_.difference(this.locationsStats, locationsToRemoveFromStats).length === 0) {
          locationsStats = this.locations.length === 0 ? this.locationsStats : []
        } else {
          locationsStats = _.difference(this.locationsStats, locationsToRemoveFromStats)
        }

        this.fillLocationsChart(locationsStats)

        if (typeof this.$refs.locationsChart !== 'undefined') {
          this.$refs.locationsChart.update()
        }
      },

      calculateChartTotal (name) {
        switch (name) {
          case ('count'):
            let appointmentsCount = 0

            this.smallBarChartAppointmentsData.datasets[0].data.forEach(function (value) {
              appointmentsCount += (value !== null ? value : 0)
            })

            return appointmentsCount
          case ('load'):
            let availableSum = 0
            let occupiedSum = 0

            for (let key in this.employeeTableData) {
              availableSum += this.employeeTableData[key].available
              occupiedSum += this.employeeTableData[key].occupied
            }

            return (availableSum !== 0 ? parseFloat((occupiedSum / availableSum * 100).toFixed(1)) : 0) + '%'
          case ('revenue'):
            let appointmentsRevenue = 0

            this.smallLineChartRevenueData.datasets[0].data.forEach(function (value) {
              appointmentsRevenue += (value !== null ? value : 0)
            })

            return this.getFormattedPrice(appointmentsRevenue)
        }
      },

      getCurrentUser () {
        this.$http.get(`${this.$root.getAjaxUrl}/users/current`)
          .then(response => {
            this.currentUser = response.data.data.user
          })
          .catch(e => {
            console.log('getCurrentUser fail')
          })
      },

      getPercentageBarColor (percent) {
        switch (true) {
          case (percent < 25):
            return '#FF1563'
          case (percent > 25 && percent < 50):
            return '#FFA700'
          case (percent > 50 && percent < 75):
            return '#BDDE00'
          case (percent > 75):
            return '#5FCE19'
          default:
            return '#5FCE19'
        }
      },

      growthClass (value) {
        if (value > 0 || value === '+∞') {
          return 'am-growth-increase'
        }

        if (value < 0 || value === '-∞') {
          return 'am-growth-decrease'
        }

        return 'am-growth-equal'
      },

      growthPercentageCharacter (value) {
        if (value === '+∞' || value === '-∞') {
          return ''
        }

        return '%'
      },

      growthPercentage (totalValue, pastTotalValue) {
        if (totalValue === 0 && pastTotalValue === 0) {
          return 0
        }

        if (totalValue === 0 && pastTotalValue !== 0) {
          return '-∞'
        }

        if (totalValue !== 0 && pastTotalValue === 0) {
          return '+∞'
        }

        return totalValue - pastTotalValue === 0 ? 0 : ((totalValue - pastTotalValue) / pastTotalValue * 100).toFixed(1)
      },

      openRecurringAppointment (id) {
        this.dialogAppointment = false

        setTimeout(() => {
          this.showDialogEditAppointment(id)
        }, 200)
      }
    },

    computed: {
      newCustomers () {
        return this.customersChartData.datasets[0].data[0]
      },

      returningCustomers () {
        return this.customersChartData.datasets[0].data[1]
      },

      totalCustomers () {
        return this.newCustomers + this.returningCustomers
      },

      newCustomersPercentage () {
        return this.totalCustomers === 0 ? 0 : parseFloat((this.newCustomers / this.totalCustomers * 100).toFixed(1))
      },

      returnedCustomersPercentage () {
        return this.totalCustomers === 0 ? 0 : parseFloat((this.returningCustomers / this.totalCustomers * 100).toFixed(1))
      },

      countGrowthPercentage () {
        return this.growthPercentage(this.selectedPeriodStats.count, this.previousPeriodStats.count)
      },

      countGrowthClass () {
        return this.growthClass(this.countGrowthPercentage)
      },

      revenueGrowthPercentage () {
        return this.growthPercentage(this.selectedPeriodStats.revenue, this.previousPeriodStats.revenue)
      },

      revenueGrowthClass () {
        return this.growthClass(this.revenueGrowthPercentage)
      },

      revenueGrowthPercentageCharacter () {
        return this.growthPercentageCharacter(this.revenueGrowthPercentage)
      },

      loadGrowthPercentage () {
        return this.growthPercentage(this.selectedPeriodStats.occupied, this.previousPeriodStats.occupied)
      },

      loadGrowthClass () {
        return this.growthClass(this.loadGrowthPercentage)
      },

      loadGrowthPercentageCharacter () {
        return this.growthPercentageCharacter(this.loadGrowthPercentage)
      },

      customersGrowthPercentage () {
        return this.growthPercentage(this.totalCustomers, this.totalPastPeriodCustomers)
      },

      customerGrowthClass () {
        return this.growthClass(this.customersGrowthPercentage)
      },

      customerGrowthPercentageCharacter () {
        return this.growthPercentageCharacter(this.customersGrowthPercentage)
      }
    },

    components: {
      BarChart,
      DoughnutChart,
      LineChart,
      DialogCustomer,
      DialogAppointment,
      DialogPayment,
      PageHeader,
      DialogExport,
      AppointmentListCollapsed,
      PaginationBlock,
      // DialogNewCustomize
    }
  }
</script>

<style lang="less">
.am-amelia-banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 28px;
  margin-bottom: 20px;
  border-radius: 8px;
  background-repeat: no-repeat;
  background-size: cover;

  @media only screen and (max-width: 992px) {
    flex-wrap: wrap;
    height: fit-content;
  }

  @media only screen and (max-width: 480px) {
    background-repeat: no-repeat;
    background-size: cover;
  }

  * {
    color: #FFFFFF;
  }

  &__content {
    display: flex;
    flex-direction: column;
    width: 100%;

    &-main {
      display: flex;
      justify-content: space-between;

      .am-amelia-banner__content-logo {
        display: flex;
        align-items: center;
        div {
          max-width: 210px;
          margin-left: 60px;
          font-weight: 700;
          font-size: 90px;
          line-height: 64px;
          color: #FFFFFF;
          transform: rotate(-6.93deg);

          @media only screen and (max-width: 1504px) {
            margin-left: 20px;
            font-size: 72px;
            max-width: fit-content;
          }

          @media only screen and (max-width: 1020px) {
            font-size: 40px;
            line-height: 46px;
          }

          @media only screen and (max-width: 820px) {
            max-width: 100%;
            transform: rotate(0deg);
          }

          @media only screen and (max-width: 380px) {
            font-size: 34px;
            line-height: 42px;
          }
        }

        @media only screen and (max-width: 820px) {
          justify-content: center;
          width: 100%;
        }
      }

      @media only screen and (max-width: 1240px) {
        flex-wrap: wrap;
      }
    }

    &-logo {
      margin-right: 16px;

      img {
        width: 82px;
        height: 88px;

        @media only screen and (max-width: 820px) {
          width: 64px;
          height: 72px;
        }

        @media only screen and (max-width: 380px) {
          width: 54px;
          height: 62px;
        }
      }

      @media only screen and (max-width: 380px) {
        margin-top: 18px;
      }
    }

    &-text {
      h1 {
        display: flex;
        flex-direction: column;
        align-items: center;

        .am-amelia-banner__text-center {
          font-weight: 700;
          font-size: 60px;
          line-height: 64px;

          @media only screen and (max-width: 1504px) {
            font-size: 54px;
          }

          @media only screen and (max-width: 1440px) {
            font-size: 48px;
            line-height: 54px;
          }

          @media only screen and (max-width: 540px) {
            font-size: 32px;
            line-height: 38px;
          }

          @media only screen and (max-width: 380px) {
            font-size: 26px;
            line-height: 32px;
          }

          &-subtitle {
            font-size: 40px;
            line-height: 64px;

            .am-youtube-text {
              color: #FF0000;
              text-decoration: none;
              &:focus {
                box-shadow: none;
                outline: none;
              }
            }

            @media only screen and (max-width: 1440px) {
              font-size: 32px;
              line-height: 48px;
            }

            @media only screen and (max-width: 540px) {
              font-size: 24px;
              line-height: 32px;
            }

            @media only screen and (max-width: 380px) {
              font-size: 20px;
              letter-spacing: -0.03em;
            }
          }
        }
      }

      @media only screen and (max-width: 820px) {
        justify-content: center;
        width: 100%;
      }
    }

    &-premier {
      max-width: 290px;
      align-items: center;
      display: flex;
      &-text {
        font-weight: 600;
        font-size: 40px;
        line-height: 56px;
        text-align: center;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: #FFE600 !important;

        @media only screen and (max-width: 1440px) {
          font-size: 28px;
          line-height: 36px;
        }

        @media only screen and (max-width: 448px) {
          max-width: 240px;
        }

        @media only screen and (max-width: 380px) {
          font-size: 20px;
          line-height: 28px;
          max-width: 170px;
        }
      }

      @media only screen and (max-width: 1440px) {
        max-width: 230px;
      }

      @media only screen and (max-width: 1240px) {
        width: 100%;
        max-width: unset;
        justify-content: center;
      }
    }
  }

  &__buttons {
    width: 0;

    @media only screen and (max-width: 992px) {
      max-width: 100%;
      display: flex;
      justify-content: center;
    }

    p {
      position: absolute;
      display: flex;
      top: 10px;
      right: 20px;
      margin: 0;
      cursor: pointer;
      font-size: 16px;
      line-height: 19px;
      opacity: 0.8;
      color: #011D9F;

      img {
        margin-left: 20px;
      }
    }

    a {
      min-width: 160px;
      text-align: center;
      display: inline-block;
      font-size: 22px;
      font-weight: 600;
      line-height: 25px;
      text-decoration: none;
      background: linear-gradient(351.76deg, #FFD601 -8.07%, #FCFF7D 123.41%);
      color: #011D9F;
      padding: 8px 24px;
      border-radius: 9px;
      z-index: 99;

      @media only screen and (max-width: 480px) {
        margin: 10px 0 0;
      }

      &:hover {
        background-color: #FAFF00E6;
      }

      &:active, &:hover, &:focus {
        text-decoration: none;
      }
    }
  }
}

.am-promo-banner {
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border-radius: 20px;
  line-height: 0;
  height: 140px;

  @media only screen and (max-width: 992px) {
    flex-wrap: wrap;
    height: fit-content;
  }

  @media only screen and (max-width: 480px) {
    background-repeat: no-repeat;
    background-size: cover;
  }

  * {
    color: #FFFFFF;
  }

  &__content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
    padding: 0 20px;
    min-height: 90px;
    @media only screen and (max-width: 1200px) {
      padding: 30px 10px 10px;
    }
    @media only screen and (max-width: 993px) {
      justify-content: space-between;
    }

    @media only screen and (max-width: 480px) {
      row-gap: 10px;
      justify-content: center;
    }

    .am-promo-banner-left {
      display: flex;
      align-items: center;
      max-width: 40%;
      @media only screen and (max-width: 1200px) {
        max-width: 50%;
      }
      @media only screen and (max-width: 740px) {
        min-height: 100px;
      }

      @media only screen and (max-width: 480px) {
        max-width: 100%;
      }

      .am-upgrade-to-premium {
        p {
          margin: 0;
          font-size: 26px;
          line-height: 1.2;
          @media only screen and (max-width: 1560px) {
            font-size: 22px;
          }
          @media only screen and (max-width: 786px) {
            font-size: 14px;
            line-height: 1.5;
          }
        }

        .am-amelia-text {
          margin: 0;
          font-size: 32px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          padding: 10px;
          color: #011CA4;
          background: linear-gradient(351.76deg, #FFD601 -8.07%, #FCFF7D 123.41%);
          border-radius: 10px;
          @media only screen and (max-width: 1400px) {
            font-size: 22px;
          }
          @media only screen and (max-width: 786px) {
            line-height: 1.5;
          }
        }

        .am-amelia-lite-users {
          font-family: 'Inter';
          font-style: italic;
          font-weight: 700;
          font-size: 20px;
          line-height: 24px;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: #011D9D;
        }
      }
    }

    .am-promo-banner-center {
      align-items: center;
      display: flex;
      @media only screen and (max-width: 1400px) {
        width: 30%;
        position: relative;
      }

      @media only screen and (max-width: 993px) {
        width: 50%;
      }

      @media only screen and (max-width: 480px) {
        width: 100%;
        min-height: 100px;
      }
      img {
        position: absolute;
        width: 450px;
        left: 39%;
        height: auto;
        @media only screen and (max-width: 1400px) {
          width: 100%;
          height: auto;
          left: 0;
        }

        @media only screen and (max-width: 993px) {
          width: 80%;
          top: 5%;
          left: unset;
          right: 0;
        }

        @media only screen and (max-width: 480px) {
          left: 50%;
          transform: translateX(-50%);
          top: 0;
        }
      }
    }

    &-main {
      display: flex;
    }

    &-logo {
      display: flex;
      align-items: center;
      margin-right: 20px;
      img {
        width: 83px;
        height: 88px;
        @media only screen and (max-width: 1080px) {
          width: 56px;
          height: auto;
        }
      }
    }

    &-text {
      h1 {
        display: flex;
        align-items: flex-start;
        font-size: 28px;
        font-weight: 500;
        line-height: 40px;
        margin: 0;

        .am-promo-banner__badge {
          width: 100px;
          height: 40px;
          display: inline-block;
          font-size: 16px;
          font-weight: 700;
          line-height: 40px;
          color: #FFFFFF;
          background-color: #3BA6FF;
          border-radius: 10px;
          margin-left: 20px;
          text-align: center;
          margin-bottom: 10px;
        }

        img {
          display: none;
        }

        @media only screen and (max-width: 768px) {
          font-size: 48px;

          img {
            display: inline-flex;
          }
        }
      }

      p {
        margin: 0 0 10px;
        font-size: 20px;
        font-weight: 500;
        line-height: 24px;
      }
    }

    &-coupon {
      height: 27px;
      font-size: 22px;
      font-weight: 500;
      line-height: 27px;
      padding: 10px;
      border-radius: 10px;
      background-color: #3BA6FF;
    }
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    @media only screen and (max-width: 1630px) {
      flex-direction: column;
    }
    @media only screen and (max-width: 993px) {
      flex-direction: row;
    }

    @media only screen and (max-width: 480px) {
      flex-direction: column;
    }

    .banner-counter {
      cursor: default;
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 44px;
      padding: 6px 12px;
      margin-right: 12px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 24px;
      line-height: 33px;
      color: #fff;
      box-sizing: border-box;
      gap: 16px;

      .days, .minutes, .hours, .seconds {
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        span:not(:first-child) {
          font-size: 10px;
          line-height: 14px;
          font-weight: 400;
        }
      }

      .am-amelia-lite-users {
        cursor: default;
        position: relative;
        font-weight: 600;
        font-size: 22px;
        line-height: 25px;
        text-align: center;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: #181059;
        top: unset;
        right: unset;
      }
    }

    @media only screen and (max-width: 992px) {
      max-width: 100%;
      display: flex;
      justify-content: center;
    }

    p {
      position: absolute;
      display: flex;
      top: 10px;
      right: 20px;
      margin: 0;
      cursor: pointer;
      font-size: 16px;
      line-height: 19px;
      opacity: 0.8;
      color: #011D9F;

      img {
        margin-left: 20px;
      }
    }

    a {
      min-width: 160px;
      text-align: center;
      display: inline-block;
      font-size: 22px;
      font-weight: 600;
      line-height: 25px;
      text-decoration: none;
      background: linear-gradient(351.76deg, #FFD601 -8.07%, #FCFF7D 123.41%);
      color: #011D9F;
      padding: 8px 24px;
      border-radius: 9px;
      z-index: 99;

      @media only screen and (max-width: 480px) {
        margin: 10px 0 0;
      }

      &:hover {
        background-color: #FAFF00E6;
      }

      &:active, &:hover, &:focus {
        text-decoration: none;
      }
    }
  }
}
</style>
