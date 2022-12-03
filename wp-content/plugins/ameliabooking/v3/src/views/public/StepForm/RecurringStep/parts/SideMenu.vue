<template>
  <div class="recurringSideMenu" @click.stop>
    <span :ref="el => menuButtonRef[props.position] = el">&#8942;</span>
    <el-popover
      :ref="el => cancelAppointmentRef[props.position] = el"
      :virtual-ref="menuButtonRef[props.position]"
      popper-class="am-fs__delete-appointment"
      trigger="click"
      width="auto"
      :popper-style="cssVars"
      :show-arrow="false"
      placement="bottom-end"
    >
      <div class="am-fs__ro-list-item-dialog-delete" @click="deleteApp()">
        <i class="am-icon-bucket"></i>
        <span>{{ cancelAppointmentLabel }}</span>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, inject } from "vue";
import { useColorTransparency } from '../../../../../assets/js/common/colorManipulation.js'

let props = defineProps({
  position: {
    type: [String, Number],
    default: 0
  },
  cancelLabel: {
    type: String,
    required: true
  }
})

let cancelAppointmentLabel = computed(() => {
  return props.cancelLabel
})

const emits = defineEmits(['click'])

function deleteApp () {
  emits('click')
}

let menuButtonRef = ref([])
let cancelAppointmentRef = ref([])

let amColors = inject('amColors')
let cssVars = computed(() => {
  return {
    '--am-c-rsm-bgr': amColors.value.colorMainBgr,
    '--am-c-rsm-border': amColors.value.colorMainBgr,
    '--am-c-rsm-error-text': amColors.value.colorError,
    '--am-c-rsm-error-text-op10': useColorTransparency(amColors.value.colorError, 0.1),
    '--am-c-rsm-text-op10': useColorTransparency(amColors.value.colorMainText, 0.1)
  }
})
</script>

<script>
export default {
  name: "SideMenu"
}

</script>

<style lang="scss">
@mixin am-side-menu-block {
  .recurringSideMenu {
    cursor: pointer;
    position:relative;
    display: inline-block;
    margin-left: 16px;
  }
}

// public
.amelia-v2-booking #amelia-container {
  @include am-side-menu-block;
}

// admin
#amelia-app-backend-new {
  @include am-side-menu-block;
}

.am-fs__delete-appointment {
  &.el-popover.el-popper {
    min-width: auto;
    background-color: var(--am-c-rsm-bgr);
    border-color: var(--am-c-rsm-border);
    box-shadow: 0 2px 12px 0 var(--am-c-rsm-text-op10);
    padding: 5px;
  }
}
.am-fs__ro-list-item-dialog {
  &-delete {
    display: flex;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    /* $red-900 */
    color: var(--am-c-rsm-error-text);
    cursor: pointer;
    border-radius: 4px;
    padding: 4px;
    transition: all ease-in-out .2s;

    &:hover {
      background-color: var(--am-c-rsm-error-text-op10)
    }

    i {
      font-size: 24px;
    }
    span {
      padding: 0 8px;
    }
  }

}
</style>