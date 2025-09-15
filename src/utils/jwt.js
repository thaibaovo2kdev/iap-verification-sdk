/**
 * JWT token utilities for authentication with app stores
 */
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a JWT token for Apple App Store API
 * 
 * @param {Object} options Configuration options
 * @param {string} options.issuerId The issuer ID from App Store Connect
 * @param {string} options.keyId The key ID from App Store Connect
 * @param {string} options.privateKey The private key content (.p8 file)
 * @param {string} options.bundleId The bundle ID of the app
 * @returns {string} JWT token
 */
function generateAppleJWT(options) {
  const { issuerId, keyId, privateKey, bundleId } = options;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: currentTime,
    exp: currentTime + 3600, // 1 hour expiration
    aud: 'appstoreconnect-v1',
    nonce: uuidv4(),
    bid: bundleId
  };

  const jwtOptions = {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: keyId,
      typ: 'JWT'
    }
  };

  return jwt.sign(payload, privateKey, jwtOptions);
}

/**
 * Generate a JWT client for Google API authentication
 * 
 * @param {Object} serviceAccount The service account JSON object
 * @param {string} scope The API scope to request
 * @returns {Object} Google JWT client
 */
function createGoogleJWTClient(serviceAccount, scope) {
  const { google } = require('googleapis');
  
  return new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    [scope]
  );
}

module.exports = {
  generateAppleJWT,
  createGoogleJWTClient
};