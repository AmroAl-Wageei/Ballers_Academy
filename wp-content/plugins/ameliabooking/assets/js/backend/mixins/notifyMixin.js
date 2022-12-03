export default {
  methods: {
    notify (title, message, type, customClass) {
      if (typeof customClass === 'undefined') {
        customClass = ''
      }

      setTimeout(() => {
        this.$notify({
          customClass: customClass,
          title: title,
          message: message,
          type: type,
          offset: 50
        })
      }, 700)
    }
  }
}
