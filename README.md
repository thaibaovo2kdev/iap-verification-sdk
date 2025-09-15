# IAP Verification SDK

A Node.js SDK for verifying in-app purchases from Google Play Store and Apple App Store.

## Features

- Unified API for both Google Play and Apple App Store
- Simple configuration
- Platform auto-detection
- Consistent response format
- Error handling
- Environment support (sandbox/production)
- Backward compatibility with android/ios platform names

## Installation

```bash
npm install iap-verification-sdk --save
```

## Usage

### Initializing the SDK

```javascript
const iapVerifier = require('iap-verification-sdk');

// Create a verifier instance with your configuration
const verifier = iapVerifier.create({
  // Set environment to 'sandbox' or 'production'
  environment: 'sandbox',
  
  // Google Play configuration
  google: {
    serviceAccount: {
      // Your service account JSON contents
      type: 'service_account',
      project_id: 'your-project-id',
      private_key_id: 'your-private-key-id',
      private_key: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
      client_email: 'your-service-account-email',
      client_id: 'your-client-id',
      // ... other service account fields
    }
  },
  
  // Apple App Store configuration
  apple: {
    issuerId: 'your-issuer-id',
    keyId: 'your-key-id',
    bundleId: 'your-bundle-id',
    privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
    sharedSecret: 'your-shared-secret' // Optional, for legacy verification
  }
});
```

### Verifying Google Play Purchases

```javascript
// Verify a Google Play purchase
const googleResult = await verifier.verify({
  platform: 'google', // Both 'google' and 'android' are supported for backward compatibility
  packageName: 'com.example.app',
  productId: 'premium_upgrade',
  purchaseToken: 'token-from-purchase'
});

console.log(googleResult);
// {
//   isSuccess: true,
//   statusCode: 200,
//   message: 'VERIFY_PURCHASE_SUCCESS',
//   result: {
//     status: 'COMPLETED', // or 'WAITING', 'FAILED', 'PENDING'
//     productId: 'premium_upgrade',
//     orderId: '12345678',
//     transactionId: '12345678',
//     purchaseDate: 1632150000000,
//     environment: 'Sandbox'
//   }
// }
```

### Verifying Apple App Store Purchases

```javascript
// Verify an Apple App Store purchase
const appleResult = await verifier.verify({
  platform: 'apple', // Both 'apple' and 'ios' are supported for backward compatibility
  transactionId: '1000000123456789'
});

console.log(appleResult);
// {
//   isSuccess: true,
//   statusCode: 200,
//   message: 'VERIFY_PURCHASE_SUCCESS',
//   result: {
//     status: 'COMPLETED', // or 'WAITING', 'FAILED', 'PENDING'
//     bundleId: 'com.example.app',
//     productId: 'premium_upgrade',
//     transactionId: '1000000123456789',
//     purchaseDate: 1632150000000,
//     environment: 'Sandbox'
//   }
// }
```

### Direct Verification (One-time Use)

```javascript
const { verify } = require('iap-verification-sdk');

// Verify a purchase directly
const result = await verify({
  config: {
    environment: 'sandbox',
    google: { /* ... */ },
    apple: { /* ... */ }
  },
  platform: 'google',
  packageName: 'com.example.app',
  productId: 'premium_upgrade',
  purchaseToken: 'token-from-purchase'
});
```

### Platform Auto-detection

```javascript
// SDK will auto-detect the platform based on provided parameters
const result = await verifier.verify({
  // Google Play parameters
  packageName: 'com.example.app',
  productId: 'premium_upgrade',
  purchaseToken: 'token-from-purchase'
});

// OR

const result = await verifier.verify({
  // Apple App Store parameters
  transactionId: '1000000123456789'
});
```

## Platform Naming

The SDK supports both new and old platform naming conventions for backward compatibility:

- Google Play Store: `'google'` or `'android'`
- Apple App Store: `'apple'` or `'ios'`

We recommend using the new naming convention (`'google'` and `'apple'`), but the SDK will automatically normalize old platform names.

## Publishing and Versioning

This package includes scripts to help with publishing and versioning:

```bash
# Publish with automatic patch version increment
npm run release:patch

# Publish with automatic minor version increment
npm run release:minor

# Publish with automatic major version increment
npm run release:major

# Alternative: use the publish.js script
node publish.js patch   # or minor, major
```

## License

MIT