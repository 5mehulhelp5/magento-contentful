const React = require("react");
const ArticleCard = require("./ArticleCard.jsx");

/**
 * CategorySection - Individual category section with title, description and 3 article cards
 * Matches the design from the second screenshot with alternating background colors
 * @param {Object} category - Category data from Contentful
 * @param {Array} articles - Array of article objects (max 3)
 * @param {Boolean} isEven - Whether this is an even-numbered section (for background color)
 */
const CategorySection = ({ category, articles = [], isEven = false }) => {
  const categoryTitle = category?.fields?.title || "Category";
  const categoryDescription = category?.fields?.description || "";
  
  // Create a "View All" link for the category
  const viewAllLink = `/garden-guide/${categoryTitle.toLowerCase().replace(/\s+/g, "-")}`;
  
  return React.createElement(
    "div",
    {
      className: `article-row-three ${isEven ? 'even' : 'odd'}`,
    },
    React.createElement(
      "div",
      {
        className: "row-full-width-inner",
      },
      [
        // Category header section
        React.createElement(
          "div",
          {
            key: "category-header",
            className: "gg-row-columns-header",
          },
          React.createElement(
            "div",
            {
              className: "header-content",
            },
            [
              React.createElement(
                "h3",
                {
                  key: "category-title",
                },
                categoryTitle
              ),
              categoryDescription && React.createElement(
                "p",
                {
                  key: "category-description",
                },
                categoryDescription
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              className: "header-button",
            },
            React.createElement(
              "div",
              {
                "data-content-type": "buttons",
              },
              React.createElement(
                "div",
                {
                  "data-content-type": "button-item",
                },
                React.createElement(
                  "a",
                  {
                    className: "view-all-button",
                    href: viewAllLink,
                  },
                  [
                    React.createElement(
                      "span",
                      {
                        key: "button-text",
                      },
                      `View All ${categoryTitle} Articles`
                    ),
                    React.createElement(
                      "svg",
                      {
                        key: "chevron-right",
                        className: "chevron-right",
                        xmlns: "http://www.w3.org/2000/svg",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        strokeWidth: "2",
                        stroke: "currentColor",
                        width: "16",
                        height: "16",
                        "aria-hidden": "true",
                      },
                      React.createElement("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        d: "m9 18 6-6-6-6",
                      })
                    ),
                  ]
                )
              )
            )
          )
        ),

        // Articles grid section
        React.createElement(
          "div",
          {
            key: "articles-grid",
            className: "gg-row-columns-articles",
          },
          React.createElement(
            "div",
            {
              className: "category-articles-grid",
            },
            articles.slice(0, 3).map((article, index) => {
              // Generate the article card HTML
              const articleHTML = ArticleCard({
                article,
                linkBase: "",
              });

              return React.createElement(
                "div",
                {
                  key: article.sys?.id || index,
                  className: "article-column",
                },
                React.createElement("div", {
                  dangerouslySetInnerHTML: { __html: articleHTML },
                })
              );
            })
          )
        ),

        // Mobile-only button (appears below articles on mobile)
        React.createElement(
          "div",
          {
            key: "mobile-button",
            className: "mobile-button-container",
          },
          React.createElement(
            "a",
            {
              className: "view-all-button mobile-view-all",
              href: viewAllLink,
            },
            [
              React.createElement(
                "span",
                {
                  key: "mobile-button-text",
                },
                `View All ${categoryTitle} Articles`
              ),
              React.createElement(
                "svg",
                {
                  key: "mobile-chevron-right",
                  className: "chevron-right",
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  strokeWidth: "2",
                  stroke: "currentColor",
                  width: "16",
                  height: "16",
                  "aria-hidden": "true",
                },
                React.createElement("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  d: "m9 18 6-6-6-6",
                })
              ),
            ]
          )
        ),
      ]
    )
  );
};

module.exports = CategorySection;