<template>
  <div class="payment-success">
    <div class="result-card">
      <div class="icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#4caf50"/>
          <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h2>🎉 Pagamento Aprovado!</h2>
      <p class="status-message">Seu pagamento foi processado com sucesso e sua URL premium foi criada!</p>

      <!-- Informações do pagamento -->
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
          <span class="label">Status:</span>
          <span class="value success-status">{{ formatStatus(paymentInfo.status) }}</span>
        </div>
      </div>

      <!-- URL criada -->
      <div v-if="createdUrl" class="url-result">
        <div class="url-created">
          <div class="success-icon">🌟</div>
          <h3>URL Premium Criada!</h3>
          <div class="url-display">
            <a :href="createdUrl" target="_blank" class="premium-url">{{ createdUrl }}</a>
          </div>
          <button @click="copyUrl" class="btn copy-btn">
            {{ copied ? '✓ Copiado!' : '📋 Copiar URL' }}
          </button>
        </div>

        <div v-if="qrCode" class="qr-code">
          <label>QR Code:</label>
          <img :src="qrCode" alt="QR Code" />
          <button @click="downloadQR" class="download-btn">Baixar QR</button>
        </div>
      </div>

      <!-- Loading state se ainda está processando -->
      <div v-else-if="isProcessing" class="processing-state">
        <div class="processing-icon">⏳</div>
        <p>Processando sua URL premium...</p>
        <p class="processing-note">Se demorar muito, recarregue a página</p>
      </div>

      <div class="actions">
        <router-link to="/@/" class="btn primary">Criar Novo Link</router-link>
        <router-link to="/@/lookup" class="btn secondary">Consultar Links</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentSuccess',
  data() {
    return {
      paymentInfo: null,
      createdUrl: '',
      qrCode: '',
      copied: false,
      isProcessing: false,
      sessionId: ''
    }
  },
  mounted() {
    this.extractPaymentInfo();
    this.checkForCreatedUrl();
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

    async checkForCreatedUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const shortUrl = urlParams.get('short_url');
      const isProcessing = urlParams.get('processing') === 'true';
      const sessionId = urlParams.get('session_id');

      // 🎉 DADOS CHEGAM VIA URL - SEM POLLING!
      if (shortUrl) {
        this.createdUrl = decodeURIComponent(shortUrl);
        // Gerar QR code se necessário (pode vir como parâmetro também)
        this.generateQRCode(this.createdUrl);
        this.isProcessing = false;
        return;
      }

      // Fallback: UMA consulta apenas se em processamento
      if (isProcessing && sessionId) {
        try {
          const response = await fetch(`/.netlify/functions/prefer/urls/check-status/${sessionId}`);
          const data = await response.json();

          if (data.status === 'completed' && data.shortUrl) {
            this.createdUrl = data.shortUrl;
            this.qrCode = data.qrCode;
            this.isProcessing = false;
          } else {
            // Ainda processando - mostrar estado de loading
            this.isProcessing = true;
          }
        } catch (error) {
          console.error('Fallback check failed:', error);
          this.isProcessing = false;
        }
      } else {
        // Nenhum dado - padrão para não processando
        this.isProcessing = false;
      }
    },

    generateQRCode() {
      // Se o QR code não veio por parâmetro, gerar localmente
      // Você pode usar uma biblioteca como qrcode.js ou similar
      // Por simplicidade, assumindo que vem do backend
      if (!this.qrCode) {
        // Implementar geração de QR code ou deixar sem QR code
      }
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

    async copyUrl() {
      try {
        await navigator.clipboard.writeText(this.createdUrl);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (error) {
        console.error('Falha na cópia:', error);
        this.fallbackCopy();
      }
    },

    fallbackCopy() {
      const input = document.createElement('input');
      input.value = this.createdUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    },

    downloadQR() {
      const link = document.createElement('a');
      link.href = this.qrCode;
      link.download = 'qr-code.png';
      link.click();
    }
  }
};
</script>

<style scoped>
.payment-success {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
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
  border-top: 5px solid #4caf50;
}

.icon {
  margin-bottom: 20px;
}

.result-card h2 {
  color: #4caf50;
  margin-bottom: 15px;
  font-size: 1.8em;
}

.status-message {
  color: #b0b0b0;
  margin-bottom: 30px;
  font-size: 1.1em;
}

.payment-details {
  background: #1f1f1f;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
  border: 1px solid #444;
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

.url-result {
  background: #1f1f1f;
  border-radius: 10px;
  padding: 25px;
  margin: 20px 0;
  border: 1px solid #444;
}

.url-created {
  text-align: center;
  margin-bottom: 20px;
}

.success-icon {
  font-size: 3em;
  margin-bottom: 15px;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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

.processing-state {
  text-align: center;
  margin: 30px 0;
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

.processing-state p {
  color: #b0b0b0;
  font-size: 1.1em;
  margin-bottom: 10px;
}

.processing-note {
  color: #777;
  font-size: 0.9em;
}

.copy-btn,
.download-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 5px;
}

.copy-btn {
  background: linear-gradient(45deg, #4caf50, #45a049);
  color: white;
  margin-top: 10px;
}

.copy-btn:hover {
  background: linear-gradient(45deg, #45a049, #388e3c);
  transform: translateY(-2px);
}

.download-btn {
  background: linear-gradient(45deg, #2196f3, #1976d2);
  color: white;
}

.download-btn:hover {
  background: linear-gradient(45deg, #1976d2, #1565c0);
  transform: translateY(-2px);
}

.qr-code {
  text-align: center;
  margin-top: 20px;
}

.qr-code label {
  display: block;
  color: #e0e0e0;
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.qr-code img {
  max-width: 200px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 1em;
  border: none;
  cursor: pointer;
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
  .payment-success {
    padding: 10px;
    align-items: flex-start;
  }

  .result-card {
    padding: 20px;
    margin-top: 20px;
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 280px;
  }

  .url-result {
    padding: 20px;
  }
}
</style>