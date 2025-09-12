const React = require("react");
const RichTextRenderer = require("../components/RichTextRenderer").default;

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
    tags = [],
    publishedAt,
    freshdeskHits,
    freshdeskThumbsUp,
    freshdeskThumbsDown,
  } = data;

  // Format publish date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formattedDate = formatDate(publishedAt);

  return (
    <div className="faq-page">
      {/* FAQ Header */}
      <div className="faq-header">
        <div className="faq-container">
          <div className="faq-breadcrumb">
            <a href="/help" className="breadcrumb-link">
              Help Center
            </a>
            <span className="breadcrumb-separator"> &gt; </span>
            {freshdeskCategoryName && (
              <span className="breadcrumb-category">
                {freshdeskCategoryName}
              </span>
            )}
          </div>
          <h1 className="faq-question">{title}</h1>
          {formattedDate && (
            <time className="faq-date">
              Published {formattedDate}
            </time>
          )}
        </div>
      </div>

      {/* FAQ Answer Section */}
      <article className="faq-content-section">
        <div className="faq-content">
          <div className="faq-answer">
            {body && <RichTextRenderer document={body} />}
          </div>
        </div>
      </article>

      {/* FAQ Metadata Section */}
      <div className="faq-meta">
        <div className="faq-container">
          {/* Engagement Stats */}
          {(freshdeskHits || freshdeskThumbsUp || freshdeskThumbsDown) && (
            <div className="faq-stats">
              <h3>Was this helpful?</h3>
              <div className="faq-stats-row">
                {freshdeskHits && (
                  <span className="stat-item">
                    {freshdeskHits} views
                  </span>
                )}
                {freshdeskThumbsUp && (
                  <span className="stat-item positive">
                    👍 {freshdeskThumbsUp}
                  </span>
                )}
                {freshdeskThumbsDown && (
                  <span className="stat-item negative">
                    👎 {freshdeskThumbsDown}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="faq-tags">
              <h4>Related Topics:</h4>
              <div className="tags-list">
                {tags.map((tag, index) => (
                  <span key={index} className="faq-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

module.exports = { default: FAQPage };