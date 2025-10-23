<template>
  <section class="h-[calc(100vh-92px)] w-full flex flex-col items-center pb-20 bg-[#FFFBF0] max-[1300px]:h-full max-[1300px]:mt-10">
    <!-- Estoque de Produtos -->
    <div class="w-full max-w-5xl mt-12 text-center">
      <h2 class="text-2xl font-bold mb-4">Estoque de produtos</h2>

      <!-- Campo de busca -->
      <div class="flex justify-center mb-6">
        <input
          v-model="search"
          type="text"
          placeholder="Pesquisar"
          class="border border-black rounded-full px-6 py-2 w-80 focus:outline-none"
        />
      </div>

      <!-- Tabela de produtos -->
      <table class="w-full border-collapse border border-black mb-8">
        <thead>
          <tr class="bg-[#EFB11E] text-white text-left border border-black">
            <th class="p-3 border border-black">Nome do Produto</th>
            <th class="p-3 border border-black">Estoque</th>
            <th class="p-3 border border-black">Avaliação</th>
            <th class="p-3 border border-black">Preço</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredProducts"
            :key="item.nome"
            class="bg-[#F5F5F5] text-center hover:bg-gray-100 border border-black"
          >
            <td class="p-3 border border-black">{{ item.nome }}</td>
            <td class="p-3 border border-black">{{ item.estoque }}</td>
            <td class="p-3 border border-black flex items-center justify-center space-x-2">
              <span class="text-[#EFB11E] text-lg">★</span>
              <span>{{ item.avaliacao }}</span>
            </td>
            <td class="p-3 border border-black">{{ item.preco }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Botões -->
      <div class="flex justify-center gap-6 mb-16">
        <button class="bg-[#EFB11E] text-white px-8 py-2 rounded-full font-semibold hover:opacity-90 transition">
          GERAR RELATÓRIO
        </button>
        <button class="bg-[#EFB11E] text-white px-8 py-2 rounded-full font-semibold hover:opacity-90 transition">
          EDITAR PRODUTOS
        </button>
      </div>

      <!-- Status de Produção -->
      <h2 class="text-2xl font-bold mb-4">Status de produção</h2>

      <table class="w-full border-collapse border border-black">
        <thead>
          <tr class="bg-[#EFB11E] text-white text-left border border-black">
            <th class="p-3 border border-black">Ordem de Pedido</th>
            <th class="p-3 border border-black">Nome do Produto</th>
            <th class="p-3 border border-black">Status de Produção</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="pedido in statusProducao"
            :key="pedido.ordem"
            class="bg-[#F5F5F5] text-center hover:bg-gray-100 border border-black"
          >
            <td class="p-3 border border-black">{{ pedido.ordem }}</td>
            <td class="p-3 border border-black">{{ pedido.produto }}</td>
            <td class="p-3 border border-black">{{ pedido.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

const search = ref("");

const produtos = ref([
  { nome: "Suco de Laranja", estoque: 97, avaliacao: 4.3, preco: "R$11,50" },
  { nome: "Suco de Morango", estoque: 22, avaliacao: 2.3, preco: "R$13,75" },
  { nome: "Suco de Maracujá", estoque: 13, avaliacao: 1.9, preco: "R$15,49" },
]);

const filteredProducts = computed(() =>
  produtos.value.filter((p) =>
    p.nome.toLowerCase().includes(search.value.toLowerCase())
  )
);

const statusProducao = ref([
  { ordem: 1, produto: "Suco de Laranja", status: "Fabricado" },
  { ordem: 2, produto: "Suco de Morango", status: "Fabricando" },
  { ordem: 3, produto: "Suco de Maracujá", status: "Fabricando" },
  { ordem: 4, produto: "Suco de Maracujá", status: "Aguardando" },
]);
</script>

<style scoped>
table th,
table td {
  border: 1px solid black;
}
</style>
