const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { generateOAuthHeader } = require("./magentoAuth");
const ContentfulManagement = require("./contentfulManagement");

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
              conditionType: "eq",
            },
          ],
        },
      ],
    },
  };

  try {
    const queryString = `searchCriteria[filterGroups][0][filters][0][field]=identifier&searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(
      identifier
    )}&searchCriteria[filterGroups][0][filters][0][conditionType]=eq`;
    const searchEndpoint = `${endpoint}?${queryString}`;

    const authHeader = generateOAuthHeader("GET", searchEndpoint);

    console.log("DEBUG: Searching for CMS page:", {
      identifier,
      searchEndpoint,
      authHeaderPreview: authHeader.substring(0, 50) + "...",
    });

    const response = await fetch(searchEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error("Error searching for CMS page:", {
        status: response.status,
        response: responseData,
      });
      return null;
    }

    // Return the first page if found, null if not found
    if (responseData.items && responseData.items.length > 0) {
      return responseData.items[0];
    }

    return null;
  } catch (error) {
    console.error("Error searching for CMS page:", error);
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
 * @param {string} contentType - Content type ("recipe", "article", "category", "faq", etc.)
 * @returns {Promise<Object>} API response
 */
async function createOrUpdateCmsPage(pageData, method = "POST", pageId = null, contentType = "article") {
  const baseUrl = process.env.STAGING_MAGENTO_BASE_URL;
  const endpoint = pageId
    ? `${baseUrl}/rest/default/V1/cmsPage/${pageId}`
    : `${baseUrl}/rest/default/V1/cmsPage`;

  const requestBody = {
    page: {
      identifier: pageData.identifier,
      title: pageData.title,
      page_layout: pageData.page_layout || "cms-full-width",
      meta_title: pageData.meta_title || pageData.title,
      meta_keywords: pageData.meta_keywords || "",
      meta_description: pageData.meta_description || "",
      content_heading: pageData.meta_title || pageData.title,
      content: pageData.content || "",
      creation_time:
        pageData.creation_time ||
        new Date().toISOString().slice(0, 19).replace("T", " "),
      update_time: new Date().toISOString().slice(0, 19).replace("T", " "),
      sort_order: pageData.sort_order || "0",
      custom_theme: pageData.custom_theme || "",
      active: pageData.active !== undefined ? (pageData.active ? 1 : 0) : 1,
      type: contentType,
    },
  };

  try {
    const authHeader = generateOAuthHeader(method, endpoint, requestBody);

    console.log("DEBUG: Sending request to Magento:", {
      endpoint,
      method,
      requestBody: JSON.stringify(requestBody, null, 2),
    });

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error("Magento API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        response: responseData,
        requestBody: JSON.stringify(requestBody, null, 2),
        endpoint: endpoint,
      });
      throw new Error(
        `Magento API Error: ${response.status} - ${JSON.stringify(
          responseData
        )}`
      );
    }

    return {
      success: true,
      data: responseData,
      status: response.status,
    };
  } catch (error) {
    console.error("Error creating/updating CMS page:", error);
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
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
    const authHeader = generateOAuthHeader("GET", endpoint);

    console.log("DEBUG: Getting CMS page by ID:", {
      pageId,
      endpoint,
      authHeaderPreview: authHeader.substring(0, 50) + "...",
    });

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error("Error getting CMS page by ID:", {
        status: response.status,
        response: responseData,
      });
      return null;
    }

    return responseData;
  } catch (error) {
    console.error("Error getting CMS page by ID:", error);
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
  const title = contentfulEntry.fields.title || "Untitled";
  const existingMagentoId = contentfulEntry.fields.magentoId;
  const existingFrontendUrl = contentfulEntry.fields.frontendUrl;

  console.log(`Processing article: ${title}`);
  if (existingMagentoId) {
    console.log(`Found existing Magento ID: ${existingMagentoId}`);
  } else {
    console.log("No existing Magento ID found - will create new page");
  }
  if (existingFrontendUrl) {
    console.log(`Found existing frontend URL: ${existingFrontendUrl}`);
  } else {
    console.log("No existing frontend URL found - will create new URL");
  }

  // Sanitize and validate data for Magento
  const sanitizeString = (str) => {
    if (!str) return "";
    return str.replace(/[<>\/\\]/g, "").substring(0, 255); // Remove HTML tags, slashes and limit length
  };

  function slugify(str) {
    return str
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading/trailing whitespace
      .replace(/\s*\/\s*/g, "/") // Remove spaces around forward slashes
      .replace(/[^\w\s\/-]/g, "") // Remove special chars except words, spaces, slashes, hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/\/+/g, "/") // Replace multiple slashes with single slash
      .replace(/^[-\/]+|[-\/]+$/g, ""); // Remove leading/trailing hyphens or slashes
  }

  // Create fallback URL structure with null checking
  const categoryTitle =
    contentfulEntry.fields.mainCategory?.fields?.title || "uncategorized";
  const articleSlug =
    contentfulEntry.fields.newSlug ||
    contentfulEntry.fields.slug ||
    contentfulEntry.sys.id.toLowerCase();

  // Check content type and use appropriate URL pattern
  const contentType = contentfulEntry.sys.contentType.sys.id;
  let basePath;

  if (contentType === "recipe") {
    basePath = "garden-guide/harvest-recipes";
  } else {
    basePath = "garden-guide/" + slugify(categoryTitle);
  }

  const frontendUrl = existingFrontendUrl
    ? existingFrontendUrl
    : basePath + "/" + articleSlug;

  console.log("NEW FRONTEND URL");
  console.log(frontendUrl);

  // Extract just the body content for Magento (remove DOCTYPE, html, head tags)
  const magentoContent = extractBodyContentForMagento(renderedHtml);

  const pageData = {
    title: sanitizeString(title),
    content: magentoContent,
    identifier: frontendUrl,
    meta_title: sanitizeString(contentfulEntry.fields.metaTitle || title),
    meta_description: sanitizeString(
      contentfulEntry.fields.metaDescription || ""
    ),
    meta_keywords: sanitizeString(contentfulEntry.fields.metaKeywords || ""),
    content_heading: sanitizeString(
      contentfulEntry.fields.contentHeading || ""
    ),
    active: 1,
    page_layout: "cms-full-width",
    sort_order: "0",
    creation_time: contentfulEntry.sys.createdAt
      ? new Date(contentfulEntry.sys.createdAt)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
      : new Date().toISOString().slice(0, 19).replace("T", " "),
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
      result = await createOrUpdateCmsPage(pageData, "PUT", existingMagentoId, contentType);
      action = "updated";
      finalMagentoId = existingMagentoId;
    } else {
      // Page no longer exists in Magento, create a new one
      console.log(
        `⚠️  Magento page with ID ${existingMagentoId} not found, creating new page`
      );
      result = await createOrUpdateCmsPage(pageData, "POST", null, contentType);
      action = "recreated";
      finalMagentoId = result.success ? result.data.id : null;
    }
  } else {
    // No Magento ID exists, check if a page with the identifier already exists (legacy check)
    console.log(
      `Checking if Magento page exists with identifier: ${frontendUrl}`
    );
    const existingPage = await getCmsPageByIdentifier(frontendUrl);

    if (existingPage) {
      // Page exists with this identifier, update it and save the ID back to Contentful
      console.log(
        `Found existing page with identifier ${frontendUrl}, updating and saving ID`
      );
      result = await createOrUpdateCmsPage(pageData, "PUT", existingPage.id, contentType);
      action = "updated";
      finalMagentoId = existingPage.id;
    } else {
      // Create new page
      console.log(`Creating new Magento page with identifier: ${frontendUrl}`);
      result = await createOrUpdateCmsPage(pageData, "POST", null, contentType);
      action = "created";
      finalMagentoId = result.success ? result.data.id : null;
    }
  }

  // If successful, save the Magento ID and frontend URL back to Contentful (if needed) and make page searchable
  if (result.success && finalMagentoId) {
    const contentfulMgmt = new ContentfulManagement();

    // Save Magento ID back to Contentful if we don't already have it or if it changed
    if (!existingMagentoId || existingMagentoId !== finalMagentoId) {
      try {
        const updateResult = await contentfulMgmt.updateEntryWithMagentoId(
          contentfulEntry.sys.id,
          finalMagentoId
        );

        if (updateResult.success) {
          console.log(
            `✅ Saved Magento ID ${finalMagentoId} back to Contentful entry ${contentfulEntry.sys.id}`
          );
        } else {
          console.log(
            `⚠️  Warning: Could not save Magento ID back to Contentful: ${updateResult.message}`
          );
        }
      } catch (error) {
        console.log(
          `⚠️  Warning: Could not save Magento ID back to Contentful: ${error.message}`
        );
        // Don't fail the whole operation if Contentful update fails
      }
    }

    // Save frontend URL back to Contentful if we generated a new one
    if (!existingFrontendUrl) {
      try {
        const frontendUrlUpdateResult =
          await contentfulMgmt.updateEntryWithFrontendUrl(
            contentfulEntry.sys.id,
            frontendUrl
          );

        if (frontendUrlUpdateResult.success) {
          console.log(
            `✅ Saved generated frontend URL ${frontendUrl} back to Contentful entry ${contentfulEntry.sys.id}`
          );
        } else {
          console.log(
            `⚠️  Warning: Could not save frontend URL back to Contentful: ${frontendUrlUpdateResult.message}`
          );
        }
      } catch (error) {
        console.log(
          `⚠️  Warning: Could not save frontend URL back to Contentful: ${error.message}`
        );
        // Don't fail the whole operation if Contentful update fails
      }
    }

    // Make the page searchable via database
    try {
      const MagentoDatabase = require("./database");
      const db = new MagentoDatabase();
      const identifier = pageData.identifier;
      const searchableResult = await db.setCmsPageSearchable(identifier, 1);
      await db.disconnect();

      if (searchableResult.success) {
        console.log(`✅ Made page searchable: ${identifier}`);
      } else {
        console.log(
          `⚠️  Warning: Could not make page searchable: ${searchableResult.message}`
        );
      }
    } catch (error) {
      console.log(
        `⚠️  Warning: Could not make page searchable: ${error.message}`
      );
      // Don't fail the whole operation if searchable update fails
    }
  }

  return {
    ...result,
    action: action,
    identifier: pageData.identifier,
    title: title,
    magentoId: finalMagentoId,
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
  let styles = styleMatch ? styleMatch[1] : "";

  // Extract body content
  const bodyMatch = fullHtml.match(/<body>([\s\S]*?)<\/body>/);
  const bodyContent = bodyMatch ? bodyMatch[1] : fullHtml;

  // Wrap content in a scoped container to prevent CSS conflicts
  const scopedContent = `<div class="contentful-category-page">${bodyContent}</div>`;

  /*
  // Simple CSS scoping - just prefix our main classes to avoid conflicts
  if (styles) {
    styles = styles
      // Scope body styles to our container
      .replace(/body\s*{/g, ".contentful-category-page {")
      // Scope all class selectors
      .replace(
        /(\s|^)(\.[a-zA-Z][a-zA-Z0-9_-]*)/g,
        "$1.contentful-category-page $2"
      )
      // Fix our responsive-grid specifically
      .replace(
        /\.contentful-category-page \.contentful-category-page/g,
        ".contentful-category-page"
      )
      // Fix media queries that got double-scoped
      .replace(
        /@media[^{]+{[^}]+\.contentful-category-page \.responsive-grid/g,
        (match) => {
          return match.replace(
            ".contentful-category-page .responsive-grid",
            ".contentful-category-page .responsive-grid"
          );
        }
      );
  }*/

  return `<style>${styles}</style>\n${scopedContent}`;
}

