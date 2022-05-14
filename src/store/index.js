import Vuex from 'vuex'
import Vue from 'vue'
import shop from '@/api/shop'

Vue.use(Vuex)

export default new Vuex.Store({
    state: { // = data
        products: [],
        cart: [],
        checkoutStatus: null
    },

    getters: { // = computed properties
        availableProducts (state, getters) {
            return state.products.filter(product => product.inventory > 0)
        },

        cartProducts (state) {
            const cartItemsIdsMap = new Map(state.cart.map(cartItem => [ cartItem.id, cartItem ]))

            return state.products.filter(product => cartItemsIdsMap.has(product.id))
                                 .map(product => ({
                                     title: product.title,
                                     price: product.price,
                                     quantity: cartItemsIdsMap.get(product.id).quantity
                                 }))
        },

        cartTotalItems (state) {
            return state.cart.length
        },

        cartTotal (state, getters) {
            return getters.cartTotalItems === 0 ? 0 :
                getters.cartProducts.reduce((total, product) => total + (product.quantity * product.price), 0)
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
        },

        addProductToCart (context, product) {
            if (product.inventory <= 0) {
                return
            }

            const cartItem = context.state.cart.find(item => item.id === product.id)
            if (!cartItem) {
                context.commit('pushProductToCart', product.id)
            }
            else {
                context.commit('incrementItemQuantity', cartItem)
            }

            context.commit('decrementProductInventory', product)
        },

        checkout ({ state, commit }) {
            return new Promise((resolve, reject) => {
                shop.buyProducts(state.cart, () => {
                    commit('emptyCart')
                    commit('setCheckoutStatus', 'success')
                    resolve()
                },
                (err) => {
                    commit('setCheckoutStatus', 'fail')
                    reject(err)
                })
            })
        }
    },

    mutations: { // = methods that only update the state
        setProducts (state, products) {
            state.products = products
        },

        pushProductToCart (state, productId) {
            state.cart.push({ id: productId, quantity: 1 })
        },

        incrementItemQuantity (state, cartItem) {
            cartItem.quantity++
        },

        decrementProductInventory(state, product) {
            product.inventory--
        },

        setCheckoutStatus (state, status) {
            state.checkoutStatus = status
        },

        emptyCart(state) {
            state.cart = []
        }
    }
})