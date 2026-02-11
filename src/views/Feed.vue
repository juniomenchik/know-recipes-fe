<template>
  <div class="feed-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1>🍳 Know Recipes</h1>
        <div class="header-actions">
          <button 
            v-if="isAuthenticated" 
            @click="$router.push('/profile')"
            class="btn-secondary"
          >
            Meu Perfil
          </button>
          <button 
            v-if="!isAuthenticated" 
            @click="$router.push('/login')"
            class="btn-primary"
          >
            Entrar
          </button>
          <button 
            v-if="isAuthenticated" 
            @click="logout"
            class="btn-secondary"
          >
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Barra de busca -->
    <div class="search-bar">
      <div class="search-content">
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Buscar receitas..."
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn">✕</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando receitas...</p>
    </div>

    <!-- Grid de receitas -->
    <div v-else class="recipes-grid">
      <div v-if="recipes.length === 0" class="empty-state">
        <p>{{ searchQuery ? 'Nenhuma receita encontrada' : 'Nenhuma receita disponível' }}</p>
      </div>

      <div 
        v-for="recipe in recipes" 
        :key="recipe.id"
        class="recipe-card"
      >
        <div class="recipe-image">
          <img 
            :src="recipe.imageUrl || 'https://picsum.photos/seed/recipe/400/300'" 
            :alt="recipe.title"
          />
        </div>
        <div class="recipe-content">
          <h3>{{ recipe.title }}</h3>
          <p class="recipe-description">{{ truncate(recipe.description, 120) }}</p>
          <div class="recipe-footer">
            <span class="author">Por {{ recipe.authorUsername }}</span>
            <span class="date">{{ formatDate(recipe.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginação -->
    <div v-if="!loading && totalPages > 1" class="pagination">
      <button 
        @click="previousPage" 
        :disabled="currentPage === 0"
        class="page-btn"
      >
        ← Anterior
      </button>
      <span class="page-info">
        Página {{ currentPage + 1 }} de {{ totalPages }}
      </span>
      <button 
        @click="nextPage" 
        :disabled="currentPage >= totalPages - 1"
        class="page-btn"
      >
        Próxima →
      </button>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Feed',
  data() {
    return {
      recipes: [],
      loading: false,
      searchQuery: '',
      currentPage: 0,
      pageSize: 12,
      totalPages: 1,
      searchTimeout: null
    }
  },
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('token')
    }
  },
  mounted() {
    this.loadRecipes()
  },
  methods: {
    async loadRecipes() {
      this.loading = true
      try {
        let response
        
        if (this.searchQuery.trim()) {
          // Busca com query
          response = await api.searchPublicRecipes(
            this.searchQuery,
            this.currentPage,
            this.pageSize
          )
        } else {
          // Lista paginada
          response = await api.getPublicRecipes(
            this.currentPage,
            this.pageSize
          )
        }

        this.recipes = response.data.content || response.data
        this.totalPages = response.data.totalPages || 1
        
      } catch (error) {
        console.error('Erro ao carregar receitas:', error)
        alert('Erro ao carregar receitas. Verifique se o backend está rodando.')
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      // Debounce: aguarda 500ms após o usuário parar de digitar
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 0
        this.loadRecipes()
      }, 500)
    },

    clearSearch() {
      this.searchQuery = ''
      this.currentPage = 0
      this.loadRecipes()
    },

    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++
        this.loadRecipes()
        window.scrollTo(0, 0)
      }
    },

    previousPage() {
      if (this.currentPage > 0) {
        this.currentPage--
        this.loadRecipes()
        window.scrollTo(0, 0)
      }
    },

    truncate(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    },

    logout() {
      localStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.feed-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Header */
.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 24px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  padding: 10px 24px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

/* Barra de busca */
.search-bar {
  background: white;
  padding: 24px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.search-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.search-content input {
  width: 100%;
  padding: 14px 40px 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.search-content input:focus {
  outline: none;
  border-color: #667eea;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #e0e0e0;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #d0d0d0;
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Grid de receitas */
.recipes-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f0f0f0;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-content {
  padding: 20px;
}

.recipe-content h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 18px;
}

.recipe-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.recipe-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #999;
}

.author {
  font-weight: 600;
  color: #667eea;
}

/* Paginação */
.pagination {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 8px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-weight: 500;
}

/* Responsivo */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .recipes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
