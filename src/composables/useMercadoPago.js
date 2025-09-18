/**
 * MercadoPago Composable
 * Vue 3 composable for MercadoPago Checkout Pro integration
 * Handles SDK initialization and checkout flow
 */

import { ref, onMounted } from 'vue';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import mercadoPagoService from '@/services/mercadoPagoService';

export function useMercadoPago() {
  // Reactive state
  const mp = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const isSDKLoaded = ref(false);

  // MercadoPago Public Key - should be in environment variables
  const publicKey = process.env.VUE_APP_MP_PUBLIC_KEY || 'TEST-your-public-key-here';

  /**
   * Initialize MercadoPago SDK
   */
  const initializeMercadoPago = async () => {
    try {
      if (isSDKLoaded.value) {
        return mp.value;
      }

      isLoading.value = true;
      error.value = null;

      // Load MercadoPago SDK
      await loadMercadoPago();

      // Initialize MercadoPago instance
      mp.value = new window.MercadoPago(publicKey, {
        locale: 'pt-BR'
      });

      isSDKLoaded.value = true;
      console.log('MercadoPago SDK initialized successfully');

      return mp.value;
    } catch (err) {
      error.value = `Failed to initialize MercadoPago SDK: ${err.message}`;
      console.error('MercadoPago SDK initialization error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Create and open checkout with preference
   * @param {string} preferenceId - MercadoPago preference ID
   * @param {Object} options - Checkout options
   */
  const openCheckout = async (preferenceId, options = {}) => {
    try {
      if (!mp.value) {
        await initializeMercadoPago();
      }

      if (!preferenceId) {
        throw new Error('Preference ID is required');
      }

      const defaultOptions = {
        preference: {
          id: preferenceId
        },
        autoOpen: true,
        ...options
      };

      // Open MercadoPago Checkout Pro
      const checkout = mp.value.checkout(defaultOptions);

      console.log('Checkout opened with preference:', preferenceId);
      return checkout;
    } catch (err) {
      error.value = `Failed to open checkout: ${err.message}`;
      console.error('Checkout error:', err);
      throw err;
    }
  };

  /**
   * Complete payment flow: create preference and open checkout
   * @param {string} idUrl - URL identifier
   * @param {number} quantity - Quantity
   * @param {Object} checkoutOptions - Additional checkout options
   */
  const processPayment = async (idUrl, quantity, checkoutOptions = {}) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Step 1: Create payment preference via backend
      console.log('Creating payment preference...', { idUrl, quantity });
      const preferenceId = await mercadoPagoService.createPaymentPreference(idUrl, quantity);

      // Step 2: Open MercadoPago Checkout Pro
      console.log('Opening checkout with preference:', preferenceId);
      const checkout = await openCheckout(preferenceId, checkoutOptions);

      return {
        preferenceId,
        checkout
      };
    } catch (err) {
      const errorInfo = mercadoPagoService.handlePaymentError(err);
      error.value = errorInfo.message;
      console.error('Payment process error:', errorInfo);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Verify payment status
   * @param {string} paymentId - Payment ID to verify
   */
  const verifyPayment = async (paymentId) => {
    try {
      isLoading.value = true;
      error.value = null;

      const paymentData = await mercadoPagoService.verifyPayment(paymentId);
      const statusInfo = mercadoPagoService.getPaymentStatusInfo(paymentData.status);

      return {
        ...paymentData,
        statusInfo
      };
    } catch (err) {
      const errorInfo = mercadoPagoService.handlePaymentError(err);
      error.value = errorInfo.message;
      console.error('Payment verification error:', errorInfo);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Handle URL parameters for payment status
   * Useful for processing return URLs from MercadoPago
   */
  const handlePaymentReturn = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');
    const status = urlParams.get('status');
    const merchantOrderId = urlParams.get('merchant_order_id');
    const preferenceId = urlParams.get('preference_id');

    return {
      paymentId,
      status,
      merchantOrderId,
      preferenceId,
      hasPaymentData: !!(paymentId || status)
    };
  };

  // Initialize SDK on component mount
  onMounted(() => {
    if (!isSDKLoaded.value) {
      initializeMercadoPago().catch(err => {
        console.warn('MercadoPago SDK auto-initialization failed:', err.message);
      });
    }
  });

  // Return reactive properties and methods
  return {
    // State
    mp,
    isLoading,
    error,
    isSDKLoaded,

    // Methods
    initializeMercadoPago,
    openCheckout,
    processPayment,
    verifyPayment,
    clearError,
    handlePaymentReturn,

    // Service methods (for convenience)
    getPaymentStatusInfo: mercadoPagoService.getPaymentStatusInfo,
    formatCurrency: mercadoPagoService.formatCurrency
  };
}