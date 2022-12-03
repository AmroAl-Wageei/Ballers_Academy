<template>
  <!-- Phone Number -->
  <el-form-item
    v-if="amCustomize.infoStep.options.phone.visibility"
    ref="primeFieldRef"
    class="am-fs__info-form__item"
    prop="phone"
    label-position="top"
    style="z-index: 10"
    :style="cssVars"
  >
    <template #label>
      <span class="am-fs__info-form__label">
        {{ amLabels.phone_colon }}
      </span>
    </template>
    <AmInputPhone
      v-model="infoFormData.phone"
      :placeholder="amLabels.enter_phone"
      :default-code="settings.general.phoneDefaultCountryCode === 'auto' ? '' : settings.general.phoneDefaultCountryCode.toLowerCase()"
      name="phone"
      style="position: relative"
      @country-phone-iso-updated="countryPhoneIsoUpdated"
    />
    <div v-if="whatsAppSetUp() && !props.phoneError" class="am-whatsapp-opt-in-text">
      {{ amLabels.whatsapp_opt_in_text }}
    </div>
  </el-form-item>
  <!-- /Phone Number -->
</template>

<script setup>
import AmInputPhone from '../../../../_components/input-phone/AmInputPhone.vue'
import {settings} from "../../../../../plugins/settings";

import {computed, inject, ref} from "vue";
import {useStore} from "vuex";
import {useColorTransparency} from "../../../../../assets/js/common/colorManipulation";

let store = useStore()


let props = defineProps({
  phoneError: {
    type: Boolean,
    default: false
  }
})

// * Colors
let amColors = inject('amColors')
let cssVars = computed(() => {
  return {
    // is - Info Step, wa - WhatsApp
    '--am-c-is-wa-text': useColorTransparency(amColors.value.colorMainText, 0.5),
    'margin-bottom': whatsAppSetUp() && !props.phoneError ? '10px' : '24px'
  }
})

defineEmits([
  'countryPhoneIsoUpdated',
])

let primeFieldRef = ref(null)

// * Labels
let amLabels = inject('amLabels')

// * Customize
let amCustomize = inject('amCustomize')

// * Form field data
let infoFormData = inject('infoFormData')

function countryPhoneIsoUpdated (val) {
  store.commit('booking/setCustomerCountryPhoneIso', val ? val.toLowerCase() : '')
}

function whatsAppSetUp () {
  return settings.notifications.whatsAppAccessToken && settings.notifications.whatsAppBusinessID && settings.notifications.whatsAppPhoneID
}

defineExpose({
  primeFieldRef
})
</script>

<script>
export default {
  name: "PhoneFormField"
}
</script>

<style lang="scss">
.amelia-v2-booking {
  #amelia-container {
    .am-fs__info-form__item {
      .am-whatsapp-opt-in-text {
        color: var(--am-c-is-wa-text);
        font-weight: 400;
        font-size: 10px;
        line-height: 16px;
      }
    }
  }
}

</style>