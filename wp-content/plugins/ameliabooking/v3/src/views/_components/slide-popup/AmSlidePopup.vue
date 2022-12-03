<template>
  <transition duration="550" name="nested">
    <div v-show="visibility" class="am-slide-popup__up">
      <div class="am-slide-popup__up-inner" :class="{'am-slide-popup__up-inner-mobile': checkScreen}">
        <slot></slot>
        <div class="am-slide-popup__up-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import {inject, computed} from 'vue';
defineProps({
  visibility: {
    type: Boolean,
    default: false,
    required: true
  }
})
// Container Width
let cWidth = inject('containerWidth', 0)
let checkScreen = computed(() => cWidth.value < 460 || (cWidth.value > 560 && cWidth.value - 240 < 460))
</script>

<style lang="scss">
@mixin am-slide-popup {
  .am-slide-popup {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
  }
  .am-slide-popup__up {
    $classP: '.am-slide-popup__up';
    @extend .am-slide-popup;
    height: 100%;
    padding: 0;
    background: rgba(4, 8, 11, 0.3);
    z-index: 1000;

    &-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .am-button--secondary {
        margin: 0 8px 0 0;
      }

      .am-fs__ps-popup__btn-mobile {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
    }

    &-inner {
      @extend .am-slide-popup;
      top: auto;
      bottom: 0;
      min-height: 100px;
      background: var(--am-c-main-bgr);
      padding: 16px 32px;

      &-mobile {
        padding: 16px;

        .am-fs__ps-popup__btn-mobile {
          height: auto;
          width: 100%;
          flex-direction: column;
          gap: 8px;
          white-space: break-spaces;
        }
      }
    }

    &.nested-enter-active, &.nested-leave-active {
      transition: all 0.3s ease-in-out;

      #{$classP}-inner {
        transition: all 0.3s ease-in-out;
      }
    }

    &.nested-enter-from, &.nested-leave-to {
      transform: translateY(30px);
      opacity: 0;

      #{$classP}-inner {
        transform: translateY(30px);
        /*
          Hack around a Chrome 96 bug in handling nested opacity transitions.
          This is not needed in other browsers or Chrome 99+ where the bug
          has been fixed.
        */
        opacity: 0.001;
      }
    }

    /* delay leave of parent element */
    &.nested-leave-active {
      transition-delay: 0.25s;
    }

    /* delay enter of nested element */
    &.nested-enter-active {
      #{$classP}-inner {
        transition-delay: 0.25s;
      }
    }
  }
}

// public
.amelia-v2-booking #amelia-container {
  @include am-slide-popup;
}

// admin
#amelia-app-backend-new {
  @include am-slide-popup;
}
</style>