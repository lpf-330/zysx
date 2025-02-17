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
    },
    {
        path: "/index",
        name: "index",
        component: () => import("../pages/Index.vue"),
        redirect: "/index/home",
        children: [
            {
                path: "home",
                name: "home",
                component: () => import("../pages/Home.vue")
            },
            {
                path: "health",
                name: "health",
                component: () => import("../pages/Health.vue")
            },
            {
                path: "person",
                name: "person",
                component: () => import("../pages/Person.vue")
            }
        ]
    }
]


const router = createRouter({
    history: createWebHashHistory(),
    routes,
});



export default router ;
