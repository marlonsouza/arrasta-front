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
          <label for="idUrl">🔗 ID da URL:</label>
          <input
            id="idUrl"
            v-model="paymentData.idUrl"
            type="text"
            placeholder="Ex: minha-url-123"
            required
            :disabled="isLoading"
          />
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
            :disabled="isLoading"
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
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading">⏳ Processando...</span>
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
      processPayment,
      verifyPayment,
      clearError,
      handlePaymentReturn,
      formatCurrency
    } = useMercadoPago();

    // Component state
    const paymentData = ref({
      idUrl: '',
      quantity: 1
    });

    const showPaymentStatus = ref(false);
    const paymentResult = ref(null);
    const verificationPaymentId = ref('');
    const urlParams = ref({});

    // Computed properties
    const isFormValid = computed(() => {
      return paymentData.value.idUrl.trim() &&
             paymentData.value.quantity > 0;
    });

    // Methods
    const handlePayment = async () => {
      try {
        await processPayment(
          paymentData.value.idUrl,
          paymentData.value.quantity
        );

        // The checkout will open in a new window/tab
        // User will return to the app after payment completion
      } catch (err) {
        console.error('Erro ao criar pagamento', err);
      }
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
        idUrl: '',
        quantity: 1
      };
      verificationPaymentId.value = '';
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
      formatDate
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