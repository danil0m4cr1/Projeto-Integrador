<template>
  <section class="min-h-[calc(100vh-92px)] w-full flex flex-col justify-center items-center py-10 px-4 max-[1300px]:h-[100%] max-[1300px]:mt-10">
    <div class="w-full max-w-4xl flex flex-col justify-center flex-1">
      <!-- Título -->
      <h1 class="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-20 text-black mt-8 md:-mt-32">Meus Pedidos</h1>
      
      <!-- Barra de Pesquisa -->
      <div class="flex justify-center mb-6 md:mb-8">
        <div class="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Pesquisar"
            class="w-full px-4 py-2 pl-10 border-2 border-black rounded-full focus:outline-none focus:border-black text-sm md:text-base"
            v-model="searchQuery"
          />
          <svg 
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Tabela de Pedidos - Desktop -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-[#EFB11E]">
              <th class="border-2 border-black px-6 py-3 text-center font-bold text-black">Número do pedido</th>
              <th class="border-2 border-black px-6 py-3 text-center font-bold text-black">Status</th>
              <th class="border-2 border-black px-6 py-3 text-center font-bold text-black">Avaliação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in filteredPedidos" :key="pedido.numero" class="bg-[#F5F5DC]">
              <td class="border-2 border-black px-6 py-3 text-center font-semibold text-black">{{ pedido.numero }}</td>
              <td class="border-2 border-black px-6 py-3">
                <div class="flex items-center justify-start gap-2 pl-8">
                  <span 
                    class="w-3 h-3 rounded-full flex-shrink-0" 
                    :class="{
                      'bg-green-500': pedido.status === 'ENTREGUE',
                      'bg-yellow-400': pedido.status === 'FABRICANDO',
                      'bg-red-500': pedido.status === 'CANCELADO'
                    }"
                  ></span>
                  <span class="font-semibold text-black">{{ pedido.status }}</span>
                </div>
              </td>
              <td class="border-2 border-black px-6 py-3">
                <div class="flex items-center justify-start gap-2 pl-8">
                  <span v-if="pedido.disponivel" class="w-5 flex-shrink-0 text-center">⭐</span>
                  <span v-else class="w-5 flex-shrink-0 text-center text-xl">⊗</span>
                  <span class="font-semibold text-black">{{ pedido.disponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL' }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards - Mobile -->
      <div class="md:hidden space-y-4">
        <div 
          v-for="pedido in filteredPedidos" 
          :key="pedido.numero"
          class="bg-[#F5F5DC] border-2 border-black rounded-lg p-4 shadow-md"
        >
          <!-- Número do Pedido -->
          <div class="mb-3 pb-3 border-b-2 border-gray-300">
            <p class="text-xs font-semibold text-gray-600 mb-1">Número do pedido</p>
            <p class="text-lg font-bold text-black">{{ pedido.numero }}</p>
          </div>

          <!-- Status -->
          <div class="mb-3 pb-3 border-b-2 border-gray-300">
            <p class="text-xs font-semibold text-gray-600 mb-2">Status</p>
            <div class="flex items-center gap-2">
              <span 
                class="w-3 h-3 rounded-full flex-shrink-0" 
                :class="{
                  'bg-green-500': pedido.status === 'ENTREGUE',
                  'bg-yellow-400': pedido.status === 'FABRICANDO',
                  'bg-red-500': pedido.status === 'CANCELADO'
                }"
              ></span>
              <span class="font-semibold text-black">{{ pedido.status }}</span>
            </div>
          </div>

          <!-- Avaliação -->
          <div>
            <p class="text-xs font-semibold text-gray-600 mb-2">Avaliação</p>
            <div class="flex items-center gap-2">
              <span v-if="pedido.disponivel" class="w-5 flex-shrink-0 text-center">⭐</span>
              <span v-else class="w-5 flex-shrink-0 text-center text-xl">⊗</span>
              <span class="font-semibold text-black">{{ pedido.disponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensagem quando não há resultados -->
      <div v-if="filteredPedidos.length === 0" class="text-center py-10">
        <p class="text-gray-600 text-lg">Nenhum pedido encontrado.</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MeusPedidos',
  data() {
    return {
      searchQuery: '',
      pedidos: [
        {
          numero: '187503234',
          status: 'ENTREGUE',
          disponivel: true
        },
        {
          numero: '302193919',
          status: 'FABRICANDO',
          disponivel: false
        },
        {
          numero: '948329193',
          status: 'CANCELADO',
          disponivel: false
        },
        {
          numero: '857324914',
          status: 'ENTREGUE',
          disponivel: true
        },
        {
          numero: '654210035',
          status: 'FABRICANDO',
          disponivel: false
        }
      ]
    }
  },
  computed: {
    filteredPedidos() {
      if (!this.searchQuery) {
        return this.pedidos;
      }
      return this.pedidos.filter(pedido => 
        pedido.numero.includes(this.searchQuery) ||
        pedido.status.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
}
</script>

<style scoped>
/* Estilos adicionais se necessário */
</style>