<template>
  <!-- Select -->
  <div class="am-select-wrapper">
    <el-select
      :id="id"
      ref="amSelect"
      v-model="model"
      class="am-select"
      :class="[`am-select--${size}`, {'am-select--disabled': disabled}]"
      :popper-class="`am-select-popper${popperClass ? ' ' + popperClass : popperClass}`"
      :popper-options="{showArrow: false}"
      :multiple="props.multiple"
      :disabled="props.disabled"
      :value-key="props.valueKey"
      :clearable="props.clearable"
      :collapse-tags="props.collapseTags"
      :multiple-limit="props.multipleLimit"
      :name="props.name"
      :autocomplete="props.autocomplete"
      :placeholder="props.placeholder"
      :filterable="props.filterable"
      :allow-create="props.allowCreate"
      :filter-method="props.filterMethod"
      :remote="props.remote"
      :remote-method="props.remoteMethod"
      :loading="props.loading"
      :loading-text="props.loadingText"
      :no-match-text="props.noMatchText"
      :no-data-text="props.noDataText"
      :reserve-keyword="props.reserveKeyword"
      :default-first-option="props.defaultFirstOption"
      :teleported="props.teleported"
      :automatic-dropdown="props.automaticDropdown"
      :clear-icon="props.clearIcon"
      :fit-input-width="props.fitInputWidth"
      :suffix-icon="props.suffixIcon"
      :tag-type="props.tagType"
      :prefix-icon="props.prefixIcon"
      :dropdown-arrow-visibility="props.dropdownArrowVisibility"
      :style="{...cssVars}"
      @change="(val) => $emit('change', val)"
      @visible-change="visibleChange"
      @remove-tag="(eventValue) => $emit('remove-tag', eventValue)"
      @clear="$emit('clear')"
      @blur="(e) => $emit('blur', e)"
      @focus="(e) => $emit('focus', e)"
    >
      <template v-if="prefixIcon || Object.keys(prefixIcon).length" #prefix>
        <component
          :is="prefixIcon"
          v-if="typeof prefixIcon === 'object'"
        />
        <span v-if="typeof prefixIcon === 'string'" :class="`am-icon-${prefixIcon}`"/>
      </template>
      <slot/>
    </el-select>
  </div>
  <!-- /Select -->

</template>

<script setup>
// icon components
import AmeliaIconClose from '../icons/IconClose.vue';
import AmeliaIconArrowUp from '../icons/IconArrowUp.vue';

// color composable
import { useColorTransparency } from '../../../assets/js/common/colorManipulation';

import {ref, toRefs, computed, onMounted, inject} from 'vue'

const amLabels = inject('labels')

/**
 * Component Props
 */
const props = defineProps({
  id: {
    type: String
  },
  modelValue: {
    type: [String, Array, Object, Number],
  },
  multiple: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  size: {
    // default / medium / small / mini / micro
    type: String,
    default: 'default',
    validator(value) {
      return ['default', 'medium', 'small', 'mini', 'micro'].includes(value)
    }
  },
  clearable: {
    type: Boolean,
    default: false
  },
  collapseTags: {
    type: Boolean,
    default: false
  },
  multipleLimit: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  placeholder: {
    type: String,
    default: 'Select'
  },
  filterable: {
    type: Boolean,
    default: false
  },
  allowCreate: {
    type: Boolean,
    default: false
  },
  filterMethod: {
    type: Function
  },
  remote: {
    type: Boolean,
    default: false
  },
  remoteMethod: {
    type: Function
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Loading'
  },
  noMatchText: {
    type: String,
    default: 'No matching data'
  },
  noDataText: {
    type: String,
    default: 'No data'
  },
  popperClass: {
    type: String,
    default: ''
  },
  reserveKeyword: {
    type: Boolean,
    default: false
  },
  defaultFirstOption: {
    type: Boolean,
    default: false
  },
  teleported: {
    type: Boolean,
    default: true
  },
  automaticDropdown: {
    type: Boolean,
    default: false
  },
  clearIcon: {
    type: [String, Object],
    default: AmeliaIconClose
  },
  fitInputWidth: {
    type: Boolean,
    default: false
  },
  suffixIcon: {
    type: [String, Object],
    default: AmeliaIconArrowUp
  },
  tagType: {
    type: String,
    default: 'info'
  },
  prefixIcon: {
    type: [String, Object, Function],
    default: ''
  },
  dropdownArrowVisibility: {
    type: Boolean,
    default: false
  }
})

