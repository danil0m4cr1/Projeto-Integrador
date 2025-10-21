<template>
    <div class="h-[calc(100vh-92px)] w-full flex justify-center items-center pb-20 max-[1300px]:h-full max-[1300px]:mt-10">
        <div class="flex flex-col items-center">
            <div>
                <h1 class="font-bold text-[32px] text-center pb-20 text-[#EFB11E] max-sm:text-[28px] max-sm:px-2">Seja bem-vindo a VJuice</h1>
            </div>
            <div class="flex gap-35 max-[1300px]:flex-col min-[1300px]:flex-row max-sm:gap-20">
                <div 
                class="flex flex-col items-center text-center px-16 border-2 rounded-3xl border-[#EFB11E] cursor-pointer transform transition duration-400 hover:scale-115 shadow-[5px_5px_10px_rgba(0,0,0,0.51)] max-sm:m-4"
                @click="sendDetails({ name: 'Suco de Laranja', size: '500ml', price: 'R$ 11,50', image: '/laranja.png' })"
                >
                    <img 
                    src="/laranja.png"
                    alt="Suco de Laranja"
                    class="w-[200px] max-sm:w-[150px]"
                    >
                    <p class="text-[21px]">Suco de Laranja<br> 
                        500ml
                    </p>
                    <p class="text-[24px] py-5"><b>R$ 11,50</b></p>
                </div>
                <div class="text-center px-16 border-2 rounded-3xl border-[#EFB11E] cursor-pointer transform transition duration-400 hover:scale-115 shadow-[5px_5px_10px_rgba(0,0,0,0.51)] max-sm:m-4"
                @click="sendDetails({ name: 'Suco de Morango', size: '500ml', price: 'R$ 13,75', image: '/morango.png' })">
                    <img 
                    src="/morango.png" 
                    alt="Suco de Morango"
                    class="w-[200px]"
                    >
                    <p class="text-[21px]">Suco de Morango<br> 
                        500ml
                    </p>
                    <p class="text-[24px] py-5"><b>R$ 13,75</b></p>
                </div>
                <div class="text-center px-16 border-2 rounded-3xl border-[#EFB11E] cursor-pointer transform transition duration-400 hover:scale-115 shadow-[5px_5px_10px_rgba(0,0,0,0.51)] max-sm:m-4"
                @click="sendDetails({ name: 'Suco de Maracujá', size: '500ml', price: 'R$ 15,49', image: '/maracuja.png' })">
                    <img 
                    src="/maracuja.png" 
                    alt="Suco de Maracujá"
                    class="w-[200px]"
                    >
                    <p class="text-[21px]">Suco de Maracujá<br> 
                        500ml
                    </p>
                    <p class="text-[24px] py-5"><b>R$ 15,49</b></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useProductStore } from '../stores/productStore';

const router = useRouter();
const store = useProductStore();


function sendDetails(product){
    store.setSelectedProduct(product);
    router.push('/detalhes');
}
</script>