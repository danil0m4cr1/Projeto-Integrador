import { createRouter, createWebHistory } from "vue-router";
import Produtos from "../views/Produtos.vue";
import Detalhes from "../views/Detalhes.vue";
import Login from "../views/Login.vue";
import Avaliacao from "../views/avaliacao.vue";

const routes = [
    {path: "/", component: Produtos, name: "produtos"},
    {path: "/detalhes", component: Detalhes, name: "detalhes", props: route => ({ product: route.params.product })},
    {path: "/login", component: Login, name: "login"},
    // {path: "/carrinho", component: Carrinho, name: "carrinho"} // Para quando for implementado o carrinho
    {path: "/avaliar", component: Avaliacao, name: "avaliar"}
]
export default createRouter({history: createWebHistory(), routes});