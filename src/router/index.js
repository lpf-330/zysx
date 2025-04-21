import component from "element-plus/es/components/tree-select/src/tree-select-option.mjs";
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



export default router;
