<template>
  <div class="mercadopago-checkout">
    <div class="checkout-header">
      <h2>💳 Checkout MercadoPago</h2>
      <p>Integração com Checkout Pro - Backend já implementado</p>
    </div>

    <!-- Payment Form -->
    <div v-if="!showPaymentStatus" class="payment-form">
      <form @submit.prevent="handlePayment" class="form">
        <div class="form-group">
          <label for="originalUrl">🔗 URL para encurtar:</label>
          <input
            id="originalUrl"
            v-model="paymentData.originalUrl"
            type="url"
            placeholder="https://exemplo.com/minha-url-longa"
            required
            :disabled="isLoading || isProcessing"
          />
        </div>

        <div class="form-group">
          <label for="customAlias">🔖 Alias personalizado (opcional):</label>
          <input
            id="customAlias"
            v-model="paymentData.customAlias"
            type="text"
            placeholder="Ex: meulink"
            :disabled="isLoading || isProcessing"
          />
        </div>

        <div class="form-group">
          <label for="expiryDate">📅 Data de expiração:</label>
          <input
            id="expiryDate"
            v-model="paymentData.expiryDate"
            type="date"
            :disabled="isLoading || isProcessing"
          />
          <small>Se não especificado, URL premium expira em 7 dias</small>
        </div>

        <div class="form-group">
          <label for="quantity">📦 Quantidade:</label>
          <input
            id="quantity"
            v-model.number="paymentData.quantity"
            type="number"
            min="1"
            placeholder="1"
            required
            :disabled="isLoading || isProcessing"
          />
        </div>

        <div class="form-group">
          <div class="payment-info">
            <span class="amount">
              💰 Valor: {{ formatCurrency(9.90) }}
            </span>
            <small>Valor fixo configurado no backend</small>
          </div>
        </div>

        <button
          type="submit"
          class="payment-button"
          :disabled="isLoading || !isFormValid || isProcessing"
        >
          <span v-if="isLoading || isProcessing">⏳ Processando...</span>
          <span v-else>🚀 Pagar com MercadoPago</span>
        </button>
      </form>

      <!-- Error Display -->
      <div v-if="error" class="error-message">
        <h4>❌ Erro no Pagamento</h4>
        <p>{{ error }}</p>
        <button @click="clearError" class="clear-error-btn">
          Tentar Novamente
        </button>
      </div>

      <!-- SDK Status -->
      <div class="sdk-status">
        <span v-if="isSDKLoaded" class="status-loaded">
          ✅ SDK MercadoPago carregado
        </span>
        <span v-else class="status-loading">
          ⏳ Carregando SDK MercadoPago...
        </span>
      </div>
    </div>

    <!-- Payment Status -->
    <div v-if="showPaymentStatus" class="payment-status">
      <div class="status-header">
        <h3>📊 Status do Pagamento</h3>
        <button @click="resetForm" class="reset-btn">
          🔄 Novo Pagamento
        </button>
      </div>

      <div v-if="paymentResult" class="status-details">
        <div class="status-badge" :class="paymentResult.statusInfo.type">
          <span class="status-icon">{{ paymentResult.statusInfo.icon }}</span>
          <span class="status-text">{{ paymentResult.statusInfo.message }}</span>
        </div>

        <div class="payment-details">
          <div class="detail-item">
            <strong>ID do Pagamento:</strong>
            <span>{{ paymentResult.id }}</span>
          </div>

          <div class="detail-item">
            <strong>Valor:</strong>
            <span>{{ formatCurrency(paymentResult.transaction_amount, paymentResult.currency_id) }}</span>
          </div>

          <div class="detail-item">
            <strong>Data de Criação:</strong>
            <span>{{ formatDate(paymentResult.date_created) }}</span>
          </div>

          <div v-if="paymentResult.date_last_updated" class="detail-item">
            <strong>Última Atualização:</strong>
            <span>{{ formatDate(paymentResult.date_last_updated) }}</span>
          </div>

          <div v-if="paymentResult.status_detail" class="detail-item">
            <strong>Detalhes:</strong>
            <span>{{ paymentResult.status_detail }}</span>
          </div>
        </div>

        <button @click="refreshPaymentStatus" class="refresh-btn" :disabled="isLoading">
          <span v-if="isLoading">⏳ Atualizando...</span>
          <span v-else>🔄 Atualizar Status</span>
        </button>
      </div>
    </div>

    <!-- Payment Verification Form -->
    <div class="payment-verification">
      <h3>🔍 Verificar Pagamento</h3>
      <p>Digite o ID do pagamento para verificar o status:</p>

      <form @submit.prevent="handlePaymentVerification" class="verification-form">
        <input
          v-model="verificationPaymentId"
          type="text"
          placeholder="ID do pagamento do MercadoPago"
          required
          :disabled="isLoading"
        />
        <button type="submit" :disabled="isLoading || !verificationPaymentId">
          <span v-if="isLoading">⏳ Verificando...</span>
          <span v-else>🔍 Verificar</span>
        </button>
      </form>
    </div>

    <!-- Debug Info -->
    <div class="debug-info">
      <h4>🔧 Informações de Debug</h4>
      <details>
        <summary>Ver parâmetros da URL</summary>
        <pre>{{ JSON.stringify(urlParams, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useMercadoPago } from '@/composables/useMercadoPago';

export default {
  name: 'MercadoPagoCheckout',
  setup() {
    // MercadoPago composable
    const {
      isLoading,
      error,
      isSDKLoaded,
      verifyPayment,
      clearError,
      handlePaymentReturn,
      formatCurrency
    } = useMercadoPago();

    // Component state
    const paymentData = ref({
      originalUrl: '',
      customAlias: '',
      expiryDate: '',
      quantity: 1
    });

    const showPaymentStatus = ref(false);
    const paymentResult = ref(null);
    const verificationPaymentId = ref('');
    const urlParams = ref({});
    const isProcessing = ref(false); // Flag para prevenir chamadas duplicadas

    // Computed properties
    const isFormValid = computed(() => {
      return paymentData.value.originalUrl.trim() &&
             paymentData.value.quantity > 0;
    });

    // Methods
    const handlePayment = async () => {
      // Previne chamadas duplicadas
      if (isProcessing.value) {
        console.log('Pagamento já está sendo processado...');
        return;
      }

      if (!paymentData.value.originalUrl.trim()) {
        alert('Por favor, insira uma URL para encurtar');
        return;
      }

      // Marca como processando
      isProcessing.value = true;

      try {
        // Verificar cache no LocalStorage para evitar duplicatas
        const cacheKey = `payment_${paymentData.value.customAlias || 'temp'}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached && paymentData.value.customAlias) {
          const { timestamp, preferenceId } = JSON.parse(cached);

          // Se foi criado há menos de 5 minutos, redireciona para o mesmo pagamento
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log('Redirecionando para pagamento existente...');
            initMercadoPago(preferenceId);
            return;
          }
        }

        const urlData = {
          originalUrl: paymentData.value.originalUrl,
          customAlias: paymentData.value.customAlias || null,
          expiryDate: paymentData.value.expiryDate || null,
          quantity: paymentData.value.quantity || 1
        };

        // Criar pagamento com dados da URL
        const { preferenceId, sessionId } = await createPayment(urlData);

        // Salvar no cache se houver customAlias
        if (paymentData.value.customAlias) {
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            preferenceId
          }));
        }

        // Armazenar sessionId para consultar status depois
        sessionStorage.setItem('paymentSessionId', sessionId);

        // Inicializar checkout do MercadoPago
        initMercadoPago(preferenceId);

      } catch (err) {
        console.error('Falha na criação do pagamento:', err);

        // Mensagens de erro amigáveis
        const errorMessages = {
          'Custom alias already exists or is being processed':
            'Este alias já está em uso. Escolha outro nome.',
          'Too many payment requests':
            'Muitas tentativas. Aguarde alguns minutos.',
          'Missing required fields':
            'Preencha todos os campos obrigatórios.',
          'Quantity must be a positive integer':
            'Quantidade inválida.'
        };

        const errorMessage = errorMessages[err.message] || 'Falha ao criar pagamento. Tente novamente.';
        alert(errorMessage);

        // Reabilita botão em caso de erro
        isProcessing.value = false;
      } finally {
        // Aguarda 3 segundos antes de permitir nova tentativa
        // (apenas se não houve redirecionamento)
        setTimeout(() => {
          isProcessing.value = false;
        }, 3000);
      }
    };

    const createPayment = async (urlData) => {
      const response = await fetch('/.netlify/functions/prefer', {
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
    };

    const initMercadoPago = (preferenceId) => {
      const mp = new window.MercadoPago(process.env.VUE_APP_MP_PUBLIC_KEY, {
        locale: 'pt-BR'
      });

      mp.checkout({
        preference: { id: preferenceId },
        autoOpen: true
      });
    };

    const handlePaymentVerification = async () => {
      try {
        const result = await verifyPayment(verificationPaymentId.value);
        paymentResult.value = result;
        showPaymentStatus.value = true;
      } catch (err) {
        // Error handling removed for production
      }
    };

    const refreshPaymentStatus = async () => {
      if (paymentResult.value?.id) {
        try {
          const result = await verifyPayment(paymentResult.value.id);
          paymentResult.value = result;
        } catch (err) {
          // Error handling removed for production
        }
      }
    };

    const resetForm = () => {
      showPaymentStatus.value = false;
      paymentResult.value = null;
      clearError();
      paymentData.value = {
        originalUrl: '',
        customAlias: '',
        expiryDate: '',
        quantity: 1
      };
      verificationPaymentId.value = '';
      isProcessing.value = false; // Reset isProcessing flag
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString('pt-BR');
    };

    // Handle payment return from MercadoPago
    const checkPaymentReturn = async () => {
      const params = handlePaymentReturn();
      urlParams.value = params;

      if (params.hasPaymentData && params.paymentId) {
        try {
          const result = await verifyPayment(params.paymentId);
          paymentResult.value = result;
          showPaymentStatus.value = true;
        } catch (err) {
          // Error handling removed for production
        }
      }
    };

    // Initialize component
    onMounted(() => {
      checkPaymentReturn();
    });

    return {
      // State
      paymentData,
      showPaymentStatus,
      paymentResult,
      verificationPaymentId,
      urlParams,
      isProcessing,

      // Computed
      isFormValid,

      // From composable
      isLoading,
      error,
      isSDKLoaded,
      clearError,
      formatCurrency,

      // Methods
      handlePayment,
      handlePaymentVerification,
      refreshPaymentStatus,
      resetForm,
      formatDate,
      createPayment,
      initMercadoPago
    };
  }
};
</script>

<style scoped>
.mercadopago-checkout {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.checkout-header {
  text-align: center;
  margin-bottom: 30px;
}

.checkout-header h2 {
  color: #009ee3;
  margin-bottom: 10px;
}

.checkout-header p {
  color: #666;
  font-size: 14px;
}

.payment-form {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #009ee3;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-group small {
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.payment-info {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
}

.amount {
  font-size: 20px;
  font-weight: bold;
  color: #1976d2;
  display: block;
  margin-bottom: 5px;
}

.payment-button {
  background: linear-gradient(135deg, #009ee3, #0277bd);
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 158, 227, 0.3);
}

.payment-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  position: relative;
}

.payment-button:disabled::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  right: 12px;
  margin-top: -8px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spinner 0.6s linear infinite;
}

@keyframes spinner {
  to { transform: rotate(360deg); }
}

.error-message {
  background: #ffebee;
  border: 2px solid #f44336;
  border-radius: 6px;
  padding: 15px;
  margin-top: 20px;
}

.error-message h4 {
  margin: 0 0 10px 0;
  color: #d32f2f;
}

.error-message p {
  margin: 0 0 15px 0;
  color: #666;
}

.clear-error-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.sdk-status {
  margin-top: 15px;
  text-align: center;
}

.status-loaded {
  color: #4caf50;
  font-weight: bold;
}

.status-loading {
  color: #ff9800;
  font-weight: bold;
}

.payment-status {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.reset-btn {
  background: #666;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: bold;
}

.status-badge.success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 2px solid #4caf50;
}

.status-badge.warning {
  background: #fff3e0;
  color: #f57c00;
  border: 2px solid #ff9800;
}

.status-badge.error {
  background: #ffebee;
  color: #d32f2f;
  border: 2px solid #f44336;
}

.status-badge.info {
  background: #e3f2fd;
  color: #1976d2;
  border: 2px solid #2196f3;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.refresh-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.payment-verification {
  background: #f0f4f8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.verification-form {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.verification-form input {
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
}

.verification-form button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.debug-info {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  color: #666;
}

.debug-info pre {
  background: white;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>