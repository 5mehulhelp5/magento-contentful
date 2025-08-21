const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { generateOAuthHeader } = require('./magentoAuth');
const ContentfulManagement = require('./contentfulManagement');

/**
 * Check if a CMS page exists by identifier
 * @param {string} identifier - Page identifier to search for
 * @returns {Promise<Object|null>} Page data if exists, null if not found
 */
async function getCmsPageByIdentifier(identifier) {
  const baseUrl = process.env.STAGING_MAGENTO_BASE_URL;
  const endpoint = `${baseUrl}/rest/default/V1/cmsPage/search`;
  
  const searchCriteria = {
    searchCriteria: {
      filterGroups: [
        {
          filters: [
            {
              field: "identifier",
              value: identifier,
              conditionType: "eq"
            }
          ]
        }
      ]
    }
  };

  try {
    const queryString = `searchCriteria[filterGroups][0][filters][0][field]=identifier&searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(identifier)}&searchCriteria[filterGroups][0][filters][0][conditionType]=eq`;
    const searchEndpoint = `${endpoint}?${queryString}`;
    
    const authHeader = generateOAuthHeader('GET', searchEndpoint);

    console.log('DEBUG: Searching for CMS page:', {
      identifier,
      searchEndpoint,
      authHeaderPreview: authHeader.substring(0, 50) + '...'
    });

    const response = await fetch(searchEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error('Error searching for CMS page:', {
        status: response.status,
        response: responseData
      });
      return null;
    }

    // Return the first page if found, null if not found
    if (responseData.items && responseData.items.length > 0) {
      return responseData.items[0];
    }
    
    return null;

  } catch (error) {
    console.error('Error searching for CMS page:', error);
    return null;
  }
}

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
  const baseUrl = process.env.STAGING_MAGENTO_BASE_URL;
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
      active: pageData.active !== undefined ? (pageData.active ? 1 : 0) : 1
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
 * Get a CMS page by ID (direct lookup)
 * @param {string|number} pageId - Magento page ID
 * @returns {Promise<Object|null>} Page data if exists, null if not found
 */
