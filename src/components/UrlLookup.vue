<template>
  <div class="url-lookup">
    <div class="container">
      <div class="header-section">
        <div class="logo-icon">🌌</div>
        <h1>Consultar Link</h1>
        <p class="subtitle">Descubra informações detalhadas sobre qualquer link do Arrasta.click! 🌃</p>
      </div>

      <div class="form-section">
        <div class="form-group">
          <label for="shortcode-input">⛓️ Código do link:</label>
          <input 
            id="shortcode-input"
            type="text" 
            v-model="shortCodeInput" 
            placeholder="Digite o código do link (ex: info, abc123)"
            class="main-input"
          >
        </div>

        <button @click="getUrlInfo" class="primary-button">
          <span class="button-icon">🌐</span>
          Consultar Informações
        </button>
      </div>

      <div v-if="errorMessage" class="error-section">
        <div class="error-icon">🚨</div>
        <div class="error-message">
          {{ errorMessage }}
        </div>
      </div>

      <div v-if="urlInfo" class="info-section">
        <div class="success-icon">🌌</div>
        <h3>Informações do Link</h3>
        
        <div class="info-card">
          <div class="info-grid">
            <div class="info-item primary">
              <div class="info-label">🔖 Código:</div>
              <div class="info-value">{{ urlInfo.shortCode }}</div>
            </div>

            <div class="info-item primary">
              <div class="info-label">⛓️ URL Original:</div>
              <div class="info-value">
                <a :href="urlInfo.originalUrl" target="_blank" class="original-link">
                  {{ urlInfo.originalUrl }}
                </a>
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">🔖 Alias Personalizado:</div>
              <div class="info-value">{{ urlInfo.customAlias || 'Não definido' }}</div>
            </div>

            <div class="info-item highlight">
              <div class="info-label">🌌 Total de Acessos:</div>
              <div class="info-value access-count">{{ urlInfo.accessNumber }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">🌃 Criado em:</div>
              <div class="info-value">{{ formatDate(urlInfo.createdAt) }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">🌙 Expira em:</div>
              <div class="info-value">{{ formatDate(urlInfo.expiryDate) }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">🌌 Usuário:</div>
              <div class="info-value">{{ urlInfo.userId }}</div>
            </div>
          </div>

          <div v-if="urlInfo.qrCodeDataURL" class="qr-section">
            <h4>🌐 QR Code</h4>
            <div class="qr-container">
              <img :src="urlInfo.qrCodeDataURL" alt="QR Code" class="qr-image" />
            </div>
            <button @click="downloadInfoQrCode" class="action-button secondary">
              💿 Baixar QR Code
            </button>
          </div>

          <div class="navigation-buttons">
            <router-link to="/@/" class="nav-button primary">
              🌙 Encurtar Novo Link
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UrlLookup',
  props: {
    shortCode: String
  },
  data() {
    return {
      shortCodeInput: this.shortCode || '',
      urlInfo: null,
      errorMessage: '',
    };
  },
  mounted() {
    if (this.shortCode) {
      this.getUrlInfo();
    }
  },
  methods: {
    async getUrlInfo() {
      this.errorMessage = '';
      this.urlInfo = null;
      
      try {
        const response = await fetch(`https://arrasta.click/info/${this.shortCodeInput}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            this.errorMessage = `Ops! Não encontramos nenhum link com o código "${this.shortCodeInput}". Verifique se digitou corretamente! 🤔`;
          } else {
            const errorData = await response.json();
            this.errorMessage = errorData.error || 'Algo deu errado ao buscar as informações. Tente novamente!';
          }
          return;
        }

        const data = await response.json();
        this.urlInfo = data;
      } catch (error) {
        console.error('Error getting URL info:', error);
        this.errorMessage = 'Não foi possível conectar com o servidor. Verifique sua conexão! 🌐';
      }
    },

    downloadInfoQrCode() {
      if (this.urlInfo && this.urlInfo.qrCodeDataURL) {
        const link = document.createElement('a');
        link.href = this.urlInfo.qrCodeDataURL;
        link.download = `qrcode-${this.urlInfo.shortCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
};
</script>

<style scoped>
.url-lookup {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  overflow-y: auto;
  box-sizing: border-box;
}

.container {
  background: #1f1f1f;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  max-width: 800px;
  width: 100%;
  border-top: 5px solid #C14A09;
  border: 1px solid #333;
  margin-top: 80px;
  max-height: calc(100vh - 90px);
  overflow-y: auto;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 4em;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.header-section h1 {
  font-family: 'Oswald', serif;
  color: #C14A09;
  font-size: 2.8em;
  margin-bottom: 8px;
  font-weight: bold;
}

.subtitle {
  color: #b0b0b0;
  font-size: 1.3em;
  margin: 0;
  font-style: italic;
}

/* Form Section */
.form-section {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-family: 'Oswald', sans-serif;
  color: #e0e0e0;
  font-size: 1.2em;
  margin-bottom: 8px;
  font-weight: bold;
}

.main-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #C14A09;
  border-radius: 10px;
  font-size: 1.1em;
  font-family: 'Oswald', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: linear-gradient(45deg, #2a2a2a, #333);
  color: #e0e0e0;
}

.main-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(193, 74, 9, 0.2);
  transform: translateY(-2px);
}

.primary-button {
  width: 100%;
  padding: 18px 30px;
  background: linear-gradient(45deg, #C14A09, #a03f08);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Oswald', sans-serif;
  font-size: 1.4em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(193, 74, 9, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.primary-button:hover {
  background: linear-gradient(45deg, #a03f08, #8b3507);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(193, 74, 9, 0.4);
}

.button-icon {
  font-size: 1.2em;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Error Section */
.error-section {
  text-align: center;
  margin: 30px 0;
  padding: 30px;
  background: linear-gradient(45deg, #2d1f1f, #3d2222);
  border-radius: 15px;
  border: 2px solid #ef4444;
}

.error-icon {
  font-size: 3em;
  margin-bottom: 15px;
  animation: shake 0.8s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-message {
  color: #ef4444;
  font-size: 1.2em;
  font-weight: bold;
  margin: 0;
}

/* Info Section */
.info-section {
  text-align: center;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 2px solid #444;
}

.success-icon {
  font-size: 3em;
  margin-bottom: 15px;
  animation: bounce 1s ease-in-out;
}

.info-section h3 {
  font-family: 'Oswald', serif;
  color: #C14A09;
  font-size: 2em;
  margin-bottom: 30px;
}

.info-card {
  background: linear-gradient(45deg, #2a2a2a, #333);
  padding: 30px;
  border-radius: 15px;
  border: 2px solid #C14A09;
  text-align: left;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.info-item {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 12px;
  border-left: 5px solid #64748b;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.info-item.primary {
  border-left-color: #C14A09;
  background: linear-gradient(45deg, #1e1b3a, #2a2a2a);
}

.info-item.highlight {
  border-left-color: #10b981;
  background: linear-gradient(45deg, #1a2e1a, #2a2a2a);
}

.info-label {
  font-family: 'Oswald', sans-serif;
  font-weight: bold;
  color: #e0e0e0;
  font-size: 1.1em;
  margin-bottom: 8px;
}

.info-value {
  color: #b0b0b0;
  font-size: 1.1em;
  word-break: break-word;
}

.access-count {
  font-size: 1.5em;
  font-weight: bold;
  color: #10b981;
}

.original-link {
  color: #C14A09;
  text-decoration: none;
  font-weight: bold;
}

.original-link:hover {
  text-decoration: underline;
}

.qr-section {
  text-align: center;
  margin: 30px 0;
  padding: 25px;
  background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
  border-radius: 15px;
  border: 2px solid #333;
}

.qr-section h4 {
  font-family: 'Oswald', serif;
  color: #e0e0e0;
  font-size: 1.4em;
  margin-bottom: 20px;
}

.qr-container {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #444;
  display: inline-block;
  margin-bottom: 20px;
}

.qr-image {
  max-width: 200px;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.action-button {
  padding: 12px 25px;
  border: none;
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-button.secondary {
  background: linear-gradient(45deg, #64748b, #475569);
  color: white;
}

.action-button.secondary:hover {
  background: linear-gradient(45deg, #475569, #334155);
  transform: translateY(-2px);
}

.navigation-buttons {
  text-align: center;
  margin-top: 30px;
}

.nav-button {
  display: inline-block;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 12px;
  font-family: 'Oswald', sans-serif;
  font-size: 1.2em;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.nav-button.primary {
  background: linear-gradient(45deg, #C14A09, #a03f08);
  color: white;
}

.nav-button.primary:hover {
  background: linear-gradient(45deg, #9c6eff, #7c3aed);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(193, 74, 9, 0.3);
}

/* Responsive */
@media (min-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .url-lookup {
    padding: 5px;
  }

  .container {
    padding: 15px;
    margin: 5px;
    margin-top: 110px;
    max-height: calc(100vh - 115px);
  }

  .header-section h1 {
    font-size: 2.2em;
  }

  .header-section {
    margin-bottom: 15px;
  }

  .form-section {
    margin-bottom: 15px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .nav-button {
    width: 100%;
    max-width: 280px;
  }

  .info-section {
    margin-top: 20px;
    padding-top: 20px;
  }

  .info-grid {
    gap: 15px;
    margin-bottom: 20px;
  }

  .qr-section {
    margin: 20px 0;
    padding: 20px;
  }
}
</style>