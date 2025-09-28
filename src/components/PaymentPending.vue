<template>
  <div class="payment-pending">
    <div class="result-card">
      <div class="icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#ff9800"/>
          <path d="M12 6v6l4 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h2>⏳ Pagamento Pendente</h2>
      <p>Seu pagamento está sendo processado. Por favor, aguarde...</p>

      <div class="pending-info">
        <h3>📋 O que acontece agora?</h3>
        <ul>
          <li>🕰️ Aguarde a confirmação do pagamento</li>
          <li>📱 Você receberá uma notificação quando aprovado</li>
          <li>🌐 Sua URL premium será criada automaticamente</li>
        </ul>
      </div>

      <div class="pending-actions">
        <button @click="checkStatus" :disabled="isChecking" class="check-btn">
          {{ isChecking ? 'Verificando...' : 'Verificar Status' }}
        </button>
        <router-link to="/@/" class="home-link">Voltar ao Início</router-link>
      </div>

      <div v-if="statusMessage" class="status-message">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentPending',
  data() {
    return {
      isChecking: false,
      statusMessage: ''
    };
  },
  methods: {
    async checkStatus() {
      const sessionId = new URLSearchParams(window.location.search).get('session_id');

      if (!sessionId) {
        this.statusMessage = 'Nenhum session ID encontrado';
        return;
      }

      this.isChecking = true;
      this.statusMessage = '';

      try {
        // Usar o endpoint correto conforme sua documentação
        const response = await fetch(`/.netlify/functions/prefer/urls/check-status/${sessionId}`);

        if (!response.ok) {
          this.statusMessage = 'Erro ao verificar status. Tente novamente.';
          return;
        }

        const data = await response.json();

        switch (data.status) {
          case 'completed': {
            // Redirecionar com dados da URL se disponíveis
            let redirectUrl = `/@/success?session_id=${sessionId}`;
            if (data.shortUrl) {
              redirectUrl += `&short_url=${encodeURIComponent(data.shortUrl)}`;
            }
            this.$router.push(redirectUrl);
            break;
          }
          case 'pending':
            this.statusMessage = 'Pagamento ainda está pendente. Por favor, aguarde e tente novamente.';
            break;
          case 'processing':
            // Redirecionar para sucesso com flag de processamento
            this.$router.push(`/@/success?session_id=${sessionId}&processing=true`);
            break;
          case 'failed':
            this.$router.push(`/@/failure?session_id=${sessionId}`);
            break;
          default:
            this.statusMessage = 'Status desconhecido. Por favor, contate o suporte.';
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        this.statusMessage = 'Falha ao verificar status. Por favor, tente novamente.';
      } finally {
        this.isChecking = false;
      }
    }
  }
};
</script>

<style scoped>
.payment-pending {
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
  border-top: 5px solid #ff9800;
}

.icon {
  margin-bottom: 20px;
}

.result-card h2 {
  color: #ff9800;
  margin-bottom: 15px;
  font-size: 1.8em;
}

.result-card > p {
  color: #b0b0b0;
  margin-bottom: 30px;
  font-size: 1.1em;
}

.pending-info {
  background: #1f1f1f;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
  text-align: left;
  border: 1px solid #444;
}

.pending-info h3 {
  color: #ff9800;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.3em;
}

.pending-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pending-info li {
  color: #e0e0e0;
  margin-bottom: 15px;
  padding: 15px;
  background: #2a2a2a;
  border-radius: 8px;
  font-size: 1.1em;
  border-left: 4px solid #ff9800;
  transition: all 0.3s ease;
}

.pending-info li:hover {
  background: #333;
  transform: translateX(5px);
}

.pending-info li:last-child {
  margin-bottom: 0;
}

.pending-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.check-btn,
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

.check-btn {
  background: linear-gradient(45deg, #ff9800, #f57c00);
  color: white;
}

.check-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #f57c00, #ef6c00);
  transform: translateY(-2px);
}

.check-btn:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
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

.status-message {
  background: #1f1f1f;
  border: 2px solid #ff9800;
  border-radius: 8px;
  padding: 15px;
  color: #ff9800;
  font-weight: bold;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .payment-pending {
    padding: 10px;
    align-items: flex-start;
  }

  .result-card {
    padding: 20px;
    margin-top: 20px;
  }

  .pending-actions {
    flex-direction: column;
    align-items: center;
  }

  .check-btn,
  .home-link {
    width: 100%;
    max-width: 280px;
  }

  .pending-info {
    padding: 20px;
  }

  .pending-info li {
    padding: 12px;
  }
}
</style>