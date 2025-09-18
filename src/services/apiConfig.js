/**
 * API Configuration Service
 * Centralizes all API endpoint configurations and base URLs
 */

class ApiConfig {
  constructor() {
    // Unified API backend (MercadoPago integration, URL shortener, etc.)
    this.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:8888';
  }

  /**
   * Get API base URL
   * @returns {string} API base URL
   */
  getBaseURL() {
    return this.baseURL;
  }

  /**
   * Build API endpoint URL
   * @param {string} endpoint - API endpoint path
   * @returns {string} Complete API URL
   */
  getEndpoint(endpoint) {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  /**
   * Get MercadoPago API endpoints
   * @returns {Object} MercadoPago endpoints
   */
  getMercadoPagoEndpoints() {
    return {
      createPreference: this.getEndpoint('/prefer'),
      verifyPayment: (paymentId) => this.getEndpoint(`/payment/${paymentId}/verify`),
      webhook: this.getEndpoint('/webhook')
    };
  }

  /**
   * Get Arrasta (URL shortener) API endpoints
   * @returns {Object} Arrasta endpoints
   */
  getArrastaEndpoints() {
    return {
      shorten: this.getEndpoint('/shorten'),
      info: (shortCode) => this.getEndpoint(`/info/${shortCode}`),
      redirect: (shortCode) => this.getEndpoint(`/${shortCode}`)
    };
  }

  /**
   * Create a fetch wrapper with default configuration
   * @param {string} baseURL - Base URL to use
   * @returns {Function} Configured fetch function
   */
  createApiClient(baseURL = this.baseURL) {
    return async (endpoint, options = {}) => {
      const url = endpoint.startsWith('http') ? endpoint : `${baseURL}/${endpoint.replace(/^\//, '')}`;

      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      try {
        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        // Try to parse as JSON, fallback to text
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text();
        }
      } catch (error) {
        console.error(`API request error for ${url}:`, error);
        throw error;
      }
    };
  }

  /**
   * Get environment-specific configuration
   * @returns {Object} Environment configuration
   */
  getEnvironmentConfig() {
    return {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      apiURL: this.baseURL,
      mpPublicKey: process.env.VUE_APP_MP_PUBLIC_KEY
    };
  }

  /**
   * Validate configuration
   * @returns {Object} Validation result
   */
  validateConfig() {
    const warnings = [];
    const errors = [];

    // Check API URL
    if (!this.baseURL) {
      errors.push('API base URL is not configured');
    }

    // Check MercadoPago configuration
    if (!process.env.VUE_APP_MP_PUBLIC_KEY) {
      warnings.push('MercadoPago public key is not configured');
    }

    // Check if using default development URLs in production
    if (process.env.NODE_ENV === 'production') {
      if (this.baseURL.includes('localhost')) {
        warnings.push('Using localhost API URL in production');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export singleton instance
const apiConfig = new ApiConfig();

// Log configuration validation in development
if (process.env.NODE_ENV === 'development') {
  const validation = apiConfig.validateConfig();

  if (validation.warnings.length > 0) {
    console.warn('API Configuration Warnings:', validation.warnings);
  }

  if (validation.errors.length > 0) {
    console.error('API Configuration Errors:', validation.errors);
  }

  console.log('API Configuration:', apiConfig.getEnvironmentConfig());
}

export default apiConfig;