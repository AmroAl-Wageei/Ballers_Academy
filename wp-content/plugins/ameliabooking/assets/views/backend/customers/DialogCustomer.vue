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
    <div class="am-dialog-scrollable" :class="{'am-edit':customer.id !== 0}" v-if="!dialogLoading">

      <!-- Dialog Header -->
      <div class="am-dialog-header">
        <el-row>
          <el-col :span="18">
            <h2 v-if="customer.id !== 0">{{ $root.labels.edit_customer }}</h2>
            <h2 v-else>{{ $root.labels.new_customer }}</h2>
          </el-col>
          <el-col :span="6" class="align-right">
            <span></span>
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Form -->
      <el-form :model="customer" ref="customer" :rules="rules" label-position="top" @submit.prevent="onSubmit">

        <!-- First Name -->
        <el-form-item :label="$root.labels.first_name+ ':'" prop="firstName">
          <el-input v-model="customer.firstName" auto-complete="off" @input="clearValidation()" @change="trimProperty(customer, 'firstName')"></el-input>
        </el-form-item>

        <!-- Last Name -->
        <el-form-item :label="$root.labels.last_name + ':'" prop="lastName">
          <el-input v-model="customer.lastName" auto-complete="off" @input="clearValidation()" @change="trimProperty(customer, 'lastName')"></el-input>
        </el-form-item>

        <!-- Email -->
        <el-form-item :label="$root.labels.email + ':'" prop="email" :error="errors.email">
          <el-input
              v-model="customer.email"
              auto-complete="off"
              :placeholder="$root.labels.email_placeholder"
              @input="clearValidation()"
          >
          </el-input>
        </el-form-item>

        <!-- WP User -->
        <el-form-item label="placeholder">
          <label slot="label">
            {{ $root.labels.wp_user }}:
            <el-tooltip placement="top">
              <div slot="content" v-html="$root.labels.wp_user_customer_tooltip"></div>
              <i class="el-icon-question am-tooltip-icon"></i>
            </el-tooltip>
          </label>
          <el-select
              v-model="customer.externalId"
              ref="wpUser"
              filterable
              clearable
              :placeholder="$root.labels.select_wp_user"
              @change="clearValidation()"
          >
            <div class="am-drop">
              <div class="am-drop-create-item" @click="selectCreateNewWPUser" v-if="(customer && customer.email)">
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

        <!-- Phone -->
        <el-form-item :label="$root.labels.phone + ':'">
          <phone-input
              :countryPhoneIso="customer.countryPhoneIso"
              :savedPhone="customer.phone"
              @phoneFormatted="phoneFormatted"
          >
          </phone-input>
        </el-form-item>

        <!-- Gender -->
        <el-form-item :label="$root.labels.gender + ':'">
          <el-select
              v-model="customer.gender"
              placeholder=""
              clearable
              @change="clearValidation()"
          >
            <el-option
                v-for="item in formOptions.genders"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <!-- Date of Birth -->
        <el-form-item :label="$root.labels.date_of_birth + ':'">
          <v-date-picker
            v-model="customer.birthday"
            @input="clearValidation()"
            mode='single'
            popover-visibility="focus"
            popover-direction="top"
            tint-color='#1A84EE'
            :show-day-popover=false
            :input-props='{
              class: "el-input__inner",
              placeholder: $root.labels.select_date_of_birth
             }'
            :is-expanded=false
            :formats="vCalendarFormats"
          >
          </v-date-picker>
        </el-form-item>

        <div class="am-divider"></div>

        <!-- Note -->
        <el-form-item :label="$root.labels.note_internal + ':'">
          <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6}"
              placeholder=""
              v-model="customer.note"
              @input="clearValidation()"
          >
          </el-input>
        </el-form-item>
      </el-form>
    </div>

    <!-- Dialog Actions -->
    <dialog-actions
        v-if="!dialogLoading"
        formName="customer"
        urlName="users/customers"
        :isNew="customer.id === 0"
        :entity="customer"
        :getParsedEntity="getParsedEntity"
        @errorCallback="errorCallback"
        :hasIcons="true"

        :status="{
          on: 'visible',
          off: 'hidden'
        }"

        :buttonText="{
          confirm: {
            status: {
              yes: customer.status === 'visible' ? $root.labels.visibility_hide : $root.labels.visibility_show,
              no: $root.labels.no
            }
          }
        }"

        :action="{
          haveAdd: true,
          haveEdit: true,
          haveStatus: false,
          haveRemove: $root.settings.capabilities.canDelete === true,
          haveRemoveEffect: true,
          haveDuplicate: false
        }"

        :message="{
          success: {
            save: $root.labels.customer_saved,
            remove: $root.labels.customer_deleted,
            show: '',
            hide: ''
          },
          confirm: {
            remove: $root.labels.confirm_delete_customer,
            show: '',
            hide: '',
            duplicate: ''
          }
        }"
    >
    </dialog-actions>

  </div>
