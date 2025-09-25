<template>
  <div class="payment-result success">
    <div class="result-card">
      <div class="icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#4caf50"/>
          <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h1>Pagamento Aprovado!</h1>
      <p class="status-message">Seu pagamento foi processado com sucesso.</p>

      <div class="payment-details" v-if="paymentInfo">
        <div class="detail-item">
          <span class="label">ID do Pagamento:</span>
          <span class="value">{{ paymentInfo.payment_id }}</span>
        </div>
        <div class="detail-item" v-if="paymentInfo.external_reference">
          <span class="label">Referência:</span>
          <span class="value">{{ paymentInfo.external_reference }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Tipo de Pagamento:</span>
          <span class="value">{{ formatPaymentType(paymentInfo.payment_type) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Status:</span>
          <span class="value success-status">{{ formatStatus(paymentInfo.status) }}</span>
        </div>
      </div>

      <!-- Status da criação da URL -->
      <div v-if="isProcessingUrl" class="url-processing">
        <div class="processing-icon">⏳</div>
        <p>Criando sua URL premium...</p>
        <div class="countdown">Aguarde 5 segundos</div>
      </div>

      <!-- URL criada com sucesso -->
      <div v-else-if="urlCreated && createdUrl" class="url-created">
        <div class="success-icon">🌟</div>
        <h3>URL Premium Criada!</h3>
        <div class="url-display">
          <a :href="createdUrl" target="_blank" class="premium-url">{{ createdUrl }}</a>
        </div>
        <button @click="copyUrl" class="btn copy-btn">📋 Copiar URL</button>
      </div>

      <div class="actions">
        <router-link to="/@/" class="btn primary">Criar Novo Link</router-link>
        <router-link to="/@/lookup" class="btn secondary">Consultar Links</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import apiConfig from '@/services/apiConfig';

export default {
  name: 'PaymentSuccess',
  data() {
    return {
      paymentInfo: null,
      isProcessingUrl: true,
      urlCreated: false,
      createdUrl: null
    }
  },
  mounted() {
    this.extractPaymentInfo();
    this.processPaymentSuccess();
  },
  methods: {
    extractPaymentInfo() {
      const urlParams = new URLSearchParams(window.location.search);
      this.paymentInfo = {
        collection_id: urlParams.get('collection_id'),
        collection_status: urlParams.get('collection_status'),
        payment_id: urlParams.get('payment_id'),
        status: urlParams.get('status'),
        external_reference: urlParams.get('external_reference'),
        payment_type: urlParams.get('payment_type'),
        merchant_order_id: urlParams.get('merchant_order_id'),
        preference_id: urlParams.get('preference_id'),
        site_id: urlParams.get('site_id'),
        processing_mode: urlParams.get('processing_mode')
      };
    },
    formatPaymentType(type) {
      const types = {
        'credit_card': 'Cartão de Crédito',
        'debit_card': 'Cartão de Débito',
        'account_money': 'Dinheiro da Conta MP',
        'bank_transfer': 'Transferência Bancária',
        'ticket': 'Boleto',
        'atm': 'Caixa Eletrônico',
        'digital_currency': 'Moeda Digital',
        'digital_wallet': 'Carteira Digital'
      };
      return types[type] || type;
    },
    formatStatus(status) {
      const statuses = {
        'approved': 'Aprovado',
        'pending': 'Pendente',
        'rejected': 'Rejeitado',
        'cancelled': 'Cancelado',
        'refunded': 'Reembolsado'
      };
      return statuses[status] || status;
    },

    async processPaymentSuccess() {
      try {
        // 1. Recuperar dados do localStorage usando session_id
        const sessionId = this.getSessionIdFromUrl();
        if (!sessionId) {
          console.error('Session ID não encontrado na URL');
          this.isProcessingUrl = false;
          return;
        }

        const pendingKey = `pendingUrl_${sessionId}`;
        const pendingDataStr = localStorage.getItem(pendingKey);

        if (!pendingDataStr) {
          console.error('Dados de pagamento não encontrados no localStorage');
          this.isProcessingUrl = false;
          return;
        }

        const pendingData = JSON.parse(pendingDataStr);

        // 2. Aguardar 5 segundos antes de criar a URL
        setTimeout(async () => {
          try {
            await this.createPremiumUrl(pendingData);

            // Limpar dados do localStorage
            localStorage.removeItem(pendingKey);

            // Limpar parâmetros da URL
            this.cleanUrlParams();

            this.isProcessingUrl = false;
            this.urlCreated = true;

          } catch (error) {
            console.error('Erro ao criar URL premium:', error);
            this.isProcessingUrl = false;
          }
        }, 5000);

      } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        this.isProcessingUrl = false;
      }
    },

    getSessionIdFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('session_id');
    },

    async createPremiumUrl(pendingData) {
      const response = await fetch(apiConfig.getArrastaEndpoints().shorten, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: pendingData.originalUrl,
          customAlias: pendingData.customAlias,
          expiryDate: pendingData.expiryDate,
          isPremium: true,
          paymentId: pendingData.urlId,
          sessionId: pendingData.sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar URL premium');
      }

      const data = await response.json();
      this.createdUrl = data.shortUrl;

      // Opcional: mostrar QR code também
      // this.qrCode = data.qrCodeDataURL;
    },

    cleanUrlParams() {
      // Remove os parâmetros de pagamento da URL
      const url = new URL(window.location);
      url.search = '';
      window.history.replaceState({}, document.title, url);
    },

    copyUrl() {
      if (this.createdUrl) {
        navigator.clipboard.writeText(this.createdUrl)
          .then(() => {
            // Opcional: mostrar feedback visual
          })
          .catch(() => {
            console.error('Erro ao copiar URL');
          });
      }
    }
  }
}
</script>

<style scoped>
.payment-result {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.result-card {
  background: #2d2d2d;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
}

.icon {
  margin-bottom: 20px;
}

.result-card h1 {
  color: #4caf50;
  margin-bottom: 10px;
  font-size: 2em;
}

.status-message {
  color: #e0e0e0;
  margin-bottom: 30px;
  font-size: 1.1em;
}

.payment-details {
  background: #1f1f1f;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
}

.detail-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.label {
  color: #a0a0a0;
  font-weight: 500;
}

.value {
  color: #e0e0e0;
  font-weight: bold;
}

.success-status {
  color: #4caf50;
}

.url-processing, .url-created {
  background: #1f1f1f;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
  border: 2px solid #C14A09;
}

.processing-icon {
  font-size: 3em;
  margin-bottom: 15px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.url-processing p {
  color: #e0e0e0;
  font-size: 1.2em;
  margin-bottom: 10px;
}

.countdown {
  color: #C14A09;
  font-weight: bold;
  font-size: 1.1em;
}

.url-created h3 {
  color: #4caf50;
  margin-bottom: 15px;
  font-size: 1.5em;
}

.url-display {
  background: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  border: 1px solid #444;
}

.premium-url {
  color: #C14A09;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2em;
  word-break: break-all;
}

.premium-url:hover {
  text-decoration: underline;
}

.copy-btn {
  background: linear-gradient(45deg, #4caf50, #45a049);
  margin-top: 10px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 1em;
}

.btn.primary {
  background: linear-gradient(45deg, #C14A09, #a03f08);
  color: white;
}

.btn.primary:hover {
  background: linear-gradient(45deg, #a03f08, #8b3507);
  transform: translateY(-2px);
}

.btn.secondary {
  background: transparent;
  color: #e0e0e0;
  border: 2px solid #333;
}

.btn.secondary:hover {
  background: #333;
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .result-card {
    padding: 20px;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>