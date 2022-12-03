<template>
  <div class="am-alert-wrapper" :style="cssVars">
    <el-alert
      ref="amAlert"
      :title="props.title"
      :type="props.type"
      :description="props.description"
      :closable="props.closable"
      :center="props.center"
      :close-text="props.closeText"
      :show-icon="props.showIcon"
      :effect="props.effect"
      class="am-alert"
      :style="cssVars"
      @close="() => $emit('close')"
    >
    </el-alert>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { useColorTransparency } from "../../../assets/js/common/colorManipulation";

/**
 * Component Props
 */
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator(value) {
      return ['success', 'warning', 'info', 'error'].includes(value)
    }
  },
  description: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: true
  },
  center: {
    type: Boolean,
    default: false
  },
  closeText: {
    type: String,
    default: ''
  },
  showIcon: {
    type: Boolean,
    default: false
  },
  effect: {
    type: String,
    default: 'light'
  },
})


/**
 * Component Emits
 * */
defineEmits(['close'])


/**
 * Component reference
 */
const amAlert = ref()

// * Color Vars
let amColors = inject('amColors', {
  amColors: {
    value: {
      colorInpText: '#1A2C37',
    }
  }
})

// * Css Variables
let cssVars = computed(() => {
  // alertw - alert warning
  return {
    '--am-c-alert-text': amColors.value.colorMainText,
    '--am-c-alertw-bgr-op10': useColorTransparency(amColors.value.colorWarning, 0.1),
    '--am-c-alertw-bgr-op60': useColorTransparency(amColors.value.colorWarning, 0.6),
    '--am-c-alerte-bgr-op10': useColorTransparency(amColors.value.colorError, 0.1),
    '--am-c-alerte-bgr-op60': useColorTransparency(amColors.value.colorError, 0.6)
  }
})

</script>

<style lang="scss">
@mixin am-alert-block {
  .am-alert-wrapper {
    // -c-    color
    // -rad-  border radius
    // -h-    height
    // -fs-   font size
    // -padd- padding
    // -bgr-   background

    .el-alert {
      padding: 8px 12px;
      box-sizing: border-box;
      box-shadow: 0 2px 3px rgb(26 44 55 / 10%);
      border-radius: 6px;


      &--error {
        background-color: var(--am-c-alerte-bgr-op10);
        border: 1px solid var(--am-c-alerte-bgr-op60);
      }

      &--warning {
        background-color: var(--am-c-alertw-bgr-op10);
        border: 1px solid var(--am-c-alertw-bgr-op60);
      }

      &__title {
        font-weight: 500;
        font-size: 14px;
        line-height: 24px;
        /* $shade-900 */
        color: var(--am-c-alert-text);
      }

      &__description {
        font-weight: 400;
        font-size: 13px;
        line-height: 20px;
        /* $shade-900 */
        color: var(--am-c-alert-text);
      }

      &__icon{
        margin-right: 11px;
      }

    }

  }
}

// public
.amelia-v2-booking #amelia-container {
  @include am-alert-block;
}

// admin
#amelia-app-backend-new {
  @include am-alert-block;
}
</style>