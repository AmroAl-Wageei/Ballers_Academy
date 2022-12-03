<template>
  <div>
    <div v-show="data.stripe.enabled">
      <el-row :gutter="24" class="zero-margin-bottom">
        <el-col :span="11">
          <el-form-item :label="$root.labels.name + ':'">
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <label class="el-form-item__label">
          {{$root.labels.value + ': '}}
          <el-tooltip placement="top">
            <div slot="content">{{ $root.labels.metadata_value_tooltip }}</div>
            <i class="el-icon-question am-tooltip-icon"></i>
          </el-tooltip>
          </label>
        </el-col>
      </el-row>
      <el-row :gutter="24" type="flex" v-for="(pair, index) in stripeMetaData" :key="index" class="small-margin-bottom am-payments-meta-data">
        <el-col :span="10">
            <el-input type="text" :name="pair.name" v-model="stripeMetaData[index].key"/>
        </el-col>
        <el-col :span="10">
            <el-input type="text" v-model="stripeMetaData[index].value"/>
        </el-col>
        <el-col :span="4">
          <span @click="deleteMetaDataPair('stripe', index)">
            <img class="svg-amelia" width="16px" :src="$root.getUrl+'public/img/delete.svg'">
          </span>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col>
          <el-button type="primary" v-on:click="addMetaDataPair('stripe')">{{$root.labels.add_metaData}}</el-button>
        </el-col>
      </el-row>
    </div>
    <div v-show="data.mollie.enabled">
      <el-row :gutter="24" class="zero-margin-bottom">
        <el-col :span="11">
          <el-form-item :label="$root.labels.name + ':'">
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <label class="el-form-item__label">
            {{$root.labels.value + ': '}}
            <el-tooltip placement="top">
              <div slot="content">{{ $root.labels.metadata_value_tooltip }}</div>
              <i class="el-icon-question am-tooltip-icon"></i>
            </el-tooltip>
          </label>
        </el-col>
      </el-row>
      <el-row :gutter="24" type="flex" v-for="(pair, index) in mollieMetaData" :key="index" class="small-margin-bottom am-payments-meta-data">
        <el-col :span="10">
          <el-input type="text" :name="pair.name" v-model="mollieMetaData[index].key"/>
        </el-col>
        <el-col :span="10">
          <el-input type="text" v-model="mollieMetaData[index].value"/>
        </el-col>
        <el-col :span="4">
          <span @click="deleteMetaDataPair('mollie', index)">
            <img class="svg-amelia" width="16px" :src="$root.getUrl+'public/img/delete.svg'">
          </span>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col>
          <el-button type="primary" v-on:click="addMetaDataPair('mollie')">{{$root.labels.add_metaData}}</el-button>
        </el-col>
      </el-row>
    </div>

    <div v-show="data.razorpay.enabled">
      <el-row :gutter="24" class="zero-margin-bottom">
        <el-col :span="11">
          <el-form-item :label="$root.labels.name + ':'">
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <label class="el-form-item__label">
            {{$root.labels.value + ': '}}
            <el-tooltip placement="top">
              <div slot="content">{{ $root.labels.metadata_value_tooltip }}</div>
              <i class="el-icon-question am-tooltip-icon"></i>
            </el-tooltip>
          </label>
        </el-col>
      </el-row>
      <el-row :gutter="24" type="flex" v-for="(pair, index) in razorpayMetaData" :key="index" class="small-margin-bottom am-payments-meta-data">
        <el-col :span="10">
          <el-input type="text" :name="pair.name" v-model="razorpayMetaData[index].key"/>
        </el-col>
        <el-col :span="10">
          <el-input type="text" v-model="razorpayMetaData[index].value"/>
        </el-col>
        <el-col :span="4">
          <span @click="deleteMetaDataPair('razorpay', index)">
            <img class="svg-amelia" width="16px" :src="$root.getUrl+'public/img/delete.svg'">
          </span>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col>
          <el-button type="primary" v-on:click="addMetaDataPair('razorpay')">{{$root.labels.add_metaData}}</el-button>
        </el-col>
      </el-row>
    </div>

    <el-form-item :label="$root.labels.description_wc + ':'" v-show="data.wc.enabled">
      <el-row type="flex" align="middle" :gutter="24" style="margin-bottom: 10px;">
        <el-col :span="12" style="padding-bottom: 5px;">
          {{ $root.labels.message_colon }}
        </el-col>

        <el-col :span="12" class="align-right">
          <el-button-group>
            <el-button
              style="width: unset;"
              size="mini"
              :type="textMode ? 'default' : 'primary'"
              @click="!language ? textModeChanged('description_wc', 'description_wc_text', language) : textModeChanged('description_translated_wc_text', 'description_translated_wc', language)"
            >
              {{ $root.labels.text_mode }}
            </el-button>
            <el-button
              style="width: unset;"
              size="mini"
              :type="textMode ? 'primary' : 'default'"
              @click="!language ? textModeChanged('description_wc', 'description_wc_text', language) : textModeChanged('description_translated_wc', 'description_translated_wc_text', language)"
            >
              {{ $root.labels.html_mode }}
            </el-button>
          </el-button-group>
        </el-col>
      </el-row>

      <!-- Quill Editor -->
      <quill-editor
          v-if="!language && !textMode"
          v-model="description_wc"
          :options="editorOptions"
      >
      </quill-editor>
      <!-- /Quill Editor -->

      <el-input
          v-if="!language && textMode"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="description_wc_text"
          @input="changedContentText('description_wc', 'description_wc_text', language)"
      >
      </el-input>

      <!-- Quill Editor -->
      <quill-editor
          v-if="language && !textMode"
          v-model="description_translated_wc[language]"
          :options="editorOptions"
      >
      </quill-editor>
      <!-- /Quill Editor -->

      <el-input
          v-if="language && textMode"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="description_translated_wc_text[language]"
          @input="changedContentText('description_translated_wc', 'description_translated_wc_text', language)"
      >
      </el-input>
    </el-form-item>
    <el-form-item :label="$root.labels.name_razorpay + ':'" v-show="data.razorpay.enabled">
      <el-input
          type="text"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="name_razorpay"
      >
      </el-input>
    </el-form-item>
    <el-form-item :label="$root.labels.description_paypal + ':'" v-show="data.payPal.enabled">
      <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="description_paypal"
      >
      </el-input>
    </el-form-item>
    <el-form-item :label="$root.labels.description_stripe + ':'" v-show="data.stripe.enabled">
      <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="description_stripe"
      >
      </el-input>
    </el-form-item>
    <el-form-item :label="$root.labels.description_mollie + ':'" v-show="data.mollie.enabled">
      <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="description_mollie"
      >
      </el-input>
    </el-form-item>
    <el-form-item :label="$root.labels.description_razorpay + ':'" v-show="data.razorpay.enabled">
      <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="description_razorpay"
      >
      </el-input>
    </el-form-item>
    <el-form-item>
      <inline-placeholders
        :placeholdersNames="getInlinePlaceholdersNames()"
        :excludedPlaceholders="{
          appointmentPlaceholders: getExcludedAppointmentPlaceholders(),
          eventPlaceholders: [
            '%event_cancel_url%',
            '%lesson_space_url_date%',
            '%lesson_space_url_date_time%',
            '%zoom_join_url_date%',
            '%zoom_join_url_date_time%',
            '%zoom_host_url_date%',
            '%zoom_host_url_date_time%',
            '%reservation_name%',
            '%reservation_description%',
            '%group_event_details%'
          ]
        }"
        :customFields="customFields"
        :categories="categories"
        :coupons="coupons"
        userTypeTab="provider"
      >
      </inline-placeholders>
    </el-form-item>
  </div>
