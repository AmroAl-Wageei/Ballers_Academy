const licence = {
  isBasic: false,
  isPro: false,
  isDeveloper: false,
  isLite: true,
}

function setLiteService () {
  return {
    extras: [],
    maxCapacity: 1,
    minCapacity: 1,
    timeAfter: '',
    timeBefore: '',
    bringingAnyone: false,
    aggregatedPrice: true,
    settings: null,
    recurringCycle: 'disabled',
    recurringSub: 'future',
    recurringPayment: 0,
    deposit: 0,
    depositPayment: 'disabled',
    depositPerPerson: 1,
    fullPayment: false,
    translations: null,
    minSelectedExtras: null,
    mandatoryExtra: false
  }
}

function useLiteEntities (entities) {
  entities.categories.forEach((category) => {
    category.serviceList.forEach((service) => {
      service = Object.assign(
        service,
        setLiteService()
      )
    })
  })

  entities.employees.forEach((employee) => {
    employee.serviceList.forEach((service) => {
      service = Object.assign(
        service,
        setLiteService()
      )
    })
  })

  entities.packages = []
  entities.locations = []
  entities.customFields = []

  return entities
}

function getLicenceMenuClass (step) {
  if (licence.isLite) {
    if (['extrasStep', 'recurringStep', 'recurringSummary'].includes(step)) {
      return 'am-lite-version'
    }
  }

  return ''
}

function getLicenceClass (trigger) {
  if (licence.isLite) {
    let parts = trigger.split('__')

    if (parts.length === 1 && [
      'extras',
      'recurring',
      'recurringSummary',
      'congratsLocationLabel',
      'paymentStepCoupon',
      'paymentStepExtras',
      'paymentStepCards',
      'paymentStepDiscount',
      'headerLanguages',
      'stepsSelection',
      'footerCustomerPanel',
      'servicesEmployees',
      'servicesLocations'
    ].includes(parts[0])) {
      return 'am-lite-version'
    } else if (parts.length === 2 && (
      ['services'].includes(parts[0]) && ['order', 'options', 'header', 'bringing', 'packages'].includes(parts[1]) ||
      ['dateAndTime'].includes(parts[0]) && ['recurringPopup'].includes(parts[1])
    )) {
      return 'am-lite-version'
    }
  }

  return ''
}

function getLicenceLabelsClass (step, label) {
  if (licence.isLite) {
    switch (step) {
      case ('initStep'):
        if ([
          'location',
          'select_location',
          'please_select_location',
          'employee',
          'employee_colon',
          'select_employee',
          'please_select_employee'
        ].includes(label)) {
          return 'am-lite-version'
        }

        break

      case ('paymentStep'):
        if ([
          'coupon',
          'add_coupon_btn',
          'summary_services_subtotal',
          'summary_person',
          'summary_persons',
          'summary_recurrence',
          'summary_recurrences',
          'summary_extras',
          'summary_extras_subtotal',
          'summary_package',
          'discount_amount_colon',
          'paying_now',
          'paying_later',
          'payment_method',
          'full_amount_consent',
          'on_site',
          'card_number_colon',
          'expires_date_colon',
          'payment_protected_policy',
          'payment_wc_mollie_sentence'
        ].includes(label)) {
          return 'am-lite-version'
        }

        break

      case ('congratulations'):
        if ([
          'congrats_location',
          'congrats_package',
          'congrats_panel',
          'secondaryFooterButton'
        ].includes(label)) {
          return 'am-lite-version'
        }

        break
    }
  }

  return ''
}

export {
  licence,
  getLicenceMenuClass,
  getLicenceClass,
  getLicenceLabelsClass,
  useLiteEntities,
}
