/**
 * MercadoPago Service
 * Handles payment preferences creation and status verification
 * Integrates with the backend API for Checkout Pro
 */

import apiConfig from './apiConfig';

class MercadoPagoService {
  constructor() {
    // Use centralized API configuration
    this.apiConfig = apiConfig;
    this.endpoints = apiConfig.getMercadoPagoEndpoints();
  }

  /**
   * Creates a payment preference in the backend
   * @param {string} idUrl - URL identifier
   * @param {number} quantity - Quantity (positive integer)
   * @param {number} expirationDays - Expiration days for the payment link (default: 7)
   * @returns {Promise<string>} MercadoPago preference ID
   */
  async createPaymentPreference(idUrl, quantity, expirationDays = 7) {
    try {
      // Validate input
      if (!idUrl || !quantity) {
        throw new Error('Missing required fields: idUrl and quantity are required');
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Quantity must be a positive integer');
      }

      if (!Number.isInteger(expirationDays) || expirationDays <= 0) {
        throw new Error('Expiration days must be a positive integer');
      }

      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);
      const expiresAt = expirationDate.toISOString();

      const response = await fetch(this.endpoints.createPreference, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUrl,
          quantity,
          expires_at: expiresAt
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment preference');
      }

      const { id } = await response.json();
      return id; // MercadoPago preference ID
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Verifies payment status with backend
   * @param {string} paymentId - MercadoPago payment ID
   * @returns {Promise<Object>} Payment details
   */
  async verifyPayment(paymentId) {
    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      const response = await fetch(this.endpoints.verifyPayment(paymentId));

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Payment not found');
        }
        throw new Error('Payment verification failed');
      }

      const paymentData = await response.json();
      return paymentData;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Maps payment status to user-friendly messages
   * @param {string} status - Payment status from MercadoPago
   * @returns {Object} Status info with message and icon
   */
  getPaymentStatusInfo(status) {
    const statusMap = {
      approved: {
        message: 'Pagamento aprovado',
        icon: '✅',
        type: 'success'
      },
      pending: {
        message: 'Pagamento pendente',
        icon: '⏳',
        type: 'warning'
      },
      rejected: {
        message: 'Pagamento rejeitado',
        icon: '❌',
        type: 'error'
      },
      cancelled: {
        message: 'Pagamento cancelado',
        icon: '❌',
        type: 'error'
      },
      refunded: {
        message: 'Pagamento reembolsado',
        icon: '💰',
        type: 'info'
      }
    };

    return statusMap[status] || {
      message: 'Status desconhecido',
      icon: '❓',
      type: 'unknown'
    };
  }

  /**
   * Handles payment errors with appropriate user messages
   * @param {Error} error - Error object
   * @returns {Object} Error info for UI display
   */
  handlePaymentError(error) {
    if (error.message.includes('Missing required fields')) {
      return {
        type: 'validation',
        message: 'Por favor, preencha todos os campos obrigatórios',
        details: error.message
      };
    } else if (error.message.includes('Quantity must be')) {
      return {
        type: 'validation',
        message: 'A quantidade deve ser um número inteiro positivo',
        details: error.message
      };
    } else if (error.message.includes('Payment not found')) {
      return {
        type: 'not_found',
        message: 'Pagamento não encontrado',
        details: error.message
      };
    } else if (error.message.includes('Failed to create payment preference')) {
      return {
        type: 'payment_error',
        message: 'Serviço de pagamento temporariamente indisponível',
        details: error.message
      };
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        details: error.message
      };
    } else {
      return {
        type: 'generic',
        message: 'Algo deu errado. Tente novamente.',
        details: error.message
      };
    }
  }

  /**
   * Formats currency value for display
   * @param {number} amount - Amount in currency
   * @param {string} currency - Currency code (default: BRL)
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

// Export singleton instance
export default new MercadoPagoService();