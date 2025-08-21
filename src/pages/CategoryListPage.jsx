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

  return React.createElement(
    "div",
    {
      className: "min-h-screen bg-gray-50",
    },
    [
      // Header section
      React.createElement(
        "div",
        {
          key: "header",
          className: "bg-white shadow-sm",
        },
        React.createElement(
          "div",
          {
            className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
          },
          [
            // Breadcrumb navigation
            breadcrumbs.length > 1 &&
              React.createElement(
                "nav",
                {
                  key: "breadcrumbs",
                  className: "mb-4",
                },
                React.createElement(
                  "ol",
                  {
                    className:
                      "flex items-center space-x-2 text-sm text-gray-500",
                  },
                  breadcrumbs.map((crumb, index) =>
                    React.createElement(
                      "li",
                      {
                        key: index,
                        className: "flex items-center",
                      },
                      [
                        index > 0 &&
                          React.createElement(
                            "span",
                            {
                              key: "separator",
                              className: "mx-2 text-gray-300",
                            },
                            "/"
                          ),
                        React.createElement(
                          "span",
                          {
                            key: "name",
                            className: crumb.isLast
                              ? "text-gray-900 font-medium"
                              : "hover:text-gray-700",
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
                className: "mb-6",
              },
              React.createElement(
                "h1",
                {
                  key: "title",
                  className: "text-3xl md:text-4xl font-bold text-gray-900",
                },
                title || "Category"
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
          className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
        },
        [
          // Results count
          totalCount > 0 &&
            React.createElement(
              "div",
              {
                key: "results-count",
                className: "flex items-center justify-between mb-6",
              },
              React.createElement(
                "p",
                {
                  className: "text-sm text-gray-600",
                },
                [
                  "Showing ",
                  React.createElement(
                    "span",
                    {
                      key: "current-count",
                      className: "font-medium",
                    },
                    articles.length.toString()
                  ),
                  " of ",
                  React.createElement(
                    "span",
                    {
                      key: "total-count",
                      className: "font-medium",
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
                  className: "responsive-grid",
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
                  className: "text-center py-12",
                },
                [
                  React.createElement(
                    "div",
                    {
                      key: "empty-content",
                      className: "max-w-md mx-auto",
                    },
                    [
                      React.createElement(
                        "h3",
                        {
                          key: "empty-title",
                          className: "text-lg font-medium text-gray-900 mb-2",
                        },
                        "No articles found"
                      ),
                      React.createElement(
                        "p",
                        {
                          key: "empty-description",
                          className: "text-gray-500",
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
