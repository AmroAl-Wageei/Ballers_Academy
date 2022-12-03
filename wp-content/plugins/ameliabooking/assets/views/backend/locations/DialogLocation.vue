<template>
  <div>
    <div class="am-dialog-scrollable" :class="{'am-edit':location.id !== 0}">

      <!-- Dialog Header -->
      <div class="am-dialog-header">
        <el-row>
          <el-col :span="16">
            <h2 v-if="location.id != 0">{{ $root.labels.edit_location }}</h2>
            <h2 v-else>{{ $root.labels.new_location }}</h2>
          </el-col>
          <el-col :span="8" class="align-right">
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Form -->
      <el-form :model="location" ref="location" :rules="rules" label-position="top" @submit.prevent="onSubmit">

        <!-- Profile Picture -->
        <div class="am-location-profile">
          <picture-upload
              :edited-entity="this.location"
              :entity-name="'location'"
              @pictureSelected="pictureSelected"
          >
          </picture-upload>
          <h2>{{ location.name }}</h2>
        </div>

        <!-- Name -->
        <div class="am-event-translate" @click="showDialogTranslate('name')" style="display: inline-block;float: right;cursor: pointer;">
          <img class="am-dialog-translate-svg" width="16px" :src="$root.getUrl+'public/img/translate.svg'">
          {{ $root.labels.translate }}
        </div>
        <el-form-item :label="$root.labels.name + ':'" prop="name">
          <el-input
              v-model="location.name"
              placeholder=""
              @input="clearValidation()"
              @change="trimProperty(location, 'name')"
          >
          </el-input>
        </el-form-item>

        <!-- Address -->
        <el-form-item :label="$root.labels.address + ':'">
          <div class="el-input" :style="{marginBottom: gMapApiKey ? '':0}">
            <vue-google-autocomplete
                v-if="gMapApiKey"
                ref="location.address"
                id="address-autocomplete"
                classname="el-input__inner"
                placeholder=""
                @placechanged="getAddressData"
                :value="location.address"
            >
            </vue-google-autocomplete>
            <el-input
              v-else
              v-model="location.address"
            >
            </el-input>
          </div>
          <el-alert
              v-if="!gMapApiKey"
              class="am-activation-alert"
              type="info"
              show-icon
              title=""
              :description="$root.labels.google_maps_notice"
              :closable="false"
          >
          </el-alert>
        </el-form-item>

        <!-- Pin Icon -->
        <el-form-item :label="$root.labels.pin_icon+':'" v-if="gMapApiKey">
          <el-select
              v-model="location.pin"
              placeholder=""
              @change="initMap(location.latitude, location.longitude, location.pin)"
          >
            <el-option
                v-for="item in formOptions.pins"
                :key="item.id"
                :label="item.name"
                :value="item.iconUrl"
                class="pin-icon"
            >
              <img :src="item.iconUrl"/> <span>{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- Map -->
        <el-form-item :label="$root.labels.map+':'" v-show="gMapApiKey">
          <div id="map"></div>
        </el-form-item>

        <!-- Not Right Address -->
        <el-button type="text" class="am-text-button-icon" @click="showLatLng = !showLatLng" v-show="gMapApiKey">
          <img class="svg-amelia" :alt="$root.labels.delete" :src="$root.getUrl+'public/img/location.svg'"/>
          {{ $root.labels.not_right_address }}
        </el-button>

        <transition name="slide-down">
          <div v-show="showLatLng">
            <el-row :gutter="16">

              <!-- Latitude -->
              <el-col :span="12">
                <el-form-item :label="$root.labels.latitude+':'">
                  <el-input-number
                      v-model="location.latitude"
                      @change="initMap(location.latitude, location.longitude, location.pin)"
                  >
                  </el-input-number>
                </el-form-item>
              </el-col>

              <!-- Longitude -->
              <el-col :span="12">
                <el-form-item :label="$root.labels.longitude+':'">
                  <el-input-number
                      v-model="location.longitude"
                      @change="initMap(location.latitude, location.longitude, location.pin)"
                  >
                  </el-input-number>
                </el-form-item>
              </el-col>

            </el-row>
          </div>
        </transition>

        <!-- Phone -->
        <el-form-item :label="$root.labels.phone+':'">
          <phone-input
              :savedPhone="location.phone"
              @phoneFormatted="phoneFormatted"
          >
          </phone-input>
        </el-form-item>

        <!-- Description -->
        <div class="am-event-translate" @click="showDialogTranslate('description')" style="display: inline-block;float: right;cursor: pointer;">
          <img class="am-dialog-translate-svg" width="16px" :src="$root.getUrl+'public/img/translate.svg'">
          {{ $root.labels.translate }}
        </div>
        <el-form-item :label="$root.labels.description+':'">
          <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6}"
              placeholder=""
              v-model="location.description"
              @input="clearValidation()"
          >
          </el-input>
        </el-form-item>

      </el-form>
    </div>

    <dialog-actions
        formName="location"
        urlName="locations"
        :isNew="location.id === 0"
        :entity="location"
        :getParsedEntity="getParsedEntity"
        :hasIcons="true"
        :updateStash="true"

        :status="{
          on: 'visible',
          off: 'hidden'
        }"

        :buttonText="{
          confirm: {
            status: {
              yes: location.status === 'visible' ? $root.labels.visibility_hide : $root.labels.visibility_show,
              no: $root.labels.no
            }
          }
        }"

        :action="{
          haveAdd: true,
          haveEdit: true,
          haveStatus: true,
          haveRemove: $root.settings.capabilities.canDelete === true,
          haveRemoveEffect: true,
          ignoreDeleteEffect: true,
          haveDuplicate: true
        }"

        :message="{
          success: {
            save: $root.labels.location_saved,
            remove: $root.labels.location_deleted,
            show: $root.labels.location_visible,
            hide: $root.labels.location_hidden
          },
          confirm: {
            remove: $root.labels.confirm_delete_location,
            show: $root.labels.confirm_show_location,
            hide: $root.labels.confirm_hide_location,
            duplicate: $root.labels.confirm_duplicate_location
          }
        }"
    >
    </dialog-actions>
  </div>
