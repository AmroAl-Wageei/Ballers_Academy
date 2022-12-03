<template>
  <el-dialog
    v-if="dialogNewCustomize && ($root.settings.role === 'admin' || $root.settings.role === 'manager')"
    class="am-dialog-new-customize"
    :show-close="false"
    :close-on-click-modal="false"
    :append-to-body="true"
    :visible.sync="dialogNewCustomize"
  >
    <template #title>
      <h1>
        {{ $root.labels.customize_dialog_heading }}
      </h1>
    </template>
    <template #default>
      <div class="am-dialog-new-customize__content">
        <div class="am-dialog-new-customize__content-heading">
          {{$root.labels.customize_dialog_sub_heading}}
        </div>
        <div class="am-dialog-new-customize__content-list">
          <div class="am-dialog-new-customize__content-list__item">
            <img :src="$root.getUrl + 'public/img/am-new-bolt.svg'" alt="Faster Pages">
            <span>
              {{$root.labels.customize_dialog_faster}}
            </span>
          </div>
          <div class="am-dialog-new-customize__content-list__item">
            <img :src="$root.getUrl + 'public/img/am-new-customize.svg'" alt="Easy Customization">
            <span>
              {{$root.labels.customize_dialog_easy}}
            </span>
          </div>
          <div class="am-dialog-new-customize__content-list__item">
            <img :src="$root.getUrl + 'public/img/am-new-user.svg'" alt="More User-Friendly Design">
            <span>
              {{$root.labels.customize_dialog_friendly}}
            </span>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="am-dialog-new-customize__footer">
        <el-button type="primary" @click="goToCustomize">
          <template v-if="!customizePage">
            {{$root.labels.customize_dialog_go_to}}
          </template>
          <template v-if="customizePage">
            {{$root.labels.customize_dialog_check}}
          </template>
        </el-button>
        <el-button type="secondary" @click="closeDialog">
          {{$root.labels.customize_dialog_close}}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'DialogNewCustomize',

  props: {
    customizePage: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      dialogNewCustomize: true
    }
  },

  created () {
    if (localStorage.getItem('newCustomizeDialog') !== null) {
      this.dialogNewCustomize = JSON.parse(localStorage.getItem('newCustomizeDialog'))
    }
  },

  methods: {
    goToCustomize () {
      localStorage.setItem('newCustomizeDialog', false)
      window.location.href = 'admin.php?page=wpamelia-customize-new'
    },

    closeDialog () {
      localStorage.setItem('newCustomizeDialog', false)
      this.dialogNewCustomize = false
    }
  }
}
</script>

<style lang="less">
.am-dialog-new-customize {

  &__content {
    &-heading {
      font-family: 'Amelia Roboto', sans-serif;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.6;
      color: #1a2c37;
      word-break: break-word;
      margin: 0 0 16px;
    }

    &-list {
      margin-bottom: 20px;

      &__item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin: 0 0 16px;

        span {
          font-size: 15px;
          font-weight: 600;
          color: #1a2c37;
          margin: 0 0 0 12px;
        }
      }
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;

    .el-button {
      &.el-button--primary {
        width: 100%;
        border-radius: 8px;
        margin-bottom: 8px;

        span {
          font-family: 'Amelia Roboto', sans-serif;
          font-size: 14px;
          font-weight: 500;
        }
      }

      &.el-button--secondary {
        max-width: 100px;
        border-radius: 8px;
        border: none;
        background-color: #ffffff;
        margin: 0;

        span {
          font-family: 'Amelia Roboto', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #1A2C37;
        }
      }
    }
  }

  .el-dialog {
    max-width: 484px;
    width: 100%;
    background-color: #ffffff;
    border-radius: 8px;
    padding: 24px;
    box-sizing: border-box;

    &__header, &__body, &__footer {
      padding: 0;
    }

    &__header {
      h1 {
        font-family: 'Amelia Roboto', sans-serif;
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2857;
        color: #1A2C37;
        margin: 0 0 16px;
      }
    }
  }
}
</style>