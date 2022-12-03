<template>
  <div
    v-show="!props.loading"
    class="am-fs__main-footer"
    :class="[
      {'am-fs__main-footer-cp' : props.secondButtonShow},
      {'am-fs__main-footer-cp-mobile-s' : (mobileS && props.secondButtonShow)}
    ]"
    :style="cssVars"
  >
    <AmButton
      v-if="props.secondButtonShow"
      :class="getLicenceClass('footerCustomerPanel')"
      category="secondary"
      :type="props.secondaryFooterButtonType"
      @click="secondButtonClick"
    >
      {{displayLabels('congrats_panel')}}
    </AmButton>
    <div v-if="props.paymentGateway === 'payPal' && !isCongratzStep" :id="'am-paypal-element-' + shortcodeData.counter"></div>
    <AmButton
      v-if="props.paymentGateway !== 'payPal' || isCongratzStep"
      :disabled="footerBtnDisabled"
      :type="props.primaryFooterButtonType"
      @click="footerButtonClick"
    >
      {{ displayLabels(labelValue) }}
    </AmButton>
  </div>

  <!-- Skeleton TODO - same as header component check witch flag should be used-->
  <!--  <div class="am-fs__main-footer-skeleton">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item :style="{width: '109px', height: '40px'}"/>
        </template>
      </el-skeleton>
    </div>-->
  <!-- /Skeleton -->

</template>

<script setup>
import AmButton from '../../../../_components/button/AmButton.vue'
import { computed, inject, ref, watch } from 'vue'
import { useColorTransparency } from "../../../../../assets/js/common/colorManipulation";
import {getLicenceClass} from "../../../../../assets/js/common/licence";

let props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  customizedLabels: {
    type: Object,
    default: () => {
      return {}
    }
  },
  primaryFooterButtonType: {
    type: String,
    default: 'filled'
  },
  secondaryFooterButtonType: {
    type: String,
    default: 'filled'
  },
  paymentGateway: {
    type: String,
    default: ''
  },
  secondButtonShow: {
    type: Boolean,
    required: false
  }
})

// * Step Functions
const { secondButtonClick } = inject('secondButton', {
  secondButtonClick: () => {},
})

const { footerButtonClick, footerBtnDisabled } = inject('changingStepsFunctions', {
  footerButtonClick: () => {}
})

// * Labels
const amLabels = inject('labels')

// * Check current step for button text (continue/finish)
const steps = inject('sidebarSteps')
const currentStep = inject('stepIndex')

let labelValue = ref('continue')

// flag for payPal button on congratz step
let isCongratzStep = ref(false)

watch(currentStep, (value) => {
  if (value === steps.value.length) {
    labelValue.value = 'finish_appointment'
    isCongratzStep.value = true
  } else {
    labelValue.value = 'continue'
  }
})

const shortcodeData = inject('shortcodeData', ref({
  counter: 1000
}))

function displayLabels (label) {
  return Object.keys(props.customizedLabels).length && props.customizedLabels[label] ? props.customizedLabels[label] : amLabels[label]
}

// * Colors
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
  colorInpPlaceHolder: '#1A2C37',
  colorDropBgr: '#FFFFFF',
  colorDropBorder: '#D1D5D7',
  colorDropText: '#0E1920',
  colorBtnPrim: '#265CF2',
  colorBtnPrimText: '#FFFFFF',
  colorBtnSec: '#1A2C37',
  colorBtnSecText: '#FFFFFF',
}))
let cssVars = computed(() => {
  return {
    '--am-c-main-text-op15': useColorTransparency(amColors.value.colorMainText, 0.15)
  }
})

let cWidth = inject('containerWidth', 0)
let mobileS = computed(() => cWidth.value < 420)
</script>

<script>
export default {
  name: "MainContentFooter"
}
</script>

<style lang="scss">
@mixin main-content-footer {
  // am -- amelia
  // fs -- form steps
  // Amelia Form Steps
  .am-fs {

    // Main Container
    &__main {
      &-footer {
        position: absolute;
        left: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        padding: 8px 32px;
        background-color: transparent;
        box-shadow: 0 -2px 3px var(--am-c-main-text-op15);
        // cp - customer panel - button on congratulations page
        &-cp {
          display: flex;
          justify-content: space-between;

          &-mobile-s {
            padding: 8px;

            .am-button--secondary {
              padding: 8px;
            }
          }
        }
      }
    }
  }
}

// Public
.amelia-v2-booking #amelia-container {
  @include main-content-footer;
}

// Admin
#amelia-app-backend-new {
  @include main-content-footer;
}
</style>
