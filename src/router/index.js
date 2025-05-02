import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

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
        component: () => import("../pages/register.vue"),
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
                component: () => import("../pages/Health.vue"),
                redirect: "/index/health/heartData",
                children: [
                    {
                        path: "heartData",
                        name: "heartData",
                        component: () => import("../components/HeartDataClear.vue"),
                    },
                    {
                        path: "bloodData",
                        name: "bloodData",
                        component: () => import("../components/BloodDataClear.vue"),
                    },
                    {
                        path: "piData",
                        name: "piData",
                        component: () => import("../components/PiDataClear.vue"),
                    },
                    {
                        path: "oxygenData",
                        name: "oxygenData",
                        component: () => import("../components/OxygenDataClear.vue"),
                    },
                    {
                        path: "sleepData",
                        name: "sleepData",
                        component: () => import("../components/SleepDataClear.vue"),
                    },
                    {
                        path: "pressureData",
                        name: "pressureData",
                        component: () => import("../components/PressureDataClear.vue"),
                    },
                ]
            },
            {
                path: "medicalQA",
                name: "medicalQA",
                component: () => import("../pages/MedicalQA.vue")
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


router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()

    // 访问根路径时强制退出
    if (to.path === '/') {
        authStore.logout()
        return '/login'
    }

    // 访问登录页时触发退出逻辑
    if (to.path === '/login') {
        authStore.logout()
        return true // 允许访问登录页
    }

    // 检查其他页面是否登录
    if (!authStore.token) {

        return '/login'
    }

    // 已登录用户正常访问
    return true
})



export default router;
