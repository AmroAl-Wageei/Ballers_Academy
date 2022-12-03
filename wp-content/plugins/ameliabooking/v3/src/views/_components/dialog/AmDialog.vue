<template>
  <el-dialog
    ref="amDialog"
    v-model="model"
    v-bind="{...$attrs, ...$props}"
    @close="handleClose"
    @open="emits('open')"
    @closed="emits('closed')"
    @opened="emits('opened')"
  >
    <template #title>
      <span v-if="title" class="am-dialog__title">{{ title }}</span>
      <slot v-else name="title" />
    </template>
    <slot />
    <template #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup>
import AmeliaIconClose from '../icons/IconClose.vue'
import {toRefs, computed, ref, onMounted} from "vue";

/**
 * Component Props
 */
const props = defineProps({
  modelValue: {
    type: [String, Array, Object, Number, Boolean],
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '50%'
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  top: {
    type: String,
    default: '15vh'
  },
  modal: {
    type: Boolean,
    default: true
  },
  appendToBody: {
    type: Boolean,
    default: false
  },
  alignCenter: {
    type: Boolean,
    default: false
  },
  lockScroll: {
    type: Boolean,
    default: true
  },
  customClass: {
    type: String,
    default: ''
  },
  openDelay: {
    type: Number,
    default: 0
  },
  closeDelay: {
    type: Number,
    default: 0
  },
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  beforeClose: {
    type: Function
  },
  center: {
    type: Boolean,
    default: false
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  closeIcon: {
    type: [Object, Function],
    default: AmeliaIconClose
  },
  customStyles: {
    type: Object
  }
})

const amDialog = ref(null)

onMounted(() => {
  if (props.customStyles) {
    Object.keys(props.customStyles).forEach(p => {
      amDialog.value.style[p] = props.customStyles[p]
    })
  }
})

/**
 * Component Emits
 * */
const emits = defineEmits(['close', 'open', 'closed', 'opened', 'update:modelValue'])

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
 * Component Event Handlers
 */
const handleClose = () => {
  emits('close')
  emits('update:modelValue', false)
}
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<style lang="scss">

@import 'src/assets/scss/common/quill/quill';


</style>