<template>
  <div class="am-wrap">
    <div id="am-locations" class="am-body">

      <!-- Page Header -->
      <page-header :locationsTotal="count" @newLocationBtnClicked="showDialogNewLocation()"></page-header>

      <!-- Spinner -->
      <div class="am-spinner am-section" v-show="!fetched || !options.fetched">
        <img :src="$root.getUrl + 'public/img/spinner.svg'"/>
      </div>

      <!-- Empty State -->
      <div class="am-empty-state am-section"
           v-if="fetched && locations.length === 0 && !filterApplied && fetchedFiltered">
        <img :src="$root.getUrl + 'public/img/emptystate.svg'">
        <h2>{{ $root.labels.no_locations_yet }}</h2>
        <p>{{ $root.labels.click_add_locations }}</p>
      </div>

      <!-- Locations -->
      <div
          v-show="fetched && options.fetched && (locations.length !== 0 || locations.length === 0 && filterApplied || !fetchedFiltered)"
          class="">
        <BlockLite/>

        <!-- Filter -->
        <div class="am-locations-filter am-section">
          <el-form class="demo-form-inline">
            <el-row :gutter="16">

              <!-- Global Search -->
              <el-col :sm="8">
                <el-form-item>
                  <el-popover :disabled="!$root.isLite" ref="filterSearchPop" v-bind="$root.popLiteProps"><PopLite/></el-popover>
                  <div class="am-search" v-popover:filterSearchPop>
                    <el-input class="calc-width"
                              :placeholder="searchPlaceholder"
                              v-model="params.search"
                              :disabled="$root.isLite"
                    >
                    </el-input>
                    <el-button class="button-filter-toggle am-button-icon" title="Toggle Filters"
                               @click="filterFields = !filterFields" :disabled="$root.isLite">
                      <img class="svg-amelia" alt="Toggle Filters"
                           :src="$root.getUrl+'public/img/filter.svg'"/>
                    </el-button>
                  </div>
                </el-form-item>
              </el-col>

              <!-- Services -->
              <transition name="fade">
                <div v-show="filterFields">
                  <el-col :sm="8">
                    <el-form-item>
                      <el-popover :disabled="!$root.isLite" ref="filterServicePop" v-bind="$root.popLiteProps"><PopLite/></el-popover>
                      <el-select v-model="params.services"
                                 multiple
                                 filterable
                                 :placeholder="$root.labels.services"
                                 @change="changeFilter"
                                 collapse-tags
                                 v-popover:filterServicePop
                                 :disabled="$root.isLite"
                      >
                        <div v-for="category in options.categorized"
                             :key="category.id">
                          <div class="am-drop-parent"
                               @click="selectAllInCategory(category.id)"
                          >
                            <span>{{ category.name }}</span>
                          </div>
                          <el-option
                              v-for="service in category.serviceList"
                              :key="service.value"
                              :label="service.name"
                              :value="service.id"
                              class="am-drop-child"
                          >
                          </el-option>
                        </div>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </div>
              </transition>

              <!-- Sort -->
              <transition name="fade">
                <div v-show="filterFields">
                  <el-col :sm="8">
                    <el-form-item>
                      <el-popover :disabled="!$root.isLite" ref="filterSortPop" v-bind="$root.popLiteProps"><PopLite/></el-popover>
                      <el-select v-model="params.sort"
                                 :placeholder="$root.labels.sort"
                                 class="calc-width sort"
                                 @change="filterData"
                                 v-popover:filterSortPop
                                 :disabled="$root.isLite"
                      >

                        <el-option
                            v-for="option in options.sort"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </div>
              </transition>

            </el-row>
          </el-form>
        </div>

        <!-- No Results -->
        <div class="am-empty-state am-section"
             v-show="fetched && locations.length === 0 && filterApplied && fetchedFiltered">
          <img :src="$root.getUrl + 'public/img/emptystate.svg'">
          <h2>{{ $root.labels.no_results }}</h2>
        </div>

        <!-- Content -->
        <div class="am-locations am-section" v-show="fetchedFiltered">
          <el-row :gutter="16">
            <template v-for="(location, index) in locations">
              <el-col :lg="8" :md="24" v-if="location.status === 'visible' || location.status === 'hidden'">
                <transition name="fade">
                  <div
                      :class="{'am-location-card am-hidden-entity' : location.status === 'hidden', 'am-location-card' : location.status === 'visible'}">
                    <div class="am-map-preview">
                      <img v-if="$root.settings.general.gMapApiKey"
                           :src="'https://maps.googleapis.com/maps/api/staticmap?size=1280x200&zoom=15&center=' + location.latitude + ',' + location.longitude + '&markers=icon:'+ location.pin + '%7C' + location.latitude + ',' + location.longitude + '&key=' + $root.settings.general.gMapApiKey"
                      >
                    </div>
                    <div class="am-location-info">
                      <img class="location-photo" :src="pictureLoad(location, false)"
                           @error="imageLoadError(location, false)"/>
                      <div class="location-data">
                        <h4>
                          {{ location.name }}
                          <span class="am-location-data-id"> ({{ $root.labels.id }}: {{ location.id }})</span>
                        </h4>
                        <el-tooltip
                            class="item"
                            effect="dark"
                            :content=location.address
                            placement="top"
                        >
                          <p class="address">
                            <span class="svg-icon">
                              <img class="svg-amelia" alt="Location Pin"
                                   :src="$root.getUrl+'public/img/location.svg'"/>
                            </span>
                            {{ location.address }}
                          </p>
                        </el-tooltip>
                        <p>{{ location.phone }}</p>
                      </div>

                      <el-button @click="showDialogEditLocation(index)">{{ $root.labels.edit }}</el-button>

                    </div>
                  </div>
                </transition>
              </el-col>
            </template>
          </el-row>
        </div>

        <!-- Pagination -->
        <pagination-block
            :params="params"
            :count="options.countFiltered"
            :label="$root.labels.locations_lower"
            :visible="fetched && locations.length !== 0 && fetchedFiltered"
            @change="filterData"
        >
        </pagination-block>

        <!-- Content Spinner -->
        <div class="am-spinner am-section" v-show="fetched && !fetchedFiltered">
          <img :src="$root.getUrl + 'public/img/spinner.svg'"/>
        </div>

      </div>

      <!-- Button New -->
      <div v-if="$root.settings.capabilities.canWrite === true"
           id="am-button-new"
           class="am-button-new"
           v-popover:addLocationPlusPop
      >
        <el-popover :disabled="!($root.isLite)" ref="addLocationPlusPop" v-bind="$root.popLiteProps"><PopLite/></el-popover>
        <el-button id="am-plus-symbol"
                   type="primary"
                   icon="el-icon-plus"
                   @click="showDialogNewLocation()"
                   :class="{'am-lite-disabled': ($root.isLite)}"
                   :disabled="$root.isLite"
        ></el-button>
      </div>

      <!-- Dialog New Location -->
      <transition name="slide">
        <el-dialog
            :close-on-click-modal="false"
            class="am-side-dialog am-dialog-location"
            :visible.sync="dialogLocation"
            :show-close="false" v-if="dialogLocation">
          <dialog-location
              :location="location"
              @saveCallback="filterData"
              @duplicateCallback="duplicateLocationCallback"
              @closeDialog="dialogLocation = false"
              @showDialogTranslate="showDialogTranslate"
          >
          </dialog-location>
        </el-dialog>
      </transition>


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
              :passed-translations="location.translations"
              :name="location.name"
              :used-languages="options.entities.settings.general.usedLanguages"
              :all-languages-data="languagesData"
              :type="dialogTranslateType"
              tab="location"
              :has-quill="false"
              @saveDialogTranslate="saveDialogTranslate"
              @closeDialogTranslate="dialogTranslate = false"
          >
          </dialog-translate>
        </el-dialog>
      </transition>

      <DialogLite/>

      <!-- Help Button -->
      <el-col :md="6" class="">
        <a class="am-help-button" href="https://wpamelia.com/locations/" target="_blank">
          <i class="el-icon-question"></i> {{ $root.labels.need_help }}?
        </a>
      </el-col>

      <!-- <dialog-new-customize></dialog-new-customize> -->

    </div>
  </div>
