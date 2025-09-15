/**
 * Constants used throughout the IAP Verification SDK
 */

// Verification status codes
const STATUS = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  WAITING: 'WAITING',
  FAILED: 'FAILED'
};

// Google Play purchase states
const GOOGLE_PURCHASE_STATE = {
  0: 'PURCHASED',
  1: 'CANCELED',
  2: 'PENDING'
};

// Google Play consumption states
const GOOGLE_CONSUMPTION_STATE = {
  0: 'NOT_CONSUMED',
  1: 'CONSUMED'
};

// Environment URLs
const ENVIRONMENT = {
  SANDBOX: 'sandbox',
  PRODUCTION: 'production'
};

// API URLs
const API_URLS = {
  APPLE: {
    [ENVIRONMENT.SANDBOX]: 'https://api.storekit-sandbox.itunes.apple.com/inApps/v1',
    [ENVIRONMENT.PRODUCTION]: 'https://api.storekit.itunes.apple.com/inApps/v1'
  }
};

// Google API scope
const GOOGLE_API_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

module.exports = {
  STATUS,
  GOOGLE_PURCHASE_STATE,
  GOOGLE_CONSUMPTION_STATE,
  ENVIRONMENT,
  API_URLS,
  GOOGLE_API_SCOPE
};