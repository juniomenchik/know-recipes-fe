import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Imprimir variável específica
console.log('🌐 API URL:', import.meta.env.VITE_API_URL)

// Imprimir todas as variáveis
console.log('📦 Todas:', import.meta.env)

// Verificar modo
console.log('🔧 Modo:', import.meta.env.MODE)
console.log('✅ Produção?', import.meta.env.PROD)

createApp(App)
  .use(router)
  .mount('#app')