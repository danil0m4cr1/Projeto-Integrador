<template>
  <section class="min-h-[calc(100vh-92px)] w-full flex flex-col justify-center items-center py-10 px-4 bg-[#FFFBF0]">
    <div class="w-full max-w-6xl flex flex-col justify-center flex-1">
      <!-- Título -->
      <h1 class="text-3xl md:text-4xl font-bold text-center mb-8 text-black">
        {{ isAdmin ? 'Gerenciar Pedidos' : 'Meus Pedidos' }}
      </h1>
      
      <!-- Barra de Pesquisa -->
      <div class="flex justify-center mb-6">
        <div class="relative w-full max-w-md">
          <input 
            type="text" 
            :placeholder="isAdmin ? 'Pesquisar por email ou número' : 'Pesquisar por número ou status'"
            class="w-full px-4 py-2 pl-10 border-2 border-black rounded-full focus:outline-none focus:border-black"
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

      <!-- Loading -->
      <div v-if="loading" class="text-center py-10">
        <p class="text-xl text-gray-600">Carregando pedidos...</p>
      </div>

      <!-- Tabela de Pedidos - Desktop -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full border-collapse shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-[#EFB11E]">
              <th class="border-2 border-black px-4 py-3 text-center font-bold">Número</th>
              <th v-if="isAdmin" class="border-2 border-black px-4 py-3 text-center font-bold">Cliente</th>
              <th class="border-2 border-black px-4 py-3 text-center font-bold">Produtos</th>
              <th class="border-2 border-black px-4 py-3 text-center font-bold">Total</th>
              <th class="border-2 border-black px-4 py-3 text-center font-bold">Status</th>
              <th class="border-2 border-black px-4 py-3 text-center font-bold">Data</th>
              <th v-if="isAdmin && editMode" class="border-2 border-black px-4 py-3 text-center font-bold">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in filteredPedidos" :key="pedido._id" class="bg-[#F8F4E8] hover:bg-[#f0e9d9] transition-colors">
              <td class="border-2 border-black px-4 py-3 text-center font-semibold">
                #{{ pedido._id.slice(-8).toUpperCase() }}
              </td>
              <td v-if="isAdmin" class="border-2 border-black px-4 py-3 text-center">{{ pedido.userEmail }}</td>
              <td class="border-2 border-black px-4 py-3">
                <div class="max-h-20 overflow-y-auto text-sm">
                  <div v-for="(product, idx) in pedido.products" :key="idx" class="mb-1">
                    {{ product.quantity }}x {{ product.name }} ({{ product.size }})
                  </div>
                </div>
              </td>
              <td class="border-2 border-black px-4 py-3 text-center font-bold">R$ {{ pedido.totalAmount }}</td>
              <td class="border-2 border-black px-4 py-3">
                <select
                  v-if="isAdmin && editMode"
                  v-model="pedido.status"
                  class="w-full px-2 py-1 border border-gray-300 rounded font-semibold"
                  :class="{
                    'bg-yellow-100 text-yellow-800': pedido.status === 'pendente',
                    'bg-cyan-100 text-cyan-800': pedido.status === 'fabricando',
                    'bg-green-100 text-green-800': pedido.status === 'concluído',
                    'bg-red-100 text-red-800': pedido.status === 'cancelado'
                  }"
                >
                  <option value="pendente">Pendente</option>
                  <option value="fabricando">Fabricando</option>
                  <option value="concluído">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <div v-else class="flex items-center justify-center gap-2">
                  <span 
                    class="w-3 h-3 rounded-full flex-shrink-0" 
                    :class="{
                      'bg-yellow-400': pedido.status === 'pendente',
                      'bg-cyan-500': pedido.status === 'fabricando',
                      'bg-green-500': pedido.status === 'concluído',
                      'bg-red-500': pedido.status === 'cancelado'
                    }"
                  ></span>
                  <span class="font-semibold capitalize">{{ pedido.status }}</span>
                </div>
              </td>
              <td class="border-2 border-black px-4 py-3 text-center text-sm">
                {{ formatDate(pedido.createdAt) }}
              </td>
              <td v-if="isAdmin && editMode" class="border-2 border-black px-4 py-3 text-center">
                <button
                  @click="deletePedido(pedido._id)"
                  class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards - Mobile -->
      <div class="md:hidden space-y-4">
        <div 
          v-for="pedido in filteredPedidos" 
          :key="pedido._id"
          class="bg-[#F8F4E8] border-2 border-[#e0d7b8] rounded-lg p-4 shadow-md"
        >
          <div class="mb-3 pb-3 border-b-2 border-gray-300">
            <p class="text-xs font-semibold text-gray-600 mb-1">Número do pedido</p>
            <p class="text-lg font-bold">#{{ pedido._id.slice(-8).toUpperCase() }}</p>
          </div>

          <div v-if="isAdmin" class="mb-3 pb-3 border-b-2 border-gray-300">
            <p class="text-xs font-semibold text-gray-600 mb-1">Cliente</p>
            <p class="font-semibold">{{ pedido.userEmail }}</p>
          </div>

          <div class="mb-3 pb-3 border-b-2 border-gray-300">
            <p class="text-xs font-semibold text-gray-600 mb-2">Produtos</p>
            <div class="text-sm">
              <div v-for="(product, idx) in pedido.products" :key="idx" class="mb-1">
                {{ product.quantity }}x {{ product.name }} ({{ product.size }})
              </div>
            </div>
          </div>

          <div class="mb-3 pb-3 border-b-2 border-gray-300">
            <p class="text-xs font-semibold text-gray-600 mb-1">Total</p>
            <p class="font-bold text-lg">R$ {{ pedido.totalAmount }}</p>
          </div>

          <div class="mb-3 pb-3 border-b-2 border-gray-300">
            <p class="text-xs font-semibold text-gray-600 mb-2">Status</p>
            <select
              v-if="isAdmin && editMode"
              v-model="pedido.status"
              class="w-full px-2 py-1 border border-gray-300 rounded font-semibold"
              :class="{
                'bg-yellow-100 text-yellow-800': pedido.status === 'pendente',
                'bg-cyan-100 text-cyan-800': pedido.status === 'fabricando',
                'bg-green-100 text-green-800': pedido.status === 'concluído',
                'bg-red-100 text-red-800': pedido.status === 'cancelado'
              }"
            >
              <option value="pendente">Pendente</option>
              <option value="fabricando">Fabricando</option>
              <option value="concluído">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <div v-else class="flex items-center gap-2">
              <span 
                class="w-3 h-3 rounded-full" 
                :class="{
                  'bg-yellow-400': pedido.status === 'pendente',
                  'bg-cyan-500': pedido.status === 'fabricando',
                  'bg-green-500': pedido.status === 'concluído',
                  'bg-red-500': pedido.status === 'cancelado'
                }"
              ></span>
              <span class="font-semibold capitalize">{{ pedido.status }}</span>
            </div>
          </div>

          <div :class="{ 'mb-3 pb-3 border-b-2 border-gray-300': isAdmin && editMode }">
            <p class="text-xs font-semibold text-gray-600 mb-1">Data</p>
            <p class="text-sm">{{ formatDate(pedido.createdAt) }}</p>
          </div>

          <div v-if="isAdmin && editMode" class="mt-3">
            <button
              @click="deletePedido(pedido._id)"
              class="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Excluir Pedido
            </button>
          </div>
        </div>
      </div>

      <!-- Mensagem quando não há pedidos -->
      <div v-if="filteredPedidos.length === 0 && !loading" class="text-center py-10">
        <i v-if="!isAdmin" class="fa-solid fa-box-open text-[64px] text-gray-300 mb-4"></i>
        <p class="text-gray-600 text-lg mb-2">
          {{ isAdmin ? 'Nenhum pedido encontrado.' : 'Você ainda não possui pedidos' }}
        </p>
        <router-link v-if="!isAdmin" to="/" class="mt-4 text-[#EFB11E] hover:underline text-[18px]">
          <i class="fa-solid fa-arrow-left mr-2"></i>
          Começar a comprar
        </router-link>
      </div>

      <!-- Botões de Ação (apenas para admin) -->
      <div v-if="isAdmin" class="mt-8 flex justify-center gap-4">
        <button
          v-if="!editMode"
          @click="editMode = true"
          class="px-6 py-2 bg-[#EFB11E] text-black font-bold rounded-full hover:bg-[#d99f1b] transition-colors"
        >
          EDITAR PEDIDOS
        </button>
        <template v-else>
          <button
            @click="saveChanges"
            class="px-6 py-2 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors"
          >
            SALVAR
          </button>
          <button
            @click="cancelEdit"
            class="px-6 py-2 bg-gray-500 text-white font-bold rounded-full hover:bg-gray-600 transition-colors"
          >
            CANCELAR
          </button>
        </template>
      </div>

      <!-- Mensagens -->
      <div v-if="message" class="mt-4 px-4 py-2 rounded text-center" :class="messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
        {{ message }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const user = computed(() => userStore.user);
const isAdmin = computed(() => user.value?.role === 'admin');

const pedidos = ref([]);
const originalPedidos = ref([]);
const searchQuery = ref('');
const loading = ref(false);
const editMode = ref(false);
const message = ref('');
const messageType = ref('');

const filteredPedidos = computed(() => {
  if (!searchQuery.value) return pedidos.value;
  
  const query = searchQuery.value.toLowerCase();
  return pedidos.value.filter(pedido => {
    const matchesId = pedido._id.toLowerCase().includes(query);
    const matchesStatus = pedido.status.toLowerCase().includes(query);
    const matchesEmail = isAdmin.value && pedido.userEmail.toLowerCase().includes(query);
    
    return matchesId || matchesStatus || matchesEmail;
  });
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchPedidos = async () => {
  loading.value = true;
  try {
    let url;
    if (isAdmin.value) {
      // Admin busca todos os pedidos
      url = 'http://localhost:3000/api/orders';
    } else {
      // Usuário comum busca apenas seus pedidos
      const userEmail = user.value?.email;
      if (!userEmail) {
        throw new Error('Usuário não está logado');
      }
      url = `http://localhost:3000/api/orders/user/${encodeURIComponent(userEmail)}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar pedidos');
    
    pedidos.value = await response.json();
    originalPedidos.value = JSON.parse(JSON.stringify(pedidos.value));
  } catch (error) {
    console.error('Erro:', error);
    pedidos.value = [];
    if (isAdmin.value) {
      showMessage('Erro ao carregar pedidos', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const saveChanges = async () => {
  if (!isAdmin.value) return;
  
  loading.value = true;
  try {
    const promises = pedidos.value.map(pedido => 
      fetch(`http://localhost:3000/api/orders/${pedido._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pedido.status })
      })
    );
    
    await Promise.all(promises);
    editMode.value = false;
    originalPedidos.value = JSON.parse(JSON.stringify(pedidos.value));
    showMessage('Pedidos atualizados com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao salvar:', error);
    showMessage('Erro ao salvar alterações', 'error');
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  pedidos.value = JSON.parse(JSON.stringify(originalPedidos.value));
  editMode.value = false;
};

const deletePedido = async (pedidoId) => {
  if (!isAdmin.value) return;
  if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
  
  try {
    const response = await fetch(`http://localhost:3000/api/orders/${pedidoId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erro ao deletar pedido');
    
    pedidos.value = pedidos.value.filter(p => p._id !== pedidoId);
    originalPedidos.value = originalPedidos.value.filter(p => p._id !== pedidoId);
    showMessage('Pedido excluído com sucesso!', 'success');
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao excluir pedido', 'error');
  }
};

const showMessage = (text, type) => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

onMounted(() => {
  fetchPedidos();
});
</script>

<style scoped>
select {
  cursor: pointer;
}

/* Scrollbar customizada */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #EFB11E;
  border-radius: 2px;
}
</style>