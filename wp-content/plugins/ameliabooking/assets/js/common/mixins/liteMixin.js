export default {
  data: () => ({}),

  methods: {
    filterResponseData: function () {
      if (this.options.entities.employees.length) {
        this.options.entities.employees[0].locationId = null

        this.options.entities.employees[0].serviceList.forEach(function (serItem) {
          serItem.maxCapacity = 1
          serItem.minCapacity = 1
          serItem.timeAfter = ''
          serItem.timeBefore = ''
        })
      }
    },

    setInitialEmployee: function (employees) {
      if (!employees.length) {
        this.$http.get(`${this.$root.getAjaxUrl}/users/current`)
          .then(response => {
            let currentUser = null

            if (response.data.data.user) {
              currentUser = {
                'email': response.data.data.user.email,
                'firstName': response.data.data.user.firstName,
                'lastName': response.data.data.user.lastName,
                'phone': response.data.data.user.phone || ''
              }
            } else {
              currentUser = {
                'firstName': 'firstname',
                'lastName': 'lastname',
                'email': 'example@example.com'
              }
            }

            currentUser.type = 'provider'
            currentUser.weekDayList = this.getSettingsSchedule()

            this.form.post(this.$root.getAjaxUrl + '/users/providers', currentUser)
              .then(response => {
                this.options.employees = [response.data.user]
              })
              .catch()
          })
          .catch()
      }
    }
  }
}
