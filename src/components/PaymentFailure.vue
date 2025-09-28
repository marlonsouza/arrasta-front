<template>
  <div class="payment-failure">
    <div class="result-card">
      <div class="icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#f44336"/>
          <path d="M8 8l8 8M8 16l8-8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h2>❌ Pagamento Rejeitado</h2>
      <p>Infelizmente, seu pagamento não pôde ser processado.</p>

      <div class="error-reasons">
        <h3>📝 Possíveis motivos:</h3>
        <ul>
          <li>💳 Dados do cartão incorretos (número, CVV, data de vencimento)</li>
          <li>💰 Saldo insuficiente</li>
          <li>🚫 Cartão bloqueado ou cancelado</li>
          <li>📈 Limite de compra excedido</li>
          <li>🌐 Problemas de conectividade</li>
        </ul>
      </div>

      <div class="suggestions">
        <h3>⚙️ O que você pode fazer:</h3>
        <ul>
          <li>🔍 Verifique os dados do cartão e tente novamente</li>
          <li>💳 Tente com outro cartão de crédito</li>
          <li>🏦 Entre em contato com seu banco</li>
          <li>🔄 Escolha outro meio de pagamento</li>
        </ul>
      </div>

      <div class="failure-actions">
        <button @click="tryAgain" class="retry-btn">Tentar Novamente</button>
        <router-link to="/@/" class="home-link">Voltar ao Início</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentFailure',
  methods: {
    tryAgain() {
      // Limpar qualquer sessionStorage relacionado ao pagamento falhado
      const sessionId = new URLSearchParams(window.location.search).get('session_id');
      if (sessionId) {
        sessionStorage.removeItem('paymentSessionId');
      }

      // Voltar para a página inicial para criar novo pagamento
      this.$router.push('/@/');
    }
  }
};
</script>

<style scoped>
.payment-failure {
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
  border-top: 5px solid #f44336;
}

.icon {
  margin-bottom: 20px;
}

.result-card h2 {
  color: #f44336;
  margin-bottom: 15px;
  font-size: 1.8em;
}

.result-card > p {
  color: #b0b0b0;
  margin-bottom: 30px;
  font-size: 1.1em;
}

.error-reasons,
.suggestions {
  background: #1f1f1f;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 25px;
  text-align: left;
  border: 1px solid #444;
}

.error-reasons h3,
.suggestions h3 {
  color: #f44336;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.3em;
}

.suggestions h3 {
  color: #ff9800;
}

.error-reasons ul,
.suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-reasons li,
.suggestions li {
  color: #e0e0e0;
  margin-bottom: 15px;
  padding: 15px;
  background: #2a2a2a;
  border-radius: 8px;
  font-size: 1.1em;
  transition: all 0.3s ease;
}

.error-reasons li {
  border-left: 4px solid #f44336;
}

.suggestions li {
  border-left: 4px solid #ff9800;
}

.error-reasons li:hover,
.suggestions li:hover {
  background: #333;
  transform: translateX(5px);
}

.error-reasons li:last-child,
.suggestions li:last-child {
  margin-bottom: 0;
}

.failure-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 30px;
}

.retry-btn,
.home-link {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 1em;
  cursor: pointer;
  text-decoration: none;
  border: none;
}

.retry-btn {
  background: linear-gradient(45deg, #f44336, #d32f2f);
  color: white;
}

.retry-btn:hover {
  background: linear-gradient(45deg, #d32f2f, #c62828);
  transform: translateY(-2px);
}

.home-link {
  background: linear-gradient(45deg, #C14A09, #a03f08);
  color: white;
  display: inline-block;
}

.home-link:hover {
  background: linear-gradient(45deg, #a03f08, #8b3507);
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .payment-failure {
    padding: 10px;
    align-items: flex-start;
  }

  .result-card {
    padding: 20px;
    margin-top: 20px;
  }

  .failure-actions {
    flex-direction: column;
    align-items: center;
  }

  .retry-btn,
  .home-link {
    width: 100%;
    max-width: 280px;
  }

  .error-reasons,
  .suggestions {
    padding: 20px;
  }

  .error-reasons li,
  .suggestions li {
    padding: 12px;
  }
}
</style>