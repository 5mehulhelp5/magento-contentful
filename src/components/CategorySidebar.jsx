const React = require("react");

/**
 * CategorySidebar - Collapsible category navigation sidebar
 * @param {Array} categories - Array of all categories with parent-child relationships
 * @param {string} currentCategoryId - ID of currently active category for highlighting
 * @returns {Object} React element for the category sidebar
 */
const CategorySidebar = ({ categories = [], currentCategoryId = null }) => {
  // Build hierarchical structure from flat category array
  const buildCategoryHierarchy = (categories) => {
    const topLevelCategories = [];
    const categoryMap = new Map();

    // First pass: create category map and identify top-level categories
    categories.forEach((category) => {
      const categoryData = {
        id: category.sys.id,
        title: category.fields.title,
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

  // Helper function to determine which top-level category should be expanded
  const shouldExpandTopLevel = (topLevelCategory) => {
    if (!currentCategoryId) return false;
    
    // If the current category is this top-level category
    if (topLevelCategory.id === currentCategoryId) return true;
    
    // If the current category is a child of this top-level category
    return topLevelCategory.children.some(child => child.id === currentCategoryId);
  };

  // Helper function to create category link URL
  const createCategoryUrl = (categoryId) => {
    return `/preview/category/${categoryId}`;
  };

  // Helper function to slugify category titles for CSS classes
  const slugifyTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  return React.createElement(
    "aside",
    {
      className: "category-sidebar",
      id: "category-sidebar",
    },
    [
      // Mobile dropdown toggle
      React.createElement(
        "div",
        {
          key: "mobile-dropdown-toggle",
          className: "mobile-dropdown-toggle",
        },
        React.createElement(
          "button",
          {
            className: "mobile-dropdown-button",
            "aria-expanded": "false",
            "aria-controls": "category-navigation",
            "data-toggle": "mobile-dropdown",
          },
          [
            "Sort By",
            React.createElement(
              "svg",
              {
                key: "dropdown-chevron",
                className: "mobile-dropdown-chevron",
                "aria-hidden": "true",
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              },
              React.createElement(
                "polyline",
                {
                  points: "6,9 12,15 18,9"
                }
              )
            )
          ]
        )
      ),

      // Category navigation
      React.createElement(
        "nav",
        {
          key: "category-nav",
          className: "category-nav",
          id: "category-navigation",
        },
        React.createElement(
          "ul",
          {
            className: "category-list",
          },
          hierarchy.map((topLevelCategory, index) =>
            React.createElement(
              "li",
              {
                key: topLevelCategory.id,
                className: `category-item top-level ${
                  topLevelCategory.id === currentCategoryId ? "active" : ""
                }`,
              },
              [
                // Top-level category header with toggle
                React.createElement(
                  "div",
                  {
                    key: "category-header",
                    className: "category-header",
                    "data-category-id": topLevelCategory.id,
                  },
                  [
                    // Category title/link
                    React.createElement(
                      "a",
                      {
                        key: "category-link",
                        href: createCategoryUrl(topLevelCategory.id),
                        className: "category-link",
                      },
                      topLevelCategory.title
                    ),
                    // Toggle button for collapsible behavior
                    topLevelCategory.children.length > 0 &&
                      React.createElement(
                        "button",
                        {
                          key: "toggle-button",
                          className: "category-toggle",
                          "aria-expanded": shouldExpandTopLevel(topLevelCategory) ? "true" : "false",
                          "aria-controls": `subcategories-${slugifyTitle(
                            topLevelCategory.title
                          )}`,
                          "data-toggle": "collapse",
                        },
                        React.createElement(
                          "svg",
                          {
                            className: "toggle-icon",
                            "aria-hidden": "true",
                            width: "16",
                            height: "16",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: "2",
                            strokeLinecap: "round",
                            strokeLinejoin: "round"
                          },
                          React.createElement(
                            "polyline",
                            {
                              points: "6,9 12,15 18,9"
                            }
                          )
                        )
                      ),
                  ]
                ),

                // Subcategories (collapsible)
                topLevelCategory.children.length > 0 &&
                  React.createElement(
                    "ul",
                    {
                      key: "subcategories",
                      id: `subcategories-${slugifyTitle(
                        topLevelCategory.title
                      )}`,
                      className: `subcategory-list ${
                        shouldExpandTopLevel(topLevelCategory) ? "expanded" : "collapsed"
                      }`,
                      "aria-expanded": shouldExpandTopLevel(topLevelCategory) ? "true" : "false",
                    },
                    topLevelCategory.children.map((subcategory) =>
                      React.createElement(
                        "li",
                        {
                          key: subcategory.id,
                          className: `subcategory-item ${
                            subcategory.id === currentCategoryId ? "active" : ""
                          }`,
                        },
                        React.createElement(
                          "a",
                          {
                            href: createCategoryUrl(subcategory.id),
                            className: "subcategory-link",
                          },
                          // Remove parent prefix from subcategory titles for cleaner display
                          subcategory.title.includes(" / ")
                            ? subcategory.title.split(" / ").pop()
                            : subcategory.title
                        )
                      )
                    )
                  ),
              ]
            )
          )
        )
      ),
    ]
  );
};

module.exports = CategorySidebar;
