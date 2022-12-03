/* eslint-disable */
import VueRouter from 'vue-router'

let routes = []

routes.push({
  path: '/dashboard',
  name: 'wpamelia-dashboard',
  meta: {title: wpAmeliaLabels.dashboard},
  component: () => import(/* webpackChunkName: "dashboard" */ '../../views/backend/dashboard/Dashboard')
})

routes.push({
  path: '/calendar',
  name: 'wpamelia-calendar',
  meta: {title: wpAmeliaLabels.calendar},
  component: () => import(/* webpackChunkName: "calendar" */ '../../views/backend/calendar/Calendar')
})

routes.push({
  path: '/appointments',
  name: 'wpamelia-appointments',
  meta: {title: wpAmeliaLabels.appointments},
  component: () => import(/* webpackChunkName: "appointments" */ '../../views/backend/appointments/Appointments')
})

routes.push({
  path: '/events',
  name: 'wpamelia-events',
  meta: {title: wpAmeliaLabels.events},
  component: () => import(/* webpackChunkName: "events" */ '../../views/backend/events/Events')
})

routes.push({
  path: '/services',
  name: 'wpamelia-services',
  meta: {title: wpAmeliaLabels.services},
  component: () => import(/* webpackChunkName: "services" */ '../../views/backend/services/Services')
})

routes.push({
  path: '/locations',
  name: 'wpamelia-locations',
  meta: {title: wpAmeliaLabels.locations},
  component: () => import(/* webpackChunkName: "locations" */ '../../views/backend/locations/Locations')
})

routes.push({
  path: '/customers',
  name: 'wpamelia-customers',
  meta: {title: wpAmeliaLabels.customers},
  component: () => import(/* webpackChunkName: "customers" */ '../../views/backend/customers/Customers')
})

routes.push({
  path: '/notifications',
  name: 'wpamelia-notifications',
  meta: {title: wpAmeliaLabels.notifications},
  component: () => import(/* webpackChunkName: "notifications" */ '../../views/backend/notifications/Notifications')
})

routes.push({
  path: '/customize',
  name: 'wpamelia-customize',
  meta: {title: wpAmeliaLabels.customize},
  component: () => import(/* webpackChunkName: "customize" */ '../../views/backend/customize/Customize')
})

routes.push({
  path: '/finance',
  name: 'wpamelia-finance',
  meta: {title: wpAmeliaLabels.finance},
  component: () => import(/* webpackChunkName: "finance" */ '../../views/backend/finance/Finance')
})

routes.push({
  path: '/settings',
  name: 'wpamelia-settings',
  meta: {title: wpAmeliaLabels.settings},
  component: () => import(/* webpackChunkName: "settings" */ '../../views/backend/settings/Settings')
})

routes.push({
  path: '/cf',
  name: 'wpamelia-cf',
  meta: {title: 'Custom Fields'},
  component: () => import(/* webpackChunkName: "cf" */ '../../views/backend/cf/CustomFields')
})

export default new VueRouter({
  routes,
  linkActiveClass: 'is-active'
})
