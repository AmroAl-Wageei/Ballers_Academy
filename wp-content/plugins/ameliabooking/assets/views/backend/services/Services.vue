<template>
  <div class="am-wrap">
    <div id="am-services" class="am-body">

      <!-- Page Header -->
      <page-header
          :bookableType="typeTab"
          :servicesTotal="countTotal"
          :categoriesTotal="categories.length"
          :packagesTotal="!showPurchasedPackages ? packages.length : -1"
          @newServiceBtnClicked="showDialogNewService()"
          @newPackageBtnClicked="showDialogNewPackage()"
          @newPackageBookingBtnClicked="showDialogNewPackageBooking()"
      >
      </page-header>

      <div class="am-section" v-if="!showPurchasedPackages">
      <el-tabs v-model="typeTab" v-if="$root.licence.isPro || $root.licence.isDeveloper">
        <el-tab-pane :label="$root.labels.services" name="services" :key="0"></el-tab-pane>
        <el-tab-pane :label="$root.labels.packages" name="packages" :key="1"></el-tab-pane>
      </el-tabs>
      <!-- Services & Categories -->
      <div class="am-services-categories" v-show="typeTab === 'services' || (!$root.licence.isPro && !$root.licence.isDeveloper)" :key="0">
        <!-- Spinner -->
        <div class="am-spinner am-section" v-show="!fetched">
          <img :src="$root.getUrl+'public/img/spinner.svg'"/>
        </div>

        <el-row v-if="fetched" class="am-flexed am-side-bar-category">
          <el-col :md="8" class="">
            <div class="am-categories-column am-section">
              <h2>{{ $root.labels.categories }}</h2>

              <!-- All Services Filter -->
              <div
                  class="am-category-item"
                  :class="{ active: Object.keys(activeCategory).length === 0 }"
                  @click="filterServices({})"
              >
                <h3>
                  <span class="am-category-title">
                    {{ $root.labels.all_services }}
                  </span>
                </h3>
              </div>

              <!-- Categories -->
              <draggable v-model="categories" :options="draggableOptions" @end="dropCategory">
                <transition-group name="list-complete">
                  <div
                      class="am-category-item"
                      :class="{ active: activeCategory.id === category.id }"
                      v-for="category in categories"
                      :key="category.id"
                      @click="filterServices(category)"
                  >

                    <!-- Reorder & Title -->
                    <h3 class="am-three-dots">

                      <!-- Reorder Button -->
                      <span class="am-drag-handle">
                        <img class="svg-amelia" width="20px" :src="$root.getUrl + 'public/img/burger-menu.svg'">
                      </span>

                      <!-- Title Input -->
                      <input
                          ref="input"
                          class="am-category-title"
                          :class="{ hidden: editedCategoryId !== category.id }"
                          v-model="editedCategoryName"
                          @keyup.enter="editCategoryName(category, $event)"
                          :style="{ border: this.editedCategoryName === '' ? '3px solid red' : '' }"
                      />

                      <!-- Title Text -->
                      <span class="am-category-title"
                            :class="{ hidden: editedCategoryId === category.id }"
                            v-model="category.name"
                      >
                        {{ category.name }}
                        <span class="am-category-title-id"> ({{ $root.labels.id }}: {{ category.id }})</span>
                      </span>
                    </h3>

                    <div class="am-category-item-footer">
                      <el-row type="flex" style="flex-wrap:wrap" align="middle">

                        <!-- Number of Services -->
                        <el-col :md="12" :sm="12">
                          <span class="service-count"> {{ category.serviceList.length }} {{ category.serviceList.length === 1 ? $root.labels.service : $root.labels.services }}</span>
                        </el-col>

                        <!-- Category Actions -->
                        <el-col :md="12" :sm="12" class="align-right category-actions">

                            <!-- Translate Category Name -->
                            <span
                              :class="{active: editedCategoryId === category.id }"
                              @click="showDialogTranslateCategory(category)"
                            >
                              <img class="svg-amelia edit gray" width="16px" :src="$root.getUrl+'public/img/translate.svg'">
                            </span>

                            <!-- Edit Category Name -->
                            <span
                                :class="{active: editedCategoryId === category.id }"
                                @click="editCategoryName(category, $event)"
                            >
                              <img class="svg-amelia edit" width="16px" :src="$root.getUrl+'public/img/edit.svg'">
                              <i class="el-icon-success done"></i>
                            </span>

                            <!-- Duplicate Category -->
                            <span @click="duplicateCategory(category)">
                              <img class="svg-amelia" width="16px" :src="$root.getUrl+'public/img/copy.svg'">
                            </span>

                            <!-- Delete Category -->
                            <span
                                v-if="$root.settings.capabilities.canDelete === true"
                                @click="handleCategoryDeleteConfirmation(category)"
                            >
                              <img class="svg-amelia" width="16px" :src="$root.getUrl+'public/img/delete.svg'">
                            </span>

                        </el-col>
                      </el-row>

                      <!-- Delete Confirmation -->
                      <el-collapse-transition>
                        <div class="am-confirmation" v-show="deleteConfirmation && categoryToDeleteId === category.id">
                          <p>{{ $root.labels.delete_category_confirmation }}?</p>
                          <el-alert
                              title=""
                              type="warning"
                              description=""
                              :closable="false"
                          >
                          </el-alert>
                          <div class="align-right">
                            <el-button size="small" @click="hideDeleteCategoryDialog()">
                              {{ $root.labels.cancel }}
                            </el-button>
                            <el-button size="small" @click="deleteCategory(category)" type="primary"
                                       :loading="loadingDeleteCategory">
                              {{ $root.labels.delete }}
                            </el-button>
                          </div>
                        </div>
                      </el-collapse-transition>

                    </div>

                  </div>
                </transition-group>
              </draggable>

              <!-- Add Category Button -->
              <el-button @click="addCategory" size="large" type="primary" class="am-dialog-create"
                         :loading="loadingAddCategory">
                <i class="el-icon-plus"></i> <span class="button-text">{{ $root.labels.add_category }}</span>
              </el-button>

            </div>
          </el-col>

          <el-col :md="16">
            <div class="am-services-column am-section">
              <el-row :gutter="16">
                <el-col :md="12">
                  <h2 v-show="Object.keys(activeCategory).length === 0">
                    {{$root.labels.all_services }}
                  </h2>
                  <h2 v-show="Object.keys(activeCategory).length !== 0">
                    {{ activeCategory.name }}

                  </h2>
                </el-col>
                <el-col :md="12" class="am-align-right">
                  <span class="am-sort-services-label">{{$root.labels.services_sorting}}</span>
                  <el-select v-model="sortingServices" clearable placeholder="Sort Services" class="am-sort-services" @change="changeServiceSorting">
                    <el-option
                        v-for="sortSelection in sortingSelection"
                        :key="sortSelection.sortValue"
                        :label="sortSelection.sortName"
                        :value="sortSelection.sortValue">
                    </el-option>
                  </el-select>
                </el-col>
              </el-row>


              <!-- Empty State For Categories -->
              <div class="am-empty-state am-section" v-show="fetched && categories.length === 0">
                <img :src="$root.getUrl+'public/img/emptystate.svg'">
                <h2>{{ $root.labels.no_categories_yet }}</h2>
                <p>{{ $root.labels.click_add_category }}</p>
              </div>

              <!-- Empty State For Services -->
              <div class="am-empty-state am-section"
                   v-show="fetched && fetchedFiltered && categories.length !== 0 && services.filter(item => item.visible).length === 0">
                <img :src="$root.getUrl+'public/img/emptystate.svg'">
                <h2>{{ $root.labels.no_services_yet }}</h2>
                <p>{{ $root.labels.click_add_service }}</p>
              </div>

              <!-- Spinner -->
              <div class="am-spinner am-section" v-show="fetched && !fetchedFiltered">
                <img :src="$root.getUrl+'public/img/spinner.svg'"/>
              </div>

              <!-- Services -->
              <div v-show="fetchedFiltered && fetched && categories.length !== 0" class="am-services-grid">
                <el-row :gutter="16">
                  <el-col :md="24">

                    <draggable v-model="services" :options="draggableOptions" @end="dropService">
                      <div
                          class="am-service-card"
                          @click="showDialogEditService(service.id)"
                          :class="{'am-hidden-entity' : service.status === 'hidden'}"
                          v-for="(service, index) in services"
                          v-show="service.visible"
                      >
                        <span class="am-drag-handle">
                          <img class="svg-amelia" width="20px" :src="$root.getUrl + 'public/img/burger-menu.svg'">
                        </span>

                        <div class="am-service-photo">
                          <img :src="pictureLoad(service, false)" @error="imageLoadError(service, false)"/>
                          <span class="am-service-color" :style="bgColor(service.color)"></span>
                        </div>
                        <div class="am-service-data">
                          <el-row :gutter="16">
                            <el-col :md="12">
                              <h4>
                                {{ service.name }}
                                <span class="am-service-data-id"> ({{ $root.labels.id }}: {{ service.id }})</span>
                              </h4>
                            </el-col>
                            <el-col :md="6">
                              <p>{{ $root.labels.duration }}: {{ secondsToNiceDuration(service.duration) }}</p>
                            </el-col>
                            <el-col :md="6">
                              <p>{{ $root.labels.price }}: {{ getFormattedPrice(service.price) }}</p>
                            </el-col>
                          </el-row>
                        </div>
                      </div>

                    </draggable>

                  </el-col>


                </el-row>
              </div>

              <!-- Pagination -->
              <pagination-block
                :params="paginationParams"
                :show="paginationParams.show"
                :count="countFiltered"
                :label="$root.labels.services.toLowerCase()"
                :visible="fetched && fetchedFiltered && services.length !== 0 && countTotal > paginationParams.show"
                @change="getServices"
              >
              </pagination-block>

            </div>
          </el-col>

        </el-row>
      </div>

      <div v-if="$root.licence.isPro || $root.licence.isDeveloper" class="am-services-categories am-packages-feature" v-show="typeTab === 'packages'" :key="1">
        <BlockLite message="This feature is available only in Pro and Developer licenses."/>

        <!-- Spinner -->
        <div class="am-spinner am-section" v-show="!fetched">
          <img :src="$root.getUrl+'public/img/spinner.svg'"/>
        </div>

        <el-row v-if="fetched" class="am-flexed">

          <el-col :md="24">
            <div class="am-services-column am-section">
              <el-row :gutter="16">
                <el-col :md="12">
                  <h2>

                  </h2>
                  <h2>

                  </h2>
                </el-col>
                <el-col :md="12" class="am-align-right">
                  <span class="am-sort-services-label">{{$root.labels.packages_sorting}}</span>
                  <el-select v-model="sortingPackages" clearable placeholder="Sort Packages" class="am-sort-services" @change="changePackagesSorting">
                    <el-option
                      v-for="sortSelection in sortingSelection"
                      :key="sortSelection.sortValue"
                      :label="sortSelection.sortName"
                      :value="sortSelection.sortValue">
                    </el-option>
                  </el-select>
                </el-col>
              </el-row>

              <!-- Empty State For Packages -->
              <div class="am-empty-state am-section"
                   v-show="fetched && packages.length === 0">
                <img :src="$root.getUrl+'public/img/emptystate.svg'">
                <h2>{{ $root.labels.no_packages_yet }}</h2>
                <p>{{ $root.labels.click_add_package }}</p>
              </div>

              <!-- Packages -->
              <div v-show="fetched && packages.length !== 0" class="am-services-grid">
                <el-row :gutter="16">
                  <el-col :md="24">

                    <draggable v-model="packages" :options="draggableOptions" @end="dropPackage">
                      <div
                        class="am-service-card"
                        @click="showDialogEditPackage(index)"
                        :class="{'am-hidden-entity': pack.status === 'hidden'}"
                        v-for="(pack, index) in packages"
                      >
                      <span class="am-drag-handle">
                        <img class="svg-amelia" width="20px" :src="$root.getUrl + 'public/img/burger-menu.svg'">
                      </span>

                        <div class="am-service-photo">
                          <img :src="pictureLoad(pack, false)" @error="imageLoadError(pack, false)"/>
                          <span class="am-service-color" :style="bgColor(pack.color)"></span>
                        </div>
                        <div class="am-service-data">
                          <el-row :gutter="10" class="am-appointments-flex-row-middle-align" style="margin-bottom: 0;">
                            <el-col :lg="7" :md="7" style="margin: auto;">
                              <span style="font-size: 16px; line-height: 1.5; font-weight: 500;  color: #354052;">
                                {{ pack.name }}
                                <span class="am-service-data-id"> ({{ $root.labels.id }}: {{ pack.id }})</span>
                              </span>
                            </el-col>
                            <el-col :lg="3" :md="3" style="margin: auto; display: flex;">
                              <p>{{ $root.labels.services }}: {{ pack.bookable.length }}</p>
                            </el-col>
                            <el-col :lg="4" :md="4" style="margin: auto; display: flex;">
                              <p>{{ $root.labels.price }}: {{ getFormattedPrice(pack.calculatedPrice ? pack.price : pack.price - pack.price / 100 * pack.discount) }}</p>
                            </el-col>
                            <el-col :lg="10" :md="10" :sm="12" class="align-right" style="margin: auto;">
                              <div @click.stop>
                                <el-button @click="purchasedPackages(pack)">{{ $root.labels.purchased_packages }}</el-button>
                                <el-button @click="showDialogEditPackage(index)">{{ $root.labels.edit }}</el-button>
                              </div>
                            </el-col>
                          </el-row>
                        </div>
                      </div>

                    </draggable>

                  </el-col>


                </el-row>
              </div>

            </div>
          </el-col>

        </el-row>
      </div>

      </div>

      <packages
          v-if="showPurchasedPackages"
          :purchased-package="purchasedPackage"
          :dialog-package-booking="dialogPackageBooking"
          @closePurchasedPackages="closePurchasedPackage"
          @closePackageBooking="dialogPackageBooking = false"
          @savePackageBookingCallback="getOptions"
      >
      </packages>

      <!-- Button New -->
      <div v-if="categories.length > 0 && $root.settings.capabilities.canWrite === true" id="am-button-new" class="am-button-new">
        <el-button
          id="am-plus-symbol"
          type="primary"
          icon="el-icon-plus"
          @click="typeTab === 'services' ? showDialogNewService() : (showPurchasedPackages ? showDialogNewPackageBooking() : showDialogNewPackage())">
        </el-button>
      </div>

      <!-- Dialog Service -->
      <transition name="slide">
        <el-dialog
            :close-on-click-modal="false"
            class="am-side-dialog am-dialog-service"
            :visible.sync="dialogService"
            :show-close="false"
            v-if="dialogService"
        >
          <dialog-service
              :categories="categories"
              :passedService="service"
              :employees="options.employees"
              :settings=options.settings
              :futureAppointments="futureAppointments"
              :newExtraTranslations="newExtraTranslations"
              @saveCallback="saveServiceCallback"
              @duplicateCallback="duplicateServiceCallback"
              @closeDialog="dialogService = false"
              @showDialogTranslate ="showDialogTranslate"
              @extraSaved ="extraSaved"
          >
          </dialog-service>
        </el-dialog>
      </transition>

      <!-- Dialog Translate -->
      <transition name="slide">
        <el-dialog
          :close-on-click-modal="false"
          class="am-side-dialog am-dialog-translate am-edit"
          :show-close="true"
          :visible.sync="dialogTranslate"
          :service="service"
          v-if="dialogTranslate"
        >
          <dialog-translate
            :passed-translations="dialogTranslateData"
            :name="dialogTranslateName"
            :allLanguagesData="languagesData"
            :used-languages="options.settings.general.usedLanguages"
            :type="dialogTranslateType"
            :tab="dialogTranslateTab"
            @saveDialogTranslate="saveDialogTranslate"
            @closeDialogTranslate="dialogTranslate = false"
          >
          </dialog-translate>
        </el-dialog>
      </transition>


      <!-- Dialog Package -->
      <transition name="slide">
        <el-dialog
          :close-on-click-modal="false"
          class="am-side-dialog am-dialog-service"
          :visible.sync="dialogPackage"
          :show-close="false"
          v-if="dialogPackage"
        >
          <dialog-package
            :categories="categories"
            :passedPackage="package"
            :options="{
              entitiesRelations: options.entitiesRelations,
              entities: {
                employees: options.employees,
                locations: options.locations
              }
            }"
            :settings=options.settings
            @saveCallback="savePackageCallback"
            @duplicateCallback="duplicatePackageCallback"
            @closeDialog="dialogPackage = false"
            @showDialogTranslate ="showDialogTranslate"
          >
          </dialog-package>
        </el-dialog>
      </transition>

      <!-- Help Button -->
      <el-col :md="6" class="">
        <a class="am-help-button" href="https://wpamelia.com/services-and-categories/" target="_blank">
          <i class="el-icon-question"></i> {{ $root.labels.need_help }}?
        </a>
      </el-col>

      <!-- <dialog-new-customize></dialog-new-customize> -->

      <DialogLite/>

    </div>
  </div>
