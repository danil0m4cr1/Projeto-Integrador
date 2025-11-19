<template>
    <div class="w-full bg-[#EFB11E]">
        <div class="flex justify-around items-center w-[80%] mx-auto py-4 max-sm:flex-col">
            <img 
            src="/VJuice logo.png"
            class="w-[60px]">
            
            <div v-if="!user.isLoggedIn">
                <router-link to="/login" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                    Login
                </router-link>
            </div>
            
            <div v-if="user.user?.role === 'admin'">
                <div class="flex gap-10 max-sm:flex-col max-sm:gap-0">
                    <router-link to="/admin/usuarios" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                        Usuários
                    </router-link>
                    <router-link to="/admin/pedidos" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                        Pedidos
                    </router-link>
                    <router-link to="/admin" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                        Dashboard
                    </router-link>
                    <button 
                        @click="sair" 
                        class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620] cursor-pointer"
                    >
                        Sair
                    </button>
                </div>
            </div>
            
            <div v-if="user.user?.role === 'user'">
                <div class="flex gap-10 max-sm:flex-col max-sm:gap-0">
                    <router-link to="/" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                        Produtos
                    </router-link>
                    <router-link to="/carrinho" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                        Meu Carrinho
                    </router-link>
                    <router-link to="/pedidos" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                        Meus Pedidos
                    </router-link>
                    <button 
                        @click="sair" 
                        class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620] cursor-pointer"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from "../stores/userStore";
import { useRouter } from 'vue-router';

export default {
    name: "Header",
    setup() {
        const user = useUserStore();
        const router = useRouter();
        
        const sair = () => {
            user.logout();
            router.push('/login');
        };
        
        return { user, sair };
    }
}
</script>