<template>
  <el-switch
    v-model="model"
    class="am-switch"
    :disabled="disabled"
    :loading="loading"
    :inline-prompt="inlinePrompt"
    :active-icon="activeIcon"
    :inactive-icon="inactiveIcon"
    :active-text="activeText"
    :inactive-text="inactiveText"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :border-color="borderColor"
    :name="name"
    :validate-event="validateEvent"
    :before-change="beforeChange"
    @change="(evt) => emits('change', evt)"
  ></el-switch>
</template>

<script setup>
import { computed } from "vue";

let props = defineProps({
  modelValue: {
    type: Boolean
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    // default/ medium / small
    type: String,
    default: 'default',
    validator(value) {
      return ['default', 'medium', 'small'].includes(value)
    }
  },
  inlinePrompt: {
    type: Boolean,
    default: false
  },
  activeIcon: {
    type: [String, Object]
  },
  inactiveIcon: {
    type: [String, Object]
  },
  activeText: {
    type: String,
    default: ''
  },
  inactiveText: {
    type: String,
    default: ''
  },
  activeValue: {
    type: [Boolean, String, Number],
    default: true
  },
  inactiveValue: {
    type: [Boolean, String, Number],
    default: false
  },
  activeColor: {
    type: String,
    default: '#265CF2'
  },
  inactiveColor: {
    type: String,
    default: '#B3B9BD'
  },
  borderColor: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  validateEvent: {
    type: Boolean,
    default: true
  },
  beforeChange: {
    type: Function
  }
})

/*loading	whether Switch is in loading state	boolean	—	false
size	size of Switch	string	large / default / small	default
width	width of Switch	number	—	40
inline-prompt	whether icon or text is displayed inside dot, only the first character will be rendered for text	boolean	—	false
active-icon	component of the icon displayed when in on state, overrides active-text	string / Component	—	—
inactive-icon	component of the icon displayed when in off state, overrides inactive-text	string / Component	—	—
active-text	text displayed when in on state	string	—	—
inactive-text	text displayed when in off state	string	—	—
active-value	switch value when in on state	boolean / string / number	—	true
inactive-value	switch value when in off state	boolean / string / number	—	false
active-color	background color when in on state	string	—	#409EFF
inactive-color	background color when in off state	string	—	#C0CCDA
border-color	border color of the switch	string	—	—
name	input name of Switch	string	—	—
validate-event	whether to trigger form validation	boolean	—	true
before-change	before-change hook before the switch state changes. If false is returned or a Promise is returned and then is rejected, will stop switching	function	—	—*/

let emits = defineEmits(['change', 'update:modelValue'])

let model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emits('update:modelValue', val)
    return val
  }
})
</script>

<script>
export default {
  name: "AmSwitch"
}
</script>

<style lang="scss">

</style>