</template>

<script>
  import Form from 'form-object'
  import DialogService from './DialogService.vue'
  import DialogPackage from '../../parts/Empty.vue'
  import PageHeader from '../parts/PageHeader.vue'
  import Draggable from 'vuedraggable'
  import liteMixin from '../../../js/common/mixins/liteMixin'
  import settingsMixin from '../../../js/common/mixins/settingsMixin'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import durationMixin from '../../../js/common/mixins/durationMixin'
  import priceMixin from '../../../js/common/mixins/priceMixin'
  import notifyMixin from '../../../js/backend/mixins/notifyMixin'
  import DialogTranslate from '../parts/DialogTranslate'
  import stashMixin from '../../../js/backend/mixins/stashMixin'
  import serviceMixin from '../../../js/common/mixins/serviceMixin'
  import PaginationBlock from '../parts/PaginationBlock.vue'
  import Packages from './Packages'
  // import DialogNewCustomize from '../parts/DialogNewCustomize.vue'

export default {

    mixins: [liteMixin, imageMixin, dateMixin, durationMixin, priceMixin, serviceMixin, notifyMixin, settingsMixin, stashMixin],

    data () {
      return {
        countTotal: 0,
        countFiltered: 0,
        paginationParams: {
          page: 1,
          show: this.$root.settings.general.servicesPerPage
        },
        typeTab: 'services',
        package: null,
        packages: [],
        dialogPackage: false,
        dialogPackageBooking: false,
        activeCategory: {},
        categories: [],
        categoryToDeleteId: null,
        count: 0,
        dialogService: false,
        deleteConfirmation: false,
        draggableOptions: {
          handle: '.am-drag-handle',
          animation: 150
        },
        editedCategoryId: 0,
        editedCategoryName: '',
        editedCategoryOldName: '',
        fetched: false,
        fetchedFiltered: false,
        form: new Form(),
        futureAppointments: {},
        loadingAddCategory: false,
        loadingDeleteCategory: false,
        options: {
          employees: [],
          settings: {
            payments: {
              wc: []
            },
            general: {
              usedLanguages: []
            }
          }
        },
        service: null,
        services: [],
        sortingServices: this.$root.settings.general.sortingServices,
        sortingPackages: this.$root.settings.general.sortingPackages,
        sortingSelection: [
          {
            sortName: this.$root.labels.services_sorting_name_asc,
            sortValue: 'nameAsc'
          },
          {
            sortName: this.$root.labels.services_sorting_name_desc,
            sortValue: 'nameDesc'
          },
          {
            sortName: this.$root.labels.services_sorting_price_asc,
            sortValue: 'priceAsc'
          },
          {
            sortName: this.$root.labels.services_sorting_price_desc,
            sortValue: 'priceDesc'
          },
          {
            sortName: this.$root.labels.services_sorting_custom,
            sortValue: 'custom'
          }
        ],
        svgLoaded: false,
        dialogTranslate: false,
        dialogTranslateExtra: false,
        dialogTranslateCategory: false,
        dialogTranslateType: 'name',
        dialogTranslateTab: 'service',
        dialogTranslateData: {},
        dialogTranslateName: '',
        extrasTranslateIndex: 0,
        languagesData: [],
        newExtraTranslations: null,
        showPurchasedPackages: false,
        purchasedPackage: null
      }
    },

    created () {
      Form.defaults.axios = this.$http

      this.getOptions()

      this.getServices()
    },

    mounted () {

    },

    updated () {
      if (this.svgLoaded) this.inlineSVG()
      this.svgLoaded = true
    },

    methods: {
      changeServiceSorting (notify = true) {
        this.fetchedFiltered = false

        this.updateServicesPositions(notify, true, true)
      },

      changePackagesSorting: !AMELIA_LITE_VERSION ? function (notify) {
        switch (this.sortingPackages) {
          case ('nameAsc'):
            this.packages = this.packages.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1)
            break
          case ('nameDesc'):
            this.packages = this.packages.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase()) ? 1 : -1)
            break
          case ('priceAsc'):
            this.packages = this.packages.sort((a, b) => (a.price - (a.price * (a.discount / 100)) > b.price - (b.price * (b.discount / 100))) ? 1 : -1)
            break
          case ('priceDesc'):
            this.packages = this.packages.sort((a, b) => (a.price - (a.price * (a.discount / 100)) < b.price - (b.price * (b.discount / 100))) ? 1 : -1)
            break
        }

        this.updatePackagesPositions(notify)
      } : function () {},

      updateServicesPositions (notify, updateStash, refreshServices) {
        let services = []

        this.services.forEach((service) => {
          let serviceSettings = service.settings ? JSON.parse(JSON.stringify(service.settings)) : null

          if (serviceSettings && serviceSettings.payments && serviceSettings.payments.wc.productId === this.$root.settings.payments.wc.productId) {
            delete serviceSettings.payments.wc
          }

          services.push(Object.assign(JSON.parse(JSON.stringify(service)), {settings: serviceSettings ? JSON.stringify(serviceSettings) : null}))
        })

        this.$http.post(`${this.$root.getAjaxUrl}/services/positions`, {
          services: services,
          sorting: this.sortingServices
        }).then(() => {
          if (notify) {
            this.notify(this.$root.labels.success, this.$root.labels.services_positions_saved, 'success')
          }

          if (updateStash) {
            this.updateStashEntities({})
          }

          if (refreshServices) {
            this.getServices()
          }
        }).catch(() => {
          this.notify(this.$root.labels.error, this.$root.labels.services_positions_saved_fail, 'error')
        })
      },

      updatePackagesPositions: !AMELIA_LITE_VERSION ? function (notify) {
        this.packages.forEach(function (pack, index) {
          pack.position = index + 1
        })

        this.$http.post(`${this.$root.getAjaxUrl}/packages/positions`, {
          packages: this.packages,
          sorting: this.sortingPackages
        }).then(() => {
          if (notify) {
            this.notify(this.$root.labels.success, this.$root.labels.packages_positions_saved, 'success')
          }

          this.updateStashEntities({})
        }).catch(() => {
          this.notify(this.$root.labels.error, this.$root.labels.packages_positions_saved_fail, 'error')
        })
      } : function () {},

      getServices () {
        this.fetchedFiltered = false

        this.$http.get(`${this.$root.getAjaxUrl}/services`, {params: {page: this.paginationParams.page, categoryId: this.activeCategory ? this.activeCategory.id : null}})
          .then(response => {
            this.services = response.data.data.services

            this.countTotal = response.data.data.countTotal

            this.countFiltered = response.data.data.countFiltered

            this.services.forEach((service) => {
              service.visible = true

              this.setEntitySettings(service, 'service')

              service.customPricing = this.getArrayCustomPricing(service.customPricing)
            })

            this.dialogService = false
            this.fetchedFiltered = true
          })
          .catch(e => {
            console.log(e.message)
            this.dialogService = false
            this.fetchedFiltered = true
          })
      },

      getOptions (usedLanguages = null, updatePackagePositions = false) {
        this.$http.get(`${this.$root.getAjaxUrl}/entities`, {
          params: this.getAppropriateUrlParams({
            types: ['employees', 'categories', 'packages', 'locations', 'settings']
          })
        })
          .then(response => {
            this.options.settings.general.usedLanguages = []

            this.options.locations = []

            this.options.entitiesRelations = response.data.data.entitiesRelations

            this.packages = []

            this.setInitialEmployee(response.data.data.employees)

            this.languagesData = response.data.data.settings.languages

            this.categories = response.data.data.categories
            this.categories.sort((a, b) => (a.position > b.position) ? 1 : -1)

            this.parseOptions(response)

            this.packages.forEach((service) => {
              this.setEntitySettings(service, 'package')
            })

            this.fetched = true

            if (usedLanguages) {
              this.options.settings.general.usedLanguages = usedLanguages
            }
            if (updatePackagePositions === true) {
              this.changePackagesSorting(false)
            }
          })
          .catch(e => {
            console.log(e.message)
            this.fetched = true
          })
      },

      parseOptions: function (response) {
        this.options.employees = response.data.data.employees.slice(0, 1)

        this.categories = response.data.data.categories

        this.categories.forEach(function (category) {
          category.serviceList.forEach(function (service) {
            service.extras = []
          })
        })
      },

      addCategory () {
        this.loadingAddCategory = true

        let newCategory = {
          status: 'visible',
          name: this.$root.labels.new_category,
          position: this.categories.length + 1
        }

        this.form.post(`${this.$root.getAjaxUrl}/categories`, newCategory)
          .then(response => {
            this.categories.push(response.data.category)
            this.editedCategoryId = response.data.category.id
            this.editedCategoryName = response.data.category.name
            this.loadingAddCategory = false

            let that = this
            window.setTimeout(function () {
              that.$refs.input[that.categories.indexOf(response.data.category)].focus()
            }, 0)

            this.updateStashEntities({})
          })
          .catch(e => {
            this.notify(this.$root.labels.error, this.$root.labels.category_add_fail, 'error')
            this.loadingAddCategory = false
          })
      },

      updateCategory (category) {
        this.form.post(`${this.$root.getAjaxUrl}/categories/${category.id}`, category)
          .then(() => {
            this.notify(this.$root.labels.success, this.$root.labels.category_saved, 'success')

            this.updateStashEntities({})
          })
          .catch(() => {
            category.name = this.editedCategoryOldName
            this.notify(this.$root.labels.error, this.$root.labels.category_saved_fail, 'error')
          })
      },

      updateCategoriesPositions (notify) {
        this.$http.post(`${this.$root.getAjaxUrl}/categories/positions`, {
          categories: this.categories
        }).then(() => {
          if (notify) {
            this.notify(this.$root.labels.success, this.$root.labels.categories_positions_saved, 'success')
          }

          this.updateStashEntities({})
        }).catch(() => {
          this.notify(this.$root.labels.error, this.$root.labels.categories_positions_saved_fail, 'error')
        })
      },

      editCategoryName (category, event) {
        this.hideDeleteCategoryDialog()
        // If edit or save button is clicked
        if (event.currentTarget.className === '') {
          this.editedCategoryId = category.id
          this.editedCategoryName = category.name
          // Focus category name input
          let that = this
          window.setTimeout(function () {
            that.$refs.input[that.categories.indexOf(category)].focus()
          }, 0)
        } else {
          this.editedCategoryName = this.editedCategoryName.trim()
          if (this.editedCategoryName === '') {
            return
          }
          this.editedCategoryOldName = category.name
          if (category.name !== this.editedCategoryName) {
            category.name = this.editedCategoryName
            this.updateCategory(category)
          }
          this.editedCategoryId = this.editedCategoryName = null
        }
      },

      dropCategory (e) {
        if (e.newIndex !== e.oldIndex) {
          let that = this
          this.categories.forEach((category) => {
            category.position = that.categories.indexOf(category) + 1
          })
          this.updateCategoriesPositions(true)
        }
      },

      dropService (e) {
        if (e.newIndex !== e.oldIndex) {
          this.sortingServices = 'custom'
          this.updateServicesPositions(true, true, false)
        }
      },

      dropPackage: !AMELIA_LITE_VERSION ? function (e) {
        if (e.newIndex !== e.oldIndex) {
          this.sortingPackages = 'custom'
          this.updatePackagesPositions(true)
        }
      } : function () {},

      duplicateCategory (category) {
        let newCategory = JSON.parse(JSON.stringify(category))

        delete newCategory.id

        newCategory.position = this.categories.length + 1

        this.svgLoaded = false

        newCategory.serviceList.forEach((service) => {
          delete service.id

          service.extras.forEach((extra) => {
            delete extra.id
          })

          if (typeof service.settings === 'object' && service.settings !== null) {
            service.settings = JSON.stringify(service.settings)
          } else {
            service.settings = null
          }
        })

        this.form.post(`${this.$root.getAjaxUrl}/categories`, newCategory)
          .then(response => {
            this.categories.push(response.data.category)
            this.services = this.services.concat(response.data.category.serviceList)

            this.activeCategory = this.categories[this.categories.length - 1]

            this.filterServices(this.activeCategory)

            this.notify(this.$root.labels.success, this.$root.labels.category_duplicated, 'success')

            this.updateStashEntities({})
          })
          .catch(e => {
            this.notify(this.$root.labels.error, this.$root.labels.category_add_fail, 'error')
          })
      },

      handleCategoryDeleteConfirmation (category) {
        this.categoryToDeleteId = category.id
        this.deleteConfirmation = true
        // Remove category name editing if it is enabled
        this.editedCategoryId = null
        this.editedCategoryName = ''
      },

      hideDeleteCategoryDialog () {
        this.categoryToDeleteId = null
        this.deleteConfirmation = false
      },

      getService (id) {
        this.$http.get(`${this.$root.getAjaxUrl}/services/` + id)
          .then((response) => {
            let service = response.data.data.service

            if (service.timeBefore === null) {
              service.timeBefore = ''
            }

            if (service.timeAfter === null) {
              service.timeAfter = ''
            }

            this.setEntitySettings(service, 'service')

            this.futureAppointments = {}

            this.futureAppointments[service.id] = response.data.data.futureAppointmentsProvidersIds

            service.customPricing = this.getArrayCustomPricing(service.customPricing)

            this.service = service
          })
          .catch((e) => {
            console.log(e.message)
          })
      },

      deleteCategory (category) {
        this.loadingDeleteCategory = true

        this.$http.post(`${this.$root.getAjaxUrl}/categories/delete/` + this.categoryToDeleteId)
          .then(() => {
            // Delete category
            let index = this.categories.indexOf(category)
            this.categories.splice(index, 1)
            // Delete services
            this.services = this.services.filter(service => service.categoryId !== this.categoryToDeleteId)
            // Refresh displayed services if active category is deleted
            if (this.activeCategory.id === this.categoryToDeleteId) {
              this.activeCategory = {}
            }

            // Update categories positions
            for (let i = 0; i < this.categories.length; i++) {
              this.categories[i].position = i + 1
            }

            this.updateCategoriesPositions(false)
            this.loadingDeleteCategory = false
            this.notify(this.$root.labels.success, this.$root.labels.category_deleted, 'success')
          })
          .catch(() => {
            this.loadingDeleteCategory = false
            this.notify(this.$root.labels.error, this.$root.labels.categories_delete_fail, 'error')
          })
      },

      filterServices (category) {
        this.activeCategory = category

        this.paginationParams.page = 1

        this.getServices()
      },

      showDialogNewService () {
        this.service = this.getInitServiceObject()
        this.dialogService = true
      },

      showDialogNewPackage: !AMELIA_LITE_VERSION ? function () {
        this.package = this.getInitPackageObject()
        this.package.position = this.packages.length + 1
        this.dialogPackage = true
      } : function () {},

      showDialogNewPackageBooking () {
        this.dialogPackageBooking = true
      },

      showDialogEditService (serviceId) {
        this.service = null

        setTimeout(() => {
          this.getService(serviceId)
        }, 500)

        this.dialogService = true
      },

      purchasedPackages (pack) {
        this.purchasedPackage = pack
        this.showPurchasedPackages = true
      },

      showDialogEditPackage: !AMELIA_LITE_VERSION ? function (index) {
        this.package = this.packages[index]

        this.dialogPackage = true
      } : function () {},

      duplicateServiceCallback (entity) {
        this.service = entity
        this.service.id = 0
        this.service.duplicated = true

        setTimeout(() => {
          this.dialogService = true
        }, 300)
      },

      duplicatePackageCallback: !AMELIA_LITE_VERSION ? function (entity) {
        this.package = entity
        this.package.id = 0
        this.package.duplicated = true

        setTimeout(() => {
          this.dialogPackage = true
        }, 300)
      } : function () {},

      bgColor (color) {
        return {'background-color': color}
      },

      saveServiceCallback () {
        this.$http.post(`${this.$root.getAjaxUrl}/settings`, {usedLanguages: this.options.settings.general.usedLanguages})
          .catch((e) => {
            console.log(e)
          })

        if (this.sortingServices !== 'custom' || (this.service && !this.service.position)) {
          this.updateServicesPositions(false, false, true)
        } else {
          this.getServices()
        }
      },

      savePackageCallback: !AMELIA_LITE_VERSION ? function () {
        this.$http.post(`${this.$root.getAjaxUrl}/settings`, {usedLanguages: this.options.settings.general.usedLanguages})
          .catch((e) => {
            console.log(e)
          })
        this.dialogPackage = false
        this.getOptions(this.options.settings.general.usedLanguages, true)
      } : function () {},

      getInitPackageObject: !AMELIA_LITE_VERSION ? function () {
        return {
          id: 0,
          bookable: [],
          color: '#1788FB',
          description: '',
          name: '',
          pictureFullPath: '',
          pictureThumbPath: '',
          price: 0,
          calculatedPrice: true,
          discount: 0,
          status: 'visible',
          gallery: [],
          position: 0,
          settings: this.getInitEntitySettings('package'),
          endDate: null,
          durationCount: null,
          durationType: null,
          deposit: 0,
          depositPayment: 'disabled',
          translations: null,
          sharedCapacity: 0,
          quantity: 1,
        }
      } : function () {},

      getInitServiceObject () {
        return {
          id: 0,
          categoryId: '',
          color: '#1788FB',
          description: '',
          duration: '',
          providers: [],
          extras: [],
          maxCapacity: 1,
          minCapacity: 1,
          name: '',
          pictureFullPath: '',
          pictureThumbPath: '',
          price: 0,
          customPricing: {enabled: false, durations: []},
          status: 'visible',
          timeAfter: '',
          timeBefore: '',
          bringingAnyone: true,
          show: true,
          applyGlobally: false,
          gallery: [],
          aggregatedPrice: true,
          settings: this.getInitEntitySettings('service'),
          recurringCycle: 'disabled',
          recurringSub: 'future',
          recurringPayment: 0,
          position: 0,
          deposit: 0,
          depositPayment: 'disabled',
          depositPerPerson: 1,
          fullPayment: false,
          translations: null,
          minSelectedExtras: null,
          mandatoryExtra: false,
          maxExtraPeople: null
        }
      },

      showDialogTranslate (type, dialogTranslateTab, extraIndex) {
        this.dialogTranslateTab = dialogTranslateTab
        this.dialogTranslateType = type
        switch (dialogTranslateTab) {
          case 'service':
            this.dialogTranslateData = this.service.translations
            this.dialogTranslateName = this.service.name
            this.dialogTranslate = true
            break
          case 'extra':
            this.extrasTranslateIndex = extraIndex
            this.dialogTranslateData = this.service.extras[extraIndex] ? this.service.extras[extraIndex].translations : this.newExtraTranslations
            this.dialogTranslateName = this.service.extras[extraIndex] ? this.service.extras[extraIndex].name : null
            this.dialogTranslate = true
            break
          case 'category':
            this.dialogTranslateName = this.activeCategory.name
            this.dialogTranslate = true
            break
          case 'package':
            this.dialogTranslateData = this.package.translations
            this.dialogTranslateName = this.package.name
            this.dialogTranslate = true
            break
        }
      },

      showDialogTranslateCategory (category) {
        this.activeCategory = category
        this.dialogTranslateType = 'name'
        this.dialogTranslateTab = 'category'
        this.dialogTranslateName = this.activeCategory.name
        this.dialogTranslateData = this.activeCategory.translations
        this.dialogTranslate = true
      },

      saveDialogTranslate (translations, newLanguages, tab) {
        this.options.settings.general.usedLanguages = this.options.settings.general.usedLanguages.concat(newLanguages)
        this.dialogTranslate = false

        switch (tab) {
          case ('service'):
            this.service['translations'] = translations

            break

          case ('extra'):
            if (this.service.extras[this.extrasTranslateIndex]) {
              this.service.extras[this.extrasTranslateIndex]['translations'] = translations
            } else {
              if (this.newExtraTranslations) {
                let newTranslations = JSON.parse(this.newExtraTranslations)
                if (JSON.parse(translations)['name']) {
                  newTranslations['name'] = JSON.parse(translations)['name']
                }
                if (JSON.parse(translations)['description']) {
                  newTranslations['description'] = JSON.parse(translations)['description']
                }
                this.newExtraTranslations = JSON.stringify(newTranslations)
              } else {
                this.newExtraTranslations = translations
              }
            }

            break

          case ('category'):
            this.activeCategory['translations'] = translations
            this.updateCategory(this.activeCategory)
            this.$http.post(`${this.$root.getAjaxUrl}/settings`, {usedLanguages: this.options.settings.general.usedLanguages})
              .catch((e) => {
                console.log(e)
              })

            break

          case ('package'):
            this.package['translations'] = translations

            break
        }
      },

      closeDialogTranslate () {
        this.dialogTranslate = false
      },

      closePurchasedPackage () {
        this.showPurchasedPackages = false
      },

      extraSaved (extra, index) {
        this.newExtraTranslations = null
        this.service.extras[index] = extra
      }
    },

    components: {
      PageHeader,
      Draggable,
      PaginationBlock,
      DialogPackage,
      DialogService,
      DialogTranslate,
      Packages,
      // DialogNewCustomize
    }

  }
</script>
