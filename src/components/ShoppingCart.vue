<template>
    <div>
        <h1>Shopping Cart</h1>
        <ul>
            <li v-for="product in products">
                {{product.title}} - {{product.price | currency}} - {{product.quantity}}
            </li>
        </ul>

        <p>Total: {{total | currency}}</p>
        <button @click="checkout()"
                :disabled="$store.getters.cartTotalItems === 0">Checkout</button>

        <p v-if="$store.state.checkoutStatus">{{$store.state.checkoutStatus}}</p>
    </div>
</template>

<script>
    export default {
        computed: {
            products () {
                return this.$store.getters.cartProducts
            },

            total () {
                return this.$store.getters.cartTotal
            }
        },

        methods: {
            checkout () {
                this.$store.dispatch('checkout')
                           .catch(err => {
                               console.error(err)
                               alert('Failed to checkout, please try again.')
                           })
            }
        }
    }
</script>

<style scoped>

</style>