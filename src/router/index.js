import { createRouter, createWebHashHistory } from "vue-router";


const routes = [
    {
        path: "/",
        redirect: "/login"
    },
    {
        path: "/login",
        component: () => import("../pages/Login.vue")
    },
    {
        path: "/register",
        component: () => import("../pages/register.vue")
    }
]


const router = createRouter({
    history: createWebHashHistory(),
    routes,
});


export default router;