</template>

<script>
  import DialogActions from '../parts/DialogActions.vue'
  import PhoneInput from '../../parts/PhoneInput.vue'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import helperMixin from '../../../js/backend/mixins/helperMixin'

  export default {
    mixins: [imageMixin, dateMixin, notifyMixin, helperMixin],

    props: {
      customer: null
    },

    data () {
      return {
        dialogLoading: true,
        errors: {
          email: ''
        },
        formOptions: {
          wpUsers: [],
          genders: [
            {
              value: 'female',
              label: this.$root.labels.female
            },
            {
              value: 'male',
              label: this.$root.labels.male
            }
          ]
        },
        rules: {
          firstName: [
            {required: true, message: this.$root.labels.enter_first_name_warning, trigger: 'submit'}
          ],
          lastName: [
            {required: true, message: this.$root.labels.enter_last_name_warning, trigger: 'submit'}
          ],
          email: [
            {required: false, message: this.$root.labels.enter_email_warning, trigger: 'submit'},
            {type: 'email', message: this.$root.labels.enter_valid_email_warning, trigger: 'submit'}
          ]
        }
      }
    },

    created () {
      if (this.customer.id !== 0) {
        this.customer.birthday = this.$moment(this.customer.birthday).toDate()
        this.getWPUsers(this.customer.externalId)
      } else {
        this.getWPUsers(0)
      }
    },

    mounted () {
      this.inlineSVG()
    },

    methods: {
      errorCallback (responseData) {
        let $this = this

        $this.errors.email = ''

        setTimeout(function () {
          $this.errors.email = responseData
        }, 200)
      },

      getParsedEntity () {
        let customer = JSON.parse(JSON.stringify(this.customer))

        if (customer.birthday) {
          customer.birthday = this.getDatabaseFormattedDate(this.$moment(customer.birthday).format('YYYY-MM-DD'))
        }

        if (customer.externalId !== 0 && !customer.externalId) {
          customer.externalId = -1
        }

        return customer
      },

      closeDialog () {
        this.$emit('closeDialog')
      },

      getWPUsers (currentId) {
        this.$http.get(`${this.$root.getAjaxUrl}/users/wp-users`, {
          params: {
            id: currentId,
            role: 'customer'
          }
        }).then(response => {
          this.formOptions.wpUsers = response.data.data.users
          this.formOptions.wpUsers.unshift({'value': 0, 'label': this.$root.labels.create_new})

          if (this.formOptions.wpUsers.map(user => user.value).indexOf(this.customer.externalId) === -1) {
            this.customer.externalId = ''
          }

          this.dialogLoading = false
        })
      },

      phoneFormatted (phone, countryPhoneIso) {
        this.clearValidation()
        this.customer.phone = phone
        this.customer.countryPhoneIso = countryPhoneIso && countryPhoneIso !== 'auto' ? countryPhoneIso : null
      },

      clearValidation () {
        if (typeof this.$refs.customer !== 'undefined') {
          this.$refs.customer.clearValidate()
        }
      },

      selectCreateNewWPUser () {
        this.customer.externalId = 0
        this.$refs.wpUser.blur()
      }
    },

    components: {
      PhoneInput,
      DialogActions
    }

  }
</script>
