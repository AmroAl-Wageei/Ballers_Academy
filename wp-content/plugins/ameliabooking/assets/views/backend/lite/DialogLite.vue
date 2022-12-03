<template>
  <div v-if="$root.isLite">
    <!-- Dialog Lite -->
    <transition name="slide">
      <el-dialog class="am-side-dialog" :class="{'am-dialog-employee-lite': isEmployeeDialog}"
                 :visible.sync="$root.dialogLite" :show-close="false" v-if="$root.dialogLite">
        <div class="am-dialog-scrollable am-lite-dialog-no-margin">
          <!-- Dialog Header -->
          <div class="am-dialog-header">
            <el-row>
              <el-col :span="24" class="align-right">
                <el-button @click="$root.dialogLite = false" class="am-dialog-close" size="small"
                           icon="el-icon-close"></el-button>
              </el-col>
            </el-row>
          </div>

          <div class="am-lite am-lite-dialog">
            <div v-if="promotionEnabled">
<!--              <img :src="$root.getUrl + 'public/img/illustrations-left.svg'" class="am-lite-dialog-image-illus-left">

              <img :src="$root.getUrl + 'public/img/illustrations-right.svg'" class="am-lite-dialog-image-illus-right">-->

              <div class="am-promo-banner-title">
                <h2>Exclusive offer</h2>
              </div>

              <div class="am-promo-banner-subtitle">
                <p>for Lite users</p>
              </div>

              <div class="am-discounts-holder">
                <div>
                  <p class="discount-number">10% off</p>
                  <p class="licence-name">basic</p>
                </div>
                <div>
                  <p class="discount-number">15% off</p>
                  <p class="licence-name">pro</p>
                </div>
                <div>
                  <p class="discount-number">20% off</p>
                  <p class="licence-name">developer</p>
                </div>
              </div>

              <div type="primary" class="el-button el-button--primary tms-store-checkout-ameliabooking">Upgrade now</div>

              <p class="am-lite-dialog-description">
                Upgrade today to make the appointment booking process even easier and more flexible:
              </p>
            </div>

            <img v-if="!promotionEnabled" :src="$root.getUrl + 'public/img/calendar-illustration-min.png'" class="am-lite-dialog-image">

            <p v-if="!promotionEnabled" class="am-lite-dialog-title">Oops, this is a full version feature!</p>
            <p v-if="!promotionEnabled" class="am-lite-dialog-description">Upgrade today to make the appointment booking process even easier and
              more flexible:</p>

            <a v-if="!promotionEnabled" href="https://wpamelia.com/pricing/" target="_blank"><el-button type="primary">Upgrade</el-button></a>

            <el-row class="am-lite-features">
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Unlimited staff members</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Web Hooks</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Unlimited locations</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   PayPal and Stripe integration</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Multiple shortcodes</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Google Calendar sync</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Service extras</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Outlook Calendar sync</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Package of Services</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   WooCommerce integration</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Recurring Appointments</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Zoom integration</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Facebook Pixel and Google Analytics integration</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Customers and Employee panel</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Premium support</span>
              </el-col>
              <el-col :span="12">
                <i class="am-lite-check"></i><span>   Discount coupons</span>
              </el-col>
              <el-col :span="24" class="am-many-more">
                <span>and many more!</span>
              </el-col>
            </el-row>

            <span class="pre-purchase-q">   Pre-purchase question?
              <a href="https://tmsplugins.ticksy.com/" target="_blank">Contact us!</a>
            </span>
          </div>
        </div>
      </el-dialog>
    </transition>
  </div>
</template>

<script>
  export default {

    props: {
      isEmployeeDialog: false
    },

    data () {
      return {
        promotionEnabled: true
      }
    },

    mounted () {
      let eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'

      let eventer = window[eventMethod]

      let messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'

      // Listen to message from child IFrame window
      eventer(messageEvent, function (e) {
        if (e.data === 'tmsStoreCloseIFrame') {
          document.getElementById('tms-store-iframe').remove()
        }
      }, false)
    },

    methods: {
      upgrade: function () {
        let iframe = document.createElement('iframe')
        iframe.id = 'tms-store-iframe'
        iframe.setAttribute(
          'style',
          'z-index: 9999999999; display: block; background-color: transparent; border: 0px none transparent; overflow-x: hidden; overflow-y: auto; visibility: visible; margin: 0px; padding: 0px; -webkit-tap-highlight-color: transparent; position: fixed; left: 0px; top: 0px; width: 100%; height: 100%;')

        iframe.src = wpAmeliaPluginStoreURL.substring(0, wpAmeliaPluginStoreURL.length - 4) + 'static/pages/ameliabooking.html'
        document.body.appendChild(iframe)
      }
    }
  }
</script>
