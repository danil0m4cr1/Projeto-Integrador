<template>
    <div class="p-6 bg-gray-50 min-h-[calc(100vh-143px)]">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Dashboard Administrativo</h1>
 
        <!-- Carregamento -->
        <div v-if="loading" class="text-center py-10">
            <p class="text-xl text-gray-600">Carregando dados...</p>
        </div>

        <!-- Erro -->
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
        </div>

        <!-- Dashboard -->
        <div v-else>
            <!-- Cards de resumo -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Total de Pedidos</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">{{ totalPedidos }}</p>
                        </div>
                        <div class="bg-blue-100 rounded-full p-3">
                            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>
        
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Pendentes</p>
                            <p class="text-3xl font-bold text-yellow-600 mt-2">{{ statusCount.pendente }}</p>
                        </div>
                        <div class="bg-yellow-100 rounded-full p-3">
                            <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">{{ getPercentage('pendente') }}% do total</p>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-cyan-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Fabricando</p>
                            <p class="text-3xl font-bold text-cyan-600 mt-2">{{ statusCount.fabricando }}</p>
                        </div>
                        <div class="bg-cyan-100 rounded-full p-3">
                            <svg class="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">{{ getPercentage('fabricando') }}% do total</p>
                </div>
        
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Concluídos</p>
                            <p class="text-3xl font-bold text-green-600 mt-2">{{ statusCount.concluído }}</p>
                        </div>
                        <div class="bg-green-100 rounded-full p-3">
                            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">{{ getPercentage('concluído') }}% do total</p>
                </div>
            </div>

            <!-- Gráficos -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Gráfico de Barras - Status dos Pedidos -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4">Status dos Pedidos</h2>
                    <div class="flex justify-center items-center h-[300px]">
                        <canvas ref="barChart"></canvas>
                    </div>
                </div>

                <!-- Gráfico de Pizza - Distribuição -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4">Distribuição de Status</h2>
                    <div class="flex justify-center items-center h-[300px]">
                        <canvas ref="pieChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Receita Total -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-medium">Receita Total</p>
                        <p class="text-4xl font-bold text-green-600 mt-2">R$ {{ receitaTotal }}</p>
                    </div>
                    <div class="bg-green-100 rounded-full p-4">
                        <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">Baseado em {{ statusCount.concluído }} pedidos concluídos</p>
            </div>

            <!-- Últimos Pedidos -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Últimos Pedidos</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="pedido in ultimosPedidos" :key="pedido._id" class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ pedido.userEmail }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">R$ {{ pedido.totalAmount }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="getStatusClass(pedido.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                                        {{ pedido.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(pedido.createdAt) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
 
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
 
Chart.register(...registerables);
 
const pedidos = ref([]);
const loading = ref(false);
const error = ref(null);
const barChart = ref(null);
const pieChart = ref(null);
 
let barChartInstance = null;
let pieChartInstance = null;

const totalPedidos = computed(() => pedidos.value.length);

const ultimosPedidos = computed(() => pedidos.value.slice(0, 5));
 
const statusCount = computed(() => {
  const count = {
    pendente: 0,
    fabricando: 0,
    concluído: 0,
    cancelado: 0
  };
 
  pedidos.value.forEach(pedido => {
    const status = pedido.status.toLowerCase().trim();
    if (count.hasOwnProperty(status)) {
      count[status]++;
    }
  });
 
  return count;
});

const receitaTotal = computed(() => {
  const total = pedidos.value
    .filter(p => p.status === 'concluído')
    .reduce((sum, pedido) => {
      const valor = parseFloat(pedido.totalAmount.replace(',', '.'));
      return sum + valor;
    }, 0);
  return total.toFixed(2).replace('.', ',');
});
 
const getPercentage = (status) => {
  if (totalPedidos.value === 0) return 0;
  return ((statusCount.value[status] / totalPedidos.value) * 100).toFixed(1);
};

const getStatusClass = (status) => {
  const classes = {
    'pendente': 'bg-yellow-100 text-yellow-800',
    'fabricando': 'bg-cyan-100 text-cyan-800',
    'concluído': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

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
 
const chartColors = {
  pendente: 'rgb(234, 179, 8)',
  fabricando: 'rgb(6, 182, 212)',
  concluído: 'rgb(34, 197, 94)',
  cancelado: 'rgb(239, 68, 68)'
};
 
const createBarChart = () => {
  if (barChartInstance) barChartInstance.destroy();
  if (!barChart.value) return;
 
  const ctx = barChart.value.getContext('2d');
  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Pedidos'],
      datasets: [
        {
          label: 'Pendente',
          data: [statusCount.value.pendente],
          backgroundColor: chartColors.pendente,
          borderRadius: 8
        },
        {
          label: 'Fabricando',
          data: [statusCount.value.fabricando],
          backgroundColor: chartColors.fabricando,
          borderRadius: 8
        },
        {
          label: 'Concluído',
          data: [statusCount.value.concluído],
          backgroundColor: chartColors.concluído,
          borderRadius: 8
        },
        {
          label: 'Cancelado',
          data: [statusCount.value.cancelado],
          backgroundColor: chartColors.cancelado,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y || 0;
              const percentage = totalPedidos.value > 0 
                ? ((value / totalPedidos.value) * 100).toFixed(1) 
                : 0;
              return `${value} pedidos (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
};

const createPieChart = () => {
  if (pieChartInstance) pieChartInstance.destroy();
  if (!pieChart.value) return;

  const ctx = pieChart.value.getContext('2d');
  pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Pendente', 'Fabricando', 'Concluído', 'Cancelado'],
      datasets: [{
        data: [
          statusCount.value.pendente,
          statusCount.value.fabricando,
          statusCount.value.concluído,
          statusCount.value.cancelado
        ],
        backgroundColor: [
          chartColors.pendente,
          chartColors.fabricando,
          chartColors.concluído,
          chartColors.cancelado
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed || 0;
              const percentage = totalPedidos.value > 0 
                ? ((value / totalPedidos.value) * 100).toFixed(1) 
                : 0;
              return `${context.label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
};

const fetchPedidos = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('http://localhost:3000/api/orders');
    if (!response.ok) throw new Error('Erro ao buscar pedidos');
    
    pedidos.value = await response.json();
  } catch (err) {
    console.error('Erro:', err);
    error.value = 'Erro ao carregar pedidos';
  } finally {
    loading.value = false;
  }
};
 
onMounted(async () => {
  await fetchPedidos();
  if (totalPedidos.value > 0) {
    createBarChart();
    createPieChart();
  }
});
 
watch(() => pedidos.value, () => {
  if (totalPedidos.value > 0) {
    createBarChart();
    createPieChart();
  }
}, { deep: true });
</script>