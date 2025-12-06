<template>
    <div class="h-[calc(100vh-92px)] w-full flex justify-center items-center pb-20 max-[1300px]:h-full max-[1300px]:mt-10">
        <div class="flex">
            <div
            v-if="selectedProduct"
            class=" flex flex-col items-center text-center px-16 pb-10 border-2 rounded-3xl border-[#EFB11E] transform transition duration-400 hover:scale-115 shadow-[5px_5px_10px_rgba(0,0,0,0.51)] max-sm:m-4">
                <img 
                :src="selectedProduct.image"
                :alt="selectedProduct.name"
                class="w-[200px]"
                >
                <p class="text-[21px]">{{ selectedProduct.name }}<br> 
                    {{ selectedProduct.size }}
                </p>
                <p class="text-[24px] py-5"><b>R$ {{ selectedProduct.price }}</b></p>
                <div class="py-5">
                    <button 
                        class="cursor-pointer bg-[#EFB11E] px-6 py-2 rounded-full hover:bg-[#E8A81D] font-semibold" 
                        @click="addProductToCart"
                    >
                        <i class="fa-solid fa-cart-shopping"></i>
                        Adicionar ao carrinho
                    </button>
                </div>
                <div class="flex justify-center items-center gap-2 relative">
                    <i class="fa-solid fa-star text-[#ffe100] text-[20px]"></i>
                    <p class="text-[20px]">4.3</p>
                    <button id="hint" ref="hint" @click="showHint">
                        <i class="fa-solid fa-circle-info absolute top-[-5px] right-[-8px] text-[14px] cursor-pointer"></i>
                    </button>
                </div>
                <p id="pHint" ref="pHint" class="hidden pt-2 text-[15px]">Média de avaliações dos usuários</p>
            </div>
        </div>
        
    </div>
</template>

<script setup>
import { useProductStore } from '../stores/productStore';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const productStore = useProductStore();
const userStore = useUserStore();
const router = useRouter();

const selectedProduct = productStore.selectedProduct;

const hint = ref(null);
const pHint = ref(null);

const showHint = () => {
    if(pHint.value)
        pHint.value.classList.toggle('hidden');
}


function addProductToCart() {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  productStore.addToCart(selectedProduct);

  
  alert(`${selectedProduct.name} adicionado ao carrinho!`);
  router.push('/carrinho');
}

</script>