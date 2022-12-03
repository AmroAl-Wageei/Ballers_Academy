<template>
    <div class="am-lite am-lite-block" v-if="$root.isLite">
        <img :src="$root.getUrl + 'public/img/icon-upgrade-pro-small@2x.png'" class="am-lite-block-icon">

        <div>
            <p class="am-lite-block-text">{{messageText}}</p>
            <p class="am-lite-block-text" v-if="!isActivation">Upgrade today to maximize your experience!</p>
            <p class="am-lite-block-text" v-if="isActivation">Follow this <a href="https://wpamelia.com/lite-upgrade/" target="_blank">link</a> for upgrade instructions.</p>
        </div>

        <el-button type="primary" size="medium" @click="$root.dialogLite = true" class="am-lite-block-button">Upgrade</el-button>
    </div>
</template>

<script>
  export default {
    props: {
      message: null,
      isActivation: false
    },

    data () {
      return {
        messageText: 'This is a feature available in the full version.'
      }
    },

    mounted () {
      if (typeof this.message !== 'undefined' && this.message) {
        this.messageText = this.message
      }
    },

    methods: {
    }
  }
</script>
