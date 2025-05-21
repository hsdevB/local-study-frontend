import { createRouter, createWebHistory } from 'vue-router'
import Mainpage from '@/pages/mainpage/Mainpage.vue'
import Login from '@/pages/login/login.vue'
import Signup from '@/pages/signup/Signup.vue'
import FindPassword from '@/pages/login/FindPassword.vue'
import Mypage from '@/pages/mypage/Mypage.vue'
import CreateStudy from '@/pages/create-study/CreateStudy.vue'
import StudyDetail from '@/pages/study/StudyDetail.vue'

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
    },
    {
      path: '/mypage',
      name: 'Mypage',
      component: Mypage,
      meta: { requiresAuth: true }
    },
    {
      path: '/create-study',
      name: 'create-study',
      component: CreateStudy,
      meta: { requiresAuth: true }
    },
    {
      path: '/study/:id',
      name: 'study-detail',
      component: StudyDetail
    }
  ]
})

export default router
