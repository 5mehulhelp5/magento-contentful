import React from "react";
import RichTextRenderer from "../components/RichTextRenderer.jsx";
import Header from "../components/Header.jsx";

/**
 * FAQ Page Component
 * Renders individual FAQ entries with structured Q&A layout
 * @param {Object} data - FAQ entry data from Contentful
 * @param {string} title - FAQ title (question)
 */
function FAQPage({ data = {}, title }) {
  const {
    body,
    metaTitle,
    metaDescription,
    freshdeskCategoryName,
  } = data;

  // Create breadcrumbs for FAQ page
  const headerBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Help Center", href: "/help" },
    { name: freshdeskCategoryName || "FAQ", href: freshdeskCategoryName ? `/help/${freshdeskCategoryName.toLowerCase().replace(/\s+/g, '-')}` : "/help" },
    { name: title || "FAQ" },
  ];

  return (
    <div className="faq-page">
      {/* Header Component */}
      <Header key="header" breadcrumbs={headerBreadcrumbs} />

      {/* Main content wrapper */}
      <div
        key="main-wrapper"
        className="faq-with-sidebar"
        style={{
          maxWidth: "1314px",
          margin: "0 auto",
          padding: "0 1rem",
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* Main content column */}
        <div
          key="main-content"
          className="faq-main-content"
          style={{
            flex: "1",
            minWidth: "0", // Allows content to shrink
          }}
        >
          {/* FAQ Header */}
          <div key="faq-header" className="article-header">
            <div className="article-container">
              <h1 key="title" className="article-title">
                {title || "FAQ"}
              </h1>
            </div>
          </div>

          {/* FAQ Content */}
          <article key="content" className="article-content-section">
            <div className="article-content" style={{ fontSize: "19px" }}>
              {body && <RichTextRenderer document={body} />}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;