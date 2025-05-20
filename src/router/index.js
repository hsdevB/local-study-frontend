import { createRouter, createWebHistory } from 'vue-router'
import Mainpage from '@/pages/mainpage/Mainpage.vue'
import Login from '@/pages/login/login.vue'
import Signup from '@/pages/signup/Signup.vue'
import FindPassword from '@/pages/login/FindPassword.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'mainpage',
      component: Mainpage
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/find-password',
      name: 'find-password',
      component: FindPassword
    }
  ]
})

export default router