/**
 * Submit a category page to Magento (create or update)
 * @param {Object} categoryData - Contentful category data
 * @param {string} renderedHtml - Rendered HTML content
 * @returns {Promise<Object>} Result of the operation
 */
async function submitCategoryToMagento(categoryData, renderedHtml) {
  console.log("SUBMITTING CATEGORY");
  const title = categoryData.fields.title || "Untitled Category";
  const existingMagentoId = categoryData.fields.magentoId;

  console.log(`Processing category: ${title}`);
  if (existingMagentoId) {
    console.log(`Found existing Magento ID: ${existingMagentoId}`);
  } else {
    console.log("No existing Magento ID found - will create new page");
  }

  // Sanitize and validate data for Magento
  const sanitizeString = (str) => {
    if (!str) return "";
    return str.replace(/[<>\/\\]/g, "").substring(0, 255);
  };

  function formatCategoryPath(input) {
    return input
      .toLowerCase()
      .split("/")
      .map((part) => part.trim().replace(/\s+/g, "-"))
      .join("/");
  }

  function getLastCategory(input) {
    return input.split("/").pop().trim();
  }

  // Extract just the body content for Magento (remove DOCTYPE, html, head tags)
  const magentoContent = extractBodyContentForMagento(renderedHtml);

  const pageData = {
    title: `Garden Guide: ${sanitizeString(getLastCategory(title))}`,
    identifier: "garden-guide/" + formatCategoryPath(title),
    content: magentoContent,
    meta_title: sanitizeString(`${title} - Articles`),
    meta_description: sanitizeString(
      `Browse all articles in the ${title} category`
    ),
    active: 1,
    page_layout: "cms-full-width",
    sort_order: "100", // Lower priority than individual articles
    creation_time: categoryData.sys.createdAt
      ? new Date(categoryData.sys.createdAt)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
      : new Date().toISOString().slice(0, 19).replace("T", " "),
    update_time: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  let result;
  let action;
  let finalMagentoId;
  const contentfulMgmt = new ContentfulManagement();

  try {
    if (existingMagentoId) {
      // We have a Magento ID, try to update the existing page
      console.log(
        `Updating existing Magento page with ID: ${existingMagentoId}`
      );

      // First verify the page still exists
      const existingPage = await getCmsPageById(existingMagentoId);

      if (existingPage) {
        // Page exists, update it using the ID
        result = await createOrUpdateCmsPage(
          pageData,
          "PUT",
          existingMagentoId,
          "category"
        );
        action = "updated";
        finalMagentoId = existingMagentoId;
      } else {
        // Page no longer exists in Magento, create a new one
        console.log(
          `⚠️  Magento page with ID ${existingMagentoId} not found, creating new page`
        );
        pageData.identifier = pageData.identifier;
        result = await createOrUpdateCmsPage(pageData, "POST", null, "category");
        action = "recreated";
        finalMagentoId = result.success ? result.data.id : null;
      }
    } else {
      // No Magento ID exists, check if a page with the identifier already exists (legacy check)
      console.log(
        `Checking if Magento page exists with identifier: ${pageData.identifier}`
      );
      const existingPage = await getCmsPageByIdentifier(pageData.identifier);

      if (existingPage) {
        // Page exists with this identifier, update it and save the ID back to Contentful
        console.log(
          `Found existing page with identifier ${pageData.identifier}, updating and saving ID`
        );
        result = await createOrUpdateCmsPage(pageData, "PUT", existingPage.id, "category");
        action = "updated";
        finalMagentoId = existingPage.id.toString();

        // Save the discovered Magento ID back to Contentful
        const updateResult = await contentfulMgmt.updateCategoryWithMagentoId(
          categoryData.sys.id,
          finalMagentoId
        );
        if (!updateResult.success) {
          console.warn(
            `⚠️  Updated Magento page but failed to save ID to Contentful: ${updateResult.error}`
          );
        }
      } else {
        // No existing page found, create a new one
        console.log(`Creating new Magento page for category "${title}"`);
        pageData.identifier = pageData.identifier;
        result = await createOrUpdateCmsPage(pageData, "POST", null, "category");
        action = "created";
        finalMagentoId = result.success ? result.data.id : null;

        if (finalMagentoId) {
          // Update Contentful with the new Magento ID
          const updateResult = await contentfulMgmt.updateCategoryWithMagentoId(
            categoryData.sys.id,
            finalMagentoId.toString()
          );
          if (!updateResult.success) {
            console.warn(
              `⚠️  Created Magento page but failed to update Contentful: ${updateResult.error}`
            );
          }
        }
      }
    }

    // Make the page searchable via database if successful
    if (result.success && finalMagentoId) {
      try {
        const MagentoDatabase = require("./database");
        const db = new MagentoDatabase();
        const identifier = pageData.identifier || pageData.identifier;
        const searchableResult = await db.setCmsPageSearchable(identifier, 1);
        await db.disconnect();

        if (searchableResult.success) {
          console.log(`✅ Made category page searchable: ${identifier}`);
        } else {
          console.log(
            `⚠️  Warning: Could not make category page searchable: ${searchableResult.message}`
          );
        }
      } catch (error) {
        console.log(
          `⚠️  Warning: Could not make category page searchable: ${error.message}`
        );
        // Don't fail the whole operation if searchable update fails
      }
    }

    // Handle the result
    if (result.success) {
      console.log(
        `✅ Successfully ${action} Magento page for category "${title}"`
      );
      return {
        success: true,
        action: action,
        identifier: result.data.identifier || pageData.identifier,
        magentoId: finalMagentoId,
        status: result.data.active ? "active" : "inactive",
        title: title,
      };
    } else {
      console.log(`❌ Failed to ${action} Magento page: ${result.error}`);
      return {
        success: false,
        action: `${action}_failed`,
        error: result.error,
        title: title,
      };
    }
  } catch (error) {
    console.error(`❌ Error submitting category to Magento:`, error);
    return {
      success: false,
      action: "error",
      error: error.message,
      title: title,
    };
  }
}

/**
 * Submit a Contentful FAQ to Magento as a CMS page
 * @param {Object} contentfulEntry - Contentful FAQ entry object
 * @param {string} renderedHtml - Rendered HTML content
 * @returns {Promise<Object>} Result of the operation
 */
async function submitFAQToMagento(contentfulEntry, renderedHtml) {
  const title = contentfulEntry.fields.title || "Untitled FAQ";
  const existingMagentoId = contentfulEntry.fields.magentoId;
  const existingFrontendUrl = contentfulEntry.fields.frontendUrl;

  console.log(`Processing FAQ: ${title}`);
  if (existingMagentoId) {
    console.log(`Found existing Magento ID: ${existingMagentoId}`);
  } else {
    console.log("No existing Magento ID found - will create new page");
  }
  if (existingFrontendUrl) {
    console.log(`Found existing frontend URL: ${existingFrontendUrl}`);
  } else {
    console.log("No existing frontend URL found - will create new URL");
  }

  // Sanitize and validate data for Magento
  const sanitizeString = (str) => {
    if (!str) return "";
    return str.replace(/[<>\/\\]/g, "").substring(0, 255);
  };

  function slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s*\/\s*/g, "/")
      .replace(/[^\w\s\/-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/\/+/g, "/")
      .replace(/^[-\/]+|[-\/]+$/g, "");
  }

  // Create FAQ URL structure: help/{category}/{slug}
  const categorySlug = contentfulEntry.fields.freshdeskCategoryName
    ? slugify(contentfulEntry.fields.freshdeskCategoryName)
    : "general";

  const faqSlug =
    contentfulEntry.fields.slug || contentfulEntry.sys.id.toLowerCase();

  const frontendUrl = existingFrontendUrl
    ? existingFrontendUrl
    : `help/${categorySlug}/${faqSlug}`;

  console.log("FAQ FRONTEND URL");
  console.log(frontendUrl);

  // Extract just the body content for Magento
  const magentoContent = extractBodyContentForMagento(renderedHtml);

  const pageData = {
    title: sanitizeString(`FAQ: ${title}`),
    content: magentoContent,
    identifier: frontendUrl,
    meta_title: sanitizeString(contentfulEntry.fields.metaTitle || title),
    meta_description: sanitizeString(
      contentfulEntry.fields.metaDescription || ""
    ),
    meta_keywords: sanitizeString(
      contentfulEntry.fields.tags ? contentfulEntry.fields.tags.join(", ") : ""
    ),
    content_heading: sanitizeString(title),
    active: 1,
    page_layout: "cms-full-width",
    sort_order: "200", // Lower priority than articles
    creation_time: contentfulEntry.sys.createdAt
      ? new Date(contentfulEntry.sys.createdAt)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
      : new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  let result;
  let action;
  let finalMagentoId;

  if (existingMagentoId) {
    // Update existing page logic (same as articles)
    console.log(`Updating existing Magento page with ID: ${existingMagentoId}`);

    const existingPage = await getCmsPageById(existingMagentoId);

    if (existingPage) {
      result = await createOrUpdateCmsPage(pageData, "PUT", existingMagentoId, "faq");
      action = "updated";
      finalMagentoId = existingMagentoId;
    } else {
      console.log(
        `⚠️  Magento page with ID ${existingMagentoId} not found, creating new page`
      );
      result = await createOrUpdateCmsPage(pageData, "POST", null, "faq");
      action = "recreated";
      finalMagentoId = result.success ? result.data.id : null;
    }
  } else {
    // Check for existing page by identifier
    console.log(
      `Checking if Magento page exists with identifier: ${frontendUrl}`
    );
    const existingPage = await getCmsPageByIdentifier(frontendUrl);

    if (existingPage) {
      console.log(
        `Found existing page with identifier ${frontendUrl}, updating and saving ID`
      );
      result = await createOrUpdateCmsPage(pageData, "PUT", existingPage.id, "faq");
      action = "updated";
      finalMagentoId = existingPage.id;
    } else {
      console.log(`Creating new Magento page with identifier: ${frontendUrl}`);
      result = await createOrUpdateCmsPage(pageData, "POST", null, "faq");
      action = "created";
      finalMagentoId = result.success ? result.data.id : null;
    }
  }

  // Save IDs back to Contentful if successful
  if (result.success && finalMagentoId) {
    const contentfulMgmt = new ContentfulManagement();

    // Save Magento ID back to Contentful if needed
    if (!existingMagentoId || existingMagentoId !== finalMagentoId) {
      try {
        const updateResult = await contentfulMgmt.updateEntryWithMagentoId(
          contentfulEntry.sys.id,
          finalMagentoId
        );

        if (updateResult.success) {
          console.log(
            `✅ Saved Magento ID ${finalMagentoId} back to Contentful FAQ ${contentfulEntry.sys.id}`
          );
        } else {
          console.log(
            `⚠️  Warning: Could not save Magento ID back to Contentful: ${updateResult.message}`
          );
        }
      } catch (error) {
        console.log(
          `⚠️  Warning: Could not save Magento ID back to Contentful: ${error.message}`
        );
      }
    }

    // Save frontend URL back to Contentful if we generated a new one
    if (!existingFrontendUrl) {
      try {
        const frontendUrlUpdateResult =
          await contentfulMgmt.updateEntryWithFrontendUrl(
            contentfulEntry.sys.id,
            frontendUrl
          );

        if (frontendUrlUpdateResult.success) {
          console.log(
            `✅ Saved generated frontend URL ${frontendUrl} back to Contentful FAQ ${contentfulEntry.sys.id}`
          );
        } else {
          console.log(
            `⚠️  Warning: Could not save frontend URL back to Contentful: ${frontendUrlUpdateResult.message}`
          );
        }
      } catch (error) {
        console.log(
          `⚠️  Warning: Could not save frontend URL back to Contentful: ${error.message}`
        );
      }
    }

    // Make the page searchable via database
    try {
      const MagentoDatabase = require("./database");
      const db = new MagentoDatabase();
      const identifier = pageData.identifier;
      const searchableResult = await db.setCmsPageSearchable(identifier, 1);
      await db.disconnect();

      if (searchableResult.success) {
        console.log(`✅ Made FAQ page searchable: ${identifier}`);
      } else {
        console.log(
          `⚠️  Warning: Could not make FAQ page searchable: ${searchableResult.message}`
        );
      }
    } catch (error) {
      console.log(
        `⚠️  Warning: Could not make FAQ page searchable: ${error.message}`
      );
    }
  }

  return {
    ...result,
    action: action,
    identifier: pageData.identifier,
    title: title,
    magentoId: finalMagentoId,
  };
}

/**
 * Submit homepage to Magento as a CMS page
 * @param {string} renderedHtml - Rendered HTML content
 * @returns {Promise<Object>} Result of the operation
 */
async function submitHomepageToMagento(renderedHtml) {
  const title = "Burpee Garden Guide";
  const identifier = "garden-guide";

  console.log(`Processing homepage: ${title}`);

  // Check if homepage already exists
  const existingPage = await getCmsPageByIdentifier(identifier);

  // Extract just the body content for Magento (remove DOCTYPE, html, head tags)
  const magentoContent = extractBodyContentForMagento(renderedHtml);

  const pageData = {
    title: title,
    content: magentoContent,
    identifier: identifier,
    meta_title:
      "Burpee Garden Guide - Gardening Tips, Plant Care & Growing Advice",
    meta_description:
      "Dig in to find garden inspiration and advice from the experts at Burpee. Get help with planting, growing, and caring for your garden.",
    meta_keywords:
      "garden guide, gardening tips, plant care, growing advice, burpee",
    content_heading: "",
    active: 1,
    page_layout: "cms-full-width",
    sort_order: "0",
    creation_time: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  let result;
  let action;
  let finalMagentoId;

  if (existingPage) {
    // Page exists, update it
    console.log(`Updating existing homepage with ID: ${existingPage.id}`);
    result = await createOrUpdateCmsPage(pageData, "PUT", existingPage.id, "homepage");
    action = "updated";
    finalMagentoId = existingPage.id;
  } else {
    // Create new page
    console.log("Creating new homepage in Magento");
    result = await createOrUpdateCmsPage(pageData, "POST", null, "homepage");
    action = "created";
    finalMagentoId = result.success ? result.data.id : null;
  }

  if (result.success) {
    console.log(`✅ Successfully ${action} homepage in Magento`);
    console.log(`📄 Page ID: ${finalMagentoId}`);
    console.log(`🔗 Frontend URL: ${identifier}`);

    return {
      success: true,
      action: action,
      identifier: identifier,
      magentoId: finalMagentoId,
      status: result.status || 200,
    };
  } else {
    console.error(`❌ Failed to ${action} homepage in Magento:`, result.error);
    return {
      success: false,
      error: result.error,
      action: action,
      identifier: identifier,
    };
  }
}

async function submitRecipeCategoryToMagento(categoryData, renderedHtml) {
  console.log("SUBMITTING RECIPE CATEGORY");
  const title = categoryData.fields.title || "Untitled Category";
  const existingMagentoId = categoryData.fields.magentoId;
  console.log(`Processing recipe category: ${title}`);
  if (existingMagentoId) {
    console.log(`Found existing Magento ID: ${existingMagentoId}`);
  } else {
    console.log("No existing Magento ID found - will create new page");
  }
  // Sanitize and validate data for Magento
  const sanitizeString = (str) => {
    if (!str) return "";
    return str.replace(/[<>\/\\]/g, "").substring(0, 255);
  };
  function formatCategoryPath(input) {
    return input
      .toLowerCase()
      .split("/")
      .map((part) => part.trim().replace(/\s+/g, "-"))
      .join("/");
  }
  function getLastCategory(input) {
    return input.split("/").pop().trim();
  }
  // Extract just the body content for Magento (remove DOCTYPE, html, head tags)
  const magentoContent = extractBodyContentForMagento(renderedHtml);
  const pageData = {
    title: `Recipes: ${sanitizeString(getLastCategory(title))}`,
    identifier: "recipes/" + formatCategoryPath(title),
    content: magentoContent,
    meta_title: sanitizeString(`${title} - Recipes`),
    meta_description: sanitizeString(
      `Browse all recipes in the ${title} category`
    ),
    active: 1,
    page_layout: "cms-full-width",
    sort_order: "100", // Lower priority than individual articles
    creation_time: categoryData.sys.createdAt
      ? new Date(categoryData.sys.createdAt)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
      : new Date().toISOString().slice(0, 19).replace("T", " "),
    update_time: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
  let result;
  let action;
  let finalMagentoId;
  const contentfulMgmt = new ContentfulManagement();
  try {
    if (existingMagentoId) {
      // We have a Magento ID, try to update the existing page
      console.log(
        `Updating existing Magento page with ID: ${existingMagentoId}`
      );
      // First verify the page still exists
      const existingPage = await getCmsPageById(existingMagentoId);
      if (existingPage) {
        // Page exists, update it using the ID
        result = await createOrUpdateCmsPage(
          pageData,
          "PUT",
          existingMagentoId,
          "recipe"
        );
        action = "updated";
        finalMagentoId = existingMagentoId;
      } else {
        // Page no longer exists in Magento, create a new one
        console.log(
          `⚠️  Magento page with ID ${existingMagentoId} not found, creating new page`
        );
        result = await createOrUpdateCmsPage(pageData, "POST", null, "recipe");
        action = "created";
        finalMagentoId = result.data?.id;
      }
    } else {
      // No existing Magento ID, create a new page
      console.log(`Creating new Magento page for recipe category: ${title}`);
      result = await createOrUpdateCmsPage(pageData, "POST", null, "recipe");
      action = "created";
      finalMagentoId = result.data?.id;
    }
    if (result.success && finalMagentoId) {
      // Update Contentful with the Magento ID (for new pages or if it was missing)
      if (!existingMagentoId || existingMagentoId !== finalMagentoId) {
        try {
          console.log(
            `Updating Contentful recipe category ${categoryData.sys.id} with Magento ID: ${finalMagentoId}`
          );
          await contentfulMgmt.updateEntry(categoryData.sys.id, {
            magentoId: finalMagentoId.toString(),
          });
          console.log("✅ Successfully updated Contentful with Magento ID");
        } catch (updateError) {
          console.error(
            "⚠️  Failed to update Contentful with Magento ID:",
            updateError
          );
          // Don't fail the entire operation if Contentful update fails
        }
      }
      console.log(
        `✅ Successfully ${action} recipe category page in Magento with ID: ${finalMagentoId}`
      );
      return {
        success: true,
        action: action,
        magentoId: finalMagentoId,
        magentoUrl: `${process.env.STAGING_MAGENTO_BASE_URL}/${pageData.identifier}`,
        title: title,
        identifier: pageData.identifier,
      };
    } else {
      console.error(
        `❌ Failed to ${action} recipe category in Magento:`,
        result.error
      );
      return {
        success: false,
        error: result.error,
        action: action,
        identifier: pageData.identifier,
      };
    }
  } catch (error) {
    console.error(
      `❌ Error during recipe category ${action || "submission"}:`,
      error
    );
    return {
      success: false,
      error: error.message,
      action: action || "unknown",
      identifier: pageData.identifier,
    };
  }
}

async function submitHarvestRecipesToMagento(renderedHtml) {
  console.log("SUBMITTING HARVEST RECIPES PAGE");

  // Extract just the body content for Magento (remove DOCTYPE, html, head tags)
  const magentoContent = extractBodyContentForMagento(renderedHtml);

  const pageData = {
    title: "Harvest Recipes",
    identifier: "garden-guide/harvest-recipes",
    content: magentoContent,
    meta_title: "Harvest Recipes - Garden to Table Recipes",
    meta_description:
      "Discover delicious recipes using fresh ingredients from your garden. From harvest to table, make the most of your homegrown produce.",
    active: 1,
    page_layout: "cms-full-width",
    sort_order: "50", // Higher priority than category pages
    creation_time: new Date().toISOString().slice(0, 19).replace("T", " "),
    update_time: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  try {
    // Check if the page already exists
    const existingPage = await getCmsPageByIdentifier(pageData.identifier);
    let result;
    let action;
    let finalMagentoId;

    if (existingPage) {
      // Page exists, update it
      console.log(
        `Updating existing Harvest Recipes page with ID: ${existingPage.id}`
      );
      result = await createOrUpdateCmsPage(pageData, "PUT", existingPage.id, "recipe");
      action = "updated";
      finalMagentoId = existingPage.id;
    } else {
      // Page doesn't exist, create it
      console.log("Creating new Harvest Recipes page");
      result = await createOrUpdateCmsPage(pageData, "POST", null, "recipe");
      action = "created";
      finalMagentoId = result.data?.id;
    }

    if (result.success && finalMagentoId) {
      console.log(
        `✅ Successfully ${action} Harvest Recipes page in Magento with ID: ${finalMagentoId}`
      );
      return {
        success: true,
        action: action,
        magentoId: finalMagentoId,
        magentoUrl: `${process.env.STAGING_MAGENTO_BASE_URL}/${pageData.identifier}`,
        title: "Harvest Recipes",
        identifier: pageData.identifier,
      };
    } else {
      console.error(
        `❌ Failed to ${action} Harvest Recipes page in Magento:`,
        result.error
      );
      return {
        success: false,
        error: result.error,
        action: action,
        identifier: pageData.identifier,
      };
    }
  } catch (error) {
    console.error(`❌ Error during Harvest Recipes page submission:`, error);
    return {
      success: false,
      error: error.message,
      action: "unknown",
      identifier: pageData.identifier,
    };
  }
}

module.exports = {
  getCmsPageByIdentifier,
  getCmsPageById,
  createOrUpdateCmsPage,
  submitToMagento,
  submitCategoryToMagento,
  submitRecipeCategoryToMagento,
  submitHarvestRecipesToMagento,
  submitFAQToMagento,
  submitHomepageToMagento,
  extractBodyContentForMagento,
};
