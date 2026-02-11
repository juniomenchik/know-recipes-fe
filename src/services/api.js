import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`
})

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default {
  // AUTH
  register(username, email, password) {
    return api.post('/auth/register', { username, email, password })
  },
  
  login(email, password) {
    return api.post('/auth/login', { email, password })
  },

  // RECIPES - Public
  getPublicFeed() {
    return api.get('/recipes/public/feed')
  },

  getPublicRecipes(page = 0, size = 20) {
    return api.get('/recipes/public', { params: { page, size } })
  },

  searchPublicRecipes(query, page = 0, size = 20) {
    return api.get('/recipes/search/public', { params: { q: query, page, size } })
  },

  getPublicRecipeById(id) {
    return api.get(`/recipes/public/${id}`)
  },

  // RECIPES - Protected
  createRecipe(recipeData) {
    return api.post('/recipes', recipeData)
  },

  updateRecipe(id, recipeData) {
    return api.put(`/recipes/${id}`, recipeData)
  },

  deleteRecipe(id) {
    return api.delete(`/recipes/${id}`)
  },

  getMyRecipes(page = 0, size = 20) {
    return api.get('/recipes/my', { params: { page, size } })
  },

  searchMyRecipes(query, page = 0, size = 20) {
    return api.get('/recipes/search/my', { params: { q: query, page, size } })
  },

  getMyStats() {
    return api.get('/recipes/my/stats')
  },

  getRecipeById(id) {
    return api.get(`/recipes/${id}`)
  }
}
