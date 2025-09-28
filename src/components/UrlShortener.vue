<template>
  <div class="url-shortener">
    <div class="container">
      <div class="header-section">
        <h1>Arrasta.click</h1>
        <p class="subtitle">Transforme links longos em URLs curtas e elegantes! 🌟</p>
      </div>

      <div class="form-section">
        <div class="form-group">
          <label for="url-input">⛓️ URL para encurtar:</label>
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
            <label for="alias-input">🔖 Alias personalizado (opcional):</label>
            <input
              id="alias-input"
              type="text"
              v-model="customAlias"
              placeholder="meulink"
              class="secondary-input"
              @input="validateAlias"
            >
          </div>

          <div class="form-group half">
            <label for="expiry-input">🗓️ Data de expiração:</label>
            <div class="date-display">
              <input
                id="expiry-input"
                type="text"
                v-model="expiryDateFormatted"
                class="secondary-input disabled"
                disabled
                readonly
                :title="isPremium ? 'URLs premium expiram em 7 dias' : 'URLs gratuitas expiram amanhã'"
                placeholder="dd/mm/aaaa"
              >
              <span class="auto-label">{{ isPremium ? '7 dias' : 'Amanhã' }}</span>
            </div>
          </div>
        </div>

        <!-- Premium Option -->
        <div v-if="showPremiumOption" class="premium-section">
          <h3>💎 Opções de Duração</h3>
          <div class="plan-options">
            <div class="plan-option" :class="{ active: !isPremium }" @click="selectPlan(false)">
              <div class="plan-header">
                <span class="plan-icon">🆓</span>
                <span class="plan-name">Gratuito</span>
              </div>
              <div class="plan-details">
                <div class="plan-price">R$ 0,00</div>
                <div class="plan-duration">Expira amanhã</div>
              </div>
            </div>

            <div class="plan-option premium" :class="{ active: isPremium }" @click="selectPlan(true)">
              <div class="plan-header">
                <span class="plan-icon">💎</span>
                <span class="plan-name">Premium</span>
                <span class="plan-badge">RECOMENDADO</span>
              </div>
              <div class="plan-details">
                <div class="plan-price">R$ 9,90</div>
                <div class="plan-duration">Expira em 7 dias</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Produção sem feature flag -->
        <div v-if="isProduction && !isPremiumFeatureEnabled" class="production-notice">
          <p>🚀 <strong>Versão de Produção</strong> - URLs gratuitas disponíveis</p>
        </div>

        <button @click="shortenUrl" class="primary-button" :disabled="isProcessing || paymentLoading">
          <span v-if="isProcessing || paymentLoading">
            {{ isPremium ? '💎 Processando Pagamento...' : '⏳ Criando URL...' }}
          </span>
          <span v-else>
            {{ isPremium ? '💎 Pagar e Criar URL (R$ 9,90)' : '🆓 Criar URL Grátis' }}
          </span>
        </button>
      </div>

      <div v-if="shortenedUrl" class="result-section">
        <div class="success-icon">🌃</div>
        <h3>Link criado com sucesso!</h3>
        
        <div class="result-card">
          <div class="result-item">
            <strong>⛓️ Seu link arrasta:</strong>
            <div class="link-container">
              <a :href="shortenedUrl" target="_blank" class="short-link">{{ shortenedUrl }}</a>
            </div>
          </div>

          <div class="qr-section">
            <h4>🌐 QR Code</h4>
            <div class="qr-container">
              <img :src="qrCode" alt="QR Code" class="qr-image" />
            </div>
          </div>

          <div class="action-buttons">
            <button @click="copyUrl" class="action-button primary">
              📝 Copiar URL
            </button>
            <button @click="downloadQrCode" class="action-button secondary">
              💿 Baixar QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiConfig from '@/services/apiConfig';
import { useMercadoPago } from '@/composables/useMercadoPago';

