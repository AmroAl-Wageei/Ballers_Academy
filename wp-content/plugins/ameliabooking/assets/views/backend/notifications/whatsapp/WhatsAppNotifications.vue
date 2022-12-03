<template>
  <div id="am-whatsapp-notifications" class="am-body">

    <div class="am-whatsapp-feature">
      WhatsApp feature is available only with Pro and Dev licenses
    </div>

    <div v-if="openSettings">
      <!-- Spinner -->
      <div class="am-spinner am-section" v-if="settingsLoading">
        <img :src="$root.getUrl + 'public/img/spinner.svg'"/>
      </div>
      <!-- /Spinner -->

      <el-form v-else class="am-whatsapp-settings" ref="whatsAppSettings" :model="whatsAppSettings" :rules="rules" @submit.prevent="onSubmit">
        <el-row>
          <h1 @click="openSettings = false" style="cursor: pointer;display: inline-block">
            <img :src="$root.getUrl+'public/img/arrow-back.svg'"> {{ $root.labels.whatsapp_settings }}
          </h1>
        </el-row>
        <!-- Phone ID -->
        <el-row>
          <el-form-item prop="phoneId">
            <p>{{ $root.labels.whatsapp_phone_id + ':' }}</p>
            <el-input type="text" v-model="whatsAppSettings.phoneId" @input="clearValidation"></el-input>
          </el-form-item>
        </el-row>
        <!-- /Phone ID -->
        <!-- Access Token -->
        <el-row>
          <el-form-item prop="accessToken">
            <p>{{ $root.labels.whatsapp_access_token + ':' }}</p>
            <el-input type="text" v-model="whatsAppSettings.accessToken" @input="clearValidation"></el-input>
          </el-form-item>
        </el-row>
        <!-- /Phone ID -->
        <!-- Business ID -->
        <el-row>
          <el-form-item prop="businessId">
            <p>{{ $root.labels.whatsapp_business_id + ':' }}</p>
            <el-input type="text" v-model="whatsAppSettings.businessId" @input="clearValidation"></el-input>
          </el-form-item>
        </el-row>
        <!-- /Business ID -->
        <!-- Default Language -->
        <el-row>
          <el-form-item prop="whatsAppLanguage">
            <p style="display: inline-block;">{{ $root.labels.whatsapp_default_language + ':' }}</p>
            <el-tooltip placement="right">
              <div slot="content" v-html="$root.labels.whatsapp_default_language_tooltip"></div>
              <i class="el-icon-question am-tooltip-icon"></i>
            </el-tooltip>
            <!-- Select Language -->
            <el-select class="select-languages" :placeholder="$root.labels.language" v-model="whatsAppSettings.whatsAppLanguage" filterable @change="clearValidation">
              <li class="el-select-dropdown__item" @click="manageLanguages">
                      <span>
                        <img class="option-languages-flag" :src="$root.getUrl+'public/img/translate.svg'">
                        {{ $root.labels.manage_languages }}
                      </span>
              </li>
              <hr v-if="passedUsedLanguages.length > 0">
              <template slot="prefix">
                <img class="select-languages-flag" :src="getLanguageFlag(whatsAppSettings.whatsAppLanguage)">
              </template>
              <el-option
                v-for="(lang, index) in passedUsedLanguages"
                :key="index"
                :label="getLanguageLabel(lang)"
                :value="lang"
              >
                      <span>
                        <img class="option-languages-flag" :src="getLanguageFlag(lang)">
                        {{ getLanguageLabel(lang) }}
                      </span>
              </el-option>

            </el-select>
            <!-- /Select Language -->

          </el-form-item>
        </el-row>
        <!-- /Default Language -->
        <el-row class="am-whatsapp-settings-buttons">
          <el-button
            size="medium"
            @click="openSettings = false"
          >
            {{ $root.labels.cancel }}
          </el-button>
          <el-button
            size="medium"
            type="primary"
            @click="saveWhatsAppSettings"
            :loading="settingsSaving"
          >
            {{ $root.labels.save }}
          </el-button>
        </el-row>
      </el-form>

    </div>

    <customize-notifications
      v-else-if="!settingsLoading"
      :notifications="notifications"
      :categories="categories"
      :customFields="customFields"
      :coupons="coupons"
      :events="events"
      type="whatsapp"
      :templates="templates"
      @openSettings="openSettings = true"
    >
    </customize-notifications>

  </div>
</template>

