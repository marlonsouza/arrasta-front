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

  // MercadoPago base URL - configurable via environment variable
  const mercadoPagoBaseUrl = process.env.VUE_APP_MP_BASE_URL || 'https://www.mercadopago.com.br';

  /**
   * Initialize MercadoPago SDK
   */
  const initializeMercadoPago = async () => {
    try {
      if (isSDKLoaded.value) {
          return mp.value;
      }


      // Validate public key
      if (!publicKey || publicKey === 'TEST-your-public-key-here') {
        throw new Error('MercadoPago public key not configured. Check VUE_APP_MP_PUBLIC_KEY in .env file');
      }

      isLoading.value = true;
      error.value = null;

      // Load MercadoPago SDK
      await loadMercadoPago();

      // Check if SDK was loaded
      if (!window.MercadoPago) {
        throw new Error('MercadoPago SDK failed to load');
      }

      // Initialize MercadoPago instance
      mp.value = new window.MercadoPago(publicKey, {
        locale: 'pt-BR'
      });

      isSDKLoaded.value = true;

      return mp.value;
    } catch (err) {
      error.value = `Failed to initialize MercadoPago SDK: ${err.message}`;
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

      // Validate preference ID format
      if (typeof preferenceId !== 'string' || preferenceId.length < 10) {
        throw new Error('Invalid preference ID format');
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
      return checkout;
    } catch (err) {
      error.value = `Failed to open checkout: ${err.message}`;
      throw err;
    }
  };

  /**
   * Complete payment flow: create preference and redirect to MercadoPago
   * @param {string} idUrl - URL identifier
   * @param {number} quantity - Quantity
   * @param {Object} options - Additional options
   */
  const processPayment = async (idUrl, quantity, options = {}) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Step 1: Create payment preference via backend
      const preferenceId = await mercadoPagoService.createPaymentPreference(idUrl, quantity);

      // Step 2: Try SDK approach first, fallback to direct redirect
      try {
        const checkout = await openCheckout(preferenceId, options);
        return { preferenceId, checkout, method: 'sdk' };
      } catch (sdkError) {
        // Fallback: Direct redirect to MercadoPago
        const checkoutUrl = `${mercadoPagoBaseUrl}/checkout/v1/redirect?pref_id=${preferenceId}`;

        // Redirect user to MercadoPago
        window.location.href = checkoutUrl;

        return { preferenceId, checkoutUrl, method: 'redirect' };
      }
    } catch (err) {
      const errorInfo = mercadoPagoService.handlePaymentError(err);
      error.value = errorInfo.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Alternative payment flow using direct redirect (no SDK)
   * @param {string} idUrl - URL identifier
   * @param {number} quantity - Quantity
   */
  const processPaymentWithRedirect = async (idUrl, quantity) => {
    try {
      isLoading.value = true;
      error.value = null;


      // Create payment preference via backend
      const preferenceId = await mercadoPagoService.createPaymentPreference(idUrl, quantity);

      // Build MercadoPago checkout URL
      const checkoutUrl = `${mercadoPagoBaseUrl}/checkout/v1/redirect?pref_id=${preferenceId}`;


      // Direct redirect - no SDK needed
      window.location.href = checkoutUrl;

      return { preferenceId, checkoutUrl };
    } catch (err) {
      const errorInfo = mercadoPagoService.handlePaymentError(err);
      error.value = errorInfo.message;
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
      initializeMercadoPago().catch(() => {
        // Silent fail for auto-initialization
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
    processPaymentWithRedirect,
    verifyPayment,
    clearError,
    handlePaymentReturn,

    // Service methods (for convenience)
    getPaymentStatusInfo: mercadoPagoService.getPaymentStatusInfo,
    formatCurrency: mercadoPagoService.formatCurrency
  };
}