export default {
  name: 'UrlShortener',
  setup() {
    const { processPayment, processPaymentWithRedirect, isLoading: paymentLoading } = useMercadoPago();
    return { processPayment, processPaymentWithRedirect, paymentLoading };
  },
  data() {
    return {
      urlInput: '',
      customAlias: '',
      expiryDate: this.getTomorrowDate(),
      shortenedUrl: null,
      qrCode: null,
      isPremium: false,
      isProcessing: false,
      isProduction: process.env.NODE_ENV === 'production',
      isPremiumFeatureEnabled: false,
    };
  },
  computed: {
    expiryDateFormatted() {
      if (!this.expiryDate) return '';
      const date = new Date(this.expiryDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    showPremiumOption() {
      // Em produção, só mostra se feature=premium na URL
      if (this.isProduction) {
        return this.isPremiumFeatureEnabled;
      }
      // Em desenvolvimento, sempre mostra
      return true;
    }
  },
  watch: {
    isPremium(newValue) {
      if (newValue) {
        // Premium: 7 dias
        this.expiryDate = this.getSevenDaysDate();
      } else {
        // Gratuito: amanhã
        this.expiryDate = this.getTomorrowDate();
      }
    }
  },
  methods: {
    getTomorrowDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    },
    getSevenDaysDate() {
      const sevenDays = new Date();
      sevenDays.setDate(sevenDays.getDate() + 7);
      return sevenDays.toISOString().split('T')[0];
    },
    selectPlan(premium) {
      // Em produção, não permite selecionar premium se não tiver a feature flag
      if (this.isProduction && premium && !this.isPremiumFeatureEnabled) {
        return;
      }
      this.isPremium = premium;
    },
    async shortenUrl() {
      try {
        this.isProcessing = true;

        // Verificação adicional de segurança para premium em produção
        if (this.isPremium && this.isProduction && !this.isPremiumFeatureEnabled) {
          throw new Error('Funcionalidade premium não habilitada');
        }

        // Se for premium, primeiro processa o pagamento
        if (this.isPremium) {
          await this.processPremiumUrl();
        } else {
          await this.createFreeUrl();
        }
      } catch (error) {
        // Error handling removed for production
      } finally {
        this.isProcessing = false;
      }
    },

    async createFreeUrl() {
      const response = await fetch(apiConfig.getArrastaEndpoints().shorten, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: this.urlInput,
          customAlias: this.customAlias,
          expiryDate: this.expiryDate,
          isPremium: false
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao encurtar URL');
      }

      const data = await response.json();
      this.shortenedUrl = data.shortUrl;
      this.qrCode = data.qrCodeDataURL;
    },

    async processPremiumUrl() {
      try {
        // Preparar dados da URL para envio ao backend
        const urlData = {
          originalUrl: this.urlInput,
          customAlias: this.customAlias,
          expiryDate: this.expiryDate,
          quantity: 1
        };

        // Criar pagamento via backend - agora envia dados da URL junto
        const { preferenceId, sessionId } = await this.createPayment(urlData);

        // Armazenar sessionId para consultar status depois
        sessionStorage.setItem('paymentSessionId', sessionId);

        // Processa o pagamento usando o composable do MercadoPago
        try {
          // Tenta primeiro o método normal (com SDK)
          await this.processPayment(preferenceId, 1);
        } catch (sdkError) {
          // Fallback: usar redirecionamento direto
          await this.processPaymentWithRedirect(preferenceId, 1);
        }

      } catch (error) {
        // Limpar sessionStorage se houver erro
        sessionStorage.removeItem('paymentSessionId');

        // Re-throw com mensagem mais específica
        if (error.message.includes('Failed to initialize MercadoPago SDK')) {
          throw new Error('Erro ao carregar o sistema de pagamento. Verifique sua conexão.');
        } else if (error.message.includes('Failed to create payment preference')) {
          throw new Error('Erro no servidor. Tente novamente em alguns instantes.');
        } else if (error.message.includes('Failed to open checkout')) {
          throw new Error('Erro ao abrir o pagamento. Tente recarregar a página.');
        } else {
          throw new Error(`Erro no pagamento: ${error.message}`);
        }
      }
    },

    async createPayment(urlData) {
      const response = await fetch(apiConfig.getMercadoPagoEndpoints().createPreference, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: urlData.originalUrl,
          customAlias: urlData.customAlias,
          expiryDate: urlData.expiryDate,
          quantity: urlData.quantity || 1
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao criar pagamento');
      }

      const { id: preferenceId, sessionId } = await response.json();
      return { preferenceId, sessionId };
    },


    getSessionIdFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('session_id');
    },

    
    copyUrl() {
      navigator.clipboard.writeText(this.shortenedUrl)
      .then(() => {
        })
      .catch(() => {
        // Error handling removed for production
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

    validateAlias(event) {
      const value = event.target.value;
      if (value.includes('@')) {
        this.customAlias = value.replace(/@/g, '');
      }
    },

    checkFeatureFlags() {
      // Verifica query parameters para feature flags
      const urlParams = new URLSearchParams(window.location.search);
      const featureParam = urlParams.get('feature');

      // Habilita premium se feature=premium na URL
      if (featureParam === 'premium') {
        this.isPremiumFeatureEnabled = true;
      }
    },


  },

  mounted() {
    // Verificar feature flags primeiro
    this.checkFeatureFlags();
  }
};
</script>

<style scoped>
.url-shortener {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  box-sizing: border-box;
}

.container {
  background: #1f1f1f;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  max-width: 700px;
  width: 100%;
  border-top: 5px solid #C14A09;
  border: 1px solid #333;
  margin: 20px auto;
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
  color: #e0e0e0;
  font-size: 1.2em;
  margin-bottom: 8px;
  font-weight: bold;
}

.main-input, .secondary-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #444;
  border-radius: 10px;
  font-size: 1.1em;
  font-family: 'Oswald', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #2a2a2a;
  color: #e0e0e0;
}

.main-input {
  background: linear-gradient(45deg, #2a2a2a, #333);
  border-color: #C14A09;
}

.main-input:focus, .secondary-input:focus {
  outline: none;
  border-color: #C14A09;
  box-shadow: 0 0 0 3px rgba(193, 74, 9, 0.2);
  transform: translateY(-2px);
}

.secondary-input.disabled {
  background: linear-gradient(45deg, #2a2a2a, #333);
  color: #777;
  cursor: not-allowed;
  border-color: #555;
}

.secondary-input.disabled:focus {
  box-shadow: none;
  transform: none;
  border-color: #555;
}

.date-display {
  position: relative;
}

.auto-label {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(45deg, #C14A09, #a03f08);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(193, 74, 9, 0.3);
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

/* Result Section */
.result-section {
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

.result-section h3 {
  font-family: 'Oswald', serif;
  color: #C14A09;
  font-size: 2em;
  margin-bottom: 30px;
}

.result-card {
  background: linear-gradient(45deg, #2a2a2a, #333);
  padding: 30px;
  border-radius: 15px;
  border: 2px solid #C14A09;
  margin-bottom: 20px;
}

.result-item {
  margin-bottom: 25px;
}

.result-item strong {
  color: #e0e0e0;
  font-size: 1.2em;
  display: block;
  margin-bottom: 10px;
}

.link-container {
  background: #1a1a1a;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #444;
}

.short-link {
  color: #C14A09;
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
  color: #e0e0e0;
  font-size: 1.4em;
  margin-bottom: 15px;
}

.qr-container {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #444;
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
  background: linear-gradient(45deg, #C14A09, #d85c0b);
  color: white;
}

.action-button.primary:hover {
  background: linear-gradient(45deg, #a03f08, #8b3507);
  transform: translateY(-2px);
}

.action-button.secondary {
  background: linear-gradient(45deg, #64748b, #475569);
  color: white;
}

.action-button.secondary:hover {
  background: linear-gradient(45deg, #475569, #334155);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 600px) {
  .url-shortener {
    padding: 5px;
    min-height: 100vh;
    align-items: flex-start;
  }

  .container {
    padding: 15px;
    margin: 5px;
    margin-top: 110px;
    min-height: auto;
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

  .result-section {
    margin-top: 20px;
    padding-top: 20px;
  }

  .premium-section {
    margin-bottom: 15px;
  }

  .plan-options {
    flex-direction: column;
    gap: 10px;
  }

  .plan-option {
    width: 100%;
  }
}

/* Premium Plan Styles */
.premium-section {
  background: linear-gradient(135deg, #2a2a2a, #333);
  border-radius: 10px;
  padding: 12px;
  margin: 12px 0;
  border: 1px solid #444;
}

.premium-section h3 {
  margin: 0 0 8px 0;
  color: #C14A09;
  text-align: center;
  font-size: 1.1em;
  font-weight: 600;
  font-family: 'Oswald', sans-serif;
}

.plan-options {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.plan-option {
  flex: 1;
  max-width: 180px;
  background: #1f1f1f;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.plan-option:hover {
  transform: translateY(-2px);
  border-color: #555;
}

.plan-option.active {
  border-color: #C14A09;
  box-shadow: 0 3px 10px rgba(193, 74, 9, 0.3);
}

.plan-option.premium {
  border-color: #C14A09;
}

.plan-option.premium.active {
  border-color: #C14A09;
  box-shadow: 0 3px 15px rgba(193, 74, 9, 0.4);
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  position: relative;
}

.plan-icon {
  font-size: 16px;
}

.plan-name {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0e0;
  font-family: 'Oswald', sans-serif;
}

.plan-badge {
  position: absolute;
  top: -12px;
  right: -8px;
  background: linear-gradient(45deg, #C14A09, #a03f08);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.3px;
  transform: rotate(12deg);
  box-shadow: 0 1px 4px rgba(193, 74, 9, 0.4);
}

.plan-details {
  text-align: center;
}

.plan-price {
  font-size: 18px;
  font-weight: 800;
  color: #C14A09;
  margin-bottom: 4px;
  font-family: 'Oswald', sans-serif;
}

.plan-duration {
  font-size: 11px;
  color: #b0b0b0;
  font-weight: 600;
  margin-bottom: 0;
}

.primary-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.primary-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Production Notice */
.production-notice {
  background: linear-gradient(135deg, #2a2a2a, #333);
  border: 2px solid #4caf50;
  border-radius: 10px;
  padding: 15px;
  margin: 15px 0;
  text-align: center;
}

.production-notice p {
  color: #e0e0e0;
  margin: 0;
  font-size: 1.1em;
}

.production-notice strong {
  color: #4caf50;
}

@media (max-width: 768px) {
  .container {
    margin: 10px;
    padding: 20px;
  }

  .premium-section {
    padding: 12px;
    margin: 10px 0;
  }

  .plan-options {
    flex-direction: column;
    gap: 8px;
  }

  .plan-option {
    max-width: 100%;
    padding: 10px;
  }

  .plan-badge {
    font-size: 7px;
    padding: 2px 4px;
    top: -10px;
    right: -6px;
  }

  .plan-price {
    font-size: 16px;
  }

  .plan-duration {
    font-size: 10px;
  }

  .production-notice {
    padding: 12px;
    margin: 10px 0;
  }

  .production-notice p {
    font-size: 1em;
  }
}
</style>