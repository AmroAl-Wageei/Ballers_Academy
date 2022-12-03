function useCart (store) {
  return store.getters['booking/getAllMultipleAppointments']
}

function useCartItem (store) {
  return store.getters['booking/getAllMultipleAppointments'][store.getters['booking/getMultipleAppointmentsIndex']]
}

export {
  useCart,
  useCartItem,
}
