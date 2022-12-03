<template>
  <div class="am-cs-menu">
    <div class="am-cs-menu__inner">
      <div class="am-cs-menu__inner-header">
        <span class="am-icon-settings"></span>
        {{amLabels.settings}}
      </div>
      <AmSettingsCard
        :header="amLabels.cb_global_settings_heading"
        :content="amLabels.csb_global_settings_content"
        @click="handleClick('global')"
      ></AmSettingsCard>
    </div>
    <div class="am-cs-menu__inner">
      <div class="am-cs-menu__inner-header">
        <span class="am-icon-box"></span>
        {{amLabels.cb_section}}
      </div>
      <AmSettingsCard
        :header="amLabels.cb_sidebar"
        :content="amLabels.csb_sidebar_content"
        @click="handleClick('sidebar')"
      ></AmSettingsCard>
    </div>
    <div class="am-cs-menu__inner">
      <div class="am-cs-menu__inner-header">
        <span class="am-icon-steps"></span>
        {{amLabels.steps}}
      </div>
      <AmSettingsCard
        v-for="card in settingsCardArray"
        :key="card.heading"
        class="am-cs-menu__card"
        :class="getLicenceClass(card.trigger)"
        :header="card.heading"
        :content="card.content"
        @click="handleClick(card.trigger, card.index)"
      ></AmSettingsCard>
    </div>
  </div>
</template>

<script setup>
import AmSettingsCard from "../../../../_components/settings-card/AmSettingsCard";
import { computed, inject } from 'vue';
import {getLicenceClass} from "../../../../../assets/js/common/licence";

let { handleClick, parentPath } = inject('sidebarFunctionality')
parentPath.value = 'menu'

// * Labels
let amLabels = inject('labels')

let serviceAppointmentArray = [
  {
    heading: amLabels.services,
    content: amLabels.csb_services_content,
    trigger: 'services',
    index: 0,
  },
  {
    heading: amLabels.extras,
    content: amLabels.csb_extras_content,
    trigger: 'extras',
    index: 1
  },
  {
    heading: amLabels.date_time,
    content: amLabels.csb_date_time_content,
    trigger: 'dateAndTime',
    index: 2
  },
  {
    heading: amLabels.recurring,
    content: amLabels.csb_recurring_content,
    trigger: 'recurring',
    index: 3
  },
  {
    heading: amLabels.recurring_summary,
    content: amLabels.csb_layout_labels_content,
    trigger: 'recurringSummary',
    index: 4
  },
  {
    heading: amLabels.info_step,
    content: amLabels.csb_your_info_content,
    trigger: 'info',
    index: 5
  },
  {
    heading: amLabels.payment,
    content: amLabels.csb_layout_labels_content,
    trigger: 'payment',
    index: 6
  },
  {
    heading: amLabels.cb_congratulations_heading,
    content: amLabels.csb_layout_labels_content,
    trigger: 'congrats',
    index: 7
  }
]

let packagesAppointmentArray = [
  {
    heading: amLabels.package,
    content: amLabels.cpb_service_appointment,
    trigger: 'packages',
    index: 0
  },
  {
    heading: amLabels.package_info_step,
    content: amLabels.cpb_service_appointment,
    trigger: 'packageInfo',
    index: 1
  },
  {
    heading: amLabels.cpb_package_appointments_heading,
    content: amLabels.cpb_service_appointment,
    trigger: 'packageAppointments',
    index: 2
  },
  {
    heading: amLabels.cpb_package_list_heading,
    content: amLabels.cpb_service_appointment,
    trigger: 'packageAppointmentsList',
    index: 3
  },
  {
    heading: amLabels.info_step,
    content: amLabels.cpb_your_info_content,
    trigger: 'info',
    index: 4
  },
  {
    heading: amLabels.payment,
    content: amLabels.cpb_payment_content,
    trigger: 'payment',
    index: 5
  },
  {
    heading: amLabels.cb_congratulations_heading,
    content: amLabels.cpb_congratulations_content,
    trigger: 'congrats',
    index: 6
  }
]

let bookableType = inject('bookableType')

let settingsCardArray = computed(() => {
  if (bookableType.value === 'package') {
    return packagesAppointmentArray
  }

  return serviceAppointmentArray
})
</script>

<script>
export default {
  name: "CustomizationMenu"
}
</script>

<style lang="scss">
@mixin am-cs-menu-block {
  // am - amelia
  // cs - customize settings
  .am-cs-menu {
    &__inner {
      position: relative;
      padding: 16px;
      border-bottom: 1px solid $shade-250;

      &:last-child {
        border-bottom: none;
      }

      &-header {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-style: normal;
        font-weight: 500;
        line-height: 1.55555;
        color: $shade-800;
        margin-bottom: 16px;

        span {
          font-size: 24px;
          margin-right: 8px;
        }
      }
    }

    &__card {
      margin-bottom: 8px;

      $count: 30;
      @for $i from 0 through $count {
        &:nth-child(#{$i + 1}) {
          animation: 400ms cubic-bezier(.45,1,.4,1.2) #{$i*70}ms am-animation-slide-up;
          animation-fill-mode: both;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// admin
#amelia-app-backend-new {
  @include am-cs-menu-block;
}
</style>
