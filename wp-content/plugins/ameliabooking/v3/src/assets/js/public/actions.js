import { event as gtEvent } from "vue-gtag";
import { event as fpEvent } from "./facebookPixel";
import { useCartItem } from "./cart";

function trackAmeliaData (data, marketing, type, action) {
  Object.keys(marketing).forEach((analytics) => {
    if (!marketing[analytics] || !window.wpAmeliaSettings[analytics].id) {
      return
    }

    let settings = window.wpAmeliaSettings[analytics].tracking[type]

    settings.filter(trackingEvent => trackingEvent.type === action).forEach((trackingEvent) => {
      let trackingEventProperties = {}

      let trackingEventData = {}

      switch (analytics) {
        case ('googleTag'): {
          trackingEventData = trackingEvent

          break
        }

        case ('facebookPixel'): {
          trackingEvent.data.forEach((item) => {
            if (item.key.trim() !== '' && item.value.trim() !== '') {
              trackingEventData[item.key] = item.value
            }
          })

          break
        }
      }

      Object.keys(trackingEventData).filter(property => analytics === 'facebookPixel' || property !== 'type').forEach((property) => {
        let originalValue = trackingEventData[property]

        let itemProperties = originalValue.replace(/\s\s+/g, ' ').split('%').join('').split(' ')

        itemProperties.forEach((value) => {
          if (value && !Array.isArray(value) && !(typeof value === 'object') && value !== true) {
            let pathParts = value.split('_')

            let referenceObject = pathParts[0] === 'window' ? window : (data === null ? window : data)

            if (pathParts.length > 1) {
              pathParts.forEach((pathPart) => {
                if (typeof referenceObject !== 'undefined' && pathPart in referenceObject && referenceObject[pathPart] !== null) {
                  referenceObject = referenceObject[pathPart]
                } else {
                  return false
                }
              })

              if (!Array.isArray(referenceObject) && !(typeof referenceObject === 'object')) {
                if (value === 'payment_amount' &&
                  referenceObject.toString().endsWith('.00') &&
                  analytics === 'googleTag' &&
                  property === 'value'
                ) {
                  referenceObject = parseInt(referenceObject)
                }

                originalValue = originalValue.split('%' + value + '%').join(referenceObject).trim()
              } else {
                originalValue = originalValue.split('%' + value + '%').join('').trim()
              }
            } else if (typeof referenceObject !== 'undefined' && value in referenceObject) {
              if (!Array.isArray(referenceObject[value]) && !(typeof referenceObject[value] === 'object')) {
                if (value === 'payment_amount' &&
                  referenceObject[value].endsWith('.00') &&
                  analytics === 'googleTag' &&
                  property === 'value'
                ) {
                  referenceObject[value] = parseInt(referenceObject[value])
                }

                originalValue = originalValue.split('%' + value + '%').join(referenceObject[value]).trim()
              } else {
                originalValue = originalValue.split('%' + value + '%').join('').trim()
              }
            }
          }
        })

        trackingEventProperties[property] = originalValue
      })

      switch (analytics) {
        case ('googleTag'): {
          gtEvent(
            trackingEventProperties.action,
            {
              event_category: trackingEventProperties.category,
              event_label: trackingEventProperties.label,
              value: trackingEventProperties.value
            }
          )

          break
        }

        case ('facebookPixel'): {
          fpEvent(
            trackingEvent.event,
            trackingEventProperties
          )

          break
        }
      }
    })
  })
}

function useAction (store, additionalData, action, type, successCallback, errorCallback) {
  let data = {}

  switch (type) {
    case ('appointment'):
      data.service = store.getters['booking/getServiceId'] ? store.getters['entities/getService'](
        store.getters['booking/getServiceId']
      ) : null

      data.employee = store.getters['booking/getEmployeeId'] ? store.getters['entities/getEmployee'](
        store.getters['booking/getEmployeeId']
      ) : null

      data.location = store.getters['booking/getLocationId'] ? store.getters['entities/getLocation'](
        store.getters['booking/getLocationId']
      ) : null

      data.category = data.service ? store.getters['entities/getCategory'](
        data.service.categoryId
      ) : null

      if (data.service) {
        let cartItem = useCartItem(store)

        if (cartItem && data.service.id in cartItem.services && cartItem.services[data.service.id].list.length) {
          data.employee = cartItem.services[data.service.id].list[0].providerId ? store.getters['entities/getEmployee'](
            cartItem.services[data.service.id].list[0].providerId
          ) : null

          if (data.employee) {
            data.employee.fullName = data.employee.firstName + ' ' + data.employee.lastName
          }

          data.location = cartItem.services[data.service.id].list[0].locationId ? store.getters['entities/getLocation'](
            cartItem.services[data.service.id].list[0].locationId
          ) : null
        }
      }

      break

    case ('package'):
      data.package = store.getters['entities/getPackage'] ? store.getters['entities/getPackage'](
        store.getters['booking/getPackageId']
      ) : null

      break
  }

  trackAmeliaData(Object.assign(data, additionalData), {facebookPixel: true, googleTag: true}, type, action)

  if ('ameliaActions' in window && action in window.ameliaActions) {
    window.ameliaActions[action](successCallback, errorCallback, data)
  } else if (successCallback !== null) {
    successCallback()
  }
}

export default useAction
