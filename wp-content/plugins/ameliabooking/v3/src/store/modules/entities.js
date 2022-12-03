import httpClient from "../../plugins/axios.js";
import {settings, shortLocale, longLocale} from "../../plugins/settings.js";
import {useUrlParams} from "../../assets/js/common/helper";
import useTranslateEntities from "../../assets/js/public/translation";
import {licence, useLiteEntities} from "../../assets/js/common/licence";

function isEmployeeServiceLocation (relations, employeeId, serviceId, locationId = null) {
  if (locationId) {
    return employeeId in relations && serviceId in relations[employeeId] && relations[employeeId][serviceId].indexOf(locationId) !== -1
  }

  return employeeId in relations && serviceId in relations[employeeId]
}

function getParsedCustomPricing (service) {
  if (!('customPricing' in service) || service.customPricing === null) {
    service.customPricing = {enabled: false, durations: {}}
  } else {
    let customPricing = JSON.parse(service.customPricing)

    service.customPricing = {enabled: customPricing.enabled, durations: {}}

    service.customPricing.durations[service.duration] = {price: service.price, rules: []}

    if (customPricing.enabled) {
      service.customPricing.durations = Object.assign(
        service.customPricing.durations,
        customPricing.durations
      )
    }
  }

  return service.customPricing
}

function setEntities ({ commit }, entities, types) {
  let availableTranslationsShort = settings.general.usedLanguages.map(
    key => key.length > 2 ? key.slice(0, 2) : key
  )

  if (licence.isLite) {
    entities = useLiteEntities(entities)
  }

  if (settings.general.usedLanguages.indexOf(longLocale) !== -1 ||
    availableTranslationsShort.indexOf(shortLocale) !== -1
  ) {
    useTranslateEntities(entities)
  }

  types.forEach(ent => {
    if (ent === 'employees') {
      let arr = []
      entities[ent].forEach((employee) => {
        employee.serviceList.forEach((service) => {
          service.customPricing = getParsedCustomPricing(service)
        })

        if (employee.status !== 'hidden') {
          arr.push(employee)
        }
      })
      commit('setUnfilteredEmployees', arr)
    }

    commit(
      'set' + ent.charAt(0).toUpperCase() + ent.slice(1),
      ent === 'customFields' ? entities['customFields'].sort(function(a, b) {
        return ((a['position'] < b['position']) ? -1 : ((a['position'] > b['position']) ? 1 : 0));
      }) : entities[ent]
    )
  })

  commit('setPreselectedValues')
  commit('setReady', true)
}

function getEntitiesVariableName () {
  return 'ameliaAppointmentEntities' in window
    ? 'ameliaAppointmentEntities'
    : ('ameliaEntities' in window ? 'ameliaEntities' : false)
}

