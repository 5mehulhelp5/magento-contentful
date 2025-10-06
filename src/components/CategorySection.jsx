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
  const displayTitle = category?.fields?.displayTitle;
  const categoryTitle = category?.fields?.title || "Category";
  const categoryDescription = category?.fields?.description || "";

  // Create a "View All" link for the category
  const viewAllLink = `/garden-guide/${categoryTitle
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return (
    <div className={`article-row-three ${isEven ? "even" : "odd"}`}>
      <div className="row-full-width-inner">
        {/* Category header section */}
        <div key="category-header" className="gg-row-columns-header">
          <div className="header-content">
            <h3 key="category-title">{displayTitle || categoryTitle}</h3>
            {categoryDescription && (
              <p key="category-description">{categoryDescription}</p>
            )}
          </div>
          <div className="header-button">
            <div data-content-type="buttons">
              <div data-content-type="button-item">
                <a className="view-all-button" href={viewAllLink}>
                  <span key="button-text">
                    View All {displayTitle || categoryTitle} Articles
                  </span>
                  <svg
                    key="chevron-right"
                    className="chevron-right"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    width="16"
                    height="16"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9 18 6-6-6-6"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Articles grid section */}
        <div key="articles-grid" className="gg-row-columns-articles">
          <div className="category-articles-grid">
            {articles.slice(0, 3).map((article, index) => {
              // Generate the article card HTML
              const articleHTML = ArticleCard({
                article,
                linkBase: "",
              });

              return (
                <div key={article.sys?.id || index} className="article-column">
                  <div dangerouslySetInnerHTML={{ __html: articleHTML }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile-only button (appears below articles on mobile) */}
        <div key="mobile-button" className="mobile-button-container">
          <a className="view-all-button mobile-view-all" href={viewAllLink}>
            <span key="mobile-button-text">
              View All {categoryTitle} Articles
            </span>
            <svg
              key="mobile-chevron-right"
              className="chevron-right"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 18 6-6-6-6"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

module.exports = CategorySection;
