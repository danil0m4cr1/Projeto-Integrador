<template>
  <Header v-if="!isLoginPage" />
  <router-view></router-view>
</template>

<script setup>
import {ref, watch} from 'vue'
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';

const route = useRoute();
const isLoginPage = ref(false);

watch(
  () => route.name,
  (newName) => {
    isLoginPage.value = newName === 'login';
    
  },
  { immediate: true }
);

</script>