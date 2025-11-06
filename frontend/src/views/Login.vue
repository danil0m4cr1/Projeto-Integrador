<template>
  <div class="h-[100vh] w-full flex flex-col lg:flex-row">
    <div class="w-full lg:w-1/2 bg-[#EFB11E] flex justify-center items-center lg:order-first p-20">
      <img
        src="/VJuice logo.png"
        alt="Logo"
        class="w-[120px] h-auto"
      />
    </div>

    <div class="h-[100vh] w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-8 lg:p-10">
      <h1 class="text-3xl font-bold mb-6 text-black">Login</h1>
      
      <form class="w-full max-w-xs" @submit.prevent="submitForm">

        <div id="user-err" class="hidden mb-4 text-red-600 text-sm">
          Email ou senha incorretos
        </div>

        <div class="mb-4">
          <label for="email" class="block text-black"></label>
          <input
            type="email"
            id="email"
            v-model="emailInput"
            placeholder="Digite seu email"
            class="w-full mt-2 px-4 py-2 border-b-2 border-black focus:outline-none focus:border-[#EFB11E]"
            required
          />
        </div>

        <div class="mb-6">
          <label for="senha" class="block text-black"></label>
          <input
            type="password"
            id="senha"
            v-model="passInput"
            placeholder="Digite sua senha"
            class="w-full mt-2 px-4 py-2 border-b-2 border-black focus:outline-none focus:border-[#EFB11E]"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 bg-[#EFB11E] text-black font-bold rounded-full hover:bg-[#E8A81D]"
        >
          ENTRAR
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const usuario = useUserStore();

const emailInput = ref('');
const passInput = ref('');

async function checkEmailExists(email, pass){
    try {
        const response = await api.post("/users/check-user", { email, pass });
        return {
            exists: response.data.exists,
            email: response.data.email,
            role: response.data.role
        };
    } catch(error) {
        return { exists: false, email: null };
    }
}

async function submitForm(){    
    const userExists = await checkEmailExists(emailInput.value, passInput.value);
    if(userExists.exists){
      if(userExists.role == "admin"){
        usuario.setUser({ email: userExists.email, role: "admin" });
        router.push("/admin");
      } else {
        usuario.setUser({ email: userExists.email, role: "user" });
        router.push("/");
      }
    } else {
        const generalErr = document.getElementById('user-err');
        generalErr.classList.remove('hidden');
    }
}
</script>