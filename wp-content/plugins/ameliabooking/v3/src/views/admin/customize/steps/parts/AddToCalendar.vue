<template>
  <div class="am-fs-sb-cs" :style="cssVars">
    <p>{{ calendarString }}</p>
    <div class="am-fs-sb-cs-cals">
      <div v-for="cal in calendars" :key="cal.type" class="am-fs-sb-cs-cals-cards">
        <a
          :style="{borderColor : 'var(--am-c-atc-sb-text-op10)'}"
          class="am-fs-sb-cs-cals-card"
        >
          <div>
            <span :class="`am-icon-${cal.type}`"></span>
          </div>
          <p :style="{color : 'var(--am-c-atc-sb-text)'}">{{ cal.label }}</p>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, inject } from 'vue'
import { useColorTransparency } from '../../../../../assets/js/common/colorManipulation.js'

defineProps({
  calendarString: {
    type: String,
    required: true
  }
})

// * Labels
const amLabels = inject('labels')

let calendars = ref([
  {
    type: 'google',
    label: 'Google'
  },
  {
    type: 'outlook',
    label: 'Outlook'
  },
  {
    type: 'yahoo',
    label: 'Yahoo'
  },
  {
    type: 'apple',
    label: 'Apple'
  }
])

let amColors = inject('amColors')

const cssVars = computed(() => {
  return {
    '--am-c-atc-sb-text-op10': useColorTransparency(amColors.value.colorSbText, 0.1),
    '--am-c-atc-sb-text-op5': useColorTransparency(amColors.value.colorSbText, 0.05)
  }
})
</script>

<script>
export default {
  name: 'AddToCalendar'
}
</script>

<style lang="scss">
#amelia-app-backend-new #amelia-container {
  .am-fs-sb-cs {
    --am-c-atc-sb-text: var(--am-c-sb-text);

    & > p {
      text-align: center;
      font-size: 14px;
      line-height: 1.42857;
      color: var(--am-c-atc-sb-text);
      font-weight: 400;
      margin: 0 0 16px;
    }
    &-cals{
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;

      &-cards {
        display: flex;
        flex-direction: row;
        gap: 8px;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        $count: 4;
        @for $i from 0 through $count {
          &:nth-child(#{$i + 1}) {
            //animation: 600ms cubic-bezier(.45,1,.4,1.2) #{$i*100}ms am-animation-slide-up;
            animation: 600ms cubic-bezier(.45,1,.4,1.2) #{$i*100}ms am-animation-slide-right;
            animation-fill-mode: both;
          }
        }
      }

      &-card {
        background-color: var(--am-c-atc-sb-text-op5);
        border-radius: 4px;
        box-sizing: border-box;
        box-shadow: 0 1px 1px rgba(115, 134, 169, 0.06);
        padding: 16px 0 8px;
        width: 86px;
        border: 1px solid;
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
        justify-content: center;
        color: var(--am-c-atc-sb-text);

        p {
          font-style: normal;
          font-weight: 500;
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }

        div {
          display: flex;
          height: 24px;
          align-items: center;

          span {
            font-size: 24px;
            color: var(--am-c-atc-sb-text);
          }

          .am-icon-yahoo {
            font-size: 17px
          }
        }

        &:hover {
          background-color: var(--am-c-atc-sb-text-op10);
        }
      }
    }
  }
}
</style>