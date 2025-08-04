const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { generateOAuthHeader } = require('./magentoAuth');

/**
 * Create or update a CMS page in Magento
 * @param {Object} pageData - Page data object
 * @param {string} pageData.identifier - Unique page identifier
 * @param {string} pageData.title - Page title
 * @param {string} pageData.content - Page HTML content
 * @param {boolean} pageData.active - Whether page is active
 * @param {string} method - HTTP method (POST for create, PUT for update)
 * @param {string} pageId - Page ID (required for PUT requests)
 * @returns {Promise<Object>} API response
 */
async function createOrUpdateCmsPage(pageData, method = 'POST', pageId = null) {
  const baseUrl = process.env.MAGENTO_BASE_URL;
  const endpoint = pageId ? 
    `${baseUrl}/rest/default/V1/cmsPage/${pageId}` : 
    `${baseUrl}/rest/default/V1/cmsPage`;

  const requestBody = {
    page: {
      identifier: pageData.identifier,
      title: pageData.title,
      page_layout: pageData.page_layout || 'cms-full-width',
      meta_title: pageData.meta_title || pageData.title,
      meta_keywords: pageData.meta_keywords || '',
      meta_description: pageData.meta_description || '',
      content_heading: pageData.content_heading || '',
      content: pageData.content || '',
      creation_time: pageData.creation_time || new Date().toISOString().slice(0, 19).replace('T', ' '),
      update_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      sort_order: pageData.sort_order || '0',
      custom_theme: pageData.custom_theme || '',
      active: pageData.active !== undefined ? pageData.active : true
    }
  };

  try {
    const authHeader = generateOAuthHeader(method, endpoint, requestBody);

    console.log('DEBUG: Sending request to Magento:', {
      endpoint,
      method,
      requestBody: JSON.stringify(requestBody, null, 2)
    });

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error('Magento API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData,
        requestBody: JSON.stringify(requestBody, null, 2),
        endpoint: endpoint
      });
      throw new Error(`Magento API Error: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    return {
      success: true,
      data: responseData,
      status: response.status
    };

  } catch (error) {
    console.error('Error creating/updating CMS page:', error);
    return {
      success: false,
      error: error.message,
      status: error.status || 500
    };
  }
}

/**
 * Submit a Contentful article to Magento as a CMS page
 * @param {Object} contentfulEntry - Contentful entry object
 * @param {string} renderedHtml - Rendered HTML content
 * @returns {Promise<Object>} Result of the operation
 */
async function submitToMagento(contentfulEntry, renderedHtml) {
  const title = contentfulEntry.fields.title || 'Untitled';
  
  // Create a more meaningful URL-friendly identifier based on title
  const titleSlug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 40); // Limit length
  
  // Fallback to entry ID if title produces empty slug
  const shortId = contentfulEntry.sys.id.substring(0, 8).toLowerCase().replace(/[^a-z0-9]/g, '');
  const identifier = titleSlug || `cf-${shortId}`;

  console.log(`Attempting to create Magento page: ${identifier}`);

  // Sanitize and validate data for Magento
  const sanitizeString = (str) => {
    if (!str) return '';
    return str.replace(/[<>\/\\]/g, '').substring(0, 255); // Remove HTML tags, slashes and limit length
  };

  // Create URL-safe identifier and title
  const sanitizeUrlKey = (str) => {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const pageData = {
    identifier: identifier,
    title: sanitizeString(title),
    content: renderedHtml,
    meta_title: sanitizeString(contentfulEntry.fields.metaTitle || title),
    meta_description: sanitizeString(contentfulEntry.fields.metaDescription || ''),
    meta_keywords: sanitizeString(contentfulEntry.fields.metaKeywords || ''),
    content_heading: sanitizeString(contentfulEntry.fields.contentHeading || ''),
    active: true,
    page_layout: 'cms-full-width',
    sort_order: '0',
    creation_time: contentfulEntry.sys.createdAt ? 
      new Date(contentfulEntry.sys.createdAt).toISOString().slice(0, 19).replace('T', ' ') : 
      new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  // Try to create new page directly
  console.log(`Creating new Magento page: ${identifier}`);
  const result = await createOrUpdateCmsPage(pageData, 'POST');

  return {
    ...result,
    action: 'created',
    identifier: identifier,
    title: title
  };
}

module.exports = {
  createOrUpdateCmsPage,
  submitToMagento
};