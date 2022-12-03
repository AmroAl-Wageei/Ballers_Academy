<template>
    <el-collapse accordion :class="{'am-lite-container-disabled': $root.isLite}">
      <el-collapse-item class="am-setting-box" name="1">
        <template slot="title">
          <p>{{ $root.labels.facebook_pixel }}:</p>
        </template>
        <template>
          <!-- Form -->
          <el-form :model="facebookPixelSettings" ref="facebookPixelSettings" label-position="top" @submit.prevent="onSubmit" style="padding-top: 0;">
            <!-- Client ID -->
            <el-form-item :label="$root.labels.id + ':'">
              <el-input v-model.trim="facebookPixelSettings.id" auto-complete="off"></el-input>
            </el-form-item>
            <!-- /Client ID -->

            <el-tabs v-model="activeFacebookPixelTab">
              <el-tab-pane :label="$root.labels.appointments" name="appointments">
                <tracking-facebook-pixel
                    :events="facebookPixelSettings.tracking.appointment"
                    :actions="appointmentActions"
                    :marketingPlaceholders="marketingPlaceholders"
                    type="appointments"
                ></tracking-facebook-pixel>
              </el-tab-pane>
              <el-tab-pane :label="$root.labels.packages" name="packages" v-if="$root.licence.isPro || $root.licence.isDeveloper">
                <tracking-facebook-pixel
                    :events="facebookPixelSettings.tracking.package"
                    :actions="packageActions"
                    :marketingPlaceholders="marketingPlaceholders"
                    type="packages"
                ></tracking-facebook-pixel>
              </el-tab-pane>
              <el-tab-pane :label="$root.labels.events" name="events">
                <tracking-facebook-pixel
                    :events="facebookPixelSettings.tracking.event"
                    :actions="eventActions"
                    :marketingPlaceholders="marketingPlaceholders"
                    type="events"
                ></tracking-facebook-pixel>
              </el-tab-pane>
            </el-tabs>
          </el-form>
          <!-- /Form -->
        </template>
      </el-collapse-item>

      <el-collapse-item class="am-setting-box" name="2">
        <template slot="title">
          <p>{{ $root.labels.google_analytics }}:</p>
        </template>
        <template>
          <!-- Form -->
          <el-form :model="googleTagSettings" ref="googleTagSettings" label-position="top" @submit.prevent="onSubmit" style="padding-top: 0;">
            <!-- Client ID -->
            <el-form-item :label="$root.labels.id + ':'">
              <el-input v-model.trim="googleTagSettings.id" auto-complete="off"></el-input>
            </el-form-item>
            <!-- /Client ID -->

            <el-tabs v-model="activeGoogleTagTab">
              <el-tab-pane :label="$root.labels.appointments" name="appointments">
                <tracking-google-tag
                    :events="googleTagSettings.tracking.appointment"
                    :actions="appointmentActions"
                    :marketingPlaceholders="marketingPlaceholders"
                    type="appointments"
                ></tracking-google-tag>
              </el-tab-pane>
              <el-tab-pane :label="$root.labels.packages" name="packages" v-if="$root.licence.isPro || $root.licence.isDeveloper">
                <tracking-google-tag
                    :events="googleTagSettings.tracking.package"
                    :actions="packageActions"
                    :marketingPlaceholders="marketingPlaceholders"
                    type="packages"
                ></tracking-google-tag>
              </el-tab-pane>
              <el-tab-pane :label="$root.labels.events" name="events">
                <tracking-google-tag
                    :events="googleTagSettings.tracking.event"
                    :actions="eventActions"
                    :marketingPlaceholders="marketingPlaceholders"
                    type="events"
                ></tracking-google-tag>
              </el-tab-pane>
            </el-tabs>
          </el-form>
          <!-- /Form -->
        </template>
      </el-collapse-item>
    </el-collapse>
</template>

<script>
import imageMixin from '../../../../js/common/mixins/imageMixin'
import TrackingGoogleTag from './TrackingGoogleTag.vue'
import TrackingFacebookPixel from './TrackingFacebookPixel.vue'

