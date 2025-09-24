<template>
  <div class="payment-result pending">
    <div class="result-card">
      <div class="icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#ff9800"/>
          <path d="M12 6v6l4 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h1>Pagamento Pendente</h1>
      <p class="status-message">Seu pagamento está sendo processado. Você receberá uma confirmação em breve.</p>

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
          <span class="value pending-status">{{ formatStatus(paymentInfo.status) }}</span>
        </div>
      </div>

      <div class="instructions">
        <h3>Próximos passos:</h3>
        <ul v-if="paymentInfo.payment_type === 'ticket'">
          <li>Imprima o boleto ou salve o código de barras</li>
          <li>Pague em qualquer banco, lotérica ou via internet banking</li>
          <li>O pagamento pode levar até 3 dias úteis para ser processado</li>
        </ul>
        <ul v-else-if="paymentInfo.payment_type === 'bank_transfer'">
          <li>Complete a transferência bancária no seu banco</li>
          <li>O pagamento será processado automaticamente</li>
          <li>Você receberá uma confirmação por email</li>
        </ul>
        <ul v-else>
          <li>Aguarde o processamento do pagamento</li>
          <li>Em até 2 dias úteis você receberá uma confirmação</li>
          <li>Verifique seu email regularmente</li>
        </ul>
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
  name: 'PaymentPending',
  data() {
    return {
      paymentInfo: null
    }
  },
  mounted() {
    this.extractPaymentInfo();
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
  color: #ff9800;
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

.pending-status {
  color: #ff9800;
}

.instructions {
  background: #1f1f1f;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.instructions h3 {
  color: #e0e0e0;
  margin-bottom: 15px;
  text-align: center;
}

.instructions ul {
  color: #a0a0a0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  line-height: 1.5;
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