async function getCmsPageById(pageId) {
  const baseUrl = process.env.STAGING_MAGENTO_BASE_URL;
  const endpoint = `${baseUrl}/rest/default/V1/cmsPage/${pageId}`;
  
  try {
    const authHeader = generateOAuthHeader('GET', endpoint);

    console.log('DEBUG: Getting CMS page by ID:', {
      pageId,
      endpoint,
      authHeaderPreview: authHeader.substring(0, 50) + '...'
    });

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error('Error getting CMS page by ID:', {
        status: response.status,
        response: responseData
      });
      return null;
    }

    return responseData;

  } catch (error) {
    console.error('Error getting CMS page by ID:', error);
    return null;
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
  const existingMagentoId = contentfulEntry.fields.magentoId;
  
  console.log(`Processing article: ${title}`);
  if (existingMagentoId) {
    console.log(`Found existing Magento ID: ${existingMagentoId}`);
  } else {
    console.log('No existing Magento ID found - will create new page');
  }

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

  // Create a meaningful URL-friendly identifier based on title (fallback for new pages)
  const titleSlug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 40); // Limit length
  
  // Fallback to entry ID if title produces empty slug
  const shortId = contentfulEntry.sys.id.substring(0, 8).toLowerCase().replace(/[^a-z0-9]/g, '');
  const fallbackIdentifier = titleSlug || `cf-${shortId}`;

  // Extract just the body content for Magento (remove DOCTYPE, html, head tags)
  const magentoContent = extractBodyContentForMagento(renderedHtml);

  const pageData = {
    title: sanitizeString(title),
    content: magentoContent,
    meta_title: sanitizeString(contentfulEntry.fields.metaTitle || title),
    meta_description: sanitizeString(contentfulEntry.fields.metaDescription || ''),
    meta_keywords: sanitizeString(contentfulEntry.fields.metaKeywords || ''),
    content_heading: sanitizeString(contentfulEntry.fields.contentHeading || ''),
    active: 1,
    page_layout: 'cms-full-width',
    sort_order: '0',
    creation_time: contentfulEntry.sys.createdAt ? 
      new Date(contentfulEntry.sys.createdAt).toISOString().slice(0, 19).replace('T', ' ') : 
      new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  let result;
  let action;
  let finalMagentoId;

  if (existingMagentoId) {
    // We have a Magento ID, try to update the existing page
    console.log(`Updating existing Magento page with ID: ${existingMagentoId}`);
    
    // First verify the page still exists
    const existingPage = await getCmsPageById(existingMagentoId);
    
    if (existingPage) {
      // Page exists, update it using the ID
      result = await createOrUpdateCmsPage(pageData, 'PUT', existingMagentoId);
      action = 'updated';
      finalMagentoId = existingMagentoId;
    } else {
      // Page no longer exists in Magento, create a new one
      console.log(`⚠️  Magento page with ID ${existingMagentoId} not found, creating new page`);
      pageData.identifier = fallbackIdentifier;
      result = await createOrUpdateCmsPage(pageData, 'POST');
      action = 'recreated';
      finalMagentoId = result.success ? result.data.id : null;
    }
  } else {
    // No Magento ID exists, check if a page with the identifier already exists (legacy check)
    console.log(`Checking if Magento page exists with identifier: ${fallbackIdentifier}`);
    const existingPage = await getCmsPageByIdentifier(fallbackIdentifier);
    
    if (existingPage) {
      // Page exists with this identifier, update it and save the ID back to Contentful
      console.log(`Found existing page with identifier ${fallbackIdentifier}, updating and saving ID`);
      result = await createOrUpdateCmsPage(pageData, 'PUT', existingPage.id);
      action = 'updated';
      finalMagentoId = existingPage.id;
    } else {
      // Create new page
      console.log(`Creating new Magento page with identifier: ${fallbackIdentifier}`);
      pageData.identifier = fallbackIdentifier;
      result = await createOrUpdateCmsPage(pageData, 'POST');
      action = 'created';
      finalMagentoId = result.success ? result.data.id : null;
    }
  }

  // If successful, save the Magento ID back to Contentful (if needed) and make page searchable
  if (result.success && finalMagentoId) {
    // Save Magento ID back to Contentful if we don't already have it or if it changed
    if (!existingMagentoId || existingMagentoId !== finalMagentoId) {
      try {
        const contentfulMgmt = new ContentfulManagement();
        const updateResult = await contentfulMgmt.updateEntryWithMagentoId(
          contentfulEntry.sys.id, 
          finalMagentoId
        );
        
        if (updateResult.success) {
          console.log(`✅ Saved Magento ID ${finalMagentoId} back to Contentful entry ${contentfulEntry.sys.id}`);
        } else {
          console.log(`⚠️  Warning: Could not save Magento ID back to Contentful: ${updateResult.message}`);
        }
      } catch (error) {
        console.log(`⚠️  Warning: Could not save Magento ID back to Contentful: ${error.message}`);
        // Don't fail the whole operation if Contentful update fails
      }
    }

    // Make the page searchable via database
    try {
      const MagentoDatabase = require('./database');
      const db = new MagentoDatabase();
      const identifier = pageData.identifier || fallbackIdentifier;
      const searchableResult = await db.setCmsPageSearchable(identifier, 1);
      await db.disconnect();
      
      if (searchableResult.success) {
        console.log(`✅ Made page searchable: ${identifier}`);
      } else {
        console.log(`⚠️  Warning: Could not make page searchable: ${searchableResult.message}`);
      }
    } catch (error) {
      console.log(`⚠️  Warning: Could not make page searchable: ${error.message}`);
      // Don't fail the whole operation if searchable update fails
    }
  }

  return {
    ...result,
    action: action,
    identifier: pageData.identifier || fallbackIdentifier,
    title: title,
    magentoId: finalMagentoId
  };
}

/**
 * Extract just the body content from full HTML document for Magento
 * @param {string} fullHtml - Complete HTML document
 * @returns {string} Just the body content with minimal scoped styles
 */
