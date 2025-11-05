import { defineStore } from 'pinia';

export const useProductStore = defineStore('product', {
  state: () => ({
    selectedProduct: null,
    cart: []
  }),
  
  getters: {
    cartItemCount: (state) => {
      const count = state.cart.reduce((total, product) => total + product.quantity, 0);
      console.log('📊 Total de itens no carrinho:', count);
      return count;
    },
    
    cartTotal: (state) => {
      return state.cart.reduce((total, product) => {
        const price = parseFloat(product.price.toString().replace(',', '.'));
        return total + (price * product.quantity);
      }, 0);
    }
  },
  
  actions: {
    setSelectedProduct(product) {
      console.log('🔵 setSelectedProduct:', product);
      this.selectedProduct = {
        name: product.name,
        size: product.size,
        price: product.price,
        image: product.image
      };
      console.log('🔵 selectedProduct atualizado:', this.selectedProduct);
    },
    
    addToCart(product) {
      console.log('🟢 === INÍCIO addToCart ===');
      console.log('🟢 Produto recebido:', product);
      console.log('🟢 Carrinho ANTES:', [...this.cart]);
      
      if (!product) {
        console.error('❌ Produto é null ou undefined!');
        return;
      }
      
      // Verifica se o produto já está no carrinho
      const existingProductIndex = this.cart.findIndex(item => item.name === product.name);
      console.log('🔍 Índice do produto existente:', existingProductIndex);
      
      if (existingProductIndex !== -1) {
        // Se já existe, aumenta a quantidade
        console.log('🟡 Produto já existe, aumentando quantidade');
        this.cart[existingProductIndex].quantity++;
        console.log('🟡 Nova quantidade:', this.cart[existingProductIndex].quantity);
      } else {
        // Se não existe, adiciona com quantidade 1
        console.log('🟢 Adicionando NOVO produto ao carrinho');
        const newProduct = {
          name: product.name,
          size: product.size,
          price: product.price,
          image: product.image,
          quantity: 1
        };
        console.log('🟢 Novo produto criado:', newProduct);
        this.cart.push(newProduct);
      }
      
      console.log('🟢 Carrinho DEPOIS:', [...this.cart]);
      console.log('🟢 Tamanho do carrinho:', this.cart.length);
      console.log('🟢 === FIM addToCart ===');
    },
    
    removeFromCart(index) {
      console.log('🔴 Removendo produto do índice:', index);
      this.cart.splice(index, 1);
      console.log('🔴 Carrinho após remoção:', [...this.cart]);
    },
    
    updateQuantity(index, quantity) {
      console.log('🟡 Atualizando quantidade:', { index, quantity });
      if (quantity <= 0) {
        this.removeFromCart(index);
      } else {
        this.cart[index].quantity = quantity;
      }
    },
    
    clearCart() {
      console.log('🔴 Limpando carrinho');
      this.cart = [];
      console.log('🔴 Carrinho limpo:', this.cart);
    }
  },
  
  // Adiciona persistência com localStorage (opcional)
  persist: {
    enabled: false, // Desabilitado por enquanto para debug
    strategies: [
      {
        key: 'product-store',
        storage: localStorage,
      },
    ],
  },
});