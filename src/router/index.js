import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Feed from '../views/Feed.vue'
import Profile from '../views/Profile.vue'

const routes = [
  {
    path: '/',
    redirect: '/feed'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/feed',
    name: 'Feed',
    component: Feed,
    meta: { requiresAuth: false } // Feed é público
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegação
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redireciona para login se a rota requer autenticação
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Redireciona para feed se já está logado e tenta acessar login
    next('/feed')
  } else {
    next()
  }
})

export default router
