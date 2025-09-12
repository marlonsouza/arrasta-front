<template>
  <div class="url-shortener">
    <div class="container">
      <div class="header-section">
        <div class="logo-icon">🚀</div>
        <h1>Arrasta.click</h1>
        <p class="subtitle">Transforme links longos em URLs curtas e elegantes! ✨</p>
      </div>

      <div class="form-section">
        <div class="form-group">
          <label for="url-input">🔗 URL para encurtar:</label>
          <input 
            id="url-input"
            type="text" 
            v-model="urlInput" 
            placeholder="Cole seu link aqui (ex: https://exemplo.com/pagina-muito-longa)"
            class="main-input"
          >
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label for="alias-input">🏷️ Alias personalizado (opcional):</label>
            <input 
              id="alias-input"
              type="text" 
              v-model="customAlias" 
              placeholder="meulink"
              class="secondary-input"
            >
          </div>

          <div class="form-group half">
            <label for="expiry-input">📅 Data de expiração (automática):</label>
            <div class="date-display">
              <input 
                id="expiry-input"
                type="date" 
                v-model="expiryDate"
                class="secondary-input disabled"
                disabled
                readonly
                title="Data de expiração é automaticamente definida para amanhã"
              >
              <span class="auto-label">Amanhã</span>
            </div>
          </div>
        </div>

        <button @click="shortenUrl" class="primary-button">
          <span class="button-icon">⚡</span>
          Se sabe!
        </button>
      </div>

      <div v-if="shortenedUrl" class="result-section">
        <div class="success-icon">🎉</div>
        <h3>Link criado com sucesso!</h3>
        
        <div class="result-card">
          <div class="result-item">
            <strong>🔗 Seu link arrasta:</strong>
            <div class="link-container">
              <a :href="shortenedUrl" target="_blank" class="short-link">{{ shortenedUrl }}</a>
            </div>
          </div>

          <div class="qr-section">
            <h4>📱 QR Code</h4>
            <div class="qr-container">
              <img :src="qrCode" alt="QR Code" class="qr-image" />
            </div>
          </div>

          <div class="action-buttons">
            <button @click="copyUrl" class="action-button primary">
              📋 Copiar URL
            </button>
            <button @click="downloadQrCode" class="action-button secondary">
              💾 Baixar QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UrlShortener',
  data() {
    return {
      urlInput: '',
      customAlias: '',
      expiryDate: this.getTomorrowDate(),
      shortenedUrl: null,
      qrCode: null,
    };
  },
  methods: {
    getTomorrowDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    },
    async shortenUrl() {
      try {
        const response = await fetch('https://arrasta.click/shorten', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            originalUrl: this.urlInput, 
            customAlias: this.customAlias, 
            expiryDate: this.expiryDate 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to shorten URL');
        }

        const data = await response.json();
        this.shortenedUrl = data.shortUrl;
        this.qrCode = data.qrCode;
      } catch (error) {
        console.error('Error shortening URL:', error);
        alert(error.message);
      }
    },
    
    copyUrl() {
      navigator.clipboard.writeText(this.shortenedUrl)
      .then(() => {
          alert('URL copiada!');
        })
      .catch(err => {
          console.error('Failed to copy URL: ', err);
        });
    },

    downloadQrCode() {
      const link = document.createElement('a');
      link.href = this.qrCode;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>

<style scoped>
.url-shortener {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f4f4f9 0%, #e8e8f0 100%);
}

.container {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;
  border-top: 5px solid #28a745;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 40px;
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
  color: #28a745;
  font-size: 3.5em;
  margin-bottom: 10px;
  font-weight: bold;
}

.subtitle {
  color: #666;
  font-size: 1.3em;
  margin: 0;
  font-style: italic;
}

/* Form Section */
.form-section {
  margin-bottom: 40px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group.half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-group label {
  display: block;
  font-family: 'Oswald', sans-serif;
  color: #333;
  font-size: 1.2em;
  margin-bottom: 8px;
  font-weight: bold;
}

.main-input, .secondary-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1.1em;
  font-family: 'Oswald', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.main-input {
  background: linear-gradient(45deg, #f8f9fa, #ffffff);
  border-color: #28a745;
}

.main-input:focus, .secondary-input:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  transform: translateY(-2px);
}

.secondary-input.disabled {
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  color: #6c757d;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.secondary-input.disabled:focus {
  box-shadow: none;
  transform: none;
  border-color: #dee2e6;
}

.date-display {
  position: relative;
}

.auto-label {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);
}

.primary-button {
  width: 100%;
  padding: 18px 30px;
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Oswald', sans-serif;
  font-size: 1.4em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.primary-button:hover {
  background: linear-gradient(45deg, #218838, #1ea080);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
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

/* Result Section */
.result-section {
  text-align: center;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 2px solid #e0e0e0;
}

.success-icon {
  font-size: 3em;
  margin-bottom: 15px;
  animation: bounce 1s ease-in-out;
}

.result-section h3 {
  font-family: 'Oswald', serif;
  color: #28a745;
  font-size: 2em;
  margin-bottom: 30px;
}

.result-card {
  background: linear-gradient(45deg, #f8f9fa, #ffffff);
  padding: 30px;
  border-radius: 15px;
  border: 2px solid #28a745;
  margin-bottom: 20px;
}

.result-item {
  margin-bottom: 25px;
}

.result-item strong {
  color: #333;
  font-size: 1.2em;
  display: block;
  margin-bottom: 10px;
}

.link-container {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.short-link {
  color: #007bff;
  text-decoration: none;
  font-size: 1.3em;
  font-weight: bold;
  word-break: break-all;
}

.short-link:hover {
  text-decoration: underline;
}

.qr-section h4 {
  font-family: 'Oswald', serif;
  color: #333;
  font-size: 1.4em;
  margin-bottom: 15px;
}

.qr-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
  display: inline-block;
}

.qr-image {
  max-width: 200px;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
  flex-wrap: wrap;
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

.action-button.primary {
  background: linear-gradient(45deg, #007bff, #6610f2);
  color: white;
}

.action-button.primary:hover {
  background: linear-gradient(45deg, #0056b3, #520dc2);
  transform: translateY(-2px);
}

.action-button.secondary {
  background: linear-gradient(45deg, #6c757d, #495057);
  color: white;
}

.action-button.secondary:hover {
  background: linear-gradient(45deg, #545b62, #3a3f44);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 600px) {
  .container {
    padding: 20px;
    margin: 10px;
  }
  
  .header-section h1 {
    font-size: 2.5em;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-button {
    width: 100%;
    max-width: 280px;
  }
}
</style>