/**
 * Apple App Store purchase verification
 */
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { generateAppleJWT } = require('../utils/jwt');
const { mapAppleStatus, formatResponse } = require('../utils/status');
const { getApiUrl, validatePlatformConfig } = require('../config');
const { STATUS, ENVIRONMENT } = require('../constants');

/**
 * Verify an Apple App Store purchase
 * 
 * @param {Object} options Verification options
 * @param {Object} options.config SDK configuration
 * @param {string} options.transactionId Transaction ID
 * @returns {Promise<Object>} Verification result
 */
async function verifyApplePurchase(options) {
  const { config, transactionId } = options;
  
  try {
    validatePlatformConfig('apple', config);
    
    const { issuerId, keyId, privateKey, bundleId } = config.apple;
    const environment = config.environment || ENVIRONMENT.SANDBOX;
    
    // Generate JWT token for authentication
    const token = generateAppleJWT({ issuerId, keyId, privateKey, bundleId });
    
    // Get the appropriate API URL
    const baseUrl = getApiUrl('apple', environment);
    const verifyTransactionUrl = `${baseUrl}/transactions/${transactionId}`;
    
    // Make the API request
    let response;
    try {
      response = await axios.get(verifyTransactionUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error calling Apple API:', error.response?.data || error.message);
      return formatResponse(false, 400, 'VERIFY_PURCHASE_FAILED', {
        status: STATUS.FAILED
      });
    }
    
    if (!response || !response.data || !response.data.signedTransactionInfo) {
      return formatResponse(false, 400, 'VERIFY_PURCHASE_FAILED', {
        status: STATUS.FAILED
      });
    }
    
    // Decode the signed transaction info
    const decoded = jwt.decode(response.data.signedTransactionInfo, {
      complete: true
    });
    
    if (!decoded || !decoded.payload) {
      return formatResponse(false, 400, 'VERIFY_PURCHASE_FAILED', {
        status: STATUS.FAILED
      });
    }
    
    const transaction = decoded.payload;
    
    // Map the status
    const status = mapAppleStatus({
      bundleId: transaction.bundleId,
      productId: transaction.productId,
      transactionId: transaction.transactionId,
      purchaseDate: parseInt(transaction.originalPurchaseDate),
      environment: response.data.environment || 'Sandbox',
      type: 'consumable',
      inAppOwnershipType: transaction.inAppOwnershipType || 'PURCHASED'
    });
    
    return formatResponse(true, 200, 'VERIFY_PURCHASE_SUCCESS', {
      status,
      bundleId: transaction.bundleId,
      productId: transaction.productId,
      transactionId: transaction.transactionId,
      purchaseDate: parseInt(transaction.originalPurchaseDate),
      environment: response.data.environment || 'Sandbox'
    });
  } catch (error) {
    console.error('Error verifying Apple purchase:', error);
    
    return formatResponse(false, 500, 'INTERNAL_SERVER_ERROR', {
      status: STATUS.FAILED,
      message: error.message
    });
  }
}

module.exports = {
  verifyApplePurchase
};