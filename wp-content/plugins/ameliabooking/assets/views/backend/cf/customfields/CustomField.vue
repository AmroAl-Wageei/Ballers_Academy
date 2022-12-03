<template>
  <div class="am-custom-field">

    <!-- Field Header -->
    <h3>

      <!-- Reorder Button -->
      <span class="am-drag-handle">
        <img class="svg-amelia" width="20px" :src="$root.getUrl + 'public/img/burger-menu.svg'"/>
      </span>

      <!-- Title -->
      <span class="am-custom-field-title">{{ $root.labels[customField.type] }}</span>

      <!-- Actions -->
      <span class="am-custom-field-actions">
        <!-- Translate -->
        <div class="am-custom-field-translate" @click="showDialogTranslate()">
          <img class="am-dialog-translate-svg" width="16px" :src="$root.getUrl+'public/img/translate-grey.svg'">
          {{ $root.labels.translate }}
        </div>

        <!-- Delete -->
        <span @click="deleteCustomField">
          <img class="svg-amelia" width="16px" :src="$root.getUrl + 'public/img/delete.svg'"/>
        </span>

      </span>

    </h3>

    <!-- Label, Services & Required -->
    <el-row :gutter="16">

      <!-- Label -->
      <el-col :sm="7">
        <p class="am-label">{{ $root.labels.label }}:</p>
        <el-input
            placeholder=""
            v-model="customField.label"
            @input="changeCustomFieldLabel"
            :type="customField.type === 'content' ? 'textarea' : 'text'"
        >
          <img v-if="loading" slot="suffix" :src="$root.getUrl+'public/img/oval-spinner.svg'" class="is-spinner"/>
        </el-input>
      </el-col>

      <!-- Services & Required -->
      <el-col :sm="17">
        <el-col :sm="events.length ? 9 : 19" v-if="categories.length">
          <!-- Services -->
          <div>

            <!-- Services Label -->
            <p class="am-label">{{ $root.labels.services }}:</p>

            <!-- Services Select -->
            <el-select
              v-model="customField.services"
              multiple
              :placeholder="$root.labels.services"
              value-key="id"
              collapse-tags
              @change="updateServiceCustomField"
            >
              <div class="am-drop-parent" :class="{'am-custom-field-all-selected': customField.allServices}" @click="selectAllServices()">
                <span>{{ $root.labels.all_services }}</span>
              </div>
              <div v-for="category in categories" :key="category.id">
                <div class="am-drop-parent" @click="selectAllServicesInCategory(category.id)">
                  <span>{{ category.name }}</span>
                </div>
                <el-option
                  v-for="service in category.serviceList"
                  :key="service.id"
                  :label="service.name"
                  :value="service"
                  class="am-drop-child"
                >
                </el-option>
              </div>
            </el-select>

          </div>
        </el-col>

        <el-col :sm="categories.length ? 9 : 19" v-if="events.length">
          <div>

            <!-- Events Label -->
            <p class="am-label">{{ $root.labels.events }}:</p>

            <!-- Events Select -->
            <el-select
              v-model="customField.events"
              multiple
              :placeholder="$root.labels.events"
              value-key="id"
              collapse-tags
              @change="updateEventCustomField"
            >
              <div class="am-drop-parent" :class="{'am-custom-field-all-selected': customField.allEvents}" @click="selectAllEvents()">
                <span>{{ $root.labels.all_events }}</span>
              </div>
              <el-option
                v-for="event in events"
                :key="event.id"
                :label="event.name"
                :value="event"
                class="am-drop-child"
              >
              </el-option>
            </el-select>

          </div>
        </el-col>

        <el-col :sm="5">
          <!-- Required -->
          <div v-if="customField.type !== 'content'" class="am-customize-required">
            <!-- Events Label -->
            <p class="am-label" style="visibility: hidden;">{{ $root.labels.events }}:</p>

            <el-checkbox
              v-model="customField.required"
              @change="updateCustomField(false)"
              :label="$root.labels.required"
              border
            >
            </el-checkbox>
          </div>
        </el-col>
      </el-col>

    </el-row>

    <!-- Options -->
    <el-row :gutter="24" v-if="showOptions === true">
      <el-col :sm="16">
        <div class="am-custom-field-options">

          <!-- Options Label -->
          <p class="am-label">{{ $root.labels.options }}:</p>

          <!-- Option -->
          <draggable v-model="customField.options" :options="draggableOptions" @end="dropCustomFieldOption">
            <div
                class="am-custom-field-option"
                :class="optionClass"
                v-for="(option, index) in customField.options"
            >

              <!-- Option Reorder Button -->
              <span class="am-drag-handle">
                <img class="svg-amelia" width="20px" :src="$root.getUrl + 'public/img/burger-menu.svg'"/>
              </span>

              <!-- Option Label -->
              <span class="am-option-label">
                <el-input
                    placeholder=""
                    v-model="option.label"
                    :disabled="option.new"
                    @input="changeCustomFieldOptionLabel(option)"
                >
                  <img
                      v-if="loadingOption && index === activeOptionIndex"
                      slot="suffix" :src="$root.getUrl+'public/img/oval-spinner.svg'"
                      class="is-spinner"
                  />
                </el-input>
              </span>

              <!-- Actions -->
              <span class="am-custom-field-actions">

                <!-- Delete -->
                <span @click="deleteCustomFieldOption(option)">
                  <img class="svg-amelia" width="16px" :src="$root.getUrl+'public/img/delete.svg'"/>
                </span>

              </span>

            </div>
          </draggable>

          <!-- Add Option -->
          <el-button plain @click="addCustomFieldOption(customField)" :disabled="loading || loadingOption">
            {{ $root.labels.add_option }}
          </el-button>

        </div>
      </el-col>
    </el-row>

    <!-- Dialog Translate -->
    <transition name="slide">
      <el-dialog
        :close-on-click-modal="false"
        class="am-side-dialog am-dialog-translate am-edit"
        :show-close="true"
        :visible.sync="dialogTranslate"
        v-if="dialogTranslate"
      >
        <dialog-translate
          :passed-translations="customField.translations"
          :name="customField.label"
          :allLanguagesData="languagesData"
          :used-languages="usedLanguages"
          type="name"
          tab="cf"
          :cf-options="JSON.parse(JSON.stringify(customField.options))"
          @saveDialogTranslate="saveDialogTranslate"
          @closeDialogTranslate="dialogTranslate = false"
        >
        </dialog-translate>
      </el-dialog>
    </transition>

  </div>
