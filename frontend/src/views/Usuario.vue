<template>
  <section
    class="h-[calc(100vh-92px)] w-full flex flex-col items-center justify-start pb-20 pt-12 bg-[#FFFBF0]"
  >
    <!-- Título -->
    <h2 class="text-black text-xl font-bold mb-6">Gerenciar usuários</h2>

    <!-- Barra de pesquisa -->
    <div class="mb-6 w-full max-w-xs">
      <input
        type="text"
        placeholder="Pesquisar"
        v-model="searchQuery"
        class="w-full px-4 py-2 border border-black rounded-full text-sm focus:outline-none"
      />
    </div>

    <!-- ======== Versão Desktop (tabela original mais larga) ======== -->
    <div class="hidden md:block w-full max-w-3xl">
      <table class="w-full text-left border-collapse shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-[#EFB11E] text-black">
            <th class="px-6 py-3">Usuário</th>
            <th class="px-6 py-3">Email</th>
            <th class="px-6 py-3">Cargo</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user.email"
            class="bg-[#F8F4E8] hover:bg-[#f0e9d9] transition-colors"
          >
            <td class="px-6 py-3 font-semibold">{{ user.name }}</td>
            <td class="px-6 py-3">{{ user.email }}</td>
            <td class="px-6 py-3">{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ======== Versão Mobile (duas colunas com scroll visível) ======== -->
    <div
      class="block md:hidden w-full max-w-5xl overflow-x-auto scrollbar-thin scrollbar-thumb-[#EFB11E] scrollbar-track-[#f8f4e8]"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-full px-2">
        <div
          v-for="user in filteredUsers"
          :key="user.email"
          class="bg-[#F8F4E8] border border-[#e0d7b8] rounded-lg overflow-hidden hover:bg-[#f0e9d9] transition-colors"
        >
          <table class="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr class="bg-[#EFB11E] text-black">
                <th class="px-4 py-2">Usuário</th>
                <th class="px-4 py-2">Email</th>
                <th class="px-4 py-2">Cargo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="px-4 py-2 font-semibold">{{ user.name }}</td>
                <td class="px-4 py-2">{{ user.email }}</td>
                <td class="px-4 py-2">{{ user.role }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Botão editar usuários -->
    <button
      class="mt-6 px-6 py-2 bg-[#EFB11E] text-black font-bold rounded-full hover:bg-[#d99f1b] transition-colors"
    >
      EDITAR USUÁRIOS
    </button>
  </section>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      users: [
        { name: 'Igor Matheus', email: 'igor@gmail.com', role: 'Admin' },
        { name: 'Danilo Nunes', email: 'danilo@gmail.com', role: 'Usuário' },
        { name: 'Gabriel Lucas', email: 'gabriel@gmail.com', role: 'Usuário' },
      ],
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      return this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
};
</script>

<style scoped>
table th,
table td {
  border: 1px solid #e0d7b8;
}

/* ===== Scrollbar customizada apenas para mobile ===== */
@media (max-width: 768px) {
  .scrollbar-thin::-webkit-scrollbar {
    height: 8px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f8f4e8;
    border-radius: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #efb11e;
    border-radius: 4px;
  }
}
</style>
