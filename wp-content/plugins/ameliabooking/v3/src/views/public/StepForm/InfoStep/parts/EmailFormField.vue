<template>
  <!-- Email -->
  <el-form-item
    v-if="amCustomize.infoStep.options.email.visibility"
    ref="primeFieldRef"
    class="am-fs__info-form__item"
    prop="email"
    label-position="top"
  >
    <template #label>
      <span class="am-fs__info-form__label">
        {{ amLabels.email_colon }}
      </span>
    </template>
    <AmInput
      v-model="infoFormData.email"
      name="email"
      type="text"
      :placeholder="amLabels.enter_email"
    ></AmInput>
  </el-form-item>
  <!-- /Email -->
</template>

<script setup>
import AmInput from'../../../../_components/input/AmInput.vue'

import {inject, ref} from "vue";

let primeFieldRef = ref(null)

// * Labels
let amLabels = inject('amLabels')

// * Customize
let amCustomize = inject('amCustomize')

// * Form field data
let infoFormData = inject('infoFormData')

defineExpose({
  primeFieldRef
})
</script>

<script>
export default {
  name: "EmailFormField"
}
</script>
