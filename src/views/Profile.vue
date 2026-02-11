<template>
  <div class="profile-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1>🍳 Know Recipes</h1>
        <div class="header-actions">
          <button @click="$router.push('/feed')" class="btn-secondary">
            Feed
          </button>
          <button @click="logout" class="btn-secondary">
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Informações do usuário -->
    <div class="user-info">
      <div class="user-info-content">
        <div class="avatar">
          {{ userInitial }}
        </div>
        <div>
          <h2>{{ username }}</h2>
          <p>{{ userEmail }}</p>
        </div>
      </div>
      <div class="stats">
        <div class="stat">
          <span class="stat-number">{{ stats.totalRecipes || 0 }}</span>
          <span class="stat-label">Receitas</span>
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div class="actions-bar">
      <div class="actions-content">
        <button @click="showCreateModal = true" class="btn-primary">
          + Nova Receita
        </button>
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Buscar nas minhas receitas..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando suas receitas...</p>
    </div>

    <!-- Grid de receitas -->
    <div v-else class="recipes-grid">
      <div v-if="recipes.length === 0" class="empty-state">
        <p>{{ searchQuery ? 'Nenhuma receita encontrada' : 'Você ainda não criou nenhuma receita' }}</p>
        <button v-if="!searchQuery" @click="showCreateModal = true" class="btn-primary">
          Criar minha primeira receita
        </button>
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
          <div class="recipe-badge" v-if="recipe.private">
            🔒 Privada
          </div>
        </div>
        <div class="recipe-content">
          <h3>{{ recipe.title }}</h3>
          <p class="recipe-description">{{ truncate(recipe.description, 100) }}</p>
          <div class="recipe-actions">
            <button @click="editRecipe(recipe)" class="btn-edit">
              ✏️ Editar
            </button>
            <button @click="deleteRecipe(recipe.id)" class="btn-delete">
              🗑️ Deletar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Criar/Editar Receita -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingRecipe ? 'Editar Receita' : 'Nova Receita' }}</h2>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="saveRecipe" class="modal-form">
          <div class="form-group">
            <label>Título *</label>
            <input 
              v-model="recipeForm.title" 
              type="text" 
              placeholder="Ex: Bolo de Chocolate"
              required
            />
          </div>

          <div class="form-group">
            <label>Descrição / Receita *</label>
            <textarea 
              v-model="recipeForm.description" 
              placeholder="Ingredientes e modo de preparo..."
              rows="8"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label>URL da Imagem</label>
            <input 
              v-model="recipeForm.imageUrl" 
              type="url" 
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input 
                v-model="recipeForm.isPrivate" 
                type="checkbox"
              />
              <span>Receita privada (só você pode ver)</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-save" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal modal-delete" @click.stop>
        <div class="modal-header">
          <h2>⚠️ Confirmar Exclusão</h2>
          <button @click="closeDeleteModal" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <p>Tem certeza que deseja deletar a receita:</p>
          <p class="recipe-title-delete">"{{ recipeToDelete?.title }}"</p>
          <p class="warning-text">Esta ação não pode ser desfeita!</p>
        </div>

        <div class="modal-actions">
          <button @click="closeDeleteModal" class="btn-cancel">
            Cancelar
          </button>
          <button @click="confirmDelete" class="btn-delete-confirm" :disabled="deleting">
            {{ deleting ? 'Deletando...' : 'Sim, Deletar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Profile',
  data() {
    return {
      username: localStorage.getItem('username') || 'Usuário',
      userEmail: localStorage.getItem('userEmail') || '',
      recipes: [],
      stats: {},
      loading: false,
      searchQuery: '',
      searchTimeout: null,
      showCreateModal: false,
      editingRecipe: null,
      recipeForm: {
        title: '',
        description: '',
        imageUrl: '',
        isPrivate: false
      },
      saving: false,
      showDeleteModal: false,
      recipeToDelete: null,
      deleting: false
    }
  },
  computed: {
    userInitial() {
      return this.username.charAt(0).toUpperCase()
    }
  },
  mounted() {
    this.loadRecipes()
    this.loadStats()
  },
  methods: {
    async loadRecipes() {
      this.loading = true
      try {
        let response
        
        if (this.searchQuery.trim()) {
          response = await api.searchMyRecipes(this.searchQuery)
        } else {
          response = await api.getMyRecipes()
        }

        this.recipes = response.data.content || response.data
        
      } catch (error) {
        console.error('Erro ao carregar receitas:', error)
        if (error.response?.status === 401) {
          this.logout()
        }
      } finally {
        this.loading = false
      }
    },

    async loadStats() {
      try {
        const response = await api.getMyStats()
        this.stats = response.data
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      }
    },

    handleSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.loadRecipes()
      }, 500)
    },

    editRecipe(recipe) {
      this.editingRecipe = recipe
      this.recipeForm = {
        title: recipe.title,
        description: recipe.description,
        imageUrl: recipe.imageUrl || '',
        isPrivate: recipe.private
      }
      this.showCreateModal = true
    },

    async saveRecipe() {
      this.saving = true
      try {
        if (this.editingRecipe) {
          // Atualizar receita existente
          await api.updateRecipe(this.editingRecipe.id, this.recipeForm)
          alert('Receita atualizada com sucesso!')
        } else {
          // Criar nova receita
          await api.createRecipe(this.recipeForm)
          alert('Receita criada com sucesso!')
        }
        
        this.closeModal()
        this.loadRecipes()
        this.loadStats()
        
      } catch (error) {
        console.error('Erro ao salvar receita:', error)
        alert('Erro ao salvar receita. Tente novamente.')
      } finally {
        this.saving = false
      }
    },

    async deleteRecipe(id) {
      const recipe = this.recipes.find(r => r.id === id)
      this.recipeToDelete = recipe
      this.showDeleteModal = true
    },

    async confirmDelete() {
      if (!this.recipeToDelete) return

      this.deleting = true
      try {
        await api.deleteRecipe(this.recipeToDelete.id)
        alert('Receita deletada com sucesso!')
        this.closeDeleteModal()
        this.loadRecipes()
        this.loadStats()
      } catch (error) {
        console.error('Erro ao deletar receita:', error)
        alert('Erro ao deletar receita.')
      } finally {
        this.deleting = false
      }
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.recipeToDelete = null
      this.deleting = false
    },

    closeModal() {
      this.showCreateModal = false
      this.editingRecipe = null
      this.recipeForm = {
        title: '',
        description: '',
        imageUrl: '',
        isPrivate: false
      }
    },

    truncate(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },

    logout() {
      localStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Header */
.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* User Info */
.user-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
}

