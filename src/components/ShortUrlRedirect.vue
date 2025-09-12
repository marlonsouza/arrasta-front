<template>
  <div class="redirect-loading">
    <div v-if="loading" class="loading-message">
      <div class="loading-spinner">⏳</div>
      <h2>Redirecionando...</h2>
      <p>Aguarde um momento, estamos te levando para o destino! 🚀</p>
      <div class="loading-bar">
        <div class="loading-progress"></div>
      </div>
    </div>
    
    <div v-if="error" class="error-container">
      <div class="error-icon">🔗💔</div>
      <h1>Oops! Link não encontrado</h1>
      <div class="error-details">
        <h3>O que aconteceu?</h3>
        <p class="error-message">{{ error }}</p>
        
        <div class="possible-reasons">
          <h4>Possíveis motivos:</h4>
          <ul>
            <li>💀 O link pode ter expirado</li>
            <li>✏️ Pode haver um erro de digitação na URL</li>
            <li>🗑️ O link pode ter sido removido pelo criador</li>
            <li>🔒 O link pode estar temporariamente indisponível</li>
          </ul>
        </div>

        <div class="suggestions">
          <h4>O que você pode fazer:</h4>
          <ul>
            <li>🔍 Verifique se a URL está correta</li>
            <li>👤 Entre em contato com quem compartilhou o link</li>
            <li>🔄 Tente novamente mais tarde</li>
            <li>➕ Crie um novo link encurtado</li>
          </ul>
        </div>
      </div>
      
      <div class="navigation-buttons">
        <router-link to="/@/" class="nav-button primary">
          🚀 Criar um novo link
        </router-link>
        <router-link to="/@/lookup" class="nav-button secondary">
          🔍 Consultar um link
        </router-link>
      </div>

      <div class="help-section">
        <p class="help-text">
          Precisa de ajuda? O <strong>Arrasta.click</strong> está aqui para facilitar sua vida com links mais curtos e práticos! 
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShortUrlRedirect',
  props: {
    shortCode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: null
    };
  },
  async mounted() {
    await this.redirectToOriginalUrl();
  },
  methods: {
    async redirectToOriginalUrl() {
      try {
        const response = await fetch(`https://arrasta.click/info/${this.shortCode}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            this.error = `O link arrasta.click/${this.shortCode} não foi encontrado em nossos servidores. Pode ter expirado ou nunca ter existido.`;
          } else {
            this.error = 'Algo deu errado ao buscar o link no Arrasta.click. Tente novamente em alguns instantes!';
          }
          this.loading = false;
          return;
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // If it's HTML (like a "Not Found" page), treat as 404
          this.error = `O link arrasta.click/${this.shortCode} não foi encontrado. Pode ter expirado, sido removido ou nunca ter existido em nossa plataforma.`;
          this.loading = false;
          return;
        }

        const data = await response.json();
        
        // Redirect to the original URL
        if (data.originalUrl) {
          window.location.href = data.originalUrl;
        } else {
          this.error = 'Link do Arrasta.click inválido ou corrompido. Entre em contato conosco se o problema persistir.';
          this.loading = false;
        }
        
      } catch (error) {
        console.error('Error redirecting:', error);
        // If it's a JSON parsing error, it's likely an HTML response (404 page)
        if (error.message.includes('JSON')) {
          this.error = `O link arrasta.click/${this.shortCode} não foi encontrado em nossos servidores. Pode ter sido removido ou nunca ter existido.`;
        } else {
          this.error = 'Não foi possível conectar com os servidores do Arrasta.click. Verifique sua conexão e tente novamente!';
        }
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.redirect-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f4f4f9 0%, #e8e8f0 100%);
}

/* Loading Styles */
.loading-message {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.loading-spinner {
  font-size: 3em;
  animation: spin 2s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message h2 {
  font-family: 'Oswald', serif;
  color: #333;
  font-size: 2.5em;
  margin-bottom: 15px;
}

.loading-message p {
  color: #666;
  font-size: 1.2em;
  margin-bottom: 25px;
}

.loading-bar {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(45deg, #28a745, #20c997);
  width: 0%;
  animation: loading 3s ease-in-out infinite;
}

@keyframes loading {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

/* Error Styles */
.error-container {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  border-top: 5px solid #dc3545;
}

.error-icon {
  font-size: 4em;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.error-container h1 {
  font-family: 'Oswald', serif;
  color: #dc3545;
  font-size: 3em;
  margin-bottom: 30px;
  font-weight: bold;
}

.error-details {
  text-align: left;
  margin-bottom: 30px;
}

.error-details h3, .error-details h4 {
  font-family: 'Oswald', serif;
  color: #333;
  margin-bottom: 15px;
}

.error-details h3 {
  font-size: 1.5em;
  border-bottom: 2px solid #28a745;
  padding-bottom: 5px;
  display: inline-block;
}

.error-details h4 {
  font-size: 1.2em;
  margin-top: 25px;
  color: #28a745;
}

.error-message {
  background-color: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.possible-reasons, .suggestions {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid #6c757d;
}

.suggestions {
  border-left-color: #28a745;
}

.error-details ul {
  list-style: none;
  padding: 0;
}

.error-details li {
  padding: 8px 0;
  font-size: 1.1em;
  color: #555;
}

/* Navigation Buttons */
.navigation-buttons {
  margin: 30px 0;
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-button {
  display: inline-block;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 1.2em;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
}

.nav-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.nav-button.primary {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
}

.nav-button.primary:hover {
  background: linear-gradient(45deg, #218838, #1ea080);
}

.nav-button.secondary {
  background: linear-gradient(45deg, #007bff, #6610f2);
  color: white;
}

.nav-button.secondary:hover {
  background: linear-gradient(45deg, #0056b3, #520dc2);
}

/* Help Section */
.help-section {
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(45deg, #e3f2fd, #f3e5f5);
  border-radius: 10px;
  border: 1px solid #e1bee7;
}

.help-text {
  color: #555;
  font-size: 1.1em;
  margin: 0;
  font-style: italic;
}

.help-text strong {
  color: #28a745;
  font-weight: bold;
}

/* Responsive */
@media (max-width: 600px) {
  .error-container {
    padding: 20px;
    margin: 10px;
  }
  
  .error-container h1 {
    font-size: 2.2em;
  }
  
  .navigation-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-button {
    width: 100%;
    max-width: 280px;
  }
}
</style>