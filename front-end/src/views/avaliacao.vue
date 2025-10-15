<template>
  <div class="h-[calc(100vh-92px)] w-full flex flex-col justify-center items-center pb-20 max-[1300px]:h-full max-[1300px]:mt-10">
    
    <!-- Título centralizado -->
    <h1 class="text-xl font-semibold mb-8 text-center">Avaliar Produtos</h1>

    <!-- Caixa de avaliação -->
    <div class="bg-[#EFB11E] w-[550px] h-[300px] rounded-sm shadow p-8 text-center flex flex-col items-center justify-between md:w-[30%] h-[20rem] ">
      <div>
        <h2 class="text-lg font-bold">ITEM SELECIONADO:</h2>
        <p class="font-semibold mb-4">Suco de Laranja</p>

        <p class="text-xs font-semibold mb-6">ESCOLHA UMA AVALIAÇÃO PARA O PRODUTO?</p>

        <div class="flex justify-center space-x-6 mb-6">
          <div
            v-for="n in 5"
            :key="n"
            class="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-125"
            @click="rating = n"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              :class="[ 
                'w-8 h-8 transition-transform duration-200',
                rating >= n ? 'text-yellow-600 scale-110' : 'text-white'
              ]"
            >
              <path
                d="M12 .587l3.668 7.568L24 9.423l-6 5.857L19.335 24 12 19.897 4.665 24 6 15.28 0 9.423l8.332-1.268z"
              />
            </svg>
            <span class="text-xs mt-1 font-semibold">{{ n }}</span>
          </div>
        </div>
      </div>

      <!-- Botão Confirmar -->
      <button
        class="bg-white text-black font-semibold py-2 px-8 rounded-md shadow hover:bg-gray-100 transition-colors duration-200"
        @click="confirmarAvaliacao"
      >
        Confirmar
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
    alert(`Você confirmou ${rating.value} estrela${rating.value > 1 ? 's' : ''}!`)
  }
}
</script>