</template>

<script>
  import DialogLocation from './DialogLocation.vue'
  import PageHeader from '../parts/PageHeader.vue'
  import PaginationBlock from '../parts/PaginationBlock.vue'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import DialogTranslate from '../parts/DialogTranslate'
  import entitiesMixin from '../../../js/common/mixins/entitiesMixin'
  // import DialogNewCustomize from '../parts/DialogNewCustomize.vue'

export default {

    mixins: [imageMixin, entitiesMixin],

    data () {
      return {
        fetchedFiltered: false,
        count: 0,
        dialogLocation: false,
        location: null,
        fetched: false,
        filterFields: true,
        locations: [],
        options: {
          categorized: [],
          countFiltered: 0,
          fetched: false,
          sort: [
            {
              value: 'name',
              label: this.$root.labels.name_ascending
            },
            {
              value: '-name',
              label: this.$root.labels.name_descending
            }
          ],
          entities: {
            settings: {
              general: {
                usedLanguages: []
              }
            }
          }
        },
        params: {
          page: 1,
          sort: 'name',
          search: '',
          services: []
        },
        searchPlaceholder: this.$root.labels.locations_search_placeholder,
        timer: null,
        dialogTranslate: false,
        dialogTranslateType: 'name',
        languagesData: []
      }
    },

    created: function () {
      this.fetched = true
      this.fetchedFiltered = true
      this.options.fetched = true
      this.options.countFiltered = 0
      this.count = 0
      this.locations = []
    },

    mounted () {
      this.inlineSVG()
    },

    updated () {

    },

    methods: {
      showDialogTranslate (type) {
        this.dialogTranslateType = type
        this.dialogTranslate = true
      },

      saveDialogTranslate (translations, newLanguages) {
        this.options.entities.settings.general.usedLanguages = this.options.entities.settings.general.usedLanguages.concat(newLanguages)
        this.location.translations = translations
        this.dialogTranslate = false
      },

      fetchData: function () {},

      filterData: function () {},

      getLocations: function () {},

      getLocationsOptions: function () {},

      changeFilter: function () {},

      handleResize () {
        this.filterFields = window.innerWidth >= 768
      },

      showDialogNewLocation: function () {},

      showDialogEditLocation: function () {},

      duplicateLocationCallback: function () {},

      selectAllInCategory: function () {},

      getInitLocationObject () {
        return {
          id: 0,
          status: 'visible',
          name: '',
          description: '',
          address: '',
          phone: '',
          latitude: 40.7484405,
          longitude: -73.9878531,
          pictureFullPath: '',
          pictureThumbPath: '',
          pin: ''
        }
      }

    },

    computed: {

      filterApplied: function () {
        return true
      }

    },

    watch: {
      'params.search' () {
        if (typeof this.params.search !== 'undefined') {
          this.fetchedFiltered = false
          clearTimeout(this.timer)
          this.timer = setTimeout(this.filterData, 500)
        }
      }
    },

    components: {
      PageHeader,
      DialogLocation,
      PaginationBlock,
      DialogTranslate,
      // DialogNewCustomize
    }

  }
</script>

