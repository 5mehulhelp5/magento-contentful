import React from "react";

const ArticleCard = ({ article, linkBase = "/preview/article" }) => {
  const {
    sys,
    fields: { title, featuredImage, imageAlt, listImage, listImageAlt } = {},
  } = article || {};

  // Use list image if available, fallback to featured image
  const cardImage = listImage || featuredImage;
  const cardImageAlt = listImageAlt || imageAlt || title;

  // Check if the article is a Growing Guide article.
  // I'm adding this because growing guide images need a specific position attribute.
  const isGrowingGuide = ["Learn About", "Growing Guide"].some((substring) =>
    title.includes(substring)
  );

  // Create article URL
  const articleUrl = `${linkBase}/${sys?.id}`;

  // Truncate text for card display
  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return React.createElement(
    "a",
    {
      href: articleUrl,
      className: "article-card",
    },
    [
      // Image section
      React.createElement(
        "div",
        {
          key: "image",
          className: isGrowingGuide
            ? "article-card-image growing-guide-image"
            : "article-card-image",
        },
        cardImage
          ? React.createElement("img", {
              src: cardImage.fields?.file?.url?.startsWith("//")
                ? `https:${cardImage.fields.file.url}`
                : cardImage.fields?.file?.url,
              alt: cardImageAlt || title,
            })
          : React.createElement(
              "div",
              {
                className: "article-card-placeholder",
              },
              React.createElement(
                "svg",
                {
                  fill: "currentColor",
                  viewBox: "0 0 20 20",
                },
                React.createElement("path", {
                  fillRule: "evenodd",
                  d: "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z",
                  clipRule: "evenodd",
                })
              )
            )
      ),

      // Content section
      React.createElement(
        "div",
        {
          key: "content",
          className: "article-card-content",
        },
        [
          // Title
          React.createElement(
            "h3",
            {
              key: "title",
              className: "article-card-title",
            },
            title || "Untitled Article"
          ),
        ]
      ),
    ]
  );
};

export default ArticleCard;
