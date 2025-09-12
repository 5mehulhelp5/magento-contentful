import React from "react";
import ArticleCard from "../components/ArticleCard.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";
import Header from "../components/Header.jsx";

const CategoryListPage = ({
  categoryData,
  articles = [],
  totalCount = 0,
  allCategories = [],
  currentCategoryId = null,
}) => {
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

  // Create header breadcrumbs (different format for Header component)
  const headerBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Garden Guide", href: "/garden-guide" },
    ...breadcrumbs.slice(0, -1).map(crumb => ({
      name: crumb.name,
      href: `/garden-guide/${slugifyCategory(crumb.name)}`
    })),
    { name: breadcrumbs[breadcrumbs.length - 1]?.name } // Current page (no href)
  ];

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

  // Create linkBase for production URLs - fallback for articles without frontendUrl
  const linkBase = ""; //`garden-guide/${slugifyCategory(breadcrumbs[breadcrumbs.length - 1].name)}`;

  return (
    <div className="page-layout">
      {/* Header component */}
      <Header
        key="main-header"
        breadcrumbs={headerBreadcrumbs}
        currentPath={`/garden-guide/${slugifyCategory(breadcrumbs[breadcrumbs.length - 1]?.name || "")}`}
      />
      {/* Header section */}
      <div key="header" className="page-header">
        <div className="container page-header-content">
          {/* Breadcrumb navigation */}
          {breadcrumbs.length > 1 && (
            <nav key="breadcrumbs" className="breadcrumbs">
              <ol className="breadcrumb-list">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="breadcrumb-item">
                    {index > 0 && (
                      <span key="separator" className="breadcrumb-separator">
                        /
                      </span>
                    )}
                    <span
                      key="name"
                      className={
                        crumb.isLast
                          ? "breadcrumb-current"
                          : "breadcrumb-link"
                      }
                    >
                      {crumb.name}
                    </span>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Category title */}
          <div key="title-section" className="page-title-section">
            <h1 key="title" className="page-title">
              Garden Guide: {breadcrumbs[breadcrumbs.length - 1].name || "Category"}
            </h1>
          </div>
        </div>
      </div>

      {/* Main content area with sidebar and articles */}
      <div key="main-content" className="container">
        <div className="content-with-sidebar">
          {/* Category Sidebar */}
          <CategorySidebar
            key="category-sidebar"
            categories={allCategories}
            currentCategoryId={currentCategoryId}
          />

          {/* Articles section */}
          <div key="articles-content" className="articles-main">
            {/* Results count */}
            {totalCount > 0 && (
              <div key="results-count" className="results-count">
                <p className="results-text">
                  Showing{" "}
                  <span
                    key="current-count"
                    className="results-number"
                    id="current-article-count"
                  >
                    {initialArticles.length.toString()}
                  </span>
                  {" "}of{" "}
                  <span key="total-count" className="results-number">
                    {totalCount.toString()}
                  </span>
                  {totalCount === 1 ? " article" : " articles"}
                </p>
              </div>
            )}

            {/* Articles Grid */}
            {initialArticles.length > 0 ? (
              <div
                key="article-grid"
                className="articles-grid"
                id="articles-grid"
              >
                {initialArticles.map((article, index) => {
                  const articleHTML = ArticleCard({
                    article,
                    linkBase,
                  });
                  return (
                    <div
                      key={article.sys?.id || index}
                      dangerouslySetInnerHTML={{ __html: articleHTML }}
                    />
                  );
                })}
                {/* Loading indicator for infinite scroll */}
                {hasMoreArticles && (
                  <div
                    key="loading-indicator"
                    id="loading-indicator"
                    className="loading-indicator"
                    style={{ display: "none" }}
                  >
                    <div key="loading-spinner" className="loading-spinner">
                      Loading more articles...
                    </div>
                    <button
                      key="load-more-button"
                      className="load-more-button"
                      id="load-more-button"
                      aria-label="Load more articles"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Empty state */
              <div key="empty-state" className="empty-state">
                <div key="empty-content" className="empty-content">
                  <h3 key="empty-title" className="empty-title">
                    No articles found
                  </h3>
                  <p key="empty-description" className="empty-description">
                    There are no articles in this category yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embed article data for infinite scroll */}
      <script
        key="article-data"
        type="application/json"
        id="article-data"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            articles: articles,
            linkBase: linkBase,
            initialCount: initialArticleCount,
            totalCount: totalCount,
          }),
        }}
      />

      {/* Load unified article card template */}
      <script
        key="article-template-script"
        src={`/articleCardTemplate.js?v=${Date.now()}`}
      />

      {/* Load infinite scroll JavaScript */}
      <script
        key="infinite-scroll-script"
        src={`/infiniteScroll.js?v=${Date.now()}`}
        defer
      />

      {/* Load category sidebar JavaScript */}
      <script
        key="category-sidebar-script"
        src={`/categorySidebar.js?v=${Date.now()}`}
        defer
      />
    </div>
  );
};

export default CategoryListPage;
