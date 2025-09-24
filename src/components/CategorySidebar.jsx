const React = require("react");

/**
 * CategorySidebar - Collapsible category navigation sidebar
 * @param {Array} categories - Array of all categories with parent-child relationships
 * @param {string} currentCategoryId - ID of currently active category for highlighting
 * @param {string} currentPath - Current page path for URL-based highlighting fallback
 * @returns {Object} React element for the category sidebar
 */
const CategorySidebar = ({ categories = [], currentCategoryId = null, currentPath = null }) => {
  // Build hierarchical structure from flat category array
  const buildCategoryHierarchy = (categories) => {
    const topLevelCategories = [];
    const categoryMap = new Map();

    // First pass: create category map and identify top-level categories
    categories.forEach((category) => {
      const categoryData = {
        id: category.sys.id,
        title: category.fields.title,
        displayTitle: category.fields.displayTitle,
        parent: category.fields.parent?.sys?.id || null,
        children: [],
      };

      categoryMap.set(category.sys.id, categoryData);

      if (!category.fields.parent) {
        topLevelCategories.push(categoryData);
      }
    });

    // Second pass: build parent-child relationships
    categories.forEach((category) => {
      const parentId = category.fields.parent?.sys?.id;
      if (parentId && categoryMap.has(parentId)) {
        const parent = categoryMap.get(parentId);
        const child = categoryMap.get(category.sys.id);
        parent.children.push(child);
      }
    });

    // Sort categories alphabetically
    topLevelCategories.sort((a, b) => a.title.localeCompare(b.title));
    topLevelCategories.forEach((parent) => {
      parent.children.sort((a, b) => a.title.localeCompare(b.title));
    });

    return topLevelCategories;
  };

  const hierarchy = buildCategoryHierarchy(categories);

  // Helper function to normalize URLs for comparison (remove leading/trailing slashes, normalize casing)
  const normalizeUrl = (url) => {
    if (!url) return '';
    return url.replace(/^\/+|\/+$/g, '').toLowerCase();
  };

  // Helper function to check if a category matches the current path via frontendUrl
  const categoryMatchesCurrentPath = (categoryId) => {
    if (!currentPath || !categoryId) return false;

    const category = categories.find((cat) => cat.sys.id === categoryId);
    if (!category || !category.fields.frontendUrl) return false;

    const categoryUrl = normalizeUrl(category.fields.frontendUrl);
    const normalizedCurrentPath = normalizeUrl(currentPath);

    return categoryUrl === normalizedCurrentPath;
  };

  // Enhanced function to check if a category is currently active (ID match OR URL match)
  const isCategoryActive = (categoryId) => {
    if (!categoryId) return false;
    // First try ID match
    if (categoryId === currentCategoryId) return true;
    // Fallback to URL match
    return categoryMatchesCurrentPath(categoryId);
  };

  // Helper function to determine which top-level category should be expanded
  const shouldExpandTopLevel = (topLevelCategory) => {
    if (!currentCategoryId && !currentPath) return false;

    // If the current category is this top-level category (ID or URL match)
    if (isCategoryActive(topLevelCategory.id)) return true;

    // If the current category is a child of this top-level category (ID or URL match)
    return topLevelCategory.children.some(
      (child) => isCategoryActive(child.id)
    );
  };

  // Helper function to create category link URL using production format
  const createCategoryUrl = (categoryId) => {
    // Find the category data by ID
    const category = categories.find((cat) => cat.sys.id === categoryId);
    if (!category || !category.fields.title) {
      return `/preview/category/${categoryId}`; // Fallback to preview URL
    }

    // Use the same logic as magentoAPI.js for production URLs
    function formatCategoryPath(input) {
      return input
        .toLowerCase()
        .split("/")
        .map((part) => part.trim().replace(/\s+/g, "-"))
        .join("/");
    }

    const formattedPath = formatCategoryPath(category.fields.title);
    return `/garden-guide/${formattedPath}`;
  };

  // Helper function to slugify category titles for CSS classes
  const slugifyTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  return (
    <aside className="category-sidebar" id="category-sidebar">
      {/* Mobile dropdown toggle */}
      <div key="mobile-dropdown-toggle" className="mobile-dropdown-toggle">
        <button
          className="mobile-dropdown-button"
          aria-expanded="false"
          aria-controls="category-navigation"
          data-toggle="mobile-dropdown"
        >
          Sort By
          <svg
            key="dropdown-chevron"
            className="mobile-dropdown-chevron"
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>
      </div>

      {/* Category navigation */}
      <nav key="category-nav" className="category-nav" id="category-navigation">
        <ul className="category-list">
          {hierarchy.map((topLevelCategory, index) => (
            <li
              key={topLevelCategory.id}
              className={`category-item top-level ${
                isCategoryActive(topLevelCategory.id) ? "active" : ""
              }`}
            >
              {/* Top-level category header with toggle */}
              <div
                key="category-header"
                className="category-header"
                data-category-id={topLevelCategory.id}
              >
                {/* Category title/link */}
                <a
                  key="category-link"
                  href={createCategoryUrl(topLevelCategory.id)}
                  className="category-link"
                >
                  {topLevelCategory.displayTitle || topLevelCategory.title}
                </a>
                {/* Toggle button for collapsible behavior */}
                {topLevelCategory.children.length > 0 && (
                  <button
                    key="toggle-button"
                    className="category-toggle"
                    aria-expanded={
                      shouldExpandTopLevel(topLevelCategory) ? "true" : "false"
                    }
                    aria-controls={`subcategories-${slugifyTitle(
                      topLevelCategory.title
                    )}`}
                    data-toggle="collapse"
                  >
                    <svg
                      className="toggle-icon"
                      aria-hidden="true"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Subcategories (collapsible) */}
              {topLevelCategory.children.length > 0 && (
                <ul
                  key="subcategories"
                  id={`subcategories-${slugifyTitle(topLevelCategory.title)}`}
                  className={`subcategory-list ${
                    shouldExpandTopLevel(topLevelCategory)
                      ? "expanded"
                      : "collapsed"
                  }`}
                  aria-expanded={
                    shouldExpandTopLevel(topLevelCategory) ? "true" : "false"
                  }
                >
                  {topLevelCategory.children.map((subcategory) => (
                    <li
                      key={subcategory.id}
                      className={`subcategory-item ${
                        isCategoryActive(subcategory.id) ? "active" : ""
                      }`}
                    >
                      <a
                        href={createCategoryUrl(subcategory.id)}
                        className="subcategory-link"
                      >
                        {/* Remove parent prefix from subcategory titles for cleaner display */}
                        {subcategory.title.includes(" / ")
                          ? subcategory.title.split(" / ").pop()
                          : subcategory.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

module.exports = CategorySidebar;