export default {
  namespaced: true,

  state: () => ({
    categories: [],
    services: [],
    employees: [],
    unfilteredEmployees: [],
    locations: [],
    packages: [],
    entitiesRelations: {},
    customFields: [],
    ready: false,
    preselected: {}
  }),

  getters: {
    getEntitiesRelations (state) {
      return state.entitiesRelations
    },

    getPreselected (state) {
      return state.preselected
    },

    getCategories (state) {
      return state.categories
    },

    getCategory: (state) => (id) => {
      return state.categories.find(i => parseInt(i.id) === parseInt(id)) || null
    },

    getPackages (state) {
      return state.packages
    },

    getPackage: (state) => (id) => {
      return state.packages.find(i => parseInt(i.id) === parseInt(id)) || null
    },

    getServices (state) {
      return state.services
    },

    getService: (state) => (id) => {
      return state.services.find(i => parseInt(i.id) === parseInt(id)) || null
    },

    getUnfilteredEmployees (state) {
      return state.unfilteredEmployees
    },

    getUnfilteredEmployee: (state) => (id) => {
      return state.unfilteredEmployees.find(a => parseInt(a.id) === parseInt(id)) || null
    },

    getEmployees (state) {
      return state.employees
    },

    getEmployee: (state) => (id) => {
      return state.employees.find(i => parseInt(i.id) === parseInt(id)) || null
    },

    getEmployeeService: (state) => (providerId, serviceId) => {
      return state.employees.find(
        i => parseInt(i.id) === parseInt(providerId)
      ).serviceList.find(
        i => parseInt(i.id) === parseInt(serviceId)
      )
    },

    getLocations (state) {
      return state.locations
    },

    getLocation: (state) => (id) => {
      return state.locations.find(i => parseInt(i.id) === parseInt(id)) || null
    },

    getCustomFields (state) {
      return state.customFields
    },

    filteredCategories: (state, getters) => (data) => {
      let categories = []

      let categoriesIds = getters.filteredServices(data).map(service => service.categoryId)

      state.categories.forEach((category) => {
        if (categoriesIds.indexOf(category.id) !== -1) {
          let availableCategory = Object.assign(
            category
          )
          availableCategory.serviceList = getters.filteredServices(data).filter(service => service.categoryId === category.id)
          categories.push(category)
        }
      })

      return categories
    },

    filteredServices: (state, getters) => (data) => {
      return state.services.filter(service =>
        (!data.categoryId ? true : service.categoryId === data.categoryId) &&
        (!data.providerId ? true : isEmployeeServiceLocation(state.entitiesRelations, data.providerId, service.id)) &&
        (!data.locationId ? true :
          getters.filteredEmployees(data).filter(
            employee => isEmployeeServiceLocation(state.entitiesRelations, employee.id, service.id, data.locationId)
          ).length > 0
        )
      )
    },

    filteredPackages: (state, getters) => (data) => {
      return state.packages.filter(pack =>
        pack.status === 'visible'
        && pack.bookable.length
        && pack.available
        && (!data.serviceId ? true :
          pack.bookable.filter(
            b => b.service.id === data.serviceId
          ).length > 0)
        && (!data.providerId ? true :
          pack.bookable.filter(
            b => b.providers.length ? b.providers.find(p => data.providerId === p.id) : isEmployeeServiceLocation(state.entitiesRelations, data.providerId, b.service.id)
          ).length === pack.bookable.length)
        && (!data.categoryId ? true :
          pack.bookable.filter(
            b => b.service.categoryId === data.categoryId
          ).length > 0)
        && (!data.locationId ? true :
          pack.bookable.filter(
            b => (b.locations.length ? b.locations.find(l => data.locationId === l.id) : (
              getters.filteredEmployees(data).filter(
                employee => isEmployeeServiceLocation(state.entitiesRelations, employee.id, b.service.id, data.locationId)
              ).length > 0
            ))
          ).length === pack.bookable.length)
      )
    },

    filteredLocations: (state, getters) => (data) => {
      return state.locations.filter(location =>
        (!data.providerId ? true :
          state.employees.length ? state.employees.find(i => i.id === data.providerId).serviceList.filter(
            employeeService => {
              return employeeService.status === 'visible' && isEmployeeServiceLocation(state.entitiesRelations, data.providerId, employeeService.id, location.id)
            }).length > 0 : false
        ) &&
        (!data.serviceId || data.packageId ? true :
          getters.filteredEmployees(data).filter(
            employee => isEmployeeServiceLocation(state.entitiesRelations, employee.id, data.serviceId, location.id)
          ).length > 0
        ) &&
        (!data.packageId ? true :
          state.packages.find(i => i.id === data.packageId).bookable.filter((book) => {
            return book.locations.length ? book.locations.find(l => l.id === location.id) :
              (getters.filteredEmployees(data).filter(
                  employee => isEmployeeServiceLocation(state.entitiesRelations, employee.id, book.service.id, location.id)
              ).length > 0)
          }).length > 0
        )
      )
    },

    filteredEmployees: (state) => (data) => {
      return state.employees.filter(employee =>
        employee.serviceList.filter(
          service =>
            service.status === 'visible' &&
            // service.maxCapacity >= data.persons &&
            (!data.serviceId ? true : isEmployeeServiceLocation(state.entitiesRelations, employee.id, service.id) && service.id === data.serviceId) &&
            (!data.locationId ? true : isEmployeeServiceLocation(state.entitiesRelations, employee.id, service.id, data.locationId))
        ).length > 0
      )
    },

    getEmployeeServices: (state, getters) => (data) => {
      let employeeServices = []

      if (data.serviceId) {
        let service = getters.getService(data.serviceId)
        if (data.providerId) {
          let possibleEmployee = state.employees.find(i => i.id === data.providerId)
          if (!possibleEmployee) return {}
          let employeeService = possibleEmployee.serviceList.filter(service => service.id === data.serviceId)
          return employeeService.map(eS => Object.assign(eS, {bringingAnyone: service.bringingAnyone, aggregatedPrice: service.aggregatedPrice, maxExtraPeople: service.maxExtraPeople}))
        }

        getters.filteredEmployees(data).forEach((employee) => {
          employee.serviceList.forEach((employeeService) => {
            if (employeeService.id === data.serviceId) {
              employeeServices.push(Object.assign(employeeService, {bringingAnyone: service.bringingAnyone, aggregatedPrice: service.aggregatedPrice, maxExtraPeople: service.maxExtraPeople}))
            }
          })
        })
      }

      return employeeServices
    },

    getBookableFromBookableEntities: (state) => (data) => {
      switch (data.type) {
        case ('appointment'):
          return state.services.find(i => i.id === data.serviceId)
        case ('package'):
          return state.packages.find(i => i.id === data.packageId)
      }
    },

    getReady (state) {
      return state.ready
    },
  },

  mutations: {
    setCategories (state, payload) {
      state.categories = payload

      let services = []

      state.categories.forEach((category) => {
        category.serviceList.forEach((service) => {
          services.push(service)
        })
      })

      state.services = services
    },

    setUnfilteredEmployees (state, payload) {
      state.unfilteredEmployees = payload
    },

    setEmployees (state, payload) {
      state.employees = payload
    },

    setLocations (state, payload) {
      state.locations = payload
    },

    setPackages (state, payload) {
      payload.forEach(pack => {
        let isAvailable = true

        pack.bookable.forEach(book => {
          if (!book.service.name) {
            let service = state.services.find(s => s.id === book.service.id)
            if (service) {
              book.service = service
            }
          }

          if (!book.service.show || book.service.status !== 'visible') {
            isAvailable = false
          }
        })

        if (isAvailable) {
          state.packages.push(pack)
        }
      })

      state.packages.sort((a, b) => a.position - b.position)
    },

    setCustomFields (state, payload) {
      state.customFields = [...Object.values(payload)]
    },

    setEntitiesRelations (state, payload) {
      state.entitiesRelations = payload
    },

    setReady (state, payload) {
      state.ready = payload
    },

    setPreselected (state, payload) {
      state.preselected = payload
    },

    setPreselectedValues (state) {
      state.employees = state.employees.filter(e => e.status === 'visible')
      state.services = state.services.filter(s => s.status === 'visible' && s.show && state.employees.filter(e => e.serviceList.find(eS => eS.id === s.id)).length)
      state.locations = state.locations.filter(l => l.status === 'visible')

      if (state.preselected.category) {
        state.categories = state.categories.filter(c => c.id === parseInt(state.preselected.category))
        state.services = state.services.filter(s => s.categoryId === parseInt(state.preselected.category))
        state.employees = state.employees.filter(e => e.serviceList.filter(s => s.categoryId === parseInt(state.preselected.category)).length > 0)
        state.locations = state.locations.filter(l =>
            state.employees.filter(e =>
                state.services.filter(s => isEmployeeServiceLocation(state.entitiesRelations, e.id, s.id, l.id) && s.categoryId === parseInt(state.preselected.category)).length > 0
            ).length > 0
        )
      }
      if (state.preselected.service) {
        state.services = state.services.filter(s => s.id === parseInt(state.preselected.service))
        state.categories = state.services[0] ? state.categories.filter(c => c.id === state.services[0].categoryId) : []
        state.employees = state.employees.filter(e => e.serviceList.filter(s => s.id === parseInt(state.preselected.service)).length > 0)
        state.locations = state.locations.filter(l =>
            state.employees.filter(e => isEmployeeServiceLocation(state.entitiesRelations, e.id, parseInt(state.preselected.service), l.id)).length > 0
        )
      }
      if (state.preselected.employee) {
        state.employees = state.employees.filter(e => e.id === parseInt(state.preselected.employee))
        if (state.employees.length) {
          state.services = state.services.filter(s => state.employees[0].serviceList.filter(serv => serv.id === s.id).length > 0)
          state.categories = state.categories.filter(c => state.services.filter(s => s.categoryId === c.id).length > 0)
          state.locations = state.locations.filter(l =>
            state.services.filter(s => isEmployeeServiceLocation(state.entitiesRelations, parseInt(state.preselected.employee), s.id, l.id)).length > 0
          )
        }
      }
      if (state.preselected.location) {
        state.locations = state.locations.filter(e => e.id === parseInt(state.preselected.location))
        state.employees = state.employees.filter(e => e.serviceList.filter(s => isEmployeeServiceLocation(state.entitiesRelations, e.id, s.id, parseInt(state.preselected.location))).length > 0)
        state.services = state.services.filter(s => state.employees.filter(e => e.serviceList.filter(serv => serv.id === s.id)).length > 0)
        state.categories = state.categories.filter(c => state.services.filter(s => s.categoryId === c.id).length > 0)
      }

      if (state.services.length === 1) {
        state.preselected = Object.assign({}, state.preselected, {service: (state.services[0].id).toString()})
      }
      if (state.categories.length === 1) {
        state.preselected = Object.assign({}, state.preselected, {category: (state.categories[0].id).toString()})
      }
      if (state.employees.length === 1) {
        state.preselected = Object.assign({}, state.preselected, {employee: (state.employees[0].id).toString()})
      }
      if (state.locations.length === 1) {
        state.preselected = Object.assign({}, state.preselected, {location: (state.locations[0].id).toString()})
      }

      // if all employees have the same price
      state.services.forEach(s => {
        let services = state.employees.map(e => e.serviceList.filter(service => service.id === s.id)).flat()
        let samePrice = services.every(service => service.price === services[0].price)
        if (services.length && samePrice) {
          s.price = services[0].price
        }
      })

    },
  },

  actions: {
    getEntities ({ commit }, payload) {
      let types = payload.types

      if (payload.loadEntities && !getEntitiesVariableName()) {
        httpClient.get('/entities', { params: useUrlParams({ types }) }).then(response => {
          window.ameliaAppointmentEntities = response.data.data

          let entities = JSON.parse(JSON.stringify(window.ameliaAppointmentEntities))

          setEntities({ commit }, entities, types)
        })
      } else {
        let ameliaApiInterval = setInterval(
          () => {
            let name = getEntitiesVariableName()

            if (name) {
              clearInterval(ameliaApiInterval)

              let entities = JSON.parse(JSON.stringify(window[name]))

              setEntities({ commit }, entities, types)
            }
          },
          1000
        )
      }
    }
  },
}
