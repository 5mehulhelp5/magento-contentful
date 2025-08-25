import React from "react";
import ArticleCard from "../components/ArticleCard.jsx";

const CategoryListPage = ({ categoryData, articles = [], totalCount = 0 }) => {
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
  console.log(breadcrumbs);

  return React.createElement(
    "div",
    {
      className: "page-layout",
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
                    },
                    articles.length.toString()
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
          articles.length > 0
            ? React.createElement(
                "div",
                {
                  key: "article-grid",
                  className: "articles-grid",
                },
                articles.map((article, index) =>
                  React.createElement(ArticleCard, {
                    key: article.sys?.id || index,
                    article: article,
                  })
                )
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
              ),
        ]
      ),
    ]
  );
};

export default CategoryListPage;
