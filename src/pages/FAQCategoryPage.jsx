import React from "react";
import Header from "../components/Header.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";

const FAQCategoryPage = ({
  categoryData,
  faqs = [],
  totalCount = 0,
  allCategories = [],
  currentCategoryId = null,
}) => {
  const { title, description, slug } = categoryData?.fields || {};

  // Use the direct slug from FAQ category data, with fallback for legacy support
  const categorySlug = slug || slugifyCategory(title || "");

  // Helper function to slugify category names (fallback for legacy support)
  function slugifyCategory(input) {
    if (!input) return "";
    return input.trim().toLowerCase().replace(/\s+/g, "-");
  }

  // Create header breadcrumbs for FAQ categories (simpler structure)
  const headerBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Garden Guide", href: "/garden-guide" },
    { name: `${title}: FAQs` } // Current page (no href)
  ];

  return (
    <div className="page-layout">
      {/* Header component */}
      <Header
        key="main-header"
        breadcrumbs={headerBreadcrumbs}
        currentPath={`/garden-guide/${categorySlug}/faqs`}
      />

      {/* Header section */}
      <div key="header" className="page-header">
        <div className="container page-header-content">
          {/* Page title */}
          <div key="title-section" className="page-title-section">
            <h1 key="title" className="page-title">
              {title || "Category"}: FAQs
            </h1>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div key="main-content" className="container">
        <div className="content-with-sidebar">
          {/* Category Sidebar */}
          <CategorySidebar
            key="category-sidebar"
            categories={allCategories}
            currentCategoryId={currentCategoryId}
          />

          {/* FAQ content section */}
          <div key="faq-content" className="articles-main">
            {/* Results count */}
            {totalCount > 0 && (
              <div key="results-count" className="results-count">
                <p className="results-text">
                  <span className="results-number">{totalCount}</span>
                  {totalCount === 1 ? " FAQ" : " FAQs"}
                </p>
              </div>
            )}

            {/* FAQ List - 3 Column Layout */}
            {faqs.length > 0 ? (
              <div key="faq-list" className="faq-list">
            {faqs.map((faq, faqIndex) => {
              const faqTitle = faq.fields?.title || "Untitled FAQ";
              const faqSlug = faq.fields?.slug || faq.sys?.id;
              // Use the direct category slug from FAQ category data
              const faqUrl = `garden-guide/${categorySlug}/faqs/${faqSlug}`;

              return (
                <div key={faq.sys?.id || faqIndex} className="faq-item">
                  <a href={`/${faqUrl}`} className="faq-link">
                    {faqTitle}
                  </a>
                </div>
              );
            })}
              </div>
            ) : (
              /* Empty state */
              <div key="empty-state" className="empty-state">
                <div key="empty-content" className="empty-content">
                  <h3 key="empty-title" className="empty-title">
                    No FAQs found
                  </h3>
                  <p key="empty-description" className="empty-description">
                    There are no FAQs in this category yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Load category sidebar JavaScript */}
      <script
        key="category-sidebar-script"
        src={`/categorySidebar.js?v=${Date.now()}`}
        defer
      />
    </div>
  );
};

export default FAQCategoryPage;