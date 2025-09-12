import React from "react";
import RichTextRenderer from "../components/RichTextRenderer.jsx";
import Header from "../components/Header.jsx";
import ProductSidebar from "../components/ProductSidebar.jsx";

const ArticlePage = ({ data }) => {
  const { title, body, featuredImage, imageAlt, publishedAt } = data || {};

  // Create breadcrumbs for article page
  const headerBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Garden Guide", href: "/garden-guide" },
    { name: title || "Article" },
  ];

  return (
    <div className="article-page">
      {/* Header Component */}
      <Header key="header" breadcrumbs={headerBreadcrumbs} />
      
      {/* Main content wrapper with sidebar */}
      <div
        key="main-wrapper"
        className="article-with-sidebar"
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
          className="article-main-content"
          style={{
            flex: "1",
            minWidth: "0", // Allows content to shrink
          }}
        >
          {/* Article Header */}
          <div key="article-header" className="article-header">
            <div className="article-container">
              <h1 key="title" className="article-title">
                {title || "Article Title"}
              </h1>
              {publishedAt && (
                <time key="date" className="article-date">
                  Published {new Date(publishedAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </time>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {featuredImage && (
            <div key="featured-image" className="article-image-section">
              <div className="article-image-container">
                <img
                  src={
                    featuredImage.fields?.file?.url?.startsWith("//")
                      ? `https:${featuredImage.fields.file.url}`
                      : featuredImage.fields?.file?.url
                  }
                  alt={imageAlt || title}
                  className="article-featured-image"
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <article key="content" className="article-content-section">
            <div className="article-content">
              {body && <RichTextRenderer document={body} />}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
