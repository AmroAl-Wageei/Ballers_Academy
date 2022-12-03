<template>
    <div class="am-lite-popover-content" @click="click" v-if="$root.isLite">
        <img :src="$root.getUrl + 'public/img/icon-upgrade-pro-small.svg'" class="am-lite-popover-icon">

        <span>Please Upgrade to full version ></span>
    </div>
</template>

<script>
  export default {
    data () {
      return {}
    },
    methods: {
      click: function () {
        this.$root.dialogLite = true
      }
    }
  }
</script>
