import React from "react";
import ArticleCard from "../components/ArticleCard.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";

const CategoryListPage = ({ categoryData, articles = [], totalCount = 0, allCategories = [], currentCategoryId = null }) => {
  const { title } = categoryData?.fields || {};

  // Create breadcrumb path from category title
  const createBreadcrumbs = (categoryTitle) => {
    if (!categoryTitle) return [];
    return categoryTitle.split(" / ").map((part, index, array) => ({
      name: part,
      isLast: index === array.length - 1,
    }));
  };

  const breadcrumbs = createBreadcrumbs(title);
  
  // Infinite scroll configuration
  const initialArticleCount = 12;
  const initialArticles = articles.slice(0, initialArticleCount);
  const hasMoreArticles = articles.length > initialArticleCount;

  function slugifyCategory(input) {
    return input.trim().toLowerCase().replace(/\s+/g, "-");
  }

  function formatCategoryArray(categories) {
    return categories
      .map((cat) => cat.name.trim().toLowerCase().replace(/\s+/g, "-"))
      .join("/");
  }

  const linkBase = slugifyCategory(breadcrumbs[breadcrumbs.length - 1].name); //formatCategoryArray(breadcrumbs);

  return React.createElement(
    "div",
    {
      className: "page-layout page-with-sidebar",
    },
    [
      // Category Sidebar
      React.createElement(CategorySidebar, {
        key: "category-sidebar",
        categories: allCategories,
        currentCategoryId: currentCategoryId
      }),

      // Main content area
      React.createElement(
        "div",
        {
          key: "main-content",
          className: "main-content",
        },
        [
          // Header section
          React.createElement(
            "div",
            {
              key: "header",
              className: "page-header",
            },
        React.createElement(
          "div",
          {
            className: "container page-header-content",
          },
          [
            // Breadcrumb navigation
            breadcrumbs.length > 1 &&
              React.createElement(
                "nav",
                {
                  key: "breadcrumbs",
                  className: "breadcrumbs",
                },
                React.createElement(
                  "ol",
                  {
                    className: "breadcrumb-list",
                  },
                  breadcrumbs.map((crumb, index) =>
                    React.createElement(
                      "li",
                      {
                        key: index,
                        className: "breadcrumb-item",
                      },
                      [
                        index > 0 &&
                          React.createElement(
                            "span",
                            {
                              key: "separator",
                              className: "breadcrumb-separator",
                            },
                            "/"
                          ),
                        React.createElement(
                          "span",
                          {
                            key: "name",
                            className: crumb.isLast
                              ? "breadcrumb-current"
                              : "breadcrumb-link",
                          },
                          crumb.name
                        ),
                      ]
                    )
                  )
                )
              ),

            // Category title
            React.createElement(
              "div",
              {
                key: "title-section",
                className: "page-title-section",
              },
              React.createElement(
                "h1",
                {
                  key: "title",
                  className: "page-title",
                },
                "Garden Guide: " + breadcrumbs[breadcrumbs.length - 1].name ||
                  "Category"
              )
            ),
          ]
        )
      ),

      // Articles section
      React.createElement(
        "div",
        {
          key: "articles",
          className: "container",
        },
        [
          // Results count
          totalCount > 0 &&
            React.createElement(
              "div",
              {
                key: "results-count",
                className: "results-count",
              },
              React.createElement(
                "p",
                {
                  className: "results-text",
                },
                [
                  "Showing ",
                  React.createElement(
                    "span",
                    {
                      key: "current-count",
                      className: "results-number",
                      id: "current-article-count",
                    },
                    initialArticles.length.toString()
                  ),
                  " of ",
                  React.createElement(
                    "span",
                    {
                      key: "total-count",
                      className: "results-number",
                    },
                    totalCount.toString()
                  ),
                  totalCount === 1 ? " article" : " articles",
                ]
              )
            ),

          // Articles Grid
          initialArticles.length > 0
            ? React.createElement(
                "div",
                {
                  key: "article-grid",
                  className: "articles-grid",
                  id: "articles-grid",
                },
                [
                  ...initialArticles.map((article, index) => {
                    const articleHTML = ArticleCard({ article, linkBase });
                    return React.createElement("div", {
                      key: article.sys?.id || index,
                      dangerouslySetInnerHTML: { __html: articleHTML }
                    });
                  }),
                  // Loading indicator for infinite scroll
                  hasMoreArticles && React.createElement(
                    "div",
                    {
                      key: "loading-indicator",
                      id: "loading-indicator",
                      className: "loading-indicator",
                      style: { display: "none" }
                    },
                    React.createElement(
                      "div",
                      {
                        className: "loading-spinner",
                      },
                      "Loading more articles..."
                    )
                  )
                ]
              )
            : // Empty state
              React.createElement(
                "div",
                {
                  key: "empty-state",
                  className: "empty-state",
                },
                [
                  React.createElement(
                    "div",
                    {
                      key: "empty-content",
                      className: "empty-content",
                    },
                    [
                      React.createElement(
                        "h3",
                        {
                          key: "empty-title",
                          className: "empty-title",
                        },
                        "No articles found"
                      ),
                      React.createElement(
                        "p",
                        {
                          key: "empty-description",
                          className: "empty-description",
                        },
                        "There are no articles in this category yet."
                      ),
                    ]
                  ),
                ]
              )
        ]
      ),
      
      // Embed article data for infinite scroll
      React.createElement(
        "script",
        {
          key: "article-data",
          type: "application/json",
          id: "article-data",
          dangerouslySetInnerHTML: {
            __html: JSON.stringify({
              articles: articles,
              linkBase: linkBase,
              initialCount: initialArticleCount,
              totalCount: totalCount
            })
          }
        }
      ),
      
      // Load unified article card template
      React.createElement(
        "script",
        {
          key: "article-template-script",
          src: `/articleCardTemplate.js?v=${Date.now()}`,
        }
      ),
      
      // Load infinite scroll JavaScript
      React.createElement(
        "script",
        {
          key: "infinite-scroll-script",
          src: `/infiniteScroll.js?v=${Date.now()}`,
          defer: true
        }
      ),
      
      // Load category sidebar JavaScript
      React.createElement(
        "script",
        {
          key: "category-sidebar-script",
          src: `/categorySidebar.js?v=${Date.now()}`,
          defer: true
        }
      )
        ]
      )
    ]
  );
};

export default CategoryListPage;
