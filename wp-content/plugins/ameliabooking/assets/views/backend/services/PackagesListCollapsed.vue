<template>
  <div>

    <!-- Collapsed Data For One Package Purchase -->
    <div class="am-appointment-details">
      <el-row>
        <div class="am-appointments-list-head" style="padding:0" v-if="packagePurchaseHasAppointments(packageCustomer)">
          <p>{{ $root.labels.appointments }}:</p>
        </div>

        <el-row
            v-for="(appointment, key) in packageCustomer.appointments"
            :key="key"
            class="has-divider"
            style="line-height: initial;"
            v-if="appointment.id"
        >

          <el-col :lg="12">
            <el-row :gutter="10" class="am-appointments-flex-row-middle-align">

              <!-- Appointment List Checkbox -->
              <el-col :lg="2" :md="2">
                <p>
                  <el-checkbox
                      v-if="$root.settings.capabilities.canDelete === true"
                      v-model="appointment.checked"
                      @change="handleCheckPackageAppointment"
                  >
                  </el-checkbox>
                </p>
              </el-col>

              <!-- Appointment List Date Label -->
              <el-col :lg="8" :md="8" :sm="8">
                <p class="am-col-title">{{ $root.labels.date }}:</p>
                <h4>{{ getFrontedFormattedDate(appointment.bookingStarts.split(' ')[0]) }}</h4>
              </el-col>

              <!-- Appointment List Time Label -->
              <el-col :lg="5" :md="5" :sm="5">
                <p class="am-col-title">{{ $root.labels.time }}:</p>
                <h4>{{ getFrontedFormattedTime(appointment.bookingStarts.split(' ')[1]) }}</h4>
              </el-col>

              <!-- Appointment Service Label -->
              <el-col :lg="15" :md="15" :sm="15">
                <div class="am-appointment-package-wrap">
                  <p class="am-col-title">{{ $root.labels.service }}:</p>
                  <h4>{{ appointment.service.name }}</h4>
                </div>
              </el-col>

            </el-row>
          </el-col>

          <el-col :lg="12">
            <el-row :gutter="10" class="am-appointments-flex-row-middle-align">
              <el-col :lg="2" :md="2">
              </el-col>

              <!-- Appointment List Employee Label -->
              <el-col :lg="9" :md="9" :sm="9">
                <p class="am-col-title">{{ $root.labels.employee }}:</p>
                <div class="am-assigned">
                  <img :src="pictureLoad(getProviderById(appointment.provider.id), true)"
                       @error="imageLoadError(getProviderById(appointment.provider.id), true)"
                  />
                  <h4>
                    {{ appointment.provider.firstName + ' ' + appointment.provider.lastName }}
                  </h4>
                </div>
              </el-col>

              <!-- Appointment Status Label -->
              <el-col :lg="9" :md="9" :sm="9" style="display: flex; margin: auto;">
                <div class="am-appointment-status" @click.stop>
                  <span class="am-appointment-status-symbol" :class="appointment.status"></span>
                  <el-select
                      v-model="appointment.status"
                      :placeholder="$root.labels.status"
                      @change="updatePackageAppointmentStatus(appointment, packageCustomer)"
                      :disabled="packageCustomer.updating"
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
                <div class="am-edit-btn" style="margin-left: 8px">
                  <el-button
                      class="am-button-icon"
                      style="margin: 0"
                      @click="showDialogEditPackageAppointment(appointment.id, packageCustomer)">
                    <img class="svg-amelia" :alt="$root.labels.edit" :src="$root.getUrl + 'public/img/edit.svg'"/>
                  </el-button>
                </div>
              </el-col>

            </el-row>
          </el-col>

        </el-row>

      </el-row>

      <el-row style="margin-top:16px;margin-bottom:16px;" class="am-appointments-flex-row-middle-align">
        <el-col :lg="12" :sm="12">
          <h3>
            {{ packageCustomer.count }} {{ $root.labels.package_appointment_left }}
          </h3>
        </el-col>
        <el-col :lg="12" :sm="12" style="text-align: end">
          <el-button v-if="packageCustomer.count > 0" type="primary" @click="showDialogNewPackageAppointment(packageCustomer)">
            <img :src="$root.getUrl+'public/img/am-plus.svg'" style="vertical-align:middle; margin-right: 8px"/>
            {{ $root.labels.package_book_appointment }}
          </el-button>
        </el-col>
      </el-row>

    </div>

  </div>
</template>

<script>
import entitiesMixin from '../../../js/common/mixins/entitiesMixin'
import priceMixin from '../../../js/common/mixins/priceMixin'
import dateMixin from '../../../js/common/mixins/dateMixin'
import imageMixin from '../../../js/common/mixins/imageMixin'
import packageMixin from '../../../js/frontend/mixins/packageMixin'

export default {
  mixins: [entitiesMixin, priceMixin, dateMixin, imageMixin, packageMixin],

  props: [
    'packageCustomer',
    'packageCustomerId',
    'options',
    'purchasedPackage'
  ],

  data () {
    return {
      statuses: [
        {
          value: 'approved',
          label: this.$root.labels.approved

        }, {
          value: 'pending',
          label: this.$root.labels.pending

        },
        {
          value: 'canceled',
          label: this.$root.labels.canceled

        },
        {
          value: 'rejected',
          label: this.$root.labels.rejected

        }
      ]
    }
  },

  methods: {
    handleCheckPackageAppointment () {
      this.$emit('handleCheckPackageAppointment', this.packageCustomerId)
    },

    showDialogNewCustomer () {
      this.customer = this.getInitCustomerObject()
      this.dialogCustomer = true
    },

    showDialogEditPackageAppointment (appointmentId, packageCustomer) {
      this.$emit('showDialogEditPackageAppointment', appointmentId, packageCustomer)
    },

    updatePackageAppointmentStatus (appointment, packageCustomer) {
      this.$emit('updatePackageAppointmentStatus', appointment, packageCustomer)
    },

    showDialogNewPackageAppointment (packageCustomer) {
      this.$emit('showDialogNewPackageAppointment', packageCustomer)
    }

  }
}
</script>
