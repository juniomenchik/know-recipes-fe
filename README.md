# 🍳 Know Recipes - Vue.js

Site de compartilhamento de receitas desenvolvido com Vue.js 3 e integração com API REST.

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Backend rodando em `http://localhost:8080`

## 🚀 Como executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O site estará disponível em: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
know-recipes-vue/
├── src/
│   ├── views/           # Páginas da aplicação
│   │   ├── Login.vue    # Tela de login/registro
│   │   ├── Feed.vue     # Feed público de receitas
│   │   └── Profile.vue  # Perfil e minhas receitas
│   ├── services/
│   │   └── api.js       # Serviço de comunicação com API
│   ├── router/
│   │   └── index.js     # Configuração de rotas
│   ├── App.vue          # Componente raiz
│   └── main.js          # Ponto de entrada
├── index.html
├── vite.config.js
└── package.json
```

## 🎯 Funcionalidades

### Tela de Login (`/login`)
- Login e registro de usuários
- Validação de formulários
- Autenticação JWT
- Logins rápidos para teste (admin, jeff, guest)

### Feed (`/feed`)
- Visualização de receitas públicas
- Busca em tempo real
- Paginação
- Acesso sem autenticação

### Perfil (`/profile`)
- Gerenciamento de receitas pessoais
- Criação de novas receitas
- Edição e exclusão
- Busca nas próprias receitas
- Receitas públicas e privadas
- Estatísticas do usuário

## 🔑 Conceitos Vue.js Aplicados

### 1. **Componentes**
Cada tela é um componente Vue com:
- `<template>`: HTML da interface
- `<script>`: Lógica JavaScript
- `<style scoped>`: CSS isolado do componente

### 2. **Reatividade**
```javascript
data() {
  return {
    recipes: [],      // Array reativo
    loading: false    // Boolean reativo
  }
}
```

### 3. **Métodos**
```javascript
methods: {
  async loadRecipes() {
    this.loading = true
    const response = await api.getPublicRecipes()
    this.recipes = response.data
    this.loading = false
  }
}
```

### 4. **Computed Properties**
```javascript
computed: {
  isAuthenticated() {
    return !!localStorage.getItem('token')
  }
}
```

### 5. **Lifecycle Hooks**
```javascript
mounted() {
  this.loadRecipes()  // Executa quando componente é montado
}
```

### 6. **Diretivas**
- `v-if`: Renderização condicional
- `v-for`: Loop em arrays
- `v-model`: Two-way binding
- `v-on` / `@`: Event listeners
- `v-bind` / `:`: Bind de atributos

### 7. **Vue Router**
Navegação entre páginas:
```javascript
this.$router.push('/feed')
```

### 8. **Event Handling**
```vue
<button @click="saveRecipe">Salvar</button>
<input @input="handleSearch" />
<form @submit.prevent="handleSubmit">
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Token) armazenado no localStorage:

```javascript
// Salvar token após login
localStorage.setItem('token', response.data.token)

// Interceptor do Axios adiciona token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## 🎨 Estilização

- CSS puro com `scoped` para isolamento
- Gradientes modernos
- Animações suaves
- Design responsivo
- Sistema de grid CSS

## 📡 Integração com API

O arquivo `services/api.js` centraliza todas as chamadas:

```javascript
// Exemplo de uso
import api from '@/services/api'

async loadRecipes() {
  const response = await api.getPublicRecipes(0, 20)
  this.recipes = response.data.content
}
```

## 🧪 Testando a Aplicação

1. Certifique-se que o backend está rodando
2. Execute `npm run dev`
3. Acesse `http://localhost:3000`
4. Use um dos logins rápidos ou crie uma conta
5. Explore as funcionalidades!

## 📚 Aprendizados Importantes

### Single File Components (SFC)
Cada `.vue` contém HTML, JS e CSS juntos.

### Reatividade
Vue rastreia mudanças em `data()` e atualiza a UI automaticamente.

### Props e Events
Comunicação entre componentes (não usado neste projeto básico).

### Axios
Cliente HTTP para chamadas à API.

### Router Guards
Proteção de rotas autenticadas.

## 🔄 Fluxo da Aplicação

```
1. Usuário acessa /login
2. Faz login → Token salvo no localStorage
3. Redirecionado para /feed
4. Pode navegar para /profile (protegido)
5. Logout → Token removido → Volta para /login
```

## 🐛 Troubleshooting

**Erro de CORS:**
- Configure o backend para aceitar requisições do frontend

**Token não funciona:**
- Verifique se o backend está rodando
- Limpe o localStorage: `localStorage.clear()`

**Receitas não carregam:**
- Abra o console do navegador (F12)
- Verifique se há erros de rede
- Confirme que a baseURL está correta

## 📖 Próximos Passos

Para aprofundar seus estudos:

1. **Vuex/Pinia**: Gerenciamento de estado global
2. **Composition API**: Alternativa à Options API
3. **TypeScript**: Tipagem estática
4. **Testes**: Jest/Vitest
5. **Otimizações**: Lazy loading, code splitting
6. **PWA**: Transformar em Progressive Web App

## 🤝 Contribuindo

Este é um projeto educacional. Sinta-se livre para:
- Adicionar novas funcionalidades
- Melhorar a UI/UX
- Refatorar código
- Adicionar testes

---

Desenvolvido como material didático para aprendizado de Vue.js 3
