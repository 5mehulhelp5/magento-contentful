const crypto = require('crypto');

/**
 * Generate OAuth 1.0 signature for Magento API
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - Full URL including query parameters
 * @param {Object} params - OAuth parameters
 * @param {string} consumerSecret - Consumer secret
 * @param {string} tokenSecret - Token secret
 * @returns {string} OAuth signature
 */
function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // Create signature base string
  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&');

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  // Generate HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(baseString)
    .digest('base64');

  return signature;
}

/**
 * Generate OAuth 1.0 authorization header for Magento API
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint URL
 * @param {Object} bodyParams - Request body parameters (for POST/PUT) - NOT USED for JSON APIs
 * @returns {string} Authorization header value
 */
function generateOAuthHeader(method, url, bodyParams = {}) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(32).toString('hex') + timestamp;

  const oauthParams = {
    oauth_consumer_key: process.env.MAGENTO_CONSUMER_KEY,
    oauth_token: process.env.MAGENTO_ACCESS_TOKEN,
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: '1.0'
  };

  // For REST JSON APIs, don't include body parameters in signature
  // Only OAuth parameters are used for signature calculation
  const signatureParams = { ...oauthParams };

  // Generate signature
  const signature = generateOAuthSignature(
    method,
    url,
    signatureParams,
    process.env.MAGENTO_CONSUMER_SECRET,
    process.env.MAGENTO_TOKEN_SECRET
  );

  // Add signature to OAuth parameters
  oauthParams.oauth_signature = signature;

  // Build authorization header
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');

  return authHeader;
}

module.exports = {
  generateOAuthHeader,
  generateOAuthSignature
};