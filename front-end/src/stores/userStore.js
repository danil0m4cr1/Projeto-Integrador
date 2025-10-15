import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: true
  }),
  actions: {
    setUser(userInfo) {
      this.user = userInfo;
      this.isLoggedIn = true;
    }
  }
});