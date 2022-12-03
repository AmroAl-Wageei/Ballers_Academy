<template>

  <!-- Date Picker -->
  <div class="am-date-picker-wrapper">
    <el-date-picker
      v-bind="$props"
      :id="id"
      ref="amDatePicker"
      v-model="model"
      type="date"
      :prefix-icon="prefixIcon"
      :popper-class="popperClass"
      :placeholder="placeholder"
      :clear-icon="clearIcon"
      clearable
      :disabled-date="disabledDate"
      class="am-date-picker"
      :class="[`am-date-picker--${size}`, {'am-date-picker--disabled': disabled}]"
      @input="(eventValue) => $emit('input', eventValue)"
      @change="(eventValue) => $emit('change', eventValue)"
      @blur="(e) => $emit('blur', e)"
      @focus="(e) => $emit('focus', e)"
    >
      <slot/>
    </el-date-picker>
  </div>
  <!-- /Date Picker -->

</template>

<script setup>
import AmeliaIconClose from "../icons/IconClose";
import AmeliaIconCalendar from "../icons/IconCalendar";
import {computed, ref, toRefs} from "vue";

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
  disabled: {
    type: Boolean,
    default: false
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
  name: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select Date'
  },
  popperClass: {
     type: String,
     default: ''
  },
  teleported: {
    type: Boolean,
    default: true
  },
  clearIcon: {
    type: [String, Object],
    default: AmeliaIconClose
  },
  prefixIcon: {
    type: [String, Object],
    default: AmeliaIconCalendar
  },
  disabledDate: {
    type: Function,
    default: () => {}
  },
})

/**
 * Component Emits
 * */
const emits = defineEmits(['change', 'input', 'visible-change', 'remove-tag', 'clear', 'blur', 'focus', 'update:modelValue'])

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
const amDatePicker = ref(null)

let cssVars = computed(() => {
  return {}
})
</script>

<style lang="scss">
@mixin am-datepicker-block {

  // Date Picker Wrapper
  .am-date-picker-wrapper {
    text-align: center;
    flex: 1;

    &:last-child {
      border-right: none;
    }

    .el-input {
      width: 100%;
      .el-input__inner {
        outline: none;
        border-radius: 6px;
        background: var(--am-c-inp-bgr);
        border-color: var(--am-c-inp-border);
        color: var(--am-c-inp-text);
        padding-left: 31px !important;

        &:focus {
          border-color: var(--am-c-btn-prim);
        }

        &::-webkit-input-placeholder {
          color: var(--am-c-inp-placeholder);
        }
      }

      // Size - default / medium / small / mini / micro
      &--default .el-input__inner {
        height: 40px;
      }
      &--medium .el-input__inner {
        height: 36px;
      }
      &--small .el-input__inner {
        height: 32px;
      }

      &__prefix {
        left: 10px;
        line-height: 32px;

        &-inner {
          display: flex;
          align-items: center;

          .am-icon-calendar {
            font-size: 24px;
          }
        }

        .el-icon {
          ::before {
            color: var(--am-c-inp-placeholder);
          }
        }
      }

      &__suffix {
        &-inner {
          display: flex;
          align-items: center;
        }
      }
    }

  }
}

.el-picker-panel {
  &__icon-btn:hover {
    background: transparent;
    color: var(--am-c-btn-prim)
  }

  &__content {
    table, table td, table tr, table tr:is(.el-date-table__row) {
      border: none !important;
    }
    table tr:not(.el-date-table__row) th {
      border: none !important;
      border-bottom: 1px solid #ebeef5 !important;
    }
    table {
      td.today .el-date-table-cell__text {
        color: var(--am-c-btn-prim);
        &:hover {
          color: white;
        }
      }
      td.current:not(.disabled) .el-date-table-cell__text {
        background: var(--am-c-btn-prim);
      }
      td.available:hover > div > span {
        background: var(--am-c-btn-prim);
        border-radius: 50%;
        color: white;
      }
    }
  }
}

.el-date-picker__header {
  text-align: center;
  margin: 12px;

  .el-picker-panel__icon-btn {
    padding: 0;
  }

  .el-date-picker {
    padding: 0;
    font-size: 12px;
    color: #303133;
    cursor: pointer;
    margin-top: 8px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    background: transparent;
    outline: none;

    &__prev-btn {
      float: left;
    }

    &__next-btn {
      float: right;
    }
    &__prev-btn:focus, &__next-btn:focus {
      background: transparent;
      outline: none;
    }
  }
  &-label:hover {
    color: var(--am-c-btn-prim);
  }
}

// public
.amelia-v2-booking #amelia-container {
  @include am-datepicker-block;
}

// admin
#amelia-app-backend-new #amelia-container {
  @include am-datepicker-block;
}
</style>