<script>
import CustomizeNotifications from "../common/CustomizeNotifications";
import notifyMixin from '../../../../js/backend/mixins/notifyMixin'
import placeholdersMixin from "../../../../js/backend/mixins/placeholdersMixin";
import priceMixin from "../../../../js/common/mixins/priceMixin";

export default {
  mixins: [notifyMixin, placeholdersMixin, priceMixin],

  props: {
    categories: {
      default: () => [],
      type: Array
    },
    customFields: {
      default: () => [],
      type: Array
    },
    coupons: {
      default: () => [],
      type: Array
    },
    events: {
      default: () => [],
      type: Array
    },
    notifications: {
      default: () => [],
      type: Array
    },
    templates: {
      default: () => [],
      type: Array
    },
    passedUsedLanguages: {
      default: () => [],
      type: Array
    },
    languagesData: {
      default: () => {},
      type: Object
    },
  },

  data () {
    return {
      notificationsSettings: null,
      settingsSaving: false,
      settingsLoading: true,
      openSettings: false,
      whatsAppSettings: {
        phoneId: '',
        accessToken: '',
        businessId: '',
        whatsAppLanguage: ''
      },
      rules: {
        phoneId: [
          {required: true, message: this.$root.labels.whatsapp_enter_phone_id, trigger: 'submit'}
        ],
        accessToken: [
          {required: true, message: this.$root.labels.whatsapp_enter_access_token, trigger: 'submit'}
        ],
        businessId: [
          {required: true, message: this.$root.labels.whatsapp_enter_business_id, trigger: 'submit'}
        ],
        whatsAppLanguage: [
          {required: true, message: this.$root.labels.whatsapp_choose_language, trigger: 'submit'}
        ]
      }
    }
  },

  mounted () {
    this.settingsLoading = true
    this.$http.get(
      `${this.$root.getAjaxUrl}/settings`
    ).then(response => {
      this.notificationsSettings = response.data.data.settings.notifications
      this.whatsAppSettings.phoneId = this.notificationsSettings.whatsAppPhoneID
      this.whatsAppSettings.accessToken = this.notificationsSettings.whatsAppAccessToken
      this.whatsAppSettings.businessId = this.notificationsSettings.whatsAppBusinessID
      this.whatsAppSettings.whatsAppLanguage = this.notificationsSettings.whatsAppLanguage ? this.notificationsSettings.whatsAppLanguage : this.$root.settings.wordpress.locale
      if (!this.whatsAppSettings.phoneId || !this.whatsAppSettings.accessToken || !this.whatsAppSettings.businessId) {
        this.openSettings = true
      }
      this.settingsLoading = false
    }).catch(e => {
      console.log(e.message)
      this.settingsLoading = false
    })
  },

  methods: {
    saveWhatsAppSettings() {
      this.$refs.whatsAppSettings.validate((valid, errors) => {
        if (valid) {
          this.settingsSaving = true
          this.notificationsSettings.whatsAppPhoneID = this.whatsAppSettings.phoneId
          this.notificationsSettings.whatsAppAccessToken = this.whatsAppSettings.accessToken
          this.notificationsSettings.whatsAppBusinessID = this.whatsAppSettings.businessId
          this.notificationsSettings.whatsAppLanguage = this.whatsAppSettings.whatsAppLanguage

          this.$http.post(`${this.$root.getAjaxUrl}/settings`, {
            notifications: this.notificationsSettings
          }).then((response) => {
            this.$root.settings.notifications = Object.assign(this.$root.settings.notifications, response.data.data.settings.notifications)
            this.$emit('getNotifications')
            this.notify(
              this.$root.labels.success,
              this.$root.labels.settings_saved,
              'success'
            )
            this.openSettings = false
          }).catch((e) => {
            console.log(e)
          }).finally(() => {
            this.settingsSaving = false
          })
        }
      })
    },

    clearValidation () {
      if (typeof this.$refs.whatsAppSettings !== 'undefined') {
        this.$refs.whatsAppSettings.clearValidate()
      }
    },

    manageLanguages () {
      this.$emit('manageLanguages')
    },

    getLanguageLabel (lang) {
      return this.languagesData[lang] ? this.languagesData[lang].name : ''
    },

    getLanguageFlag (lang) {
      if (lang && this.languagesData[lang] && this.languagesData[lang].country_code) {
        return this.$root.getUrl + 'public/img/flags/' + this.languagesData[lang].country_code + '.png'
      }
      return this.$root.getUrl + 'public/img/grey.svg'
    }

  },

  components: {
    CustomizeNotifications
  }
}
</script>