/**
 * Component Emits
 * */
const emits = defineEmits(['change', 'visible-change', 'remove-tag', 'clear', 'blur', 'focus', 'update:modelValue'])

/**
 * Component model
 */
let { modelValue } = toRefs(props)
let model = computed({
  get: () => modelValue.value,
  set: (val) => {
    emits('update:modelValue', val)
  }
})

/**
 * Component reference
 */
const amSelect = ref(null)

// * Font Vars
let amFonts = inject('amFonts', ref({
  fontFamily: 'Amelia Roboto, sans-serif',
  fontUrl: '',
  customFontFamily: '',
  fontFormat: '',
  customFontSelected: false
}))

// * Color Vars
let amColors = inject('amColors', ref({
  colorPrimary: '#1246D6',
  colorSuccess: '#019719',
  colorError: '#B4190F',
  colorWarning: '#CCA20C',
  colorMainBgr: '#FFFFFF',
  colorMainHeadingText: '#33434C',
  colorMainText: '#1A2C37',
  colorSbBgr: '#17295A',
  colorSbText: '#FFFFFF',
  colorInpBgr: '#FFFFFF',
  colorInpBorder: '#D1D5D7',
  colorInpText: '#1A2C37',
  colorInpPlaceHolder: '#808A90',
  colorDropBgr: '#FFFFFF',
  colorDropBorder: '#D1D5D7',
  colorDropText: '#0E1920',
  colorBtnPrim: '#265CF2',
  colorBtnPrimText: '#FFFFFF',
  colorBtnSec: '#1A2C37',
  colorBtnSecText: '#FFFFFF',
}))

// * Css Variables
let cssVars = computed(() => {
  return {
    '--am-c-select-bgr': amColors.value.colorInpBgr,
    '--am-c-select-border': amColors.value.colorInpBorder,
    '--am-c-select-text': amColors.value.colorInpText,
    '--am-c-select-placeholder': amColors.value.colorInpPlaceHolder,
    '--am-c-select-shadow': useColorTransparency(amColors.value.colorInpText, 0.05),
    '--am-c-select-text-op60': useColorTransparency(amColors.value.colorInpText, 0.6),
    '--am-c-select-text-op40': useColorTransparency(amColors.value.colorInpText, 0.4),
    '--am-c-select-text-op10': useColorTransparency(amColors.value.colorInpText, 0.03),
    '--am-font-family': amFonts.value.fontFamily,
  }
})

/**
 * Lifecycle Hooks
 */
onMounted(() => {
  if (!props.dropdownArrowVisibility) {
    amSelect.value.tooltipRef.popperRef.popperInstanceRef.state.styles.arrow.display = 'none'
  } else {
    delete amSelect.value.tooltipRef.popperRef.popperInstanceRef.state.styles.arrow.display
  }
})

