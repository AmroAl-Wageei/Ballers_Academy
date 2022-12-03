<template>
  <div>

    <div class="am-dialog-scrollable">

      <!-- Dialog Header -->
      <div class="am-dialog-header">
        <el-row>
          <el-col :span="14">
            <h2>{{ $root.labels.export }}</h2>
          </el-col>
          <el-col :span="10" class="align-right">
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
          </el-col>
        </el-row>
      </div>

      <BlockLite/>

      <!-- Form -->
      <el-form label-position="top" :class="{'am-lite-container-disabled': $root.isLite}">

        <!-- CSV Delimiters -->
        <el-form-item :label="$root.labels.csv_delimiter + ':'">
          <el-select :placeholder="$root.labels.csv_delimiter" v-model="delimiter" @change="changeFields">
            <el-option
                v-for="item in delimiters"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="hasSeparateBookingOption" :label="$root.labels['select_rows_settings' + (action === $root.getAjaxUrl + '/report/event/attendees' ? '_event' : '')] + ':'">
          <el-select :placeholder="$root.labels.exported_same_row" v-model="separateBookings" @change="changeFields">
            <el-option
                :label="this.$root.labels['exported_same_row' + (action === $root.getAjaxUrl + '/report/event/attendees' ? '_event' : '')]"
                :value="false">
            </el-option>
            <el-option
                :label="this.$root.labels['exported_separate_rows' + (action === $root.getAjaxUrl + '/report/event/attendees' ? '_event' : '')]"
                :value="true">
            </el-option>
          </el-select>
        </el-form-item>

        <!-- Export Columns -->
        <template v-for="field in data.fields">
          <el-checkbox v-model="field.checked" checked :label="field.label" border @change="changeFields"></el-checkbox>
        </template>
      </el-form>

    </div>

    <!-- Dialog Footer -->
    <div class="am-dialog-footer" :class="{'am-lite-container-disabled': $root.isLite}">
      <div class="am-dialog-footer-actions">
        <el-row>
          <el-col :sm="24" class="align-right">
            <el-button
                type=""
                @click="closeDialog"
                class=""
            >
              {{ $root.labels.cancel }}
            </el-button>
            <el-button
                type="primary"
                class="am-dialog-create"
                @click="closeDialog"
                native-type='submit'
            >
              {{ $root.labels.export }}
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>

  </div>
</template>

<script>
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import dateMixin from '../../../js/common/mixins/dateMixin'

  export default {

    mixins: [imageMixin, dateMixin],

    props: {
      data: null,
      action: null
    },

    data () {
      return {
        delimiter: ',',
        delimiters: [
          {
            label: this.$root.labels.csv_delimiter_comma,
            value: ','
          },
          {
            label: this.$root.labels.csv_delimiter_semicolon,
            value: ';'
          }
        ],
        separateBookings: false,
        hasSeparateBookingOption: false
      }
    },

    updated: function () {},

    mounted: function () {},

    methods: {
      changeFields: function () {},

      closeDialog: function () {
        this.$emit('closeDialogExport')
      },

      getAction: function () {}
    },

    components: {}
  }
</script>
