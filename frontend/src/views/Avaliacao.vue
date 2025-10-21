<template>
  <div class="h-[calc(100vh-92px)] w-full flex flex-col justify-center items-center max-md:h-[calc(100vh-162px)]">
    
    <!-- Título centralizado -->
    <h1 class="text-xl font-semibold mb-8 text-center">Avaliar Produtos</h1>

    <!-- Caixa de avaliação -->
    <div class="bg-[#EFB11E] w-[550px] h-[300px] rounded-sm shadow p-8 text-center flex flex-col items-center justify-between max-md:w-[90%]">
      <div>
        <h2 class="text-lg font-bold">ITEM SELECIONADO:</h2>
        <p class="font-semibold mb-4">Suco de Laranja</p>

        <p class="text-xs font-semibold mb-6">ESCOLHA UMA AVALIAÇÃO PARA O PRODUTO</p>

        <div class="flex justify-center space-x-6 mb-6">
          <div
            v-for="n in 5"
            :key="n"
            class="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-125"
            @click="rating = n"
          >
            <i :class="['fa-solid fa-star text-[#ffe100] text-[20px]', rating >= n ? 'text-yellow-600 scale-110' : 'text-white']"></i>
            <span class="text-xs mt-1 font-semibold">{{ n }}</span>
          </div>
        </div>
      </div>

      <!-- Botão Confirmar -->
      <button
        class="bg-white text-black font-semibold py-2 px-8 rounded-md shadow transition-colors duration-200 cursor-pointer hover:bg-gray-200"
        @click="confirmarAvaliacao"
      >
        Avaliar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const rating = ref(0)

const confirmarAvaliacao = () => {
  if (rating.value === 0) {
    alert('Por favor, selecione uma avaliação antes de confirmar.')
  } else {
    alert(`Você avaliou ${rating.value} estrela${rating.value > 1 ? 's' : ''}!`)
  }
}
</script>
