/**
 * Configuration management for the IAP Verification SDK
 */
const { ENVIRONMENT, API_URLS } = require('./constants');

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  environment: ENVIRONMENT.SANDBOX,
  google: null,
  apple: null
};

/**
 * Create a configuration object with defaults for missing values
 * 
 * @param {Object} config User-provided configuration
 * @returns {Object} Complete configuration
 */
function createConfig(config = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    google: config.google || null,
    apple: config.apple || null
  };
}

/**
 * Get the appropriate API URL based on environment
 * 
 * @param {string} platform 'apple' or 'google'
 * @param {string} environment 'sandbox' or 'production'
 * @returns {string} API URL
 */
function getApiUrl(platform, environment) {
  if (platform === 'apple') {
    return API_URLS.APPLE[environment] || API_URLS.APPLE[ENVIRONMENT.SANDBOX];
  }
  
  // Google doesn't use different URLs for sandbox/production
  return null;
}

/**
 * Validate configuration for a specific platform
 * 
 * @param {string} platform 'apple' or 'google'
 * @param {Object} config Configuration object
 * @throws {Error} If the configuration is invalid
 */
function validatePlatformConfig(platform, config) {
  if (platform === 'apple') {
    const { apple } = config;
    if (!apple) {
      throw new Error('Apple configuration is required for App Store verification');
    }
    
    if (!apple.issuerId) {
      throw new Error('Apple issuerId is required');
    }
    
    if (!apple.keyId) {
      throw new Error('Apple keyId is required');
    }
    
    if (!apple.privateKey) {
      throw new Error('Apple privateKey is required');
    }
    
    if (!apple.bundleId) {
      throw new Error('Apple bundleId is required');
    }
  } else if (platform === 'google') {
    const { google } = config;
    if (!google) {
      throw new Error('Google configuration is required for Play Store verification');
    }
    
    if (!google.serviceAccount) {
      throw new Error('Google serviceAccount is required');
    }
    
    if (!google.serviceAccount.client_email || !google.serviceAccount.private_key) {
      throw new Error('Invalid Google service account format');
    }
  }
}

module.exports = {
  createConfig,
  getApiUrl,
  validatePlatformConfig
};