</template>

<script>
import InlinePlaceholders from '../notifications/common/InlinePlaceholders'
import { quillEditor } from 'vue-quill-editor'
import quillMixin from '../../../js/backend/mixins/quillMixin'

export default {
  mixins: [quillMixin],

  name: 'PaymentsMetaData',
  props: {
    customFields: {
      default: () => []
    },
    categories: {
      default: () => []
    },
    coupons: {
      default: () => []
    },
    data: Object,
    language: '',
    tab: String
  },
  data () {
    return {
      description_wc_text: '',
      description_translated_wc_text: {},
      stripeMetaData: null,
      mollieMetaData: null,
      razorpayMetaData: null
    }
  },
  created () {
    this.textMode = true

    this.description_wc_text = this.description_wc
    this.description_translated_wc_text = JSON.parse(JSON.stringify(this.description_translated_wc))

    if (this.description_wc.startsWith('<!-- Content -->')) {
      this.textMode = false
    } else if (typeof this.description_wc !== 'undefined' && this.description_wc !== null) {
      this.textMode = true

      this.description_wc = this.process(
        this.description_wc.replace('<!-- Content -->', '').replace(/(\r\n|\n|\r)/gm, '')
      )

      this.description_wc_text = this.description_wc
    }
  },
  mounted () {
    this.stripeMetaData = Object.entries(this.metaDataForStripe).map(([key, value]) => ({ key, value }))
    this.stripeMetaData.push({key: '', value: ''})

    this.mollieMetaData = Object.entries(this.metaDataForMollie).map(([key, value]) => ({ key, value }))
    this.mollieMetaData.push({key: '', value: ''})

    this.razorpayMetaData = Object.entries(this.metaDataForRazorpay).map(([key, value]) => ({ key, value }))
    this.razorpayMetaData.push({key: '', value: ''})

    if (typeof this.description_wc !== 'undefined' &&
        this.description_wc !== null &&
        !this.description_wc.startsWith('<!-- Content -->')
    ) {
      this.textMode = true

      this.description_wc = this.process(
        this.description_wc.replace('<!-- Content -->', '').replace(/(\r\n|\n|\r)/gm, '')
      )

      this.description_wc_text = this.description_wc
    } else {
      this.textMode = false
    }
  },
  computed: {
    description_wc: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.wc.checkoutData.appointment

          case ('events'):
            return this.data.wc.checkoutData.event

          case ('packages'):
            return this.data.wc.checkoutData.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.wc.checkoutData.appointment = newDescription
            break

          case ('events'):
            this.data.wc.checkoutData.event = newDescription
            break

          case ('packages'):
            this.data.wc.checkoutData.package = newDescription
            break
        }
      }
    },
    description_translated_wc: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.wc.checkoutData.translations.appointment

          case ('events'):
            return this.data.wc.checkoutData.translations.event

          case ('packages'):
            return this.data.wc.checkoutData.translations.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.wc.checkoutData.translations.appointment = newDescription
            break

          case ('events'):
            this.data.wc.checkoutData.translations.event = newDescription
            break

          case ('packages'):
            this.data.wc.checkoutData.translations.package = newDescription
            break
        }
      }
    },
    description_paypal: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.payPal.description.appointment

          case ('events'):
            return this.data.payPal.description.event

          case ('packages'):
            return this.data.payPal.description.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.payPal.description.appointment = newDescription
            break

          case ('events'):
            this.data.payPal.description.event = newDescription
            break

          case ('packages'):
            this.data.payPal.description.package = newDescription
            break
        }
      }
    },
    description_stripe: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.stripe.description.appointment

          case ('events'):
            return this.data.stripe.description.event

          case ('packages'):
            return this.data.stripe.description.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.stripe.description.appointment = newDescription
            break

          case ('events'):
            this.data.stripe.description.event = newDescription
            break

          case ('packages'):
            this.data.stripe.description.package = newDescription
            break
        }
      }
    },
    description_mollie: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.mollie.description.appointment

          case ('events'):
            return this.data.mollie.description.event

          case ('packages'):
            return this.data.mollie.description.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.mollie.description.appointment = newDescription
            break

          case ('events'):
            this.data.mollie.description.event = newDescription
            break

          case ('packages'):
            this.data.mollie.description.package = newDescription
            break
        }
      }
    },
    description_razorpay: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.razorpay.description.appointment

          case ('events'):
            return this.data.razorpay.description.event

          case ('packages'):
            return this.data.razorpay.description.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.razorpay.description.appointment = newDescription
            break

          case ('events'):
            this.data.razorpay.description.event = newDescription
            break

          case ('packages'):
            this.data.razorpay.description.package = newDescription
            break
        }
      }
    },
    name_razorpay: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.razorpay.name.appointment

          case ('events'):
            return this.data.razorpay.name.event

          case ('packages'):
            return this.data.razorpay.name.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.razorpay.name.appointment = newDescription
            break

          case ('events'):
            this.data.razorpay.name.event = newDescription
            break

          case ('packages'):
            this.data.razorpay.name.package = newDescription
            break
        }
      }
    },
    metaDataForStripe: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.stripe.metaData.appointment != null ? this.data.stripe.metaData.appointment : {}

          case ('events'):
            return this.data.stripe.metaData.event != null ? this.data.stripe.metaData.event : {}

          case ('packages'):
            return this.data.stripe.metaData.package != null ? this.data.stripe.metaData.package : {}
        }
      }
    },
    metaDataForMollie: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.mollie.metaData.appointment != null ? this.data.mollie.metaData.appointment : {}

          case ('events'):
            return this.data.mollie.metaData.event != null ? this.data.mollie.metaData.event : {}

          case ('packages'):
            return this.data.mollie.metaData.package != null ? this.data.mollie.metaData.package : {}
        }
      }
    },
    metaDataForRazorpay: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.razorpay.metaData.appointment != null ? this.data.razorpay.metaData.appointment : {}

          case ('events'):
            return this.data.razorpay.metaData.event != null ? this.data.razorpay.metaData.event : {}

          case ('packages'):
            return this.data.razorpay.metaData.package != null ? this.data.razorpay.metaData.package : {}
        }
      }
    }
  },
  methods: {
    getExcludedAppointmentPlaceholders () {
      let excludedPlaceholders = [
        '%zoom_host_url%',
        '%zoom_join_url%',
        '%lesson_space_url%',
        '%appointment_cancel_url%',
        '%reservation_name%',
        '%reservation_description%',
        '%group_appointment_details%'
      ]

      if (this.data.wc.enabled) {
        excludedPlaceholders.push('%appointment_id%')
      }

      return excludedPlaceholders
    },

    getInlinePlaceholdersNames () {
      let common = [
        'customerPlaceholders',
        'companyPlaceholders'
      ]

      switch (this.tab) {
        case ('packages'):
          return common.concat(
            [
              'packagePlaceholders'
            ]
          )

        case ('events'):
          return common.concat(
            [
              'eventPlaceholders',
              'customFieldsPlaceholders',
              'employeePlaceholders',
              'locationPlaceholders',
              'couponsPlaceholders'
            ]
          )

        case ('appointments'):
          return common.concat(
            [
              'appointmentPlaceholders',
              'customFieldsPlaceholders',
              'employeePlaceholders',
              'categoryPlaceholders',
              'locationPlaceholders',
              'couponsPlaceholders',
              'extrasPlaceholders'
            ]
          )
      }

      return common
    },
    addMetaDataPair (method) {
      this[method + 'MetaData'].push({key: '', value: ''})
    },
    deleteMetaDataPair (method, index) {
      this[method + 'MetaData'].splice(index, 1)
    }
  },
  components: {InlinePlaceholders, quillEditor}
}
</script>
