/**
 * Client-side Recipe Card Template for Infinite Scroll
 * This file is served as a static asset and provides recipe card generation
 * functionality for the browser's infinite scroll system.
 */

/**
 * Extract brief description from recipe body content
 * @param {Object} body - Rich text body content
 * @returns {string} Brief description text
 */
function extractBriefDescription(body) {
  if (!body?.content?.[0]?.content?.[0]?.value) {
    return "";
  }

  const firstParagraph = body.content[0].content[0].value;
  // Limit to first 120 characters and end at word boundary
  if (firstParagraph.length <= 120) {
    return firstParagraph;
  }

  const truncated = firstParagraph.substring(0, 120);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 80 ? truncated.substring(0, lastSpace) + "..." : truncated + "...";
}

/**
 * Generate complete recipe card HTML
 * @param {Object} recipe - Contentful recipe object
 * @param {string} linkBase - Base URL for recipe links (default: '/preview/recipe')
 * @returns {string} Complete HTML string for recipe card
 */
function generateRecipeCardHTML(recipe, linkBase = "") {
  // Extract and process recipe data
  const { sys, fields = {} } = recipe || {};
  const {
    title,
    body,
    featuredImage,
    imageAlt,
    listImage,
    listImageStandard,
    listImageAlt,
    newSlug,
    slug,
    frontendUrl,
    instructions,
  } = fields;

  // Prioritize listImageStandard for recipes, fallback to listImage, then featuredImage
  const cardImage = listImageStandard || listImage || featuredImage;
  const cardImageAlt = listImageAlt || imageAlt || title;

  // Get brief description from body content
  const briefDescription = extractBriefDescription(body);

  // Get instruction count for display
  const instructionCount = instructions?.length || 0;

  // Create recipe URL
  let recipeUrl;
  if (frontendUrl) {
    // Fix any old "harvest-recipies" URLs to use correct spelling
    let correctedUrl = frontendUrl.replace('harvest-recipies', 'harvest-recipes');
    // Ensure correctedUrl starts with / for absolute path
    recipeUrl = correctedUrl.startsWith('/') ? correctedUrl : `/${correctedUrl}`;
  } else if (linkBase) {
    // Construct production URL from linkBase and slug
    recipeUrl = `/${linkBase}/${newSlug || slug}`;
  } else {
    // Fallback to preview URL
    recipeUrl = `/preview/recipe/${newSlug || slug || sys?.id}`;
  }

  // Handle image URL (ensure HTTPS)
  let imageUrl = null;
  if (cardImage?.fields?.file?.url) {
    imageUrl = cardImage.fields.file.url.startsWith("//")
      ? `https:${cardImage.fields.file.url}`
      : cardImage.fields.file.url;
  }

  // Generate the complete recipe card HTML (matching article card structure)
  return `
    <a href="${recipeUrl}" class="article-card">
      ${
        cardImage && imageUrl
          ? `
        <div class="article-card-image">
          <img
            src="${imageUrl}"
            alt="${cardImageAlt || title || "Recipe image"}"
            loading="lazy"
          />
        </div>
      `
          : `
        <div class="article-card-image">
          <div class="article-card-placeholder">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      `
      }
      <div class="article-card-content">
        <h3 class="article-card-title">${title || "Untitled Recipe"}</h3>
      </div>
    </a>
  `.trim();
}

// Make available globally for infinite scroll system
// Use ArticleCardTemplate interface for compatibility with existing infinite scroll
window.ArticleCardTemplate = {
  generateArticleCardHTML: generateRecipeCardHTML,
  extractBriefDescription,
  getArticleMetadata: (recipe, linkBase) => {
    const { sys, fields = {} } = recipe || {};
    const {
      title,
      body,
      featuredImage,
      imageAlt,
      listImage,
      listImageStandard,
      listImageAlt,
      newSlug,
      slug,
      frontendUrl,
      instructions,
    } = fields;

    const cardImage = listImageStandard || listImage || featuredImage;
    const cardImageAlt = listImageAlt || imageAlt || title;
    const briefDescription = extractBriefDescription(body);
    const instructionCount = instructions?.length || 0;
    const recipeUrl = frontendUrl
      ? frontendUrl.replace('harvest-recipies', 'harvest-recipes')
      : `${linkBase}/${newSlug || slug}`;

    let imageUrl = null;
    if (cardImage?.fields?.file?.url) {
      imageUrl = cardImage.fields.file.url.startsWith("//")
        ? `https:${cardImage.fields.file.url}`
        : cardImage.fields.file.url;
    }

    return {
      title: title || "Untitled Recipe",
      articleUrl: recipeUrl,
      imageUrl,
      cardImageAlt: cardImageAlt || title || "Recipe image",
      isGrowingGuide: false, // Recipes are not growing guides
      hasImage: !!(cardImage && imageUrl),
      sys,
      fields,
    };
  }
};

// Also keep RecipeCardTemplate for backwards compatibility
window.RecipeCardTemplate = {
  generateRecipeCardHTML,
  extractBriefDescription,
};