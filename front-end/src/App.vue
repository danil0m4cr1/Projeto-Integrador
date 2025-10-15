<template>
  <Header v-if="!isLoginPage" />
  <router-view></router-view>
</template>

<script setup>
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';

const route = useRoute();

console.log(route.name);

// Corrigir o cabeçalho para não aparecer na página de login

</script>