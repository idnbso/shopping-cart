import Vuex from 'vuex'
import Vue from 'vue'
import shop from '@/api/shop'

Vue.use(Vuex)

export default new Vuex.Store({
    state: { // = data
        products: []
    },

    getters: { // = computed properties
        availableProducts (state, getters) {
            return state.products.filter(product => product.inventory > 0)
        }
    },

    actions: { // = methods that never update the state and only fire mutations
        fetchProducts ({ commit }) {
            return new Promise((resolve, reject) => {
                shop.getProducts(products => {
                    commit('setProducts', products)
                    resolve()
                })
            })
        }
    },

    mutations: { // = methods that only update the state
        setProducts (state, products) {
            state.products = products
        }
    }
})