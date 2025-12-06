<template>
  <section class="h-[calc(100vh-92px)] w-full flex justify-center items-start pb-20 max-[1300px]:h-full max-[1300px]:mt-10">
    <div class="flex flex-col w-[90%] items-center gap-6">
      <div class="absolute left-20 top-35 max-[1120px]:static flex justify-center items-center">
        <button
        class="bg-[#EFB11E] px-4 py-2 rounded-full hover:bg-[#E8A81D] font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
        <i class="fa-solid fa-right-from-bracket rotate-180"></i>
       <router-link to="/" class="mt-0.5">CONTINUE COMPRANDO</router-link>
        </button>
      </div>
      
      <div class="text-center mt-10">
        <h2 class="text-[37px] font-bold text-[#EFB11E]">Meu Carrinho</h2>
      </div>

      <div class="flex w-[100%] gap-15 max-[1120px]:flex-col justify-center items-center">
        <div 
          v-for="(product, index) in cartProducts" 
          :key="index"
          class="flex flex-col items-center w-[80%] text-center px-10 pb-10 border-2 rounded-3xl border-[#EFB11E] max-sm:w-[90%]"
        >
          <img :src="product.image" :alt="product.name" class="w-[200px]" />
          <p class="text-[21px] mt-4">{{ product.name }}<br>{{ product.size }}</p>
          <p class="text-[24px] py-5"><b>R$ {{ parsePrice(product.price) }}</b></p>

          <div class="flex justify-center items-center gap-3">
            <label class="text-[20px]">Quantidade:</label>
            <div class="flex items-center">
              <button 
                @click="decrementQuantity(index)" 
                class="w-[35px] h-[35px] flex items-center justify-center text-[20px] font-bold border-2 border-[#EFB11E] rounded-l-full hover:bg-[#EFB11E] hover:text-white transition-all cursor-pointer"
              >
                -
              </button>
              <div class="w-[50px] h-[35px] flex items-center justify-center border-t-2 border-b-2 border-[#EFB11E] bg-white">
                <span class="text-[18px] font-semibold">{{ product.quantity }}</span>
              </div>
              <button 
                @click="incrementQuantity(index)" 
                class="w-[35px] h-[35px] flex items-center justify-center text-[20px] font-bold border-2 border-[#EFB11E] rounded-r-full hover:bg-[#EFB11E] hover:text-white transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div class="flex justify-center items-center gap-2 mt-6 text-[22px] font-semibold">
            Total: <span class="text-[#EFB11E]">R$ {{ (parseFloat(product.price.toString().replace(',', '.')) * product.quantity).toFixed(2).replace('.', ',') }}</span>
          </div>
        </div>
      </div>

      <div v-if="cartProducts.length === 0" class="flex flex-col items-center text-center py-20">
        <i class="fa-solid fa-cart-shopping text-[64px] text-gray-300 mb-4"></i>
        <p class="text-[24px] text-gray-500 mb-2">Seu carrinho está vazio</p>
        <router-link to="/" class="mt-4 text-[#EFB11E] hover:underline text-[18px]">
          <i class="fa-solid fa-arrow-left mr-2"></i>
          Voltar para produtos
        </router-link>
      </div>

      <div v-if="cartProducts.length > 0" class="flex justify-center items-center gap-2 mt-4 text-[24px] font-bold">
        Total Geral: <span class="text-[#EFB11E]">R$ {{ totalGeral }}</span>
      </div>

      <button 
        v-if="cartProducts.length > 0"
        type="submit" 
        class="w-[300px] mt-6 py-2 bg-[#EFB11E] mx-auto my-0 text-black font-bold rounded-full hover:bg-[#E8A81D] cursor-pointer max-sm:w-[90%]"
        :disabled="isProcessing"
        @click="finalizarCompra"
      >
        {{ isProcessing ? 'PROCESSANDO...' : 'FINALIZAR COMPRA' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

const productStore = useProductStore();
const userStore = useUserStore();
const router = useRouter();
const isProcessing = ref(false);

const cartProducts = computed(() => productStore.cart || []);

const totalGeral = computed(() => {
  const total = cartProducts.value.reduce((sum, product) => {
    const price = parseFloat(product.price.toString().replace(',', '.'));
    return sum + (price * product.quantity);
  }, 0);
  return total.toFixed(2).replace('.', ',');
});

function parsePrice(price) {
  const numPrice = parseFloat(price.toString().replace(',', '.'));
  return numPrice.toFixed(2).replace('.', ',');
}

const incrementQuantity = (index) => {
  const total = cartProducts.value.reduce((sum, product) => sum + product.quantity, 0);
  if (total >= 3) {
    alert('Você só pode adicionar até 3 produtos no total!');
    return;
  }
  productStore.cart[index].quantity++;
};

const decrementQuantity = (index) => {
  if (productStore.cart[index].quantity > 1) {
    productStore.cart[index].quantity--;
  } else {
    if (confirm('Deseja remover este item do carrinho?')) {
      productStore.cart.splice(index, 1);
    }
  }
};

const finalizarCompra = async () => {
  if (!userStore.isLoggedIn || !userStore.user?.email) {
    alert('Você precisa estar logado para finalizar a compra!');
    router.push('/login');
    return;
  }

  isProcessing.value = true;

  try {
    const orderData = {
      userEmail: userStore.user.email,
      products: cartProducts.value.map(product => ({
        name: product.name,
        size: product.size,
        price: product.price,
        quantity: product.quantity,
        image: product.image
      })),
      totalAmount: totalGeral.value
    };

    console.log('Enviando pedido para o backend:', orderData);

    const response = await fetch('http://localhost:3000/api/orders/create-and-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar pedido');
    }

    const result = await response.json();
    
    console.log('Resposta do servidor:', result);
    
    alert(`Compra finalizada com sucesso!
    
Pedido #${result.data.orderId} registrado
Enviado para produção no CLP
Status: ${result.data.status}`);
    
    productStore.clearCart();
    router.push('/');
  } catch (error) {
    console.error('Erro ao finalizar compra:', error);
    alert(`Erro ao finalizar compra: ${error.message}\n\nTente novamente.`);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
button {
  transition: background-color 0.3s ease, transform 0.3s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>