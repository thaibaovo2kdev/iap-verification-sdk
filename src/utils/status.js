/**
 * Status mapping utilities for normalizing platform-specific statuses
 */
const { STATUS, GOOGLE_PURCHASE_STATE, GOOGLE_CONSUMPTION_STATE } = require('../constants');

/**
 * Map Google Play purchase state to unified status
 * 
 * @param {Object} data Google Play purchase data
 * @returns {string} Unified status
 */
function mapGoogleStatus(data) {
  if (!data) return STATUS.FAILED;
  
  const purchaseState = GOOGLE_PURCHASE_STATE[data.purchaseState];
  const consumptionState = GOOGLE_CONSUMPTION_STATE[data.consumptionState];
  
  if (purchaseState === 'PURCHASED' && consumptionState === 'NOT_CONSUMED') {
    return STATUS.PENDING;
  }
  
  if (purchaseState === 'PURCHASED' && consumptionState === 'CONSUMED') {
    return STATUS.COMPLETED;
  }
  
  return STATUS.FAILED;
}

/**
 * Map Apple App Store purchase state to unified status
 * 
 * @param {Object} data Apple App Store purchase data
 * @returns {string} Unified status
 */
function mapAppleStatus(data) {
  if (!data || !data.inAppOwnershipType) return STATUS.FAILED;
  
  if (data.inAppOwnershipType === 'PURCHASED') {
    if (data.type && data.type.toLowerCase() === 'consumable') {
      return STATUS.COMPLETED;
    }
    return STATUS.PENDING;
  }
  
  return STATUS.FAILED;
}

/**
 * Format the verification response in a consistent way
 * 
 * @param {boolean} isSuccess Whether the verification was successful
 * @param {number} statusCode HTTP status code
 * @param {string} message Result message
 * @param {Object} result Result data
 * @returns {Object} Formatted response
 */
function formatResponse(isSuccess, statusCode, message, result = {}) {
  return {
    isSuccess,
    statusCode,
    message,
    result
  };
}

module.exports = {
  mapGoogleStatus,
  mapAppleStatus,
  formatResponse
};