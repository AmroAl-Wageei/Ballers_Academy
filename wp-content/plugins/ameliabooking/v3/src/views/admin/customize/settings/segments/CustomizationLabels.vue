<template>
  <div class="am-cs-labels">
    <AmCollapse>
      <!-- Primary & state -->
      <AmCollapseItem
        v-for="(labelObj, index) in amTranslations[pageRenderKey][stepKey]"
        :key="index"
        borderless
        :side="true"
        :class="getLicenceClass(stepKey + '__' + index)"
      >
        <template #heading>
          <div class="am-cs-labels__heading">
            {{ labelObj.name }}
          </div>
        </template>
        <template #default>
          <div class="am-cs-labels__holder">
            <div
              v-for="label in Object.getOwnPropertyNames(labelObj.labels)"
              :key="label"
              class="am-cs-labels__item"
              :class="getLicenceLabelsClass(stepKey, label)"
            >
              <div class="am-cs-labels__item-heading">
                <span>{{amLabels[label]}}</span>
              <!-- TODO - after update check for better solution, add new strings for labels (placeholder, mandatory notice) on other steps-->
                <span v-if="stepName === 'infoStep'">
                  {{amLabels[label].startsWith('Enter') ? '(placeholder)': amLabels[label].startsWith('Please enter') ? '(mandatory notice)':''}}
                </span>
              </div>
              <div class="am-cs-labels__item-content">
                <div
                  v-for="lang in Object.getOwnPropertyNames(labelObj.labels[label])"
                  :key="lang"
                  class="am-cs-labels__item-content__inner"
                  :class="getLicenceLabelsClass(stepKey, label)"
                >
                  <div class="am-cs-labels__item-lang">
                    <img
                      v-if="amLanguages[lang]"
                      :src="`${baseUrls.wpAmeliaPluginURL}v3/src/assets/img/flags/${amLanguages[lang].country_code}.png`"
                      :alt="languageFullName(lang)"
                    >
                    <span>
                      {{languageFullName(lang)}}
                    </span>
                  </div>
                  <div class="am-cs-labels__item-input">
                    <AmInput
                      v-model="labelObj.labels[label][lang]"
                      size="small"
                      @input="updateLabelObject"
                    ></AmInput>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </AmCollapseItem>
    </AmCollapse>
  </div>
</template>

<script setup>
import AmCollapse from '../../../../_components/collapse/AmCollapse.vue'
import AmCollapseItem from '../../../../_components/collapse/AmCollapseItem.vue'
import AmInput from '../../../../_components/input/AmInput.vue'
import { inject, ref } from "vue";
import {getLicenceClass, getLicenceLabelsClass} from "../../../../../assets/js/common/licence";

let { goBackPath, parentPath } = inject('sidebarFunctionality', {
  goBackPath: ref('menu')
})

goBackPath.value = parentPath.value

const baseUrls = inject('baseUrls')
let stepName = inject('stepName')
let subStepName = inject('subStepName')
let pageRenderKey = inject('pageRenderKey')
let amLanguages = inject('languages')
let amLabels = inject('labels')
let amTranslations = inject('translations')

let stepKey = ref('')
if (subStepName.value) {
  stepKey.value = subStepName.value
} else if (parentPath.value === 'sidebar') {
  stepKey.value = 'sidebar'
} else {
  stepKey.value = stepName.value
}

function languageFullName (lang) {
  return lang !== 'default' ? amLanguages[lang].name : amLabels.default_label
}

let updateLabelObject = inject('updateLabelObject')
</script>

<script>
export default {
  name: "CustomizationLabels"
}
</script>

<style lang="scss">
// am - amelia
// cs - customize sidebar
@mixin am-cs-labels-block {
  .am-cs-labels {
    &__heading {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      img {
        margin-right: 8px;
      }
    }

    &__holder {
      width: 100%;
    }

    &__item {
      max-width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      &-heading {
        width: 100%;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.42857;
        color: $shade-900;
        margin-bottom: 4px;

        span:nth-of-type(2) {
          color: $shade-400;
        }

        span:nth-of-type(1) {
          margin-right: 4px;
        }
      }

      &-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        border: 1px solid $shade-200;
        border-radius: 4px;
        padding: 12px;

        &__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      &-lang {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        img {
          margin-right: 8px;
        }

        span {
          font-size: 14px;
          font-weight: 400;
          line-height: 1.714285;
          color: $shade-900;
        }
      }

      &-input {
        max-width: 170px;
        width: 100%;
      }
    }

    .am-collapse {
      &-item {
        margin: 0;

        $count: 30;
        @for $i from 0 through $count {
          &:nth-child(#{$i + 1}) {
            animation: 400ms cubic-bezier(.45,1,.4,1.2) #{$i*100}ms am-animation-slide-up;
            animation-fill-mode: both;
          }
        }

        &__heading {
          font-size: 15px;
          font-weight: 400;
          font-style: normal;
          line-height: 1.6;
          color: $shade-900;
          padding: 12px 16px;
          border-radius: 0;
          transition: all 300ms ease-in-out;

          &:hover:not(&-active) {
            background-color: $blue-400;
          }

          &-active {
            color: $blue-900;

            .am-icon-arrow-down {
              position: relative;
              color: $blue-900;

              &:after {
                content: '';
                display: block;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: fade-out($blue-900, 0.9);
              }
            }
          }
        }

        &__trigger {
          padding: 0;
        }

        &__content {
          background-color: $shade-100;
          box-shadow: 0 1px 4px fade-out($am-black, 0.97), inset 0 -1px 4px fade-out($am-black, 0.97);
        }
      }
    }
  }
}

// public
.amelia-v2-booking #amelia-container {
  @include am-cs-labels-block;
}

// admin
#amelia-app-backend-new {
  @include am-cs-labels-block;
}
</style>
