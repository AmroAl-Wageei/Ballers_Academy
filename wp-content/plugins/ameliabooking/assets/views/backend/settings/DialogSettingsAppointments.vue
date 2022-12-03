<template>
    <div>
        <div class="am-dialog-scrollable">

            <!-- Dialog Header -->
            <div class="am-dialog-header">
                <el-row>
                    <el-col :span="20">
                        <h2>{{ $root.labels.appointments_settings }}</h2>
                    </el-col>
                    <el-col :span="4" class="align-right">
                        <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
                    </el-col>
                </el-row>
            </div>

            <BlockLite/>

            <!-- Form -->
            <el-form :model="settings" ref="settings" label-position="top" @submit.prevent="onSubmit" :class="{'am-lite-container-disabled': $root.isLite}">

                <!-- Allow booking if status is pending -->
                <div class="am-setting-box am-switch-box">
                    <el-row type="flex" align="middle" :gutter="24">
                        <el-col :span="16">
                            {{ $root.labels.allow_booking_if_pending }}:
                            <el-tooltip placement="top">
                                <div slot="content" v-html="$root.labels.allow_booking_if_pending_tooltip"></div>
                                <i class="el-icon-question am-tooltip-icon"></i>
                            </el-tooltip>
                        </el-col>
                        <el-col :span="8" class="align-right">
                            <el-switch
                                v-model="settings.allowBookingIfPending"
                                active-text=""
                                inactive-text=""
                            ></el-switch>
                        </el-col>
                    </el-row>
                </div>

                <!-- Allow customers to book if the minimum isn’t reached -->
                <div class="am-setting-box am-switch-box">
                    <el-row type="flex" align="middle" :gutter="24">
                        <el-col :span="16">
                            {{ $root.labels.allow_booking_if_not_min }}:
                            <el-tooltip placement="top">
                                <div slot="content" v-html="$root.labels.allow_booking_if_not_min_tooltip"></div>
                                <i class="el-icon-question am-tooltip-icon"></i>
                            </el-tooltip>
                        </el-col>
                        <el-col :span="8" class="align-right">
                            <el-switch
                                v-model="settings.allowBookingIfNotMin"
                                active-text=""
                                inactive-text=""
                            ></el-switch>
                        </el-col>
                    </el-row>
                </div>

            </el-form>
        </div>

        <!-- Dialog Footer -->
        <div class="am-dialog-footer">
            <div class="am-dialog-footer-actions">
                <el-row>
                    <el-col :sm="24" class="align-right">
                        <el-button type="" @click="closeDialog" class="">{{ $root.labels.cancel }}</el-button>
                        <el-button type="primary" @click="onSubmit" class="am-dialog-create" :disabled="$root.isLite">{{ $root.labels.save }}</el-button>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script>
  import imageMixin from '../../../js/common/mixins/imageMixin'

  export default {

    mixins: [imageMixin],

    props: ['appointments'],

    data () {
      return {
        settings: Object.assign({}, this.appointments)
      }
    },

    updated () {
      this.inlineSVG()
    },

    mounted () {
      this.inlineSVG()
    },

    methods: {

      closeDialog () {
        this.$emit('closeDialogSettingsAppointments')
      },

      onSubmit: function () {
        this.$emit('closeDialogSettingsAppointments')
      }

    }
  }
</script>
