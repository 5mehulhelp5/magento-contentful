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
              className: "pagebuilder-column",
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
              className: "pagebuilder-column",
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
                    className: "pagebuilder-button-primary",
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
              className: "pagebuilder-column-line",
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
                  className: "pagebuilder-column",
                },
                React.createElement("div", {
                  dangerouslySetInnerHTML: { __html: articleHTML },
                })
              );
            })
          )
        ),
      ]
    )
  );
};

module.exports = CategorySection;