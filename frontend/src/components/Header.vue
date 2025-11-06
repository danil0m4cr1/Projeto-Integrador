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
                    <router-link to="/admin" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                        Usuários
                    </router-link>
                    <router-link to="/admin" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                        Pedidos
                    </router-link>
                </div>
            </div>
            
            <div v-if="user.user?.role === 'user'">
                <router-link to="/" class="text-[20px] max-sm:py-5 hover:transition duration-200 hover:text-[#6d5620]">
                    Meu Carrinho
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import {useUserStore} from "../stores/userStore";

export default {
    name: "Header",
    setup(){
        const user = useUserStore();
        return {user};
    }
}
</script>