<template>
  <section class="h-[calc(100vh-92px)] w-full flex justify-center items-start pb-20 max-[1300px]:h-full max-[1300px]:mt-10">
    <div class="flex flex-col w-[90%] max-w-[600px] gap-6">
      
      <!-- Suco de Laranja -->
      <div class="flex flex-col items-center text-center px-10 pb-10 border-2 rounded-3xl border-[#EFB11E] max-sm:m-4">
        <img :src="sucoLaranja.image" :alt="sucoLaranja.name" class="w-[200px]" />
        <p class="text-[21px] mt-4">{{ sucoLaranja.name }}<br>{{ sucoLaranja.size }}</p>
        <p class="text-[24px] py-5"><b>R$ {{ sucoLaranja.price.toFixed(2) }}</b></p>

        <div class="flex justify-center items-center gap-4 relative">
          <label class="text-[28px]">Quantidade:</label>
          <div class="flex items-center">
            <button @click="decrementQuantity('laranja')" class="text-black font-bold rounded-r-full flex items-center justify-center relative left-[16px] cursor-pointer">-</button>
            <input type="number" :value="sucoLaranja.quantity" class="text-center w-[80px] border-1 rounded-3xl border-[#EFB11E] px-3" readonly />
            <button @click="incrementQuantity('laranja')" class="text-black font-bold rounded-r-full flex items-center justify-center relative right-[16px] cursor-pointer">+</button>
          </div>
        </div>

        <div class="flex justify-center items-center gap-2 mt-6 text-[22px] font-semibold">
          Total: <span class="text-[#EFB11E]">R$ {{ (sucoLaranja.price * sucoLaranja.quantity).toFixed(2) }}</span>
        </div>
      </div>

      <!-- Suco de Morango -->
      <div class="flex flex-col items-center text-center px-10 pb-10 border-2 rounded-3xl border-[#EFB11E] max-sm:m-4">
        <img :src="sucoMorango.image" :alt="sucoMorango.name" class="w-[200px]" />
        <p class="text-[21px] mt-4">{{ sucoMorango.name }}<br>{{ sucoMorango.size }}</p>
        <p class="text-[24px] py-5"><b>R$ {{ sucoMorango.price.toFixed(2) }}</b></p>

        <div class="flex justify-center items-center gap-4 relative">
          <label class="text-[28px]">Quantidade:</label>
          <div class="flex items-center">
            <button @click="decrementQuantity('morango')" class="text-black font-bold rounded-r-full flex items-center justify-center relative left-[16px] cursor-pointer">-</button>
            <input type="number" :value="sucoMorango.quantity" class="text-center w-[80px] border-1 rounded-3xl border-[#EFB11E] px-3" readonly />
            <button @click="incrementQuantity('morango')" class="text-black font-bold rounded-r-full flex items-center justify-center relative right-[16px] cursor-pointer">+</button>
          </div>
        </div>

        <div class="flex justify-center items-center gap-2 mt-6 text-[22px] font-semibold">
          Total: <span class="text-[#EFB11E]">R$ {{ (sucoMorango.price * sucoMorango.quantity).toFixed(2) }}</span>
        </div>
      </div>

      <!-- Suco de Maracujá -->
      <div class="flex flex-col items-center text-center px-10 pb-10 border-2 rounded-3xl border-[#EFB11E] max-sm:m-4">
        <img :src="sucoMaracuja.image" :alt="sucoMaracuja.name" class="w-[200px]" />
        <p class="text-[21px] mt-4">{{ sucoMaracuja.name }}<br>{{ sucoMaracuja.size }}</p>
        <p class="text-[24px] py-5"><b>R$ {{ sucoMaracuja.price.toFixed(2) }}</b></p>

        <div class="flex justify-center items-center gap-4 relative">
          <label class="text-[28px]">Quantidade:</label>
          <div class="flex items-center">
            <button @click="decrementQuantity('maracuja')" class="text-black font-bold rounded-r-full flex items-center justify-center relative left-[16px] cursor-pointer">-</button>
            <input type="number" :value="sucoMaracuja.quantity" class="text-center w-[80px] border-1 rounded-3xl border-[#EFB11E] px-3" readonly />
            <button @click="incrementQuantity('maracuja')" class="text-black font-bold rounded-r-full flex items-center justify-center relative right-[16px] cursor-pointer">+</button>
          </div>
        </div>

        <div class="flex justify-center items-center gap-2 mt-6 text-[22px] font-semibold">
          Total: <span class="text-[#EFB11E]">R$ {{ (sucoMaracuja.price * sucoMaracuja.quantity).toFixed(2) }}</span>
        </div>
      </div>

      <!-- Total Geral -->
      <div class="flex justify-center items-center gap-2 mt-4 text-[24px] font-bold">
        Total Geral: <span class="text-[#EFB11E]">R$ {{ totalGeral.toFixed(2) }}</span>
      </div>

      <button type="submit" class="w-[300px] mt-6 py-2 bg-[#EFB11E] mx-auto my-0 text-black font-bold rounded-full hover:bg-[#E8A81D]">
        FINALIZAR COMPRA
      </button>
    </div>
  </section>
</template>

<script setup>
import { reactive, computed } from 'vue';

const sucoLaranja = reactive({ name: 'Suco de Laranja', size: '500ml', price: 11.50, quantity: 0, image: '/laranja.png' });
const sucoMorango = reactive({ name: 'Suco de Morango', size: '500ml', price: 13.75, quantity: 0, image: '/morango.png' });
const sucoMaracuja = reactive({ name: 'Suco de Maracujá', size: '500ml', price: 15.49, quantity: 0, image: '/maracuja.png' });

const totalGeral = computed(() => {
  return sucoLaranja.price * sucoLaranja.quantity +
         sucoMorango.price * sucoMorango.quantity +
         sucoMaracuja.price * sucoMaracuja.quantity;
});

const incrementQuantity = (tipo) => {
  const total = sucoLaranja.quantity + sucoMorango.quantity + sucoMaracuja.quantity;
  if (total >= 3) {
    alert('Você só pode adicionar até 3 produtos no total!');
    return;
  }
  if (tipo === 'laranja') sucoLaranja.quantity++;
  if (tipo === 'morango') sucoMorango.quantity++;
  if (tipo === 'maracuja') sucoMaracuja.quantity++;
};

const decrementQuantity = (tipo) => {
  if (tipo === 'laranja' && sucoLaranja.quantity > 0) sucoLaranja.quantity--;
  if (tipo === 'morango' && sucoMorango.quantity > 0) sucoMorango.quantity--;
  if (tipo === 'maracuja' && sucoMaracuja.quantity > 0) sucoMaracuja.quantity--;
};
</script>

<style scoped>
button {
  transition: background-color 0.3s ease, transform 0.3s ease;
}
</style>
