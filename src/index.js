/**
 * IAP Verification SDK
 * 
 * A unified SDK for verifying in-app purchases from Google Play and Apple App Store
 */
const { createConfig } = require('./config');
const { verifyGooglePurchase } = require('./platforms/google');
const { verifyApplePurchase } = require('./platforms/apple');
const { formatResponse } = require('./utils/status');
const { STATUS } = require('./constants');
const { normalizePlatform } = require('./platform-mapper');

/**
 * IAP Verifier class
 */
class IAPVerifier {
  /**
   * Create a new IAP Verifier instance
   * 
   * @param {Object} config Configuration object
   */
  constructor(config) {
    this.config = createConfig(config);
  }

  /**
   * Verify a purchase from either Google Play or Apple App Store
   * 
   * @param {Object} options Verification options
   * @param {string} options.platform 'google' or 'apple' (optional if parameters indicate platform)
   * @param {string} options.packageName App package name (for Google)
   * @param {string} options.productId Product ID (for Google)
   * @param {string} options.purchaseToken Purchase token (for Google)
   * @param {string} options.transactionId Transaction ID (for Apple)
   * @returns {Promise<Object>} Verification result
   */
  async verify(options) {
    try {
      // Determine platform if not specified
      let platform = normalizePlatform(options.platform);
      
      if (!platform) {
        // Try to auto-detect platform from parameters
        if (options.transactionId) {
          platform = 'apple';
        } else if (options.packageName && options.productId && options.purchaseToken) {
          platform = 'google';
        } else {
          return formatResponse(false, 400, 'INVALID_PARAMETERS', {
            status: STATUS.FAILED,
            message: 'Could not determine platform from provided parameters'
          });
        }
      }
      
      // Verify based on platform
      if (platform === 'google') {
        if (!options.packageName || !options.productId || !options.purchaseToken) {
          return formatResponse(false, 400, 'MISSING_PARAMETERS', {
            status: STATUS.FAILED,
            message: 'Missing required parameters for Google Play verification'
          });
        }
        
        return await verifyGooglePurchase({
          config: this.config,
          packageName: options.packageName,
          productId: options.productId,
          purchaseToken: options.purchaseToken
        });
      } else if (platform === 'apple') {
        if (!options.transactionId) {
          return formatResponse(false, 400, 'MISSING_PARAMETERS', {
            status: STATUS.FAILED,
            message: 'Missing transactionId for Apple App Store verification'
          });
        }
        
        return await verifyApplePurchase({
          config: this.config,
          transactionId: options.transactionId
        });
      } else {
        return formatResponse(false, 400, 'INVALID_PLATFORM', {
          status: STATUS.FAILED,
          message: `Invalid platform: ${platform}`
        });
      }
    } catch (error) {
      console.error('Error in IAP verification:', error);
      
      return formatResponse(false, 500, 'INTERNAL_SERVER_ERROR', {
        status: STATUS.FAILED,
        message: error.message
      });
    }
  }
}

/**
 * Create a new IAP Verifier instance
 * 
 * @param {Object} config Configuration object
 * @returns {IAPVerifier} IAP Verifier instance
 */
function create(config) {
  return new IAPVerifier(config);
}

/**
 * Shorthand function to verify a purchase
 * 
 * @param {Object} options Verification options
 * @returns {Promise<Object>} Verification result
 */
async function verify(options) {
  if (!options.config) {
    return formatResponse(false, 400, 'MISSING_CONFIGURATION', {
      status: STATUS.FAILED,
      message: 'Configuration is required for direct verification'
    });
  }
  
  const verifier = create(options.config);
  delete options.config;
  return await verifier.verify(options);
}

module.exports = {
  create,
  verify,
  STATUS
};