.user-info-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
}

.user-info h2 {
  font-size: 28px;
  margin-bottom: 4px;
}

.user-info p {
  opacity: 0.9;
  font-size: 16px;
}

.stats {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 32px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* Actions Bar */
.actions-bar {
  background: white;
  padding: 24px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.actions-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 16px;
  align-items: center;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
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

/* Recipes Grid */
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
}

.empty-state p {
  color: #999;
  font-size: 18px;
  margin-bottom: 24px;
}

.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.recipe-card:hover {
  transform: translateY(-4px);
}

.recipe-image {
  position: relative;
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

.recipe-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
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

.recipe-actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-edit:hover {
  background: #bbdefb;
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
}

.btn-delete:hover {
  background: #ffcdd2;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  color: #333;
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 12px 24px;
  background: white;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-save {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal de Exclusão */
.modal-delete {
  max-width: 500px;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  color: #666;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.recipe-title-delete {
  color: #333;
  font-weight: 600;
  font-size: 18px;
  margin: 16px 0;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}

.warning-text {
  color: #c62828;
  font-weight: 600;
  margin-top: 16px;
  font-size: 14px;
}

.btn-delete-confirm {
  padding: 12px 24px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete-confirm:hover:not(:disabled) {
  background: #b71c1c;
}

.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsivo */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .actions-content {
    flex-direction: column;
  }

  .recipes-grid {
    grid-template-columns: 1fr;
  }
}
</style>