</template>

<script>
  import DialogActions from '../parts/DialogActions.vue'
  import PhoneInput from '../../parts/PhoneInput.vue'
  import PictureUpload from '../parts/PictureUpload.vue'
  import VueGoogleAutocomplete from 'vue-google-autocomplete'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import helperMixin from '../../../js/backend/mixins/helperMixin'

  export default {

    mixins: [imageMixin, notifyMixin, helperMixin],

    props: {
      location: null
    },

    data () {
      return {
        gMapApiKey: false,
        showLatLng: false,

        formOptions: {
          pins: [
            {
              id: 1,
              name: this.$root.labels.pin_orange,
              iconUrl: `${this.$root.getUrl}/public/img/pins/orange.png`
            },
            {
              id: 2,
              name: this.$root.labels.pin_red,
              iconUrl: `${this.$root.getUrl}/public/img/pins/red.png`
            },
            {
              id: 3,
              name: this.$root.labels.pin_purple,
              iconUrl: `${this.$root.getUrl}/public/img/pins/purple.png`
            },
            {
              id: 4,
              name: this.$root.labels.pin_green,
              iconUrl: `${this.$root.getUrl}/public/img/pins/green.png`
            }
          ]
        },

        rules: {
          name: [
            {required: true, message: this.$root.labels.enter_location_name_warning, trigger: 'submit'}
          ]
        }

      }
    },

    created () {

    },

    mounted: function () {},

    methods: {
      getParsedEntity: function () {},

      closeDialog: function () {},

      getAddressData: function () {},

      initMap: function () {},

      phoneFormatted: function () {},

      pictureSelected: function () {},

      clearValidation: function () {}
    },

    watch: {
      'location.latitude' () {
        if (typeof this.location.latitude === 'undefined') {
          this.location.latitude = 0
          this.initMap()
        }
      },

      'location.longitude' () {
        if (typeof this.location.longitude === 'undefined') {
          this.location.longitude = 0
          this.initMap()
        }
      }
    },

    components: {
      VueGoogleAutocomplete,
      PhoneInput,
      PictureUpload,
      DialogActions
    }

  }
</script>
