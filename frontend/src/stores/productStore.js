import { defineStore } from 'pinia';


export const useProductStore = defineStore('product', {
  state: () => ({
    selectedProduct: null,
    products: []
    // selectedProduct: { name: 'Suco de Laranja', size: '500ml', price: '11.50', image: '/laranja.png' }
  }),
  actions: {
    setSelectedProduct(product) {
      this.selectedProduct = product;
    },
    addToCart(product) {
      this.products.push(product);
    },
    delToCart(index) {
      this.products.splice(index, 1);
    }
  },
  persist: true
});