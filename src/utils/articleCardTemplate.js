/**
 * Unified Article Card Template System
 * Generates consistent HTML for both server-side and client-side rendering
 */

/**
 * Generate complete article card HTML
 * @param {Object} article - Contentful article object
 * @param {string} linkBase - Base URL for article links (default: '/preview/article')
 * @returns {string} Complete HTML string for article card
 */
function generateArticleCardHTML(article, linkBase = '/preview/article') {
  // Extract and process article data
  const { sys, fields = {} } = article || {};
  const {
    title,
    featuredImage,
    imageAlt,
    listImage,
    listImageAlt,
    newSlug,
    slug,
    frontendUrl,
  } = fields;

  // Use list image if available, fallback to featured image
  const cardImage = listImage || featuredImage;
  const cardImageAlt = listImageAlt || imageAlt || title;

  // Check if the article is a Growing Guide article
  const isGrowingGuide = ["Learn About", "Growing Guide"].some((substring) =>
    (title || '').includes(substring)
  );

  // Create article URL
  const articleUrl = frontendUrl 
    ? frontendUrl 
    : `${linkBase}/${newSlug || slug}`;

  // Handle image URL (ensure HTTPS)
  let imageUrl = null;
  if (cardImage?.fields?.file?.url) {
    imageUrl = cardImage.fields.file.url.startsWith('//')
      ? `https:${cardImage.fields.file.url}`
      : cardImage.fields.file.url;
  }

  // Generate the complete article card HTML
  return `
    <a href="${articleUrl}" class="article-card">
      ${cardImage && imageUrl ? `
        <div class="article-card-image ${isGrowingGuide ? 'growing-guide-image' : ''}">
          <img 
            src="${imageUrl}" 
            alt="${cardImageAlt || title || 'Article image'}"
            loading="lazy"
          />
        </div>
      ` : `
        <div class="article-card-image">
          <div class="article-card-placeholder">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      `}
      <div class="article-card-content">
        <h3 class="article-card-title">${title || 'Untitled Article'}</h3>
      </div>
    </a>
  `.trim();
}

/**
 * Generate article card content (without the outer <a> wrapper)
 * Useful for cases where the link wrapper is handled separately
 * @param {Object} article - Contentful article object
 * @param {string} linkBase - Base URL for article links
 * @returns {string} HTML string for article card content
 */
function generateArticleCardContent(article, linkBase = '/preview/article') {
  const fullHTML = generateArticleCardHTML(article, linkBase);
  // Extract content between <a> tags
  const match = fullHTML.match(/<a[^>]*>(.*)<\/a>/s);
  return match ? match[1].trim() : fullHTML;
}

/**
 * Extract article metadata for additional processing
 * @param {Object} article - Contentful article object
 * @param {string} linkBase - Base URL for article links
 * @returns {Object} Processed article metadata
 */
function getArticleMetadata(article, linkBase = '/preview/article') {
  const { sys, fields = {} } = article || {};
  const {
    title,
    featuredImage,
    imageAlt,
    listImage,
    listImageAlt,
    newSlug,
    slug,
    frontendUrl,
  } = fields;

  const cardImage = listImage || featuredImage;
  const cardImageAlt = listImageAlt || imageAlt || title;
  const isGrowingGuide = ["Learn About", "Growing Guide"].some((substring) =>
    (title || '').includes(substring)
  );
  const articleUrl = frontendUrl 
    ? frontendUrl 
    : `${linkBase}/${newSlug || slug}`;

  let imageUrl = null;
  if (cardImage?.fields?.file?.url) {
    imageUrl = cardImage.fields.file.url.startsWith('//')
      ? `https:${cardImage.fields.file.url}`
      : cardImage.fields.file.url;
  }

  return {
    title: title || 'Untitled Article',
    articleUrl,
    imageUrl,
    cardImageAlt: cardImageAlt || title || 'Article image',
    isGrowingGuide,
    hasImage: !!(cardImage && imageUrl),
    sys,
    fields
  };
}

// Export for Node.js (server-side)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateArticleCardHTML,
    generateArticleCardContent,
    getArticleMetadata
  };
}

// Export for browser (client-side)
if (typeof window !== 'undefined') {
  window.ArticleCardTemplate = {
    generateArticleCardHTML,
    generateArticleCardContent,
    getArticleMetadata
  };
}