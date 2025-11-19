import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false
  }),
  actions: {
    setUser(userInfo) {
      this.user = userInfo;
      this.isLoggedIn = true;
    },
    logout() {
      this.user = null;
      this.isLoggedIn = false;
    }
  },
  persist: true // Ativa a persistência automática com o plugin
});