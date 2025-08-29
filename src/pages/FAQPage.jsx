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

  return React.createElement(
    "div",
    { className: "faq-page" },
    
    // FAQ Header
    React.createElement(
      "div",
      { className: "faq-header" },
      React.createElement(
        "div",
        { className: "faq-container" },
        React.createElement(
          "div",
          { className: "faq-breadcrumb" },
          React.createElement(
            "a",
            { href: "/help", className: "breadcrumb-link" },
            "Help Center"
          ),
          React.createElement("span", { className: "breadcrumb-separator" }, " > "),
          freshdeskCategoryName &&
            React.createElement(
              "span",
              { className: "breadcrumb-category" },
              freshdeskCategoryName
            )
        ),
        React.createElement("h1", { className: "faq-question" }, title),
        formattedDate &&
          React.createElement(
            "time",
            { className: "faq-date" },
            `Published ${formattedDate}`
          )
      )
    ),

    // FAQ Answer Section
    React.createElement(
      "article",
      { className: "faq-content-section" },
      React.createElement(
        "div",
        { className: "faq-content" },
        React.createElement(
          "div",
          { className: "faq-answer" },
          body && React.createElement(RichTextRenderer, { document: body })
        )
      )
    ),

    // FAQ Metadata Section
    React.createElement(
      "div",
      { className: "faq-meta" },
      React.createElement(
        "div",
        { className: "faq-container" },
        
        // Engagement Stats
        (freshdeskHits || freshdeskThumbsUp || freshdeskThumbsDown) &&
          React.createElement(
            "div",
            { className: "faq-stats" },
            React.createElement("h3", null, "Was this helpful?"),
            React.createElement(
              "div",
              { className: "faq-stats-row" },
              freshdeskHits &&
                React.createElement(
                  "span",
                  { className: "stat-item" },
                  `${freshdeskHits} views`
                ),
              freshdeskThumbsUp &&
                React.createElement(
                  "span",
                  { className: "stat-item positive" },
                  `👍 ${freshdeskThumbsUp}`
                ),
              freshdeskThumbsDown &&
                React.createElement(
                  "span",
                  { className: "stat-item negative" },
                  `👎 ${freshdeskThumbsDown}`
                )
            )
          ),

        // Tags
        tags.length > 0 &&
          React.createElement(
            "div",
            { className: "faq-tags" },
            React.createElement("h4", null, "Related Topics:"),
            React.createElement(
              "div",
              { className: "tags-list" },
              tags.map((tag, index) =>
                React.createElement(
                  "span",
                  { key: index, className: "faq-tag" },
                  tag
                )
              )
            )
          )
      )
    )
  );
}

module.exports = { default: FAQPage };