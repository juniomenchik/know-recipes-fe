<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🍳 Know Recipes</h1>
      <p class="subtitle">Compartilhe suas receitas favoritas</p>

      <!-- Abas de Login/Registro -->
      <div class="tabs">
        <button 
          :class="{ active: !isRegister }" 
          @click="isRegister = false"
        >
          Entrar
        </button>
        <button 
          :class="{ active: isRegister }" 
          @click="isRegister = true"
        >
          Registrar
        </button>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleSubmit">
        <!-- Campo Username (apenas no registro) -->
        <div v-if="isRegister" class="form-group">
          <label>Nome de usuário</label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="maria_silva"
            required
          />
        </div>

        <!-- Campo Email -->
        <div class="form-group">
          <label>E-mail</label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="seu@email.com"
            required
          />
        </div>

        <!-- Campo Senha -->
        <div class="form-group">
          <label>Senha</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="••••••"
            required
          />
        </div>

        <!-- Mensagem de erro -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Botão de submit -->
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Aguarde...' : (isRegister ? 'Criar Conta' : 'Entrar') }}
        </button>
      </form>

      <!-- Link para login rápido (dev) -->
      <div class="quick-login">
        <p>Teste rápido:</p>
        <button @click="quickLogin('admin')" class="quick-btn">Admin</button>
        <button @click="quickLogin('jeff')" class="quick-btn">Jeff</button>
        <button @click="quickLogin('guest')" class="quick-btn">Guest</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Login',
  data() {
    return {
      isRegister: false,
      form: {
        username: '',
        email: '',
        password: ''
      },
      error: '',
      loading: false
    }
  },
  methods: {
    async handleSubmit() {
      this.error = ''
      this.loading = true

      try {
        let response
        
        if (this.isRegister) {
          // Registro
          response = await api.register(
            this.form.username,
            this.form.email,
            this.form.password
          )
        } else {
          // Login
          response = await api.login(
            this.form.email,
            this.form.password
          )
        }

        // Salva o token e dados do usuário
        const { token, userId, email, username } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('userId', userId)
        localStorage.setItem('userEmail', email)
        if (username) localStorage.setItem('username', username)

        // Redireciona para o feed
        this.$router.push('/feed')
        
      } catch (err) {
        console.error('Erro:', err)
        this.error = err.response?.data?.message || 'Erro ao processar. Tente novamente.'
      } finally {
        this.loading = false
      }
    },

    async quickLogin(user) {
      const credentials = {
        admin: { email: 'admin@knowrecipes.com', password: 'password123' },
        jeff: { email: 'jeff@knowrecipes.com', password: 'password123' },
        guest: { email: 'guest@knowrecipes.com', password: 'password123' }
      }

      this.form.email = credentials[user].email
      this.form.password = credentials[user].password
      this.isRegister = false
      await this.handleSubmit()
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 8px;
  font-size: 32px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tabs button.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-login {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.quick-login p {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.quick-btn {
  margin: 0 4px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: background 0.2s;
}

.quick-btn:hover {
  background: #e0e0e0;
}
</style>
