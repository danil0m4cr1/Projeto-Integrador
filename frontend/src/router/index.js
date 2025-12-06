import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/userStore";
import Produtos from "../views/Produtos.vue";
import Detalhes from "../views/Detalhes.vue";
import Login from "../views/Login.vue";
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
    {path: "/estoque", component: Estoque, name: "estoque"},
    {path: "/admin", component: PainelAdmin, name: "admin", meta: { requiresAdmin: true } },
    
    {path: "/admin/pedidos", component: Pedidos, name: "pedidos-admin", meta: { requiresAdmin: true } },
    
    {path: "/pedidos", component: Pedidos, name: "pedidos", meta: { requiresAuth: true } },
    
    {path: "/admin/usuarios", component: Usuario, name: "usuarios", meta: { requiresAdmin: true } }
];

const router = createRouter({
    history: createWebHistory(), 
    routes
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    
    if (to.meta.requiresAdmin) {
        if (!userStore.isLoggedIn) {
            next('/login');
        } else if (userStore.user?.role !== 'admin') {
            next('/');
        } else {
            next();
        }
    } 
    else if (to.meta.requiresAuth) {
        if (!userStore.isLoggedIn) {
            next('/login');
        } else {
            next();
        }
    } 
    else {
        next();
    }
});

export default router;