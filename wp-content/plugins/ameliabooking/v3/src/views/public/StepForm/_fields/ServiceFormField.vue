<template>
  <el-form-item
    v-if="store.state.entities.services.length > 1"
    class="am-fs__init-form__item"
    :prop="store.state.entities.categories.length > 1 ? 'service' : 'onlyService'"
    label-position="top"
  >
    <template #label>
      <span class="am-fs__init-form__label">
        {{amLabels.service_colon}}:
      </span>
    </template>
    <AmAdvancedSelect
      v-if="store.state.entities.categories.length > 1"
      v-model="initFormData.service"
      :options="categoryOptions"
      :props-data="advSelectProps"
      :placeholder="amLabels.select_service"
      :category-name="amLabels.dropdown_category_heading"
      :sub-category-name="amLabels.dropdown_items_heading"
      :empty-state-string="amLabels.dropdown_empty"
      @change="changeService"
    ></AmAdvancedSelect>
    <AmSelect
      v-else
      v-model="initFormData.onlyService"
      clearable
      filterable
      :popper-class="'am-service-dropdown'"
      :placeholder="amLabels.select_service"
      @change="changeOnlyService"
    >
      <AmOption
        v-for="service in serviceOptions"
        :key="service.id"
        :value="service.id"
        :label="service.name"
      >
        <div class="am-select-service">
          <span class="am-select-service-name">{{ service.name }}</span>
          <span class="am-select-service-price">{{ useFormattedPrice(service.price) }}</span>
        </div>

      </AmOption>
    </AmSelect>
  </el-form-item>
</template>

<script setup>
import { useStore } from "vuex";
import { computed, inject, reactive } from "vue";
import AmSelect from '../../../_components/select/AmSelect'
import AmOption from '../../../_components/select/AmOption'
import AmAdvancedSelect from '../../../_components/advanced-select/AmAdvancedSelect'
import useAction from "../../../../assets/js/public/actions";
import { useFormattedPrice } from "../../../../assets/js/common/formatting"

// * Store
let store = useStore();

// * Labels
const amLabels = inject('amLabels')

// * Sidebar steps
let { sidebarDataCollector } = inject('sidebarStepsFunctions', {
  sidebarDataCollector: () => {}
})

const { changeInitStepDataService } = inject('initDataChanges', {
  changeInitStepDataService: () => {}
})

const { footerBtnDisabledUpdater } = inject('changingStepsFunctions', {
  footerBtnDisabledUpdater: () => {}
})

// Container Width
let cWidth = inject('containerWidth', 0)
let checkScreen = computed(() => cWidth.value < 560 || (cWidth.value - 240 < 520))

/**
 * * Category - Service Block
 */

let initFormData = inject('initFormData')

// * Service select props
let advSelectProps = reactive({
  expandTrigger: checkScreen.value ? 'click':'hover',
  multiple: false,
  checkStrictly: false,
  emitPath: true,
  lazy: false,
  value: 'id',
  label: 'name',
  children: 'serviceList',
  disabled: 'disabled',
  leaf: 'leaf'
})

// * Set Category Options from entities
let categoryOptions = computed(() => store.getters['entities/filteredCategories'](
  Object.assign(store.getters['booking/getSelection'], {serviceId: null, categoryId: null})
))

// * Set Service Options from entities
let serviceOptions = computed(() => store.getters['entities/filteredServices'](
    Object.assign(store.getters['booking/getSelection'], {serviceId: null, categoryId: null})
))

/**
 * Change Service function
 * @param val
 */
let changeService = (val) => {
  let serviceData = {
    reference: 'service',
    // position will depends on fields order
    position: 0,
    value: ''
  }

  if (Array.isArray(val)) {
    serviceData.value = categoryOptions.value.find((item) => item.id === val[0]).serviceList.find(item => item.id === val[1]).name
  }

  if (!store.getters['booking/getPackageId']) {
    changeInitStepDataService()
  }

  useAction(store, {}, 'SelectService', 'appointment', null, null)

  sidebarDataCollector(serviceData)

  footerBtnDisabledUpdater(false)
}

function changeOnlyService (val) {
  let serviceData = {
    reference: 'service',
    // position will depends on fields order
    position: 0,
    value: ''
  }

  if (val) {
    let service = serviceOptions.value.find((item) => item.id === val)
    serviceData.value = service ? service.name : ''
  }

  changeInitStepDataService()

  useAction(store, {}, 'SelectService', 'appointment', null, null)

  sidebarDataCollector(serviceData)
}
</script>

<script>
export default {
  name: "ServiceFormField"
}
</script>

<style lang="scss">
.am-service-dropdown {
  .am-select-service {
    --am-c-ss-item-name: var(--am-c-main-text);
    --am-c-ss-item-price: var(--am-c-primary);

    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-name {
      display: block;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.43;
      color: var(--am-c-ss-item-name);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-price {
      font-size: 14px;
      font-weight: 400;
      line-height: 1.714;
      color: var(--am-c-ss-item-price);
    }
  }
}
</style>
