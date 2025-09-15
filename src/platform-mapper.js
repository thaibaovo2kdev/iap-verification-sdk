/**
 * Platform name mapper for backward compatibility
 */

/**
 * Map platform names for backward compatibility
 * 
 * @param {string} platform Platform name from client
 * @returns {string} Normalized platform name ('google' or 'apple')
 */
function normalizePlatform(platform) {
  if (!platform) return null;
  
  const platformLower = platform.toLowerCase();
  
  // Map old platform names to new ones
  if (platformLower === 'android') return 'google';
  if (platformLower === 'ios') return 'apple';
  
  // For new platform names, return as is
  if (platformLower === 'google' || platformLower === 'apple') {
    return platformLower;
  }
  
  // Unknown platform
  return null;
}

module.exports = {
  normalizePlatform
};