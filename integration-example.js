/**
 * Example of integrating the IAP Verification SDK with the existing codebase
 */
const fs = require('fs');
const path = require('path');
const iapVerifier = require('./src/index');
const { addQueue } = require('../packages/common/queues/commonQueue');
const User = require('../games/profile/models/user');
const config = require('../configs/config');
const { STATUS_IAP } = require('../games/iap-google/constants');

/**
 * Verify a purchase using the IAP Verification SDK
 * 
 * @param {Object} req Request object
 * @returns {Object} Response object
 */
async function verifyPurchase(req) {
  const userId = req.userId;
  const user = await User.findById(userId);
  
  // Support both old (android/ios) and new (google/apple) platform naming
  const { packageName, productId, purchaseToken, isEmulator, platform, transactionId = null } = req.body;
  
  // Set default platform to 'google' if not provided
  const clientPlatform = platform || 'google';
  const isCheat = config.NODE_ENV === 'dev' ? isEmulator : false;

  try {
    // Handle cheat/emulator mode for development
    if (isCheat) {
      if (productId === 'com.eg.jackpot.riches.slot.remove_ads') {
        user.isRemoveAds = true;
      }
      user.coin += 10000000;
      await user.save();
      
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'VERIFY_PURCHASE_SUCCESS',
        result: {
          status: STATUS_IAP.completed,
          userBalance: user.coin,
          isPaidUser: user.isPaidUser,
          isRemoveAds: user.isRemoveAds,
        },
      };
    }

    // Create SDK configuration
    const sdkConfig = {
      environment: config.NODE_ENV === 'production' ? 'production' : 'sandbox',
    };

    // Configure for the appropriate platform
    if (clientPlatform === 'google' || clientPlatform === 'android') {
      // Load service account from file
      const serviceAccountPath = path.join(__dirname, '../iap-config.json');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      sdkConfig.google = { serviceAccount };
    } else {
      // Load Apple private key from file
      const privateKeyPath = path.join(__dirname, '../private_key.p8');
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      
      sdkConfig.apple = {
        issuerId: config.IOS_USER_ID,
        keyId: config.IOS_KEY,
        bundleId: config.BID_APPLE,
        privateKey,
        sharedSecret: config.SHARE_SECRET
      };
    }

    // Create verifier instance
    const verifier = iapVerifier.create(sdkConfig);

    // Verify the purchase
    const res = await verifier.verify({
      platform: clientPlatform,
      packageName,
      productId,
      purchaseToken,
      transactionId
    });

    if (!res || !res.isSuccess) {
      return {
        isSuccess: false,
        statusCode: 400,
        message: 'VERIFY_PURCHASE_FAILED',
        result: {
          status: STATUS_IAP.failed,
        },
      };
    }

    // Check purchase history
    const historyPurchase = await PurchaseHistory.find({ purchaseToken });
    if (historyPurchase && historyPurchase.status == STATUS_IAP.failed) {
      return {
        isSuccess: false,
        statusCode: 400,
        message: 'VERIFY_PURCHASE_FAILED',
        result: {
          status: STATUS_IAP.failed,
        },
      };
    }

    // Add to queue for processing
    addQueue(`${config.PREFIX}_user`, {
      action: 'verify_purchase',
      res: res.result,
      userId,
      body: req.body,
      transactionId: res.result.transactionId || '',
    });

    return {
      isSuccess: true,
      statusCode: 200,
      message: 'VERIFY_PURCHASE_SUCCESS',
      result: {
        status: STATUS_IAP.waiting,
        userBalance: user.coin,
        isPaidUser: user.isPaidUser,
        isRemoveAds: user.isRemoveAds,
      },
    };
  } catch (error) {
    console.error('Error verifying purchase:', error);
    
    return {
      isSuccess: false,
      statusCode: 500,
      message: 'INTERNAL_SERVER_ERROR',
    };
  }
}

/**
 * Handle purchase verification in the queue worker
 * 
 * @param {Object} data Queue data
 * @returns {Object} Processing result
 */
async function verifyPurchaseHandle(data) {
  const { res, userId, body, transactionId } = data;
  const { productId, packageName, purchaseToken, platform } = body;
  const { orderId } = res;
  
  // Get the appropriate status based on the platform
  const status = STATUS_IAP[res.status];  // SDK now returns normalized status
  
  const user = await User.findById(userId);
  const newOrderId = platform === 'android' ? orderId : transactionId;
  
  try {
    // Rest of your existing verifyPurchaseHandle implementation
    // ...
    
    return {
      userBalance: user.coin,
      exp: user.exp,
      status: STATUS_IAP.pending,
      isPaidUser: user.isPaidUser,
      isRemoveAds: user.isRemoveAds,
      transactionId: newOrderId,
    };
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return {
      userBalance: user.coin,
      status: STATUS_IAP.failed,
      message: error.message,
      transactionId: newOrderId,
    };
  }
}

module.exports = {
  verifyPurchase,
  verifyPurchaseHandle
};