function visibleChange (eventValue) {
  amSelect.value.tooltipRef.popperRef.contentRef.style.setProperty('--am-c-option-bgr', amColors.value.colorDropBgr)
  amSelect.value.tooltipRef.popperRef.contentRef.style.setProperty('--am-c-option-border', amColors.value.colorDropBorder)
  amSelect.value.tooltipRef.popperRef.contentRef.style.setProperty('--am-c-option-text', amColors.value.colorDropText)
  amSelect.value.tooltipRef.popperRef.contentRef.style.setProperty('--am-c-option-text-op65', useColorTransparency(amColors.value.colorDropText, 0.65))
  amSelect.value.tooltipRef.popperRef.contentRef.style.setProperty('--am-c-option-hover', useColorTransparency(amColors.value.colorDropText, 0.1))
  amSelect.value.tooltipRef.popperRef.contentRef.style.setProperty('--am-c-option-selected', amColors.value.colorPrimary)
  amSelect.value.tooltipRef.popperRef.contentRef.style.setProperty('--am-c-option-img-bgr', amColors.value.colorSuccess)
  amSelect.value.tooltipRef.popperRef.contentRef.style.setProperty('--am-c-option-img-text', amColors.value.colorMainBgr)
  amSelect.value.tooltipRef.popperRef.contentRef.style.setProperty('--am-font-family', amFonts.value.fontFamily)
  emits('visible-change', eventValue)
}
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<style lang="scss">
@mixin am-select-block {
  .am-select {
    // -c-    color
    // -rad-  border radius
    // -h-    height
    // -fs-   font size
    // -padd- padding
    // -bgr   background
    --am-c-select-bgr: var(--am-c-inp-bgr);
    --am-c-select-border: var(--am-c-inp-border);
    --am-c-select-text: var(--am-c-inp-text);
    --am-c-select-placeholder: var(--am-color-input-placeholder);
    --am-rad-select: var(--am-rad-input);
    --am-fs-select: var(--am-fs-input);
    --am-h-select: var(--am-h-input);
    --am-padd-select: 8px 12px;
    width: 100%;

    // Select Wrapper
    &-wrapper {
      width: 100%;
    }

    // Size - default / medium / small / mini / micro
    &--default {
      --am-h-select: 40px;
      --am-padd-select: 8px 24px 8px 12px;
    }
    &--medium {
      --am-h-select: 36px;
      --am-padd-select: 6px 24px 6px 10px;
    }
    &--small {
      --am-h-select: 32px;
      --am-padd-select: 4px 24px 4px 10px;
    }
    &-mini {}
    &-micro {}

    // Disabled
    &--disabled {
      --am-c-select-bgr: var(--am-c-select-text-op10);
      --am-c-select-text: var(--am-c-select-text-op60);
    }

    // Input
    .el-input {
      .el-icon {
        font-size: 18px;
        color: var(--am-c-select-text);
      }

      &__inner {
        width: 100%;
        height: var(--am-h-select);
        font-size: var(--am-fs-select);
        font-weight: 400;
        line-height: 1.6;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        color: var(--am-c-select-text);
        border: 1px solid var(--am-c-select-border);
        border-radius: var(--am-rad-select);
        background-color: var(--am-c-select-bgr);
        padding: var(--am-padd-select);
        box-shadow: 0 2px 2px var(--am-c-select-shadow);

        &::-webkit-input-placeholder { /* Chrome/Opera/Safari */
          color: var(--am-c-select-placeholder);
        }
        &::-moz-placeholder { /* Firefox 19+ */
          color: var(--am-c-select-placeholder);
        }
        &:-ms-input-placeholder { /* IE 10+ */
          color: var(--am-c-select-placeholder);
        }
        &:-moz-placeholder { /* Firefox 18- */
          color: var(--am-c-select-placeholder);
        }

        &:hover:not(:focus):not(:active) {
          --am-c-select-border: var(--am-c-select-text-op40);
        }

        &:focus, &:active {
          --am-c-select-border: var(--am-c-primary);
          border-color: var(--am-c-select-border) !important;
        }
      }

      // validation icon
      &__suffix {
        .el-input__validateIcon {
          display: none;
        }
      }
    }
  }
}
.am-select-popper {
  z-index: 999999999 !important;
}


// public
.amelia-v2-booking #amelia-container {
  @include am-select-block;
}

// admin
#amelia-app-backend-new {
  @include am-select-block;
}
</style>
