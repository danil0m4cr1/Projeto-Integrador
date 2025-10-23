import { createRouter, createWebHistory } from "vue-router";
import Produtos from "../views/Produtos.vue";
import Detalhes from "../views/Detalhes.vue";
import Login from "../views/Login.vue";
import Avaliacao from "../views/Avaliacao.vue";
import Carrinho from "../views/Carrinho.vue";
import Estoque from "../views/Estoque.vue";
import Usuario from "../views/Usuario.vue";
// import Pedidos from "../views/Pedidos.vue";

const routes = [
    {path: "/", component: Produtos, name: "produtos"},
    {path: "/detalhes", component: Detalhes, name: "detalhes", props: route => ({ product: route.params.product })},
    {path: "/login", component: Login, name: "login"},
    {path: "/carrinho", component: Carrinho, name: "carrinho"},
    {path: "/avaliar", component: Avaliacao, name: "avaliar"},
    {path: "/estoque", component: Estoque, name: "estoque"},
    {path: "/usuario", component: Usuario, name: "usuario"},
    // {path: "/pedidos", component: Pedidos, name: "pedidos"}
    
];
export default createRouter({history: createWebHistory(), routes});