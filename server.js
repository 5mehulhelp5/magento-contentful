require("dotenv").config();
require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
  extensions: [".js", ".jsx"],
});

const express = require("express");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createClient } = require("contentful");
const fs = require("fs").promises;
const path = require("path");
const { submitToMagento } = require("./src/utils/magentoAPI");

const app = express();
app.use(express.json());

// Serve static files from public directory
app.use(express.static("public"));

// Contentful client setup
const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
});

// Note: CONTENTFUL_MANAGEMENT_TOKEN is required for the new Magento ID workflow
// This allows updating Contentful entries with Magento IDs after page creation
if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
  console.warn(
    "⚠️  CONTENTFUL_MANAGEMENT_TOKEN not found. New Magento ID workflow will not be able to update Contentful entries."
  );
}

// CSS is now served as an external file from /public/styles.css
let cachedCSS = null;

// Helper function to read CSS file contents
async function getCSSContents() {
  if (cachedCSS === null) {
    try {
      cachedCSS = await fs.readFile(
        path.join(__dirname, "public", "styles.css"),
        "utf8"
      );
    } catch (error) {
      console.error("Error reading CSS file:", error);
      cachedCSS = ""; // Fallback to empty string
    }
  }
  return cachedCSS;
}

// Helper function to inline JavaScript files
async function inlineJavaScriptFiles(html) {
  try {
    // Find all script tags with src attributes (more flexible regex)
    const scriptTagRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/g;
    let processedHtml = html;
    const matches = [...html.matchAll(scriptTagRegex)];

    console.log(`Found ${matches.length} script tags to potentially inline`);

    for (const match of matches) {
      const fullTag = match[0];
      const srcPath = match[1];

      console.log(`Processing script tag: ${srcPath}`);

      // Only inline local scripts (starting with / or relative paths)
      if (srcPath.startsWith("/") || !srcPath.includes("://")) {
        try {
          // Remove query parameters and leading slash for file path
          const cleanPath = srcPath.split("?")[0].replace(/^\//, "");
          const jsFilePath = path.join(__dirname, "public", cleanPath);

          console.log(`Attempting to inline JavaScript file: ${jsFilePath}`);
          const jsContent = await fs.readFile(jsFilePath, "utf8");

          // Replace the external script tag with an inline script
          const inlineScript = `<script>${jsContent}</script>`;
          processedHtml = processedHtml.replace(fullTag, inlineScript);
          console.log(`Successfully inlined: ${cleanPath}`);
        } catch (error) {
          console.error(
            `Error inlining JavaScript file ${srcPath}:`,
            error.message
          );
          // Keep original script tag if inlining fails
        }
      } else {
        console.log(`Skipping external script: ${srcPath}`);
      }
    }

    return processedHtml;
  } catch (error) {
    console.error("Error processing JavaScript inlining:", error);
    return html; // Return original HTML if processing fails
  }
}

// Function to render page to static HTML
async function renderPageToStatic(PageComponent, props = {}, options = {}) {
  const { inlineCSS = false, inlineJS = false } = options;
  let html = renderToStaticMarkup(React.createElement(PageComponent, props));

  let cssContent = "";
  if (inlineCSS) {
    const cssText = await getCSSContents();
    cssContent = `<style>${cssText} .top-container{ display: none} </style>`;
  } else {
    cssContent = `<link rel="stylesheet" href="/styles.css">`;
  }

  // Inline JavaScript files if requested
  if (inlineJS) {
    console.log("--- HTML BEFORE JavaScript inlining ---");
    console.log(html.substring(html.length - 1000)); // Show last 1000 chars where scripts usually are
    html = await inlineJavaScriptFiles(html);
    console.log("--- HTML AFTER JavaScript inlining ---");
    console.log(html.substring(html.length - 1000)); // Show last 1000 chars after processing
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${props.title || "Page"}</title>
    ${cssContent}
</head>
<body>
    ${html}
</body>
</html>`;

  return { html: fullHtml };
}

// Helper function to check if an entry is archived
function isEntryArchived(entry) {
  if (!entry || !entry.metadata) {
    return false;
  }

  // Check if entry has archived tag in metadata
  if (entry.metadata.tags && entry.metadata.tags.length > 0) {
    return entry.metadata.tags.some(tag =>
      tag.sys && tag.sys.id === 'archived' ||
      (typeof tag === 'string' && tag.toLowerCase() === 'archived')
    );
  }

  return false;
}

// Get content from Contentful
async function getContentfulEntry(entryId) {
  try {
    const entry = await contentfulClient.getEntry(entryId);

    // Check if entry is archived (treat as deleted)
    if (isEntryArchived(entry)) {
      console.log(`Entry ${entryId} is archived, treating as deleted`);
      return null;
    }

    return entry;
  } catch (error) {
    console.error("Error fetching Contentful entry:", error);
    return null;
  }
}

// Get category data from Contentful
async function getContentfulCategory(categoryId) {
  try {
    const category = await contentfulClient.getEntry(categoryId);

    // Check if category is archived (treat as deleted)
    if (isEntryArchived(category)) {
      console.log(`Category ${categoryId} is archived, treating as deleted`);
      return null;
    }

    return category;
  } catch (error) {
    console.error("Error fetching Contentful category:", error);
    return null;
  }
}

// Get child categories for a given parent category
async function getChildCategories(parentCategoryId) {
  try {
    const childCategories = await contentfulClient.getEntries({
      content_type: "category",
      "fields.parent.sys.id": parentCategoryId,
      limit: 1000, // Get all child categories
    });

    // Filter out archived categories
    const activeCategories = childCategories.items.filter(category => !isEntryArchived(category));

    const archivedCount = childCategories.items.length - activeCategories.length;
    if (archivedCount > 0) {
      console.log(`Filtered out ${archivedCount} archived child categories for ${parentCategoryId}`);
    }

    console.log(
      `Found ${activeCategories.length} active child categories for ${parentCategoryId}`
    );
    return activeCategories;
  } catch (error) {
    console.error("Error fetching child categories:", error);
    return [];
  }
}

// Get all categories for the sidebar navigation
async function getAllCategories() {
  try {
    const allCategories = await contentfulClient.getEntries({
      content_type: "category",
      limit: 1000, // Get all categories
    });

    // Filter out archived categories
    const activeCategories = allCategories.items.filter(category => !isEntryArchived(category));

    const archivedCount = allCategories.items.length - activeCategories.length;
    if (archivedCount > 0) {
      console.log(`Filtered out ${archivedCount} archived categories from navigation`);
    }

    console.log(`Found ${activeCategories.length} active categories for navigation`);
    return activeCategories;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
}

// Get top-level categories with sample articles for homepage
async function getTopLevelCategoriesWithArticles() {
  try {
    // Get categories that don't have a parent (top-level categories)
    const topLevelCategories = await contentfulClient.getEntries({
      content_type: "category",
      "fields.parent[exists]": false, // Categories without a parent
      limit: 10,
    });

    // Filter out archived categories
    const activeTopLevelCategories = topLevelCategories.items.filter(category => !isEntryArchived(category));

    const archivedCount = topLevelCategories.items.length - activeTopLevelCategories.length;
    if (archivedCount > 0) {
      console.log(`Filtered out ${archivedCount} archived top-level categories from homepage`);
    }

    console.log(`Found ${activeTopLevelCategories.length} active top-level categories`);

    const categoriesWithArticles = [];

    for (const category of activeTopLevelCategories) {
      // Get 3 most recent articles for this category
      const { items: articles } = await getCategoryArticles(category.sys.id, 3, 0);

      categoriesWithArticles.push({
        category,
        articles: articles.slice(0, 3), // Ensure max 3 articles
      });
    }

    return categoriesWithArticles;
  } catch (error) {
    console.error("Error fetching top-level categories with articles:", error);
    return [];
  }
}

// Get articles by category from Contentful (supports hierarchical aggregation)
async function getCategoryArticles(categoryId, limit = 100, skip = 0) {
  try {
    console.log(`Fetching articles for category: ${categoryId}`);

    // First, get articles directly assigned to this category
    const directArticles = await getDirectCategoryArticles(
      categoryId,
      limit,
      skip
    );

    const childCategories = await getChildCategories(categoryId);

    if (childCategories.length > 0) {
      console.log(
        `Aggregating articles from ${childCategories.length} child categories`
      );

      // Get articles from all child categories
      const allArticles = [];
      const existingIds = new Set();

      for (const childCategory of childCategories) {
        const childArticles = await getDirectCategoryArticles(
          childCategory.sys.id,
          1000,
          0
        );

        childArticles.items.forEach((article) => {
          if (!existingIds.has(article.sys.id) && !isEntryArchived(article)) {
            allArticles.push(article);
            existingIds.add(article.sys.id);
          }
        });
      }

      // Sort by published date (most recent first)
      allArticles.sort((a, b) => {
        const dateA = new Date(a.fields.publishedAt || a.sys.createdAt);
        const dateB = new Date(b.fields.publishedAt || b.sys.createdAt);
        return dateB - dateA;
      });

      console.log(`Found ${allArticles.length} articles from child categories`);

      return {
        items: [...directArticles.items, ...allArticles], // Apply pagination
        total: allArticles.length,
        limit,
        skip,
      };
    }

    return directArticles;
  } catch (error) {
    console.error("Error fetching category articles:", error);
    return { items: [], total: 0, limit, skip };
  }
}

// Get articles directly assigned to a specific category (helper function)
async function getDirectCategoryArticles(categoryId, limit = 100, skip = 0) {
  try {
    // Query articles where mainCategory includes the target category
    const entries = await contentfulClient.getEntries({
      content_type: "article",
      limit: limit,
      skip: skip,
      "sys.id[ne]": categoryId, // Exclude the category entry itself
      "fields.mainCategory.sys.id": categoryId,
      include: 2, // Include linked entries (categories, assets)
      select: [
        "sys.id",
        "sys.createdAt",
        "sys.updatedAt",
        "fields.title",
        "fields.featuredImage",
        "fields.imageAlt",
        "fields.listImage",
        "fields.listImageAlt",
        "fields.publishedAt",
        "fields.metaDescription",
        "fields.slug",
        "fields.newSlug",
        "fields.frontendUrl",
      ].join(","),
    });

    // Also fetch articles that have this category as a secondary category
    const secondaryEntries = await contentfulClient.getEntries({
      content_type: "article",
      limit: limit,
      skip: skip,
      "fields.secondaryCategories.sys.id[in]": categoryId,
      include: 2,
      select: [
        "sys.id",
        "sys.createdAt",
        "sys.updatedAt",
        "fields.title",
        "fields.featuredImage",
        "fields.imageAlt",
        "fields.listImage",
        "fields.listImageAlt",
        "fields.publishedAt",
        "fields.metaDescription",
        "fields.slug",
        "fields.newSlug",
        "fields.frontendUrl",
      ].join(","),
    });

    // Filter out archived articles and combine
    const activeMainArticles = entries.items.filter(article => !isEntryArchived(article));
    const activeSecondaryArticles = secondaryEntries.items.filter(article => !isEntryArchived(article));

    // Combine and deduplicate articles by ID
    const allArticles = [...activeMainArticles];
    const existingIds = new Set(activeMainArticles.map((item) => item.sys.id));

    activeSecondaryArticles.forEach((item) => {
      if (!existingIds.has(item.sys.id)) {
        allArticles.push(item);
      }
    });

    // Log filtered articles
    const filteredMainCount = entries.items.length - activeMainArticles.length;
    const filteredSecondaryCount = secondaryEntries.items.length - activeSecondaryArticles.length;
    if (filteredMainCount > 0 || filteredSecondaryCount > 0) {
      console.log(`Filtered out ${filteredMainCount + filteredSecondaryCount} archived articles for category ${categoryId}`);
    }

    // Sort by published date (most recent first)
    allArticles.sort((a, b) => {
      const dateA = new Date(a.fields.publishedAt || a.sys.createdAt);
      const dateB = new Date(b.fields.publishedAt || b.sys.createdAt);
      return dateB - dateA;
    });

    return {
      items: allArticles,
      total: allArticles.length, // Use actual count after filtering
      limit,
      skip,
    };
  } catch (error) {
    console.error("Error fetching direct category articles:", error);
    return { items: [], total: 0, limit, skip };
  }
}

// Search for a Magento CMS page by identifier
async function findMagentoPageByIdentifier(identifier) {
  const request = {
    url: `${process.env.STAGING_MAGENTO_BASE_URL}/rest/default/V1/cmsPage/search?searchCriteria[filter_groups][0][filters][0][field]=identifier&searchCriteria[filter_groups][0][filters][0][value]=${identifier}&searchCriteria[filter_groups][0][filters][0][condition_type]=eq`,
    method: "GET",
  };

  const authHeader = getOAuthHeaders(request);

  const response = await fetch(request.url, {
    method: request.method,
    headers: {
      ...authHeader,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const searchResults = await response.json();
  return searchResults.items.length > 0 ? searchResults.items[0] : null;
}

// API Routes
app.get("/render/article/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;

    // Fetch content from Contentful
    const contentfulEntry = await getContentfulEntry(entryId);

    if (!contentfulEntry) {
      return res.status(404).json({ error: "Content not found" });
    }

    const PageComponent = require("./src/pages/ArticlePage.jsx").default;
    const { html } = await renderPageToStatic(PageComponent, {
      data: contentfulEntry.fields,
      title: contentfulEntry.fields.title,
    });

    // Save to output directory
    await fs.mkdir("./output", { recursive: true });
    await fs.writeFile(`./output/${entryId}.html`, html);

    res.json({
      success: true,
      message: `Article rendered and saved to ./output/${entryId}.html`,
      entryId: entryId,
      title: contentfulEntry.fields.title,
    });
  } catch (error) {
    console.error("Error rendering article:", error);
    res.status(500).json({ error: error.message });
  }
});

// Homepage render and submit route (must come before generic route)
app.post("/render-and-submit/garden-guide-test", async (req, res) => {
  try {
    const HomePage = require("./src/pages/HomePage.jsx");
    
    // Fetch top-level categories with articles
    const categoriesWithArticles = await getTopLevelCategoriesWithArticles();
    
    console.log(`Rendering homepage for Magento with ${categoriesWithArticles.length} categories`);
    
    const { html } = await renderPageToStatic(
      HomePage,
      {
        categoriesWithArticles,
        title: "Burpee Garden Guide - Homepage",
      },
      { inlineCSS: true, inlineJS: true }
    );

    // Save to output directory
    await fs.mkdir("./output", { recursive: true });
    await fs.writeFile(`./output/homepage.html`, html);

    // Submit to Magento
    const { submitHomepageToMagento } = require("./src/utils/magentoAPI");
    const magentoResult = await submitHomepageToMagento(html);

    if (magentoResult.success) {
      res.json({
        success: true,
        message: `Homepage rendered and ${magentoResult.action} in Magento`,
        categories: categoriesWithArticles.length,
        magento: {
          action: magentoResult.action,
          identifier: magentoResult.identifier,
          magentoId: magentoResult.magentoId,
          status: magentoResult.status,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Homepage rendered but failed to submit to Magento",
        categories: categoriesWithArticles.length,
        error: magentoResult.error,
      });
    }
  } catch (error) {
    console.error("Error rendering homepage:", error);
    res.status(500).json({ error: error.message });
  }
});

// New route: Render and submit to Magento
app.post("/render-and-submit/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;

    // Fetch content from Contentful
    const contentfulEntry = await getContentfulEntry(entryId);

    if (!contentfulEntry) {
      return res.status(404).json({ error: "Content not found" });
    }

    const PageComponent = require("./src/pages/ArticlePage.jsx").default;
    const { html } = await renderPageToStatic(
      PageComponent,
      {
        data: contentfulEntry.fields,
        title: contentfulEntry.fields.title,
      },
      { inlineCSS: true }
    );

    // Save to output directory
    await fs.mkdir("./output", { recursive: true });
    await fs.writeFile(`./output/${entryId}.html`, html);

    // Submit to Magento
    const magentoResult = await submitToMagento(contentfulEntry, html);

    if (magentoResult.success) {
      res.json({
        success: true,
        message: `Article rendered and ${magentoResult.action} in Magento`,
        entryId: entryId,
        title: contentfulEntry.fields.title,
        magento: {
          action: magentoResult.action,
          identifier: magentoResult.identifier,
          status: magentoResult.status,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Article rendered but failed to submit to Magento",
        entryId: entryId,
        title: contentfulEntry.fields.title,
        error: magentoResult.error,
      });
    }
  } catch (error) {
    console.error("Error rendering and submitting article:", error);
    res.status(500).json({ error: error.message });
  }
});

// Render and send to Magento
app.post("/render/article/:entryId/magento", async (req, res) => {
  try {
    const { entryId } = req.params;

    // Fetch content from Contentful
    const contentfulEntry = await getContentfulEntry(entryId);

    if (!contentfulEntry) {
      return res.status(404).json({ error: "Content not found" });
    }

    const PageComponent = require("./src/pages/ArticlePage.jsx").default;
    const { html } = await renderPageToStatic(PageComponent, {
      data: contentfulEntry.fields,
      title: contentfulEntry.fields.title,
    });

    const magentoIdentifier = entryId.toLowerCase();

    // Check if the page already exists in Magento
    const existingPage = await findMagentoPageByIdentifier(magentoIdentifier);

    let magentoResponse;
    if (existingPage) {
      // Update existing page
      const pageData = {
        page: {
          id: existingPage.id,
          title: contentfulEntry.fields.title,
          content: html,
          active: true,
        },
      };
      magentoResponse = await updateMagentoPage(existingPage.id, pageData);
    } else {
      // Create new page
      const pageData = {
        page: {
          identifier: magentoIdentifier,
          title: contentfulEntry.fields.title,
          page_layout: "cms-full-width",
          content: html,
          active: true,
        },
      };
      magentoResponse = await createMagentoPage(pageData);
    }

    res.json({
      success: true,
      message: `Article ${existingPage ? "updated" : "created"} in Magento.`,
      magentoResponse,
    });
  } catch (error) {
    console.error("Error processing Magento request:", error);
    res.status(500).json({ error: error.message });
  }
});

// Preview route to view rendered content
app.get("/preview/article/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;

    // Fetch content from Contentful
    const contentfulEntry = await getContentfulEntry(entryId);

    if (!contentfulEntry) {
      return res.status(404).send("<h1>Content not found</h1>");
    }

    const PageComponent = require("./src/pages/ArticlePage.jsx").default;
    const { html } = await renderPageToStatic(PageComponent, {
      data: contentfulEntry.fields,
      title: contentfulEntry.fields.title,
    });

    res.send(html);
  } catch (error) {
    console.error("Error previewing article:", error);
    res.status(500).send("<h1>Error loading content</h1>");
  }
});

// Preview route for category list pages
app.get("/preview/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Fetch category data from Contentful
    const categoryData = await getContentfulCategory(categoryId);

    if (!categoryData) {
      return res.status(404).send("<h1>Category not found</h1>");
    }

    // Fetch articles for this category
    const { items: articles, total } = await getCategoryArticles(categoryId);

    // Fetch all categories for the sidebar
    const allCategories = await getAllCategories();

    console.log(
      `Preview category: ${categoryData.fields?.title} with ${articles.length} articles and ${allCategories.length} sidebar categories`
    );

    const CategoryListPage =
      require("./src/pages/CategoryListPage.jsx").default;
    const { html } = await renderPageToStatic(CategoryListPage, {
      categoryData,
      articles,
      totalCount: total,
      allCategories,
      currentCategoryId: categoryId,
      title: `${categoryData.fields?.title || "Category"} - Articles`,
    });

    res.send(html);
  } catch (error) {
    console.error("Error previewing category:", error);
    res.status(500).send("<h1>Error loading category page</h1>");
  }
});

// Render category page and submit to Magento
app.post("/render-and-submit-category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Fetch category data from Contentful
    const categoryData = await getContentfulCategory(categoryId);

    if (!categoryData) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Fetch articles for this category
    const { items: articles, total } = await getCategoryArticles(categoryId);

    // Fetch all categories for the sidebar
    const allCategories = await getAllCategories();

    console.log(
      `Rendering category: ${categoryData.fields?.title} with ${articles.length} articles and ${allCategories.length} sidebar categories`
    );

    const CategoryListPage =
      require("./src/pages/CategoryListPage.jsx").default;
    const { html } = await renderPageToStatic(
      CategoryListPage,
      {
        categoryData,
        articles,
        totalCount: total,
        allCategories,
        currentCategoryId: categoryId,
        title: `${categoryData.fields?.title || "Category"} - Articles`,
      },
      { inlineCSS: true, inlineJS: true }
    );

    // Save to output directory
    await fs.mkdir("./output", { recursive: true });
    await fs.writeFile(`./output/category-${categoryId}.html`, html);

    // Submit to Magento
    const { submitCategoryToMagento } = require("./src/utils/magentoAPI");
    const magentoResult = await submitCategoryToMagento(categoryData, html);

    if (magentoResult.success) {
      res.json({
        success: true,
        message: `Category page rendered and ${magentoResult.action} in Magento`,
        categoryId: categoryId,
        title: categoryData.fields?.title,
        articleCount: articles.length,
        totalArticles: total,
        magento: {
          action: magentoResult.action,
          identifier: magentoResult.identifier,
          magentoId: magentoResult.magentoId,
          status: magentoResult.status,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Category page rendered but failed to submit to Magento",
        categoryId: categoryId,
        title: categoryData.fields?.title,
        articleCount: articles.length,
        totalArticles: total,
        error: magentoResult.error,
      });
    }
  } catch (error) {
    console.error("Error rendering and submitting category:", error);
    res.status(500).json({ error: error.message });
  }
});

// FAQ preview endpoint
app.get("/preview/faq/:entryId", async (req, res) => {
  try {
    const entryId = req.params.entryId;
    console.log(`Previewing FAQ entry: ${entryId}`);

    const contentfulEntry = await contentfulClient.getEntry(entryId);

    if (contentfulEntry.sys.contentType.sys.id !== "faq") {
      return res.status(400).json({
        error: "Entry is not an FAQ",
        contentType: contentfulEntry.sys.contentType.sys.id,
      });
    }

    const FAQPage = require("./src/pages/FAQPage.jsx").default;
    const { html } = await renderPageToStatic(
      FAQPage,
      {
        data: contentfulEntry.fields,
        title: contentfulEntry.fields.title,
      },
      { inlineCSS: true }
    );

    res.send(html);
  } catch (error) {
    console.error("Error previewing FAQ:", error);
    res.status(500).json({ error: error.message });
  }
});

// FAQ render and submit endpoint
app.post("/render-and-submit-faq/:entryId", async (req, res) => {
  try {
    const entryId = req.params.entryId;
    console.log(`Rendering and submitting FAQ: ${entryId}`);

    const contentfulEntry = await contentfulClient.getEntry(entryId);

    if (contentfulEntry.sys.contentType.sys.id !== "faq") {
      return res.status(400).json({
        error: "Entry is not an FAQ",
        entryId: entryId,
        contentType: contentfulEntry.sys.contentType.sys.id,
      });
    }

    const FAQPage = require("./src/pages/FAQPage.jsx").default;
    const { html } = await renderPageToStatic(
      FAQPage,
      {
        data: contentfulEntry.fields,
        title: contentfulEntry.fields.title,
      },
      { inlineCSS: true }
    );

    // Save to output directory
    await fs.mkdir("./output", { recursive: true });
    await fs.writeFile(`./output/faq-${entryId}.html`, html);

    // Submit to Magento
    const { submitFAQToMagento } = require("./src/utils/magentoAPI");
    const magentoResult = await submitFAQToMagento(contentfulEntry, html);

    if (magentoResult.success) {
      res.json({
        success: true,
        message: `FAQ rendered and ${magentoResult.action} in Magento`,
        entryId: entryId,
        title: contentfulEntry.fields.title,
        magento: {
          action: magentoResult.action,
          identifier: magentoResult.identifier,
          status: magentoResult.status || 200,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: "FAQ rendered but failed to submit to Magento",
        entryId: entryId,
        title: contentfulEntry.fields.title,
        error: magentoResult.error,
      });
    }
  } catch (error) {
    console.error("Error rendering and submitting FAQ:", error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for Contentful
app.post("/webhook/contentful", async (req, res) => {
  try {
    const contentfulTopic = req.headers["x-contentful-topic"];

    // Ensure it's an entry publish event
    if (contentfulTopic === "ContentManagement.Entry.publish") {
      const entryId = req.body?.sys?.id;

      if (!entryId) {
        return res
          .status(400)
          .json({ error: "Missing entryId in webhook payload." });
      }

      // Trigger the Magento push logic
      // We'll simulate a request to our own /render/article/:entryId/magento endpoint
      // This is a simplified internal call, in a real app you might refactor the logic
      // to be directly callable without simulating an HTTP request.
      const internalReq = {
        params: { entryId: entryId },
        body: {}, // Webhook doesn't send body for this internal call
      };
      const internalRes = {
        json: (data) => {
          console.log("Magento push result:", data);
          res.status(200).json({
            success: true,
            message: "Webhook processed",
            magentoResult: data,
          });
        },
        status: (code) => {
          return {
            json: (data) => {
              console.error("Magento push error:", data);
              res.status(code).json({
                success: false,
                message: "Webhook processing failed",
                error: data,
              });
            },
          };
        },
      };

      // Call the Magento push handler
      await app.post(
        "/render/article/:entryId/magento",
        internalReq,
        internalRes
      );
    } else {
      res
        .status(200)
        .json({ message: `Ignoring webhook topic: ${contentfulTopic}` });
    }
  } catch (error) {
    console.error("Error processing Contentful webhook:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/entries", async (req, res) => {
  try {
    const entries = await contentfulClient.getEntries({
      limit: 10,
    });

    const entriesData = entries.items.map((entry) => ({
      id: entry.sys.id,
      title: entry.fields.title || "Untitled",
      contentType: entry.sys.contentType.sys.id,
      updatedAt: entry.sys.updatedAt,
    }));

    res.json(entriesData);
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: error.message });
  }
});

// Root route with instructions
app.get("/", (req, res) => {
  const instructions = `
    <html>
      <head>
        <title>Contentful Express Renderer</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body style="padding: 2rem; max-width: 800px; margin: 0 auto;">
        <h1>Contentful Express Renderer</h1>
        <p>This server renders Contentful entries as static HTML pages.</p>
        
        <h2>Available Routes:</h2>
        <ul>
          <li><a href="/api/entries">/api/entries</a> - List all Contentful entries</li>
          <li>/preview/article/[entryId] - Preview an article</li>
          <li>/render/article/[entryId] - Render and save article to output folder</li>
          <li><strong>/render-and-submit/[entryId] (POST)</strong> - Render article and submit to Magento</li>
          <li>/preview/category/[categoryId] - Preview a category list page</li>
          <li><strong>/render-and-submit-category/[categoryId] (POST)</strong> - Render category page and submit to Magento</li>
        </ul>
        
        <h2>Example Usage:</h2>
        <p>To preview an article, use: <code>/preview/article/YOUR_ENTRY_ID</code></p>
        <p>To render and save an article, use: <code>/render/article/YOUR_ENTRY_ID</code></p>
        <p>To preview a category page, use: <code>/preview/category/YOUR_CATEGORY_ID</code></p>
        <p>To render and submit to Magento, use: <code>POST /render-and-submit-category/YOUR_CATEGORY_ID</code></p>
        <p>To render and submit to Magento, use: <code>POST /render-and-submit/YOUR_ENTRY_ID</code></p>
        
        <h2>Configuration:</h2>
        <ul>
          <li>Contentful Space ID: ${
            process.env.CONTENTFUL_SPACE_ID || "Not configured"
          }</li>
          <li>Environment: ${
            process.env.CONTENTFUL_ENVIRONMENT || "master"
          }</li>
        </ul>
      </body>
    </html>
  `;

  res.send(instructions);
});

// Test route
app.get("/test", async (req, res) => {
  try {
    const TestComponent = () =>
      React.createElement(
        "div",
        {
          className:
            "bg-green-50 text-gray-900 px-8 py-8 rounded-lg max-w-4xl mx-auto mt-8",
        },
        [
          React.createElement(
            "h1",
            { key: "title", className: "text-3xl font-medium mb-4" },
            "Test Page"
          ),
          React.createElement(
            "p",
            { key: "content", className: "text-gray-700" },
            "Express server with Contentful integration is working!"
          ),
        ]
      );

    const { html } = await renderPageToStatic(TestComponent, {
      title: "Test Page",
    });
    res.send(html);
  } catch (error) {
    console.error("Error in test route:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test OAuth generation
app.get("/test-oauth", async (req, res) => {
  try {
    const { generateOAuthHeader } = require("./src/utils/magentoAuth");
    const testUrl =
      "https://mcstaging.burpee.com/rest/default/V1/store/storeConfigs";
    const authHeader = generateOAuthHeader("GET", testUrl);

    res.json({
      url: testUrl,
      authHeader: authHeader,
      env: {
        consumerKey: process.env.STAGING_MAGENTO_CONSUMER_KEY
          ? "Set"
          : "Not set",
        consumerSecret: process.env.STAGING_MAGENTO_CONSUMER_SECRET
          ? "Set"
          : "Not set",
        accessToken: process.env.STAGING_MAGENTO_ACCESS_TOKEN
          ? "Set"
          : "Not set",
        tokenSecret: process.env.STAGING_MAGENTO_TOKEN_SECRET
          ? "Set"
          : "Not set",
      },
    });
  } catch (error) {
    console.error("Error testing OAuth:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test Contentful management for categories
app.get("/test-contentful-category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const ContentfulManagement = require("./src/utils/contentfulManagement");

    if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
      return res.status(400).json({
        error: "CONTENTFUL_MANAGEMENT_TOKEN not configured",
      });
    }

    const contentfulMgmt = new ContentfulManagement();

    // Test getting category
    console.log(`Testing Contentful category management for: ${categoryId}`);
    const category = await contentfulMgmt.getCategory(categoryId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check existing Magento ID
    const existingMagentoId = await contentfulMgmt.getCategoryMagentoId(
      categoryId
    );

    res.json({
      success: true,
      categoryId: categoryId,
      category: {
        title: category.fields?.title?.["en-US"] || "Untitled",
        contentType: category.sys.contentType.sys.id,
        existingMagentoId: existingMagentoId,
      },
      message: "Category management test successful",
    });
  } catch (error) {
    console.error("Error testing Contentful category management:", error);
    res.status(500).json({ error: error.message });
  }
});

// Debug: Show what content would be sent to Magento
app.get("/debug-category-content/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Fetch category data from Contentful
    const categoryData = await getContentfulCategory(categoryId);

    if (!categoryData) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Fetch articles for this category
    const { items: articles, total } = await getCategoryArticles(categoryId);

    const CategoryListPage =
      require("./src/pages/CategoryListPage.jsx").default;
    const { html } = await renderPageToStatic(CategoryListPage, {
      categoryData,
      articles,
      totalCount: total,
      title: `${categoryData.fields?.title || "Category"} - Articles`,
    });

    // Extract content as would be sent to Magento
    const { extractBodyContentForMagento } = require("./src/utils/magentoAPI");
    const magentoContent = extractBodyContentForMagento(html);

    res.json({
      success: true,
      categoryId: categoryId,
      title: categoryData.fields?.title,
      fullHtmlLength: html.length,
      magentoContentLength: magentoContent.length,
      magentoContent: magentoContent.substring(0, 1000) + "...", // First 1000 chars
    });
  } catch (error) {
    console.error("Error debugging category content:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test updating a category with a Magento ID
app.post(
  "/test-contentful-category/:categoryId/magento-id",
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { magentoId } = req.body;

      if (!magentoId) {
        return res
          .status(400)
          .json({ error: "magentoId is required in request body" });
      }

      const ContentfulManagement = require("./src/utils/contentfulManagement");

      if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
        return res.status(400).json({
          error: "CONTENTFUL_MANAGEMENT_TOKEN not configured",
        });
      }

      const contentfulMgmt = new ContentfulManagement();

      // Update category with Magento ID
      console.log(
        `Testing update of category ${categoryId} with Magento ID: ${magentoId}`
      );
      const result = await contentfulMgmt.updateCategoryWithMagentoId(
        categoryId,
        magentoId
      );

      res.json(result);
    } catch (error) {
      console.error("Error testing Contentful category update:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Test page search functionality
app.get("/test-search/:identifier", async (req, res) => {
  try {
    const { getCmsPageByIdentifier } = require("./src/utils/magentoAPI");
    const identifier = req.params.identifier;

    console.log(`Searching for page: ${identifier}`);
    const page = await getCmsPageByIdentifier(identifier);

    res.json({
      identifier: identifier,
      found: page !== null,
      page: page,
    });
  } catch (error) {
    console.error("Error testing search:", error);
    res.status(500).json({ error: error.message });
  }
});

// List all CMS pages
app.get("/test-list-pages", async (req, res) => {
  try {
    const { generateOAuthHeader } = require("./src/utils/magentoAuth");
    const baseUrl = process.env.STAGING_MAGENTO_BASE_URL;
    const endpoint = `${baseUrl}/rest/default/V1/cmsPage/search`;
    const queryString = "searchCriteria[pageSize]=20";
    const searchEndpoint = `${endpoint}?${queryString}`;

    const authHeader = generateOAuthHeader("GET", searchEndpoint);

    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));
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

    res.json({
      status: response.status,
      data: responseData,
    });
  } catch (error) {
    console.error("Error listing pages:", error);
    res.status(500).json({ error: error.message });
  }
});

// Database endpoints for managing searchable status
const MagentoDatabase = require("./src/utils/database");

// Set specific pages as searchable/not searchable
app.post("/db/cms-pages/searchable", async (req, res) => {
  try {
    const { identifiers, searchable = 1 } = req.body;

    if (!identifiers) {
      return res.status(400).json({
        success: false,
        message:
          "Missing identifiers parameter. Provide a string or array of page identifiers.",
      });
    }

    const db = new MagentoDatabase();
    const result = await db.setCmsPageSearchable(identifiers, searchable);
    await db.disconnect();

    res.json(result);
  } catch (error) {
    console.error("Error setting searchable status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get searchable status of all CMS pages
app.get("/db/cms-pages/searchable", async (req, res) => {
  try {
    const { identifiers } = req.query; // Allow comma-separated list in query

    let targetIdentifiers = null;
    if (identifiers) {
      targetIdentifiers = identifiers.split(",").map((id) => id.trim());
    }

    const db = new MagentoDatabase();
    const pages = await db.getCmsPageSearchableStatus(targetIdentifiers);
    await db.disconnect();

    res.json({
      success: true,
      pages: pages,
    });
  } catch (error) {
    console.error("Error getting searchable status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get searchable status of specific CMS page
app.get("/db/cms-pages/searchable/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    const db = new MagentoDatabase();
    const pages = await db.getCmsPageSearchableStatus(identifier);
    await db.disconnect();

    res.json({
      success: true,
      pages: pages,
    });
  } catch (error) {
    console.error("Error getting searchable status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Make all Contentful pages searchable
app.post("/db/cms-pages/make-contentful-searchable", async (req, res) => {
  try {
    const db = new MagentoDatabase();
    const result = await db.makeContentfulPagesSearchable();
    await db.disconnect();

    res.json(result);
  } catch (error) {
    console.error("Error making Contentful pages searchable:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Homepage preview route
app.get("/preview/garden-guide-test", async (req, res) => {
  try {
    const HomePage = require("./src/pages/HomePage.jsx");
    
    // Fetch top-level categories with articles
    const categoriesWithArticles = await getTopLevelCategoriesWithArticles();
    
    console.log(`Rendering homepage with ${categoriesWithArticles.length} categories`);
    
    const { html } = await renderPageToStatic(HomePage, {
      categoriesWithArticles,
      title: "Burpee Garden Guide - Homepage",
    });

    res.send(html);
  } catch (error) {
    console.error("Error rendering homepage preview:", error);
    res.status(500).send("<h1>Error loading homepage</h1>");
  }
});

// Header preview route
app.get("/preview/header", async (req, res) => {
  try {
    const HeaderTestPage = require("./src/pages/HeaderTestPage.jsx");
    const { html } = await renderPageToStatic(HeaderTestPage, {});
    
    res.send(html);
  } catch (error) {
    console.error("Error rendering header preview:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `\\n🚀 Contentful Express Renderer running on http://localhost:${PORT}`
  );
  console.log(`📝 Test the setup at http://localhost:${PORT}/test`);
  console.log(`📚 View instructions at http://localhost:${PORT}/`);
  console.log(`🔍 List entries at http://localhost:${PORT}/api/entries`);
  console.log(`🎨 Header preview at http://localhost:${PORT}/preview/header`);
  console.log(`🏠 Homepage preview at http://localhost:${PORT}/preview/garden-guide-test`);
  console.log(
    `\\n💡 To preview an article: http://localhost:${PORT}/preview/article/[entryId]`
  );
  console.log(
    `💾 To render an article: http://localhost:${PORT}/render/article/[entryId]\\n`
  );
});
