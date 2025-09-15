/**
 * Google Play Store purchase verification
 */
const { google } = require('googleapis');
const { createGoogleJWTClient } = require('../utils/jwt');
const { mapGoogleStatus, formatResponse } = require('../utils/status');
const { validatePlatformConfig } = require('../config');
const { GOOGLE_API_SCOPE, STATUS } = require('../constants');

/**
 * Verify a Google Play Store purchase
 * 
 * @param {Object} options Verification options
 * @param {Object} options.config SDK configuration
 * @param {string} options.packageName App package name
 * @param {string} options.productId Product ID
 * @param {string} options.purchaseToken Purchase token
 * @returns {Promise<Object>} Verification result
 */
async function verifyGooglePurchase(options) {
  const { config, packageName, productId, purchaseToken } = options;
  
  try {
    validatePlatformConfig('google', config);
    
    const { serviceAccount } = config.google;
    const jwtClient = createGoogleJWTClient(serviceAccount, GOOGLE_API_SCOPE);
    
    // Authorize the client
    await jwtClient.authorize();
    
    // Create Android Publisher client
    const androidpublisher = google.androidpublisher('v3');
    
    // Get purchase details
    const response = await androidpublisher.purchases.products.get({
      packageName,
      productId,
      token: purchaseToken,
      auth: jwtClient
    });
    
    if (!response || !response.data) {
      return formatResponse(false, 400, 'VERIFY_PURCHASE_FAILED', {
        status: STATUS.FAILED
      });
    }
    
    // Map the status
    const status = mapGoogleStatus(response.data);
    
    return formatResponse(true, 200, 'VERIFY_PURCHASE_SUCCESS', {
      status,
      productId,
      orderId: response.data.orderId,
      transactionId: response.data.orderId,
      purchaseDate: parseInt(response.data.purchaseTimeMillis),
      environment: config.environment === 'production' ? 'Production' : 'Sandbox'
    });
  } catch (error) {
    console.error('Error verifying Google Play purchase:', error);
    
    return formatResponse(false, 500, 'INTERNAL_SERVER_ERROR', {
      status: STATUS.FAILED,
      message: error.message
    });
  }
}

module.exports = {
  verifyGooglePurchase
};