import moment from 'moment'

export default {

  data () {
    return {
      recurringDates: []
    }
  },

  methods: {
    getRecurringAppointmentsData: function () {
      return []
    },

    toggleRecurringActive: function () {},

    setCycleScreen: function () {},

    getDefaultRecurringSettings: function () {
      return {}
    },

    getAvailableRecurringDates: function () {
      return []
    },

    getRepeatIntervalLabels: function () {
      return []
    }
  }

}
