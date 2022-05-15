import shop from '@/api/shop'

export default {
    namespaced: true,

    state: {
        items: [],
        checkoutStatus: null
    },

    getters: {
        cartProducts (state, getters, rootState, rootGetters) {
            const cartItemsIdsMap = new Map(state.items.map(cartItem => [ cartItem.id, cartItem ]))
            return rootState.products.items.filter(product => cartItemsIdsMap.has(product.id))
                                 .map(product => ({
                                     title: product.title,
                                     price: product.price,
                                     quantity: cartItemsIdsMap.get(product.id).quantity
                                 }))
        },

        cartTotalItems (state) {
            return state.items.length
        },

        cartTotal (state, getters) {
            return getters.cartTotalItems === 0 ? 0 :
                getters.cartProducts.reduce((total, product) => total + (product.quantity * product.price), 0)
        }
    },

    mutations: {
        pushProductToCart (state, productId) {
            state.items.push({ id: productId, quantity: 1 })
        },

        incrementItemQuantity (state, cartItem) {
            cartItem.quantity++
        },

        setCheckoutStatus (state, status) {
            state.checkoutStatus = status
        },

        emptyCart(state) {
            state.items = []
        }
    },

    actions: {
        addProductToCart ({ state, getters, commit, rootState, rootGetters }, product) {
            if (!rootGetters['products/productIsInStock'](product)) {
                return
            }

            const cartItem = state.items.find(item => item.id === product.id)
            if (!cartItem) {
                commit('pushProductToCart', product.id)
            }
            else {
                commit('incrementItemQuantity', cartItem)
            }

            commit('products/decrementProductInventory', product, { root: true })
        },

        checkout ({ state, commit }) {
            return new Promise((resolve, reject) => {
                shop.buyProducts(state.items, () => {
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
    }
}