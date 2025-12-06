<template>
  <section
    class="h-[calc(100vh-92px)] w-full flex flex-col items-center justify-start pb-20 pt-12 bg-[#FFFBF0]"
  >
    <h2 class="text-black text-xl font-bold mb-6">Gerenciar usuários</h2>

    <div class="mb-6 w-full max-w-xs">
      <input
        type="text"
        placeholder="Pesquisar"
        v-model="searchQuery"
        class="w-full px-4 py-2 border border-black rounded-full text-sm focus:outline-none"
      />
    </div>

    <div v-if="loading" class="text-black">Carregando usuários...</div>

    <div class="hidden md:block w-full max-w-3xl">
      <table class="w-full text-left border-collapse shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-[#EFB11E] text-black">
            <th class="px-6 py-3">Usuário</th>
            <th class="px-6 py-3">Email</th>
            <th class="px-6 py-3">Cargo</th>
            <th class="px-6 py-3" v-if="editMode">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user._id"
            class="bg-[#F8F4E8] border-b border-[#e0d7b8]"
          >
            <td class="px-6 py-3">
              <input
                v-if="editMode"
                v-model="user.name"
                class="w-full px-2 py-1 border border-gray-300 rounded"
              />
              <span v-else class="font-semibold">{{ user.name }}</span>
            </td>
            <td class="px-6 py-3">
              <input
                v-if="editMode"
                v-model="user.email"
                type="email"
                class="w-full px-2 py-1 border border-gray-300 rounded"
              />
              <span v-else>{{ user.email }}</span>
            </td>
            <td class="px-6 py-3">
              <select
                v-if="editMode"
                v-model="user.role"
                class="w-full px-2 py-1 border border-gray-300 rounded"
              >
                <option value="admin">Admin</option>
                <option value="user">Usuário</option>
              </select>
              <span v-else>{{ user.role }}</span>
            </td>
            <td class="px-6 py-3" v-if="editMode">
              <button
                @click="deleteUser(user._id)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="block md:hidden w-full max-w-5xl overflow-x-auto"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-full px-2">
        <div
          v-for="user in filteredUsers"
          :key="user._id"
          class="bg-[#F8F4E8] border border-[#e0d7b8] rounded-lg overflow-hidden"
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
                <td class="px-4 py-2">
                  <input
                    v-if="editMode"
                    v-model="user.name"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span v-else class="font-semibold">{{ user.name }}</span>
                </td>
                <td class="px-4 py-2">
                  <input
                    v-if="editMode"
                    v-model="user.email"
                    type="email"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span v-else>{{ user.email }}</span>
                </td>
                <td class="px-4 py-2">
                  <select
                    v-if="editMode"
                    v-model="user.role"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Usuário">Usuário</option>
                  </select>
                  <span v-else>{{ user.role }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="editMode" class="p-2 bg-[#EFB11E] flex justify-end">
            <button
              @click="deleteUser(user._id)"
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm cursor-pointer"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex gap-4">
      <button
        v-if="!editMode"
        @click="editMode = true"
        class="px-6 py-2 bg-[#EFB11E] text-black font-bold rounded-full hover:bg-[#d99f1b] cursor-pointer"
      >
        EDITAR USUÁRIOS
      </button>
      <template v-else>
        <button
          @click="saveChanges"
          class="px-6 py-2 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 cursor-pointer"
        >
          SALVAR
        </button>
        <button
          @click="cancelEdit"
          class="px-6 py-2 bg-gray-500 text-white font-bold rounded-full hover:bg-gray-600 cursor-pointer"
        >
          CANCELAR
        </button>
      </template>
    </div>

    <div v-if="message" class="mt-4 px-4 py-2 rounded" :class="messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
      {{ message }}
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      users: [],
      originalUsers: [],
      loading: false,
      editMode: false,
      message: '',
      messageType: ''
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
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3000/api/users');
        if (!response.ok) throw new Error('Erro ao buscar usuários');
        this.users = await response.json();
        this.originalUsers = JSON.parse(JSON.stringify(this.users));
      } catch (error) {
        console.error('Erro:', error);
        this.showMessage('Erro ao carregar usuários', 'error');
      } finally {
        this.loading = false;
      }
    },
    async saveChanges() {
      this.loading = true;
      try {
        const promises = this.users.map(user => 
          fetch(`http://localhost:3000/api/users/${user._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              role: user.role
            })
          })
        );
        
        await Promise.all(promises);
        this.editMode = false;
        this.originalUsers = JSON.parse(JSON.stringify(this.users));
        this.showMessage('Usuários atualizados com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao salvar:', error);
        this.showMessage('Erro ao salvar alterações', 'error');
      } finally {
        this.loading = false;
      }
    },
    cancelEdit() {
      this.users = JSON.parse(JSON.stringify(this.originalUsers));
      this.editMode = false;
    },
    async deleteUser(userId) {
      if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao deletar usuário');
        
        this.users = this.users.filter(u => u._id !== userId);
        this.originalUsers = this.originalUsers.filter(u => u._id !== userId);
        this.showMessage('Usuário excluído com sucesso!', 'success');
      } catch (error) {
        console.error('Erro:', error);
        this.showMessage('Erro ao excluir usuário', 'error');
      }
    },
    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
table th,
table td {
  border: 1px solid #e0d7b8;
}

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