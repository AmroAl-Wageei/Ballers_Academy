<template>

  <!-- Custom Duration -->
  <div class="am-service-custom-duration">

    <div>
      <el-row :gutter="24" class="zero-margin-bottom">
        <el-col :span="10">
          <span>{{$root.labels.duration + ':'}}</span>
        </el-col>
        <el-col :span="10">
          <span>{{$root.labels.price + ':'}}</span>
        </el-col>
        <el-col :span="4">
        </el-col>
      </el-row>
      <el-row
        :gutter="24"
        type="flex"
        v-for="(item, index) in service.customPricing.durations"
        :key="index"
        class="small-margin-bottom am-service-custom-duration-item"
      >
        <el-col :span="10" style="margin-bottom: 7px;">
          <el-select
            v-model="item.duration"
            placeholder=""
            @change="setCustomDurations"
            :disabled="!enabledDuration"
          >
            <el-option
              v-for="item in getPossibleCustomDurations(item.duration)"
              :key="item"
              :label="secondsToNiceDuration(item)"
              :disabled="isDurationSelected(item)"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="10" style="margin-bottom: 7px;">
          <money
            v-model="item.price"
            v-bind="moneyComponentData"
            class="el-input el-input__inner"
          >
          </money>
        </el-col>
        <el-col :span="4" style="margin-bottom: 7px;">
          <span @click="deleteCustomDuration(index)" v-if="enabledDelete">
            <img class="svg-amelia" width="16px" :src="$root.getUrl + 'public/img/delete.svg'">
          </span>
        </el-col>
      </el-row>
      <el-row :gutter="24" v-if="enabledAdd">
        <el-col>
          <el-button
            @click="addDuration()"
            :disabled="addDurationBtnDisabled()"
            size="large"
            type="primary"
            class="am-dialog-create"
          >
            <span class="button-text">{{ $root.labels.add_duration }}</span>
          </el-button>
        </el-col>
      </el-row>
    </div>

  </div>
  <!-- /Custom Duration -->

</template>

<script>
import priceMixin from '../../../js/common/mixins/priceMixin'
import durationMixin from '../../../js/common/mixins/durationMixin'
import { Money } from 'v-money'

export default {

  mixins: [
    priceMixin,
    durationMixin
  ],

  name: 'CustomDuration',

  props: {
    service: {},
    enabledDelete: true,
    enabledAdd: true,
    enabledDuration: true
  },

  data () {
    return {
    }
  },

  methods: {
    getPossibleCustomDurations (customDuration) {
      let durations = this.getPossibleDurationsInSeconds(this.service.duration, 86400)

      if (customDuration && durations.indexOf(customDuration) === -1) {
        durations.push(customDuration)
        durations.sort(function (a, b) { return a - b })
      }

      return durations
    },

    setCustomDurations (value) {
      if (value === '') {
        this.service.customPricing.durations.push({duration: '', price: 0, rules: []})
      }
    },

    isDurationSelected (duration) {
      return this.service.customPricing.durations.filter(i => parseInt(i.duration) === parseInt(duration)).length > 0 || duration === this.service.duration
    },

    addDurationBtnDisabled () {
      return this.service.customPricing.durations.filter(i => !i.duration).length > 0
    },

    addDuration () {
      this.setCustomDurations('')
    },

    deleteCustomDuration (index) {
      this.service.customPricing.durations.splice(index, 1)

      if (!this.service.customPricing.durations.length) {
        this.service.customPricing.enabled = false
      }
    }
  },

  mounted () {
    if (!this.service.customPricing.durations.length) {
      this.addDuration()
    }

    this.service.customPricing.durations = this.service.customPricing.durations.sort(
      (a, b) => a.duration ? a.duration - b.duration : true
    )
  },

  components: {
    Money
  }
}
</script>
