import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/userStore";
import Produtos from "../views/Produtos.vue";
import Detalhes from "../views/Detalhes.vue";
import Login from "../views/Login.vue";
import Avaliacao from "../views/Avaliacao.vue";
import Carrinho from "../views/Carrinho.vue";
import Estoque from "../views/Estoque.vue";
import PainelAdmin from "../views/PainelAdmin.vue";
import Pedidos from "../views/Pedidos.vue";
import Usuario from "../views/Usuario.vue";

const routes = [
    {path: "/", component: Produtos, name: "produtos"},
    {path: "/detalhes", component: Detalhes, name: "detalhes", props: route => ({ product: route.params.product })},
    {path: "/login", component: Login, name: "login"},
    {path: "/carrinho", component: Carrinho, name: "carrinho" },
    {path: "/avaliar", component: Avaliacao, name: "avaliar"},
    {path: "/estoque", component: Estoque, name: "estoque"},
    {path: "/admin", component: PainelAdmin, name: "admin", meta: { requiresAdmin: true } },
    
    // Rota de pedidos para ADMIN
    {path: "/admin/pedidos", component: Pedidos, name: "pedidos-admin", meta: { requiresAdmin: true } },
    
    // Rota de pedidos para USUÁRIO COMUM
    {path: "/pedidos", component: Pedidos, name: "pedidos", meta: { requiresAuth: true } },
    
    {path: "/admin/usuarios", component: Usuario, name: "usuarios", meta: { requiresAdmin: true } }
];

const router = createRouter({
    history: createWebHistory(), 
    routes
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    
    // Verifica se a rota requer autenticação de admin
    if (to.meta.requiresAdmin) {
        if (!userStore.isLoggedIn) {
            // Usuário não está logado, redireciona para login
            next('/login');
        } else if (userStore.user?.role !== 'admin') {
            // Usuário logado mas não é admin, redireciona para home
            next('/');
        } else {
            // Usuário é admin, permite acesso
            next();
        }
    } 
    // Verifica se a rota requer apenas autenticação
    else if (to.meta.requiresAuth) {
        if (!userStore.isLoggedIn) {
            // Usuário não está logado, redireciona para login
            next('/login');
        } else {
            // Usuário está logado, permite acesso
            next();
        }
    } 
    // Rota pública, permite acesso
    else {
        next();
    }
});

export default router;