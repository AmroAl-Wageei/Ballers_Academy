import {useCartItem} from "./cart";

function useBuildPackage (index, entity) {
  let items = [{
    packageId: entity.id,
    serviceId: null,
    index: null,
    services: {},
  }]

  entity.bookable.forEach((item, i) => {
    if (i === 0) {
      items[index].serviceId = item.service.id
    }

    items[index].index = 0

    items[index].services[item.service.id] = {
      fetched: false,
      slots: [],
      providerId: null,
      locationId: null,
      serviceId: item.service.id,
      quantity: item.quantity,
      list: [...new Array(item.minimumScheduled)].map((el, index)=> ({
        id: index + ' ' + item.service.id,
        providerId: null,
        locationId: null,
        date: null,
        time: null,
      }))
    }
  })

  return items
}

function useFilteredProviders (store) {
  let relations = store.getters['entities/getEntitiesRelations']

  let cartItem = useCartItem(store)

  let serviceId = cartItem.serviceId

  let activeService = cartItem.services[serviceId]

  let packageService = store.getters['entities/getPackage'](
    store.getters['booking/getPackageId']
  ).bookable.find(
    i => parseInt(i.service.id) === parseInt(serviceId)
  )

  let employees = store.getters['entities/getEmployees']

  let employeesIds = []

  if (activeService.locationId) {
    for (let employeeId in relations) {
      if (serviceId in relations[employeeId] && relations[employeeId][serviceId].indexOf(activeService.locationId) !== -1) {
        employeesIds.push(parseInt(employeeId))
      }
    }
  } else {
    let locationsIds = []

    if (packageService.locations.length) {
      locationsIds = packageService.locations.map(item => item.id)
    } else {
      for (let employeeId in relations) {
        if (serviceId in relations[employeeId]) {
          locationsIds = locationsIds.concat(relations[employeeId][serviceId])
        }
      }
    }

    for (let employeeId in relations) {
      if (serviceId in relations[employeeId]) {
        locationsIds.forEach(locationId => {
          if (relations[employeeId][serviceId].indexOf(locationId) !== -1) {
            employeesIds.push(parseInt(employeeId))
          }
        })
      }
    }
  }

  let availableEmployeesIds = packageService.providers.length ?
    packageService.providers.map(item => item.id) : employees.map(item => item.id)

  return employees.filter(item =>
    availableEmployeesIds.indexOf(item.id) !== -1 &&
    employeesIds.indexOf(item.id) !== -1 &&
    item.status === 'visible'
  )
}

function useFilteredLocations (store) {
  let cartItem = useCartItem(store)

  let relations = store.getters['entities/getEntitiesRelations']

  let serviceId = cartItem.serviceId

  let activeService = cartItem.services[serviceId]

  let packageService = store.getters['entities/getPackage'](
    store.getters['booking/getPackageId']
  ).bookable.find(
    i => parseInt(i.service.id) === parseInt(serviceId)
  )

  let locations = store.getters['entities/getLocations']

  let locationsIds = []

  if (activeService.providerId) {
    locationsIds = relations[activeService.providerId][serviceId]
  } else {
    let employeesIds = []

    if (packageService.providers.length) {
      employeesIds = packageService.providers.map(item => item.id)
    } else {
      for (let employeeId in relations) {
        if (serviceId in relations[employeeId]) {
          employeesIds.push(parseInt(employeeId))
        }
      }
    }

    for (let employeeId in relations) {
      if (serviceId in relations[employeeId] && employeesIds.indexOf(parseInt(employeeId)) !== -1) {
        locationsIds = locationsIds.concat(relations[employeeId][serviceId])
      }
    }
  }

  let availableLocationsIds = packageService.locations.length ?
    packageService.locations.map(item => item.id) : locations.map(item => item.id)

  return locations.filter(item =>
    availableLocationsIds.indexOf(item.id) !== -1 &&
    locationsIds.indexOf(item.id) !== -1 &&
    item.status === 'visible'
  )
}

function usePackageAmount (store) {
  let pack = store.getters['entities/getPackage'](
    store.getters['booking/getPackageId']
  )

  return pack.discount && !pack.calculatedPrice ? pack.price - pack.price * (pack.discount/100) : pack.price
}

function usePackageDepositAmount (pack, totalAmount) {
  let depositAmount = 0

  if (pack.depositPayment !== 'disabled') {
    switch (pack.depositPayment) {
      case ('fixed'):
        depositAmount = pack.deposit

        break

      case 'percentage':
        depositAmount = totalAmount / 100 * pack.deposit

        break
    }
  }

  return totalAmount > depositAmount ? depositAmount : 0
}

function useCalculateDiscount (pack) {
  if (pack.discount && !pack.calculatedPrice) {
    return pack.discount
  }
  if (pack.price) {
    let originalPrice = pack.bookable.reduce((partialSum, a) => partialSum + a.service.price*a.quantity, 0);
    let newPrice = pack.price
    return originalPrice > newPrice ? ((originalPrice - newPrice)/originalPrice)*100 : ''
  }
  return 0
}


export {
  useBuildPackage,
  useFilteredProviders,
  useFilteredLocations,
  usePackageAmount,
  usePackageDepositAmount,
  useCalculateDiscount
}
