<template>
  <section class="h-[calc(100vh-92px)] w-full flex justify-center items-center pb-20 max-[1300px]:h-full max-[1300px]:mt-10">
    <div class="flex flex-col w-[90%] max-w-[600px]">
      <div class="flex flex-col items-center text-center px-10 pb-10 border-2 rounded-3xl border-[#EFB11E] max-sm:m-4">
        <div class="flex flex-col items-center"> <!-- Single Product -->
            <img 
            :src="selectedProduct.image"
            :alt="selectedProduct.name"
            class="w-[200px]"
            >

            <p class="text-[21px] mt-4">
                {{ selectedProduct.name }}<br> 
                {{ selectedProduct.size }}
            </p>

            <p class="text-[24px] py-5">
                <b>R$ {{ selectedProduct.price }}</b>
            </p>

            <div class="flex justify-center items-center gap-4 relative">
                <label for="qntd" class="text-[28px]">Quantidade:</label>

                <div class="flex items-center">

                    <button @click="decrementQuantity" class="text-black font-bold rounded-r-full flex items-center justify-center relative left-[16px] cursor-pointer">
                    -
                    </button>

                    <input
                    v-model="quantity"
                    type="number"
                    name="qntd"
                    class="text-center w-[80px] border-1 rounded-3xl border-[#EFB11E] appearance-none focus:outline-none px-3"
                    min="1"
                    max="3"
                    />

                    <button @click="incrementQuantity" class="text-black font-bold rounded-r-full flex items-center justify-center relative right-[16px] cursor-pointer">
                    +
                    </button>
                </div>
            </div>

            <div class="flex justify-center items-center gap-2 mt-6 text-[22px] font-semibold">
            Total: <span class="text-[#EFB11E]">R$ {{ totalAmount() }}</span>
            </div>
        </div>

      </div>

      <button
        type="submit"
        class="w-[300px] mt-6 py-2 bg-[#EFB11E] mx-auto my-0 text-black font-bold rounded-full hover:bg-[#E8A81D]"
      >
        FINALIZAR COMPRA
      </button>
    </div>
  </section>
</template>

<script setup>
import { useProductStore } from '../stores/productStore';
import { ref } from 'vue';

const productStore = useProductStore();

const selectedProduct = productStore.selectedProduct;
const quantity = ref(1); 

function addList(product) {
    productStore.addToCart(product);
}

function delList(index) {
    productStore.delToCart(index);
}

const incrementQuantity = () => {
  if(quantity.value < 3){
    quantity.value++;
    addList(selectedProduct);
    console.log(productStore.products);
  }
};

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
    delList(productStore.products.length - 1);
    console.log(productStore.products);
  }
};

// productStore.$reset();


const totalAmount = () => {
    const precoTotal = parseFloat(selectedProduct.price) * quantity.value;
    return precoTotal.toFixed(2);
};
</script>


<style scoped>

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield; 
  -webkit-appearance: none;   
  appearance: none;           
}

button {
  transition: background-color 0.3s ease;
}
</style>