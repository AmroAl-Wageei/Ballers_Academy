<template>
  <div class="am-input-wrapper">
    <el-input
      :id="id"
      ref="amInput"
      v-model="model"
      :type="type"
      :clearable="clearable"
      :suffix-icon="iconEnd"
      :prefix-icon="iconStart"
      :class="[
        type !== 'text' ? 'am-textarea textarea' : 'am-input',
        size ? (type === 'text-area' ? 'am-textarea__size' : 'am-input') + '__' + size : '',
        {'is-icon-start': iconStart},
        {'is-icon-end': iconEnd}
        ]"
      :style="cssVars"
      :disabled="disabled"
      :controls="controls"
      :controls-position="controlsPosition"
      :name="name"
      :label="label"
      :rows="rows"
      :placeholder="placeholder"
      :readonly="readOnly"
      @blur="(e) => $emit('blur', e)"
      @focus="(e) => $emit('focus', e)"
      @change="(currentValue, oldValue) => $emit('change', currentValue, oldValue)"
      @input="(currentValue, oldValue) => $emit('input', currentValue, oldValue)"
    >
    </el-input>
  </div>
</template>

<script setup>
import { computed, ref, toRefs } from 'vue';

/**
 * Component Props
 */
const props = defineProps({
  id: {
    type: String
  },
  modelValue: {
    type: String
  },
  type: {
    type: String,
    default: 'text'
  },
  size: {
    type: String,
    default: 'default',
    validator(value) {
      return ['default', 'medium', 'small'].includes(value)
    }
  },
  disabled: {
    type: Boolean,
    default: false
  },
  controls: {
    type: Boolean,
    default: true
  },
  controlsPosition: {
    // right
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 3
  },
  iconStart: {
    type: [String, Object],
    default: ''
  },
  iconEnd: {
    type: [String, Object],
    default: ''
  },
  clearable: {
    type: Boolean,
    default: false
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

/**
 * Component Emits
 * */
const emits = defineEmits(['change', 'input', 'visible-change', 'clear', 'blur', 'focus', 'update:modelValue'])

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

function cssVars () {
  return {}
}

/**
 * Component reference
 */
const amInput = ref(null)
</script>

<style lang="scss">
@mixin am-input-block {
  // Input Wrapper
  .am-input-wrapper {
    --am-input-c-bgr: var(--am-c-inp-bgr);
    --am-input-c-border: var(--am-c-inp-border);
    --am-input-c-text: var(--am-c-inp-text);
    --am-input-c-placeholder: var(--am-c-inp-placeholder);
    --am-input-border-radius: var(--am-input-border-radius);
    --am-input-font-size: var(--am-input-font-size);
    --am-input-color-border: var(--am-c-inp-border);
    --am-input-padding: 8px 12px;
    width: 100%;
    position: relative;

    // Input & Textarea
    .am-input, .am-textarea {
      width: 100%;
      box-sizing: border-box;
      min-width: 100%;
      max-width: 100%;

      .el-input__inner {
        &:not([type='text-area']) {
          width: 100%;
          height: var(--am-input-height);
          font-size: var(--am-input-font-size);
          border: 1px solid var(--am-input-c-border);
          color: var(--am-input-c-text);
          background-color: var(--am-input-c-bgr);
          border-radius: 6px;
          padding: var(--am-input-padding);
        }

        &:focus {
          --am-input-c-border: var(--am-c-btn-prim);
        }

        // Placeholder
        &::-webkit-input-placeholder {
          color: var(--am-c-inp-placeholder);
        }
        &:-ms-input-placeholder {
          color: var(--am-c-inp-placeholder);
        }
        &::placeholder {
          color: var(--am-c-inp-placeholder);
        }
      }

      .el-textarea__inner {
        color: var(--am-c-inp-text);

        &:focus {
          background-color: var(--am-input-c-bgr);
        }

      }

      &__default{
        --am-input-height: 40px;
        --am-input-padding: 8px 12px;

        input {
          line-height: 40px;
        }

        // Icon
        &.is-icon-start {
          --am-input-padding: 8px 12px 8px 41px;
        }

        &.is-icon-end {
          --am-input-padding: 8px 41px 8px 12px;
        }

        &.is-icon-start.is-icon-end {
          --am-input-padding: 8px 41px;
        }

        &.is-icon-start, &.is-icon-end {
          i {
            font-size: 24px;
            color: var(--am-c-inp-text);
          }
        }
      }

      &__medium {
        --am-input-height: 36px;
        --am-input-padding: 6px 10px;

        input {
          height: 36px;
          line-height: 36px;
        }

        // Icon
        &.is-icon-start {
          --am-input-padding: 6px 10px 6px 34px;
        }

        &.is-icon-end {
          --am-input-padding: 6px 34px 6px 10px;
        }

        &.is-icon-start.is-icon-end {
          --am-input-padding: 8px 34px;
        }

        &.is-icon-start, &.is-icon-end {
          i {
            font-size: 24px;
            color: var(--am-c-inp-text);
          }
        }
      }

      &__small {
        --am-input-height: 32px;
        --am-input-padding: 4px 8px;

        input {
          height: 32px;
          line-height: 32px;
          font-size: 15px;
        }

        // Icon
        &.is-icon-start {
          --am-input-padding: 4px 8px 4px 34px;
        }

        &.is-icon-end {
          --am-input-padding: 4px 34px 4px 8px;
        }

        &.is-icon-start.is-icon-end {
          --am-input-padding: 4px 34px;
        }

        &.is-icon-start, &.is-icon-end {
          i {
            font-size: 24px;
            color: var(--am-c-inp-text);
          }
        }
      }

      // Native Input & Native Textarea
      input, textarea {
        border: 1px solid var(--am-input-color-border);
        background: var(--am-input-c-bgr);
        border-radius: 6px;
        padding: 8px 12px;
        margin: 0;
        font-size: 15px;
        -webkit-transition: box-shadow 0.15s;
        transition: box-shadow 0.15s;

        // Active & Focus
        &:active, &:focus {
          --am-input-color-border: var(--am-c-btn-prim);
          outline: none;
          box-shadow: 0 2px 2px rgba(14, 25, 32, 0.03);
          padding: 8px 12px;
        }

        // Placeholder
        &::-webkit-input-placeholder, &:-ms-input-placeholder, &::placeholder {
          color: #808A90;
        }
      }

      // Disabled
      &.is-disabled {
        input {
          background: #FBFBFB;
          border-color: #D1D5D7;
          box-shadow: none;
          cursor: not-allowed;
          color: #667279;

          // Placeholder
          &::-webkit-input-placeholder, &:-ms-input-placeholder, &::placeholder {
            // TODO
            color: #667279;
          }

          // Hover
          &:hover {
            box-shadow: unset;
          }

          // Active & Focus
          &:active, &:focus {
            border: 1px solid #D1D5D7;
            box-shadow: unset;
          }
        }
      }
    }
  }
}

// public
.amelia-v2-booking #amelia-container {
  @include am-input-block;
}

// admin
#amelia-app-backend-new {
  @include am-input-block;
}
</style>