export default {

  mixins: [imageMixin],

  props: {
    facebookPixel: {
      type: Object
    },
    googleTag: {
      type: Object
    }
  },

  data () {
    return {
      appointmentActions: [
        {value: 'ViewContent', label: this.$root.labels.tracking_ViewContent},
        {value: 'SelectCategory', label: this.$root.labels.tracking_SelectCategory},
        {value: 'SelectService', label: this.$root.labels.tracking_SelectService},
        {value: 'SelectEmployee', label: this.$root.labels.tracking_SelectEmployee},
        {value: 'SelectLocation', label: this.$root.labels.tracking_SelectLocation},
        {value: 'InitiateCheckout', label: this.$root.labels.tracking_InitiateCheckout},
        {value: 'Schedule', label: this.$root.labels.tracking_Schedule},
        {value: 'Purchase', label: this.$root.labels.tracking_Purchase}
      ],
      packageActions: [
        {value: 'ViewContent', label: this.$root.labels.tracking_ViewContent},
        {value: 'SelectPackage', label: this.$root.labels.tracking_SelectPackage},
        {value: 'InitiateCheckout', label: this.$root.labels.tracking_InitiateCheckout},
        {value: 'Schedule', label: this.$root.labels.tracking_Schedule},
        {value: 'Purchase', label: this.$root.labels.tracking_Purchase}
      ],
      eventActions: [
        {value: 'ViewContent', label: this.$root.labels.tracking_ViewContent},
        {value: 'SelectEvent', label: this.$root.labels.tracking_SelectEvent},
        {value: 'InitiateCheckout', label: this.$root.labels.tracking_InitiateCheckout},
        {value: 'Schedule', label: this.$root.labels.tracking_Schedule},
        {value: 'Purchase', label: this.$root.labels.tracking_Purchase}
      ],
      marketingPlaceholders: {
        appointments: {
          placeholders: [
            {
              value: '%category_id%',
              label: 'ID',
              custom: true
            },
            {
              value: '%category_name%',
              label: this.$root.labels.ph_category_name
            },
            {
              value: '%service_id%',
              label: 'ID',
              custom: true
            },
            {
              value: '%service_name%',
              label: this.$root.labels.ph_service_name
            },
            {
              value: '%employee_id%',
              label: 'ID',
              custom: true
            },
            {
              value: '%employee_fullName%',
              label: this.$root.labels.ph_employee_full_name,
              custom: true
            },
            {
              value: '%location_id%',
              label: 'ID',
              custom: true
            },
            {
              value: '%location_name%',
              label: this.$root.labels.ph_location_name
            },
            {
              value: '%payment_amount%',
              label: this.$root.labels.ph_payment_price
            },
            {
              value: '%payment_currency%',
              label: this.$root.labels.currency
            }
          ]
        },
        events: {
          placeholders: [
            {
              value: '%event_id%',
              label: 'ID',
              custom: true
            },
            {
              value: '%event_name%',
              label: this.$root.labels.ph_event_name
            },
            {
              value: '%payment_amount%',
              label: this.$root.labels.ph_payment_price
            },
            {
              value: '%payment_currency%',
              label: this.$root.labels.currency
            }
          ]
        },
        packages: {
          placeholders: [
            {
              value: '%package_id%',
              label: 'ID',
              custom: true
            },
            {
              value: '%package_name%',
              label: this.$root.labels.ph_package_name
            },
            {
              value: '%payment_amount%',
              label: this.$root.labels.ph_payment_price
            },
            {
              value: '%payment_currency%',
              label: this.$root.labels.currency
            }
          ]
        }
      },
      activeFacebookPixelTab: 'appointments',
      activeGoogleTagTab: 'appointments',
      facebookPixelSettings: this.facebookPixel,
      googleTagSettings: this.googleTag
    }
  },

  mounted () {
  },

  methods: {
    selectItem (values, actionType, entityType) {
      this.facebookPixelSettings[actionType][entityType].forEach((item, i) => {
        item.enabled = values.indexOf(i) !== -1
      })
    },

    redirectToDocumentation () {
      window.open('https://wpamelia.com/configuring-facebook-pixel/', '_blank')
    }
  },

  components: {
    TrackingGoogleTag,
    TrackingFacebookPixel
  }
}
</script>