</template>

<script>
  import Draggable from 'vuedraggable'
  import imageMixin from '../../../../js/common/mixins/imageMixin'
  import DialogTranslate from '../../parts/DialogTranslate'
  import notifyMixin from '../../../../js/backend/mixins/notifyMixin'
  import stashMixin from '../../../../js/backend/mixins/stashMixin'

  export default {
    mixins: [imageMixin, notifyMixin, stashMixin],

    props: {
      customField: {
        default: {},
        type: Object
      },
      events: {
        default: () => []
      },
      categories: {
        default: () => []
      },
      services: {
        default: () => []
      },
      languagesData: {
        default: () => []
      },
      passedUsedLanguages: {
        default: () => []
      }
    },

    data () {
      return {
        activeOptionIndex: null,
        draggableOptions: {
          handle: '.am-drag-handle',
          animation: 150
        },
        loading: false,
        loadingOption: false,
        timer: null,
        dialogTranslate: false,
        usedLanguages: null
      }
    },

    mounted () {
      if (this.customField.allServices) {
        this.customField.services = this.services
      }
      if (this.customField.allEvents) {
        this.customField.events = this.events
      }
      this.customField.options.forEach(option => {
        this.$set(option, 'edited', false)
        this.$set(option, 'deleted', false)
        this.$set(option, 'new', false)
      })
      this.usedLanguages = this.passedUsedLanguages
    },

    methods: {
      updateServiceCustomField () {
        this.customField.allServices = false
        this.updateCustomField()
      },

      updateEventCustomField () {
        this.customField.allEvents = false
        this.updateCustomField()
      },

      deleteCustomField () {
        this.$emit('deleteCustomField', this.customField)
      },

      addCustomFieldOption (customField) {
        customField.options.push({
          customFieldId: customField.id,
          deleted: false,
          edited: false,
          label: '',
          new: true,
          position: customField.options.length + 1
        })

        setTimeout(() => {
          this.inlineSVG()
        }, 100)

        this.activeOptionIndex = customField.options.length - 1
        this.updateCustomField(true)
      },

      updateCustomField (loadingOption = false) {
        if (this.loading === false && this.loadingOption === false) {
          this.loading = loadingOption === false
          this.loadingOption = loadingOption === true

          this.$http.post(`${this.$root.getAjaxUrl}/fields/` + this.customField.id, this.customField)
            .then(response => {
              this.loading = false
              this.loadingOption = false
              this.activeOptionIndex = null
              this.notify(this.$root.labels.success, this.$root.labels.custom_field_saved, 'success')
              this.updateStashEntities({})

              this.$emit('updateCustomField', response.data.data.customField)
            })
            .catch(e => {
              console.log(e.message)
              this.loading = false
              this.loadingOption = false
            })
        }
      },

      changeCustomFieldLabel () {
        clearTimeout(this.timer)
        this.timer = setTimeout(this.updateCustomField, 500)
      },

      deleteCustomFieldOption (option) {
        this.activeOptionIndex = this.customField.options.indexOf(option)
        option.deleted = true
        this.updateCustomFieldOptionsPositions()
        this.updateCustomField(true)
      },

      changeCustomFieldOptionLabel (option) {
        this.activeOptionIndex = this.customField.options.indexOf(option)
        option.edited = true
        clearTimeout(this.timer)
        this.timer = setTimeout(this.updateCustomField, 500, true)
      },

      dropCustomFieldOption (e) {
        if (e.newIndex !== e.oldIndex) {
          this.updateCustomFieldOptionsPositions()
          this.activeOptionIndex = e.newIndex
          this.updateCustomField(true)
        }
      },

      updateCustomFieldOptionsPositions () {
        let $this = this
        this.customField.options.filter(option => option.deleted !== true).forEach((option, index) => {
          $this.$set(option, 'edited', true)
          $this.$set(option, 'position', index + 1)
        })
      },

      selectAllServices () {
        if (this.customField.services.length !== this.services.length) {
          this.customField.services = this.services
          this.customField.allServices = true
        } else {
          this.customField.services = []
          this.customField.allServices = false
        }

        this.updateCustomField()
      },

      selectAllEvents () {
        if (this.customField.events.length !== this.events.length) {
          this.customField.events = this.events
          this.customField.allEvents = true
        } else {
          this.customField.events = []
          this.customField.allEvents = false
        }

        this.updateCustomField()
      },

      selectAllServicesInCategory (id) {
        let services = this.categories.find(category => category.id === id).serviceList

        // Deselect all services if they are already selected
        if (_.isEqual(_.intersection(services.map(service => service.id), this.customField.services.map(service => service.id)), services.map(service => service.id))) {
          this.customField.services = this.services.filter(
            service => _.difference(this.customField.services.map(service => service.id), services.map(service => service.id)).indexOf(service.id) !== -1
          )
        } else {
          this.customField.services = _.uniq(this.customField.services.concat(services))
        }

        this.updateCustomField()
      },

      showDialogTranslate () {
        this.dialogTranslate = true
      },

      saveDialogTranslate (translations, newLanguages, tab, options) {
        this.customField.translations = translations
        this.customField.options = options
        this.dialogTranslate = false
        this.updateCustomField()
        this.notify(this.$root.labels.success, this.$root.labels.custom_field_saved, 'success')

        if (newLanguages.length) {
          this.usedLanguages = this.usedLanguages.concat(newLanguages)
          this.$emit('usedLanguagesUpdated', this.usedLanguages)

          this.$http.post(`${this.$root.getAjaxUrl}/settings`, {usedLanguages: this.usedLanguages})
            .catch((e) => {
              console.log(e)
            })
        }
      }
    },

    computed: {
      showOptions () {
        return ['select', 'checkbox', 'radio'].indexOf(this.customField.type) !== -1
      },

      optionClass () {
        return ['checkbox', 'radio'].indexOf(this.customField.type) !== -1 ? 'am-' + this.customField.type + '-input' : ''
      }
    },

    watch: {
      'passedUsedLanguages' () {
        this.usedLanguages = this.passedUsedLanguages
      }
    },

    components: {
      Draggable,
      DialogTranslate
    }
  }
</script>
