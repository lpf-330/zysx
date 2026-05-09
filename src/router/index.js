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
        name: 'register',
        component: () => import("../pages/Register.vue"),
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
    },
    {
        path: "/childHome",
        name: "childHome",
        component: () => import("../pages/ChildHome.vue"),
    },
    {
        path: '/alerts',
        name: 'Alerts',
        component: () => import('../views/Alerts.vue'),
        meta: {
            title: '提醒通知',
            keepAlive: false
        }
    }

]


const router = createRouter({
    history: createWebHashHistory(),
    routes,
});


router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()

    // 检查并恢复登录状态（从 localStorage）
    authStore.checkAuthState()

    // 访问根路径时重定向到登录页并清除登录状态
    if (to.path === '/') {
        authStore.logout()
        return '/login'
    }

    // 访问登录页或注册页时
    if (to.path === '/login' || to.path === '/register') {
        // 用户主动导航到登录页（非页面刷新），清除登录状态
        // 判断方式：from.path 不为空说明是导航而非刷新
        if (from.path && from.path !== '/' && from.path !== to.path) {
            authStore.logout()
        }
        // 允许访问登录页
        return true
    }

    // 监护人端页面保护
    if (to.path.startsWith('/childHome') || to.path.startsWith('/alerts')) {
        if (!authStore.isAuthenticated) {
            return '/login'
        }
        if (authStore.loginType !== 'child') {
            return '/index/home'
        }
        return true
    }

    // 用户端页面保护
    if (to.path.startsWith('/index')) {
        if (!authStore.isAuthenticated) {
            return '/login'
        }
        if (authStore.loginType !== 'user') {
            return '/childHome'
        }
        return true
    }

    // 其他页面正常访问
    return true
})



export default router;
