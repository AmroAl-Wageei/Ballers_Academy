import { createStore } from 'vuex'
import entities from './modules/entities'
import booking from './modules/booking'

const store = createStore({
  modules: {
    entities,
    booking,
  },
})

export default store