function extractBodyContentForMagento(fullHtml) {
  // Extract styles from head
  const styleMatch = fullHtml.match(/<style>([\s\S]*?)<\/style>/);
  let styles = styleMatch ? styleMatch[1] : '';
  
  // Extract body content
  const bodyMatch = fullHtml.match(/<body>([\s\S]*?)<\/body>/);
  const bodyContent = bodyMatch ? bodyMatch[1] : fullHtml;
  
  // Wrap content in a scoped container to prevent CSS conflicts
  const scopedContent = `<div class="contentful-category-page">${bodyContent}</div>`;
  
  // Simple CSS scoping - just prefix our main classes to avoid conflicts
  if (styles) {
    styles = styles
      // Scope body styles to our container
      .replace(/body\s*{/g, '.contentful-category-page {')
      // Scope all class selectors
      .replace(/(\s|^)(\.[a-zA-Z][a-zA-Z0-9_-]*)/g, '$1.contentful-category-page $2')
      // Fix our responsive-grid specifically
      .replace(/\.contentful-category-page \.contentful-category-page/g, '.contentful-category-page')
      // Fix media queries that got double-scoped
      .replace(/@media[^{]+{[^}]+\.contentful-category-page \.responsive-grid/g, (match) => {
        return match.replace('\.contentful-category-page \.responsive-grid', '.contentful-category-page .responsive-grid');
      });
  }
  
  return `<style>${styles}</style>\n${scopedContent}`;
}

/**
 * Submit a category page to Magento (create or update)
 * @param {Object} categoryData - Contentful category data
 * @param {string} renderedHtml - Rendered HTML content
 * @returns {Promise<Object>} Result of the operation
 */
async function submitCategoryToMagento(categoryData, renderedHtml) {
  const title = categoryData.fields.title?.['en-US'] || 'Untitled Category';
  const existingMagentoId = categoryData.fields.magentoId?.['en-US'];
  
  console.log(`Processing category: ${title}`);
  if (existingMagentoId) {
    console.log(`Found existing Magento ID: ${existingMagentoId}`);
  } else {
    console.log('No existing Magento ID found - will create new page');
  }

  // Sanitize and validate data for Magento
  const sanitizeString = (str) => {
    if (!str) return '';
    return str.replace(/[<>\/\\]/g, '').substring(0, 255);
  };

  // Create URL-safe identifier for category pages
  const createCategorySlug = (categoryTitle) => {
    if (!categoryTitle) return '';
    return categoryTitle.toLowerCase()
      .replace(/[^a-z0-9\s-\/]/g, '') // Keep slashes for category hierarchies
      .replace(/\s*\/\s*/g, '-') // Replace " / " with hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  };

  // Create identifier with "category-" prefix
  const categorySlug = createCategorySlug(title);
  const shortId = categoryData.sys.id.substring(0, 8).toLowerCase().replace(/[^a-z0-9]/g, '');
  const fallbackIdentifier = categorySlug ? `category-${categorySlug}` : `category-cf-${shortId}`;

  // Extract just the body content for Magento (remove DOCTYPE, html, head tags)
  const magentoContent = extractBodyContentForMagento(renderedHtml);

  const pageData = {
    title: `${sanitizeString(title)} - Articles`,
    content: magentoContent,
    meta_title: sanitizeString(`${title} - Articles`),
    meta_description: sanitizeString(`Browse all articles in the ${title} category`),
    active: 1,
    page_layout: 'cms-full-width',
    sort_order: '100', // Lower priority than individual articles
    creation_time: categoryData.sys.createdAt ? 
      new Date(categoryData.sys.createdAt).toISOString().slice(0, 19).replace('T', ' ') :
      new Date().toISOString().slice(0, 19).replace('T', ' '),
    update_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  let result;
  const contentfulMgmt = new ContentfulManagement();

  try {
    if (existingMagentoId) {
      // Update existing page
      console.log(`Updating existing Magento page with ID: ${existingMagentoId}`);
      result = await createOrUpdateCmsPage(pageData, 'PUT', existingMagentoId);
      
      if (result.success) {
        console.log(`✅ Successfully updated Magento page ${existingMagentoId} for category "${title}"`);
        return {
          success: true,
          action: 'updated',
          identifier: result.data.identifier || fallbackIdentifier,
          magentoId: existingMagentoId,
          status: result.data.active ? 'active' : 'inactive',
          title: title
        };
      } else {
        console.log(`❌ Failed to update Magento page: ${result.error}`);
        return {
          success: false,
          action: 'update_failed',
          error: result.error,
          title: title
        };
      }
    } else {
      // Create new page
      console.log(`Creating new Magento page for category "${title}"`);
      pageData.identifier = fallbackIdentifier;
      
      result = await createOrUpdateCmsPage(pageData, 'POST');
      
      if (result.success && result.data.id) {
        const newMagentoId = result.data.id.toString();
        console.log(`✅ Successfully created Magento page with ID: ${newMagentoId} for category "${title}"`);
        
        // Update Contentful with the new Magento ID
        const updateResult = await contentfulMgmt.updateCategoryWithMagentoId(categoryData.sys.id, newMagentoId);
        
        if (!updateResult.success) {
          console.warn(`⚠️  Created Magento page but failed to update Contentful: ${updateResult.error}`);
        }
        
        return {
          success: true,
          action: 'created',
          identifier: result.data.identifier || fallbackIdentifier,
          magentoId: newMagentoId,
          status: result.data.active ? 'active' : 'inactive',
          title: title,
          contentfulUpdate: updateResult
        };
      } else {
        console.log(`❌ Failed to create Magento page: ${result.error}`);
        return {
          success: false,
          action: 'create_failed',
          error: result.error,
          title: title
        };
      }
    }
  } catch (error) {
    console.error(`❌ Error submitting category to Magento:`, error);
    return {
      success: false,
      action: 'error',
      error: error.message,
      title: title
    };
  }
}

module.exports = {
  getCmsPageByIdentifier,
  getCmsPageById,
  createOrUpdateCmsPage,
  submitToMagento,
  submitCategoryToMagento,
  extractBodyContentForMagento
};